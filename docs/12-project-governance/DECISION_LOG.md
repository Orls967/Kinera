# KINERA Project Decision Log

**Document ID:** `KIN-DOC-12-04`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Maintains the unified executive register of locked product, mathematical, architectural, and governance decisions for KINERA V1, cross-referencing technical Architecture Decision Records (`ADR-001`–`ADR-007` in [`TECHNOLOGY_DECISIONS.md`](../06-software-architecture/TECHNOLOGY_DECISIONS.md)) and approved blueprint mandates.

---

## 2. Locked Product & Domain Decisions (`DEC-*`)

| Decision ID | Area | Locked Decision | Rationale | Authoritative Spec |
| :--- | :--- | :--- | :--- | :--- |
| **DEC-001** | Product Identity | Name **KINERA — Automotive Powertrain & Vehicle Dynamics Explorer**; Tagline **"Explore the Mechanics. Understand the Motion."** | Reflects transition from pure powertrain visualizer to holistic configuration + dynamics learning platform. | `PROJECT_CHARTER.md`, `PRODUCT_VISION.md` |
| **DEC-002** | Three Pillars | `Vehicle Architecture`, `Powertrain Engineering`, `Vehicle Dynamics`. | Establishes clean conceptual link from mechanical layout -> torque/energy generation -> road motion. | `PRODUCT_VISION.md` |
| **DEC-003** | Six Sections | `Overview`, `Vehicle Anatomy`, `Powertrain Journey`, `Engineering Simulator`, `Engineering Insights` (~37 topics), `Technical Library` (10 modules). | `Engineering Simulator` replaces narrower `Powertrain Simulator` to encompass dynamics & config comparison. | `APPLICATION_STRUCTURE.md` |
| **DEC-004** | Seven Canonical Configs | `ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `ICE-4WD`, `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD` all mandatory from V1. | Covers core automotive powertrain topologies across ICE & EV without maintaining dozens of redundant vehicles. | `VEHICLE_CONFIGURATION_SPECIFICATION.md` |
| **DEC-005** | AWD vs 4WD Fidelity | Explicitly distinguish full-time/bias-managed `ICE-AWD` (center diff/PTU) from transfer-case `ICE-4WD` (`2H`/`4H`/`4L`). | Prevents common educational conflation and grounds `4L` low-range gearing and high-$\mu$ windup lessons. | `DIFFERENTIAL_MODEL.md`, `VEHICLE_CONFIGURATION_SPECIFICATION.md` |
| **DEC-006** | Core Dynamics Scope | Longitudinal, Lateral (2-DOF linear bicycle), Braking, Quasi-static Weight Transfer, Simplified Friction Circle, Performance Analysis (`Simulated Model Estimate`). | Maximizes clarity, analytical verifiability, and deterministic education without nonlinear tyre fitting complexity in V1. | `VEHICLE_DYNAMICS_OVERVIEW.md`, `PRODUCT_SCOPE.md` |
| **DEC-007** | Explicit V1 Exclusions | Exclude full CFD, combustion chemistry, FEA, crash dynamics, Pacejka nonlinear tires, tire thermodynamics, high-DOF multi-body suspension, VR/multiplayer/accounts. | Keeps scope crisp, mathematical assumptions transparent (`AC-019`, `AC-022`), and V1 deliverable realistic. | `PRODUCT_SCOPE.md`, `ACCEPTANCE_CRITERIA.md` |
| **DEC-008** | Reference Verification Integrity | Cite only directly verified textbook/standard editions (`Gillespie`, `Milliken`, `Rajamani`, `Wong`, `Heywood`, `Ehsani`, `ISO 8855:2011`, `SAE J670_202206`); tag unverified items `[VERIFICATION_REQUIRED]`. | Upholds academic & engineering honesty across documentation and learning content. | `TECHNICAL_REFERENCE_POLICY.md` |

---

## 3. Architecture Decision Records Index (`ADR-001`–`ADR-007`)

Full context, options evaluated, consequences, and reversibility notes reside in [`TECHNOLOGY_DECISIONS.md`](../06-software-architecture/TECHNOLOGY_DECISIONS.md):

| ADR ID | Decision Summary | Status | Key Impact |
| :--- | :--- | :--- | :--- |
| **`ADR-001`** | Single configuration-driven topology & physics engine over per-layout codebases | **LOCKED** | Zero code duplication across 7 configurations; validated by `AC-003`. |
| **`ADR-002`** | `React + TypeScript + Vite + Three.js + React Three Fiber + Drei + Zustand` frontend | **LOCKED** | Offline-first PWA shell with declarative 3D hierarchy and reactive HUD. |
| **`ADR-003`** | `Rust + WebAssembly` inside dedicated Web Workers for physics & topology | **LOCKED** | Deterministic f64 calculation, zero main-thread UI stalls, native/WASM test parity. |
| **`ADR-004`** | Strictly optional `Python + FastAPI + Pydantic` companion backend | **LOCKED** | Core app works 100% offline with backend offline/absent (`KIN-NFR-012`). |
| **`ADR-005`** | Strict internal `SI` units everywhere with UI-boundary display conversion | **LOCKED** | Eliminates mixed-unit bugs across solvers, schemas, and CSV/JSON exports. |
| **`ADR-006`** | Immutable dot-separated lowercase Canonical IDs (`^[a-z][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*){2,4}$`) | **LOCKED** | Referential stability across configs, 3D meshes, equations, and Insights links. |
| **`ADR-007`** | Reduced-order transparent educational dynamics over heavy multi-body CAE | **LOCKED** | Fast interactive learning with explicit linear bounds and closed-form verification. |

---

## 4. Cross-References

- [`../06-software-architecture/TECHNOLOGY_DECISIONS.md`](../06-software-architecture/TECHNOLOGY_DECISIONS.md)
- [`../00-project-foundation/PRODUCT_SCOPE.md`](../00-project-foundation/PRODUCT_SCOPE.md)
- [`REQUIREMENTS_TRACEABILITY_MATRIX.md`](REQUIREMENTS_TRACEABILITY_MATRIX.md)
- [`DOCUMENTATION_CROSS_REFERENCE_MATRIX.md`](DOCUMENTATION_CROSS_REFERENCE_MATRIX.md)
