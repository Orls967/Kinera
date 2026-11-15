# Simulation Contracts — KINERA

**Document ID:** `KIN-DOC-07-05`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Locks the exact TypeScript/Rust/JSON data contracts for `SimulationInput`, `SimulationOutput`, `PowertrainState`, `TimeSeriesFrame`, and `ComparisonResult` (`KIN-DATA-015`–`KIN-DATA-018`), validated by [`../schemas/simulation-input.schema.json`](../schemas/simulation-input.schema.json) and [`../schemas/simulation-output.schema.json`](../schemas/simulation-output.schema.json).

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-DATA-015** | `SimulationInput` and `SimulationOutput` payloads across Rust (`serde`), TypeScript, and optional FastAPI Pydantic models shall share identical field names, enums, and SI units. |
| **KIN-DATA-016** | Wheel-indexed output arrays shall strictly follow canonical index order `[0: FL, 1: FR, 2: RL, 3: RR]`. |
| **KIN-DATA-017** | Output contracts shall distinguish `totalAxleTorqueNm` (per axle `[front, rear]`) from `wheelTorquesNm` (`[FL, FR, RL, RR]`) and `driveshaftRpm` (`null` when configuration lacks a longitudinal driveshaft). |
| **KIN-DATA-018** | Every `SimulationOutput` shall embed `modelFidelityTag`, `simulatedEstimateDisclaimer`, and non-empty `warnings[]` whenever linear or physical limits are reached. |

## 3. Concrete `SimulationInput` Example (`time_series_dynamics`)

```json
{
  "schemaVersion": "1.0.0",
  "mode": "time_series_dynamics",
  "configurationIds": ["vehicle.config.ev-dual-awd"],
  "driverInputs": {
    "throttle": 1.0,
    "brakeDemand": 0.0,
    "steeringAngleRad": 0.0,
    "gearIndex": 1,
    "fourWdMode": null,
    "diffMode": "ev_electronic",
    "evFrontSplit": 0.40
  },
  "environment": {
    "roadGradeRad": 0.0,
    "airDensityKgM3": 1.225,
    "wheelMu": [0.90, 0.90, 0.90, 0.90],
    "gravityMps2": 9.80665
  },
  "solverConfig": {
    "dtSec": 0.01,
    "durationSec": 12.0,
    "initialSpeedMps": 0.0,
    "initialSoc": 0.85,
    "absConceptualEnabled": true,
    "matchedBaselineLock": false
  }
}
```

## 4. Concrete `SimulationOutput` Example (Excerpt)

```json
{
  "schemaVersion": "1.0.0",
  "engineVersion": "0.1.0",
  "modelFidelityTag": "kinera-v1-educational",
  "status": "OK",
  "simulatedEstimateDisclaimer": "Simulated educational model estimate under documented V1 assumptions — not verified production vehicle performance data.",
  "summaryMetrics": {
    "zeroTo100KmhSec": { "value": 5.42, "unit": "s" },
    "quarterMileSec": { "value": 13.78, "unit": "s" },
    "powerToWeightWPerKg": { "value": 130.43, "unit": "W/kg" }
  },
  "powertrainSnapshot": {
    "configurationId": "vehicle.config.ev-dual-awd",
    "primeMoverRpm": 3200.0,
    "primeMoverOmegaRadS": 335.103,
    "gearboxOutputTorqueNm": null,
    "driveshaftRpm": null,
    "axleTorquesNm": [1686.9, 2530.3],
    "wheelTorquesNm": [843.45, 843.45, 1265.15, 1265.15],
    "wheelRpm": [359.55, 359.55, 369.94, 369.94],
    "tractiveForceTotalN": 13387.9,
    "powerLossesW": 17640.0,
    "overallEfficiency": 0.848
  },
  "warnings": []
}
```

## 5. Cross-References

- [`../schemas/simulation-input.schema.json`](../schemas/simulation-input.schema.json)
- [`../schemas/simulation-output.schema.json`](../schemas/simulation-output.schema.json)
- [`API_SPECIFICATION.md`](API_SPECIFICATION.md)
