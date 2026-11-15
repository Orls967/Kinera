# State Management — KINERA

**Document ID:** `KIN-DOC-06-08`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Specifies KINERA's Zustand store architecture, shared `VehicleState` contract connecting all six application sections, and transient state rules for high-frequency 3D animation.

## 2. Zustand Store Slices

| Store Slice | Key State Fields | Consumers |
| :--- | :--- | :--- |
| `useAppStore` | `activeConfigId`, `unitSystem` (`"engineering"` \| `"si"`), `qualityTier` (`"high"` \| `"medium"` \| `"low"`), `isOnline`, `offlineBundleReady` | Global Shell, Config Selector, All Sections |
| `useAnatomyStore` | `selectedComponentId`, `isolatedId`, `hoveredId`, `viewMode`, `explodeFactor` (`0..1`), `sectionCut` (`{ enabled, axis, offset }`), `shellTransparency`, `visibleLayers`, `showPowerFlow`, `activeCameraPreset` | Vehicle Anatomy, R3F Scene |
| `useJourneyStore` | `isPlaying`, `mode` (`"propulsion"` \| `"regen"`), `activeStepIndex`, `playbackSpeed`, `fourWdMode` (`"2H"` \| `"4H"` \| `"4L"`), `evSplitRatio` | Powertrain Journey, R3F Scene |
| `useSimulatorStore` | `activeModule` (`"powertrain"` \| `"dynamics"` \| `"comparison"`), `sharedParams` (SI!), `powertrainInput`, `dynamicsInput`, `comparisonConfigs`, `matchedBaselineLock`, `lifecycleStatus`, `latestOutput`, `playbackCursorTime`, `activeWarnings` | Engineering Simulator, Telemetry Charts |
| `useLearningStore` | `searchQuery`, `activeInsightsGroup`, `activeTopicId`, `activeLibraryModuleId`, `completedTopics` (local progress) | Insights, Technical Library |

## 3. Shared Vehicle State Synchronization Rule

- Switching `activeConfigId` from the Global Configuration Selector invokes `rebindActiveConfiguration(newConfigId)`, which atomically:
  1. Resets `selectedComponentId` / `isolatedId` if not present in the new layout's component list.
  2. Resets `activeStepIndex` to `0` and switches Journey mode (`propulsion` if ICE; retains/resets `regen` if EV).
  3. Loads baseline SI parameters for the new configuration into `useSimulatorStore` (except when inside `Configuration Comparison` where `comparisonConfigs` retains multi-selection cleanly).
  4. Triggers stale invalidation of previous single-vehicle simulation output and invokes fresh Worker calculation.

## 4. Cross-References

- [`FRONTEND_ARCHITECTURE.md`](FRONTEND_ARCHITECTURE.md)
- [`DATA_FLOW.md`](DATA_FLOW.md)
- [`../05-simulation-engine/SIMULATION_STATE_AND_LIFECYCLE.md`](../05-simulation-engine/SIMULATION_STATE_AND_LIFECYCLE.md)
