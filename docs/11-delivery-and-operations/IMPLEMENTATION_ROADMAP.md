# KINERA Implementation Roadmap

**Document ID:** `KIN-DOC-11-01`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the gated multi-phase delivery roadmap (Phase 0 through Phase 7) from locked engineering documentation to production V1 PWA launch, specifying objectives, scope, dependencies, deliverables, exit criteria, verification methods, and primary risks per phase.

---

## 2. Requirements Summary & Sequencing Principles

- **Principle 1 — Single Shared Core Early:** Configuration-driven topology (`ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `ICE-4WD`, `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD`) and Rust/WASM physics contracts are built once in Phases 1–2 before 3D UI integration.
- **Principle 2 — Vertical Proof Before Content Expansion:** One complete end-to-end Worker -> R3F -> Store pipeline validates latency, coordinate orientation, and schema conformance before scaling all 7 3D assemblies and 37 insights modules.
- **Principle 3 — Phase Gates Cannot Be Skipped:** Each phase exits only after unskipped `cargo test`, schema checks, and Playwright gate checks pass on the candidate branch.

---

## 3. Master Phase Matrix (Phases 0–7)

### Phase 0 — Product, Physics, Architecture & QA Documentation (Current)
- **Objective:** Establish an internally consistent, engineering-accurate single source of truth prior to implementation.
- **Dependencies:** Approved revised blueprint (`KINERA — Automotive Powertrain & Vehicle Dynamics Explorer`).
- **Deliverables:** 101 Phase 0 specification files (`00-*` through `12-*` + 5 JSON Schemas) plus cross-document audit & completion reports.
- **Exit Criteria:** All 101 files complete, audit script passes with `0` broken links or math discrepancies, committed & pushed to `origin/main`.
- **Verification:** Automated cross-document audit + manual governance check.
- **Risks:** Scope creep into out-of-scope CFD/FEA/Pacejka domains -> mitigated by explicit `PRODUCT_SCOPE.md` and `AC-022`.

### Phase 1 — Repository Bootstrap, Data Contracts & Shared Topology Core
- **Objective:** Scaffold monorepo (`frontend/`, `rust-core/`, optional `backend/`), validate JSON Schemas, and implement canonical configuration definitions & graph topology validator.
- **Dependencies:** Phase 0 complete.
- **Deliverables:** Cargo workspace (`kinera-topology`), Vite + React + TypeScript shell, all 7 validated canonical JSON presets + `ComponentSpec` seed data, CI lint/schema workflow.
- **Exit Criteria:** `TEST-TOPO-001..007` and `TEST-TOPO-NEG-001..005` pass 100%; all 7 configs pass `vehicle-configuration.schema.json`.
- **Verification:** `cargo test`, `ajv` Draft 2020-12 CLI validator, `tsc --noEmit`.
- **Risks:** Canonical ID drift between JSON configs and Rust structs -> mitigated by shared code-generated or CI-checked ID constants.

### Phase 2 — Rust/WASM Physics Solver & Web Worker Bridge
- **Objective:** Implement complete ICE/EV powertrain math, differentials, longitudinal, 2-DOF bicycle, braking, weight transfer, friction circle, performance estimators, comparison engine, and all 19 edge-case guards in Rust/WASM inside a Web Worker.
- **Dependencies:** Phase 1 topology & contract types.
- **Deliverables:** `kinera-physics` and `kinera-compare` crates, `wasm-pack` Worker bridge, typed RPC cancellation layer, full unit & benchmark test suite.
- **Exit Criteria:** All 29 `eq.*` analytical benchmarks (`ENGINEERING_VALIDATION_PLAN.md`), `TEST-SIM-001..012`, and `TEST-EDGE-001..019` pass natively and in headless WASM (`TEST-PERF-005..007` met).
- **Verification:** `cargo test`, `wasm-pack test --headless`, Python reference comparison oracle.
- **Risks:** Float drift or silent `NaN` in edge cases -> mitigated by `#![deny(clippy::unwrap_used)]` and mandatory finiteness validation (`KIN-SIM-028..030`).

### Phase 3 — Visual Design System, 3D Assembly Hierarchy & Anatomy Viewport
- **Objective:** Build the dark-engineering design system, reusable R3F/Three.js procedural/GLB assembly hierarchy, interactive picking, isolate/layer visibility, parametric exploded view, section-cut plane, and camera presets across all 7 configs.
- **Dependencies:** Phase 1 canonical IDs & Phase 2 geometry metadata.
- **Deliverables:** `Overview` & `Vehicle Anatomy` sections, reusable chassis/suspension/braking/drivetrain 3D modules, interactive metadata inspector, keyboard camera controls.
- **Exit Criteria:** `TEST-3D-001..006`, `TEST-3D-008`, `TEST-PERF-001..004` ($\le 150\text{k}$ active tris target / $\le 180\text{k}$ cap, $\le 120$ draw calls) pass on all 7 configs.
- **Verification:** Playwright WebGL instrumentation & GPU disposal heap audit (`TEST-PERF-010`).
- **Risks:** Polygon explosion across 7 configs -> mitigated by shared instanced wheels/brakes/suspension modules (`ASSEMBLY_HIERARCHY.md`).

### Phase 4 — Powertrain Journey & Engineering Simulator UI
- **Objective:** Deliver synchronized Powertrain Journey animation mode and full interactive Engineering Simulator (`Powertrain Simulation`, `Vehicle Dynamics Simulation`, `Configuration Comparison`) with matched baseline toggles, live KaTeX equation inspection drawer, and friction circle visualizer.
- **Dependencies:** Phases 2 & 3 complete.
- **Deliverables:** `Powertrain Journey` (Play/Pause/Step/Replay for ICE + EV), 3 simulator workspaces, telemetry plots, `Simulated Model Estimate` disclaimers, assumption tooltips.
- **Exit Criteria:** `AC-007` through `AC-015` and `AC-019` pass end-to-end; Worker cancellation keeps live parameter scrubbing stall-free (`TEST-PERF-008`).
- **Verification:** Playwright E2E scenarios matching UI values to Worker fixture outputs.
- **Risks:** UI thread jank from high-frequency chart re-renders -> mitigated by 30 Hz throttled UI subscriptions and Canvas/SVG decimation.

### Phase 5 — Engineering Insights Curriculum & Technical Library Content
- **Objective:** Author, verify, and ship all 37 `Engineering Insights` topics (4 groups) and 10 `Technical Library` modules (`9-part` template), linked dynamically to Simulator scenarios and 3D presets.
- **Dependencies:** Phase 4 deep-link URL / state routes & KaTeX renderer.
- **Deliverables:** Validated `learning-content.schema.json` dataset for all 47 educational items, embedded schematics, verified citation footnotes (`ref.*`), deep-link "Launch in Simulator" triggers.
- **Exit Criteria:** Zero broken equation/component/scenario links; 100% schema conformance; all formulas cross-checked against `EQUATION_REFERENCE.md` (`AC-016`, `AC-022`).
- **Verification:** Automated content schema + link checker + offline rendering pass.
- **Risks:** Uncited or oversimplified claims -> mitigated by `TECHNICAL_REFERENCE_POLICY.md` editorial gate.

### Phase 6 — Offline-First PWA Hardening, Accessibility & Optional FastAPI Companion
- **Objective:** Enable complete Workbox/Service Worker precaching of WASM, GLB, KaTeX fonts, and JSON/educational assets; complete WCAG AA contrast/keyboard polish; build optional stateless FastAPI validation/catalog service.
- **Dependencies:** Phases 3–5 complete.
- **Deliverables:** Production PWA manifest & Service Worker, non-WebGL accessible structural fallback view, optional Dockerized FastAPI service (`backend/`).
- **Exit Criteria:** `TEST-PERF-009` ($\le 3.0\text{ s}$ cached boot offline), `AC-018` full offline walkthrough passes with network blocked, `pytest` API parity suite passes.
- **Verification:** Playwright `offline: true` suite, Lighthouse PWA/Accessibility audit.
- **Risks:** Missing WASM or font file in Service Worker precache manifest -> mitigated by automated Vite build precache completeness test.

### Phase 7 — Full Release QA, Performance Tuning & V1 Launch
- **Objective:** Execute full `L1`–`L5` acceptance regression matrix (`AC-001`–`AC-022`), fix all open blockers, tag V1 release (`v1.0.0`), and deploy static PWA bundle.
- **Dependencies:** Phases 1–6 feature complete.
- **Deliverables:** Signed V1 Release Acceptance Report, tagged source & WASM release artifact, live production deployment.
- **Exit Criteria:** `100%` pass across `AC-001`–`AC-022`, zero `CRITICAL`/`HIGH` defects, release tag pushed cleanly.
- **Verification:** `ACCEPTANCE_TEST_PLAN.md` full release run.
- **Risks:** Late browser-specific WebGL driver quirks -> mitigated by cross-engine testing on Chromium/Firefox/WebKit early in Phase 3 & final Phase 7 sweep.

---

## 4. Cross-References

- [`DEPLOYMENT_ARCHITECTURE.md`](DEPLOYMENT_ARCHITECTURE.md)
- [`BUILD_AND_RELEASE_PROCESS.md`](BUILD_AND_RELEASE_PROCESS.md)
- [`../10-quality-assurance/ACCEPTANCE_TEST_PLAN.md`](../10-quality-assurance/ACCEPTANCE_TEST_PLAN.md)
- [`../12-project-governance/RISK_REGISTER.md`](../12-project-governance/RISK_REGISTER.md)
