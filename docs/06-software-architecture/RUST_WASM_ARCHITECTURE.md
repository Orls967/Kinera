# Rust / WebAssembly Architecture — KINERA

**Document ID:** `KIN-DOC-06-04`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines internal crate structure, public WASM ABI functions, SI unit enforcement, deterministic solver layout, panic-free error handling, and versioning for the Rust/WASM simulation engine (`kinera-sim`).

## 2. Crate Organization

```text
crates/
├── kinera-core/          # Pure Rust no-IO math library (unit tests run natively via `cargo test`)
│   ├── units.rs          # Newtype SI wrappers (Meters, Seconds, Newtons, NewtonMeters, RadPerSec, Watts)
│   ├── topology.rs       # DrivetrainTopology validation & path traversal across 7 configurations
│   ├── powertrain/       # ice.rs, ev.rs, transmission.rs, differential.rs, efficiency.rs
│   ├── dynamics/         # longitudinal.rs, bicycle_lateral.rs, braking.rs, weight_transfer.rs, friction.rs
│   ├── performance.rs    # 0-100, quarter-mile, top speed, gradeability, energy extractors
│   ├── comparison.rs     # Multi-config runner & parameter mismatch detector
│   ├── integrator.rs     # Fixed-step RK4 + bisection + crossing interpolation
│   └── contracts.rs      # Serde-serializable SimulationInput, SimulationOutput, SimulationError
└── kinera-wasm/          # Thin wasm-bindgen adapter compiled via wasm-pack for Web Worker target
    └── lib.rs            # Exported ABI entrypoints + panic hook disabled/guarded via Result
```

## 3. Public WASM ABI Surface

1. `get_engine_metadata() -> String` *(Returns JSON: `engineVersion`, supported `schemaVersion`, build commit).*
2. `validate_configuration_json(config_json: &str) -> String` *(Verifies topology DAG & parameter bounds).*
3. `evaluate_powertrain_single(input_json: &str) -> String` *(Single-point ICE/EV powertrain & differential query).*
4. `run_dynamics_simulation(input_json: &str) -> String` *(Time-series longitudinal, lateral bicycle, braking, or combined simulation).*
5. `run_performance_benchmark(input_json: &str) -> String` *(Extracts all 8 standardized performance metrics).*
6. `run_configuration_comparison(input_json: &str) -> String` *(Controlled multi-config run + parameter diff audit).*

*(All functions accept/return versioned UTF-8 JSON matching `SIMULATION_CONTRACTS.md` via `serde_json`, keeping boundary overhead $< 0.3\text{ ms}$ per call while preserving strict schema parity with TypeScript and Python Pydantic models. High-frequency telemetry playback scrubs cached arrays already returned to JS.)*

## 4. Safety, Determinism & Testing Rules

- **Zero Panics:** Clippy lints `#![deny(clippy::unwrap_used, clippy::expect_used, clippy::panic)]` enforced across `kinera-core` and `kinera-wasm`.
- **SI Newtypes:** Rust unit wrappers prevent accidentally adding `N·m` to `N` or feeding `deg` into `sin(theta)`.
- **Native + WASM Dual Testing:** Every physics unit & regression test executes identically in native `cargo test` AND `wasm-pack test --headless`.

## 5. Cross-References

- [`WORKER_COMMUNICATION.md`](WORKER_COMMUNICATION.md)
- [`../05-simulation-engine/SIMULATION_ARCHITECTURE.md`](../05-simulation-engine/SIMULATION_ARCHITECTURE.md)
- [`../07-data-and-contracts/SIMULATION_CONTRACTS.md`](../07-data-and-contracts/SIMULATION_CONTRACTS.md)
