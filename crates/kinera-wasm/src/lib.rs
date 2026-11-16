#![deny(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use kinera_core::contracts::SimulationMode;
use kinera_core::{
    get_engine_metadata as core_metadata, make_error_envelope, run_simulation_from_json,
    validate_configuration_json as core_validate_config,
};
use wasm_bindgen::prelude::*;

fn serialize_result<T: serde::Serialize>(res: Result<T, kinera_core::contracts::ErrorEnvelope>) -> String {
    match res {
        Ok(val) => serde_json::to_string(&val).unwrap_or_else(|e| {
            serde_json::to_string(&make_error_envelope(
                "ERR_SERIALIZATION",
                "INTERNAL",
                format!("Failed to serialize output: {e}"),
                None,
                false,
            ))
            .unwrap_or_else(|_| "{\"error\":{\"code\":\"ERR_SERIALIZATION\"}}".to_string())
        }),
        Err(err_env) => serde_json::to_string(&err_env)
            .unwrap_or_else(|_| "{\"error\":{\"code\":\"ERR_SERIALIZATION\"}}".to_string()),
    }
}

#[wasm_bindgen]
pub fn get_engine_metadata() -> String {
    let meta = core_metadata();
    serde_json::to_string(&meta).unwrap_or_else(|_| "{}".to_string())
}

#[wasm_bindgen]
pub fn validate_configuration_json(config_json: &str) -> String {
    match core_validate_config(config_json) {
        Ok(ok_json) => ok_json,
        Err(err_env) => serde_json::to_string(&err_env)
            .unwrap_or_else(|_| "{\"error\":{\"code\":\"ERR_TOPO_UNSUPPORTED_CONFIG\"}}".to_string()),
    }
}

#[wasm_bindgen]
pub fn evaluate_powertrain_single(input_json: &str) -> String {
    serialize_result(run_simulation_from_json(
        input_json,
        Some(SimulationMode::SinglePointPowertrain),
    ))
}

#[wasm_bindgen]
pub fn run_dynamics_simulation(input_json: &str) -> String {
    serialize_result(run_simulation_from_json(
        input_json,
        Some(SimulationMode::TimeSeriesDynamics),
    ))
}

#[wasm_bindgen]
pub fn run_performance_benchmark(input_json: &str) -> String {
    serialize_result(run_simulation_from_json(
        input_json,
        Some(SimulationMode::PerformanceBenchmark),
    ))
}

#[wasm_bindgen]
pub fn run_configuration_comparison(input_json: &str) -> String {
    serialize_result(run_simulation_from_json(
        input_json,
        Some(SimulationMode::MultiConfigComparison),
    ))
}
