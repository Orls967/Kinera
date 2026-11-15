# KINERA Requirements Traceability Matrix (RTM)

**Document ID:** `KIN-DOC-12-01`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Provides complete forward and backward traceability from every high-level product requirement (`KIN-PRD-*`) through functional (`KIN-FR-*`), non-functional (`KIN-NFR-*`), vehicle architecture (`KIN-VEH-*`), powertrain (`KIN-PWT-*`), vehicle dynamics (`KIN-VDY-*`), simulation engine (`KIN-SIM-*`), data contracts (`KIN-DATA-*`), 3D visualization (`KIN-3D-*`), and quality assurance (`KIN-QA-*`) specifications down to test cases and V1 Acceptance Criteria (`AC-001`–`AC-022`). Total tracked requirements: **274**.

---

## 2. Product Requirements Traceability (`KIN-PRD-001`–`KIN-PRD-020`)

| Req ID | Defined In | Domain / Child Specs | Primary Test / Validation | Target AC |
| :--- | :--- | :--- | :--- | :--- |
| **KIN-PRD-001** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-001`, `KIN-FR-006`, `APPLICATION_STRUCTURE.md` | Playwright E2E navigation | `AC-001` |
| **KIN-PRD-002** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-002`, `KIN-VEH-002`, `KIN-VEH-009`..`014` | `TEST-TOPO-001..007`, `TEST-3D-001` | `AC-002` |
| **KIN-PRD-003** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-003`, `KIN-VEH-006`, `KIN-SIM-001`, `ADR-001` | Static architecture & config parity audit | `AC-003` |
| **KIN-PRD-004** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-008`..`012`, `015`..`016`, `KIN-3D-012`..`018` | `TEST-3D-002`..`006` | `AC-004`, `AC-005`, `AC-006` |
| **KIN-PRD-005** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-013`, `014`, `KIN-PWT-025`..`028` | `TEST-3D-007` | `AC-007` |
| **KIN-PRD-006** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-018`..`023`, `KIN-PWT-005`..`024`, `KIN-SIM-010`..`014` | `TEST-SIM-001`, `003`..`007` | `AC-008`, `AC-009` |
| **KIN-PRD-007** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-024`, `KIN-VDY-005`..`009`, `KIN-SIM-015` | `TEST-SIM-008`, analytical longitudinal | `AC-010` |
| **KIN-PRD-008** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-025`, `KIN-VDY-010`..`014`, `KIN-SIM-016` | `TEST-SIM-009`, bicycle steady state | `AC-011` |
| **KIN-PRD-009** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-007`, `027`, `KIN-VDY-015`..`021` | `TEST-SIM-002`, `TEST-SIM-010` | `AC-012` |
| **KIN-PRD-010** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-024`..`026`, `028`, `KIN-VDY-022`..`028` | `TEST-SIM-011`, `eq.dynamics.friction-circle` | `AC-013`, `AC-014` |
| **KIN-PRD-011** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-029`, `030`, `KIN-SIM-020`..`022` | `TEST-SIM-012`, `TEST-PERF-007` | `AC-015` |
| **KIN-PRD-012** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-031`..`033`, `ENGINEERING_INSIGHTS_CURRICULUM.md` | Content schema & offline link check | `AC-016`, `AC-019` |
| **KIN-PRD-013** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-034`, `035`, `TECHNICAL_LIBRARY_STRUCTURE.md` | Content schema & 9-part module check | `AC-016`, `AC-019` |
| **KIN-PRD-014** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-036`..`038`, `ENGINEERING_VALIDATION_PLAN.md` | 29 analytical equation tests (`Tier A/B/C`) | `AC-014`, `AC-019` |
| **KIN-PRD-015** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-039`..`041`, `SIMULATION_ERROR_HANDLING.md` | `TEST-EDGE-001`..`019`, `ADR-005` | `AC-021` |
| **KIN-PRD-016** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-042`..`046`, `OFFLINE_FIRST_ARCHITECTURE.md` | `TEST-PERF-009`, offline Playwright run | `AC-018` |
| **KIN-PRD-017** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-004`, `3D_PERFORMANCE_BUDGET.md`, `WORKER_COMMUNICATION.md` | `TEST-PERF-001`..`008` | `AC-017`, `AC-020` |
| **KIN-PRD-018** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-005`, `048`, `DESIGN_SYSTEM.md`, `COMPONENT_INTERACTION_SPECIFICATION.md` | `TEST-3D-008`, accessibility checks | `AC-020` |
| **KIN-PRD-019** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-033`, `038`, `047`, `TECHNICAL_REFERENCE_POLICY.md` | Citation & boundary label audit | `AC-019`, `AC-022` |
| **KIN-PRD-020** | `PRODUCT_REQUIREMENTS_DOCUMENT.md` | `KIN-FR-017`, `DRIVETRAIN_TOPOLOGY.md`, `POWERTRAIN_SIMULATION_SPECIFICATION.md` | `TEST-TOPO-004`, `TEST-SIM-004` | `AC-009` |

---

## 3. Functional & Non-Functional Traceability (`KIN-FR-001`–`048`, `KIN-NFR-001`–`022`)

### 3.1 Functional Requirements (`KIN-FR-001`–`KIN-FR-048`)
All 48 functional requirements defined in [`FUNCTIONAL_REQUIREMENTS.md`](../01-product-specification/FUNCTIONAL_REQUIREMENTS.md):

| Req ID Range / IDs | Functional Scope | Realizing Engineering Specs | Verification / Tests | Target AC |
| :--- | :--- | :--- | :--- | :--- |
| `KIN-FR-001`, `KIN-FR-002`, `KIN-FR-003`, `KIN-FR-004`, `KIN-FR-005` | Shell routing, 7-config switcher, shared state, perf telemetry, keyboard navigation | `APPLICATION_STRUCTURE.md`, `FRONTEND_ARCHITECTURE.md`, `STATE_MANAGEMENT.md` | E2E shell & config navigation | `AC-001`, `AC-002`, `AC-003`, `AC-020` |
| `KIN-FR-006`, `KIN-FR-007` | Overview section & Braking/Dynamics showcase previews | `APPLICATION_STRUCTURE.md`, `FEATURE_SPECIFICATIONS.md` | Overview offline render check | `AC-001`, `AC-012` |
| `KIN-FR-008`, `KIN-FR-009`, `KIN-FR-010`, `KIN-FR-011`, `KIN-FR-012`, `KIN-FR-015`, `KIN-FR-016`, `KIN-FR-017` | Vehicle Anatomy: hover/select, metadata card, isolate, transparency, exploded view, section cut, layer filter, 4WD mode inspection | `COMPONENT_ANATOMY_SPECIFICATION.md`, `ASSEMBLY_HIERARCHY.md`, `COMPONENT_INTERACTION_SPECIFICATION.md`, `EXPLODED_VIEW_AND_SECTION_CUT.md` | `TEST-3D-001`..`006`, `TEST-TOPO-004` | `AC-004`, `AC-005`, `AC-006`, `AC-009` |
| `KIN-FR-013`, `KIN-FR-014` | Powertrain Journey ICE & EV step-by-step playback, speed, arrows, audio-free visual cues | `POWERTRAIN_JOURNEY_SPECIFICATION.md`, `ANIMATION_SYSTEM.md` | `TEST-3D-007` | `AC-007` |
| `KIN-FR-018`, `KIN-FR-019`, `KIN-FR-020`, `KIN-FR-021`, `KIN-FR-022`, `KIN-FR-023` | Powertrain Simulator: ICE RPM/throttle/gear, EV motor/voltage/SOC, Open/LSD/Locked diff, 4WD `2H/4H/4L`, stage loss ledger | `ICE_ENGINE_MODEL.md`, `EV_POWERTRAIN_MODEL.md`, `TRANSMISSION_MODEL.md`, `DIFFERENTIAL_MODEL.md`, `DRIVETRAIN_EFFICIENCY_MODEL.md` | `TEST-SIM-001`, `003`..`007` | `AC-008`, `AC-009` |
| `KIN-FR-024`, `KIN-FR-025`, `KIN-FR-026`, `KIN-FR-027`, `KIN-FR-028` | Dynamics Simulator: Longitudinal sweeps, 2-DOF lateral bicycle, weight transfer, braking stopping distance, friction circle + perf metrics | `LONGITUDINAL_DYNAMICS.md`, `LATERAL_DYNAMICS_BICYCLE_MODEL.md`, `BRAKING_DYNAMICS.md`, `WEIGHT_TRANSFER_MODEL.md`, `TIRE_TRACTION_AND_FRICTION_MODEL.md`, `VEHICLE_PERFORMANCE_ANALYSIS.md` | `TEST-SIM-002`, `008`..`011`, `eq.dynamics.*` tests | `AC-010`..`AC-014` |
| `KIN-FR-029`, `KIN-FR-030` | Configuration Comparison side-by-side & Matched Baseline mode | `CONFIGURATION_COMPARISON_SPECIFICATION.md` | `TEST-SIM-012`, `TEST-PERF-007` | `AC-015` |
| `KIN-FR-031`, `KIN-FR-032`, `KIN-FR-033`, `KIN-FR-034`, `KIN-FR-035` | Engineering Insights (37 topics, 4 tracks) & Technical Library (10 modules), citations, deep-links | `ENGINEERING_INSIGHTS_CURRICULUM.md`, `TECHNICAL_LIBRARY_STRUCTURE.md`, `LEARNING_CONTENT_SCHEMA.md` | Schema validation & link audit | `AC-016`, `AC-019` |
| `KIN-FR-036`, `KIN-FR-037`, `KIN-FR-038`, `KIN-FR-039`, `KIN-FR-040`, `KIN-FR-041` | Equation transparency drawer, assumption warnings, SI precision, JSON export, invalid input error banner & edge-case guards | `EQUATION_REFERENCE.md`, `SIMULATION_ERROR_HANDLING.md`, `ERROR_CONTRACTS.md` | `TEST-EDGE-001`..`019`, schema export check | `AC-019`, `AC-021` |
| `KIN-FR-042`, `KIN-FR-043`, `KIN-FR-044`, `KIN-FR-045`, `KIN-FR-046`, `KIN-FR-047`, `KIN-FR-048` | Offline Service Worker core, Worker execution, optional FastAPI non-blocking degradation, citations & exclusions compliance, responsive access | `OFFLINE_FIRST_ARCHITECTURE.md`, `WORKER_COMMUNICATION.md`, `TECHNICAL_REFERENCE_POLICY.md`, `BACKEND_ARCHITECTURE.md` | `TEST-PERF-009`, offline Playwright E2E, `AC-022` audit | `AC-017`, `AC-018`, `AC-019`, `AC-020`, `AC-022` |

### 3.2 Non-Functional Requirements (`KIN-NFR-001`–`KIN-NFR-022`)
All 22 non-functional requirements defined in [`NON_FUNCTIONAL_REQUIREMENTS.md`](../01-product-specification/NON_FUNCTIONAL_REQUIREMENTS.md):

| Req ID | Attribute | Governing Specification | Verification Case | Target AC |
| :--- | :--- | :--- | :--- | :--- |
| `KIN-NFR-001` | 3D Geometry Budget ($\le 150\text{k}$ target / $\le 180\text{k}$ cap) | `3D_PERFORMANCE_BUDGET.md` | `TEST-PERF-001` | `AC-020` |
| `KIN-NFR-002` | 3D Draw Calls ($\le 120$) | `3D_PERFORMANCE_BUDGET.md` | `TEST-PERF-002` | `AC-020` |
| `KIN-NFR-003` | Frame Rate ($\ge 60\text{ FPS}$ desktop / $\ge 30\text{ FPS}$ mobile) | `3D_PERFORMANCE_BUDGET.md` | `TEST-PERF-003`, `004` | `AC-020` |
| `KIN-NFR-004` | Asset Lazy Loading & Disposal | `3D_PERFORMANCE_BUDGET.md` | `TEST-PERF-010`, `TEST-3D-001` | `AC-020` |
| `KIN-NFR-005` | Simulation Latency ($\le 50\text{ ms}$ sweep / $\le 16\text{ ms}$ step) | `SIMULATION_ENGINE_SPECIFICATION.md` | `TEST-PERF-005`, `006`, `007` | `AC-017` |
| `KIN-NFR-006` | Initial Cold Cached Boot ($\le 3.0\text{ s}$) | `OFFLINE_FIRST_ARCHITECTURE.md` | `TEST-PERF-009` | `AC-018` |
| `KIN-NFR-007` | Determinism Across Runs/Platforms | `SIMULATION_ENGINE_SPECIFICATION.md`, `ADR-003` | Native `cargo test` == WASM output parity | `AC-017` |
| `KIN-NFR-008` | Numerical Accuracy (Analytical Match) | `ENGINEERING_VALIDATION_PLAN.md` | Tier A/B/C analytical tests (`eq.*`) | `AC-008`..`AC-013` |
| `KIN-NFR-009` | SI Unit Invariance Internally (`ADR-005`) | `DATA_MODEL.md`, `SIMULATION_CONTRACTS.md` | Unit invariance & schema checks | `AC-017` |
| `KIN-NFR-010` | Data Integrity & Referential Graph Checks | `CANONICAL_ID_REGISTRY.md`, `DATA_MODEL.md` | JSON Schema + foreign-key script | `AC-006` |
| `KIN-NFR-011` | Offline Core Autonomy | `OFFLINE_FIRST_ARCHITECTURE.md` | Offline Chromium Playwright suite | `AC-018` |
| `KIN-NFR-012` | Backend Strictly Non-Blocking (`ADR-004`) | `BACKEND_ARCHITECTURE.md` | API blocked / `503` failover E2E | `AC-018` |
| `KIN-NFR-013` | Graceful Error Handling (Zero Panics) | `SIMULATION_ERROR_HANDLING.md`, `ERROR_CONTRACTS.md` | `TEST-EDGE-001`..`019` | `AC-021` |
| `KIN-NFR-014` | Accessibility WCAG AA Contrast & Labels | `DESIGN_SYSTEM.md` | Axe/Playwright contrast & ARIA scan | `AC-020` |
| `KIN-NFR-015` | Shared Config Architecture & Keyboard Alt | `APPLICATION_STRUCTURE.md`, `COMPONENT_INTERACTION_SPECIFICATION.md`, `ADR-001` | `TEST-3D-008` + zero-fork code check | `AC-003`, `AC-020` |
| `KIN-NFR-016` | Reduced Motion (`prefers-reduced-motion`) | `ANIMATION_SYSTEM.md`, `CAMERA_AND_VIEWPORT_SPECIFICATION.md` | `TEST-3D-008` | `AC-020` |
| `KIN-NFR-017` | Responsive Viewport Layout ($\ge 360\text{ px}$ to $4\text{K}$) | `DESIGN_SYSTEM.md` | Responsive viewport snapshot checks | `AC-001` |
| `KIN-NFR-018` | Modern Evergreen Browser Support (WebGL2 + WASM) | `FRONTEND_ARCHITECTURE.md`, `BUILD_AND_RELEASE_PROCESS.md` | Cross-browser Chromium/Firefox/WebKit suite | `AC-001` |
| `KIN-NFR-019` | Client Security (CSP, Zero Eval, Safe Math/Markdown) | `SECURITY_CONSIDERATIONS.md` | CSP header check & XSS fuzz suite | `AC-018` |
| `KIN-NFR-020` | Optional Backend Input Bounds & Rate Limiting | `SECURITY_CONSIDERATIONS.md`, `API_SPECIFICATION.md` | `pytest` parity & payload cap tests | `AC-021` |
| `KIN-NFR-021` | Maintainability & Modular Crates/Components | `SYSTEM_ARCHITECTURE.md`, `MAINTENANCE_AND_FUTURE_EXPANSION.md` | Workspace clippy/lint & modular boundaries | `AC-003` |
| `KIN-NFR-022` | Traceable SemVer & Schema Versioning | `DATA_VERSIONING.md`, `BUILD_AND_RELEASE_PROCESS.md` | Schema header & git tag check | `AC-019` |

---

## 4. Engineering Domain Requirements Traceability

### 4.1 Vehicle Architecture (`KIN-VEH-001`–`KIN-VEH-028`)
| Req IDs | Domain Document | Verified By | Target AC |
| :--- | :--- | :--- | :--- |
| `KIN-VEH-001`, `KIN-VEH-002`, `KIN-VEH-003`, `KIN-VEH-004`, `KIN-VEH-005`, `KIN-VEH-006`, `KIN-VEH-007`, `KIN-VEH-008` | `VEHICLE_ARCHITECTURE_OVERVIEW.md` | `TEST-TOPO-001..007`, Schema check, shared core audit | `AC-002`, `AC-003`, `AC-004` |
| `KIN-VEH-009`, `KIN-VEH-010`, `KIN-VEH-011`, `KIN-VEH-012`, `KIN-VEH-013`, `KIN-VEH-014`, `KIN-VEH-015` | `VEHICLE_CONFIGURATION_SPECIFICATION.md` | `TEST-TOPO-001..007`, `TEST-3D-001` | `AC-002`, `AC-009` |
| `KIN-VEH-016`, `KIN-VEH-017`, `KIN-VEH-018` | `DRIVETRAIN_TOPOLOGY.md` | `TEST-TOPO-NEG-001..005`, cycle & reachability tests | `AC-009`, `AC-021` |
| `KIN-VEH-019`, `KIN-VEH-020` | `POWER_FLOW_TOPOLOGY.md` | `TEST-3D-007`, `TEST-SIM-007` regen flow | `AC-007` |
| `KIN-VEH-021`, `KIN-VEH-022`, `KIN-VEH-023` | `COMPONENT_ANATOMY_SPECIFICATION.md` | `TEST-3D-002`, canonical ID referential test | `AC-004`, `AC-006` |
| `KIN-VEH-024` | `COMPONENT_RELATIONSHIPS.md` | Topology edge schema & inspector link check | `AC-006` |
| `KIN-VEH-025`, `KIN-VEH-026` | `SUSPENSION_AND_STEERING_SPECIFICATION.md` | Visual suspension inspect + V1 boundary label check | `AC-004`, `AC-022` |
| `KIN-VEH-027`, `KIN-VEH-028` | `BRAKING_SYSTEM_SPECIFICATION.md` | `TEST-SIM-010` + conceptual ABS disclosure check | `AC-004`, `AC-012`, `AC-022` |

### 4.2 Powertrain Engineering (`KIN-PWT-001`–`KIN-PWT-028`)
| Req IDs | Domain Document | Governing Equations / Tests | Target AC |
| :--- | :--- | :--- | :--- |
| `KIN-PWT-001`, `KIN-PWT-002`, `KIN-PWT-003`, `KIN-PWT-004` | `POWERTRAIN_ENGINEERING_OVERVIEW.md` | `eq.powertrain.angular-velocity`, `mechanical-power`, SI check | `AC-008` |
| `KIN-PWT-005`, `KIN-PWT-006`, `KIN-PWT-007`, `KIN-PWT-008` | `ICE_ENGINE_MODEL.md` | `eq.powertrain.ice-displacement`, `ice-torque-output`, `TEST-SIM-001` | `AC-008`, `AC-019` |
| `KIN-PWT-009`, `KIN-PWT-010`, `KIN-PWT-011`, `KIN-PWT-012`, `KIN-PWT-013` | `EV_POWERTRAIN_MODEL.md` | `eq.ev.motor-envelope`, `electrical-power`, `motor-efficiency`, `energy-consumption`, `TEST-SIM-005..007` | `AC-008` |
| `KIN-PWT-014`, `KIN-PWT-015`, `KIN-PWT-016` | `TRANSMISSION_MODEL.md` | `eq.powertrain.gearbox-torque`, `wheel-rpm`, `TEST-EDGE-006`, `007` | `AC-008` |
| `KIN-PWT-017`, `KIN-PWT-018`, `KIN-PWT-019`, `KIN-PWT-020`, `KIN-PWT-021` | `DIFFERENTIAL_MODEL.md` | `eq.powertrain.open-diff`, `lsd-diff`, `locked-diff`, `TEST-SIM-003`, `004`, `006` | `AC-009` |
| `KIN-PWT-022`, `KIN-PWT-023`, `KIN-PWT-024` | `DRIVETRAIN_EFFICIENCY_MODEL.md` | Stage-product invariants, `TEST-EDGE-008` | `AC-008`, `AC-019` |
| `KIN-PWT-025`, `KIN-PWT-026`, `KIN-PWT-027`, `KIN-PWT-028` | `POWERTRAIN_JOURNEY_SPECIFICATION.md` | `TEST-3D-007` | `AC-007` |

### 4.3 Vehicle Dynamics (`KIN-VDY-001`–`KIN-VDY-028`)
| Req IDs | Domain Document | Governing Equations / Tests | Target AC |
| :--- | :--- | :--- | :--- |
| `KIN-VDY-001`, `KIN-VDY-002`, `KIN-VDY-003`, `KIN-VDY-004` | `VEHICLE_DYNAMICS_OVERVIEW.md` | ISO 8855 sign check + transparent assumption drawer | `AC-010`..`AC-013`, `AC-019` |
| `KIN-VDY-005`, `KIN-VDY-006`, `KIN-VDY-007`, `KIN-VDY-008`, `KIN-VDY-009` | `LONGITUDINAL_DYNAMICS.md` | `eq.dynamics.longitudinal-*`, `aero-drag`, `rolling-resistance`, `grade-resistance`, `TEST-SIM-008` | `AC-010` |
| `KIN-VDY-010`, `KIN-VDY-011`, `KIN-VDY-012`, `KIN-VDY-013`, `KIN-VDY-014` | `LATERAL_DYNAMICS_BICYCLE_MODEL.md` | `eq.dynamics.bicycle-*`, `tire-linear-lateral`, `understeer-gradient`, `TEST-SIM-009` | `AC-011`, `AC-022` |
| `KIN-VDY-015`, `KIN-VDY-016`, `KIN-VDY-017`, `KIN-VDY-018` | `BRAKING_DYNAMICS.md` | `eq.dynamics.braking-force`, `stopping-distance`, `TEST-SIM-010` | `AC-012` |
| `KIN-VDY-019`, `KIN-VDY-020`, `KIN-VDY-021` | `WEIGHT_TRANSFER_MODEL.md` | `eq.dynamics.weight-transfer-*`, $\sum F_z = mg\cos\theta$, `TEST-SIM-002`, `TEST-EDGE-015` | `AC-012`, `AC-022` |
| `KIN-VDY-022`, `KIN-VDY-023`, `KIN-VDY-024`, `KIN-VDY-025` | `TIRE_TRACTION_AND_FRICTION_MODEL.md` | `eq.dynamics.friction-limit`, `friction-circle`, `TEST-SIM-011`, `TEST-EDGE-014` | `AC-013`, `AC-022` |
| `KIN-VDY-026`, `KIN-VDY-027`, `KIN-VDY-028` | `VEHICLE_PERFORMANCE_ANALYSIS.md` | `TEST-SIM-012` + `Simulated Model Estimate` badge check | `AC-014` |

### 4.4 Simulation Engine (`KIN-SIM-001`–`KIN-SIM-030`)
| Req IDs | Domain Document | Verification / Tests | Target AC |
| :--- | :--- | :--- | :--- |
| `KIN-SIM-001`, `KIN-SIM-002`, `KIN-SIM-003`, `KIN-SIM-004`, `KIN-SIM-005` | `SIMULATION_ARCHITECTURE.md` | `TEST-PERF-005..008`, `TEST-TOPO-NEG-001`, shared core audit | `AC-003`, `AC-017` |
| `KIN-SIM-006`, `KIN-SIM-007`, `KIN-SIM-008`, `KIN-SIM-009` | `SIMULATION_ENGINE_SPECIFICATION.md` | Bit-determinism native vs WASM, `TEST-EDGE-017`, perf latency | `AC-017`, `AC-021` |
| `KIN-SIM-010`, `KIN-SIM-011`, `KIN-SIM-012`, `KIN-SIM-013`, `KIN-SIM-014` | `POWERTRAIN_SIMULATION_SPECIFICATION.md` | `TEST-SIM-001`, `003`..`007`, `WARN_4WD_WINDUP_RISK` | `AC-008`, `AC-009` |
| `KIN-SIM-015`, `KIN-SIM-016`, `KIN-SIM-017`, `KIN-SIM-018`, `KIN-SIM-019` | `VEHICLE_DYNAMICS_SIMULATION_SPECIFICATION.md` | `TEST-SIM-002`, `008`..`011` | `AC-010`..`AC-013` |
| `KIN-SIM-020`, `KIN-SIM-021`, `KIN-SIM-022` | `CONFIGURATION_COMPARISON_SPECIFICATION.md` | `TEST-SIM-012`, neutral engineering tone review | `AC-015` |
| `KIN-SIM-023`, `KIN-SIM-024` | `SIMULATION_STATE_AND_LIFECYCLE.md` | Worker cancellation & stale frame rejection unit test | `AC-017` |
| `KIN-SIM-025`, `KIN-SIM-026`, `KIN-SIM-027` | `NUMERICAL_METHODS_AND_STABILITY.md` | RK4 vs Euler convergence & zero-NaN property tests | `AC-010`, `AC-021` |
| `KIN-SIM-028`, `KIN-SIM-029`, `KIN-SIM-030` | `SIMULATION_ERROR_HANDLING.md` | `TEST-EDGE-001`..`019`, `#![deny(clippy::unwrap_used)]` | `AC-021` |

### 4.5 Data Contracts, 3D Visualization & Quality Assurance (`KIN-DATA-001`–`025`, `KIN-3D-001`–`025`, `KIN-QA-001`–`020`)
| Req IDs | Domain Documents | Verification / Tests | Target AC |
| :--- | :--- | :--- | :--- |
| `KIN-DATA-001`, `KIN-DATA-002`, `KIN-DATA-003`, `KIN-DATA-004`, `KIN-DATA-005` | `DATA_MODEL.md` | Schema validation + FK graph integrity check | `AC-006`, `AC-017` |
| `KIN-DATA-006`, `KIN-DATA-007`, `KIN-DATA-008`, `KIN-DATA-009` | `CANONICAL_ID_REGISTRY.md` | Canonical ID regex + cross-reference uniqueness audit | `AC-002`, `AC-006` |
| `KIN-DATA-010`, `KIN-DATA-011`, `KIN-DATA-012` | `VEHICLE_CONFIGURATION_SCHEMA.md` | `vehicle-configuration.schema.json` + $a+b=L$ invariant | `AC-002` |
| `KIN-DATA-013`, `KIN-DATA-014` | `COMPONENT_SCHEMA.md` | `component.schema.json` Draft 2020-12 CI check | `AC-006` |
| `KIN-DATA-015`, `KIN-DATA-016`, `KIN-DATA-017`, `KIN-DATA-018` | `SIMULATION_CONTRACTS.md` | `simulation-request` & `simulation-response` schema checks | `AC-014`, `AC-017` |
| `KIN-DATA-019`, `KIN-DATA-020`, `KIN-DATA-021` | `API_SPECIFICATION.md` | Worker RPC + optional FastAPI `pytest` contract tests | `AC-018` |
| `KIN-DATA-022`, `KIN-DATA-023` | `ERROR_CONTRACTS.md` | Canonical `ERR_*` / `WARN_*` contract parity suite | `AC-021` |
| `KIN-DATA-024`, `KIN-DATA-025` | `DATA_VERSIONING.md` | SemVer compatibility & alias preservation checks | `AC-019` |
| `KIN-3D-001`, `KIN-3D-002`, `KIN-3D-003` | `VISUAL_IDENTITY.md` | Visual/contrast audit + material inspection test | `AC-020` |
| `KIN-3D-004`, `KIN-3D-005` | `DESIGN_SYSTEM.md` | Viewport obstruction ($\ge 60\%$ free) & typography checks | `AC-020` |
| `KIN-3D-006`, `KIN-3D-007`, `KIN-3D-008`, `KIN-3D-009` | `3D_ASSET_SPECIFICATION.md` | GLB Draco check, `userData.canonicalId`, $\det=+1$ transform test | `AC-004`, `AC-006` |
| `KIN-3D-010`, `KIN-3D-011` | `ASSEMBLY_HIERARCHY.md` | `TEST-3D-001`, shared modular assembly audit | `AC-003`, `AC-004` |
| `KIN-3D-012`, `KIN-3D-013`, `KIN-3D-014`, `KIN-3D-015` | `COMPONENT_INTERACTION_SPECIFICATION.md` | `TEST-3D-002`, `TEST-3D-003` | `AC-005`, `AC-006` |
| `KIN-3D-016`, `KIN-3D-017`, `KIN-3D-018` | `EXPLODED_VIEW_AND_SECTION_CUT.md` | `TEST-3D-004`, `TEST-3D-005` | `AC-005` |
| `KIN-3D-019`, `KIN-3D-020` | `CAMERA_AND_VIEWPORT_SPECIFICATION.md` | `TEST-3D-006`, `TEST-3D-008` | `AC-005`, `AC-020` |
| `KIN-3D-021`, `KIN-3D-022`, `KIN-3D-023` | `ANIMATION_SYSTEM.md` | `TEST-3D-007`, `TEST-3D-008` | `AC-007`, `AC-020` |
| `KIN-3D-024`, `KIN-3D-025` | `3D_PERFORMANCE_BUDGET.md` | `TEST-PERF-001`..`004`, `TEST-PERF-010` | `AC-020` |
| `KIN-QA-001`, `KIN-QA-002`, `KIN-QA-003` | `TEST_STRATEGY.md` | CI pipeline zero-skip & WASM parity gate | `AC-001`..`AC-022` |
| `KIN-QA-004`, `KIN-QA-005`, `KIN-QA-006` | `ENGINEERING_VALIDATION_PLAN.md` | Analytical validation CI job (`cargo test --test analytical_benchmarks`) | `AC-008`..`AC-015` |
| `KIN-QA-007`, `KIN-QA-008` | `UNIT_AND_INTEGRATION_TEST_PLAN.md` | `cargo test`, Vitest, `pytest` suites | `AC-006`, `AC-017` |
| `KIN-QA-009`, `KIN-QA-010`, `KIN-QA-011` | `SIMULATION_TEST_CASES.md` | `TEST-SIM-001`..`012`, `TEST-EDGE-001`..`019` | `AC-008`..`AC-015`, `AC-021` |
| `KIN-QA-012`, `KIN-QA-013` | `TOPOLOGY_VALIDATION_TESTS.md` | `TEST-TOPO-001`..`007`, `TEST-TOPO-NEG-001`..`005` | `AC-002`, `AC-009`, `AC-021` |
| `KIN-QA-014`, `KIN-QA-015` | `3D_AND_INTERACTION_TEST_PLAN.md` | `TEST-3D-001`..`008` | `AC-004`..`AC-007`, `AC-020` |
| `KIN-QA-016`, `KIN-QA-017` | `PERFORMANCE_TEST_PLAN.md` | `TEST-PERF-001`..`010` | `AC-017`, `AC-018`, `AC-020` |
| `KIN-QA-018`, `KIN-QA-019`, `KIN-QA-020` | `ACCEPTANCE_TEST_PLAN.md` | Release Candidate E2E gate (`AC-001`..`022`) | `AC-001`..`AC-022` |

---

## 5. Cross-References

- [`DOCUMENTATION_CROSS_REFERENCE_MATRIX.md`](DOCUMENTATION_CROSS_REFERENCE_MATRIX.md)
- [`../00-project-foundation/PRODUCT_REQUIREMENTS_DOCUMENT.md`](../00-project-foundation/PRODUCT_REQUIREMENTS_DOCUMENT.md)
- [`../01-product-specification/ACCEPTANCE_CRITERIA.md`](../01-product-specification/ACCEPTANCE_CRITERIA.md)
- [`../10-quality-assurance/ACCEPTANCE_TEST_PLAN.md`](../10-quality-assurance/ACCEPTANCE_TEST_PLAN.md)
