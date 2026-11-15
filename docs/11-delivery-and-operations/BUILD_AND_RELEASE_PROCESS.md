# KINERA Build and Release Process

**Document ID:** `KIN-DOC-11-03`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the reproducible build pipeline, toolchain pinning, asset optimization steps, multi-stage CI verification, Semantic Versioning rules, and artifact release procedures for KINERA.

---

## 2. Build Pipeline Order

1. **Data & Schema Validation:** Validate all `vehicle-configuration`, `component`, and `learning-content` JSON bundles against `docs/schemas/*.schema.json` (Draft 2020-12).
2. **Rust Core Verification & WASM Compilation:**
   - Run `cargo fmt --check`, `cargo clippy -- -D warnings`, `cargo test --workspace`.
   - Compile `kinera-wasm` via `wasm-pack build --target web --release` optimizing binary footprint (`wasm-opt -Os` / `-Oz` verified lossless).
3. **3D Asset Budget Verification:** Inspect compiled `.glb` assets with build-time telemetry verifying Draco mesh compression, triangle ceilings ($\le 150\text{k}$ active per scene, $\le 180\text{k}$ hard limit), and valid canonical node names.
4. **Frontend Vite Build & PWA Precache Generation:** Run `tsc --noEmit`, `vite build`, and Workbox precache manifest injection (confirming `.wasm`, `.glb`, `.woff2`, and `.json` assets are included).
5. **Post-Build Headless Browser Verification:** Serve `dist/` locally and execute `TEST-PERF-*`, `AC-001`–`AC-022`, and offline Service Worker E2E checks via Playwright.

---

## 3. Versioning & Release Tagging

- **Semantic Versioning (`MAJOR.MINOR.PATCH`):**
  - `MAJOR`: Breaking schema contract or major physics model overhaul (`0.x.y` during pre-V1 phases -> `1.0.0` upon Phase 7 completion).
  - `MINOR`: Additive configurations, simulator modes, Insights/Library modules preserving schema compatibility.
  - `PATCH`: Equation bugfixes, 3D mesh optimizations, UI/copy corrections.
- **Release Tag Rules:**
  - Tags formatted `vX.Y.Z` created exclusively from passing `main` commits after all `L1`–`L5` gates pass.
  - Release notes summarize changelog entries, schema versions (`schema_version`), and observed verification evidence.

---

## 4. Rollback Procedure

Because static CDN deployments use content-hashed assets under immutable URLs (`assets/index-<hash>.js`, `kinera_wasm_<hash>.wasm`):
1. Instant rollback repoints the CDN active deployment alias to the prior verified immutable release build.
2. Updated `sw.js` (`Cache-Control: no-cache`) instructs returning browsers to fetch the restored manifest cleanly on next load.

---

## 5. Cross-References

- [`IMPLEMENTATION_ROADMAP.md`](IMPLEMENTATION_ROADMAP.md)
- [`DEPLOYMENT_ARCHITECTURE.md`](DEPLOYMENT_ARCHITECTURE.md)
- [`ENVIRONMENT_CONFIGURATION.md`](ENVIRONMENT_CONFIGURATION.md)
- [`../10-quality-assurance/TEST_STRATEGY.md`](../10-quality-assurance/TEST_STRATEGY.md)
