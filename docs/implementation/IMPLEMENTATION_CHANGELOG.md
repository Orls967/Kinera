# KINERA Implementation Changelog

Chronological log of implementation milestones following Phase 0 completion (`817763f`).

---

## [1.0.0] — 2026-11-16 (Implementation Complete & Verified on GitHub Pages)

### Stage 14 — Final Acceptance & Handover
- Updated `README.md` with live deployment URL (`https://orls967.github.io/Kinera/`), implemented stack, and local verification commands.
- Published verified `IMPLEMENTATION_DEPLOYMENT_REPORT.md` and `IMPLEMENTATION_STATUS.md`.

### Stage 13 — Deployment Fixes & Live Verification (`9e4463a`)
- Added deterministic automatic launch upshifting in `MultiConfigComparison` (`crates/kinera-core/src/dynamics/mod.rs`) eliminating 1st-gear rev-limiter oscillation on ICE launch curves.
- Configured Workbox `clientsClaim: true`, `skipWaiting: true`, and `navigateFallback: 'index.html'` for offline PWA reloads under `/Kinera/`.
- Prioritized 3D viewport ordering above side panels on tablet/mobile viewports (`@media (max-width: 1279px)`) and refined `underbody-drivetrain` camera angle.
- Verified live website (`https://orls967.github.io/Kinera/`) with Playwright E2E (0 console errors, 0 failed requests) and visual inspection of 10 screenshots across Desktop, Tablet, and Mobile.

### Stages 1–12 — Full Product Implementation (`4d7245a`..`f35185c`)
- Bootstrapped Rust/WASM workspace (`crates/kinera-core`, `crates/kinera-wasm`) and React/TypeScript/Vite/R3F/Drei/Zustand/KaTeX/PWA frontend (`apps/web`).
- Implemented all 7 canonical vehicle configurations (`ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `ICE-4WD`, `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD`), 45+ canonical components, 29 engineering equations, 37 Engineering Insights topics, and 10 Technical Library modules.
- Built procedural parametric 3D CAD cutaway vehicle assembly, Powertrain Journey playback + EV regen, Engineering Simulator (Powertrain, Vehicle Dynamics 4 tabs, Configuration Comparison), and GitHub Actions Pages workflow.
