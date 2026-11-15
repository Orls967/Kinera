# Powertrain Journey Specification — KINERA

**Document ID:** `KIN-DOC-03-07`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Specifies the interactive educational workflow, configuration-specific step sequences, synchronized 3D mechanical/electrical animations, and live stage telemetry for Section 3 (**Powertrain Journey**, `KIN-PWT-025`–`KIN-PWT-028`).

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-PWT-025** | Powertrain Journey shall load a configuration-specific ordered sequence matching the active layout's `DrivetrainPath` topology. |
| **KIN-PWT-026** | Every stage shall synchronize active 3D component highlighting, energy-flow particle/pulse splines, mechanical motion cues, and stage telemetry (`RPM`, `omega`, `T`, `P`, `loss`). |
| **KIN-PWT-027** | User playback controls shall support Play, Pause, Replay, Step Forward, Step Backward, Speed (`0.5x`, `1x`, `2x`), and EV mode switch (`Propulsion` vs `Regenerative Braking`). |
| **KIN-PWT-028** | Annotations shall visually and textually distinguish energy flow ($\text{J}$), power ($\text{W}/\text{kW}$), torque ($\text{N}\cdot\text{m}$), and angular speed ($\text{RPM}/\text{rad/s}$). |

## 3. Configuration-Specific Journey Stage Definitions

### 3.1 ICE Journey Sequence Matrix

| Step | `ICE-FWD` | `ICE-RWD` | `ICE-AWD` | `ICE-4WD` | Visual & Telemetry Cue |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | Fuel & Air Intake | Fuel & Air Intake | Fuel & Air Intake | Fuel & Air Intake | Chemical energy into cylinders |
| 2 | 4-Stroke Combustion | 4-Stroke Combustion | 4-Stroke Combustion | 4-Stroke Combustion | Piston stroke, spark flash, pressure |
| 3 | Crankshaft & Flywheel | Crankshaft & Flywheel | Crankshaft & Flywheel | Crankshaft & Flywheel | Linear -> rotary ($T_{eng}, \text{RPM}_{eng}$) |
| 4 | Clutch Coupling | Clutch Coupling | Clutch Coupling | Clutch Coupling | Friction disc lock into input shaft |
| 5 | **Transaxle Gearset** | **Manual Gearbox** | **Manual Gearbox** | **Manual Gearbox** | Gear mesh engagement ($G_k, \eta_{trans}$) |
| 6 | *Skipped (Integrated)* | **Main Driveshaft** | **Center Differential** | **Transfer Case (`2H/4H/4L`)** | F/R torque split or shaft spin |
| 7 | **Integrated Front Diff** | **Rear Differential** | **Front & Rear Shafts + Diffs** | **Active Shafts + Front/Rear Diffs** | Bevel/spider gear rotation + split % |
| 8 | Front CV Axles & Wheels | Rear Axles & Wheels | All 4 Axles & Wheels | Active Axles & Wheels | $T_{wheel}, \text{RPM}_{wheel}, F_{tractive}$ |

### 3.2 EV Journey Sequence Matrix (Propulsion & Regen)

| Step | `EV-FWD` | `EV-RWD` | `EV-DUAL-AWD` | Mode Note |
| :---: | :--- | :--- | :--- | :--- |
| 1 | Battery Pack & BMS | Battery Pack & BMS | Battery Pack & BMS | DC voltage $V_{pack}$, SOC %, current $I$ |
| 2 | Front Inverter | Rear Inverter | **Dual Front + Rear Inverters** | DC <-> 3-Phase AC ($\eta_{inv}$) |
| 3 | Front Traction Motor | Rear Traction Motor | **Dual Front + Rear Motors** | Electromagnetic stator/rotor torque |
| 4 | Front Single-Speed Reduction | Rear Single-Speed Reduction | **Independent Front & Rear Reductions** | $G_{red}$ speed down / torque up |
| 5 | Front EV Differential | Rear EV Differential | **Front & Rear EV Differentials** | L/R split + electronic F/R % badge |
| 6 | Front Wheels | Rear Wheels | All 4 Wheels | Bidirectional arrows in **Regen Mode** |

## 4. Playback & Telemetry State Contract

Journey animations read reference operating states (e.g., ICE `3rd Gear @ 3500 RPM`, EV `50 km/h Cruise` or `Regen Decel`) computed by the shared Rust/WASM powertrain evaluator so displayed stage RPMs, torques, and losses are 100% consistent with the Engineering Simulator!

## 5. Cross-References

- [`../02-vehicle-architecture/POWER_FLOW_TOPOLOGY.md`](../02-vehicle-architecture/POWER_FLOW_TOPOLOGY.md)
- [`../08-3d-and-visualization/ANIMATION_SYSTEM.md`](../08-3d-and-visualization/ANIMATION_SYSTEM.md)
- [`../schemas/animation-sequence.schema.json`](../schemas/animation-sequence.schema.json)
