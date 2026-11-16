# KINERA — Automotive Powertrain & Vehicle Dynamics Explorer

**Explore the Mechanics. Understand the Motion.**

**Live Application (GitHub Pages):** https://orls967.github.io/Kinera/

KINERA is an interactive automotive engineering platform for exploring multi-configuration vehicle architectures, inspecting 3D mechanical and electrical assemblies, tracing powertrain energy flow, and simulating longitudinal, lateral, braking, traction, and weight-transfer vehicle dynamics across both Internal Combustion Engine (ICE) and Electric Vehicle (EV) platforms.

## Current Project Phase

**V1 Implementation Complete — Deployed & Verified on GitHub Pages**

All Phase 0 product definitions, vehicle architectures, engineering mathematical models, software specifications, JSON schemas, QA plans, and governance artifacts live under [`docs/`](docs/README.md). Implementation status and verification reports live under [`docs/implementation/`](docs/implementation/IMPLEMENTATION_STATUS.md).

## Implemented Capabilities

- **Six Application Sections:** Overview, Vehicle Anatomy (interactive 3D WebGL cutaway), Powertrain Journey (Propulsion & EV Regen), Engineering Simulator (Powertrain, Vehicle Dynamics, Configuration Comparison), Engineering Insights (37 curriculum topics), and Technical Library (10 nine-part modules).
- **Seven Canonical Vehicle Configurations:** `ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `ICE-4WD` (`2H`/`4H`/`4L`), `EV-FWD`, `EV-RWD`, and `EV-DUAL-AWD` driven through one shared topology-based architecture.
- **Rust/WASM Simulation Engine (`crates/kinera-core`, `crates/kinera-wasm`):** Strict SI internal physics running inside a dedicated Web Worker (`sim.worker.ts`) with classical RK4 integration, 19+ edge-case guards, and Draft 2020-12 JSON Schema validation.
- **Offline-First Static PWA:** Workbox Service Worker precaching app shell, `.wasm`, `.js`, and KaTeX fonts for offline execution on GitHub Pages.

## Local Development & Verification

```bash
# Build Rust -> WebAssembly package
npm run build:wasm

# Run Rust unit, topology, equation benchmark & edge-case tests
npm run test:rust

# Run frontend TypeScript, ESLint, and Vitest schema/unit suites
npm run typecheck && npm run lint && npm run test:web

# Build production PWA bundle (GitHub Pages subpath) and run Playwright E2E
npm run build && npm run test:e2e
```

## Quick Navigation

- [Documentation Overview](docs/README.md)
- [Documentation Index](docs/DOCUMENTATION_INDEX.md)
- [Implementation Status](docs/implementation/IMPLEMENTATION_STATUS.md)
- [Implementation Test Report](docs/implementation/IMPLEMENTATION_TEST_REPORT.md)
- [Implementation Deployment Report](docs/implementation/IMPLEMENTATION_DEPLOYMENT_REPORT.md)
- [Vehicle Configuration Specification (7 Canonical Layouts)](docs/02-vehicle-architecture/VEHICLE_CONFIGURATION_SPECIFICATION.md)
