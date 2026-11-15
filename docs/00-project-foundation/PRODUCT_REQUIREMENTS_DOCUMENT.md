# Product Requirements Document (PRD) — KINERA

**Document ID:** `KIN-DOC-00-03`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  
**Version:** 1.0 (Phase 0 Baseline)  

---

## 1. Purpose

This Product Requirements Document defines the authoritative `KIN-PRD-xxx` product-level requirements for **KINERA — Automotive Powertrain & Vehicle Dynamics Explorer (V1)**. It bridges the strategic mandate in [`PROJECT_CHARTER.md`](PROJECT_CHARTER.md) and [`PRODUCT_VISION.md`](PRODUCT_VISION.md) with granular specifications in `01-product-specification/` through `10-quality-assurance/`.

## 2. Scope

Covers all V1 user-facing capabilities across the six application sections, seven canonical vehicle configurations, offline-first execution architecture, and educational fidelity disclosure requirements. Out-of-scope V1 domains are governed by [`PRODUCT_SCOPE.md`](PRODUCT_SCOPE.md).

## 3. Master Product Requirements (`KIN-PRD-001` – `KIN-PRD-020`)

| Req ID | Priority | Category | Requirement Statement | Primary Downstream Specs |
| :--- | :---: | :--- | :--- | :--- |
| **KIN-PRD-001** | P0 | Product Structure | KINERA shall organize all user workflows into six top-level sections: `Overview`, `Vehicle Anatomy`, `Powertrain Journey`, `Engineering Simulator`, `Engineering Insights`, and `Technical Library`. | `APPLICATION_STRUCTURE.md` |
| **KIN-PRD-002** | P0 | Multi-Config | KINERA V1 shall support all seven canonical vehicle configurations (`ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `ICE-4WD`, `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD`) selectable from a unified configuration selector. | `VEHICLE_CONFIGURATION_SPECIFICATION.md` |
| **KIN-PRD-003** | P0 | Shared Architecture | Switching vehicle configurations shall dynamically reconfigure 3D assembly topology, component hierarchy, power-flow paths, available parameters, simulation topology, and contextual explanations using one shared data and physics engine. | `VEHICLE_ARCHITECTURE_OVERVIEW.md`, `SIMULATION_ARCHITECTURE.md` |
| **KIN-PRD-004** | P0 | Vehicle Anatomy | Vehicle Anatomy shall display complete vehicle systems—Structure, ICE/Fuel, EV Electrical, Transmission/Drivetrain, Suspension/Steering, Braking, and Wheels/Tires—with interactive selection, isolation, exploded assembly, section cut, transparency, layer visibility, and camera presets. | `COMPONENT_ANATOMY_SPECIFICATION.md`, `COMPONENT_INTERACTION_SPECIFICATION.md` |
| **KIN-PRD-005** | P0 | Component Contract | Every inspectable component shall resolve to a canonical ID and structured metadata contract detailing function, operating principle, inputs/outputs, physical specs, relationships, 3D references, and engineering citations. | `COMPONENT_SCHEMA.md`, `CANONICAL_ID_REGISTRY.md` |
| **KIN-PRD-006** | P0 | Powertrain Journey | Powertrain Journey shall animate step-by-step energy conversion, torque flow, RPM scaling, gear engagement, differential distribution, losses, and EV regenerative braking adapted to the active vehicle configuration. | `POWERTRAIN_JOURNEY_SPECIFICATION.md`, `ANIMATION_SYSTEM.md` |
| **KIN-PRD-007** | P0 | ICE Model | KINERA V1 shall model a naturally aspirated inline-four four-stroke gasoline engine paired with a manual transmission reference model (plus conceptual automatic transmission anatomy/notes). | `ICE_ENGINE_MODEL.md`, `TRANSMISSION_MODEL.md` |
| **KIN-PRD-008** | P0 | EV Model | KINERA V1 shall model an EV powertrain comprising battery pack, BMS, inverter, electric motor (parameterized PMSM/induction torque & efficiency maps), single-speed reduction drive, and regenerative braking. | `EV_POWERTRAIN_MODEL.md`, `EV_ARCHITECTURE.md` |
| **KIN-PRD-009** | P0 | Differential & Split | KINERA V1 shall model and distinguish open differentials (explicitly respecting equal-torque/traction-limit behavior), simplified limited-slip, locked differentials, center differentials, 4WD transfer cases (2H/4H/4L concepts), and dual-motor EV electronic torque allocation. | `DIFFERENTIAL_MODEL.md`, `ICE_ARCHITECTURE.md` |
| **KIN-PRD-010** | P0 | Powertrain Sim | The Engineering Simulator Powertrain module shall compute angular velocity, mechanical/electrical power, gearbox/reduction torque, axle torque, per-wheel torque, wheel RPM, tractive force, losses, and EV energy consumption without efficiency double-counting. | `POWERTRAIN_SIMULATION_SPECIFICATION.md`, `DRIVETRAIN_EFFICIENCY_MODEL.md` |
| **KIN-PRD-011** | P0 | Longitudinal Dyn | The Engineering Simulator Vehicle Dynamics module shall simulate longitudinal motion incorporating tractive force, aerodynamic drag, rolling resistance, road gradient resistance, mass, speed, acceleration, and distance time series. | `LONGITUDINAL_DYNAMICS.md` |
| **KIN-PRD-012** | P0 | Lateral Dyn | The Engineering Simulator Vehicle Dynamics module shall simulate lateral cornering behavior via a simplified 2-DOF linear bicycle model computing yaw rate, lateral acceleration, sideslip angle, vehicle trajectory, and understeer/oversteer tendency while explicitly displaying linear validity bounds. | `LATERAL_DYNAMICS_BICYCLE_MODEL.md` |
| **KIN-PRD-013** | P0 | Braking & Load | The Engineering Simulator Vehicle Dynamics module shall simulate braking deceleration, stopping distance/time, brake bias, conceptual ABS slip behavior, and quasi-static longitudinal and lateral weight transfer. | `BRAKING_DYNAMICS.md`, `WEIGHT_TRANSFER_MODEL.md` |
| **KIN-PRD-014** | P0 | Traction & Perf | KINERA V1 shall enforce tire-road friction bounds ($\mu F_z$) and a simplified friction-circle approximation, and produce model-based estimates for 0–100 km/h, quarter-mile, top speed, braking distance, cornering, gradeability, energy consumption, and power-to-weight ratio clearly labeled as simulated estimates. | `TIRE_TRACTION_AND_FRICTION_MODEL.md`, `VEHICLE_PERFORMANCE_ANALYSIS.md` |
| **KIN-PRD-015** | P0 | Config Comparison | Configuration Comparison shall evaluate two or more selected configurations side-by-side under matched, user-auditable baseline conditions and flag any mismatched parameter so results are never misleading or biased toward one layout. | `CONFIGURATION_COMPARISON_SPECIFICATION.md` |
| **KIN-PRD-016** | P0 | Engineering Content | Engineering Insights (~34–37 structured topics across 4 groups) and Technical Library (10 structured modules) shall link seamlessly to canonical components, equations, and preset simulator scenarios without duplicating contradictory definitions. | `ENGINEERING_INSIGHTS_CURRICULUM.md`, `TECHNICAL_LIBRARY_STRUCTURE.md` |
| **KIN-PRD-017** | P0 | Architecture & SI | All simulation calculations shall execute deterministically in Rust/WASM inside a Web Worker using explicit SI units internally, communicating via strongly typed contracts with a React/TypeScript/Three.js frontend. | `SYSTEM_ARCHITECTURE.md`, `RUST_WASM_ARCHITECTURE.md` |
| **KIN-PRD-018** | P0 | Offline-First | All core navigation, configuration switching, Vehicle Anatomy, Powertrain Journey, Engineering Simulator, Insights, and Technical Library features shall operate offline once installed/cached, without mandatory backend connectivity. | `OFFLINE_FIRST_ARCHITECTURE.md` |
| **KIN-PRD-019** | P0 | Fidelity & Refs | Every simulation output and learning module shall disclose mathematical assumptions, approximations, scope boundaries, and verified/flagged engineering references. | `ASSUMPTIONS_AND_CONSTRAINTS.md`, `TECHNICAL_REFERENCE_POLICY.md` |
| **KIN-PRD-020** | P1 | Quality & Perf | Standard 3D inspection scenes shall target ~150,000 active triangles and ~120 draw calls with adaptive quality tiers, lazy-loaded assemblies, WCAG-AA accessible controls, and responsive desktop/tablet/mobile layouts. | `3D_PERFORMANCE_BUDGET.md`, `NON_FUNCTIONAL_REQUIREMENTS.md` |

## 4. Prioritization Definitions

- **P0 (Mandatory V1 Release Blocker):** Platform cannot ship V1 without full specification, implementation, and verified test pass.
- **P1 (Required V1 Quality Target):** Required for V1 release sign-off with measurable profiling/QA thresholds and documented adaptive fallback tiers.

## 5. Dependencies & Cross-References

- [`PRODUCT_SCOPE.md`](PRODUCT_SCOPE.md) — Defines exact exclusions preventing scope creep beyond these 20 requirements.
- [`../01-product-specification/FUNCTIONAL_REQUIREMENTS.md`](../01-product-specification/FUNCTIONAL_REQUIREMENTS.md) — Expands `KIN-PRD-xxx` into granular `KIN-FR-xxx` requirements.
- [`../12-project-governance/REQUIREMENTS_TRACEABILITY_MATRIX.md`](../12-project-governance/REQUIREMENTS_TRACEABILITY_MATRIX.md) — Maps each `KIN-PRD-xxx` to downstream specs, tests, and acceptance criteria.
