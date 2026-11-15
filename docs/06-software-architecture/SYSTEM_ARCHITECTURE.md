# System Architecture — KINERA

**Document ID:** `KIN-DOC-06-01`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the end-to-end software system architecture of **KINERA**, enforcing strict separation between presentation/3D rendering, physics computation, domain registries, and optional backend services while honoring the offline-first mandate.

## 2. High-Level System Architecture

```mermaid
flowchart TB
    subgraph Browser["Browser Runtime (100% Offline-Capable PWA)"]
        UI["React + TypeScript + Vite UI<br/>(6 Sections, Telemetry Plots, Accessibility)"]
        R3F["Three.js + React Three Fiber + Drei<br/>(Reusable 3D Assembly & Cutaway Viewport)"]
        STORE["Zustand State Stores + Static JSON Registries<br/>(Configs, Components, Equations, Learning Content)"]
        WORKER["Dedicated Simulation Web Worker<br/>(Typed Request/Response Queue + Cancellation)"]
        WASM["Rust / WebAssembly Core (`kinera-sim`)<br/>(Powertrain, Longitudinal, Lateral, Braking, Comparison)"]
        SW["Service Worker + CacheStorage + IndexedDB<br/>(Offline Bundles, GLBs, Local Saved Scenarios)"]
    end
    subgraph OptionalBackend["Optional Backend Services (Non-Blocking)"]
        API["Python + FastAPI + Pydantic<br/>(Shareable Scenario Snapshots & Server Verification Export)"]
    end

    UI <--> STORE
    R3F <--> STORE
    STORE <-->|"Structured Message Protocol"| WORKER
    WORKER <-->|"WASM ABI (SI Units)"| WASM
    Browser <-->|"Precached Static & Dynamic Bundles"| SW
    UI -.->|"Optional Online Only (Never Required)"| API
```

## 3. Core Architectural Invariants

1. **Single Source of Truth:** Static JSON registries (`vehicle-configs.json`, `components.json`, `equations.json`, `insights.json`, `library.json`, `animations.json`, `assets.json`) supply authoritative data to UI, 3D loader, and WASM simulation defaults.
2. **Physics Off Main Thread:** Zero ODE loops or heavy powertrain sweeps run on the JavaScript main UI thread; all run inside `sim.worker.ts` wrapping compiled Rust/WASM.
3. **Offline-First Core:** All 6 sections, all 7 configurations, core 3D assets, and WASM execution live inside browser-cached static assets.
4. **Clear Frontend/Backend Boundary:** Python/FastAPI provides strictly optional cloud features (e.g., short URL scenario sharing, educator classroom preset packs, PDF/JSON report export verification); core learning and simulation never fail if the API is unreachable (`KIN-NFR-012`).

## 4. Cross-References

- [`FRONTEND_ARCHITECTURE.md`](FRONTEND_ARCHITECTURE.md)
- [`BACKEND_ARCHITECTURE.md`](BACKEND_ARCHITECTURE.md)
- [`RUST_WASM_ARCHITECTURE.md`](RUST_WASM_ARCHITECTURE.md)
- [`OFFLINE_FIRST_ARCHITECTURE.md`](OFFLINE_FIRST_ARCHITECTURE.md)
