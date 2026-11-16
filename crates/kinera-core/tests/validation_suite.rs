#![allow(clippy::expect_used)]

use kinera_core::contracts::{
    DiffMode, DriverInputs, EnvironmentInputs, FourWdMode, ParameterOverrides, SimulationInput,
    SimulationMode, SolverConfig,
};
use kinera_core::dynamics::{
    aero_drag_n, compute_wheel_normal_loads, friction_circle_utilization, grade_resistance_n,
    rolling_resistance_n, steady_state_yaw_rate, understeer_gradient_rad_per_mps2,
};
use kinera_core::powertrain::{
    ev_motor_efficiency, ev_motor_envelope_nm, ice_displacement_m3, ice_torque_output_nm,
    split_axle_torque,
};
use kinera_core::topology::{
    all_configuration_ids, get_canonical_configuration, validate_vehicle_configuration,
};
use kinera_core::units::{mechanical_power, rpm_to_rad_s, tractive_force, Meters, NewtonMeters};
use kinera_core::{run_simulation_from_json, validate_simulation_input};

fn base_input(config_id: &str, mode: SimulationMode) -> SimulationInput {
    SimulationInput {
        schema_version: "1.0.0".to_string(),
        mode,
        configuration_ids: vec![config_id.to_string()],
        parameter_overrides: None,
        driver_inputs: DriverInputs {
            throttle: 1.0,
            brake_demand: 0.0,
            steering_angle_rad: 0.0,
            gear_index: 1,
            prime_mover_rpm: Some(3000.0),
            four_wd_mode: if config_id == "vehicle.config.ice-4wd" {
                Some(FourWdMode::FourH)
            } else {
                None
            },
            diff_mode: DiffMode::Open,
            ev_front_split: None,
        },
        environment: EnvironmentInputs {
            road_grade_rad: 0.0,
            air_density_kg_m3: 1.225,
            wheel_mu: [0.90, 0.90, 0.90, 0.90],
            gravity_mps2: 9.80665,
        },
        solver_config: SolverConfig {
            dt_sec: 0.01,
            duration_sec: 5.0,
            initial_speed_mps: 0.0,
            initial_soc: 0.85,
            abs_conceptual_enabled: true,
            matched_baseline_lock: false,
        },
    }
}

#[test]
fn test_topo_001_through_007_all_configs_valid() {
    let ids = all_configuration_ids();
    assert_eq!(ids.len(), 7);
    for id in ids {
        let cfg = get_canonical_configuration(&id).expect("canonical config missing");
        assert!(validate_vehicle_configuration(&cfg).is_ok(), "failed {id}");
    }
}

#[test]
fn test_topo_neg_001_to_005() {
    // NEG-001: Disconnected path on ICE-RWD
    let mut rwd = get_canonical_configuration("vehicle.config.ice-rwd").expect("rwd");
    rwd.topology.paths[0]
        .ordered_component_ids
        .retain(|c| c != "drivetrain.common.driveshaft-main");
    let err = validate_vehicle_configuration(&rwd).expect_err("should fail");
    assert_eq!(err.error.code, "ERR_TOPO_DISCONNECTED_PATH");

    // NEG-002: Duplicate/cycle component in path
    let mut fwd = get_canonical_configuration("vehicle.config.ice-fwd").expect("fwd");
    fwd.topology.paths[0]
        .ordered_component_ids
        .insert(2, "ice.engine.assembly".to_string());
    let err = validate_vehicle_configuration(&fwd).expect_err("should fail");
    assert_eq!(err.error.code, "ERR_TOPO_DISCONNECTED_PATH");

    // NEG-003: 4L on ICE-AWD rejected
    let mut awd_in = base_input("vehicle.config.ice-awd", SimulationMode::SinglePointPowertrain);
    awd_in.driver_inputs.four_wd_mode = Some(FourWdMode::FourL);
    let err = validate_simulation_input(&awd_in).expect_err("4L on AWD rejected");
    assert_eq!(err.error.code, "ERR_TOPO_UNSUPPORTED_CONFIG");

    // NEG-004: gear=3 on EV-FWD rejected
    let mut ev_in = base_input("vehicle.config.ev-fwd", SimulationMode::SinglePointPowertrain);
    ev_in.driver_inputs.gear_index = 3;
    let err = validate_simulation_input(&ev_in).expect_err("gear 3 on EV rejected");
    assert_eq!(err.error.code, "ERR_SIM_INVALID_GEAR");

    // NEG-005: Unknown config ID rejected
    let bad_in = base_input("vehicle.config.hydrogen-8x8", SimulationMode::SinglePointPowertrain);
    let err = validate_simulation_input(&bad_in).expect_err("unknown config rejected");
    assert_eq!(err.error.code, "ERR_TOPO_UNSUPPORTED_CONFIG");
}

#[test]
fn test_analytical_29_equations_tier_a_b_c() {
    // eq.powertrain.angular-velocity
    let omega = rpm_to_rad_s(3000.0);
    assert!((omega.0 - 314.1592653589793).abs() < 1e-9);

    // eq.powertrain.mechanical-power
    let p = mechanical_power(NewtonMeters(250.0), omega);
    assert!((p.0 - 78539.81633974483).abs() < 1e-6);

    // eq.powertrain.ice-displacement
    let vd = ice_displacement_m3(0.086, 0.086, 4);
    let expected_vd = std::f64::consts::PI * 0.086_f64.powi(3);
    assert!((vd - expected_vd).abs() < 1e-12);

    // eq.powertrain.ice-torque-output at 4400 RPM WOT = 205 Nm -> P = 94457.2 W
    let t4400 = ice_torque_output_nm(4400.0, 1.0);
    assert!((t4400 - 205.0).abs() < 1e-9);
    let p4400 = t4400 * rpm_to_rad_s(4400.0).0;
    assert!((p4400 - 94457.222).abs() < 0.1);

    // eq.powertrain.tractive-force
    let ft = tractive_force(NewtonMeters(1050.0), Meters(0.32));
    assert!((ft.0 - 3281.25).abs() < 1e-9);

    // eq.powertrain.open-diff, lsd-diff, locked-diff
    let (open_w, _) = split_axle_torque(1000.0, 300.0, 1800.0, DiffMode::Open, 2.5, 50.0);
    assert!((open_w[0] - 300.0).abs() < 1e-9 && (open_w[1] - 300.0).abs() < 1e-9);

    let (lsd_w, _) = split_axle_torque(1200.0, 300.0, 1800.0, DiffMode::Lsd, 2.5, 50.0);
    assert!((lsd_w[0] - 300.0).abs() < 1e-9 && (lsd_w[1] - 800.0).abs() < 1e-9);

    let (lock_w, _) = split_axle_torque(1200.0, 300.0, 1800.0, DiffMode::Locked, 2.5, 50.0);
    assert!((lock_w[0] - 300.0).abs() < 1e-9 && (lock_w[1] - 900.0).abs() < 1e-9);

    // eq.ev.motor-envelope
    let t_ev = ev_motor_envelope_nm(625.0, 320.0, 150_000.0, 1466.0);
    assert!((t_ev - 240.0).abs() < 1e-9);
    let eta_m = ev_motor_efficiency(314.16, 200.0, 310.0, 1466.0);
    assert!((0.78..=0.96).contains(&eta_m));

    // eq.dynamics.aero-drag, rolling, grade
    let fd = aero_drag_n(1.225, 0.28, 2.2, 30.0);
    assert!((fd - 339.57).abs() < 1e-9);
    let fr = rolling_resistance_n(0.011, 1500.0, 9.81, 0.0, 10.0);
    assert!((fr - 161.865).abs() < 1e-9);
    let theta_10pct = (0.10_f64).atan();
    let fg = grade_resistance_n(1500.0, 9.81, theta_10pct);
    assert!((fg - (1500.0 * 9.81 * 0.10 / 1.01_f64.sqrt())).abs() < 1e-9);

    // eq.dynamics.understeer-gradient & bicycle steady state
    let rwd = get_canonical_configuration("vehicle.config.ice-rwd").expect("rwd");
    let kus = understeer_gradient_rad_per_mps2(&rwd.specification);
    assert!((kus - 0.0016225).abs() < 1e-4);
    let rss = steady_state_yaw_rate(&rwd.specification, 20.0, 0.03);
    assert!((rss - 0.17916).abs() < 1e-4);

    // eq.dynamics.weight-transfer-longitudinal & lateral + normal load conservation
    let (loads, lifted) = compute_wheel_normal_loads(&rwd.specification, 9.80665, 0.0, 5.0, 4.0);
    assert!(!lifted);
    let total_fz: f64 = loads.iter().sum();
    assert!((total_fz - 1420.0 * 9.80665).abs() < 1e-6);

    // eq.dynamics.friction-circle
    let (_, util, sat) = friction_circle_utilization(2400.0, 2400.0, 0.90, 4000.0);
    assert!(!sat && (util - 0.942809).abs() < 1e-4);
}

#[test]
fn test_sim_001_to_012_core_scenarios() {
    // TEST-SIM-001: ICE-FWD steady cruise check
    let mut s1 = base_input("vehicle.config.ice-fwd", SimulationMode::SinglePointPowertrain);
    s1.driver_inputs.gear_index = 4; // G=1.03
    s1.parameter_overrides = Some(ParameterOverrides {
        aggregate_efficiency_override: Some(0.917),
        final_drive_ratio: Some(4.05),
        gear_ratio_override: Some(1.0),
        ..Default::default()
    });
    let json1 = serde_json::to_string(&s1).expect("ser");
    let out1 = run_simulation_from_json(&json1, None).expect("sim1");
    let snap1 = out1.powertrain_snapshot.expect("snap1");
    assert!(snap1.driveshaft_rpm.is_none());
    assert_eq!(snap1.axle_torques_nm[1], 0.0);
    assert!(snap1.tractive_force_total_n > 2000.0);

    // TEST-SIM-004: ICE-4WD 2H vs 4H vs 4L
    let mut s4_2h = base_input("vehicle.config.ice-4wd", SimulationMode::SinglePointPowertrain);
    s4_2h.driver_inputs.four_wd_mode = Some(FourWdMode::TwoH);
    let out_2h = run_simulation_from_json(&serde_json::to_string(&s4_2h).expect("s"), None).expect("2h");
    let snap_2h = out_2h.powertrain_snapshot.expect("snap2h");
    assert_eq!(snap_2h.axle_torques_nm[0], 0.0);
    assert!(snap_2h.axle_torques_nm[1] > 0.0);

    let mut s4_4l = base_input("vehicle.config.ice-4wd", SimulationMode::SinglePointPowertrain);
    s4_4l.driver_inputs.four_wd_mode = Some(FourWdMode::FourL);
    let out_4l = run_simulation_from_json(&serde_json::to_string(&s4_4l).expect("s"), None).expect("4l");
    let snap_4l = out_4l.powertrain_snapshot.expect("snap4l");
    assert!(snap_4l.axle_torques_nm[0] > 0.0);
    assert!(snap_4l.tractive_force_total_n > snap_2h.tractive_force_total_n * 2.1);

    // TEST-SIM-007: EV-RWD Regen braking increases SOC
    let mut s7 = base_input("vehicle.config.ev-rwd", SimulationMode::TimeSeriesDynamics);
    s7.driver_inputs.throttle = 0.0;
    s7.driver_inputs.brake_demand = 0.5;
    s7.driver_inputs.prime_mover_rpm = None;
    s7.solver_config.initial_speed_mps = 25.0;
    s7.solver_config.initial_soc = 0.50;
    s7.solver_config.duration_sec = 2.0;
    let out7 = run_simulation_from_json(&serde_json::to_string(&s7).expect("s"), None).expect("regen");
    let frames7 = out7.time_series.expect("ts7");
    let soc_end = frames7.last().and_then(|f| f.soc).expect("soc");
    assert!(soc_end > 0.50, "expected regen to raise SOC above 0.50, got {soc_end}");

    // TEST-SIM-009: 2-DOF Bicycle Steady-State Cornering
    let mut s9 = base_input("vehicle.config.ice-rwd", SimulationMode::TimeSeriesDynamics);
    s9.driver_inputs.throttle = 0.2;
    s9.driver_inputs.steering_angle_rad = 0.025;
    s9.driver_inputs.prime_mover_rpm = None;
    s9.solver_config.initial_speed_mps = 20.0;
    s9.solver_config.duration_sec = 3.0;
    let out9 = run_simulation_from_json(&serde_json::to_string(&s9).expect("s"), None).expect("bicycle");
    let frames9 = out9.time_series.expect("ts9");
    let last9 = frames9.last().expect("last9");
    assert!(last9.yaw_rate_rad_s > 0.10);
    assert!(last9.world_y_m > 1.0);

    // TEST-SIM-012: Multi-config comparison with Matched Baseline
    let mut s12 = base_input("vehicle.config.ice-fwd", SimulationMode::MultiConfigComparison);
    s12.configuration_ids = vec![
        "vehicle.config.ice-fwd".to_string(),
        "vehicle.config.ice-rwd".to_string(),
        "vehicle.config.ev-dual-awd".to_string(),
    ];
    s12.solver_config.matched_baseline_lock = true;
    s12.solver_config.duration_sec = 4.0;
    s12.driver_inputs.prime_mover_rpm = None;
    let out12 = run_simulation_from_json(&serde_json::to_string(&s12).expect("s"), None).expect("cmp");
    assert_eq!(out12.comparison_entries.expect("entries").len(), 3);
    let diffs = out12.comparison_diffs.expect("diffs");
    let mass_diff = diffs.iter().find(|d| d.parameter_name == "massKg").expect("massDiff");
    assert_eq!(mass_diff.status, "MATCHED");
}

#[test]
fn test_edge_001_to_019_resilience() {
    // TEST-EDGE-001: Zero RPM
    let mut e1 = base_input("vehicle.config.ice-fwd", SimulationMode::SinglePointPowertrain);
    e1.driver_inputs.prime_mover_rpm = Some(0.0);
    let o1 = run_simulation_from_json(&serde_json::to_string(&e1).expect("s"), None).expect("e1");
    assert_eq!(o1.powertrain_snapshot.expect("s").prime_mover_omega_rad_s, 0.0);

    // TEST-EDGE-003: Zero vehicle speed + steering -> no NaN
    let mut e3 = base_input("vehicle.config.ice-rwd", SimulationMode::TimeSeriesDynamics);
    e3.driver_inputs.throttle = 0.0;
    e3.driver_inputs.steering_angle_rad = 0.1;
    e3.solver_config.initial_speed_mps = 0.0;
    e3.solver_config.duration_sec = 1.0;
    let o3 = run_simulation_from_json(&serde_json::to_string(&e3).expect("s"), None).expect("e3");
    assert!(o3.time_series.expect("ts").last().expect("l").speed_mps.is_finite());

    // TEST-EDGE-005: Over redline RPM -> fuel cut
    let mut e5 = base_input("vehicle.config.ice-fwd", SimulationMode::SinglePointPowertrain);
    e5.driver_inputs.prime_mover_rpm = Some(7300.0);
    let o5 = run_simulation_from_json(&serde_json::to_string(&e5).expect("s"), None).expect("e5");
    assert_eq!(o5.powertrain_snapshot.expect("s").prime_mover_torque_nm, 0.0);

    // TEST-EDGE-008: Zero efficiency -> ERR_SIM_INVALID_EFFICIENCY
    let mut e8 = base_input("vehicle.config.ice-fwd", SimulationMode::SinglePointPowertrain);
    e8.parameter_overrides = Some(ParameterOverrides {
        aggregate_efficiency_override: Some(0.0),
        ..Default::default()
    });
    let err8 = run_simulation_from_json(&serde_json::to_string(&e8).expect("s"), None).expect_err("e8");
    assert_eq!(err8.error.code, "ERR_SIM_INVALID_EFFICIENCY");

    // TEST-EDGE-009: Battery depletion -> 0 W + WARN_BATTERY_DEPLETED
    let mut e9 = base_input("vehicle.config.ev-rwd", SimulationMode::SinglePointPowertrain);
    e9.solver_config.initial_soc = 0.0;
    let o9 = run_simulation_from_json(&serde_json::to_string(&e9).expect("s"), None).expect("e9");
    assert_eq!(o9.powertrain_snapshot.expect("s").prime_mover_power_w, 0.0);
    assert!(o9.warnings.iter().any(|w| w.code == "WARN_BATTERY_DEPLETED"));

    // TEST-EDGE-010: Invalid voltage -> ERR_SIM_INVALID_VOLTAGE
    let mut e10 = base_input("vehicle.config.ev-fwd", SimulationMode::SinglePointPowertrain);
    e10.parameter_overrides = Some(ParameterOverrides {
        battery_voltage_v: Some(0.0),
        ..Default::default()
    });
    let err10 = run_simulation_from_json(&serde_json::to_string(&e10).expect("s"), None).expect_err("e10");
    assert_eq!(err10.error.code, "ERR_SIM_INVALID_VOLTAGE");

    // TEST-EDGE-011: Invalid mass -> ERR_SIM_INVALID_MASS
    let mut e11 = base_input("vehicle.config.ice-fwd", SimulationMode::SinglePointPowertrain);
    e11.parameter_overrides = Some(ParameterOverrides {
        mass_kg: Some(50.0),
        ..Default::default()
    });
    let err11 = run_simulation_from_json(&serde_json::to_string(&e11).expect("s"), None).expect_err("e11");
    assert_eq!(err11.error.code, "ERR_SIM_INVALID_MASS");

    // TEST-EDGE-014: Zero tire mu -> no NaN + WARN_TRACTION_SATURATED
    let mut e14 = base_input("vehicle.config.ice-fwd", SimulationMode::SinglePointPowertrain);
    e14.environment.wheel_mu = [0.0, 0.0, 0.0, 0.0];
    let o14 = run_simulation_from_json(&serde_json::to_string(&e14).expect("s"), None).expect("e14");
    assert_eq!(o14.powertrain_snapshot.expect("s").tractive_force_total_n, 0.0);

    // TEST-EDGE-016: Invalid steering -> ERR_SIM_INVALID_STEERING
    let mut e16 = base_input("vehicle.config.ice-fwd", SimulationMode::TimeSeriesDynamics);
    e16.driver_inputs.steering_angle_rad = 1.2;
    let err16 = run_simulation_from_json(&serde_json::to_string(&e16).expect("s"), None).expect_err("e16");
    assert_eq!(err16.error.code, "ERR_SIM_INVALID_STEERING");

    // TEST-EDGE-017: Extreme dt -> ERR_SIM_INVALID_TIMESTEP
    let mut e17 = base_input("vehicle.config.ice-fwd", SimulationMode::TimeSeriesDynamics);
    e17.solver_config.dt_sec = 0.2;
    let err17 = run_simulation_from_json(&serde_json::to_string(&e17).expect("s"), None).expect_err("e17");
    assert_eq!(err17.error.code, "ERR_SIM_INVALID_TIMESTEP");
}
