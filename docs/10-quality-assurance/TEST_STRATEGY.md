# KINERA Test Strategy

**Document ID:** `KIN-DOC-10-01`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the end-to-end Quality Assurance and verification strategy for KINERA, spanning Rust/WASM mathematical kernels, closed-form analytical engineering benchmarks, topology validation, TypeScript/Worker/FastAPI contracts, Three.js 3D viewport & interaction checks, offline PWA operation, and V1 release acceptance gates.

---

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-QA-001** | Every core requirement (`KIN-PRD-*`, `KIN-FR-*`, `KIN-NFR-*`, `KIN-VEH-*`, `KIN-PWT-*`, `KIN-VDY-*`, `KIN-SIM-*`, `KIN-DATA-*`, `KIN-3D-*`, `KIN-QA-*`) shall have at least one automated or structured verification method mapped before release. |
| **KIN-QA-002** | Zero skipped tests, relaxed numerical tolerances, or mock-only substitutes for real physics/topology verification shall be permitted in CI release gates. |
| **KIN-QA-003** | All Rust/WASM simulation tests shall execute bit-reproducibly across native CI (`cargo test`) and headless browser WASM targets (`wasm-pack test --headless`). |

---

## 3. Five-Layer Verification Pyramid

```
                +-------------------------------------+
                |  L5: E2E Release Acceptance (AC)    |  Playwright: 7 configs x 6 sections + offline PWA
                +-------------------------------------+
              |  L4: 3D Scene, Budget & Interaction Tests |  R3F/WebGL raycast, 150k tri / 120 draw-call gate
              +-------------------------------------------+
            |  L3: Contract, Schema & Integration Tests    |  JSON Schema Draft 2020-12, Worker RPC, FastAPI
            +----------------------------------------------+
          |  L2: Engineering & Analytical Validation       |  29 eq.* closed-form checks, physical invariants
          +------------------------------------------------+
        |  L1: Rust Unit & Topology Property Tests         |  cargo test: pure SI math, diffs, 19 edge cases
        +--------------------------------------------------+
```

### 3.1 Layer Responsibilities & Ownership

| Layer | Runner / Tooling | Target Modules | Execution Cadence | Hard Failure Policy |
| :--- | :--- | :--- | :--- | :--- |
| **L1: Rust Unit & Edge Cases** | `cargo test --workspace` | `kinera-physics`, `kinera-topology`, `kinera-compare` | Every commit & pre-merge PR | Zero failures, zero `unwrap()` panics |
| **L2: Engineering Validation** | `cargo test --test analytical_benchmarks` + Python reference oracle | All 29 `eq.*` equations across `03-*`, `04-*`, `09-*` | Every commit modifying solver or configs | Relative error above defined $\epsilon$ fails CI |
| **L3: Schema & Worker Integration** | Vitest + `ajv` (Draft 2020-12) + `pytest` (optional FastAPI) | `docs/schemas/*.json`, Worker RPC, API contracts | Every PR touching data, schemas, Worker, or API | Any schema mismatch or contract drift blocks merge |
| **L4: 3D & Performance Budget** | Playwright WebGL + Three.js telemetry hook | `3DViewport`, GLB presets, camera, Journey animations | Every PR touching 3D assets, shaders, or scene | Exceeding 150k active tris (warning) / 180k hard cap fails gate |
| **L5: E2E Acceptance (`AC-001`–`AC-022`)** | Playwright (Chromium + Service Worker offline mode) | Full built PWA bundle served offline & online | Release candidates & nightly `main` | Every `AC-*` criterion must pass cleanly |

---

## 4. Configuration-Uniform Testing Rule

Consistent with `KIN-NFR-015` and `AC-003`, test suites **must parameterize over all 7 canonical configurations** (`ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `ICE-4WD`, `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD`) using shared fixtures rather than writing 7 copy-pasted per-layout test files. Configuration-specific mechanics (e.g., `ICE-4WD` `4L` low-range ratio or `EV-DUAL-AWD` motor split) are tested as property-driven cases over the shared engine contract.

---

## 5. CI/CD Quality Gates

1. **Pre-Commit Local Check:** Formatting (`cargo fmt --check`, `prettier`/`eslint`), static types (`tsc --noEmit`), and fast Rust unit suite (`L1`).
2. **PR Pull Request Gate:** Full `L1` + `L2` (both native Rust and `wasm32-unknown-unknown` WASM execution) + `L3` schema/worker integration + mocked-WebGL unit checks.
3. **Nightly / Release Candidate Gate:** Full `L4` headless Chromium WebGL budget profiling + `L5` full offline PWA E2E matrix across `AC-001` through `AC-022`.
4. **Evidence Rule:** Any benchmark or test result cited in release sign-off must be observed from an unskipped post-edit CI run covering the actual built artifact.

---

## 6. Cross-References

- [`ENGINEERING_VALIDATION_PLAN.md`](ENGINEERING_VALIDATION_PLAN.md)
- [`UNIT_AND_INTEGRATION_TEST_PLAN.md`](UNIT_AND_INTEGRATION_TEST_PLAN.md)
- [`SIMULATION_TEST_CASES.md`](SIMULATION_TEST_CASES.md)
- [`ACCEPTANCE_TEST_PLAN.md`](ACCEPTANCE_TEST_PLAN.md)
- [`../01-product-specification/ACCEPTANCE_CRITERIA.md`](../01-product-specification/ACCEPTANCE_CRITERIA.md)
- [`../05-simulation-engine/SIMULATION_ERROR_HANDLING.md`](../05-simulation-engine/SIMULATION_ERROR_HANDLING.md)
