# KINERA Unit and Integration Test Plan

**Document ID:** `KIN-DOC-10-03`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Specifies test scopes, fixtures, mocks policy (strictly forbidden for core physics/topology logic), and pass criteria for Rust unit tests, WebAssembly Worker integration tests, TypeScript state/contract tests, and optional FastAPI endpoint verification.

---

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-QA-007** | All pure Rust solver modules (`kinera-physics`, `kinera-topology`, `kinera-compare`) shall maintain unit test coverage of every public function and differential/transmission/dynamics branch. |
| **KIN-QA-008** | Worker serialization bridges, Zustand state synchronization, and optional FastAPI endpoints shall be verified via automated integration suites validating full JSON Schema Draft 2020-12 compliance. |

---

## 3. Unit Test Scope (`cargo test`)

### 3.1 `kinera-topology` Crate
- Graph validation across all 7 canonical configuration fixtures (`vehicle.config.*`).
- Disconnected node detection (`ERR_TOPO_DISCONNECTED_PATH`).
- Mode compatibility checks (`2H`/`4H`/`4L` accepted only on `vehicle.config.ice-4wd`; rejected on `ICE-AWD`, `ICE-FWD`, `EV-*`).
- Zero duplicate efficiency multiplication along active torque paths (`DRIVETRAIN_EFFICIENCY_MODEL.md`).

### 3.2 `kinera-physics` Crate
- **Powertrain:** ICE torque interpolation & rev-limiter cutoff; EV constant-torque to constant-power field weakening; gear ratios (`1..N`, `N=0`, `R<0`); single-stage efficiency bounds $(0.05, 1.0]$.
- **Differentials:** Open, LSD, Locked, Center Diff (fixed & variable), and 4WD transfer case split verification.
- **Longitudinal & Braking:** Drag, rolling, grade ($\pm\theta$), RK4 step vs analytical equilibrium, brake bias distribution (`front`/`rear`), ABS clamp at $\mu F_z$.
- **Lateral & Weight Transfer:** Linear 2-DOF bicycle solver, steady-state yaw rate convergence, $K_{us}$ polarity (understeer vs oversteer weight bias), quasi-static $\Delta F_z$ (longitudinal + lateral $\pm \frac{\Delta F_{z,lat}}{2}$ per wheel), wheel-lift clamp & load redistribution.
- **Solidity Guarantee:** Fuzz/property tests across randomized valid + invalid (`NaN`, `Inf`, `<=0`, extreme bounds) inputs confirming **zero panics**.

### 3.3 `kinera-compare` Crate
- Deterministic alignment of multi-config sweeps on shared time/distance grids.
- Matched Baseline override enforcement (`vehicleMassKg`, `Cd`, `A`, `mu`, `r_eff`) preserving drivetrain-specific topology while normalizing shared external loads.

---

## 4. Frontend & Worker Integration Tests (`Vitest` + `wasm-pack`)

| Test Group | Verified Behavior | Mock Policy |
| :--- | :--- | :--- |
| **Worker Lifecycle & Cancellation** | `init` -> `solve` -> `cancel` -> rapid config switch resolves newest request ID cleanly without stale telemetry leak (`KIN-SIM-026`, `KIN-SIM-027`). | Real WASM Worker bundle inside browser/worker harness; no fake solver outputs. |
| **Zero-Backend Offline Flow** | App boots, loads all 7 configs, runs all 3 simulator modes, opens Insights/Library with network interception blocking all HTTP calls. | Playwright route abort (`**/*.json` network fail checks fallback to cached local bundle). |
| **JSON Schema Conformance** | Every bundled `vehicle-configuration`, `component`, `simulation-request`, `simulation-response`, and `learning-content` document validates against `docs/schemas/*.schema.json`. | Zero schema waivers. |
| **Zustand Store Sync** | Changing active configuration, exploding slider, or Journey step updates R3F scene props, HUD values, and URL/session state consistently. | UI component isolation tests only; store logic unmocked. |

---

## 5. Optional FastAPI Backend Tests (`pytest`)

While optional and non-blocking for offline PWA operation (`ADR-002`), when enabled the FastAPI service must pass:
1. `GET /api/v1/health` returns `200 OK` with schema version metadata.
2. `GET /api/v1/configurations` and `/configurations/{id}` return payloads matching `vehicle-configuration.schema.json`.
3. `POST /api/v1/simulations/validate` rejects out-of-range requests using canonical `ErrorEnvelope` codes (`ERR_SIM_*`, `ERR_TOPO_*`, `ERR_SCHEMA_VERSION_MISMATCH`).
4. Parity test confirms FastAPI validation rejects the exact same invalid inputs as the Rust/WASM gate.

---

## 6. Cross-References

- [`TEST_STRATEGY.md`](TEST_STRATEGY.md)
- [`SIMULATION_TEST_CASES.md`](SIMULATION_TEST_CASES.md)
- [`../06-software-architecture/WORKER_COMMUNICATION.md`](../06-software-architecture/WORKER_COMMUNICATION.md)
- [`../07-data-and-contracts/API_SPECIFICATION.md`](../07-data-and-contracts/API_SPECIFICATION.md)
- [`../07-data-and-contracts/ERROR_CONTRACTS.md`](../07-data-and-contracts/ERROR_CONTRACTS.md)
