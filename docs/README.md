# KINERA Phase 0 Documentation Package

**Official Name:** KINERA  
**Full Name:** Automotive Powertrain & Vehicle Dynamics Explorer  
**Tagline:** Explore the Mechanics. Understand the Motion.  
**Product Category:** Interactive Engineering Education Platform  
**Primary Domain:** Automotive Engineering  

---

## Purpose of This Package

This directory contains the complete Phase 0 product definition, automotive systems specification, mathematical physics models, software and simulation architecture, data schemas, 3D visual/interaction specifications, learning curriculum, quality assurance strategy, and delivery governance for **KINERA**.

Per the Phase 0 Documentation-First governance rule, this package establishes a single source of truth so that Phase 1–7 engineering teams can implement the application without reinterpreting product direction, vehicle configurations, mathematical assumptions, or system boundaries.

## Three Core Product Pillars

1. **Vehicle Architecture** — Configuration-driven exploration of seven canonical ICE and EV architectures (`ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `ICE-4WD`, `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD`) including chassis, powertrain, suspension, steering, braking, and wheel/tire subsystems.
2. **Powertrain Engineering** — End-to-end energy conversion, torque multiplication, gear ratios, differential behavior, drivetrain efficiency losses, and interactive Powertrain Journey visualization across ICE and EV platforms.
3. **Vehicle Dynamics** — Core V1 physics-based exploration of longitudinal motion, braking dynamics, simplified linear bicycle lateral dynamics, weight transfer, tire friction circles, and controlled multi-configuration comparison.

## Six Main Application Sections

1. **Overview**
2. **Vehicle Anatomy**
3. **Powertrain Journey**
4. **Engineering Simulator** (Powertrain Simulation, Vehicle Dynamics Simulation, Configuration Comparison)
5. **Engineering Insights** (~34 structured topics across 4 engineering domains)
6. **Technical Library** (10 structured engineering reference modules)

## Approved Technology Direction

- **Frontend:** React, TypeScript, Vite, Three.js, React Three Fiber, Drei, Zustand (offline-first core)
- **Simulation Engine:** Rust compiled to WebAssembly (WASM), executed off the main UI thread in Web Workers
- **Optional Backend:** Python, FastAPI, Pydantic (supplementary services; core explorer and simulator require no backend)
- **Data Layer:** Structured JSON datasets backed by versioned JSON Schemas and canonical dot-separated identifiers

## Navigation

- Start with [`DOCUMENTATION_INDEX.md`](DOCUMENTATION_INDEX.md) for the full map of all Phase 0 specifications.
- Check [`DOCUMENTATION_STATUS.md`](DOCUMENTATION_STATUS.md) for completion status, dependencies, and commit tracking.
- Review [`CHANGELOG.md`](CHANGELOG.md) for chronological documentation updates.
