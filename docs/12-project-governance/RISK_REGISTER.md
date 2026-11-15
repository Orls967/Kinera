# KINERA Risk Register

**Document ID:** `KIN-DOC-12-03`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Identifies and tracks technical, engineering-accuracy, performance, offline, UX, and governance risks across KINERA V1 and subsequent implementation phases, alongside concrete mitigations and contingency triggers.

---

## 2. Active Risk Matrix

| Risk ID | Category | Risk Description | Likelihood | Impact | Mitigation Strategy | Owner / Trigger |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **RSK-001** | Architecture | Developers fork physics or 3D scene logic per configuration (`ICE-FWD` vs `EV-DUAL-AWD`), breaking `ADR-001` & causing silent divergence. | Medium | High | Data-driven `VehicleConfiguration` schemas (`schema v1.0.0`), unified `kinera-topology` graph engine, CI parameterized test mandate (`TEST_STRATEGY.md`). | Phase 1–3 review gate |
| **RSK-002** | Physics Accuracy | Educational learners misinterpret linear 2-DOF bicycle or steady-state estimates as full nonlinear track telemetry. | High | High | Explicit `Simulated Model Estimate` labels (`AC-014`), mandatory linear warning `WARN_LINEAR_BICYCLE_EXCEEDED` at $|\alpha| > 6^\circ$, transparent Equation Drawer (`AC-019`). | `EQUATION_REFERENCE.md`, Phase 4 UI check |
| **RSK-003** | 3D Performance | Detailed ICE + EV powertrain cutaways across 7 configs exceed `150k` active tris / `120` draw calls on mid-tier hardware. | High | High | Modular reusable subassembly instancing (`ASSEMBLY_HIERARCHY.md`), lazy configuration asset loading + `dispose()`, automated Playwright GPU profiler gate (`TEST-PERF-001..004`). | Phase 3 WebGL CI gate |
| **RSK-004** | Numeric Stability | Boundary/user inputs (`rpm=0`, `mu=0`, `v_x=0`, `soc=0`, `NaN`) trigger division-by-zero or Rust WASM panics. | Medium | High | Pre-solver `f64::is_finite()` + domain checks, `#![deny(clippy::unwrap_used)]`, mandatory `TEST-EDGE-001..019` suite across native & headless WASM. | Phase 2 Rust CI gate |
| **RSK-005** | Offline PWA | Service Worker misses `.wasm`, Draco decoder, `.glb`, or KaTeX font files, failing offline boot (`AC-018`). | Medium | High | Workbox precache completeness check in CI + Playwright `offline: true` E2E test loading all 6 sections & 7 configs cleanly. | Phase 6 PWA CI gate |
| **RSK-006** | UX / Coordinate Drift | `ISO 8855` physics sign conventions mismatch Three.js left/up axes causing inverted yaw, wheel roll, or flipped CG arrows. | Medium | Medium | Locked cyclic `(y_iso, z_iso, x_iso)` transform ($\det = +1$) tested explicitly in `3D_AND_INTERACTION_TEST_PLAN.md` (`Section 3.2`). | Phase 3 coordinate check |
| **RSK-007** | Content Quality | Technical citations or formulas introduce unverified claims or diverge from Rust solver constants. | Low | High | `TECHNICAL_REFERENCE_POLICY.md` verified textbook registry (`Gillespie`, `Milliken`, `Rajamani`, `Wong`, `Heywood`, `Ehsani`, `ISO 8855`, `SAE J670`) + shared `eq.*` IDs. | Phase 5 content gate |
| **RSK-008** | Scope Creep | Late pressure to implement Pacejka nonlinear tires, combustion chemistry, FEA, or thermal derating inside V1 delays launch. | Medium | High | Hard `V1 Exclusions` contract in `PRODUCT_SCOPE.md` and release check `AC-022`; deferred cleanly to `V1.2`/`V2.0` in `MAINTENANCE_AND_FUTURE_EXPANSION.md`. | All Phase exit reviews |
| **RSK-009** | State Races | Rapid user slider scrubbing leaves slower Worker solve responses out-of-order relative to current UI config. | Medium | Medium | Monotonic `requestId` cancellation & stale-response discard rule in `WORKER_COMMUNICATION.md` & `SIMULATION_STATE_AND_LIFECYCLE.md`. | Phase 2–4 integration tests |

---

## 3. Cross-References

- [`../11-delivery-and-operations/IMPLEMENTATION_ROADMAP.md`](../11-delivery-and-operations/IMPLEMENTATION_ROADMAP.md)
- [`../10-quality-assurance/TEST_STRATEGY.md`](../10-quality-assurance/TEST_STRATEGY.md)
- [`../00-project-foundation/PRODUCT_SCOPE.md`](../00-project-foundation/PRODUCT_SCOPE.md)
- [`DECISION_LOG.md`](DECISION_LOG.md)
