use crate::contracts::{
    DiffMode, DriverInputs, EnvironmentInputs, FourWdMode, MetricValue, ParameterOverrides,
    PowertrainSnapshot, SimulationInput, SimulationOutput, SimulationWarning, VehicleConfiguration,
};
use crate::topology::{apply_overrides, get_canonical_configuration};
use crate::units::{rad_s_to_rpm, rpm_to_rad_s, RadPerSec};
use crate::{MODEL_FIDELITY_TAG, SCHEMA_VERSION, ENGINE_VERSION, SIMULATED_DISCLAIMER};
use std::collections::BTreeMap;

pub const ICE_GEAR_RATIOS: [f64; 6] = [3.62, 2.04, 1.38, 1.03, 0.82, 0.69];
pub const ICE_GEAR_EFFICIENCIES: [f64; 6] = [0.95, 0.955, 0.96, 0.965, 0.955, 0.95];
pub const ICE_REVERSE_RATIO: f64 = -3.45;
pub const ICE_REVERSE_EFFICIENCY: f64 = 0.93;

pub const ICE_IDLE_RPM: f64 = 800.0;
pub const ICE_REDLINE_RPM: f64 = 6800.0;

const ICE_WOT_POINTS: [(f64, f64); 8] = [
    (800.0, 135.0),
    (1500.0, 158.0),
    (2500.0, 182.0),
    (3500.0, 198.0),
    (4400.0, 205.0),
    (5500.0, 194.0),
    (6400.0, 176.0),
    (6800.0, 162.0),
];

pub fn ice_displacement_m3(bore_m: f64, stroke_m: f64, cylinders: u32) -> f64 {
    (std::f64::consts::PI / 4.0) * bore_m * bore_m * stroke_m * f64::from(cylinders)
}

pub fn ice_wot_torque_nm(rpm: f64) -> f64 {
    if !rpm.is_finite() || rpm <= 0.0 || rpm > ICE_REDLINE_RPM {
        return 0.0;
    }
    if rpm < ICE_IDLE_RPM {
        return 135.0 * (rpm / ICE_IDLE_RPM);
    }
    for window in ICE_WOT_POINTS.windows(2) {
        let (r0, t0) = window[0];
        let (r1, t1) = window[1];
        if rpm >= r0 && rpm <= r1 {
            let alpha = (rpm - r0) / (r1 - r0);
            return t0 + alpha * (t1 - t0);
        }
    }
    0.0
}

pub fn ice_friction_torque_nm(rpm: f64) -> f64 {
    if !rpm.is_finite() || rpm <= 0.0 {
        return 0.0;
    }
    15.0 + 0.0025 * rpm.min(ICE_REDLINE_RPM)
}

pub fn ice_torque_output_nm(rpm: f64, throttle: f64) -> f64 {
    if rpm <= 0.0 || rpm > ICE_REDLINE_RPM {
        return 0.0;
    }
    let u = throttle.clamp(0.0, 1.0);
    let t_wot = ice_wot_torque_nm(rpm);
    let t_fric = ice_friction_torque_nm(rpm);
    u * t_wot - (1.0 - u) * t_fric
}

pub fn ev_motor_envelope_nm(omega_rad_s: f64, t_peak: f64, p_peak: f64, omega_max: f64) -> f64 {
    let w = omega_rad_s.abs();
    if !w.is_finite() || w > omega_max {
        return 0.0;
    }
    if w < 1e-6 {
        return t_peak;
    }
    let omega_base = p_peak / t_peak.max(1e-6);
    if w <= omega_base {
        t_peak
    } else {
        (p_peak / w).min(t_peak)
    }
}

pub fn ev_motor_efficiency(omega_rad_s: f64, torque_nm: f64, t_peak: f64, omega_max: f64) -> f64 {
    let w_norm = (omega_rad_s.abs() / omega_max.max(1.0)).clamp(0.0, 1.0);
    let t_norm = (torque_nm.abs() / t_peak.max(1.0)).clamp(0.0, 1.0);
    if t_norm < 0.01 {
        return 0.80;
    }
    let speed_factor = 1.0 - 0.14 * (w_norm - 0.38).powi(2) - 0.08 * (1.0 - w_norm).powi(3);
    let load_factor = 1.0 - 0.16 * (t_norm - 0.45).powi(2) - 0.10 * (1.0 - t_norm).powi(3);
    (0.955 * speed_factor * load_factor).clamp(0.78, 0.96)
}

pub fn gearbox_ratio_and_eff(
    cfg: &VehicleConfiguration,
    gear_index: i32,
    overrides: Option<&ParameterOverrides>,
) -> (f64, f64) {
    if cfg.powertrain_type == "ev" {
        let base_ratio = 8.65;
        let ratio = match gear_index {
            0 => 0.0,
            -1 => -overrides.and_then(|o| o.gear_ratio_override).unwrap_or(base_ratio),
            _ => overrides.and_then(|o| o.gear_ratio_override).unwrap_or(base_ratio),
        };
        return (ratio, 0.965);
    }

    let (ratio, eff) = match gear_index {
        -1 => (ICE_REVERSE_RATIO, ICE_REVERSE_EFFICIENCY),
        0 => (0.0, 1.0),
        1..=6 => {
            let idx = (gear_index - 1) as usize;
            (ICE_GEAR_RATIOS[idx], ICE_GEAR_EFFICIENCIES[idx])
        }
        _ => (0.0, 1.0),
    };
    let final_ratio = if gear_index == 0 {
        0.0
    } else if let Some(ov) = overrides.and_then(|o| o.gear_ratio_override) {
        if gear_index < 0 { -ov.abs() } else { ov.abs() }
    } else {
        ratio
    };
    (final_ratio, eff)
}

pub fn split_axle_torque(
    axle_avail_nm: f64,
    cap_left_nm: f64,
    cap_right_nm: f64,
    diff_mode: DiffMode,
    tbr: f64,
    preload_nm: f64,
) -> ([f64; 2], bool) {
    if axle_avail_nm.abs() < 1e-12 {
        return ([0.0, 0.0], false);
    }
    let sign = axle_avail_nm.signum();
    let mag = axle_avail_nm.abs();
    let cl = cap_left_nm.max(0.0);
    let cr = cap_right_nm.max(0.0);
    let (low_cap, high_cap, left_is_low) = if cl <= cr {
        (cl, cr, true)
    } else {
        (cr, cl, false)
    };

    let (t_low, t_high, saturated) = match diff_mode {
        DiffMode::Open | DiffMode::CenterDiff | DiffMode::EvElectronic => {
            let side = (0.5 * mag).min(low_cap);
            let sat = 0.5 * mag > low_cap;
            (side, side, sat)
        }
        DiffMode::Lsd => {
            let t_l = (0.5 * mag).min(low_cap);
            let bias_cap = tbr * t_l + preload_nm;
            let t_h = bias_cap.min(mag - t_l).min(high_cap);
            let sat = (0.5 * mag > low_cap) || (mag - t_l > high_cap);
            (t_l, t_h, sat)
        }
        DiffMode::Locked => {
            let mut t_l = (0.5 * mag).min(low_cap);
            let mut t_h = (mag - t_l).min(high_cap);
            if t_h < mag - t_l && t_l < low_cap {
                t_l = (mag - t_h).min(low_cap);
            }
            if t_l + t_h > mag {
                t_h = (mag - t_l).max(0.0);
            }
            let sat = t_l + t_h < mag - 1e-6;
            (t_l, t_h, sat)
        }
    };

    let (tl, tr) = if left_is_low {
        (sign * t_low, sign * t_high)
    } else {
        (sign * t_high, sign * t_low)
    };
    ([tl, tr], saturated)
}

pub fn solve_battery_current(v_oc: f64, r_int: f64, p_bus_w: f64) -> (f64, f64) {
    if v_oc <= 1.0 {
        return (0.0, 0.0);
    }
    if r_int <= 1e-6 {
        return (v_oc, p_bus_w / v_oc);
    }
    let max_power = (v_oc * v_oc) / (4.0 * r_int);
    let p_clamped = p_bus_w.clamp(-max_power * 0.95, max_power * 0.999);
    let disc = (v_oc * v_oc - 4.0 * r_int * p_clamped).max(0.0);
    let i_batt = (v_oc - disc.sqrt()) / (2.0 * r_int);
    let v_term = (v_oc - i_batt * r_int).max(0.0);
    (v_term, i_batt)
}

pub fn evaluate_powertrain_state(
    cfg: &VehicleConfiguration,
    driver: &DriverInputs,
    env: &EnvironmentInputs,
    overrides: Option<&ParameterOverrides>,
    wheel_loads_n: [f64; 4],
    soc: f64,
    vehicle_speed_mps: Option<f64>,
) -> (PowertrainSnapshot, Vec<SimulationWarning>, f64) {
    let mut warnings = Vec::new();
    let spec = apply_overrides(&cfg.specification, overrides);
    let r_eff = spec.tire_effective_radius_m;

    let caps = [
        env.wheel_mu[0] * wheel_loads_n[0] * r_eff,
        env.wheel_mu[1] * wheel_loads_n[1] * r_eff,
        env.wheel_mu[2] * wheel_loads_n[2] * r_eff,
        env.wheel_mu[3] * wheel_loads_n[3] * r_eff,
    ];

    if cfg.powertrain_type == "ice" {
        let (gear_ratio, gear_eff) = gearbox_ratio_and_eff(cfg, driver.gear_index, overrides);
        let default_final_drive = if cfg.id == "vehicle.config.ice-4wd" {
            4.10
        } else {
            3.94
        };
        let final_drive = overrides
            .and_then(|o| o.final_drive_ratio)
            .unwrap_or(default_final_drive);

        let (tc_ratio, tc_eff, front_active) = if cfg.id == "vehicle.config.ice-4wd" {
            match driver.four_wd_mode.unwrap_or(FourWdMode::TwoH) {
                FourWdMode::TwoH => (1.0, 0.97, false),
                FourWdMode::FourH => (1.0, 0.96, true),
                FourWdMode::FourL => (2.48, 0.93, true),
            }
        } else {
            (1.0, 1.0, cfg.topology.driven_axles.iter().any(|a| a == "front"))
        };

        let rear_active = cfg.topology.driven_axles.iter().any(|a| a == "rear");

        let rpm = if let Some(explicit_rpm) = driver.prime_mover_rpm {
            if explicit_rpm > ICE_REDLINE_RPM {
                warnings.push(SimulationWarning {
                    code: "WARN_RPM_CLAMPED".to_string(),
                    message: format!(
                        "Engine speed {explicit_rpm:.0} RPM exceeds redline ({ICE_REDLINE_RPM:.0} RPM); fuel cut applied."
                    ),
                });
            }
            explicit_rpm.max(0.0)
        } else if let Some(v) = vehicle_speed_mps {
            if gear_ratio.abs() < 1e-6 {
                ICE_IDLE_RPM
            } else {
                let wheel_rpm = (v.abs() / r_eff) * 60.0 / (2.0 * std::f64::consts::PI);
                let coupled_rpm = wheel_rpm * gear_ratio.abs() * tc_ratio * final_drive;
                if driver.throttle > 0.05 && v < 4.5 {
                    coupled_rpm.max(1800.0)
                } else {
                    coupled_rpm.max(ICE_IDLE_RPM)
                }
            }
        } else {
            3000.0
        };

        let omega = rpm_to_rad_s(rpm);
        let t_eng = ice_torque_output_nm(rpm, driver.throttle);
        let p_eng = t_eng * omega.0;

        if gear_ratio.abs() < 1e-6 {
            let snap = PowertrainSnapshot {
                configuration_id: cfg.id.clone(),
                prime_mover_rpm: rpm,
                prime_mover_omega_rad_s: omega.0,
                prime_mover_torque_nm: t_eng,
                prime_mover_power_w: p_eng,
                gearbox_output_torque_nm: Some(0.0),
                driveshaft_rpm: if cfg.id == "vehicle.config.ice-fwd" { None } else { Some(0.0) },
                axle_torques_nm: [0.0, 0.0],
                wheel_torques_nm: [0.0, 0.0, 0.0, 0.0],
                wheel_rpm: [0.0, 0.0, 0.0, 0.0],
                tractive_force_total_n: 0.0,
                power_losses_w: p_eng.abs(),
                overall_efficiency: 0.0,
                battery_power_w: None,
                battery_current_a: None,
            };
            return (snap, warnings, 0.0);
        }

        // Compute non-double-counted mechanical efficiency
        let eff_override = overrides.and_then(|o| o.aggregate_efficiency_override);
        let (eff_trans_stage, eff_downstream_stage) = if let Some(agg) = eff_override {
            (agg, 1.0)
        } else {
            let downstream = match cfg.id.as_str() {
                "vehicle.config.ice-fwd" => 0.96 * 0.99,
                "vehicle.config.ice-rwd" => 0.97 * 0.955 * 0.99,
                "vehicle.config.ice-awd" => 0.96 * 0.97 * 0.955 * 0.99,
                "vehicle.config.ice-4wd" => tc_eff * 0.97 * 0.955 * 0.99,
                _ => 0.95,
            };
            (gear_eff, downstream)
        };

        let t_gearbox_out = t_eng * gear_ratio * eff_trans_stage;
        let rpm_gearbox_out = rpm / (gear_ratio.abs() * tc_ratio);
        let driveshaft_rpm = if cfg.id == "vehicle.config.ice-fwd" {
            None
        } else {
            Some(rpm_gearbox_out)
        };

        let t_total_wheels_avail = t_gearbox_out * tc_ratio * final_drive * eff_downstream_stage;
        let wheel_rpm_val = rpm / (gear_ratio.abs() * tc_ratio * final_drive);

        let (axle_front_avail, axle_rear_avail) = if front_active && rear_active {
            if cfg.id == "vehicle.config.ice-awd" {
                let split_f = driver.ev_front_split.unwrap_or(0.5);
                if driver.diff_mode == DiffMode::Open {
                    // Open center diff caps total at 2 * min axle capability weighted by split
                    let f_cap_sum = caps[0] + caps[1];
                    let r_cap_sum = caps[2] + caps[3];
                    let min_axle = f_cap_sum.min(r_cap_sum);
                    let total_cap = 2.0 * min_axle;
                    let capped_total = t_total_wheels_avail.abs().min(total_cap) * t_total_wheels_avail.signum();
                    (capped_total * split_f, capped_total * (1.0 - split_f))
                } else {
                    (t_total_wheels_avail * split_f, t_total_wheels_avail * (1.0 - split_f))
                }
            } else {
                // ICE-4WD 4H / 4L locked transfer case: distributes up to front & rear grip
                (t_total_wheels_avail * 0.5, t_total_wheels_avail * 0.5)
            }
        } else if front_active {
            (t_total_wheels_avail, 0.0)
        } else {
            (0.0, t_total_wheels_avail)
        };

        let axle_diff_mode = match driver.diff_mode {
            DiffMode::CenterDiff | DiffMode::EvElectronic => DiffMode::Open,
            other => other,
        };

        let (w_front, sat_f) = if front_active {
            split_axle_torque(axle_front_avail, caps[0], caps[1], axle_diff_mode, 2.5, 40.0)
        } else {
            ([0.0, 0.0], false)
        };
        let (w_rear, sat_r) = if rear_active {
            split_axle_torque(axle_rear_avail, caps[2], caps[3], axle_diff_mode, 2.5, 40.0)
        } else {
            ([0.0, 0.0], false)
        };

        if sat_f || sat_r {
            warnings.push(SimulationWarning {
                code: "WARN_TRACTION_SATURATED".to_string(),
                message: "Driven wheel torque exceeded tire-road friction cap (mu * Fz).".to_string(),
            });
        }

        if cfg.id == "vehicle.config.ice-4wd"
            && front_active
            && driver.steering_angle_rad.abs() > 0.08
            && env.wheel_mu.iter().any(|&m| m >= 0.75)
        {
            warnings.push(SimulationWarning {
                code: "WARN_4WD_WINDUP_RISK".to_string(),
                message: "Part-time 4H/4L engaged while cornering on high-grip pavement; driveline wind-up risk.".to_string(),
            });
        }

        let wheel_torques = [w_front[0], w_front[1], w_rear[0], w_rear[1]];
        let axle_torques = [w_front[0] + w_front[1], w_rear[0] + w_rear[1]];
        let total_wheel_torque = axle_torques[0] + axle_torques[1];
        let tractive_force = total_wheel_torque / r_eff;

        let wheel_omega = rpm_to_rad_s(wheel_rpm_val).0 * gear_ratio.signum();
        let p_wheels = total_wheel_torque * wheel_omega;
        let eta_total = if eff_override.is_some() {
            eff_trans_stage
        } else {
            eff_trans_stage * eff_downstream_stage
        };
        let p_loss = (p_eng - p_wheels).max(0.0);

        let snap = PowertrainSnapshot {
            configuration_id: cfg.id.clone(),
            prime_mover_rpm: rpm,
            prime_mover_omega_rad_s: omega.0,
            prime_mover_torque_nm: t_eng,
            prime_mover_power_w: p_eng,
            gearbox_output_torque_nm: Some(t_gearbox_out),
            driveshaft_rpm,
            axle_torques_nm: axle_torques,
            wheel_torques_nm: wheel_torques,
            wheel_rpm: [
                if front_active { wheel_rpm_val } else { 0.0 },
                if front_active { wheel_rpm_val } else { 0.0 },
                if rear_active { wheel_rpm_val } else { 0.0 },
                if rear_active { wheel_rpm_val } else { 0.0 },
            ],
            tractive_force_total_n: tractive_force,
            power_losses_w: p_loss,
            overall_efficiency: if p_eng.abs() > 1e-3 { eta_total } else { 0.0 },
            battery_power_w: None,
            battery_current_a: None,
        };
        return (snap, warnings, 0.0);
    }

    // EV Configurations (EV-FWD, EV-RWD, EV-DUAL-AWD)
    let is_dual = cfg.id == "vehicle.config.ev-dual-awd";
    let is_front = cfg.topology.driven_axles.iter().any(|a| a == "front");
    let is_rear = cfg.topology.driven_axles.iter().any(|a| a == "rear");

    let g_red_f = overrides.and_then(|o| o.final_drive_ratio).unwrap_or(if is_dual { 8.90 } else { 8.65 });
    let g_red_r = overrides.and_then(|o| o.final_drive_ratio).unwrap_or(8.65);

    let omega_max = rpm_to_rad_s(14000.0).0;
    let rpm_motor = if let Some(explicit_rpm) = driver.prime_mover_rpm {
        if explicit_rpm > 14000.0 {
            warnings.push(SimulationWarning {
                code: "WARN_RPM_CLAMPED".to_string(),
                message: format!("EV motor speed {explicit_rpm:.0} RPM clamped to 14000 RPM limit."),
            });
        }
        explicit_rpm.clamp(0.0, 14000.0)
    } else if let Some(v) = vehicle_speed_mps {
        let wheel_rpm = (v.abs() / r_eff) * 60.0 / (2.0 * std::f64::consts::PI);
        (wheel_rpm * g_red_r).min(14000.0)
    } else {
        3000.0
    };

    let omega_m = rpm_to_rad_s(rpm_motor).0;
    let v_nom = overrides
        .and_then(|o| o.battery_voltage_v)
        .or(cfg.powertrain.nominal_voltage_v)
        .unwrap_or(400.0);
    let r_int = cfg.powertrain.internal_resistance_ohm.unwrap_or(0.065);
    let v_oc = v_nom * (0.875 + 0.175 * soc.clamp(0.0, 1.0));
    let eta_inv = cfg.powertrain.inverter_efficiency.unwrap_or(0.96);
    let eff_override = overrides.and_then(|o| o.aggregate_efficiency_override);
    let eta_mech = eff_override.unwrap_or(0.95 * 0.99);

    let depleted = soc <= 0.02 && driver.throttle > 0.0 && driver.brake_demand <= 0.01;
    if depleted {
        warnings.push(SimulationWarning {
            code: "WARN_BATTERY_DEPLETED".to_string(),
            message: "Battery SOC reached minimum reserve (2%); propulsion power cut to 0 W.".to_string(),
        });
    }

    let gear_sign = match driver.gear_index {
        0 => 0.0,
        -1 => -1.0,
        _ => 1.0,
    };

    let (t_m_f, t_m_r, p_mech_total, eta_motor_eff) = if gear_sign == 0.0 || depleted {
        (0.0, 0.0, 0.0, 0.94)
    } else if driver.brake_demand > 0.01 && driver.throttle < 0.05 {
        // Regenerative braking torque request
        let regen_scale = if soc > 0.95 { ((1.0 - soc) / 0.05).clamp(0.0, 1.0) } else { 1.0 };
        let req = -driver.brake_demand * regen_scale;
        let t_f_env = if is_front {
            ev_motor_envelope_nm(omega_m, if is_dual { 200.0 } else { 310.0 }, if is_dual { 110_000.0 } else { 150_000.0 }, omega_max)
        } else { 0.0 };
        let t_r_env = if is_rear {
            ev_motor_envelope_nm(omega_m, 310.0, 150_000.0, omega_max)
        } else { 0.0 };
        let tf = req * t_f_env * 0.6;
        let tr = req * t_r_env * 0.6;
        let pm = (tf + tr) * omega_m;
        (tf, tr, pm, 0.92)
    } else {
        let u = driver.throttle.clamp(0.0, 1.0);
        if is_dual {
            let split_f = driver.ev_front_split.unwrap_or(0.40).clamp(0.0, 1.0);
            let env_f = ev_motor_envelope_nm(omega_m, 200.0, 110_000.0, omega_max);
            let env_r = ev_motor_envelope_nm(omega_m, 310.0, 150_000.0, omega_max);
            let combined_max = env_f + env_r;
            let total_req = u * combined_max;
            let mut tf = (total_req * split_f).min(env_f);
            let mut tr = (total_req * (1.0 - split_f)).min(env_r);
            // Cap at BMS 240 kW battery ceiling
            let mut p_m = (tf + tr) * omega_m;
            let eta_avg = ev_motor_efficiency(omega_m, tr.max(tf), 310.0, omega_max);
            let p_elec_max = 240_000.0 * eta_avg * eta_inv;
            if p_m > p_elec_max && p_m > 1.0 {
                let s = p_elec_max / p_m;
                tf *= s;
                tr *= s;
                p_m *= s;
            }
            (tf * gear_sign, tr * gear_sign, p_m * gear_sign, eta_avg)
        } else {
            let env = ev_motor_envelope_nm(omega_m, 310.0, 150_000.0, omega_max);
            let t = u * env;
            let eta_m = ev_motor_efficiency(omega_m, t, 310.0, omega_max);
            let tf = if is_front { t * gear_sign } else { 0.0 };
            let tr = if is_rear { t * gear_sign } else { 0.0 };
            (tf, tr, t * omega_m * gear_sign, eta_m)
        }
    };

    let axle_f_avail = t_m_f * g_red_f * eta_mech;
    let axle_r_avail = t_m_r * g_red_r * eta_mech;
    let diff_mode = match driver.diff_mode {
        DiffMode::EvElectronic | DiffMode::CenterDiff => DiffMode::Open,
        other => other,
    };

    let (w_front, sat_f) = if is_front {
        split_axle_torque(axle_f_avail, caps[0], caps[1], diff_mode, 2.5, 40.0)
    } else {
        ([0.0, 0.0], false)
    };
    let (w_rear, sat_r) = if is_rear {
        split_axle_torque(axle_r_avail, caps[2], caps[3], diff_mode, 2.5, 40.0)
    } else {
        ([0.0, 0.0], false)
    };

    if sat_f || sat_r {
        warnings.push(SimulationWarning {
            code: "WARN_TRACTION_SATURATED".to_string(),
            message: "EV e-axle torque exceeded tire-road friction limit (mu * Fz).".to_string(),
        });
    }

    let wheel_torques = [w_front[0], w_front[1], w_rear[0], w_rear[1]];
    let axle_torques = [w_front[0] + w_front[1], w_rear[0] + w_rear[1]];
    let tractive_force = (axle_torques[0] + axle_torques[1]) / r_eff;

    let p_dc_bus = if p_mech_total >= 0.0 {
        p_mech_total / (eta_motor_eff * eta_inv)
    } else {
        p_mech_total * eta_motor_eff * eta_inv
    };
    let (v_term, i_batt) = solve_battery_current(v_oc, r_int, p_dc_bus);
    let p_batt_internal = v_oc * i_batt;

    let w_rpm_f = if is_front { rpm_motor / g_red_f } else { 0.0 };
    let w_rpm_r = if is_rear { rpm_motor / g_red_r } else { 0.0 };
    let p_wheels = w_front.iter().sum::<f64>() * (omega_m / g_red_f)
        + w_rear.iter().sum::<f64>() * (omega_m / g_red_r);
    let p_loss = (p_dc_bus.abs() - p_wheels.abs()).max(0.0);
    let eta_total = if p_dc_bus > 1.0 {
        (p_wheels.abs() / p_dc_bus).clamp(0.0, 1.0)
    } else {
        eta_motor_eff * eta_inv * eta_mech
    };

    let snap = PowertrainSnapshot {
        configuration_id: cfg.id.clone(),
        prime_mover_rpm: rpm_motor,
        prime_mover_omega_rad_s: omega_m,
        prime_mover_torque_nm: t_m_f + t_m_r,
        prime_mover_power_w: p_mech_total,
        gearbox_output_torque_nm: None,
        driveshaft_rpm: None,
        axle_torques_nm: axle_torques,
        wheel_torques_nm: wheel_torques,
        wheel_rpm: [w_rpm_f, w_rpm_f, w_rpm_r, w_rpm_r],
        tractive_force_total_n: tractive_force,
        power_losses_w: p_loss,
        overall_efficiency: eta_total,
        battery_power_w: Some(v_term * i_batt),
        battery_current_a: Some(i_batt),
    };

    (snap, warnings, p_batt_internal)
}

pub fn evaluate_single_point(input: &SimulationInput) -> Result<SimulationOutput, crate::contracts::ErrorEnvelope> {
    let cfg_id = &input.configuration_ids[0];
    let cfg = get_canonical_configuration(cfg_id).ok_or_else(|| {
        crate::make_error_envelope(
            "ERR_TOPO_UNSUPPORTED_CONFIG",
            "VALIDATION",
            format!("Unsupported configuration '{cfg_id}'."),
            Some("configurationIds"),
            true,
        )
    })?;

    let spec = apply_overrides(&cfg.specification, input.parameter_overrides.as_ref());
    let g = input.environment.gravity_mps2;
    let total_w = spec.mass_kg * g;
    let fz_f = total_w * (spec.cg_to_rear_axle_m / spec.wheelbase_m);
    let fz_r = total_w * (spec.cg_to_front_axle_m / spec.wheelbase_m);
    let static_loads = [0.5 * fz_f, 0.5 * fz_f, 0.5 * fz_r, 0.5 * fz_r];

    let (snap, warnings, _) = evaluate_powertrain_state(
        &cfg,
        &input.driver_inputs,
        &input.environment,
        input.parameter_overrides.as_ref(),
        static_loads,
        input.solver_config.initial_soc,
        None,
    );

    let mut summary = BTreeMap::new();
    summary.insert(
        "primeMoverTorqueNm".to_string(),
        MetricValue { value: snap.prime_mover_torque_nm, unit: "N*m".to_string() },
    );
    summary.insert(
        "primeMoverPowerW".to_string(),
        MetricValue { value: snap.prime_mover_power_w, unit: "W".to_string() },
    );
    summary.insert(
        "tractiveForceTotalN".to_string(),
        MetricValue { value: snap.tractive_force_total_n, unit: "N".to_string() },
    );
    summary.insert(
        "overallEfficiency".to_string(),
        MetricValue { value: snap.overall_efficiency, unit: "ratio".to_string() },
    );
    summary.insert(
        "engineDisplacementM3".to_string(),
        MetricValue { value: ice_displacement_m3(0.086, 0.086, 4), unit: "m^3".to_string() },
    );

    let _ = rad_s_to_rpm(RadPerSec(snap.prime_mover_omega_rad_s));

    Ok(SimulationOutput {
        schema_version: SCHEMA_VERSION.to_string(),
        engine_version: ENGINE_VERSION.to_string(),
        model_fidelity_tag: MODEL_FIDELITY_TAG.to_string(),
        status: "OK".to_string(),
        simulated_estimate_disclaimer: SIMULATED_DISCLAIMER.to_string(),
        summary_metrics: summary,
        powertrain_snapshot: Some(snap),
        time_series: None,
        comparison_entries: None,
        comparison_diffs: None,
        warnings,
    })
}
