#![deny(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

pub mod comparison;
pub mod contracts;
pub mod dynamics;
pub mod integrator;
pub mod performance;
pub mod powertrain;
pub mod topology;
pub mod units;

use contracts::{
    EngineMetadata, ErrorEnvelope, ErrorPayload, SimulationInput, SimulationMode, SimulationOutput,
};

pub const ENGINE_VERSION: &str = "1.0.0";
pub const SCHEMA_VERSION: &str = "1.0.0";
pub const MODEL_FIDELITY_TAG: &str = "kinera-v1-educational";
pub const SIMULATED_DISCLAIMER: &str =
    "Simulated Model Estimate — Educational V1 reduced-order model, not verified production vehicle data.";

pub fn get_engine_metadata() -> EngineMetadata {
    EngineMetadata {
        engine_version: ENGINE_VERSION.to_string(),
        schema_version: SCHEMA_VERSION.to_string(),
        model_fidelity_tag: MODEL_FIDELITY_TAG.to_string(),
        supported_configs: topology::all_configuration_ids(),
    }
}

pub fn make_error_envelope(
    code: &str,
    category: &str,
    message: String,
    field_path: Option<&str>,
    recoverable: bool,
) -> ErrorEnvelope {
    ErrorEnvelope {
        error: Box::new(ErrorPayload {
            code: code.to_string(),
            category: category.to_string(),
            message,
            field_path: field_path.map(|s| s.to_string()),
            recoverable,
            details: None,
        }),
    }
}

pub fn validate_configuration_json(config_json: &str) -> Result<String, ErrorEnvelope> {
    let config: contracts::VehicleConfiguration =
        serde_json::from_str(config_json).map_err(|e| {
            make_error_envelope(
                "ERR_SCHEMA_PARSE",
                "VALIDATION",
                format!("Invalid configuration JSON: {e}"),
                None,
                true,
            )
        })?;
    topology::validate_vehicle_configuration(&config)?;
    serde_json::to_string(&serde_json::json!({
        "valid": true,
        "configurationId": config.id,
        "drivenAxles": config.topology.driven_axles,
        "pathCount": config.topology.paths.len()
    }))
    .map_err(|e| {
        make_error_envelope(
            "ERR_SERIALIZATION",
            "INTERNAL",
            format!("Serialization error: {e}"),
            None,
            false,
        )
    })
}

pub fn run_simulation_from_json(
    input_json: &str,
    expected_mode: Option<SimulationMode>,
) -> Result<SimulationOutput, ErrorEnvelope> {
    let input: SimulationInput = serde_json::from_str(input_json).map_err(|e| {
        make_error_envelope(
            "ERR_SCHEMA_PARSE",
            "VALIDATION",
            format!("Invalid simulation input JSON: {e}"),
            None,
            true,
        )
    })?;
    validate_simulation_input(&input)?;
    let mode = expected_mode.unwrap_or(input.mode);
    match mode {
        SimulationMode::SinglePointPowertrain => powertrain::evaluate_single_point(&input),
        SimulationMode::TimeSeriesDynamics => dynamics::run_time_series(&input),
        SimulationMode::PerformanceBenchmark => performance::run_benchmark(&input),
        SimulationMode::MultiConfigComparison => comparison::run_comparison(&input),
    }
}

pub fn validate_simulation_input(input: &SimulationInput) -> Result<(), ErrorEnvelope> {
    if !input.schema_version.starts_with("1.") {
        return Err(make_error_envelope(
            "ERR_SCHEMA_VERSION_MISMATCH",
            "VALIDATION",
            format!(
                "Unsupported schemaVersion '{}'; expected 1.x.x.",
                input.schema_version
            ),
            Some("schemaVersion"),
            true,
        ));
    }

    if input.configuration_ids.is_empty() || input.configuration_ids.len() > 7 {
        return Err(make_error_envelope(
            "ERR_TOPO_UNSUPPORTED_CONFIG",
            "VALIDATION",
            "configurationIds must contain between 1 and 7 configuration IDs.".to_string(),
            Some("configurationIds"),
            true,
        ));
    }

    for cfg_id in &input.configuration_ids {
        let cfg = topology::get_canonical_configuration(cfg_id).ok_or_else(|| {
            make_error_envelope(
                "ERR_TOPO_UNSUPPORTED_CONFIG",
                "VALIDATION",
                format!("Unsupported configuration ID '{cfg_id}'."),
                Some("configurationIds"),
                true,
            )
        })?;
        topology::validate_vehicle_configuration(&cfg)?;
        topology::validate_driver_inputs_for_config(&cfg, &input.driver_inputs)?;
    }

    let dt = input.solver_config.dt_sec;
    if !dt.is_finite() || !(0.001..=0.05).contains(&dt) {
        return Err(make_error_envelope(
            "ERR_SIM_INVALID_TIMESTEP",
            "VALIDATION",
            format!("Time step dtSec must lie within [0.001, 0.05] s (received {dt})."),
            Some("solverConfig.dtSec"),
            true,
        ));
    }

    let dur = input.solver_config.duration_sec;
    if !dur.is_finite() || !(0.01..=300.0).contains(&dur) {
        return Err(make_error_envelope(
            "ERR_SIM_INVALID_TIMESTEP",
            "VALIDATION",
            format!("Duration must lie within [0.01, 300.0] s (received {dur})."),
            Some("solverConfig.durationSec"),
            true,
        ));
    }

    let steer = input.driver_inputs.steering_angle_rad;
    if !steer.is_finite() || steer.abs() > std::f64::consts::FRAC_PI_4 + 1e-4 {
        return Err(make_error_envelope(
            "ERR_SIM_INVALID_STEERING",
            "VALIDATION",
            format!("Steering angle must be finite and within [-0.7854, 0.7854] rad (received {steer})."),
            Some("driverInputs.steeringAngleRad"),
            true,
        ));
    }

    if !input.driver_inputs.throttle.is_finite()
        || !(0.0..=1.0).contains(&input.driver_inputs.throttle)
    {
        return Err(make_error_envelope(
            "ERR_SIM_INVALID_INPUT",
            "VALIDATION",
            "Throttle must be finite and in [0.0, 1.0].".to_string(),
            Some("driverInputs.throttle"),
            true,
        ));
    }

    if !input.driver_inputs.brake_demand.is_finite()
        || !(0.0..=1.0).contains(&input.driver_inputs.brake_demand)
    {
        return Err(make_error_envelope(
            "ERR_SIM_INVALID_INPUT",
            "VALIDATION",
            "Brake demand must be finite and in [0.0, 1.0].".to_string(),
            Some("driverInputs.brakeDemand"),
            true,
        ));
    }

    if !input.environment.air_density_kg_m3.is_finite()
        || !(0.5..=1.6).contains(&input.environment.air_density_kg_m3)
    {
        return Err(make_error_envelope(
            "ERR_SIM_INVALID_ENVIRONMENT",
            "VALIDATION",
            "Air density must be finite and within [0.5, 1.6] kg/m^3.".to_string(),
            Some("environment.airDensityKgM3"),
            true,
        ));
    }

    if !input.environment.gravity_mps2.is_finite()
        || !(1.0..=20.0).contains(&input.environment.gravity_mps2)
    {
        return Err(make_error_envelope(
            "ERR_SIM_INVALID_ENVIRONMENT",
            "VALIDATION",
            "Gravity must be finite and within [1.0, 20.0] m/s^2.".to_string(),
            Some("environment.gravityMps2"),
            true,
        ));
    }

    if !input.environment.road_grade_rad.is_finite()
        || input.environment.road_grade_rad.abs() > std::f64::consts::FRAC_PI_6 + 1e-4
    {
        return Err(make_error_envelope(
            "ERR_SIM_INVALID_ENVIRONMENT",
            "VALIDATION",
            "Road grade must be finite and within [-0.5236, 0.5236] rad.".to_string(),
            Some("environment.roadGradeRad"),
            true,
        ));
    }

    for (idx, &mu) in input.environment.wheel_mu.iter().enumerate() {
        if !mu.is_finite() || !(0.0..=1.5).contains(&mu) {
            return Err(make_error_envelope(
                "ERR_SIM_INVALID_ENVIRONMENT",
                "VALIDATION",
                format!("Wheel mu[{idx}] must be finite and within [0.0, 1.5]."),
                Some("environment.wheelMu"),
                true,
            ));
        }
    }

    if let Some(ov) = &input.parameter_overrides {
        if let Some(m) = ov.mass_kg {
            if !m.is_finite() || !(100.0..=50000.0).contains(&m) {
                return Err(make_error_envelope(
                    "ERR_SIM_INVALID_MASS",
                    "VALIDATION",
                    format!("Vehicle mass must be finite and within [100, 50000] kg (received {m})."),
                    Some("parameterOverrides.massKg"),
                    true,
                ));
            }
        }
        if let Some(v) = ov.battery_voltage_v {
            if !v.is_finite() || !(48.0..=1200.0).contains(&v) {
                return Err(make_error_envelope(
                    "ERR_SIM_INVALID_VOLTAGE",
                    "VALIDATION",
                    format!("Battery voltage must be finite and within [48, 1200] V (received {v})."),
                    Some("parameterOverrides.batteryVoltageV"),
                    true,
                ));
            }
        }
        if let Some(eta) = ov.aggregate_efficiency_override {
            if !eta.is_finite() || eta <= 0.05 || eta > 1.0 {
                return Err(make_error_envelope(
                    "ERR_SIM_INVALID_EFFICIENCY",
                    "VALIDATION",
                    format!("Efficiency override must be finite and in (0.05, 1.0] (received {eta})."),
                    Some("parameterOverrides.aggregateEfficiencyOverride"),
                    true,
                ));
            }
        }
        if let Some(fd) = ov.final_drive_ratio {
            if !fd.is_finite() || !(0.5..=20.0).contains(&fd) {
                return Err(make_error_envelope(
                    "ERR_SIM_INVALID_RATIO",
                    "VALIDATION",
                    format!("Final drive ratio must be finite and in [0.5, 20.0] (received {fd})."),
                    Some("parameterOverrides.finalDriveRatio"),
                    true,
                ));
            }
        }
        if let Some(gr) = ov.gear_ratio_override {
            if !gr.is_finite() || !(0.2..=25.0).contains(&gr) {
                return Err(make_error_envelope(
                    "ERR_SIM_INVALID_RATIO",
                    "VALIDATION",
                    format!("Gear ratio override must be finite and in [0.2, 25.0] (received {gr})."),
                    Some("parameterOverrides.gearRatioOverride"),
                    true,
                ));
            }
        }
        if let Some(r) = ov.tire_effective_radius_m {
            if !r.is_finite() || !(0.15..=0.8).contains(&r) {
                return Err(make_error_envelope(
                    "ERR_SIM_INVALID_RATIO",
                    "VALIDATION",
                    format!("Tire effective radius must be in [0.15, 0.8] m (received {r})."),
                    Some("parameterOverrides.tireEffectiveRadiusM"),
                    true,
                ));
            }
        }
        if let Some(bias) = ov.front_brake_bias {
            if !bias.is_finite() || bias <= 0.0 || bias >= 1.0 {
                return Err(make_error_envelope(
                    "ERR_SIM_INVALID_INPUT",
                    "VALIDATION",
                    "frontBrakeBias must lie strictly within (0.0, 1.0).".to_string(),
                    Some("parameterOverrides.frontBrakeBias"),
                    true,
                ));
            }
        }
    }

    Ok(())
}
