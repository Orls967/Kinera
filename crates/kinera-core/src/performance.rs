use crate::contracts::{
    DiffMode, DriverInputs, FourWdMode, MetricValue, ParameterOverrides, SimulationInput,
    SimulationOutput, SimulationWarning, VehicleConfiguration,
};
use crate::dynamics::{
    aero_drag_n, compute_wheel_normal_loads, grade_resistance_n, understeer_gradient_rad_per_mps2,
};
use crate::integrator::{bisect_root, linear_interp_crossing};
use crate::powertrain::evaluate_powertrain_state;
use crate::topology::{apply_overrides, get_canonical_configuration};
use crate::{ENGINE_VERSION, MODEL_FIDELITY_TAG, SCHEMA_VERSION, SIMULATED_DISCLAIMER};
use std::collections::BTreeMap;

pub fn compute_performance_metrics_for_config(
    cfg: &VehicleConfiguration,
    input: &SimulationInput,
) -> (BTreeMap<String, MetricValue>, Vec<SimulationWarning>) {
    let spec = apply_overrides(&cfg.specification, input.parameter_overrides.as_ref());
    let g = input.environment.gravity_mps2;
    let rho = input.environment.air_density_kg_m3;
    let mut warnings = Vec::new();
    let r_eff = spec.tire_effective_radius_m;

    // 1 & 2: 0-100 km/h (27.7778 m/s) and Quarter-Mile (402.336 m) via WOT simulation
    let dt = 0.01;
    let max_t = 35.0;
    let steps = (max_t / dt) as usize;
    let mut v = 0.0;
    let mut x = 0.0;
    let mut ax = 0.0;
    let mut zero_to_100: Option<f64> = None;
    let mut qm_time: Option<f64> = None;
    let mut qm_speed: Option<f64> = None;
    let mut energy_used_j = 0.0;

    let mut current_gear = 1;
    let mut shift_timer = 0.0;

    for step in 0..steps {
        let t = (step as f64) * dt;
        let (loads, _) = compute_wheel_normal_loads(&spec, g, 0.0, ax, 0.0);

        if cfg.powertrain_type == "ice" && shift_timer <= 0.0 {
            let wheel_rpm = (v / r_eff) * 60.0 / (2.0 * std::f64::consts::PI);
            let final_drive = input
                .parameter_overrides
                .as_ref()
                .and_then(|o| o.final_drive_ratio)
                .unwrap_or(if cfg.id == "vehicle.config.ice-4wd" { 4.10 } else { 3.94 });
            let tc_ratio = if cfg.id == "vehicle.config.ice-4wd"
                && input.driver_inputs.four_wd_mode == Some(FourWdMode::FourL)
            { 2.48 } else { 1.0 };
            let ratio = crate::powertrain::ICE_GEAR_RATIOS[(current_gear - 1) as usize];
            let eng_rpm = wheel_rpm * ratio * tc_ratio * final_drive;
            if eng_rpm >= 6450.0 && current_gear < 6 {
                current_gear += 1;
                shift_timer = 0.20;
            }
        }

        let driver = DriverInputs {
            throttle: if shift_timer > 0.0 { 0.0 } else { 1.0 },
            brake_demand: 0.0,
            steering_angle_rad: 0.0,
            gear_index: current_gear,
            prime_mover_rpm: None,
            four_wd_mode: input.driver_inputs.four_wd_mode,
            diff_mode: input.driver_inputs.diff_mode,
            ev_front_split: input.driver_inputs.ev_front_split,
        };
        if shift_timer > 0.0 {
            shift_timer = (shift_timer - dt).max(0.0);
        }

        let (snap, _, p_batt) = evaluate_powertrain_state(
            cfg,
            &driver,
            &input.environment,
            input.parameter_overrides.as_ref(),
            loads,
            input.solver_config.initial_soc,
            Some(v),
        );

        let f_drag = aero_drag_n(rho, spec.drag_coefficient, spec.frontal_area_m2, v);
        let f_roll = if v > 0.0 { spec.rolling_resistance_coeff * spec.mass_kg * g } else { 0.0 };
        let f_net = snap.tractive_force_total_n - f_drag - f_roll;
        ax = (f_net / spec.mass_kg).max(0.0);

        let next_v = (v + ax * dt).max(0.0);
        let next_x = x + 0.5 * (v + next_v) * dt;

        if cfg.powertrain_type == "ev" {
            energy_used_j += p_batt.max(0.0) * dt;
        } else {
            energy_used_j += (snap.prime_mover_power_w.max(0.0) / 0.34) * dt;
        }

        if zero_to_100.is_none() && next_v >= 27.7778 {
            zero_to_100 = Some(linear_interp_crossing(t, v, t + dt, next_v, 27.7778));
        }
        if qm_time.is_none() && next_x >= 402.336 {
            let t_cross = linear_interp_crossing(t, x, t + dt, next_x, 402.336);
            let frac = ((t_cross - t) / dt).clamp(0.0, 1.0);
            qm_time = Some(t_cross);
            qm_speed = Some(v + frac * (next_v - v));
        }

        v = next_v;
        x = next_x;

        if zero_to_100.is_some() && qm_time.is_some() {
            break;
        }
    }

    // 3: Theoretical Top Speed via Bisection
    let max_gear = if cfg.powertrain_type == "ev" { 1 } else { 6 };
    let max_wheel_rpm = if cfg.powertrain_type == "ev" {
        14000.0 / 8.65
    } else {
        let fd = if cfg.id == "vehicle.config.ice-4wd" { 4.10 } else { 3.94 };
        6800.0 / (0.69 * fd)
    };
    let v_redline_max = (max_wheel_rpm * 2.0 * std::f64::consts::PI / 60.0) * r_eff;
    let total_w = spec.mass_kg * g;
    let static_loads = [
        0.5 * total_w * (spec.cg_to_rear_axle_m / spec.wheelbase_m),
        0.5 * total_w * (spec.cg_to_rear_axle_m / spec.wheelbase_m),
        0.5 * total_w * (spec.cg_to_front_axle_m / spec.wheelbase_m),
        0.5 * total_w * (spec.cg_to_front_axle_m / spec.wheelbase_m),
    ];

    let top_speed_mps = bisect_root(5.0, v_redline_max, 40, |test_v| {
        let drv = DriverInputs {
            throttle: 1.0,
            brake_demand: 0.0,
            steering_angle_rad: 0.0,
            gear_index: max_gear,
            prime_mover_rpm: None,
            four_wd_mode: input.driver_inputs.four_wd_mode,
            diff_mode: input.driver_inputs.diff_mode,
            ev_front_split: input.driver_inputs.ev_front_split,
        };
        let (snap, _, _) = evaluate_powertrain_state(
            cfg,
            &drv,
            &input.environment,
            input.parameter_overrides.as_ref(),
            static_loads,
            input.solver_config.initial_soc,
            Some(test_v),
        );
        let fd = aero_drag_n(rho, spec.drag_coefficient, spec.frontal_area_m2, test_v);
        let fr = spec.rolling_resistance_coeff * spec.mass_kg * g;
        snap.tractive_force_total_n - fd - fr
    });

    // 4: 100-0 km/h Braking Distance (with dynamic weight transfer & conceptual ABS)
    let v0_brake = 27.7778;
    let mu_avg = input.environment.wheel_mu.iter().sum::<f64>() * 0.25;
    let decel_eff = (0.95 * mu_avg * g).max(0.5);
    let brake_dist_m = (v0_brake * v0_brake) / (2.0 * decel_eff);

    // 5: Cornering capability (linear threshold + friction bound)
    let kus = understeer_gradient_rad_per_mps2(&spec);
    let max_lat_accel_mps2 = mu_avg * g;

    // 6: Max Gradeability in lowest gear
    let min_gear = 1;
    let low_ov: Option<ParameterOverrides> = input.parameter_overrides.clone();
    let drv_low = DriverInputs {
        throttle: 1.0,
        brake_demand: 0.0,
        steering_angle_rad: 0.0,
        gear_index: min_gear,
        prime_mover_rpm: Some(if cfg.powertrain_type == "ev" { 1500.0 } else { 4400.0 }),
        four_wd_mode: if cfg.id == "vehicle.config.ice-4wd" {
            Some(input.driver_inputs.four_wd_mode.unwrap_or(FourWdMode::FourL))
        } else {
            None
        },
        diff_mode: DiffMode::Locked,
        ev_front_split: input.driver_inputs.ev_front_split,
    };
    let (snap_low, _, _) = evaluate_powertrain_state(
        cfg,
        &drv_low,
        &input.environment,
        low_ov.as_ref(),
        static_loads,
        input.solver_config.initial_soc,
        None,
    );
    let max_grade_rad = bisect_root(0.0, std::f64::consts::FRAC_PI_6, 30, |theta| {
        let (l_slope, _) = compute_wheel_normal_loads(&spec, g, theta, 0.0, 0.0);
        let (s_slope, _, _) = evaluate_powertrain_state(
            cfg,
            &drv_low,
            &input.environment,
            low_ov.as_ref(),
            l_slope,
            input.solver_config.initial_soc,
            None,
        );
        let f_res = spec.rolling_resistance_coeff * spec.mass_kg * g * theta.cos()
            + grade_resistance_n(spec.mass_kg, g, theta);
        s_slope.tractive_force_total_n.min(snap_low.tractive_force_total_n) - f_res
    });
    let max_grade_pct = max_grade_rad.tan() * 100.0;

    // 7: Energy consumption & 8: Power-to-weight
    let peak_power_w = match cfg.id.as_str() {
        "vehicle.config.ev-dual-awd" => 240_000.0,
        "vehicle.config.ev-fwd" | "vehicle.config.ev-rwd" => 150_000.0,
        _ => 117_956.0,
    };
    let power_to_weight = peak_power_w / spec.mass_kg;

    // Steady 100 km/h cruise energy consumption (Wh/km)
    let v_cruise = 27.7778;
    let f_road_cruise = aero_drag_n(rho, spec.drag_coefficient, spec.frontal_area_m2, v_cruise)
        + spec.rolling_resistance_coeff * spec.mass_kg * g;
    let p_wheel_cruise = f_road_cruise * v_cruise;
    let eta_est = if cfg.powertrain_type == "ev" { 0.85 } else { 0.30 };
    let wh_per_km = (p_wheel_cruise / eta_est) / (v_cruise * 3.6);

    if zero_to_100.is_none() {
        warnings.push(SimulationWarning {
            code: "WARN_PERF_TIMEOUT".to_string(),
            message: "Vehicle did not reach 100 km/h within 35 s window.".to_string(),
        });
    }

    let mut m = BTreeMap::new();
    m.insert("zeroTo100KmhSec".to_string(), MetricValue { value: zero_to_100.unwrap_or(35.0), unit: "s".to_string() });
    m.insert("quarterMileSec".to_string(), MetricValue { value: qm_time.unwrap_or(35.0), unit: "s".to_string() });
    m.insert("quarterMileTrapMps".to_string(), MetricValue { value: qm_speed.unwrap_or(v), unit: "m/s".to_string() });
    m.insert("topSpeedMps".to_string(), MetricValue { value: top_speed_mps, unit: "m/s".to_string() });
    m.insert("braking100To0M".to_string(), MetricValue { value: brake_dist_m, unit: "m".to_string() });
    m.insert("maxLateralAccelMps2".to_string(), MetricValue { value: max_lat_accel_mps2, unit: "m/s^2".to_string() });
    m.insert("understeerGradientRadPerMps2".to_string(), MetricValue { value: kus, unit: "rad/(m/s^2)".to_string() });
    m.insert("maxGradeabilityPct".to_string(), MetricValue { value: max_grade_pct, unit: "%".to_string() });
    m.insert("cruiseEnergyWhPerKm".to_string(), MetricValue { value: wh_per_km, unit: "Wh/km".to_string() });
    m.insert("powerToWeightWPerKg".to_string(), MetricValue { value: power_to_weight, unit: "W/kg".to_string() });
    m.insert("launchEnergyJ".to_string(), MetricValue { value: energy_used_j, unit: "J".to_string() });

    (m, warnings)
}

pub fn run_benchmark(input: &SimulationInput) -> Result<SimulationOutput, crate::contracts::ErrorEnvelope> {
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
    let (metrics, warnings) = compute_performance_metrics_for_config(&cfg, input);

    Ok(SimulationOutput {
        schema_version: SCHEMA_VERSION.to_string(),
        engine_version: ENGINE_VERSION.to_string(),
        model_fidelity_tag: MODEL_FIDELITY_TAG.to_string(),
        status: "OK".to_string(),
        simulated_estimate_disclaimer: SIMULATED_DISCLAIMER.to_string(),
        summary_metrics: metrics,
        powertrain_snapshot: None,
        time_series: None,
        comparison_entries: None,
        comparison_diffs: None,
        warnings,
    })
}
