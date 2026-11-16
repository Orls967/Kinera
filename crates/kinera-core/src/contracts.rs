use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EngineMetadata {
    pub engine_version: String,
    pub schema_version: String,
    pub model_fidelity_tag: String,
    pub supported_configs: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ErrorEnvelope {
    pub error: Box<ErrorPayload>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ErrorPayload {
    pub code: String,
    pub category: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field_path: Option<String>,
    pub recoverable: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SimulationMode {
    SinglePointPowertrain,
    TimeSeriesDynamics,
    PerformanceBenchmark,
    MultiConfigComparison,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DiffMode {
    Open,
    Lsd,
    Locked,
    CenterDiff,
    EvElectronic,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum FourWdMode {
    #[serde(rename = "2H")]
    TwoH,
    #[serde(rename = "4H")]
    FourH,
    #[serde(rename = "4L")]
    FourL,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimulationInput {
    pub schema_version: String,
    pub mode: SimulationMode,
    pub configuration_ids: Vec<String>,
    #[serde(default)]
    pub parameter_overrides: Option<ParameterOverrides>,
    pub driver_inputs: DriverInputs,
    pub environment: EnvironmentInputs,
    pub solver_config: SolverConfig,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParameterOverrides {
    pub mass_kg: Option<f64>,
    pub drag_coefficient: Option<f64>,
    pub frontal_area_m2: Option<f64>,
    pub rolling_resistance_coeff: Option<f64>,
    pub tire_effective_radius_m: Option<f64>,
    pub cg_height_m: Option<f64>,
    pub wheelbase_m: Option<f64>,
    pub track_width_m: Option<f64>,
    pub cg_to_front_axle_m: Option<f64>,
    pub yaw_inertia_kg_m2: Option<f64>,
    pub front_axle_cornering_stiffness_n_per_rad: Option<f64>,
    pub rear_axle_cornering_stiffness_n_per_rad: Option<f64>,
    pub final_drive_ratio: Option<f64>,
    pub gear_ratio_override: Option<f64>,
    pub aggregate_efficiency_override: Option<f64>,
    pub battery_voltage_v: Option<f64>,
    pub front_brake_bias: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DriverInputs {
    pub throttle: f64,
    pub brake_demand: f64,
    pub steering_angle_rad: f64,
    pub gear_index: i32,
    pub prime_mover_rpm: Option<f64>,
    pub four_wd_mode: Option<FourWdMode>,
    pub diff_mode: DiffMode,
    pub ev_front_split: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnvironmentInputs {
    pub road_grade_rad: f64,
    pub air_density_kg_m3: f64,
    pub wheel_mu: [f64; 4],
    pub gravity_mps2: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SolverConfig {
    pub dt_sec: f64,
    pub duration_sec: f64,
    #[serde(default)]
    pub initial_speed_mps: f64,
    #[serde(default = "default_soc")]
    pub initial_soc: f64,
    #[serde(default = "default_true")]
    pub abs_conceptual_enabled: bool,
    pub matched_baseline_lock: bool,
}

fn default_soc() -> f64 {
    0.85
}

fn default_true() -> bool {
    true
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MetricValue {
    pub value: f64,
    pub unit: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PowertrainSnapshot {
    pub configuration_id: String,
    pub prime_mover_rpm: f64,
    pub prime_mover_omega_rad_s: f64,
    pub prime_mover_torque_nm: f64,
    pub prime_mover_power_w: f64,
    pub gearbox_output_torque_nm: Option<f64>,
    pub driveshaft_rpm: Option<f64>,
    pub axle_torques_nm: [f64; 2],
    pub wheel_torques_nm: [f64; 4],
    pub wheel_rpm: [f64; 4],
    pub tractive_force_total_n: f64,
    pub power_losses_w: f64,
    pub overall_efficiency: f64,
    pub battery_power_w: Option<f64>,
    pub battery_current_a: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TimeSeriesFrame {
    pub time_sec: f64,
    pub speed_mps: f64,
    pub distance_m: f64,
    pub accel_long_mps2: f64,
    pub accel_lat_mps2: f64,
    pub yaw_rate_rad_s: f64,
    pub sideslip_rad: f64,
    pub world_x_m: f64,
    pub world_y_m: f64,
    pub wheel_normal_loads_n: [f64; 4],
    pub tractive_force_n: f64,
    pub drag_force_n: f64,
    pub rolling_force_n: f64,
    pub grade_force_n: f64,
    pub slip_angle_front_rad: f64,
    pub slip_angle_rear_rad: f64,
    pub friction_utilization: [f64; 4],
    pub soc: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ComparisonDiff {
    pub parameter_name: String,
    pub status: String,
    pub values_by_config: BTreeMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfigComparisonEntry {
    pub configuration_id: String,
    pub code: String,
    pub summary_metrics: BTreeMap<String, MetricValue>,
    pub powertrain_snapshot: PowertrainSnapshot,
    pub time_series: Vec<TimeSeriesFrame>,
    pub warnings: Vec<SimulationWarning>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimulationWarning {
    pub code: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimulationOutput {
    pub schema_version: String,
    pub engine_version: String,
    pub model_fidelity_tag: String,
    pub status: String,
    pub simulated_estimate_disclaimer: String,
    pub summary_metrics: BTreeMap<String, MetricValue>,
    pub powertrain_snapshot: Option<PowertrainSnapshot>,
    pub time_series: Option<Vec<TimeSeriesFrame>>,
    pub comparison_entries: Option<Vec<ConfigComparisonEntry>>,
    pub comparison_diffs: Option<Vec<ComparisonDiff>>,
    pub warnings: Vec<SimulationWarning>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VehicleSpecification {
    pub mass_kg: f64,
    pub wheelbase_m: f64,
    pub track_width_m: f64,
    pub cg_height_m: f64,
    pub cg_to_front_axle_m: f64,
    pub cg_to_rear_axle_m: f64,
    pub yaw_inertia_kg_m2: f64,
    pub drag_coefficient: f64,
    pub frontal_area_m2: f64,
    pub rolling_resistance_coeff: f64,
    pub tire_effective_radius_m: f64,
    pub front_axle_cornering_stiffness_n_per_rad: f64,
    pub rear_axle_cornering_stiffness_n_per_rad: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PowertrainSpec {
    pub id: String,
    pub propulsion_kind: String,
    pub engine_model_id: Option<String>,
    pub motor_model_ids: Vec<String>,
    pub transmission_model_id: String,
    pub differential_model_ids: Vec<String>,
    pub battery_capacity_j: Option<f64>,
    pub nominal_voltage_v: Option<f64>,
    pub internal_resistance_ohm: Option<f64>,
    pub inverter_efficiency: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DrivetrainPath {
    pub id: String,
    pub axle_target: String,
    pub ordered_component_ids: Vec<String>,
    pub stage_efficiencies: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TopologySpec {
    pub placement: String,
    pub driven_axles: Vec<String>,
    pub steered_axles: Vec<String>,
    pub has_mechanical_center_coupling: bool,
    pub has_low_range_transfer_case: bool,
    pub paths: Vec<DrivetrainPath>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VehicleConfiguration {
    pub id: String,
    pub schema_version: String,
    pub code: String,
    pub name: String,
    pub powertrain_type: String,
    pub drivetrain_layout: String,
    pub specification: VehicleSpecification,
    pub powertrain: PowertrainSpec,
    pub topology: TopologySpec,
    pub component_ids: Vec<String>,
    pub supported_diff_modes: Vec<DiffMode>,
    pub supported_simulation_modules: Vec<String>,
    pub root_assembly_asset_id: String,
}
