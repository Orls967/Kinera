# Project Charter — KINERA

**Document ID:** `KIN-DOC-00-01`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  
**Owner:** Product & Systems Engineering Lead  

---

## 1. Purpose

This Project Charter formally authorizes **KINERA — Automotive Powertrain & Vehicle Dynamics Explorer** and establishes its locked product identity, strategic mandate, core architectural constraints, stakeholder roles, governance rules, and Phase 0-to-V1 completion principles.

## 2. Locked Product Identity

| Attribute | Authoritative Value |
| :--- | :--- |
| **Official Name** | KINERA |
| **Full Name** | Automotive Powertrain & Vehicle Dynamics Explorer |
| **Tagline** | Explore the Mechanics. Understand the Motion. |
| **Product Category** | Interactive Engineering Education Platform |
| **Primary Domain** | Automotive Engineering |
| **Product Type** | 3D Engineering Explorer & Interactive Simulation Platform |
| **Core Disciplines** | Mechanical Engineering, Automotive Engineering, Electrical Engineering, Applied Physics, Vehicle Dynamics |

## 3. Strategic Mandate & Product Pivot Rationale

KINERA is explicitly chartered **not** as a single-layout powertrain viewer (e.g., an ICE rear-wheel-drive explainer with dynamics deferred), but as an integrated **multi-configuration automotive engineering laboratory** where mechanical topology, powertrain engineering, and vehicle motion physics are tightly coupled from Version 1 (`V1`).

### Core Product Pillars

1. **Vehicle Architecture** — Configuration-driven exploration across complete vehicle systems (chassis, ICE & EV powertrains, transmissions, drivetrains, suspension, steering, braking, and wheels/tires).
2. **Powertrain Engineering** — End-to-end energy conversion, torque multiplication, gear ratios, differential operation, efficiency accounting, and interactive Powertrain Journey animations.
3. **Vehicle Dynamics** — Core V1 physics simulation covering longitudinal acceleration/grade/aero/rolling resistance, braking dynamics, simplified linear bicycle lateral dynamics, quasi-static weight transfer, and simplified tire traction/friction-circle limits.

## 4. Non-Negotiable Locked Decisions

All Phase 0 specifications and Phase 1–7 implementation teams must treat the following decisions as invariant:

1. **Both ICE and EV from V1:** Internal Combustion Engine and Electric Vehicle architectures, journeys, and simulations are first-class V1 capabilities.
2. **Seven Canonical Vehicle Configurations from V1:**
   - `vehicle.config.ice-fwd` (`ICE-FWD`)
   - `vehicle.config.ice-rwd` (`ICE-RWD`)
   - `vehicle.config.ice-awd` (`ICE-AWD`)
   - `vehicle.config.ice-4wd` (`ICE-4WD`)
   - `vehicle.config.ev-fwd` (`EV-FWD`)
   - `vehicle.config.ev-rwd` (`EV-RWD`)
   - `vehicle.config.ev-dual-awd` (`EV-DUAL-AWD`)
3. **Single Shared Architecture:** Seven configurations must be implemented via one configuration-driven 3D assembly engine and one shared physics simulation framework—never seven forked codebases or seven ad-hoc simulators.
4. **Six Main Application Sections:** `Overview`, `Vehicle Anatomy`, `Powertrain Journey`, `Engineering Simulator`, `Engineering Insights`, and `Technical Library`.
5. **Engineering Simulator Scope:** Encompasses three integrated modules—`Powertrain Simulation`, `Vehicle Dynamics Simulation`, and `Configuration Comparison`—sharing one vehicle state contract.
6. **Approved Technology Stack:** React, TypeScript, Vite, Three.js, React Three Fiber, Drei, Zustand (Frontend); Rust compiled to WebAssembly running inside Web Workers (Simulation Engine); optional Python + FastAPI + Pydantic (supplementary backend services); structured JSON datasets with JSON Schema contracts.
7. **Offline-First Core:** All exploration, 3D inspection, Powertrain Journey, core simulations, comparisons, Insights, and Technical Library features must function offline without a live backend.
8. **Educational Fidelity Transparency:** Every mathematical model must explicitly declare its equations, SI units, assumptions, validity limits, and exclusions; KINERA must never misrepresent educational approximations as professional CAE/production OEM claims.

## 5. Governance & Documentation-First Rule

- **Phase 0 Gate:** No production frontend, backend, Rust/WASM, or 3D application code may be authored until Phase 0 specifications pass cross-document audit (`DOCUMENTATION_AUDIT_REPORT.md`) and Phase 0 sign-off (`PHASE_0_COMPLETION_REPORT.md`).
- **Single Source of Truth:** Canonical identifiers (`CANONICAL_ID_REGISTRY.md`), equations (`EQUATION_REFERENCE.md`), and schemas (`docs/schemas/*.schema.json`) govern all downstream engineering artifacts.
- **Change Control:** Any revision to a locked decision requires an entry in `DECISION_LOG.md` and an impact check against `REQUIREMENTS_TRACEABILITY_MATRIX.md`.

## 6. Target Stakeholders & Multidisciplinary Ownership

| Role | Primary Responsibility |
| :--- | :--- |
| **Product Management** | Vision alignment, V1 scope boundaries, persona journeys, acceptance sign-off |
| **Automotive & Dynamics Engineering** | Topology accuracy, ICE/EV models, drivetrain math, dynamics equations, validation cases |
| **Simulation & Rust/WASM Engineering** | Deterministic numerical solvers, SI unit safety, Worker ABI, edge-case guards |
| **Frontend & 3D Technical Direction** | CAD/cutaway 3D hierarchy, R3F interaction, visual identity, 150k tri / 120 draw-call budget |
| **Technical Content & QA** | Curriculum integrity, citation verification, traceability, regression & acceptance suites |

## 7. High-Level Definition of V1 Product Success

KINERA V1 is successful when a learner or educator can seamlessly switch across all seven canonical configurations in 3D Vehicle Anatomy and Powertrain Journey, inspect how every component connects mechanically or electrically, run deterministic powertrain and vehicle dynamics experiments (longitudinal, lateral, braking, weight transfer, friction limits), compare configurations under controlled test conditions, and trace every computed number back to documented SI equations and credible engineering references—even while completely offline.

## 8. Cross-References

- [`PRODUCT_VISION.md`](PRODUCT_VISION.md)
- [`PRODUCT_REQUIREMENTS_DOCUMENT.md`](PRODUCT_REQUIREMENTS_DOCUMENT.md)
- [`PRODUCT_SCOPE.md`](PRODUCT_SCOPE.md)
- [`../12-project-governance/DECISION_LOG.md`](../12-project-governance/DECISION_LOG.md)
- [`../11-delivery-and-operations/IMPLEMENTATION_ROADMAP.md`](../11-delivery-and-operations/IMPLEMENTATION_ROADMAP.md)
