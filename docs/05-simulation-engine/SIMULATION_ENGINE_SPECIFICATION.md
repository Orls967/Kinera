# Simulation Engine Specification — KINERA

**Document ID:** `KIN-DOC-05-02`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Specifies the runtime execution modes, deterministic solver orchestration, shared inputs/outputs, and timing constraints of the KINERA Simulation Engine (`KIN-SIM-006`–`KIN-SIM-009`).

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-SIM-006** | Engine shall support four execution modes: `single_point_powertrain`, `time_series_dynamics`, `performance_benchmark`, and `multi_config_comparison`. |
| **KIN-SIM-007** | Solver execution shall be strictly deterministic: identical `SimulationInput` yields identical IEEE-754 outputs across runs. |
| **KIN-SIM-008** | Time-series simulations shall enforce bounded step sizes ($\Delta t \in [0.001\text{ s}, 0.05\text{ s}]$, default $0.01\text{ s}$) and duration limits ($T_{end} \le 300\text{ s}$) with optional decimated output sampling for smooth chart rendering. |
| **KIN-SIM-009** | Single-point queries shall resolve in $\le 2\text{ ms}$; standard $30\text{ s}$ dynamics runs ($3,000$ steps) shall complete in $\le 25\text{ ms}$ inside the WASM Worker. |

## 3. Execution Modes

1. **`single_point_powertrain`:** Evaluates steady instantaneous state at user-specified RPM/throttle/gear (or speed) for Powertrain Simulation gauges and Powertrain Journey stage annotations. Zero time integration required.
2. **`time_series_dynamics`:** Runs fixed-step RK4 integration for longitudinal launch/cruise/grade sweeps, braking stops, or lateral bicycle steering maneuvers, returning downsampled telemetry arrays (e.g., $\le 1000$ points for UI charts while preserving exact event crossings).
3. **`performance_benchmark`:** Runs standardized analytical + numerical sweeps extracting the 8 metrics defined in `VEHICLE_PERFORMANCE_ANALYSIS.md`.
4. **`multi_config_comparison`:** Iterates over $N \in [2, 7]$ `VehicleConfiguration` instances under a shared `ComparisonScenario`, runs matched validation checks, and aggregates overlaid outputs.

## 4. Solver Invariants

- **Strict SI Internals:** No `km/h`, `kW`, `deg`, or `Wh` arithmetic inside Rust solver kernels—all inputs convert on ingestion if needed, and solver kernels work exclusively in `m, kg, s, N, N·m, rad, rad/s, W, J, V, A`.
- **Zero Heap Allocation in Inner RK4 Loop:** Time-step loop uses stack-allocated fixed arrays `[f64; 4]` for wheel loads and forces, keeping cache locality tight and runtime well under $25\text{ ms}$.
- **Deterministic Iteration Order:** Configuration evaluations and axle loops (`[FL, FR, RL, RR]`) execute in fixed canonical order with zero hash-map iteration nondeterminism.

## 5. Cross-References

- [`POWERTRAIN_SIMULATION_SPECIFICATION.md`](POWERTRAIN_SIMULATION_SPECIFICATION.md)
- [`VEHICLE_DYNAMICS_SIMULATION_SPECIFICATION.md`](VEHICLE_DYNAMICS_SIMULATION_SPECIFICATION.md)
- [`NUMERICAL_METHODS_AND_STABILITY.md`](NUMERICAL_METHODS_AND_STABILITY.md)
