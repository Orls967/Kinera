# Technology Decisions (ADRs) — KINERA

**Document ID:** `KIN-DOC-06-09`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Records locked Architecture Decision Records (`ADR-001`–`ADR-007`) justifying technology choices, alternatives rejected, and architectural consequences across KINERA V1.

## 2. Architecture Decision Records

### `ADR-001`: Single Configuration-Driven Engine vs. Per-Layout Codebases
- **Decision:** Use one configuration-driven topology engine and one modular R3F assembly renderer for all 7 configurations (`ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `ICE-4WD`, `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD`).
- **Rationale:** Prevents 7x code duplication, ensures mathematical consistency during comparisons, and simplifies adding future hybrid/multi-motor configurations.

### `ADR-002`: React + TypeScript + Vite + R3F + Drei + Zustand Frontend
- **Decision:** Adopt React 18+/TypeScript on Vite with React Three Fiber (`@react-three/fiber`), `@react-three/drei`, and Zustand.
- **Rationale:** Declarative scene graph composition fits hierarchical CAD subassemblies cleanly; Zustand avoids React context re-render storms and provides `getState()` access inside R3F `useFrame` loops.

### `ADR-003`: Rust + WebAssembly Inside Web Workers for Physics
- **Decision:** Author physics kernels in pure Rust (`kinera-core`), compile to WebAssembly (`kinera-wasm`), and run inside a dedicated Web Worker (`sim.worker.ts`).
- **Rationale:** Enforces memory safety, SI newtype compile-time invariants, deterministic IEEE-754 execution, sub-millisecond single-point solving, and zero UI frame drops during 3,000-step RK4 runs.

### `ADR-004`: Strictly Optional Python + FastAPI + Pydantic Backend
- **Decision:** Keep all simulation, 3D inspection, and content completely local; confine Python/FastAPI to optional snapshot sharing and report export validation.
- **Rationale:** Guarantees offline-first reliability in classrooms and labs while offering clean typed REST extensibility where needed.

### `ADR-005`: Internal SI Units Everywhere + Boundary UI Formatting
- **Decision:** Store strictly SI base/derived quantities in all Rust structs, JSON files, schemas, and Zustand simulation slices.
- **Rationale:** Eliminates unit mismatch bugs (e.g., `km/h` fed into `0.5 * rho * Cd * A * v^2` or `deg` fed into `sin(theta)`).

### `ADR-006`: Immutable Dot-Separated Canonical IDs
- **Decision:** Key every vehicle configuration, subsystem, component, equation, concept, asset, and animation sequence via lowercase dot-separated strings (`ice.engine.crankshaft`).
- **Rationale:** Decouples presentation labels/localization from machine references across JSON datasets, 3D mesh node names, and TypeScript/Rust types.

### `ADR-007`: Simplified Reduced-Order Educational Dynamics Over Multi-Body CAE
- **Decision:** Implement longitudinal rigid-body, 2-DOF linear bicycle, quasi-static load transfer, and simplified friction-circle models with explicit validity warnings.
- **Rationale:** Keeps physics transparent, mathematically inspectable by students, fast in real-time browser WASM, and honest about V1 fidelity boundaries.

## 3. Cross-References

- [`SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md)
- [`../12-project-governance/DECISION_LOG.md`](../12-project-governance/DECISION_LOG.md)
