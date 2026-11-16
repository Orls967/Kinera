# KINERA Implementation Decision Log

Records implementation-level architectural and engineering decisions made while executing the Phase 0 specifications.

---

## `IMPL-DEC-001`: GitHub Pages Static Routing & Base Path Strategy
- **Date:** 2026-11-16
- **Context:** KINERA is deployed to GitHub Pages under project subpath `/Kinera/` (`https://orls967.github.io/Kinera/`). Direct refreshes on nested SPA routes can return HTTP 404 on static hosts without server rewrite rules.
- **Decision:** Use Vite `base: '/Kinera/'` in production builds (configurable via `VITE_BASE_PATH`), React Router `HashRouter` for guaranteed refresh/offline stability on static hosting, and a `public/404.html` redirect handler so direct visits to non-hash subpaths cleanly route into the application.
- **Consequences:** All routes (`Overview`, `Vehicle Anatomy`, `Powertrain Journey`, `Engineering Simulator`, `Engineering Insights`, `Technical Library`) and nested subroutes work on direct navigation, page refresh, browser back/forward, and offline Service Worker caches.

## `IMPL-DEC-002`: Optional Backend & Static Offline-First Execution
- **Date:** 2026-11-16
- **Context:** Phase 0 (`BACKEND_ARCHITECTURE.md`, `ADR-004`) specifies an optional Python/FastAPI service for scenario sharing, while GitHub Pages is strictly static hosting.
- **Decision:** Implement all core simulation, topology validation, 3D exploration, learning content, and `.kinera.json` scenario export/import 100% locally in the browser using Rust/WASM in Web Workers and IndexedDB/localStorage persistence, with graceful local export fallback replacing optional cloud-share links in static deployment.
- **Consequences:** Zero backend dependency for all V1 capabilities; full compliance with `KIN-NFR-011` and `KIN-NFR-012`.

## `IMPL-DEC-003`: Procedural Parametric CAD/Cutaway 3D Vehicle Assemblies
- **Date:** 2026-11-16
- **Context:** Repository contains complete Phase 0 3D specifications (`3D_ASSET_SPECIFICATION.md`, `ASSEMBLY_HIERARCHY.md`) and zero pre-existing `.glb` binaries.
- **Decision:** Build a rich, engineering-accurate modular procedural Three.js / React Three Fiber assembly builder (`scene3d/`) that generates articulated multi-part automotive geometry (unibody/ladder-frame chassis, subframes, transverse/longitudinal I4 engine cutaway with block/head/crankshaft/pistons/con-rods/valvetrain/intake/exhaust/cooling, clutch/flywheel, 6-speed gearbox/transaxle, transfer case, center/front/rear differentials, driveshafts/CV/U-joints, floor EV battery pack with cell modules & BMS/PDU, front/rear inverters, PMSM/induction traction motors, single-speed reductions, double-wishbone/strut suspension arms, coil springs, dampers, anti-roll bars, steering rack/column/tie rods, vented disc rotors/calipers/master cylinder/ABS modulator, rims/tires/contact patches) strictly bound to canonical IDs, ISO 8855 -> Three.js cyclic coordinate mapping ($\det=+1$), explosion vectors, clipping-plane section cuts, and performance budget ($\ll 150\text{k}$ triangles, $\le 120$ draw calls via geometry sharing and instancing).
- **Consequences:** Immediate deterministic offline rendering with zero external CDN mesh dependencies, crisp CAD cutaway internals, and full support for all 7 configurations.
