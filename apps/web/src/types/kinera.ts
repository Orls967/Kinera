export type ConfigId =
  | 'vehicle.config.ice-fwd'
  | 'vehicle.config.ice-rwd'
  | 'vehicle.config.ice-awd'
  | 'vehicle.config.ice-4wd'
  | 'vehicle.config.ev-fwd'
  | 'vehicle.config.ev-rwd'
  | 'vehicle.config.ev-dual-awd';

export type PowertrainType = 'ice' | 'ev';
export type DrivetrainLayout = 'fwd' | 'rwd' | 'awd' | '4wd' | 'dual-awd';
export type DiffMode = 'open' | 'lsd' | 'locked' | 'center_diff' | 'ev_electronic';
export type FourWdMode = '2H' | '4H' | '4L';
export type UnitDisplayMode = 'si' | 'engineering';
export type QualityTier = 'high' | 'medium' | 'low';

export type SystemLayerId =
  | 'exterior'
  | 'structure'
  | 'powerplant'
  | 'drivetrain'
  | 'suspension'
  | 'braking'
  | 'wheels';

export type CameraPresetId =
  | 'isometric-front'
  | 'side-profile'
  | 'top-plan'
  | 'front-axle'
  | 'rear-axle'
  | 'underbody-drivetrain'
  | 'powertrain-focus';

export interface VehicleSpecification {
  massKg: number;
  wheelbaseM: number;
  trackWidthM: number;
  cgHeightM: number;
  cgToFrontAxleM: number;
  cgToRearAxleM: number;
  yawInertiaKgM2: number;
  dragCoefficient: number;
  frontalAreaM2: number;
  rollingResistanceCoeff: number;
  tireEffectiveRadiusM: number;
  frontAxleCorneringStiffnessNPerRad: number;
  rearAxleCorneringStiffnessNPerRad: number;
}

export interface PowertrainSpec {
  id: string;
  propulsionKind: 'ice' | 'ev_single' | 'ev_dual';
  engineModelId: string | null;
  motorModelIds: string[];
  transmissionModelId: string;
  differentialModelIds: string[];
  batteryCapacityJ: number | null;
  nominalVoltageV: number | null;
  internalResistanceOhm: number | null;
  inverterEfficiency: number | null;
}

export interface DrivetrainPath {
  id: string;
  axleTarget: 'front' | 'rear';
  orderedComponentIds: string[];
  stageEfficiencies: number[];
}

export interface TopologySpec {
  placement: 'front-transverse' | 'front-longitudinal' | 'rear-axle' | 'dual-axle';
  drivenAxles: ('front' | 'rear')[];
  steeredAxles: ['front'];
  hasMechanicalCenterCoupling: boolean;
  hasLowRangeTransferCase: boolean;
  paths: DrivetrainPath[];
}

export interface VehicleConfiguration {
  id: ConfigId;
  schemaVersion: string;
  code: 'ICE-FWD' | 'ICE-RWD' | 'ICE-AWD' | 'ICE-4WD' | 'EV-FWD' | 'EV-RWD' | 'EV-DUAL-AWD';
  name: string;
  powertrainType: PowertrainType;
  drivetrainLayout: DrivetrainLayout;
  specification: VehicleSpecification;
  powertrain: PowertrainSpec;
  topology: TopologySpec;
  componentIds: string[];
  supportedDiffModes: DiffMode[];
  supportedSimulationModules: ('powertrain' | 'dynamics' | 'comparison')[];
  rootAssemblyAssetId: string;
  architecturalVariations?: string[];
  learningFocus?: string;
}

export interface ValueWithUnit {
  value: number;
  unit: string;
}

export interface PortSpec {
  quantity: string;
  unit: string;
  sourceId?: string;
  targetId?: string;
}

export type RelationshipType =
  | 'mechanical_drive'
  | 'structural_mount'
  | 'electrical_hv_dc'
  | 'electrical_ac_phase'
  | 'control_signal'
  | 'hydraulic_pressure'
  | 'tire_road_contact';

export interface ComponentRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: RelationshipType;
  vehicleConfigurations: ConfigId[];
  transferredQuantity: string;
  bidirectional: boolean;
}

export interface ComponentMetadata {
  id: string;
  schemaVersion: string;
  name: string;
  kind: 'physical' | 'logical_subsystem' | 'assembly' | 'instance';
  category: string;
  layer: SystemLayerId;
  subsystemId: string;
  vehicleConfigurations: ConfigId[];
  description: string;
  primaryFunction: string;
  operatingPrinciple: string;
  inputs: PortSpec[];
  outputs: PortSpec[];
  physicalProperties?: Record<string, ValueWithUnit> | null;
  technicalSpecifications: Record<string, ValueWithUnit | string | null>;
  relationships: ComponentRelationship[];
  assetReferences: string[];
  animationReferences?: string[];
  engineeringReferences: string[];
}

export type EquationClass =
  | 'exact_identity'
  | 'idealized_model'
  | 'educational_approximation'
  | 'empirical_map';

export interface EngineeringEquation {
  id: string;
  name: string;
  domain: 'powertrain' | 'ev' | 'dynamics';
  latex: string;
  variables: { symbol: string; meaning: string; unit: string }[];
  modelClass: EquationClass;
  assumptions: string;
  validityLimits: string;
  referenceId: string;
}

export interface ReferenceSource {
  id: string;
  citation: string;
  primaryDomain: string;
  verificationStatus: 'VERIFIED' | 'VERIFICATION_REQUIRED';
}

export type InsightDomain =
  | 'powertrain-fundamentals'
  | 'vehicle-architecture'
  | 'vehicle-dynamics'
  | 'ev-engineering';

export interface LearningInsightTopic {
  id: string;
  schemaVersion: string;
  kind: 'insight_topic';
  group: InsightDomain;
  title: string;
  summary: string;
  learningObjectives: string[];
  prerequisites: string[];
  explanation: string[];
  equationIds: string[];
  componentIds: string[];
  simLink: {
    route: string;
    label: string;
    configId?: ConfigId;
    tab?: string;
  };
  workedExample: {
    prompt: string;
    resultSummary: string;
  };
  referenceIds: string[];
}

export interface TechnicalLibraryModule {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  overview: {
    scope: string;
    learningObjectives: string[];
    prerequisites: string[];
  };
  fundamentals: string[];
  componentIds: string[];
  operatingPrinciples: string[];
  equationIds: string[];
  engineeringApplications: string[];
  relatedSimulations: {
    title: string;
    description: string;
    route: string;
    configId: ConfigId;
  }[];
  glossaryTerms: { term: string; symbol?: string; unit?: string; definition: string }[];
  linkedInsightIds: string[];
  referenceIds: string[];
}

export type SimulationMode =
  | 'single_point_powertrain'
  | 'time_series_dynamics'
  | 'performance_benchmark'
  | 'multi_config_comparison';

export interface SimulationInput {
  schemaVersion: string;
  mode: SimulationMode;
  configurationIds: ConfigId[];
  parameterOverrides?: {
    massKg?: number;
    dragCoefficient?: number;
    frontalAreaM2?: number;
    rollingResistanceCoeff?: number;
    tireEffectiveRadiusM?: number;
    cgHeightM?: number;
    wheelbaseM?: number;
    trackWidthM?: number;
    cgToFrontAxleM?: number;
    yawInertiaKgM2?: number;
    frontAxleCorneringStiffnessNPerRad?: number;
    rearAxleCorneringStiffnessNPerRad?: number;
    finalDriveRatio?: number;
    gearRatioOverride?: number;
    aggregateEfficiencyOverride?: number | null;
    batteryVoltageV?: number;
    frontBrakeBias?: number;
  };
  driverInputs: {
    throttle: number;
    brakeDemand: number;
    steeringAngleRad: number;
    gearIndex: number;
    primeMoverRpm?: number | null;
    fourWdMode?: FourWdMode | null;
    diffMode: DiffMode;
    evFrontSplit?: number | null;
  };
  environment: {
    roadGradeRad: number;
    airDensityKgM3: number;
    wheelMu: [number, number, number, number];
    gravityMps2: number;
  };
  solverConfig: {
    dtSec: number;
    durationSec: number;
    initialSpeedMps?: number;
    initialSoc?: number;
    absConceptualEnabled?: boolean;
    matchedBaselineLock: boolean;
  };
}

export interface MetricValue {
  value: number;
  unit: string;
}

export interface PowertrainSnapshot {
  configurationId: ConfigId;
  primeMoverRpm: number;
  primeMoverOmegaRadS: number;
  primeMoverTorqueNm: number;
  primeMoverPowerW: number;
  gearboxOutputTorqueNm: number | null;
  driveshaftRpm: number | null;
  axleTorquesNm: [number, number];
  wheelTorquesNm: [number, number, number, number];
  wheelRpm: [number, number, number, number];
  tractiveForceTotalN: number;
  powerLossesW: number;
  overallEfficiency: number;
  batteryPowerW?: number | null;
  batteryCurrentA?: number | null;
}

export interface TimeSeriesFrame {
  timeSec: number;
  speedMps: number;
  distanceM: number;
  accelLongMps2: number;
  accelLatMps2: number;
  yawRateRadS: number;
  sideslipRad: number;
  worldXM: number;
  worldYM: number;
  wheelNormalLoadsN: [number, number, number, number];
  tractiveForceN: number;
  dragForceN: number;
  rollingForceN: number;
  gradeForceN: number;
  slipAngleFrontRad: number;
  slipAngleRearRad: number;
  frictionUtilization: [number, number, number, number];
  soc?: number | null;
}

export interface ComparisonDiff {
  parameterName: string;
  status: 'MATCHED' | 'DIFFERENT';
  valuesByConfig: Record<string, unknown>;
}

export interface ConfigComparisonEntry {
  configurationId: ConfigId;
  code: string;
  summaryMetrics: Record<string, MetricValue>;
  powertrainSnapshot: PowertrainSnapshot;
  timeSeries: TimeSeriesFrame[];
  warnings: { code: string; message: string }[];
}

export interface SimulationOutput {
  schemaVersion: string;
  engineVersion: string;
  modelFidelityTag: 'kinera-v1-educational';
  status: 'OK' | 'ERROR';
  simulatedEstimateDisclaimer: string;
  summaryMetrics: Record<string, MetricValue>;
  powertrainSnapshot?: PowertrainSnapshot | null;
  timeSeries?: TimeSeriesFrame[] | null;
  comparisonEntries?: ConfigComparisonEntry[] | null;
  comparisonDiffs?: ComparisonDiff[] | null;
  warnings: { code: string; message: string }[];
}

export interface ErrorEnvelope {
  error: {
    code: string;
    category: string;
    message: string;
    fieldPath?: string;
    recoverable: boolean;
    details?: unknown;
  };
}

export interface AnimationStep {
  stepIndex: number;
  id: string;
  label: string;
  startTimeSec: number;
  endTimeSec: number;
  targetComponentIds: string[];
  cameraPresetId?: CameraPresetId | null;
  flowMode?: 'chemical' | 'mechanical' | 'electrical_dc' | 'electrical_ac' | 'regen' | null;
  educationalPurpose: string;
  dependsOnStepIds?: string[];
}

export interface AnimationSequence {
  id: string;
  schemaVersion: string;
  title: string;
  category: 'cinematic' | 'journey' | 'inspection';
  vehicleConfigurations: ConfigId[];
  durationSec: number;
  supportsReverseRegen?: boolean;
  steps: AnimationStep[];
}
