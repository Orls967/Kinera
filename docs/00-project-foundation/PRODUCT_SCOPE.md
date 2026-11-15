# Product Scope — KINERA

**Document ID:** `KIN-DOC-00-04`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

This document establishes crisp V1 scope boundaries for **KINERA**: what is mandatory in V1, what is represented only at conceptual/educational fidelity, and what is explicitly excluded from V1 so engineering teams neither under-deliver core dynamics nor over-engineer unsupported CAE complexity.

## 2. In-Scope Capabilities (Mandatory V1)

### 2.1 Application & Platform
- Full six-section web application (`Overview`, `Vehicle Anatomy`, `Powertrain Journey`, `Engineering Simulator`, `Engineering Insights`, `Technical Library`).
- Responsive layout across desktop, tablet, and mobile viewports.
- Offline-first PWA capability with local bundled datasets, 3D assets, and Rust/WASM simulation runtime.
- Optional Python/FastAPI backend for supplementary non-blocking features (e.g., shareable scenario snapshots, telemetry-free server validation/export utilities) with zero runtime dependency for core features.

### 2.2 Multi-Configuration Architecture (All 7 Layouts in V1)
- `ICE-FWD` (`vehicle.config.ice-fwd`): Transverse inline-4 ICE, transaxle, integrated front differential, front CV axles.
- `ICE-RWD` (`vehicle.config.ice-rwd`): Longitudinal inline-4 ICE, clutch, manual gearbox, driveshaft, rear differential, rear axles.
- `ICE-AWD` (`vehicle.config.ice-awd`): Longitudinal/transverse reference ICE, transmission, center differential / torque-split unit, front & rear driveshafts, front & rear differentials.
- `ICE-4WD` (`vehicle.config.ice-4wd`): Longitudinal ICE, transmission, transfer case (`2H`, `4H`, `4L` mode states), front & rear driveshafts, front & rear differentials; explicit distinction between part-time and full-time 4WD.
- `EV-FWD` (`vehicle.config.ev-fwd`): Battery pack, BMS, front inverter, front traction motor, single-speed reduction gearbox, front differential, front axles.
- `EV-RWD` (`vehicle.config.ev-rwd`): Battery pack, BMS, rear inverter, rear traction motor, single-speed reduction gearbox, rear differential, rear axles.
- `EV-DUAL-AWD` (`vehicle.config.ev-dual-awd`): Shared battery pack/BMS, independent front & rear inverters, motors, reduction units, and differentials, electronic front/rear torque allocation.

### 2.3 Vehicle Anatomy & 3D Exploration
- Seven vehicle system groups: Structure/Chassis, ICE & Fuel, EV Electrical, Transmission & Drivetrain, Suspension & Steering, Braking, Wheels & Tires.
- Inspection modes: full vehicle, powertrain, chassis, suspension, brake system, component isolation, exploded assembly, section cut, transparency, layer visibility, camera presets, relationship graph inspection, power-flow highlighting.

### 2.4 Powertrain Engineering & Journey
- Step-by-step animated energy & torque flow for both ICE and EV, including regenerative braking paths and multi-axle splits.
- Detailed manual transmission and single-speed EV reduction models; conceptual representation of automatic transmissions in anatomy/learning modules.
- Differential simulation models: Open, Simplified Limited-Slip (LSD), Locked, Center Differential, and EV Electronic Torque Allocation.

### 2.5 Vehicle Dynamics Simulation (Mandatory Core V1)
- **Longitudinal Dynamics:** Net force, acceleration, velocity, distance, aerodynamic drag, rolling resistance, road gradient, mass/Cd/grade experiments.
- **Lateral Dynamics:** 2-DOF simplified linear bicycle model (yaw rate, lateral acceleration, sideslip, path visualization, understeer/oversteer gradient/tendency, validity bounds).
- **Braking Dynamics:** Ideal deceleration, stopping distance/time, brake bias, friction limits, conceptual ABS slip indicator.
- **Weight Transfer:** Quasi-static longitudinal and lateral axle/wheel load transfer formulas and interactive visualization.
- **Tire Traction & Friction:** Normal-load friction cap ($\mu F_z$), wheel slip utilization, and simplified friction circle.
- **Performance Analysis:** Model-based estimates for 0–100 km/h, quarter-mile, top speed, braking distance, cornering response, gradeability, energy consumption, and power-to-weight ratio.

### 2.6 Learning Content
- ~34–37 structured **Engineering Insights** topics across 4 groups (Powertrain Fundamentals, Vehicle Architecture, Vehicle Dynamics, EV Engineering).
- 10 structured **Technical Library** modules with verified canonical equations, glossaries, and references.

## 3. Conceptual / Parameterized V1 Representations (Explicit Fidelity Bounds)

These topics are included in V1 **only** at documented educational/conceptual fidelity—never marketed as high-fidelity multiphysics:
- **Automatic Transmission:** Structural anatomy, planetary/torque-converter concept explanation; no hydrodynamic torque-converter fluid or shift-clutch pressure transient solver in V1.
- **EV Motor Variants:** PMSM and Induction motor principles explained conceptually; V1 simulation uses parameterized torque/efficiency maps rather than electromagnetic finite-element (FEA) simulation.
- **ABS:** Conceptual wheel-slip threshold clamping and visual indicator; no hydraulic solenoid pulse modulation model.
- **Suspension & Compliance:** Structural 3D anatomy and animated kinematics cues in Vehicle Anatomy; V1 dynamics does not run full 4-wheel multibody kinematics & compliance (K&C), instead capturing ride height / CG height via quasi-static weight transfer.

## 4. Explicitly Excluded from V1 (`OUT OF SCOPE`)

The following capabilities are **excluded from V1** and must not appear in V1 acceptance criteria:
1. Full Computational Fluid Dynamics (CFD) or 3D airflow field solving.
2. Chemical combustion kinetics / flame-front thermodynamics simulation.
3. Finite Element Analysis (FEA) of structural stress, fatigue, or vibration.
4. Crashworthiness or impact deformation simulation.
5. High-fidelity nonlinear empirical/physical tire models (e.g., Pacejka Magic Formula, thermal tire wear, transient carcass relaxation).
6. Full suspension Kinematics & Compliance (K&C) and roll-center migration solvers.
7. Full 14-DOF+ multibody vehicle dynamics with sprung/unsprung roll/pitch suspension springs and dampers.
8. Cycle-accurate embedded ECU firmware emulation or CAN bus HIL simulation.
9. Cell-level electrochemical thermal runaway or aging impedance spectroscopy models.
10. Real-world OBD-II / vehicle telemetry ingestion.
11. Autonomous driving perception, ADAS sensor fusion, or path-planning stacks.

## 5. Cross-References

- [`PRODUCT_REQUIREMENTS_DOCUMENT.md`](PRODUCT_REQUIREMENTS_DOCUMENT.md)
- [`ASSUMPTIONS_AND_CONSTRAINTS.md`](ASSUMPTIONS_AND_CONSTRAINTS.md)
- [`../11-delivery-and-operations/MAINTENANCE_AND_FUTURE_EXPANSION.md`](../11-delivery-and-operations/MAINTENANCE_AND_FUTURE_EXPANSION.md)
