# KINERA Maintenance and Future Expansion

**Document ID:** `KIN-DOC-11-06`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines operational maintenance procedures, data/schema evolution rules, and architectural extension seams allowing post-V1 expansions (`V1.1`–`V2+`) without breaking the canonical multi-configuration V1 core.

---

## 2. Adding New Configurations Without Code Forks

Consistent with `KIN-NFR-015` and `VEHICLE_CONFIGURATION_SPECIFICATION.md`, adding a new variant or future configuration (e.g., Hybrid HEV/PHEV or Tri-Motor EV) follows an additive data pipeline:
1. Author a new `VehicleConfiguration` JSON entry conforming to `vehicle-configuration.schema.json`.
2. Map component nodes using `CANONICAL_ID_REGISTRY.md` conventions and add corresponding procedural/GLB group entries in `ASSEMBLY_HIERARCHY.md`.
3. Add topological & analytical regression fixtures to `TOPOLOGY_VALIDATION_TESTS.md` and `SIMULATION_TEST_CASES.md`.
4. Extend `kinera-topology` only when introducing genuinely new mechanical coupling laws (e.g., planetary eCVT power-split node).

---

## 3. Scheduled Post-V1 Evolution Path (Non-Breaking)

| Release Horizon | Candidate Additions (Explicitly Excluded From V1) | Required Schema / Core Compatibility |
| :--- | :--- | :--- |
| **V1.1 (Educational & UX Depth)** | Custom user vehicle builder within safe parameter presets, downloadable CSV/JSON lab worksheets, guided interactive quizzes inside Insights. | Additive optional fields on `LearningContent` & `SimulationScenario`; backward-compatible `1.1.0` schema. |
| **V1.2 (Powertrain Variants)** | Series/Parallel Hybrid (`HEV` / `PHEV`) architecture with dual prime-mover blending + simplified thermal derating indicators. | Extends `power_flow` directed graph with `ice + motor` sum node (`1.2.0` schema). |
| **V2.0 (Higher-DOF Vehicle Dynamics)** | Simplified Pacejka Magic Formula tire option (explicit toggle preserving V1 linear bicycle mode for teaching), roll-DOF transient weight transfer, basic ABS/ESC stability intervention demo. | Versioned `solverModel: "v1_linear" \| "v2_nonlinear"` flag (`DATA_VERSIONING.md`), keeping V1 baseline intact for comparability. |

---

## 4. Ongoing Maintenance Cadence

- **Dependency & Toolchain Hygiene:** Monthly security patch cycle (`cargo update`, `npm audit`, Chromium/Playwright browser bump) gated by full `L1`–`L5` regression run.
- **Documentation Sync Rule:** Any equation update, canonical ID addition, or schema revision requires synchronized edits to `EQUATION_REFERENCE.md`, `CANONICAL_ID_REGISTRY.md`, `docs/schemas/*.schema.json`, and `CHANGELOG.md`.

---

## 5. Cross-References

- [`../00-project-foundation/PRODUCT_SCOPE.md`](../00-project-foundation/PRODUCT_SCOPE.md)
- [`../07-data-and-contracts/DATA_VERSIONING.md`](../07-data-and-contracts/DATA_VERSIONING.md)
- [`IMPLEMENTATION_ROADMAP.md`](IMPLEMENTATION_ROADMAP.md)
- [`../12-project-governance/DECISION_LOG.md`](../12-project-governance/DECISION_LOG.md)
