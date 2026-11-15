# KINERA Phase 0 Documentation Changelog

All notable additions, revisions, and audit resolutions to the KINERA Phase 0 documentation package are recorded here.

## [0.1.0] - 2026-11-16 — Initialization & Repository Foundation

### Added
- Repository `.gitignore` covering macOS, Windows, IDE, Node/Vite, Python, Rust/WASM, environment secrets, and temporary cache artifacts.
- Root [`README.md`](../README.md) entrypoint linking to the Phase 0 documentation system.
- Documentation root files: [`docs/README.md`](README.md), [`docs/DOCUMENTATION_INDEX.md`](DOCUMENTATION_INDEX.md), [`docs/DOCUMENTATION_STATUS.md`](DOCUMENTATION_STATUS.md), and [`docs/CHANGELOG.md`](CHANGELOG.md).

## [0.2.0] - 2026-11-16 — Project Foundation (`00-project-foundation/`)

### Added
- `PROJECT_CHARTER.md`, `PRODUCT_VISION.md`, `PRODUCT_REQUIREMENTS_DOCUMENT.md` (`KIN-PRD-001`–`KIN-PRD-020`), `PRODUCT_SCOPE.md`, `GLOSSARY.md`, and `ASSUMPTIONS_AND_CONSTRAINTS.md`.
- Locked V1 identity, 3 core pillars, 6 application sections, 7 canonical configurations, SI internal unit constraints, and explicit out-of-scope exclusions.

## [0.3.0] - 2026-11-16 — Product Specification (`01-product-specification/`)

### Added
- `APPLICATION_STRUCTURE.md`, `USER_PERSONAS_AND_JOURNEYS.md`, `FUNCTIONAL_REQUIREMENTS.md` (`KIN-FR-001`–`KIN-FR-048`), `NON_FUNCTIONAL_REQUIREMENTS.md` (`KIN-NFR-001`–`KIN-NFR-022`), `FEATURE_SPECIFICATIONS.md`, and `ACCEPTANCE_CRITERIA.md` (`AC-001`–`AC-022`).

## [0.4.0] - 2026-11-16 — Vehicle Architecture Core (`02-vehicle-architecture/` part 1)

### Added
- `VEHICLE_ARCHITECTURE_OVERVIEW.md`, `VEHICLE_CONFIGURATION_SPECIFICATION.md`, `ICE_ARCHITECTURE.md`, and `EV_ARCHITECTURE.md` specifying all 7 canonical V1 vehicle configurations (`ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `ICE-4WD`, `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD`).

## [0.4.1] - 2026-11-16 — Drivetrain Topology & Vehicle Anatomy (`02-vehicle-architecture/` part 2)

### Added
- `DRIVETRAIN_TOPOLOGY.md`, `POWER_FLOW_TOPOLOGY.md`, `COMPONENT_ANATOMY_SPECIFICATION.md`, `COMPONENT_RELATIONSHIPS.md`, `SUSPENSION_AND_STEERING_SPECIFICATION.md`, and `BRAKING_SYSTEM_SPECIFICATION.md` (`KIN-VEH-016`–`KIN-VEH-028`).

## [0.5.0] - 2026-11-16 — Powertrain Models (`03-powertrain-engineering/` part 1)

### Added
- `POWERTRAIN_ENGINEERING_OVERVIEW.md`, `ICE_ENGINE_MODEL.md`, and `EV_POWERTRAIN_MODEL.md` (`KIN-PWT-001`–`KIN-PWT-013`).

## [0.5.1] - 2026-11-16 — Transmissions, Differentials, Efficiency & Journey (`03-powertrain-engineering/` part 2)

### Added
- `TRANSMISSION_MODEL.md`, `DIFFERENTIAL_MODEL.md`, `DRIVETRAIN_EFFICIENCY_MODEL.md`, and `POWERTRAIN_JOURNEY_SPECIFICATION.md` (`KIN-PWT-014`–`KIN-PWT-028`).

## [0.6.0] - 2026-11-16 — Vehicle Dynamics Longitudinal & Lateral (`04-vehicle-dynamics/` part 1)

### Added
- `VEHICLE_DYNAMICS_OVERVIEW.md`, `LONGITUDINAL_DYNAMICS.md`, and `LATERAL_DYNAMICS_BICYCLE_MODEL.md` (`KIN-VDY-001`–`KIN-VDY-014`).

## [0.6.1] - 2026-11-16 — Braking, Weight Transfer, Friction & Performance (`04-vehicle-dynamics/` part 2)

### Added
- `BRAKING_DYNAMICS.md`, `WEIGHT_TRANSFER_MODEL.md`, `TIRE_TRACTION_AND_FRICTION_MODEL.md`, and `VEHICLE_PERFORMANCE_ANALYSIS.md` (`KIN-VDY-015`–`KIN-VDY-028`).

## [0.7.0] - 2026-11-16 — Simulation Engine (`05-simulation-engine/`)

### Added
- All 8 simulation engine specifications covering shared topology solver, lifecycle state machine, configuration comparison, RK4 numerical stability, and all 19 edge cases (`KIN-SIM-001`–`KIN-SIM-030`).

## [0.8.0] - 2026-11-16 — Software Architecture (`06-software-architecture/`)

### Added
- All 9 software architecture documents covering React/TypeScript/Three.js frontend, optional FastAPI backend, Rust/WASM crate ABI, Web Worker protocol, offline-first PWA, Zustand stores, and `ADR-001`–`ADR-007`.

## [0.9.0] - 2026-11-16 — Data Model, Canonical IDs, Contracts & Schemas (`07-data-and-contracts/` & `schemas/`)

### Added
- All 8 data/contract specs covering all 27 domain entities, canonical ID registry, simulation contracts, error contracts, and SemVer rules (`KIN-DATA-001`–`KIN-DATA-025`).
- All 5 Draft 2020-12 JSON Schemas in `docs/schemas/`.

## [0.10.0] - 2026-11-16 — 3D Visualization, Interaction, Animation & Performance (`08-3d-and-visualization/`)

### Added
- All 9 3D specifications covering Visual Identity, Design System, GLB/CAD asset standards, reusable Assembly Hierarchy, interaction modes, exploded/section-cut mechanics, camera presets, animation sequences, and 150k-tri / 120-draw-call performance budget (`KIN-3D-001`–`KIN-3D-025`).

## [0.11.0] - 2026-11-16 — Engineering Insights, Technical Library & Verified References (`09-learning-and-content/`)

### Added
- All 6 learning and reference specifications (`ENGINEERING_INSIGHTS_CURRICULUM.md`, `TECHNICAL_LIBRARY_STRUCTURE.md`, `LEARNING_CONTENT_SCHEMA.md`, `EQUATION_REFERENCE.md`, `GLOSSARY_AND_TERMINOLOGY.md`, `TECHNICAL_REFERENCE_POLICY.md`) defining 37 Engineering Insights topics across 4 groups, 10 Technical Library modules using a 9-part engineering template, locked equation registry (`eq.*`), controlled terminology, and verified textbook/standard bibliography (`Gillespie`, `Milliken & Milliken`, `Rajamani`, `Wong`, `Heywood`, `Ehsani`, `ISO 8855:2011`, `SAE J670_202206`).

## [0.12.0] - 2026-11-16 — Quality Assurance & Engineering Validation (`10-quality-assurance/`)

### Added
- All 8 QA specifications (`TEST_STRATEGY.md`, `ENGINEERING_VALIDATION_PLAN.md`, `UNIT_AND_INTEGRATION_TEST_PLAN.md`, `SIMULATION_TEST_CASES.md`, `TOPOLOGY_VALIDATION_TESTS.md`, `3D_AND_INTERACTION_TEST_PLAN.md`, `PERFORMANCE_TEST_PLAN.md`, `ACCEPTANCE_TEST_PLAN.md`) defining `KIN-QA-001`–`KIN-QA-020`, closed-form validation checks across all 29 equations, topology graph mutation tests, all 19 edge-case tests (`TEST-EDGE-001`–`019`), 3D/WASM performance gates, and full `AC-001`–`AC-022` acceptance protocol.

## [0.13.0] - 2026-11-16 — Delivery Roadmap, Deployment & Security (`11-delivery-and-operations/`)

### Added
- All 6 delivery and operations specifications covering the gated Phase 0–7 Implementation Roadmap, Static PWA & Optional FastAPI Deployment Architecture, SemVer Build/Release Process, Environment Configuration, CSP/WASM/API Security Controls, and Non-Breaking V1.1–V2.0 Expansion Paths.

## [0.14.0] - 2026-11-16 — Project Governance Core (`12-project-governance/`)

### Added
- Core governance artifacts (`REQUIREMENTS_TRACEABILITY_MATRIX.md` tracing all 274 requirements across `KIN-PRD`, `KIN-FR`, `KIN-NFR`, `KIN-VEH`, `KIN-PWT`, `KIN-VDY`, `KIN-SIM`, `KIN-DATA`, `KIN-3D`, `KIN-QA`; `DOCUMENTATION_CROSS_REFERENCE_MATRIX.md`; `RISK_REGISTER.md`; and `DECISION_LOG.md`).
