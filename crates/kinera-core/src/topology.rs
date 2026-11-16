use crate::contracts::{
    DiffMode, DriverInputs, DrivetrainPath, ErrorEnvelope, ParameterOverrides, PowertrainSpec,
    TopologySpec, VehicleConfiguration, VehicleSpecification,
};
use crate::make_error_envelope;
use std::collections::HashSet;

pub fn all_configuration_ids() -> Vec<String> {
    vec![
        "vehicle.config.ice-fwd".to_string(),
        "vehicle.config.ice-rwd".to_string(),
        "vehicle.config.ice-awd".to_string(),
        "vehicle.config.ice-4wd".to_string(),
        "vehicle.config.ev-fwd".to_string(),
        "vehicle.config.ev-rwd".to_string(),
        "vehicle.config.ev-dual-awd".to_string(),
    ]
}

pub fn apply_overrides(
    base: &VehicleSpecification,
    overrides: Option<&ParameterOverrides>,
) -> VehicleSpecification {
    let mut spec = base.clone();
    if let Some(ov) = overrides {
        if let Some(v) = ov.mass_kg {
            spec.mass_kg = v;
        }
        if let Some(v) = ov.drag_coefficient {
            spec.drag_coefficient = v;
        }
        if let Some(v) = ov.frontal_area_m2 {
            spec.frontal_area_m2 = v;
        }
        if let Some(v) = ov.rolling_resistance_coeff {
            spec.rolling_resistance_coeff = v;
        }
        if let Some(v) = ov.tire_effective_radius_m {
            spec.tire_effective_radius_m = v;
        }
        if let Some(v) = ov.cg_height_m {
            spec.cg_height_m = v;
        }
        if let Some(v) = ov.wheelbase_m {
            let ratio_a = spec.cg_to_front_axle_m / spec.wheelbase_m.max(0.5);
            spec.wheelbase_m = v;
            if ov.cg_to_front_axle_m.is_none() {
                spec.cg_to_front_axle_m = (v * ratio_a).clamp(0.15, v - 0.15);
                spec.cg_to_rear_axle_m = v - spec.cg_to_front_axle_m;
            }
        }
        if let Some(v) = ov.cg_to_front_axle_m {
            let clamped = v.clamp(0.15, spec.wheelbase_m - 0.15);
            spec.cg_to_front_axle_m = clamped;
            spec.cg_to_rear_axle_m = spec.wheelbase_m - clamped;
        }
        if let Some(v) = ov.track_width_m {
            spec.track_width_m = v;
        }
        if let Some(v) = ov.yaw_inertia_kg_m2 {
            spec.yaw_inertia_kg_m2 = v;
        }
        if let Some(v) = ov.front_axle_cornering_stiffness_n_per_rad {
            spec.front_axle_cornering_stiffness_n_per_rad = v;
        }
        if let Some(v) = ov.rear_axle_cornering_stiffness_n_per_rad {
            spec.rear_axle_cornering_stiffness_n_per_rad = v;
        }
    }
    spec
}

pub fn get_canonical_configuration(id: &str) -> Option<VehicleConfiguration> {
    match id {
        "vehicle.config.ice-fwd" => Some(VehicleConfiguration {
            id: id.to_string(),
            schema_version: "1.0.0".to_string(),
            code: "ICE-FWD".to_string(),
            name: "ICE Front-Wheel Drive (Transverse Transaxle)".to_string(),
            powertrain_type: "ice".to_string(),
            drivetrain_layout: "fwd".to_string(),
            specification: VehicleSpecification {
                mass_kg: 1380.0,
                wheelbase_m: 2.70,
                track_width_m: 1.56,
                cg_height_m: 0.54,
                cg_to_front_axle_m: 1.08,
                cg_to_rear_axle_m: 1.62,
                yaw_inertia_kg_m2: 2150.0,
                drag_coefficient: 0.29,
                frontal_area_m2: 2.25,
                rolling_resistance_coeff: 0.011,
                tire_effective_radius_m: 0.315,
                front_axle_cornering_stiffness_n_per_rad: 65000.0,
                rear_axle_cornering_stiffness_n_per_rad: 68000.0,
            },
            powertrain: PowertrainSpec {
                id: "ice.engine.model-i4-2000cc".to_string(),
                propulsion_kind: "ice".to_string(),
                engine_model_id: Some("ice.engine.model-i4-2000cc".to_string()),
                motor_model_ids: vec![],
                transmission_model_id: "ice.transmission.transaxle".to_string(),
                differential_model_ids: vec!["drivetrain.fwd.front-differential".to_string()],
                battery_capacity_j: None,
                nominal_voltage_v: None,
                internal_resistance_ohm: None,
                inverter_efficiency: None,
            },
            topology: TopologySpec {
                placement: "front-transverse".to_string(),
                driven_axles: vec!["front".to_string()],
                steered_axles: vec!["front".to_string()],
                has_mechanical_center_coupling: false,
                has_low_range_transfer_case: false,
                paths: vec![DrivetrainPath {
                    id: "path-ice-fwd-front".to_string(),
                    axle_target: "front".to_string(),
                    ordered_component_ids: vec![
                        "ice.engine.assembly".to_string(),
                        "ice.clutch.flywheel".to_string(),
                        "ice.clutch.disc-pressure-plate".to_string(),
                        "ice.transmission.transaxle".to_string(),
                        "drivetrain.fwd.front-differential".to_string(),
                        "drivetrain.common.cv-joint".to_string(),
                        "drivetrain.common.axle-shaft-front-left".to_string(),
                        "vehicle.axle.front".to_string(),
                    ],
                    stage_efficiencies: vec![0.96, 0.99],
                }],
            },
            component_ids: vec![
                "vehicle.structure.unibody".to_string(),
                "ice.engine.assembly".to_string(),
                "ice.clutch.flywheel".to_string(),
                "ice.clutch.disc-pressure-plate".to_string(),
                "ice.transmission.transaxle".to_string(),
                "drivetrain.fwd.front-differential".to_string(),
                "drivetrain.common.cv-joint".to_string(),
                "drivetrain.common.axle-shaft-front-left".to_string(),
                "drivetrain.common.axle-shaft-front-right".to_string(),
                "vehicle.axle.front".to_string(),
                "vehicle.axle.rear".to_string(),
            ],
            supported_diff_modes: vec![DiffMode::Open, DiffMode::Lsd, DiffMode::Locked],
            supported_simulation_modules: vec![
                "powertrain".to_string(),
                "dynamics".to_string(),
                "comparison".to_string(),
            ],
            root_assembly_asset_id: "asset.ice.drivetrain-fwd-transaxle".to_string(),
        }),
        "vehicle.config.ice-rwd" => Some(VehicleConfiguration {
            id: id.to_string(),
            schema_version: "1.0.0".to_string(),
            code: "ICE-RWD".to_string(),
            name: "ICE Rear-Wheel Drive (Front Longitudinal)".to_string(),
            powertrain_type: "ice".to_string(),
            drivetrain_layout: "rwd".to_string(),
            specification: VehicleSpecification {
                mass_kg: 1420.0,
                wheelbase_m: 2.70,
                track_width_m: 1.56,
                cg_height_m: 0.54,
                cg_to_front_axle_m: 1.296,
                cg_to_rear_axle_m: 1.404,
                yaw_inertia_kg_m2: 2280.0,
                drag_coefficient: 0.29,
                frontal_area_m2: 2.25,
                rolling_resistance_coeff: 0.011,
                tire_effective_radius_m: 0.315,
                front_axle_cornering_stiffness_n_per_rad: 65000.0,
                rear_axle_cornering_stiffness_n_per_rad: 70000.0,
            },
            powertrain: PowertrainSpec {
                id: "ice.engine.model-i4-2000cc".to_string(),
                propulsion_kind: "ice".to_string(),
                engine_model_id: Some("ice.engine.model-i4-2000cc".to_string()),
                motor_model_ids: vec![],
                transmission_model_id: "ice.transmission.manual.gear-set".to_string(),
                differential_model_ids: vec!["drivetrain.rwd.rear-differential".to_string()],
                battery_capacity_j: None,
                nominal_voltage_v: None,
                internal_resistance_ohm: None,
                inverter_efficiency: None,
            },
            topology: TopologySpec {
                placement: "front-longitudinal".to_string(),
                driven_axles: vec!["rear".to_string()],
                steered_axles: vec!["front".to_string()],
                has_mechanical_center_coupling: false,
                has_low_range_transfer_case: false,
                paths: vec![DrivetrainPath {
                    id: "path-ice-rwd-rear".to_string(),
                    axle_target: "rear".to_string(),
                    ordered_component_ids: vec![
                        "ice.engine.assembly".to_string(),
                        "ice.clutch.flywheel".to_string(),
                        "ice.clutch.disc-pressure-plate".to_string(),
                        "ice.transmission.manual.gear-set".to_string(),
                        "drivetrain.common.universal-joint".to_string(),
                        "drivetrain.common.driveshaft-main".to_string(),
                        "drivetrain.rwd.rear-differential".to_string(),
                        "drivetrain.common.axle-shaft-rear-left".to_string(),
                        "vehicle.axle.rear".to_string(),
                    ],
                    stage_efficiencies: vec![0.97, 0.955, 0.99],
                }],
            },
            component_ids: vec![
                "vehicle.structure.unibody".to_string(),
                "ice.engine.assembly".to_string(),
                "ice.clutch.flywheel".to_string(),
                "ice.clutch.disc-pressure-plate".to_string(),
                "ice.transmission.manual.gear-set".to_string(),
                "drivetrain.common.universal-joint".to_string(),
                "drivetrain.common.driveshaft-main".to_string(),
                "drivetrain.rwd.rear-differential".to_string(),
                "drivetrain.common.axle-shaft-rear-left".to_string(),
                "drivetrain.common.axle-shaft-rear-right".to_string(),
                "vehicle.axle.front".to_string(),
                "vehicle.axle.rear".to_string(),
            ],
            supported_diff_modes: vec![DiffMode::Open, DiffMode::Lsd, DiffMode::Locked],
            supported_simulation_modules: vec![
                "powertrain".to_string(),
                "dynamics".to_string(),
                "comparison".to_string(),
            ],
            root_assembly_asset_id: "asset.ice.drivetrain-rwd".to_string(),
        }),
        "vehicle.config.ice-awd" => Some(VehicleConfiguration {
            id: id.to_string(),
            schema_version: "1.0.0".to_string(),
            code: "ICE-AWD".to_string(),
            name: "ICE All-Wheel Drive (Center Differential)".to_string(),
            powertrain_type: "ice".to_string(),
            drivetrain_layout: "awd".to_string(),
            specification: VehicleSpecification {
                mass_kg: 1520.0,
                wheelbase_m: 2.70,
                track_width_m: 1.56,
                cg_height_m: 0.55,
                cg_to_front_axle_m: 1.188,
                cg_to_rear_axle_m: 1.512,
                yaw_inertia_kg_m2: 2480.0,
                drag_coefficient: 0.30,
                frontal_area_m2: 2.30,
                rolling_resistance_coeff: 0.012,
                tire_effective_radius_m: 0.315,
                front_axle_cornering_stiffness_n_per_rad: 68000.0,
                rear_axle_cornering_stiffness_n_per_rad: 70000.0,
            },
            powertrain: PowertrainSpec {
                id: "ice.engine.model-i4-2000cc".to_string(),
                propulsion_kind: "ice".to_string(),
                engine_model_id: Some("ice.engine.model-i4-2000cc".to_string()),
                motor_model_ids: vec![],
                transmission_model_id: "ice.transmission.manual.gear-set".to_string(),
                differential_model_ids: vec![
                    "drivetrain.awd.center-differential".to_string(),
                    "drivetrain.awd.front-differential".to_string(),
                    "drivetrain.awd.rear-differential".to_string(),
                ],
                battery_capacity_j: None,
                nominal_voltage_v: None,
                internal_resistance_ohm: None,
                inverter_efficiency: None,
            },
            topology: TopologySpec {
                placement: "front-longitudinal".to_string(),
                driven_axles: vec!["front".to_string(), "rear".to_string()],
                steered_axles: vec!["front".to_string()],
                has_mechanical_center_coupling: true,
                has_low_range_transfer_case: false,
                paths: vec![
                    DrivetrainPath {
                        id: "path-ice-awd-front".to_string(),
                        axle_target: "front".to_string(),
                        ordered_component_ids: vec![
                            "ice.engine.assembly".to_string(),
                            "ice.clutch.flywheel".to_string(),
                            "ice.clutch.disc-pressure-plate".to_string(),
                            "ice.transmission.manual.gear-set".to_string(),
                            "drivetrain.awd.center-differential".to_string(),
                            "drivetrain.common.driveshaft-front".to_string(),
                            "drivetrain.awd.front-differential".to_string(),
                            "drivetrain.common.axle-shaft-front-left".to_string(),
                            "vehicle.axle.front".to_string(),
                        ],
                        stage_efficiencies: vec![0.96, 0.97, 0.955, 0.99],
                    },
                    DrivetrainPath {
                        id: "path-ice-awd-rear".to_string(),
                        axle_target: "rear".to_string(),
                        ordered_component_ids: vec![
                            "ice.engine.assembly".to_string(),
                            "ice.clutch.flywheel".to_string(),
                            "ice.clutch.disc-pressure-plate".to_string(),
                            "ice.transmission.manual.gear-set".to_string(),
                            "drivetrain.awd.center-differential".to_string(),
                            "drivetrain.common.driveshaft-rear".to_string(),
                            "drivetrain.awd.rear-differential".to_string(),
                            "drivetrain.common.axle-shaft-rear-left".to_string(),
                            "vehicle.axle.rear".to_string(),
                        ],
                        stage_efficiencies: vec![0.96, 0.97, 0.955, 0.99],
                    },
                ],
            },
            component_ids: vec![
                "vehicle.structure.unibody".to_string(),
                "ice.engine.assembly".to_string(),
                "ice.clutch.flywheel".to_string(),
                "ice.clutch.disc-pressure-plate".to_string(),
                "ice.transmission.manual.gear-set".to_string(),
                "drivetrain.awd.center-differential".to_string(),
                "drivetrain.common.driveshaft-front".to_string(),
                "drivetrain.common.driveshaft-rear".to_string(),
                "drivetrain.awd.front-differential".to_string(),
                "drivetrain.awd.rear-differential".to_string(),
                "drivetrain.common.axle-shaft-front-left".to_string(),
                "drivetrain.common.axle-shaft-rear-left".to_string(),
                "vehicle.axle.front".to_string(),
                "vehicle.axle.rear".to_string(),
            ],
            supported_diff_modes: vec![
                DiffMode::CenterDiff,
                DiffMode::Open,
                DiffMode::Lsd,
                DiffMode::Locked,
            ],
            supported_simulation_modules: vec![
                "powertrain".to_string(),
                "dynamics".to_string(),
                "comparison".to_string(),
            ],
            root_assembly_asset_id: "asset.ice.drivetrain-awd".to_string(),
        }),
        "vehicle.config.ice-4wd" => Some(VehicleConfiguration {
            id: id.to_string(),
            schema_version: "1.0.0".to_string(),
            code: "ICE-4WD".to_string(),
            name: "ICE Four-Wheel Drive (Transfer Case 2H/4H/4L)".to_string(),
            powertrain_type: "ice".to_string(),
            drivetrain_layout: "4wd".to_string(),
            specification: VehicleSpecification {
                mass_kg: 1880.0,
                wheelbase_m: 2.85,
                track_width_m: 1.60,
                cg_height_m: 0.65,
                cg_to_front_axle_m: 1.311,
                cg_to_rear_axle_m: 1.539,
                yaw_inertia_kg_m2: 3450.0,
                drag_coefficient: 0.36,
                frontal_area_m2: 2.55,
                rolling_resistance_coeff: 0.014,
                tire_effective_radius_m: 0.365,
                front_axle_cornering_stiffness_n_per_rad: 62000.0,
                rear_axle_cornering_stiffness_n_per_rad: 66000.0,
            },
            powertrain: PowertrainSpec {
                id: "ice.engine.model-i4-2000cc".to_string(),
                propulsion_kind: "ice".to_string(),
                engine_model_id: Some("ice.engine.model-i4-2000cc".to_string()),
                motor_model_ids: vec![],
                transmission_model_id: "ice.transmission.manual.gear-set".to_string(),
                differential_model_ids: vec![
                    "drivetrain.4wd.transfer-case".to_string(),
                    "drivetrain.4wd.front-differential".to_string(),
                    "drivetrain.4wd.rear-differential".to_string(),
                ],
                battery_capacity_j: None,
                nominal_voltage_v: None,
                internal_resistance_ohm: None,
                inverter_efficiency: None,
            },
            topology: TopologySpec {
                placement: "front-longitudinal".to_string(),
                driven_axles: vec!["front".to_string(), "rear".to_string()],
                steered_axles: vec!["front".to_string()],
                has_mechanical_center_coupling: true,
                has_low_range_transfer_case: true,
                paths: vec![
                    DrivetrainPath {
                        id: "path-ice-4wd-front".to_string(),
                        axle_target: "front".to_string(),
                        ordered_component_ids: vec![
                            "ice.engine.assembly".to_string(),
                            "ice.clutch.flywheel".to_string(),
                            "ice.clutch.disc-pressure-plate".to_string(),
                            "ice.transmission.manual.gear-set".to_string(),
                            "drivetrain.4wd.transfer-case".to_string(),
                            "drivetrain.common.driveshaft-front".to_string(),
                            "drivetrain.4wd.front-differential".to_string(),
                            "drivetrain.common.axle-shaft-front-left".to_string(),
                            "vehicle.axle.front".to_string(),
                        ],
                        stage_efficiencies: vec![0.97, 0.97, 0.955, 0.99],
                    },
                    DrivetrainPath {
                        id: "path-ice-4wd-rear".to_string(),
                        axle_target: "rear".to_string(),
                        ordered_component_ids: vec![
                            "ice.engine.assembly".to_string(),
                            "ice.clutch.flywheel".to_string(),
                            "ice.clutch.disc-pressure-plate".to_string(),
                            "ice.transmission.manual.gear-set".to_string(),
                            "drivetrain.4wd.transfer-case".to_string(),
                            "drivetrain.common.driveshaft-rear".to_string(),
                            "drivetrain.4wd.rear-differential".to_string(),
                            "drivetrain.common.axle-shaft-rear-left".to_string(),
                            "vehicle.axle.rear".to_string(),
                        ],
                        stage_efficiencies: vec![0.97, 0.97, 0.955, 0.99],
                    },
                ],
            },
            component_ids: vec![
                "vehicle.structure.ladder-frame".to_string(),
                "ice.engine.assembly".to_string(),
                "ice.clutch.flywheel".to_string(),
                "ice.clutch.disc-pressure-plate".to_string(),
                "ice.transmission.manual.gear-set".to_string(),
                "drivetrain.4wd.transfer-case".to_string(),
                "drivetrain.common.driveshaft-front".to_string(),
                "drivetrain.common.driveshaft-rear".to_string(),
                "drivetrain.4wd.front-differential".to_string(),
                "drivetrain.4wd.rear-differential".to_string(),
                "vehicle.axle.front".to_string(),
                "vehicle.axle.rear".to_string(),
            ],
            supported_diff_modes: vec![DiffMode::Locked, DiffMode::Open, DiffMode::Lsd],
            supported_simulation_modules: vec![
                "powertrain".to_string(),
                "dynamics".to_string(),
                "comparison".to_string(),
            ],
            root_assembly_asset_id: "asset.ice.drivetrain-4wd".to_string(),
        }),
        "vehicle.config.ev-fwd" => Some(VehicleConfiguration {
            id: id.to_string(),
            schema_version: "1.0.0".to_string(),
            code: "EV-FWD".to_string(),
            name: "EV Front-Wheel Drive (Front E-Axle)".to_string(),
            powertrain_type: "ev".to_string(),
            drivetrain_layout: "fwd".to_string(),
            specification: VehicleSpecification {
                mass_kg: 1660.0,
                wheelbase_m: 2.70,
                track_width_m: 1.56,
                cg_height_m: 0.48,
                cg_to_front_axle_m: 1.269,
                cg_to_rear_axle_m: 1.431,
                yaw_inertia_kg_m2: 2620.0,
                drag_coefficient: 0.26,
                frontal_area_m2: 2.25,
                rolling_resistance_coeff: 0.010,
                tire_effective_radius_m: 0.315,
                front_axle_cornering_stiffness_n_per_rad: 70000.0,
                rear_axle_cornering_stiffness_n_per_rad: 72000.0,
            },
            powertrain: PowertrainSpec {
                id: "ev.motor.model-pmsm-150kw".to_string(),
                propulsion_kind: "ev_single".to_string(),
                engine_model_id: None,
                motor_model_ids: vec!["ev.motor.model-pmsm-150kw".to_string()],
                transmission_model_id: "ev.transmission.reduction-gearbox-front".to_string(),
                differential_model_ids: vec!["drivetrain.ev.front-differential".to_string()],
                battery_capacity_j: Some(230_400_000.0),
                nominal_voltage_v: Some(400.0),
                internal_resistance_ohm: Some(0.065),
                inverter_efficiency: Some(0.96),
            },
            topology: TopologySpec {
                placement: "front-transverse".to_string(),
                driven_axles: vec!["front".to_string()],
                steered_axles: vec!["front".to_string()],
                has_mechanical_center_coupling: false,
                has_low_range_transfer_case: false,
                paths: vec![DrivetrainPath {
                    id: "path-ev-fwd-front".to_string(),
                    axle_target: "front".to_string(),
                    ordered_component_ids: vec![
                        "ev.battery.pack".to_string(),
                        "ev.bms.controller".to_string(),
                        "ev.hv.pdu-cabling".to_string(),
                        "ev.inverter.front".to_string(),
                        "ev.motor.front".to_string(),
                        "ev.transmission.reduction-gearbox-front".to_string(),
                        "drivetrain.ev.front-differential".to_string(),
                        "drivetrain.common.axle-shaft-front-left".to_string(),
                        "vehicle.axle.front".to_string(),
                    ],
                    stage_efficiencies: vec![0.95, 0.99],
                }],
            },
            component_ids: vec![
                "vehicle.structure.unibody".to_string(),
                "ev.battery.pack".to_string(),
                "ev.bms.controller".to_string(),
                "ev.hv.pdu-cabling".to_string(),
                "ev.inverter.front".to_string(),
                "ev.motor.front".to_string(),
                "ev.transmission.reduction-gearbox-front".to_string(),
                "drivetrain.ev.front-differential".to_string(),
                "drivetrain.common.axle-shaft-front-left".to_string(),
                "drivetrain.common.axle-shaft-front-right".to_string(),
                "vehicle.axle.front".to_string(),
                "vehicle.axle.rear".to_string(),
            ],
            supported_diff_modes: vec![DiffMode::Open, DiffMode::Lsd, DiffMode::Locked],
            supported_simulation_modules: vec![
                "powertrain".to_string(),
                "dynamics".to_string(),
                "comparison".to_string(),
            ],
            root_assembly_asset_id: "asset.ev.e-axle-front".to_string(),
        }),
        "vehicle.config.ev-rwd" => Some(VehicleConfiguration {
            id: id.to_string(),
            schema_version: "1.0.0".to_string(),
            code: "EV-RWD".to_string(),
            name: "EV Rear-Wheel Drive (Rear E-Axle)".to_string(),
            powertrain_type: "ev".to_string(),
            drivetrain_layout: "rwd".to_string(),
            specification: VehicleSpecification {
                mass_kg: 1680.0,
                wheelbase_m: 2.70,
                track_width_m: 1.56,
                cg_height_m: 0.48,
                cg_to_front_axle_m: 1.404,
                cg_to_rear_axle_m: 1.296,
                yaw_inertia_kg_m2: 2650.0,
                drag_coefficient: 0.25,
                frontal_area_m2: 2.25,
                rolling_resistance_coeff: 0.010,
                tire_effective_radius_m: 0.315,
                front_axle_cornering_stiffness_n_per_rad: 70000.0,
                rear_axle_cornering_stiffness_n_per_rad: 74000.0,
            },
            powertrain: PowertrainSpec {
                id: "ev.motor.model-pmsm-150kw".to_string(),
                propulsion_kind: "ev_single".to_string(),
                engine_model_id: None,
                motor_model_ids: vec!["ev.motor.model-pmsm-150kw".to_string()],
                transmission_model_id: "ev.transmission.reduction-gearbox-rear".to_string(),
                differential_model_ids: vec!["drivetrain.ev.rear-differential".to_string()],
                battery_capacity_j: Some(230_400_000.0),
                nominal_voltage_v: Some(400.0),
                internal_resistance_ohm: Some(0.065),
                inverter_efficiency: Some(0.96),
            },
            topology: TopologySpec {
                placement: "rear-axle".to_string(),
                driven_axles: vec!["rear".to_string()],
                steered_axles: vec!["front".to_string()],
                has_mechanical_center_coupling: false,
                has_low_range_transfer_case: false,
                paths: vec![DrivetrainPath {
                    id: "path-ev-rwd-rear".to_string(),
                    axle_target: "rear".to_string(),
                    ordered_component_ids: vec![
                        "ev.battery.pack".to_string(),
                        "ev.bms.controller".to_string(),
                        "ev.hv.pdu-cabling".to_string(),
                        "ev.inverter.rear".to_string(),
                        "ev.motor.rear".to_string(),
                        "ev.transmission.reduction-gearbox-rear".to_string(),
                        "drivetrain.ev.rear-differential".to_string(),
                        "drivetrain.common.axle-shaft-rear-left".to_string(),
                        "vehicle.axle.rear".to_string(),
                    ],
                    stage_efficiencies: vec![0.95, 0.99],
                }],
            },
            component_ids: vec![
                "vehicle.structure.unibody".to_string(),
                "ev.battery.pack".to_string(),
                "ev.bms.controller".to_string(),
                "ev.hv.pdu-cabling".to_string(),
                "ev.inverter.rear".to_string(),
                "ev.motor.rear".to_string(),
                "ev.transmission.reduction-gearbox-rear".to_string(),
                "drivetrain.ev.rear-differential".to_string(),
                "drivetrain.common.axle-shaft-rear-left".to_string(),
                "drivetrain.common.axle-shaft-rear-right".to_string(),
                "vehicle.axle.front".to_string(),
                "vehicle.axle.rear".to_string(),
            ],
            supported_diff_modes: vec![DiffMode::Open, DiffMode::Lsd, DiffMode::Locked],
            supported_simulation_modules: vec![
                "powertrain".to_string(),
                "dynamics".to_string(),
                "comparison".to_string(),
            ],
            root_assembly_asset_id: "asset.ev.e-axle-rear".to_string(),
        }),
        "vehicle.config.ev-dual-awd" => Some(VehicleConfiguration {
            id: id.to_string(),
            schema_version: "1.0.0".to_string(),
            code: "EV-DUAL-AWD".to_string(),
            name: "EV Dual-Motor All-Wheel Drive".to_string(),
            powertrain_type: "ev".to_string(),
            drivetrain_layout: "dual-awd".to_string(),
            specification: VehicleSpecification {
                mass_kg: 1840.0,
                wheelbase_m: 2.70,
                track_width_m: 1.56,
                cg_height_m: 0.48,
                cg_to_front_axle_m: 1.35,
                cg_to_rear_axle_m: 1.35,
                yaw_inertia_kg_m2: 2950.0,
                drag_coefficient: 0.26,
                frontal_area_m2: 2.28,
                rolling_resistance_coeff: 0.010,
                tire_effective_radius_m: 0.315,
                front_axle_cornering_stiffness_n_per_rad: 73000.0,
                rear_axle_cornering_stiffness_n_per_rad: 75000.0,
            },
            powertrain: PowertrainSpec {
                id: "ev.motor.model-pmsm-150kw".to_string(),
                propulsion_kind: "ev_dual".to_string(),
                engine_model_id: None,
                motor_model_ids: vec![
                    "ev.motor.model-pmsm-110kw".to_string(),
                    "ev.motor.model-pmsm-150kw".to_string(),
                ],
                transmission_model_id: "ev.transmission.reduction-gearbox-rear".to_string(),
                differential_model_ids: vec![
                    "drivetrain.ev.front-differential".to_string(),
                    "drivetrain.ev.rear-differential".to_string(),
                ],
                battery_capacity_j: Some(278_640_000.0),
                nominal_voltage_v: Some(400.0),
                internal_resistance_ohm: Some(0.055),
                inverter_efficiency: Some(0.96),
            },
            topology: TopologySpec {
                placement: "dual-axle".to_string(),
                driven_axles: vec!["front".to_string(), "rear".to_string()],
                steered_axles: vec!["front".to_string()],
                has_mechanical_center_coupling: false,
                has_low_range_transfer_case: false,
                paths: vec![
                    DrivetrainPath {
                        id: "path-ev-dual-front".to_string(),
                        axle_target: "front".to_string(),
                        ordered_component_ids: vec![
                            "ev.battery.pack".to_string(),
                            "ev.bms.controller".to_string(),
                            "ev.hv.pdu-cabling".to_string(),
                            "ev.inverter.front".to_string(),
                            "ev.motor.front".to_string(),
                            "ev.transmission.reduction-gearbox-front".to_string(),
                            "drivetrain.ev.front-differential".to_string(),
                            "drivetrain.common.axle-shaft-front-left".to_string(),
                            "vehicle.axle.front".to_string(),
                        ],
                        stage_efficiencies: vec![0.95, 0.99],
                    },
                    DrivetrainPath {
                        id: "path-ev-dual-rear".to_string(),
                        axle_target: "rear".to_string(),
                        ordered_component_ids: vec![
                            "ev.battery.pack".to_string(),
                            "ev.bms.controller".to_string(),
                            "ev.hv.pdu-cabling".to_string(),
                            "ev.inverter.rear".to_string(),
                            "ev.motor.rear".to_string(),
                            "ev.transmission.reduction-gearbox-rear".to_string(),
                            "drivetrain.ev.rear-differential".to_string(),
                            "drivetrain.common.axle-shaft-rear-left".to_string(),
                            "vehicle.axle.rear".to_string(),
                        ],
                        stage_efficiencies: vec![0.95, 0.99],
                    },
                ],
            },
            component_ids: vec![
                "vehicle.structure.unibody".to_string(),
                "ev.battery.pack".to_string(),
                "ev.bms.controller".to_string(),
                "ev.hv.pdu-cabling".to_string(),
                "ev.inverter.front".to_string(),
                "ev.inverter.rear".to_string(),
                "ev.motor.front".to_string(),
                "ev.motor.rear".to_string(),
                "ev.transmission.reduction-gearbox-front".to_string(),
                "ev.transmission.reduction-gearbox-rear".to_string(),
                "drivetrain.ev.front-differential".to_string(),
                "drivetrain.ev.rear-differential".to_string(),
                "vehicle.axle.front".to_string(),
                "vehicle.axle.rear".to_string(),
            ],
            supported_diff_modes: vec![
                DiffMode::EvElectronic,
                DiffMode::Open,
                DiffMode::Lsd,
                DiffMode::Locked,
            ],
            supported_simulation_modules: vec![
                "powertrain".to_string(),
                "dynamics".to_string(),
                "comparison".to_string(),
            ],
            root_assembly_asset_id: "asset.ev.battery-skate-pack".to_string(),
        }),
        _ => None,
    }
}

pub fn validate_vehicle_configuration(cfg: &VehicleConfiguration) -> Result<(), ErrorEnvelope> {
    if !all_configuration_ids().contains(&cfg.id) {
        return Err(make_error_envelope(
            "ERR_TOPO_UNSUPPORTED_CONFIG",
            "VALIDATION",
            format!("Unsupported configuration ID '{}'.", cfg.id),
            Some("id"),
            true,
        ));
    }

    if cfg.powertrain_type == "ev" && cfg.topology.has_low_range_transfer_case {
        return Err(make_error_envelope(
            "ERR_TOPO_UNSUPPORTED_CONFIG",
            "VALIDATION",
            "EV configuration cannot have a mechanical low-range transfer case.".to_string(),
            Some("topology.hasLowRangeTransferCase"),
            true,
        ));
    }

    if cfg.topology.paths.is_empty() {
        return Err(make_error_envelope(
            "ERR_TOPO_DISCONNECTED_PATH",
            "VALIDATION",
            "Topology must define at least one drivetrain path.".to_string(),
            Some("topology.paths"),
            true,
        ));
    }

    for path in &cfg.topology.paths {
        if path.ordered_component_ids.len() < 2 {
            return Err(make_error_envelope(
                "ERR_TOPO_DISCONNECTED_PATH",
                "VALIDATION",
                format!("Path '{}' has fewer than 2 nodes.", path.id),
                Some("topology.paths"),
                true,
            ));
        }
        let mut seen = HashSet::new();
        for comp in &path.ordered_component_ids {
            if !seen.insert(comp) {
                return Err(make_error_envelope(
                    "ERR_TOPO_DISCONNECTED_PATH",
                    "VALIDATION",
                    format!("Cycle or duplicate component '{comp}' detected in path '{}'.", path.id),
                    Some("topology.paths"),
                    true,
                ));
            }
        }
        let expected_end = if path.axle_target == "front" {
            "vehicle.axle.front"
        } else {
            "vehicle.axle.rear"
        };
        if path.ordered_component_ids.last().map(|s| s.as_str()) != Some(expected_end) {
            return Err(make_error_envelope(
                "ERR_TOPO_DISCONNECTED_PATH",
                "VALIDATION",
                format!("Path '{}' does not terminate at '{expected_end}'.", path.id),
                Some("topology.paths"),
                true,
            ));
        }

        // Layout-specific connectivity checks
        if cfg.id == "vehicle.config.ice-rwd"
            && !path
                .ordered_component_ids
                .iter()
                .any(|c| c == "drivetrain.common.driveshaft-main")
        {
            return Err(make_error_envelope(
                "ERR_TOPO_DISCONNECTED_PATH",
                "VALIDATION",
                "ICE-RWD path missing main longitudinal driveshaft.".to_string(),
                Some("topology.paths"),
                true,
            ));
        }

        for &eta in &path.stage_efficiencies {
            if !eta.is_finite() || eta <= 0.05 || eta > 1.0 {
                return Err(make_error_envelope(
                    "ERR_SIM_INVALID_EFFICIENCY",
                    "VALIDATION",
                    format!("Stage efficiency {eta} in path '{}' must be in (0.05, 1.0].", path.id),
                    Some("topology.paths.stageEfficiencies"),
                    true,
                ));
            }
        }
    }

    // Ensure every driven axle has a path
    for axle in &cfg.topology.driven_axles {
        if !cfg.topology.paths.iter().any(|p| &p.axle_target == axle) {
            return Err(make_error_envelope(
                "ERR_TOPO_DISCONNECTED_PATH",
                "VALIDATION",
                format!("Driven axle '{axle}' has no active drivetrain path."),
                Some("topology.paths"),
                true,
            ));
        }
    }

    Ok(())
}

pub fn validate_driver_inputs_for_config(
    cfg: &VehicleConfiguration,
    driver: &DriverInputs,
) -> Result<(), ErrorEnvelope> {
    if cfg.powertrain_type == "ev" {
        // EVs support single-speed forward (1), neutral (0), or reverse (-1)
        if !(-1..=1).contains(&driver.gear_index) {
            return Err(make_error_envelope(
                "ERR_SIM_INVALID_GEAR",
                "VALIDATION",
                format!(
                    "Single-speed EV configuration '{}' does not support stepped gearIndex {}.",
                    cfg.code, driver.gear_index
                ),
                Some("driverInputs.gearIndex"),
                true,
            ));
        }
    } else if !(-1..=6).contains(&driver.gear_index) {
        return Err(make_error_envelope(
            "ERR_SIM_INVALID_GEAR",
            "VALIDATION",
            format!(
                "6-speed manual configuration '{}' does not support gearIndex {}.",
                cfg.code, driver.gear_index
            ),
            Some("driverInputs.gearIndex"),
            true,
        ));
    }

    if driver.four_wd_mode.is_some() && !cfg.topology.has_low_range_transfer_case {
        return Err(make_error_envelope(
            "ERR_TOPO_UNSUPPORTED_CONFIG",
            "VALIDATION",
            format!(
                "Transfer case mode (2H/4H/4L) is only supported on ICE-4WD, not '{}'.",
                cfg.code
            ),
            Some("driverInputs.fourWdMode"),
            true,
        ));
    }

    Ok(())
}
