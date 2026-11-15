# KINERA Documentation Cross-Reference Matrix

**Document ID:** `KIN-DOC-12-02`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Maps structural dependencies, upstream authorities, downstream consumers, and sync triggers across all 13 documentation domains (`00-*` through `12-*`) and `docs/schemas/` so any edit propagates cleanly without specification drift.

---

## 2. Domain Dependency Graph

| Domain Folder | Docs Count | Upstream Authorities | Downstream Consumers | Synchronization Trigger |
| :--- | :---: | :--- | :--- | :--- |
| `00-project-foundation/` | 6 | Approved KINERA Blueprint | All `01-*`..`12-*` | Product scope, pillars, or canonical config list changes |
| `01-product-specification/` | 6 | `00-project-foundation/` | `02-*`..`10-*`, `12-RTM` | Section routes, FR/NFR changes, or AC revisions |
| `02-vehicle-architecture/` | 10 | `00-*`, `01-*` | `03-*`, `05-*`, `07-*`, `08-*`, `10-topology` | Adding/modifying canonical configs, subsystems, or topology rules |
| `03-powertrain-engineering/` | 7 | `02-vehicle-architecture/` | `04-*`, `05-*`, `08-animation`, `09-equations`, `10-validation` | Changing powertrain, transmission, diff, or efficiency equations |
| `04-vehicle-dynamics/` | 7 | `02-*`, `03-*` | `05-*`, `09-equations`, `10-validation` | Changing longitudinal, 2-DOF bicycle, braking, or tire equations |
| `05-simulation-engine/` | 8 | `03-*`, `04-*`, `01-NFR` | `06-*`, `07-contracts`, `10-sim-tests` | Modifying RK4 solver, bounds, edge cases, or error codes |
| `06-software-architecture/` | 9 | `01-NFR`, `05-*` | `07-*`, `11-deployment`, `11-security` | Changing Worker protocol, Zustand state, WASM boundary, or PWA strategy |
| `07-data-and-contracts/` + `schemas/` | 8 + 5 | `02-*`..`06-*` | `08-*`, `09-*`, `10-integration`, Phase 1+ code | Changing JSON fields, canonical IDs, SI units, or schema versions |
| `08-3d-and-visualization/` | 9 | `01-*`, `02-*`, `06-*`, `07-*` | `10-3D-tests`, `10-perf`, Phase 3 code | Changing GLB budget, picking, camera, or Journey animations |
| `09-learning-and-content/` | 6 | `00-*`, `02-*`..`04-*`, `07-*` | `10-validation`, `10-AC-016/019`, Phase 5 content | Editing Insights curriculum, Library modules, `eq.*`, or `ref.*` |
| `10-quality-assurance/` | 8 | `01-*`..`09-*` | `11-roadmap`, `11-release`, `12-RTM` | Changing tolerances, edge cases, budgets, or acceptance criteria |
| `11-delivery-and-operations/` | 6 | `06-*`, `07-*`, `10-*` | `12-governance`, engineering teams | Adjusting roadmap phases, build steps, env vars, or CSP |
| `12-project-governance/` | 6 | All `00-*`..`11-*` | Release & audit stakeholders | Every Phase gate, cross-doc audit, or major ADR |

---

## 3. Single Source of Truth Ownership Rules

When two documents discuss the same concept, the canonical authority owns the truth while other docs summarize and link back:

| Concept / Artifact | Authoritative Owner Document |
| :--- | :--- |
| Product Scope, V1 Exclusions | [`00-project-foundation/PRODUCT_SCOPE.md`](../00-project-foundation/PRODUCT_SCOPE.md) |
| Canonical IDs (`vehicle.*`, `ice.*`, `ev.*`, `drivetrain.*`, `eq.*`, `ref.*`) | [`07-data-and-contracts/CANONICAL_ID_REGISTRY.md`](../07-data-and-contracts/CANONICAL_ID_REGISTRY.md) |
| Active 7 Configuration Topologies & Supported Diff/Transfer Modes | [`02-vehicle-architecture/VEHICLE_CONFIGURATION_SPECIFICATION.md`](../02-vehicle-architecture/VEHICLE_CONFIGURATION_SPECIFICATION.md) |
| Master Mathematical Equations, Units & Validity Bounds | [`09-learning-and-content/EQUATION_REFERENCE.md`](../09-learning-and-content/EQUATION_REFERENCE.md) |
| Simulation Edge Cases (1–19) & Status Codes | [`05-simulation-engine/SIMULATION_ERROR_HANDLING.md`](../05-simulation-engine/SIMULATION_ERROR_HANDLING.md) & [`07-data-and-contracts/ERROR_CONTRACTS.md`](../07-data-and-contracts/ERROR_CONTRACTS.md) |
| Wire & JSON Validation Schemas | [`docs/schemas/`](../schemas/) & [`07-data-and-contracts/SIMULATION_CONTRACTS.md`](../07-data-and-contracts/SIMULATION_CONTRACTS.md) |
| 3D Asset & Performance Budgets | [`08-3d-and-visualization/3D_PERFORMANCE_BUDGET.md`](../08-3d-and-visualization/3D_PERFORMANCE_BUDGET.md) |
| Verified Textbook & ISO/SAE Citations | [`09-learning-and-content/TECHNICAL_REFERENCE_POLICY.md`](../09-learning-and-content/TECHNICAL_REFERENCE_POLICY.md) |
| Acceptance Gates & Sign-off Rules | [`01-product-specification/ACCEPTANCE_CRITERIA.md`](../01-product-specification/ACCEPTANCE_CRITERIA.md) & [`10-quality-assurance/ACCEPTANCE_TEST_PLAN.md`](../10-quality-assurance/ACCEPTANCE_TEST_PLAN.md) |

---

## 4. Cross-References

- [`REQUIREMENTS_TRACEABILITY_MATRIX.md`](REQUIREMENTS_TRACEABILITY_MATRIX.md)
- [`DECISION_LOG.md`](DECISION_LOG.md)
- [`../DOCUMENTATION_INDEX.md`](../DOCUMENTATION_INDEX.md)
- [`../DOCUMENTATION_STATUS.md`](../DOCUMENTATION_STATUS.md)
