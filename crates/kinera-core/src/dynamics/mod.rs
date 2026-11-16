use crate::contracts::{
    MetricValue, SimulationInput, SimulationOutput, SimulationWarning, TimeSeriesFrame,
    VehicleConfiguration, VehicleSpecification,
};
use crate::integrator::{rk4_step, rk4_step_vec};
use crate::powertrain::evaluate_powertrain_state;
use crate::topology::{apply_overrides, get_canonical_configuration};
use crate::{ENGINE_VERSION, MODEL_FIDELITY_TAG, SCHEMA_VERSION, SIMULATED_DISCLAIMER};
use std::collections::BTreeMap;

pub fn aero_drag_n(rho: f64, cd: f64, area_m2: f64, v_mps: f64) -> f64 {
    0.5 * rho * cd * area_m2 * v_mps * v_mps.abs()
}

pub fn rolling_resistance_n(crr: f64, mass_kg: f64, g: f64, grade_rad: f64, v_mps: f64) -> f64 {
    if v_mps.abs() < 1e-6 {
        0.0
    } else {
        v_mps.signum() * crr * mass_kg * g * grade_rad.cos()
    }
}

pub fn grade_resistance_n(mass_kg: f64, g: f64, grade_rad: f64) -> f64 {
    mass_kg * g * grade_rad.sin()
}

pub fn compute_wheel_normal_loads(
    spec: &VehicleSpecification,
    g: f64,
    grade_rad: f64,
    ax: f64,
    ay: f64,
) -> ([f64; 4], bool) {
    let m = spec.mass_kg;
    let l = spec.wheelbase_m.max(0.5);
    let a = spec.cg_to_front_axle_m;
    let b = spec.cg_to_rear_axle_m;
    let h = spec.cg_height_m;
    let t = spec.track_width_m.max(0.5);

    let total_normal = (m * g * grade_rad.cos()).max(0.0);
    let fz_f0 = m * g * (b * grade_rad.cos() - h * grade_rad.sin()) / l;
    let fz_r0 = m * g * (a * grade_rad.cos() + h * grade_rad.sin()) / l;

    let dfz_long = (m * ax * h) / l;
    let fz_f = fz_f0 - dfz_long;
    let fz_r = fz_r0 + dfz_long;

    // Total lateral load shifted from inner pair to outer pair: dFz_lat = m * ay * h / t
    // Split evenly across front and rear axles (+/- 0.5 * dFz_lat per wheel).
    let dfz_lat = (m * ay * h) / t;
    let mut loads = [
        0.5 * fz_f - 0.5 * dfz_lat,
        0.5 * fz_f + 0.5 * dfz_lat,
        0.5 * fz_r - 0.5 * dfz_lat,
        0.5 * fz_r + 0.5 * dfz_lat,
    ];

    let mut lifted = false;
    let mut neg_sum = 0.0;
    let mut pos_count = 0usize;
    for load in &mut loads {
        if *load < 0.0 {
            lifted = true;
            neg_sum += -*load;
            *load = 0.0;
        } else if *load > 0.0 {
            pos_count += 1;
        }
    }
    if lifted && pos_count > 0 {
        let mut remaining_sum: f64 = loads.iter().sum();
        if remaining_sum > 1e-9 {
            let scale = total_normal / remaining_sum;
            for load in &mut loads {
                *load *= scale;
            }
        } else {
            let _ = neg_sum;
            remaining_sum = total_normal * 0.25;
            loads = [remaining_sum; 4];
        }
    }

    (loads, lifted)
}

pub fn understeer_gradient_rad_per_mps2(spec: &VehicleSpecification) -> f64 {
    let l = spec.wheelbase_m.max(0.5);
    (spec.mass_kg * spec.cg_to_rear_axle_m) / (l * spec.front_axle_cornering_stiffness_n_per_rad)
        - (spec.mass_kg * spec.cg_to_front_axle_m)
            / (l * spec.rear_axle_cornering_stiffness_n_per_rad)
}

pub fn steady_state_yaw_rate(spec: &VehicleSpecification, vx: f64, steer_rad: f64) -> f64 {
    let kus = understeer_gradient_rad_per_mps2(spec);
    let denom = spec.wheelbase_m + kus * vx * vx;
    if denom.abs() < 1e-6 {
        0.0
    } else {
        (vx * steer_rad) / denom
    }
}

pub fn friction_circle_utilization(fx: f64, fy: f64, mu: f64, fz: f64) -> (f64, f64, bool) {
    let f_max = (mu * fz).max(0.0);
    if f_max < 1e-9 {
        return (0.0, 0.0, fx.abs() > 1e-3 || fy.abs() > 1e-3);
    }
    let util = ((fx / f_max).powi(2) + (fy / f_max).powi(2)).sqrt();
    if util <= 1.0 {
        (fx, util, false)
    } else {
        let fx_clamped = (f_max * f_max - fy * fy).max(0.0).sqrt() * fx.signum();
        (fx_clamped, 1.0, true)
    }
}

pub fn simulate_config_time_series(
    cfg: &VehicleConfiguration,
    input: &SimulationInput,
) -> (Vec<TimeSeriesFrame>, Vec<SimulationWarning>, BTreeMap<String, MetricValue>) {
    let spec = apply_overrides(&cfg.specification, input.parameter_overrides.as_ref());
    let g = input.environment.gravity_mps2;
    let rho = input.environment.air_density_kg_m3;
    let grade = input.environment.road_grade_rad;
    let dt = input.solver_config.dt_sec;
    let steps = ((input.solver_config.duration_sec / dt).round() as usize).clamp(1, 30_000);
    let front_bias = input
        .parameter_overrides
        .as_ref()
        .and_then(|o| o.front_brake_bias)
        .unwrap_or(0.70);

    let mut vx = input.solver_config.initial_speed_mps.max(0.0);
    let mut dist = 0.0;
    let mut vy = 0.0;
    let mut yaw_rate = 0.0;
    let mut psi = 0.0;
    let mut world_x = 0.0;
    let mut world_y = 0.0;
    let mut soc = input.solver_config.initial_soc.clamp(0.0, 1.0);
    let mut ax = 0.0;
    let mut ay = 0.0;

    let mut frames = Vec::with_capacity(steps + 1);
    let mut warnings_map: BTreeMap<String, String> = BTreeMap::new();

    let kus = understeer_gradient_rad_per_mps2(&spec);
    let v_crit = if kus < -1e-9 {
        Some((-spec.wheelbase_m / kus).sqrt())
    } else {
        None
    };

    let steer = input.driver_inputs.steering_angle_rad;
    let max_brake_force = spec.mass_kg * g * 1.15;
    let auto_upshift = cfg.powertrain_type == "ice"
        && input.mode == crate::contracts::SimulationMode::MultiConfigComparison
        && input.driver_inputs.gear_index == 1;
    let mut active_gear = input.driver_inputs.gear_index;
    let mut shift_timer = 0.0;

    for step in 0..=steps {
        let t = (step as f64) * dt;
        let (loads, lifted) = compute_wheel_normal_loads(&spec, g, grade, ax, ay);
        if lifted {
            warnings_map.insert(
                "WARN_WHEEL_LIFT".to_string(),
                "Extreme load transfer drove inner wheel normal load to 0 N.".to_string(),
            );
        }

        if auto_upshift && shift_timer <= 0.0 && (1..6).contains(&active_gear) {
            let wheel_rpm = (vx / spec.tire_effective_radius_m) * 60.0 / (2.0 * std::f64::consts::PI);
            let fd = if cfg.id == "vehicle.config.ice-4wd" { 4.10 } else { 3.94 };
            let tc = if cfg.id == "vehicle.config.ice-4wd"
                && input.driver_inputs.four_wd_mode == Some(crate::contracts::FourWdMode::FourL)
            { 2.48 } else { 1.0 };
            let ratio = crate::powertrain::ICE_GEAR_RATIOS[(active_gear - 1) as usize];
            if wheel_rpm * ratio * tc * fd >= 6450.0 {
                active_gear += 1;
                shift_timer = 0.20;
            }
        }

        let mut step_driver = input.driver_inputs.clone();
        step_driver.gear_index = active_gear;
        if shift_timer > 0.0 {
            step_driver.throttle = 0.0;
            shift_timer = (shift_timer - dt).max(0.0);
        }

        // Powertrain propulsion / regen
        let (pt_snap, pt_warnings, p_batt_internal) = evaluate_powertrain_state(
            cfg,
            &step_driver,
            &input.environment,
            input.parameter_overrides.as_ref(),
            loads,
            soc,
            Some(vx),
        );
        for w in pt_warnings {
            warnings_map.entry(w.code).or_insert(w.message);
        }

        // Braking force calculation (if brakeDemand > 0)
        let f_brake_req = input.driver_inputs.brake_demand * max_brake_force;
        let f_brake_actual = if f_brake_req > 1e-3 && vx > 1e-4 {
            let mu_f = 0.5 * (input.environment.wheel_mu[0] + input.environment.wheel_mu[1]);
            let mu_r = 0.5 * (input.environment.wheel_mu[2] + input.environment.wheel_mu[3]);
            let fz_f = loads[0] + loads[1];
            let fz_r = loads[2] + loads[3];
            let req_f = front_bias * f_brake_req;
            let req_r = (1.0 - front_bias) * f_brake_req;
            let cap_f = mu_f * fz_f;
            let cap_r = mu_r * fz_r;

            let act_f = if req_f > cap_f {
                if input.solver_config.abs_conceptual_enabled {
                    warnings_map.entry("INFO_ABS_ACTIVE".to_string()).or_insert_with(|| {
                        "Conceptual ABS active: clamping front brake force near peak mu*Fz.".to_string()
                    });
                    0.95 * cap_f
                } else {
                    warnings_map.entry("WARN_WHEEL_LOCK_FRONT".to_string()).or_insert_with(|| {
                        "Front axle locked under braking (ABS off): sliding factor 0.80*mu applied.".to_string()
                    });
                    0.80 * cap_f
                }
            } else {
                req_f
            };
            let act_r = if req_r > cap_r {
                if input.solver_config.abs_conceptual_enabled {
                    0.95 * cap_r
                } else {
                    warnings_map.entry("WARN_WHEEL_LOCK_REAR".to_string()).or_insert_with(|| {
                        "Rear axle locked under braking (ABS off): oversteer spin risk.".to_string()
                    });
                    0.80 * cap_r
                }
            } else {
                req_r
            };
            -(act_f + act_r)
        } else {
            0.0
        };

        // Combined Longitudinal Force + Friction Circle check
        let f_drive = if input.driver_inputs.brake_demand > 0.01 && input.driver_inputs.throttle < 0.05 {
            f_brake_actual
        } else {
            pt_snap.tractive_force_total_n + f_brake_actual
        };

        let (alpha_f, alpha_r) = if vx >= 1.0 {
            (
                steer - (vy + spec.cg_to_front_axle_m * yaw_rate) / vx,
                -(vy - spec.cg_to_rear_axle_m * yaw_rate) / vx,
            )
        } else {
            (0.0, 0.0)
        };

        let fy_f = spec.front_axle_cornering_stiffness_n_per_rad * alpha_f;
        let fy_r = spec.rear_axle_cornering_stiffness_n_per_rad * alpha_r;
        let fy_wheel = [0.5 * fy_f, 0.5 * fy_f, 0.5 * fy_r, 0.5 * fy_r];
        let fx_wheel_req = [
            if cfg.topology.driven_axles.iter().any(|a| a == "front") || f_brake_actual < 0.0 {
                f_drive * 0.5 * (if cfg.topology.driven_axles.len() == 2 { 0.5 } else { 1.0 })
            } else { 0.0 },
            if cfg.topology.driven_axles.iter().any(|a| a == "front") || f_brake_actual < 0.0 {
                f_drive * 0.5 * (if cfg.topology.driven_axles.len() == 2 { 0.5 } else { 1.0 })
            } else { 0.0 },
            if cfg.topology.driven_axles.iter().any(|a| a == "rear") || f_brake_actual < 0.0 {
                f_drive * 0.5 * (if cfg.topology.driven_axles.len() == 2 { 0.5 } else { 1.0 })
            } else { 0.0 },
            if cfg.topology.driven_axles.iter().any(|a| a == "rear") || f_brake_actual < 0.0 {
                f_drive * 0.5 * (if cfg.topology.driven_axles.len() == 2 { 0.5 } else { 1.0 })
            } else { 0.0 },
        ];

        let mut util_arr = [0.0; 4];
        let mut fx_total = 0.0;
        for i in 0..4 {
            let (fx_c, u, sat) = friction_circle_utilization(
                fx_wheel_req[i],
                fy_wheel[i],
                input.environment.wheel_mu[i],
                loads[i],
            );
            util_arr[i] = u;
            fx_total += fx_c;
            if sat {
                warnings_map.entry("WARN_TRACTION_SATURATED".to_string()).or_insert_with(|| {
                    "Tire force reached simplified friction-circle saturation boundary.".to_string()
                });
            }
        }
        // Preserve exact powertrain drive force when not saturated and no braking
        if util_arr.iter().all(|&u| u < 0.999) && f_brake_actual.abs() < 1e-6 {
            fx_total = f_drive;
        }

        let f_drag = aero_drag_n(rho, spec.drag_coefficient, spec.frontal_area_m2, vx);
        let f_grade = grade_resistance_n(spec.mass_kg, g, grade);
        let f_roll_max = spec.rolling_resistance_coeff * spec.mass_kg * g * grade.cos();
        let f_roll = if vx.abs() > 1e-5 {
            vx.signum() * f_roll_max
        } else if (fx_total - f_grade).abs() <= f_roll_max {
            fx_total - f_grade
        } else {
            (fx_total - f_grade).signum() * f_roll_max
        };

        let f_net = fx_total - f_drag - f_roll - f_grade;
        ax = if vx <= 1e-5 && f_net < 0.0 && f_brake_actual < 0.0 {
            0.0
        } else {
            f_net / spec.mass_kg
        };

        if alpha_f.abs() > 0.1047198 || alpha_r.abs() > 0.1047198 || ay.abs() > 0.4 * g {
            warnings_map.entry("WARN_LINEAR_BICYCLE_EXCEEDED".to_string()).or_insert_with(|| {
                "Linear 2-DOF bicycle validity limit exceeded (|alpha| > 6 deg or |ay| > 0.4g).".to_string()
            });
        }
        if let Some(vc) = v_crit {
            if vx >= 0.85 * vc && steer.abs() > 1e-4 {
                warnings_map.entry("WARN_CRITICAL_SPEED_APPROACHED".to_string()).or_insert_with(|| {
                    format!("Oversteer vehicle approaching critical speed ({vc:.1} m/s).")
                });
            }
        }

        let beta = if vx.abs() > 0.5 { vy.atan2(vx) } else { 0.0 };

        frames.push(TimeSeriesFrame {
            time_sec: t,
            speed_mps: vx,
            distance_m: dist,
            accel_long_mps2: ax,
            accel_lat_mps2: ay,
            yaw_rate_rad_s: yaw_rate,
            sideslip_rad: beta,
            world_x_m: world_x,
            world_y_m: world_y,
            wheel_normal_loads_n: loads,
            tractive_force_n: fx_total,
            drag_force_n: f_drag,
            rolling_force_n: f_roll,
            grade_force_n: f_grade,
            slip_angle_front_rad: alpha_f,
            slip_angle_rear_rad: alpha_r,
            friction_utilization: util_arr,
            soc: if cfg.powertrain_type == "ev" { Some(soc) } else { None },
        });

        if step == steps {
            break;
        }

        // Advance Longitudinal (vx, dist) via RK4
        let prev_vx = vx;
        let state_long = [vx, dist];
        let next_long = rk4_step(state_long, dt, |s| {
            let v = s[0].max(0.0);
            let fd = aero_drag_n(rho, spec.drag_coefficient, spec.frontal_area_m2, v);
            let fr = if v > 1e-5 { f_roll_max } else { f_roll };
            let net = fx_total - fd - fr - f_grade;
            let a = if v <= 1e-5 && net < 0.0 { 0.0 } else { net / spec.mass_kg };
            [a, v]
        });

        if f_brake_actual < -1e-3 && prev_vx > 0.0 && next_long[0] <= 0.0 {
            vx = 0.0;
            let frac = prev_vx / (prev_vx - next_long[0]).max(1e-9);
            dist += frac * (next_long[1] - dist);
        } else {
            vx = next_long[0].max(0.0);
            dist = next_long[1];
        }

        // Advance Lateral 2-DOF Bicycle (vy, r, psi, X, Y)
        let v_for_lat = 0.5 * (prev_vx + vx);
        if v_for_lat < 1.0 {
            // Kinematic Ackermann transition
            yaw_rate = (v_for_lat / spec.wheelbase_m) * steer.tan();
            vy = 0.0;
            ay = v_for_lat * yaw_rate;
            psi += yaw_rate * dt;
            world_x += v_for_lat * psi.cos() * dt;
            world_y += v_for_lat * psi.sin() * dt;
        } else {
            let sub_steps = if v_for_lat < 5.0 && dt > 0.01 { 5 } else { 1 };
            let sub_dt = dt / (sub_steps as f64);
            let caf = spec.front_axle_cornering_stiffness_n_per_rad;
            let car = spec.rear_axle_cornering_stiffness_n_per_rad;
            let a_cg = spec.cg_to_front_axle_m;
            let b_cg = spec.cg_to_rear_axle_m;
            let iz = spec.yaw_inertia_kg_m2;
            let m = spec.mass_kg;

            let mut lat_state = vec![vy, yaw_rate, psi, world_x, world_y];
            for _ in 0..sub_steps {
                lat_state = rk4_step_vec(&lat_state, sub_dt, |s| {
                    let s_vy = s[0];
                    let s_r = s[1];
                    let s_psi = s[2];
                    let af = steer - (s_vy + a_cg * s_r) / v_for_lat;
                    let ar = -(s_vy - b_cg * s_r) / v_for_lat;
                    let fyf = caf * af;
                    let fyr = car * ar;
                    let d_vy = (fyf + fyr) / m - v_for_lat * s_r;
                    let d_r = (a_cg * fyf - b_cg * fyr) / iz;
                    let d_x = v_for_lat * s_psi.cos() - s_vy * s_psi.sin();
                    let d_y = v_for_lat * s_psi.sin() + s_vy * s_psi.cos();
                    vec![d_vy, d_r, s_r, d_x, d_y]
                });
            }
            vy = lat_state[0];
            yaw_rate = lat_state[1];
            psi = lat_state[2];
            world_x = lat_state[3];
            world_y = lat_state[4];

            let af_now = steer - (vy + a_cg * yaw_rate) / v_for_lat;
            let ar_now = -(vy - b_cg * yaw_rate) / v_for_lat;
            ay = (caf * af_now + car * ar_now) / m;
        }

        // Advance SOC if EV
        if let Some(cap_j) = cfg.powertrain.battery_capacity_j {
            if cap_j > 0.0 {
                soc = (soc - (p_batt_internal * dt) / cap_j).clamp(0.0, 1.0);
            }
        }
    }

    let mut summary = BTreeMap::new();
    if let Some(last) = frames.last() {
        summary.insert(
            "finalSpeedMps".to_string(),
            MetricValue { value: last.speed_mps, unit: "m/s".to_string() },
        );
        summary.insert(
            "totalDistanceM".to_string(),
            MetricValue { value: last.distance_m, unit: "m".to_string() },
        );
        summary.insert(
            "finalYawRateRadS".to_string(),
            MetricValue { value: last.yaw_rate_rad_s, unit: "rad/s".to_string() },
        );
        summary.insert(
            "finalAccelLatMps2".to_string(),
            MetricValue { value: last.accel_lat_mps2, unit: "m/s^2".to_string() },
        );
    }
    summary.insert(
        "understeerGradientRadPerMps2".to_string(),
        MetricValue { value: kus, unit: "rad/(m/s^2)".to_string() },
    );

    let warnings = warnings_map
        .into_iter()
        .map(|(code, message)| SimulationWarning { code, message })
        .collect();

    (frames, warnings, summary)
}

pub fn run_time_series(input: &SimulationInput) -> Result<SimulationOutput, crate::contracts::ErrorEnvelope> {
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

    let (frames, warnings, summary) = simulate_config_time_series(&cfg, input);

    Ok(SimulationOutput {
        schema_version: SCHEMA_VERSION.to_string(),
        engine_version: ENGINE_VERSION.to_string(),
        model_fidelity_tag: MODEL_FIDELITY_TAG.to_string(),
        status: "OK".to_string(),
        simulated_estimate_disclaimer: SIMULATED_DISCLAIMER.to_string(),
        summary_metrics: summary,
        powertrain_snapshot: None,
        time_series: Some(frames),
        comparison_entries: None,
        comparison_diffs: None,
        warnings,
    })
}
