# KINERA Documentation Index

Master directory of all Phase 0 engineering, product, architecture, data, 3D, learning, QA, and governance specifications for **KINERA — Automotive Powertrain & Vehicle Dynamics Explorer**.

---

## Root Governance & Tracking

| Document | Purpose | Path |
| :--- | :--- | :--- |
| Documentation README | Entry point, product identity, pillars, and stack overview | [`README.md`](README.md) |
| Documentation Index | Complete map of all Phase 0 specifications | [`DOCUMENTATION_INDEX.md`](DOCUMENTATION_INDEX.md) |
| Documentation Status | Living tracker of completion, reviews, commits, and pushes | [`DOCUMENTATION_STATUS.md`](DOCUMENTATION_STATUS.md) |
| Changelog | Chronological log of Phase 0 documentation changes | [`CHANGELOG.md`](CHANGELOG.md) |

---

## 00 — Project Foundation (`00-project-foundation/`)

| Document | Summary |
| :--- | :--- |
| [`PROJECT_CHARTER.md`](00-project-foundation/PROJECT_CHARTER.md) | Authorization, locked decisions, governance, stakeholders, and success criteria |
| [`PRODUCT_VISION.md`](00-project-foundation/PRODUCT_VISION.md) | Vision, six product philosophy principles, three pillars, and educational identity |
| [`PRODUCT_REQUIREMENTS_DOCUMENT.md`](00-project-foundation/PRODUCT_REQUIREMENTS_DOCUMENT.md) | Master PRD with `KIN-PRD-xxx` requirements across all V1 capabilities |
| [`PRODUCT_SCOPE.md`](00-project-foundation/PRODUCT_SCOPE.md) | Explicit V1 scope inclusions, fidelity levels, and V1 exclusions |
| [`GLOSSARY.md`](00-project-foundation/GLOSSARY.md) | Authoritative automotive, simulation, and software terminology |
| [`ASSUMPTIONS_AND_CONSTRAINTS.md`](00-project-foundation/ASSUMPTIONS_AND_CONSTRAINTS.md) | Engineering, mathematical, technical, and educational assumptions and constraints |

## 01 — Product Specification (`01-product-specification/`)

| Document | Summary |
| :--- | :--- |
| [`APPLICATION_STRUCTURE.md`](01-product-specification/APPLICATION_STRUCTURE.md) | Six application sections, routing, navigation, and configuration selector behavior |
| [`USER_PERSONAS_AND_JOURNEYS.md`](01-product-specification/USER_PERSONAS_AND_JOURNEYS.md) | Target personas, workflows, and educational user journeys |
| [`FUNCTIONAL_REQUIREMENTS.md`](01-product-specification/FUNCTIONAL_REQUIREMENTS.md) | Detailed `KIN-FR-xxx` functional requirements across all modules |
| [`NON_FUNCTIONAL_REQUIREMENTS.md`](01-product-specification/NON_FUNCTIONAL_REQUIREMENTS.md) | Measurable `KIN-NFR-xxx` requirements (performance, offline, accessibility, determinism) |
| [`FEATURE_SPECIFICATIONS.md`](01-product-specification/FEATURE_SPECIFICATIONS.md) | Feature-by-feature specification for Overview, Anatomy, Journey, Simulator, Insights, Library |
| [`ACCEPTANCE_CRITERIA.md`](01-product-specification/ACCEPTANCE_CRITERIA.md) | Verifiable V1 acceptance criteria mapped to requirements and test methods |

## 02 — Vehicle Architecture (`02-vehicle-architecture/`)

| Document | Summary |
| :--- | :--- |
| [`VEHICLE_ARCHITECTURE_OVERVIEW.md`](02-vehicle-architecture/VEHICLE_ARCHITECTURE_OVERVIEW.md) | Configuration-driven architecture strategy across seven canonical vehicle layouts |
| [`VEHICLE_CONFIGURATION_SPECIFICATION.md`](02-vehicle-architecture/VEHICLE_CONFIGURATION_SPECIFICATION.md) | Formal specification of all seven canonical configurations (`ICE-FWD` through `EV-DUAL-AWD`) |
| [`ICE_ARCHITECTURE.md`](02-vehicle-architecture/ICE_ARCHITECTURE.md) | Detailed ICE platform architectures (`ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `ICE-4WD`) |
| [`EV_ARCHITECTURE.md`](02-vehicle-architecture/EV_ARCHITECTURE.md) | Detailed EV platform architectures (`EV-FWD`, `EV-RWD`, `EV-DUAL-AWD`) |
| [`DRIVETRAIN_TOPOLOGY.md`](02-vehicle-architecture/DRIVETRAIN_TOPOLOGY.md) | Directed mechanical/electrical drivetrain graphs, shafts, joints, and axles |
| [`POWER_FLOW_TOPOLOGY.md`](02-vehicle-architecture/POWER_FLOW_TOPOLOGY.md) | Forward propulsion and regenerative braking power-flow paths per configuration |
| [`COMPONENT_ANATOMY_SPECIFICATION.md`](02-vehicle-architecture/COMPONENT_ANATOMY_SPECIFICATION.md) | Complete component breakdown across all seven vehicle systems |
| [`COMPONENT_RELATIONSHIPS.md`](02-vehicle-architecture/COMPONENT_RELATIONSHIPS.md) | Canonical component-to-component mechanical, electrical, and control graph |
| [`SUSPENSION_AND_STEERING_SPECIFICATION.md`](02-vehicle-architecture/SUSPENSION_AND_STEERING_SPECIFICATION.md) | Suspension and steering subsystem anatomy, parameters, and V1 dynamics links |
| [`BRAKING_SYSTEM_SPECIFICATION.md`](02-vehicle-architecture/BRAKING_SYSTEM_SPECIFICATION.md) | Hydraulic, friction, ABS conceptual, and EV regenerative braking anatomy |

## 03 — Powertrain Engineering (`03-powertrain-engineering/`)

| Document | Summary |
| :--- | :--- |
| [`POWERTRAIN_ENGINEERING_OVERVIEW.md`](03-powertrain-engineering/POWERTRAIN_ENGINEERING_OVERVIEW.md) | Unified powertrain engineering framework separating engine/motor models from layout |
| [`ICE_ENGINE_MODEL.md`](03-powertrain-engineering/ICE_ENGINE_MODEL.md) | Reference naturally aspirated inline-four gasoline engine & four-stroke mathematical model |
| [`EV_POWERTRAIN_MODEL.md`](03-powertrain-engineering/EV_POWERTRAIN_MODEL.md) | Battery pack, BMS, inverter, PMSM/induction reference motor, and regen model |
| [`TRANSMISSION_MODEL.md`](03-powertrain-engineering/TRANSMISSION_MODEL.md) | Manual gearbox, transaxle, single-speed EV reduction, transfer case, and conceptual AT |
| [`DIFFERENTIAL_MODEL.md`](03-powertrain-engineering/DIFFERENTIAL_MODEL.md) | Open, simplified LSD, locked, center differential, and EV electronic torque allocation |
| [`DRIVETRAIN_EFFICIENCY_MODEL.md`](03-powertrain-engineering/DRIVETRAIN_EFFICIENCY_MODEL.md) | Stage-by-stage loss accounting without double-counting across all 7 topologies |
| [`POWERTRAIN_JOURNEY_SPECIFICATION.md`](03-powertrain-engineering/POWERTRAIN_JOURNEY_SPECIFICATION.md) | Step-by-step interactive energy, torque, RPM, and regen flow specifications |

## 04 — Vehicle Dynamics (`04-vehicle-dynamics/`)

| Document | Summary |
| :--- | :--- |
| [`VEHICLE_DYNAMICS_OVERVIEW.md`](04-vehicle-dynamics/VEHICLE_DYNAMICS_OVERVIEW.md) | Core V1 vehicle dynamics architecture, SAE/ISO coordinate conventions, and scope |
| [`LONGITUDINAL_DYNAMICS.md`](04-vehicle-dynamics/LONGITUDINAL_DYNAMICS.md) | Tractive force, aero drag, rolling resistance, grade resistance, and integration |
| [`LATERAL_DYNAMICS_BICYCLE_MODEL.md`](04-vehicle-dynamics/LATERAL_DYNAMICS_BICYCLE_MODEL.md) | 2-DOF linear bicycle model, yaw rate, sideslip, understeer/oversteer, validity limits |
| [`BRAKING_DYNAMICS.md`](04-vehicle-dynamics/BRAKING_DYNAMICS.md) | Deceleration, stopping distance, brake bias, friction limits, conceptual ABS |
| [`WEIGHT_TRANSFER_MODEL.md`](04-vehicle-dynamics/WEIGHT_TRANSFER_MODEL.md) | Quasi-static longitudinal and lateral axle/wheel load transfer and limitations |
| [`TIRE_TRACTION_AND_FRICTION_MODEL.md`](04-vehicle-dynamics/TIRE_TRACTION_AND_FRICTION_MODEL.md) | Normal-load friction bounds, wheel slip indicators, and simplified friction circle |
| [`VEHICLE_PERFORMANCE_ANALYSIS.md`](04-vehicle-dynamics/VEHICLE_PERFORMANCE_ANALYSIS.md) | 0–100 km/h, quarter-mile, top speed, braking distance, gradeability, energy metrics |

## 05 — Simulation Engine (`05-simulation-engine/`)

| Document | Summary |
| :--- | :--- |
| [`SIMULATION_ARCHITECTURE.md`](05-simulation-engine/SIMULATION_ARCHITECTURE.md) | Shared topology-driven simulation framework across all seven configurations |
| [`SIMULATION_ENGINE_SPECIFICATION.md`](05-simulation-engine/SIMULATION_ENGINE_SPECIFICATION.md) | Core simulation loop, coupling between powertrain and dynamics, determinism |
| [`POWERTRAIN_SIMULATION_SPECIFICATION.md`](05-simulation-engine/POWERTRAIN_SIMULATION_SPECIFICATION.md) | ICE & EV powertrain solver rules, per-axle/wheel torque routing, edge cases |
| [`VEHICLE_DYNAMICS_SIMULATION_SPECIFICATION.md`](05-simulation-engine/VEHICLE_DYNAMICS_SIMULATION_SPECIFICATION.md) | Longitudinal, lateral, braking, traction, and weight transfer execution specs |
| [`CONFIGURATION_COMPARISON_SPECIFICATION.md`](05-simulation-engine/CONFIGURATION_COMPARISON_SPECIFICATION.md) | Controlled scenario matching, divergence alerts, and multi-config evaluation |
| [`SIMULATION_STATE_AND_LIFECYCLE.md`](05-simulation-engine/SIMULATION_STATE_AND_LIFECYCLE.md) | Lifecycle state machine, reset, replay, scrubbing, and determinism guarantees |
| [`NUMERICAL_METHODS_AND_STABILITY.md`](05-simulation-engine/NUMERICAL_METHODS_AND_STABILITY.md) | Euler/RK4 integrators, time-step bounds, bicycle model stability, tolerances |
| [`SIMULATION_ERROR_HANDLING.md`](05-simulation-engine/SIMULATION_ERROR_HANDLING.md) | Input validation, NaN/Inf guards, physical domain clamps, structured error codes |

## 06 — Software Architecture (`06-software-architecture/`)

| Document | Summary |
| :--- | :--- |
| [`SYSTEM_ARCHITECTURE.md`](06-software-architecture/SYSTEM_ARCHITECTURE.md) | End-to-end architecture: React/Three.js UI, Worker/WASM physics, static data, FastAPI |
| [`FRONTEND_ARCHITECTURE.md`](06-software-architecture/FRONTEND_ARCHITECTURE.md) | Vite, React, TypeScript, R3F/Drei module layout, routing, and view isolation |
| [`BACKEND_ARCHITECTURE.md`](06-software-architecture/BACKEND_ARCHITECTURE.md) | Optional Python/FastAPI/Pydantic responsibilities and strict non-blocking boundaries |
| [`RUST_WASM_ARCHITECTURE.md`](06-software-architecture/RUST_WASM_ARCHITECTURE.md) | Rust crate structure, WASM ABI, zero-copy/JSON contracts, unit invariants |
| [`WORKER_COMMUNICATION.md`](06-software-architecture/WORKER_COMMUNICATION.md) | Web Worker message protocol, request correlation, cancellation, and throttling |
| [`DATA_FLOW.md`](06-software-architecture/DATA_FLOW.md) | Unidirectional data flow across registries, Zustand stores, Worker, and R3F |
| [`OFFLINE_FIRST_ARCHITECTURE.md`](06-software-architecture/OFFLINE_FIRST_ARCHITECTURE.md) | Service Worker, bundled JSON/WASM/GLB assets, offline capability matrix |
| [`STATE_MANAGEMENT.md`](06-software-architecture/STATE_MANAGEMENT.md) | Zustand store slices, shared vehicle state contract, and transient 60fps ref buffers |
| [`TECHNOLOGY_DECISIONS.md`](06-software-architecture/TECHNOLOGY_DECISIONS.md) | Architecture Decision Records (ADRs) locking stack choices and trade-offs |

## 07 — Data & Contracts (`07-data-and-contracts/`)

| Document | Summary |
| :--- | :--- |
| [`DATA_MODEL.md`](07-data-and-contracts/DATA_MODEL.md) | Full specification of all 27 domain entities, fields, types, and relationships |
| [`CANONICAL_ID_REGISTRY.md`](07-data-and-contracts/CANONICAL_ID_REGISTRY.md) | Grammar, lifecycle rules, and authoritative registry of all canonical IDs |
| [`VEHICLE_CONFIGURATION_SCHEMA.md`](07-data-and-contracts/VEHICLE_CONFIGURATION_SCHEMA.md) | Human-readable schema specification and examples for vehicle configurations |
| [`COMPONENT_SCHEMA.md`](07-data-and-contracts/COMPONENT_SCHEMA.md) | Component metadata contract, required/nullable/config-dependent field rules |
| [`SIMULATION_CONTRACTS.md`](07-data-and-contracts/SIMULATION_CONTRACTS.md) | Shared TypeScript/Rust/JSON contracts for simulation inputs, outputs, and comparisons |
| [`API_SPECIFICATION.md`](07-data-and-contracts/API_SPECIFICATION.md) | Internal worker APIs, static dataset loaders, and optional FastAPI endpoints |
| [`ERROR_CONTRACTS.md`](07-data-and-contracts/ERROR_CONTRACTS.md) | Unified error envelope across WASM, Worker, Frontend, and optional FastAPI |
| [`DATA_VERSIONING.md`](07-data-and-contracts/DATA_VERSIONING.md) | Semantic versioning, schema compatibility, migration, and ID deprecation rules |

## 08 — 3D & Visualization (`08-3d-and-visualization/`)

| Document | Summary |
| :--- | :--- |
| [`VISUAL_IDENTITY.md`](08-3d-and-visualization/VISUAL_IDENTITY.md) | Premium Automotive Engineering Laboratory aesthetic, palette, lighting, typography |
| [`DESIGN_SYSTEM.md`](08-3d-and-visualization/DESIGN_SYSTEM.md) | Color tokens, typography scales, technical HUD panels, responsive breakpoints |
| [`3D_ASSET_SPECIFICATION.md`](08-3d-and-visualization/3D_ASSET_SPECIFICATION.md) | Precision CAD/cutaway modeling standards, glTF/GLB pipeline, SI coordinate conventions |
| [`ASSEMBLY_HIERARCHY.md`](08-3d-and-visualization/ASSEMBLY_HIERARCHY.md) | Reusable modular assembly tree, pivots, and per-configuration mounting |
| [`COMPONENT_INTERACTION_SPECIFICATION.md`](08-3d-and-visualization/COMPONENT_INTERACTION_SPECIFICATION.md) | Raycast selection, hover, isolation, transparency, layer visibility, power-flow highlights |
| [`EXPLODED_VIEW_AND_SECTION_CUT.md`](08-3d-and-visualization/EXPLODED_VIEW_AND_SECTION_CUT.md) | Parametric explosion vectors and WebGL clipping-plane section-cut behavior |
| [`CAMERA_AND_VIEWPORT_SPECIFICATION.md`](08-3d-and-visualization/CAMERA_AND_VIEWPORT_SPECIFICATION.md) | Camera presets, orbit constraints, smooth transitions, and mobile viewport rules |
| [`ANIMATION_SYSTEM.md`](08-3d-and-visualization/ANIMATION_SYSTEM.md) | Cinematic showcase and guided engineering inspection animation sequence specs |
| [`3D_PERFORMANCE_BUDGET.md`](08-3d-and-visualization/3D_PERFORMANCE_BUDGET.md) | 150k triangle / 120 draw-call targets, adaptive quality tiers, lazy loading |

## 09 — Learning & Content (`09-learning-and-content/`)

| Document | Summary |
| :--- | :--- |
| [`ENGINEERING_INSIGHTS_CURRICULUM.md`](09-learning-and-content/ENGINEERING_INSIGHTS_CURRICULUM.md) | Complete specification of 37 topics across 4 Engineering Insights domains |
| [`TECHNICAL_LIBRARY_STRUCTURE.md`](09-learning-and-content/TECHNICAL_LIBRARY_STRUCTURE.md) | Full curriculum specification for all 10 Technical Library modules |
| [`LEARNING_CONTENT_SCHEMA.md`](09-learning-and-content/LEARNING_CONTENT_SCHEMA.md) | Structured content JSON contract preventing duplication with Insights/Library |
| [`EQUATION_REFERENCE.md`](09-learning-and-content/EQUATION_REFERENCE.md) | Authoritative registry of all engineering equations, SI units, limits, and verifications |
| [`GLOSSARY_AND_TERMINOLOGY.md`](09-learning-and-content/GLOSSARY_AND_TERMINOLOGY.md) | Normalized cross-domain terminology and symbol disambiguation rules |
| [`TECHNICAL_REFERENCE_POLICY.md`](09-learning-and-content/TECHNICAL_REFERENCE_POLICY.md) | Citation rules, verified engineering bibliography, and verification-status markers |

## 10 — Quality Assurance (`10-quality-assurance/`)

| Document | Summary |
| :--- | :--- |
| [`TEST_STRATEGY.md`](10-quality-assurance/TEST_STRATEGY.md) | Master QA pyramid across math, Rust/WASM, TypeScript, 3D, offline, and accessibility |
| [`ENGINEERING_VALIDATION_PLAN.md`](10-quality-assurance/ENGINEERING_VALIDATION_PLAN.md) | Analytical hand-calculation benchmarks, SI unit invariance, and physics conservation checks |
| [`UNIT_AND_INTEGRATION_TEST_PLAN.md`](10-quality-assurance/UNIT_AND_INTEGRATION_TEST_PLAN.md) | Rust unit tests, Vitest/TS contract tests, Worker bridge, and schema validation |
| [`SIMULATION_TEST_CASES.md`](10-quality-assurance/SIMULATION_TEST_CASES.md) | Catalog of deterministic `TEST-SIM-xxx` test cases and boundary edge cases |
| [`TOPOLOGY_VALIDATION_TESTS.md`](10-quality-assurance/TOPOLOGY_VALIDATION_TESTS.md) | Graph connectivity, axle power-path, and registry integrity tests for all 7 configs |
| [`3D_AND_INTERACTION_TEST_PLAN.md`](10-quality-assurance/3D_AND_INTERACTION_TEST_PLAN.md) | Vehicle switching, isolation, exploded view, section cut, and mobile WebGL tests |
| [`PERFORMANCE_TEST_PLAN.md`](10-quality-assurance/PERFORMANCE_TEST_PLAN.md) | Frame-time, draw-call, WASM step latency, memory, and bundle size benchmarks |
| [`ACCEPTANCE_TEST_PLAN.md`](10-quality-assurance/ACCEPTANCE_TEST_PLAN.md) | Release-gate acceptance procedures mapping to `ACCEPTANCE_CRITERIA.md` |

## 11 — Delivery & Operations (`11-delivery-and-operations/`)

| Document | Summary |
| :--- | :--- |
| [`IMPLEMENTATION_ROADMAP.md`](11-delivery-and-operations/IMPLEMENTATION_ROADMAP.md) | Phase 0 through Phase 7 roadmap with objectives, deliverables, exit criteria, and risks |
| [`DEPLOYMENT_ARCHITECTURE.md`](11-delivery-and-operations/DEPLOYMENT_ARCHITECTURE.md) | Static CDN/edge PWA hosting for offline-first app + optional FastAPI topology |
| [`BUILD_AND_RELEASE_PROCESS.md`](11-delivery-and-operations/BUILD_AND_RELEASE_PROCESS.md) | Rust-to-WASM, Vite frontend, schema check, and CI/CD release pipeline |
| [`ENVIRONMENT_CONFIGURATION.md`](11-delivery-and-operations/ENVIRONMENT_CONFIGURATION.md) | Build-time and runtime configuration, feature flags, and environment variables |
| [`SECURITY_CONSIDERATIONS.md`](11-delivery-and-operations/SECURITY_CONSIDERATIONS.md) | Client-side CSP, WASM sandboxing, asset integrity, and optional API hardening |
| [`MAINTENANCE_AND_FUTURE_EXPANSION.md`](11-delivery-and-operations/MAINTENANCE_AND_FUTURE_EXPANSION.md) | Post-V1 extension hooks (hybrid powertrains, Pacejka tires, custom curves) |

## 12 — Project Governance (`12-project-governance/`)

| Document | Summary |
| :--- | :--- |
| [`REQUIREMENTS_TRACEABILITY_MATRIX.md`](12-project-governance/REQUIREMENTS_TRACEABILITY_MATRIX.md) | End-to-end traceability from `KIN-PRD` -> specs -> equations -> tests -> AC |
| [`DOCUMENTATION_CROSS_REFERENCE_MATRIX.md`](12-project-governance/DOCUMENTATION_CROSS_REFERENCE_MATRIX.md) | Inter-document dependency and consistency verification matrix |
| [`RISK_REGISTER.md`](12-project-governance/RISK_REGISTER.md) | Technical, physics-fidelity, 3D performance, and delivery risks with mitigations |
| [`DECISION_LOG.md`](12-project-governance/DECISION_LOG.md) | Formal record of locked product, engineering, and architecture decisions |
| [`DOCUMENTATION_AUDIT_REPORT.md`](12-project-governance/DOCUMENTATION_AUDIT_REPORT.md) | Results of automated and manual cross-document consistency audit |
| [`PHASE_0_COMPLETION_REPORT.md`](12-project-governance/PHASE_0_COMPLETION_REPORT.md) | Final Phase 0 readiness summary, coverage checklist, and Phase 1 handoff |

## Machine-Readable Schemas (`schemas/`)

| Schema | Validates |
| :--- | :--- |
| [`vehicle-configuration.schema.json`](schemas/vehicle-configuration.schema.json) | Canonical vehicle configuration definitions and drivetrain topologies |
| [`component.schema.json`](schemas/component.schema.json) | Component registry entries, metadata contracts, and relationships |
| [`simulation-input.schema.json`](schemas/simulation-input.schema.json) | Powertrain, vehicle dynamics, and comparison simulation requests |
| [`simulation-output.schema.json`](schemas/simulation-output.schema.json) | Simulation result payloads, units, time-series, and validity warnings |
| [`animation-sequence.schema.json`](schemas/animation-sequence.schema.json) | Cinematic and engineering inspection animation sequence definitions |
