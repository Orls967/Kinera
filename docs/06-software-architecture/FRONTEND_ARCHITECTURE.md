# Frontend Architecture — KINERA

**Document ID:** `KIN-DOC-06-02`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the React + TypeScript + Vite + Three.js + React Three Fiber + Drei module structure, code splitting, unit formatting boundary, and shared 3D viewport lifecycle.

## 2. Target Repository Module Structure (Phase 1+ Blueprint)

```text
apps/web/src/
├── app/                   # App shell, router, global config selector, offline indicator, error boundary
├── features/
│   ├── overview/          # Section 1: 360 showcase & pillar cards
│   ├── anatomy/           # Section 2: Hierarchy tree, inspection controls, inspector drawer
│   ├── journey/           # Section 3: Powertrain Journey stepper, telemetry HUD
│   ├── simulator/         # Section 4: Powertrain, Dynamics (4 tabs), Config Comparison
│   ├── insights/          # Section 5: 4-track Engineering Insights browser & topic viewer
│   └── library/           # Section 6: 10-module Technical Library reader
├── scene3d/               # Shared R3F Canvas, AssemblyRenderer, Explode/SectionCut controllers, CameraRig
├── simulation/            # Worker client proxy, typed TS contracts, unit formatting converters
├── registries/            # Typed loaders & schema validators for static JSON datasets
├── store/                 # Zustand slices (app, anatomy, journey, simulator, preferences)
└── shared/                # Design system primitives, accessible HUD controls, KaTeX math renderer
```

## 3. Unit Conversion & Display Formatting Boundary

- **Strict Boundary Rule (`KIN-NFR-009`):** React/Zustand simulation state stores exclusively SI numbers (`m/s`, `N·m`, `W`, `rad`, `J`).
- Pure formatter utilities (`formatSpeed(mps, unitPref)`, `formatPower(watts, unitPref)`, `parseAngleInput(val, unitPref)`) live strictly at UI display/input edge components. This eliminates accidental `km/h`-vs-`m/s` or `deg`-vs-`rad` corruption inside physics equations!

## 4. Shared Persistent `<Canvas>` Pattern

Because `Overview`, `Vehicle Anatomy`, `Powertrain Journey`, and `Vehicle Dynamics` (3D motion cues) all render the active vehicle assembly, the R3F `<Canvas>` mounts once inside a persistent viewport container positioned beneath route-specific HUD overlays. Route changes swap lighting/camera presets and assembly modes without destroying WebGL buffers or re-compiling shaders.

## 5. Cross-References

- [`STATE_MANAGEMENT.md`](STATE_MANAGEMENT.md)
- [`DATA_FLOW.md`](DATA_FLOW.md)
- [`../08-3d-and-visualization/DESIGN_SYSTEM.md`](../08-3d-and-visualization/DESIGN_SYSTEM.md)
