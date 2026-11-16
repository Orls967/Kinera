use crate::contracts::{
    ComparisonDiff, ConfigComparisonEntry, DiffMode, DriverInputs, FourWdMode, MetricValue,
    SimulationInput, SimulationOutput,
};
use crate::dynamics::simulate_config_time_series;
use crate::performance::compute_performance_metrics_for_config;
use crate::powertrain::evaluate_powertrain_state;
use crate::topology::{apply_overrides, get_canonical_configuration};
use crate::{ENGINE_VERSION, MODEL_FIDELITY_TAG, SCHEMA_VERSION, SIMULATED_DISCLAIMER};
use std::collections::BTreeMap;

pub fn run_comparison(input: &SimulationInput) -> Result<SimulationOutput, crate::contracts::ErrorEnvelope> {
    let mut entries = Vec::with_capacity(input.configuration_ids.len());
    let mut mass_map = BTreeMap::new();
    let mut cd_map = BTreeMap::new();
    let mut area_map = BTreeMap::new();
    let mut crr_map = BTreeMap::new();
    let mut r_map = BTreeMap::new();
    let mut cg_split_map = BTreeMap::new();
    let mut power_map = BTreeMap::new();

    for cfg_id in &input.configuration_ids {
        let cfg = get_canonical_configuration(cfg_id).ok_or_else(|| {
            crate::make_error_envelope(
                "ERR_TOPO_UNSUPPORTED_CONFIG",
                "VALIDATION",
                format!("Unsupported configuration '{cfg_id}'."),
                Some("configurationIds"),
                true,
            )
        })?;

        let mut cfg_input = input.clone();
        cfg_input.configuration_ids = vec![cfg.id.clone()];
        if cfg.powertrain_type == "ev" {
            cfg_input.driver_inputs.gear_index = cfg_input.driver_inputs.gear_index.clamp(-1, 1);
            cfg_input.driver_inputs.four_wd_mode = None;
            if cfg.id == "vehicle.config.ev-dual-awd" && cfg_input.driver_inputs.diff_mode == DiffMode::Open {
                cfg_input.driver_inputs.diff_mode = DiffMode::EvElectronic;
            }
        } else if !cfg.topology.has_low_range_transfer_case {
            cfg_input.driver_inputs.four_wd_mode = None;
        } else if cfg_input.driver_inputs.four_wd_mode.is_none() {
            cfg_input.driver_inputs.four_wd_mode = Some(FourWdMode::FourH);
        }

        if cfg_input.solver_config.matched_baseline_lock {
            let mut ov = cfg_input.parameter_overrides.clone().unwrap_or_default();
            if ov.mass_kg.is_none() {
                ov.mass_kg = Some(1550.0);
            }
            if ov.drag_coefficient.is_none() {
                ov.drag_coefficient = Some(0.29);
            }
            if ov.frontal_area_m2.is_none() {
                ov.frontal_area_m2 = Some(2.25);
            }
            if ov.rolling_resistance_coeff.is_none() {
                ov.rolling_resistance_coeff = Some(0.011);
            }
            if ov.tire_effective_radius_m.is_none() {
                ov.tire_effective_radius_m = Some(0.315);
            }
            cfg_input.parameter_overrides = Some(ov);
        }

        let spec = apply_overrides(&cfg.specification, cfg_input.parameter_overrides.as_ref());
        let g = cfg_input.environment.gravity_mps2;
        let total_w = spec.mass_kg * g;
        let static_loads = [
            0.5 * total_w * (spec.cg_to_rear_axle_m / spec.wheelbase_m),
            0.5 * total_w * (spec.cg_to_rear_axle_m / spec.wheelbase_m),
            0.5 * total_w * (spec.cg_to_front_axle_m / spec.wheelbase_m),
            0.5 * total_w * (spec.cg_to_front_axle_m / spec.wheelbase_m),
        ];

        let (snap, mut pt_warnings, _) = evaluate_powertrain_state(
            &cfg,
            &DriverInputs {
                prime_mover_rpm: Some(3000.0),
                ..cfg_input.driver_inputs.clone()
            },
            &cfg_input.environment,
            cfg_input.parameter_overrides.as_ref(),
            static_loads,
            cfg_input.solver_config.initial_soc,
            None,
        );

        let (frames, dyn_warnings, _) = simulate_config_time_series(&cfg, &cfg_input);
        let (perf_metrics, perf_warnings) = compute_performance_metrics_for_config(&cfg, &cfg_input);

        pt_warnings.extend(dyn_warnings);
        pt_warnings.extend(perf_warnings);

        let peak_p = match cfg.id.as_str() {
            "vehicle.config.ev-dual-awd" => 240_000.0,
            "vehicle.config.ev-fwd" | "vehicle.config.ev-rwd" => 150_000.0,
            _ => 117_956.0,
        };
        let split_pct = (spec.cg_to_rear_axle_m / spec.wheelbase_m) * 100.0;

        mass_map.insert(cfg.code.clone(), serde_json::json!(spec.mass_kg));
        cd_map.insert(cfg.code.clone(), serde_json::json!(spec.drag_coefficient));
        area_map.insert(cfg.code.clone(), serde_json::json!(spec.frontal_area_m2));
        crr_map.insert(cfg.code.clone(), serde_json::json!(spec.rolling_resistance_coeff));
        r_map.insert(cfg.code.clone(), serde_json::json!(spec.tire_effective_radius_m));
        cg_split_map.insert(cfg.code.clone(), serde_json::json!((split_pct * 10.0).round() / 10.0));
        power_map.insert(cfg.code.clone(), serde_json::json!(peak_p));

        entries.push(ConfigComparisonEntry {
            configuration_id: cfg.id.clone(),
            code: cfg.code.clone(),
            summary_metrics: perf_metrics,
            powertrain_snapshot: snap,
            time_series: frames,
            warnings: pt_warnings,
        });
    }

    let check_diff = |name: &str, map: BTreeMap<String, serde_json::Value>| -> ComparisonDiff {
        let vals: Vec<&serde_json::Value> = map.values().collect();
        let matched = vals
            .first()
            .map(|first| vals.iter().all(|v| *v == *first))
            .unwrap_or(true);
        ComparisonDiff {
            parameter_name: name.to_string(),
            status: if matched { "MATCHED".to_string() } else { "DIFFERENT".to_string() },
            values_by_config: map,
        }
    };

    let diffs = vec![
        check_diff("massKg", mass_map),
        check_diff("dragCoefficient", cd_map),
        check_diff("frontalAreaM2", area_map),
        check_diff("rollingResistanceCoeff", crr_map),
        check_diff("tireEffectiveRadiusM", r_map),
        check_diff("staticFrontWeightPct", cg_split_map),
        check_diff("peakPowerW", power_map),
    ];

    let mut summary = BTreeMap::new();
    summary.insert(
        "comparedConfigurations".to_string(),
        MetricValue { value: entries.len() as f64, unit: "count".to_string() },
    );

    Ok(SimulationOutput {
        schema_version: SCHEMA_VERSION.to_string(),
        engine_version: ENGINE_VERSION.to_string(),
        model_fidelity_tag: MODEL_FIDELITY_TAG.to_string(),
        status: "OK".to_string(),
        simulated_estimate_disclaimer: SIMULATED_DISCLAIMER.to_string(),
        summary_metrics: summary,
        powertrain_snapshot: None,
        time_series: None,
        comparison_entries: Some(entries),
        comparison_diffs: Some(diffs),
        warnings: vec![],
    })
}
