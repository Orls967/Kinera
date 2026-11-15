# Error Contracts — KINERA

**Document ID:** `KIN-DOC-07-07`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the unified `ErrorEnvelope` structure and canonical error/warning codes shared across Rust/WASM, Web Worker, Frontend Registry Validation, 3D Asset Loading, and optional FastAPI (`KIN-DATA-022`–`KIN-DATA-023`).

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-DATA-022** | Every subsystem error across WASM, Worker, UI, and optional REST API shall conform to one `ErrorEnvelope` schema. |
| **KIN-DATA-023** | Non-fatal simulation model warnings (e.g., linear bicycle angle $> 6^\circ$, battery depletion, wheel lift) shall emit `SimulationWarning` entries rather than discarding valid computed outputs. |

## 3. Unified `ErrorEnvelope` Contract

```json
{
  "error": {
    "code": "ERR_SIM_INVALID_MASS",
    "category": "VALIDATION",
    "message": "Vehicle mass must be finite and within [100, 50000] kg.",
    "fieldPath": "parameterOverrides.massKg",
    "recoverable": true,
    "details": { "received": -120.0, "min": 100.0, "max": 50000.0 }
  }
}
```

## 4. Canonical Error & Warning Catalog

| Code | Layer | Severity | Description |
| :--- | :--- | :---: | :--- |
| `ERR_SIM_INVALID_GEAR` | WASM | Error | Requested gear index unsupported by active configuration |
| `ERR_SIM_INVALID_RATIO` | WASM | Error | Out-of-bounds gear or final drive ratio |
| `ERR_SIM_INVALID_EFFICIENCY` | WASM | Error | Efficiency outside `(0.05, 1.0]` |
| `ERR_SIM_INVALID_VOLTAGE` | WASM | Error | EV voltage non-positive, `NaN`, or `> 1200 V` |
| `ERR_SIM_INVALID_MASS` | WASM | Error | Mass non-finite or outside `[100, 50000] kg` |
| `ERR_SIM_INVALID_STEERING` | WASM | Error | Steering angle exceeds mechanical lock or `NaN` |
| `ERR_SIM_INVALID_TIMESTEP` | WASM | Error | $\Delta t \notin [0.001, 0.05]\text{ s}$ |
| `ERR_TOPO_DISCONNECTED_PATH` | WASM / Data | Error | Drivetrain path fails source-to-wheel reachability |
| `ERR_TOPO_UNSUPPORTED_CONFIG` | WASM / Data | Error | Unrecognized configuration ID or invalid topology |
| `ERR_SCHEMA_VERSION_MISMATCH` | Worker / API | Error | Unsupported `schemaVersion` major version |
| `ERR_ASSET_GLB_LOAD_FAILED` | Frontend 3D | Error | 3D mesh load failure (offers retry / wireframe fallback) |
| `WARN_LINEAR_BICYCLE_EXCEEDED` | WASM | Warning | $|\alpha| > 6^\circ$ or $|a_y| > 0.4g$ linear limit exceeded |
| `WARN_CRITICAL_SPEED_APPROACHED` | WASM | Warning | Oversteer vehicle approaching $v_{crit}$ instability |
| `WARN_TRACTION_SATURATED` | WASM | Warning | Tire force hit $\mu F_z$ / friction-circle boundary |
| `WARN_4WD_WINDUP_RISK` | WASM | Warning | Part-time `ICE-4WD` in `4H`/`4L` on high-$\mu$ paved cornering |
| `WARN_BATTERY_DEPLETED` | WASM | Warning | EV SOC reached `soc_min`; drive power cut to `0 W` |
| `WARN_WHEEL_LIFT` | WASM | Warning | Extreme load transfer drove inner wheel $F_z \to 0$ |

## 5. Cross-References

- [`../05-simulation-engine/SIMULATION_ERROR_HANDLING.md`](../05-simulation-engine/SIMULATION_ERROR_HANDLING.md)
- [`SIMULATION_CONTRACTS.md`](SIMULATION_CONTRACTS.md)
