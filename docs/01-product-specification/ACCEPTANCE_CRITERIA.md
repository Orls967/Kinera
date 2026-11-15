# Acceptance Criteria — KINERA V1

**Document ID:** `KIN-DOC-01-06`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines objective, pass/fail V1 release acceptance criteria (`AC-001`–`AC-022`) mapped directly to PRD, Functional, and Non-Functional requirements along with their required verification methods.

## 2. Master V1 Acceptance Criteria Table

| AC ID | Title | Acceptance Criterion (Pass Condition) | Mapped Requirements | Verification Method |
| :--- | :--- | :--- | :--- | :--- |
| **AC-001** | Six-Section Shell | All 6 approved application sections (`Overview`, `Vehicle Anatomy`, `Powertrain Journey`, `Engineering Simulator`, `Engineering Insights`, `Technical Library`) render, route cleanly, and preserve navigation state on desktop, tablet, and mobile. | `KIN-PRD-001`, `KIN-FR-001`, `KIN-NFR-017` | Playwright E2E + responsive snapshot |
| **AC-002** | Seven Canonical Configs | All 7 canonical configurations (`ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `ICE-4WD`, `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD`) are selectable, validate against `vehicle-configuration.schema.json`, and dynamically reconfigure 3D topology, journey, and simulator without errors. | `KIN-PRD-002`, `KIN-PRD-003`, `KIN-FR-002`, `KIN-FR-003` | Topology integration test + E2E config-switch test |
| **AC-003** | Shared Framework Invariance | Zero duplicate per-configuration physics engines or forked 3D scene applications exist; all 7 layouts execute through one topology-driven Rust/WASM engine and one R3F assembly renderer. | `KIN-PRD-003`, `KIN-NFR-021` | Architecture & codebase static audit |
| **AC-004** | Full Vehicle Systems | Every configuration in Vehicle Anatomy renders appropriate structural, propulsion, transmission/drivetrain, suspension/steering, braking, and wheel/tire components matching its topology. | `KIN-PRD-004`, `KIN-FR-008` | Topology-to-3D hierarchy verification test |
| **AC-005** | 3D Inspection Tools | Selection, hover highlighting, isolation, layer visibility, transparency, parametric exploded assembly, section-cut clipping, power-flow highlighting, and smooth camera presets operate without WebGL leaks or console errors. | `KIN-PRD-004`, `KIN-FR-009`..`KIN-FR-016` | 3D interaction Playwright/WebGL test |
| **AC-006** | Component Metadata Contract | Clicking any visible component displays a validated metadata panel populated via its canonical ID, including clickable upstream/downstream component relationships. | `KIN-PRD-005`, `KIN-FR-013`, `KIN-FR-014` | Component schema validation + UI inspection test |
| **AC-007** | ICE & EV Powertrain Journey | Step-by-step Powertrain Journey executes with Play/Pause/Step/Replay controls for both ICE (including transaxle/AWD/4WD 2H-4H-4L splits) and EV (including dual-motor splits and bidirectional regenerative braking). | `KIN-PRD-006`, `KIN-FR-018`..`KIN-FR-023` | Journey sequence verification & UI E2E |
| **AC-008** | ICE & EV Powertrain Sim | Powertrain Simulation accurately computes $\omega$, $P$, gearbox/reduction output, driveshaft RPM, total axle torque, per-wheel torque, wheel RPM, tractive force, drivetrain losses (no double-counting), and EV electrical power/current/SOC energy draw. | `KIN-PRD-007`, `KIN-PRD-008`, `KIN-PRD-010`, `KIN-FR-024`..`KIN-FR-028` | Rust analytical unit tests (`tol <= 1e-6`) |
| **AC-009** | Differential & 4WD Fidelity | Open differential obeys lower-traction wheel cap ($2\times T_{min\_grip}$); LSD, locked, center differential, 4WD transfer case (`2H`/`4H`/`4L`), and EV electronic allocation produce mathematically distinct, physically defensible wheel outputs. | `KIN-PRD-009`, `KIN-FR-007`, `KIN-FR-027` | Asymmetric-$\mu$ differential benchmark tests |
| **AC-010** | Longitudinal Dynamics | Longitudinal simulation matches analytical steady-state drag/rolling/grade equilibrium and integrates acceleration, velocity, and distance within validated numerical tolerance across mass, $C_d$, $C_{rr}$, and slope sweeps. | `KIN-PRD-011`, `KIN-FR-029`, `KIN-FR-030`, `KIN-NFR-008` | Numerical vs analytical benchmark suite |
| **AC-011** | Lateral Bicycle Model | Lateral simulation implements the 2-DOF linear bicycle equations, accurately reproduces analytical steady-state yaw rate gain and understeer/oversteer classification, plots XY path, and raises validity warnings when $|\alpha| > 6^\circ$ or $|a_y| > 0.4g$. | `KIN-PRD-012`, `KIN-FR-031`..`KIN-FR-033` | Bicycle analytical & boundary warning tests |
| **AC-012** | Braking & Weight Transfer | Braking dynamics computes deceleration, stopping distance ($v_0^2 / 2|a|$ for constant $a$), brake bias split, friction cap, and quasi-static longitudinal/lateral weight transfer conserved across all 4 tires ($\sum F_z = mg \cos\theta$). | `KIN-PRD-013`, `KIN-FR-034`, `KIN-FR-035` | Conservation & braking benchmark tests |
| **AC-013** | Tire Friction Circle | Combined longitudinal/lateral inputs respect $(F_x/\mu F_z)^2 + (F_y/\mu F_z)^2 \le 1$ and visualize tire traction saturation honestly as a simplified educational model. | `KIN-PRD-014`, `KIN-FR-036` | Friction-circle clamping unit test |
| **AC-014** | Performance Estimates & Labels | Simulator produces 0–100 km/h, quarter-mile, top speed, braking distance, cornering, gradeability, energy consumption, and power-to-weight metrics, each visibly labeled as simulated model estimates. | `KIN-PRD-014`, `KIN-FR-037`, `KIN-FR-038` | E2E label assertion + regression check |
| **AC-015** | Controlled Config Comparison | Configuration Comparison compares $\ge 2$ configs side-by-side, enforces Matched Baseline controls, explicitly flags differing parameters, and never assigns an absolute winner badge. | `KIN-PRD-015`, `KIN-FR-039`..`KIN-FR-041` | Multi-config comparison integration test |
| **AC-016** | Insights & Library Content | All ~37 Engineering Insights topics and 10 Technical Library modules load offline with rendered equations, glossary links, and working deep links to 3D Anatomy & Simulator presets. | `KIN-PRD-016`, `KIN-FR-042`..`KIN-FR-046` | Content schema validation + E2E link crawl |
| **AC-017** | Rust/WASM Worker Execution | All physics simulations run in Rust/WASM inside a Web Worker using strict SI internal units, achieving single-step $\le 2\text{ ms}$ and 3,000-step time series $\le 25\text{ ms}$ with 100% deterministic repeatability. | `KIN-PRD-017`, `KIN-NFR-005`, `KIN-NFR-007`, `KIN-NFR-009` | Worker integration & determinism hash test |
| **AC-018** | Offline-First Verification | All 6 sections, 7 configurations, 3D assemblies, Journey animations, Engineering Simulator, and learning content function fully with network connectivity disabled. | `KIN-PRD-018`, `KIN-NFR-011`, `KIN-NFR-012` | Playwright offline-mode full smoke suite |
| **AC-019** | Transparency & Citations | Every simulation equation and learning article exposes assumptions, validity bounds, and credible references (with unverified sources explicitly flagged). | `KIN-PRD-019`, `KIN-NFR-010` | Audit script + UI disclosure review |
| **AC-020** | 3D Performance & Accessibility | Standard scenes stay near $\le 150\text{k}$ active triangles ($\le 180\text{k}$ hard cap) and $\le 120$ draw calls ($\le 150$ hard cap), meet FPS targets via adaptive tiers, and pass WCAG 2.1 AA keyboard/contrast audits. | `KIN-PRD-020`, `KIN-NFR-001`..`003`, `KIN-NFR-014`..`016` | GPU telemetry test + `axe-core` + keyboard walkthrough |
| **AC-021** | Edge-Case Resilience | All 19+ documented edge cases (zero RPM/torque/speed, invalid gear, depleted battery, zero normal load, extreme $\Delta t$, invalid topology) return structured, safe outputs or explicit error envelopes without `NaN`/`Inf` or crashes. | `KIN-NFR-013` | Edge-case fuzz & Rust panic-free test suite |
| **AC-022** | V1 Exclusions Honored | Zero unapproved high-fidelity claims (full CFD, combustion chemistry, FEA, crash, Pacejka nonlinear tires, full K&C, full multibody, ECU emulation) appear in UI marketing or acceptance assertions. | `PRODUCT_SCOPE.md` | Release documentation & UI copy audit |

## 3. Cross-References

- [`PRODUCT_REQUIREMENTS_DOCUMENT.md`](../00-project-foundation/PRODUCT_REQUIREMENTS_DOCUMENT.md)
- [`FUNCTIONAL_REQUIREMENTS.md`](FUNCTIONAL_REQUIREMENTS.md)
- [`NON_FUNCTIONAL_REQUIREMENTS.md`](NON_FUNCTIONAL_REQUIREMENTS.md)
- [`../10-quality-assurance/ACCEPTANCE_TEST_PLAN.md`](../10-quality-assurance/ACCEPTANCE_TEST_PLAN.md)
- [`../12-project-governance/REQUIREMENTS_TRACEABILITY_MATRIX.md`](../12-project-governance/REQUIREMENTS_TRACEABILITY_MATRIX.md)
