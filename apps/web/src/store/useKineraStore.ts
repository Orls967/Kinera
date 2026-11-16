import { create } from 'zustand';
import { CONFIG_BY_ID } from '../data/configs';
import type {
  CameraPresetId,
  ConfigId,
  DiffMode,
  ErrorEnvelope,
  FourWdMode,
  QualityTier,
  SimulationInput,
  SimulationOutput,
  SystemLayerId,
  UnitDisplayMode,
} from '../types/kinera';

const ALL_LAYERS_ON: Record<SystemLayerId, boolean> = {
  exterior: true,
  structure: true,
  powerplant: true,
  drivetrain: true,
  suspension: true,
  braking: true,
  wheels: true,
};

export interface SavedScenarioRecord {
  id: string;
  name: string;
  savedAt: string;
  configId: ConfigId;
  input: SimulationInput;
}

function loadSavedScenarios(): SavedScenarioRecord[] {
  try {
    const raw = localStorage.getItem('kinera_saved_scenarios_v1');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export interface KineraState {
  // Global Shell
  activeConfigId: ConfigId;
  unitMode: UnitDisplayMode;
  isOnline: boolean;
  swUpdateAvailable: boolean;
  setActiveConfigId: (id: ConfigId) => void;
  setUnitMode: (mode: UnitDisplayMode) => void;
  setIsOnline: (online: boolean) => void;
  setSwUpdateAvailable: (avail: boolean) => void;

  // Overview / Cinematic
  overviewRevealMode: 'exterior' | 'chassis' | 'powertrain';
  turntableEnabled: boolean;
  setOverviewRevealMode: (m: 'exterior' | 'chassis' | 'powertrain') => void;
  setTurntableEnabled: (v: boolean) => void;

  // Vehicle Anatomy 3D
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
  isolatedComponentId: string | null;
  soloIsolation: boolean;
  visibleLayers: Record<SystemLayerId, boolean>;
  explodeFactor: number;
  shellTransparency: number;
  sectionCutEnabled: boolean;
  sectionCutAxis: 'x' | 'y' | 'z';
  sectionCutOffset: number;
  showPowerFlow: boolean;
  showRelationships: boolean;
  cameraPreset: CameraPresetId;
  cameraPresetTrigger: number;
  fourWdMode: FourWdMode;
  qualityTier: QualityTier;
  sceneStats: { triangles: number; drawCalls: number; fps: number };

  selectComponent: (id: string | null) => void;
  hoverComponent: (id: string | null) => void;
  isolateComponent: (id: string | null) => void;
  setSoloIsolation: (solo: boolean) => void;
  toggleLayer: (layer: SystemLayerId) => void;
  setLayerPreset: (preset: 'full' | 'powertrain' | 'chassis' | 'suspension' | 'braking') => void;
  setExplodeFactor: (v: number) => void;
  setShellTransparency: (v: number) => void;
  setSectionCutEnabled: (v: boolean) => void;
  setSectionCutAxis: (a: 'x' | 'y' | 'z') => void;
  setSectionCutOffset: (v: number) => void;
  setShowPowerFlow: (v: boolean) => void;
  setShowRelationships: (v: boolean) => void;
  setCameraPreset: (p: CameraPresetId) => void;
  setFourWdMode: (m: FourWdMode) => void;
  setQualityTier: (t: QualityTier) => void;
  setSceneStats: (stats: { triangles: number; drawCalls: number; fps: number }) => void;
  resetAssembly: () => void;

  // Powertrain Journey
  journeyPlaying: boolean;
  journeyStepIndex: number;
  journeySpeed: 0.5 | 1 | 2;
  journeyEvRegen: boolean;
  journeyEvFrontSplit: number;
  setJourneyPlaying: (p: boolean) => void;
  setJourneyStepIndex: (i: number) => void;
  setJourneySpeed: (s: 0.5 | 1 | 2) => void;
  setJourneyEvRegen: (r: boolean) => void;
  setJourneyEvFrontSplit: (s: number) => void;

  // Engineering Simulator
  simThrottle: number;
  simBrakeDemand: number;
  simGearIndex: number;
  simPrimeMoverRpm: number;
  simDiffMode: DiffMode;
  simEvFrontSplit: number;
  simWheelMu: [number, number, number, number];
  simRoadGradeRad: number;
  simMassOverrideKg: number | null;
  simCdOverride: number | null;
  simCrrOverride: number | null;
  simCgFrontOverrideM: number | null;
  simSteeringAngleRad: number;
  simInitialSpeedMps: number;
  simInitialSoc: number;
  simFrontBrakeBias: number;
  simAbsEnabled: boolean;
  simDurationSec: number;
  simAggregateEffOverride: number | null;

  comparisonConfigIds: ConfigId[];
  matchedBaselineLock: boolean;

  wasmStatus: 'uninitialized' | 'ready' | 'degraded';
  simRunning: boolean;
  lastComputeMs: number | null;
  simError: ErrorEnvelope | null;
  powertrainOutput: SimulationOutput | null;
  dynamicsOutput: SimulationOutput | null;
  benchmarkOutput: SimulationOutput | null;
  comparisonOutput: SimulationOutput | null;
  savedScenarios: SavedScenarioRecord[];

  updateSimParams: (patch: Partial<KineraState>) => void;
  setComparisonConfigIds: (ids: ConfigId[]) => void;
  setMatchedBaselineLock: (locked: boolean) => void;
  setSimResults: (patch: {
    wasmStatus?: 'uninitialized' | 'ready' | 'degraded';
    simRunning?: boolean;
    lastComputeMs?: number | null;
    simError?: ErrorEnvelope | null;
    powertrainOutput?: SimulationOutput | null;
    dynamicsOutput?: SimulationOutput | null;
    benchmarkOutput?: SimulationOutput | null;
    comparisonOutput?: SimulationOutput | null;
  }) => void;
  resetSimToConfigDefaults: () => void;
  saveScenario: (name: string, input: SimulationInput) => void;
  deleteScenario: (id: string) => void;
}

export const useKineraStore = create<KineraState>((set, get) => ({
  activeConfigId: 'vehicle.config.ice-rwd',
  unitMode: 'engineering',
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  swUpdateAvailable: false,

  setActiveConfigId: (id) => {
    const cfg = CONFIG_BY_ID[id];
    const defaultDiff: DiffMode =
      id === 'vehicle.config.ev-dual-awd'
        ? 'ev_electronic'
        : id === 'vehicle.config.ice-awd'
          ? 'center_diff'
          : id === 'vehicle.config.ice-4wd'
            ? 'locked'
            : 'open';

    set({
      activeConfigId: id,
      selectedComponentId: null,
      isolatedComponentId: null,
      journeyStepIndex: 0,
      journeyPlaying: false,
      simGearIndex: cfg.powertrainType === 'ev' ? 1 : 3,
      simPrimeMoverRpm: cfg.powertrainType === 'ev' ? 3000 : 3500,
      simDiffMode: defaultDiff,
      simMassOverrideKg: null,
      simCdOverride: null,
      simCrrOverride: null,
      simCgFrontOverrideM: null,
      simAggregateEffOverride: null,
    });
  },
  setUnitMode: (unitMode) => set({ unitMode }),
  setIsOnline: (isOnline) => set({ isOnline }),
  setSwUpdateAvailable: (swUpdateAvailable) => set({ swUpdateAvailable }),

  overviewRevealMode: 'chassis',
  turntableEnabled: true,
  setOverviewRevealMode: (overviewRevealMode) => {
    const shellTransparency =
      overviewRevealMode === 'exterior' ? 0.12 : overviewRevealMode === 'chassis' ? 0.72 : 0.9;
    set({ overviewRevealMode, shellTransparency });
  },
  setTurntableEnabled: (turntableEnabled) => set({ turntableEnabled }),

  selectedComponentId: null,
  hoveredComponentId: null,
  isolatedComponentId: null,
  soloIsolation: false,
  visibleLayers: { ...ALL_LAYERS_ON },
  explodeFactor: 0,
  shellTransparency: 0.72,
  sectionCutEnabled: false,
  sectionCutAxis: 'x',
  sectionCutOffset: 0.0,
  showPowerFlow: true,
  showRelationships: false,
  cameraPreset: 'isometric-front',
  cameraPresetTrigger: 0,
  fourWdMode: '4H',
  qualityTier: 'high',
  sceneStats: { triangles: 0, drawCalls: 0, fps: 60 },

  selectComponent: (selectedComponentId) => set({ selectedComponentId }),
  hoverComponent: (hoveredComponentId) => set({ hoveredComponentId }),
  isolateComponent: (isolatedComponentId) => set({ isolatedComponentId }),
  setSoloIsolation: (soloIsolation) => set({ soloIsolation }),
  toggleLayer: (layer) =>
    set((s) => ({
      visibleLayers: { ...s.visibleLayers, [layer]: !s.visibleLayers[layer] },
    })),
  setLayerPreset: (preset) => {
    if (preset === 'full') {
      set({ visibleLayers: { ...ALL_LAYERS_ON }, shellTransparency: 0.72 });
    } else if (preset === 'powertrain') {
      set({
        visibleLayers: {
          exterior: false,
          structure: false,
          powerplant: true,
          drivetrain: true,
          suspension: false,
          braking: false,
          wheels: true,
        },
      });
    } else if (preset === 'chassis') {
      set({
        visibleLayers: {
          exterior: false,
          structure: true,
          powerplant: false,
          drivetrain: true,
          suspension: true,
          braking: false,
          wheels: true,
        },
      });
    } else if (preset === 'suspension') {
      set({
        visibleLayers: {
          exterior: false,
          structure: true,
          powerplant: false,
          drivetrain: false,
          suspension: true,
          braking: true,
          wheels: true,
        },
      });
    } else if (preset === 'braking') {
      set({
        visibleLayers: {
          exterior: false,
          structure: false,
          powerplant: false,
          drivetrain: false,
          suspension: false,
          braking: true,
          wheels: true,
        },
      });
    }
  },
  setExplodeFactor: (explodeFactor) => set({ explodeFactor }),
  setShellTransparency: (shellTransparency) => set({ shellTransparency }),
  setSectionCutEnabled: (sectionCutEnabled) => set({ sectionCutEnabled }),
  setSectionCutAxis: (sectionCutAxis) => set({ sectionCutAxis }),
  setSectionCutOffset: (sectionCutOffset) => set({ sectionCutOffset }),
  setShowPowerFlow: (showPowerFlow) => set({ showPowerFlow }),
  setShowRelationships: (showRelationships) => set({ showRelationships }),
  setCameraPreset: (cameraPreset) =>
    set((s) => ({ cameraPreset, cameraPresetTrigger: s.cameraPresetTrigger + 1 })),
  setFourWdMode: (fourWdMode) => set({ fourWdMode }),
  setQualityTier: (qualityTier) => set({ qualityTier }),
  setSceneStats: (sceneStats) => set({ sceneStats }),
  resetAssembly: () =>
    set((s) => ({
      selectedComponentId: null,
      isolatedComponentId: null,
      visibleLayers: { ...ALL_LAYERS_ON },
      explodeFactor: 0,
      shellTransparency: 0.72,
      sectionCutEnabled: false,
      sectionCutOffset: 0,
      showPowerFlow: true,
      showRelationships: false,
      cameraPreset: 'isometric-front',
      cameraPresetTrigger: s.cameraPresetTrigger + 1,
    })),

  journeyPlaying: false,
  journeyStepIndex: 0,
  journeySpeed: 1,
  journeyEvRegen: false,
  journeyEvFrontSplit: 0.4,
  setJourneyPlaying: (journeyPlaying) => set({ journeyPlaying }),
  setJourneyStepIndex: (journeyStepIndex) => set({ journeyStepIndex }),
  setJourneySpeed: (journeySpeed) => set({ journeySpeed }),
  setJourneyEvRegen: (journeyEvRegen) => set({ journeyEvRegen, journeyStepIndex: 0 }),
  setJourneyEvFrontSplit: (journeyEvFrontSplit) => set({ journeyEvFrontSplit }),

  simThrottle: 1.0,
  simBrakeDemand: 0.0,
  simGearIndex: 3,
  simPrimeMoverRpm: 3500,
  simDiffMode: 'open',
  simEvFrontSplit: 0.4,
  simWheelMu: [0.9, 0.9, 0.9, 0.9],
  simRoadGradeRad: 0.0,
  simMassOverrideKg: null,
  simCdOverride: null,
  simCrrOverride: null,
  simCgFrontOverrideM: null,
  simSteeringAngleRad: 0.03,
  simInitialSpeedMps: 20.0,
  simInitialSoc: 0.85,
  simFrontBrakeBias: 0.7,
  simAbsEnabled: true,
  simDurationSec: 6.0,
  simAggregateEffOverride: null,

  comparisonConfigIds: [
    'vehicle.config.ice-fwd',
    'vehicle.config.ice-rwd',
    'vehicle.config.ev-dual-awd',
  ],
  matchedBaselineLock: true,

  wasmStatus: 'uninitialized',
  simRunning: false,
  lastComputeMs: null,
  simError: null,
  powertrainOutput: null,
  dynamicsOutput: null,
  benchmarkOutput: null,
  comparisonOutput: null,
  savedScenarios: loadSavedScenarios(),

  updateSimParams: (patch) => set(patch),
  setComparisonConfigIds: (comparisonConfigIds) => set({ comparisonConfigIds }),
  setMatchedBaselineLock: (matchedBaselineLock) => set({ matchedBaselineLock }),
  setSimResults: (patch) => set(patch),
  resetSimToConfigDefaults: () => {
    const cfg = CONFIG_BY_ID[get().activeConfigId];
    set({
      simThrottle: 1.0,
      simBrakeDemand: 0.0,
      simGearIndex: cfg.powertrainType === 'ev' ? 1 : 3,
      simPrimeMoverRpm: cfg.powertrainType === 'ev' ? 3000 : 3500,
      simDiffMode:
        cfg.id === 'vehicle.config.ev-dual-awd'
          ? 'ev_electronic'
          : cfg.id === 'vehicle.config.ice-awd'
            ? 'center_diff'
            : cfg.id === 'vehicle.config.ice-4wd'
              ? 'locked'
              : 'open',
      simEvFrontSplit: 0.4,
      simWheelMu: [0.9, 0.9, 0.9, 0.9],
      simRoadGradeRad: 0.0,
      simMassOverrideKg: null,
      simCdOverride: null,
      simCrrOverride: null,
      simCgFrontOverrideM: null,
      simSteeringAngleRad: 0.03,
      simInitialSpeedMps: 20.0,
      simInitialSoc: 0.85,
      simFrontBrakeBias: 0.7,
      simAbsEnabled: true,
      simDurationSec: 6.0,
      simAggregateEffOverride: null,
    });
  },
  saveScenario: (name, input) => {
    const rec: SavedScenarioRecord = {
      id: `scen-${Date.now()}`,
      name,
      savedAt: new Date().toISOString(),
      configId: get().activeConfigId,
      input,
    };
    const next = [rec, ...get().savedScenarios].slice(0, 20);
    try {
      localStorage.setItem('kinera_saved_scenarios_v1', JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
    set({ savedScenarios: next });
  },
  deleteScenario: (id) => {
    const next = get().savedScenarios.filter((s) => s.id !== id);
    try {
      localStorage.setItem('kinera_saved_scenarios_v1', JSON.stringify(next));
    } catch {
      // ignore
    }
    set({ savedScenarios: next });
  },
}));
