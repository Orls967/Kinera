# Feature Specifications — KINERA

**Document ID:** `KIN-DOC-01-05`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Provides detailed user-facing feature specifications for every section and module of KINERA V1, bridging functional requirements (`FUNCTIONAL_REQUIREMENTS.md`) with domain engineering and UI/3D contracts.

## 2. Section 1 — Overview

- **Hero Laboratory Stage:** Interactive 3D vehicle showcase of the currently active configuration on an engineering turntable grid with subtle cyan/silver rim lighting.
- **Cinematic Reveal Toggles:** `Exterior`, `Chassis Reveal`, `Powertrain Reveal`, and `360° Turntable`.
- **Seven-Configuration Matrix Cards:** Quick selector cards comparing driven wheels, prime mover (`ICE` vs `EV`), key differential/transfer mechanism, and launch link to Anatomy, Journey, or Simulator.
- **Pillar Entry Cards:** Guided entry into Vehicle Architecture, Powertrain Engineering, and Vehicle Dynamics.

## 3. Section 2 — Vehicle Anatomy

### 3.1 System & Layer Tree
- Left panel presents a filterable tree organized by the 7 canonical systems:
  1. `Vehicle Structure` (unibody/frame, front/rear subframes, mounts)
  2. `ICE & Fuel` (engine assembly, block, head, pistons, rods, crankshaft, intake, fuel, exhaust, cooling, lubrication)
  3. `EV Electrical` (battery pack, enclosure, modules, BMS, inverter(s), PMSM/induction motor(s), HV PDU, thermal loop)
  4. `Transmission & Drivetrain` (clutch, manual gearbox, transaxle, reduction drive, driveshafts, CV/U-joints, front/center/rear differentials, transfer case, axle shafts)
  5. `Suspension & Steering` (control arms, springs, dampers, anti-roll bar, steering rack, tie rods)
  6. `Braking System` (master cylinder, lines, calipers, pads, rotors, ABS modulator)
  7. `Wheels & Tires` (rim, hub/bearing, tire, contact patch visual marker)
- Only components valid for the active configuration render as active nodes (e.g., `ICE-FWD` omits longitudinal driveshaft and rear differential; `EV-DUAL-AWD` renders independent front & rear drive units and omits mechanical center differential).

### 3.2 Inspection Controls
- **View Modes:** `Full Vehicle`, `Powertrain`, `Chassis`, `Suspension`, `Brake System`.
- **Spatial Tools:** `Explode Slider` ($0\% \rightarrow 100\%$ radial/axial assembly separation), `Section Cut Plane` (`X`/`Y`/`Z` axis toggle + offset slider), `Shell Transparency` ($0\% \rightarrow 90\%$), `Isolate Selected`, `Power-Flow Overlay`.
- **Camera Bar:** `3/4 Front`, `Side`, `Top`, `Front Axle`, `Rear Axle`, `Underbody`, `Reset View`.

### 3.3 Component Inspector Drawer
- Displays canonical ID badge (`ice.engine.crankshaft`), subsystem, supported configurations list, primary engineering function, operating principle, mechanical/electrical inputs & outputs, physical specs, clickable `Upstream` / `Downstream` component links, and `Open in Powertrain Journey` / `Related Equations` buttons.

## 4. Section 3 — Powertrain Journey

- **Configuration-Driven Stepper:** Automatically builds the ordered journey sequence for the active layout:
  - `ICE-FWD`: Fuel -> Combustion -> Piston & Con-rod -> Crankshaft -> Clutch/Flywheel -> Transaxle Gearbox -> Integrated Front Differential -> Front CV Axles -> Front Wheels.
  - `ICE-RWD`: Fuel -> Combustion -> Piston & Con-rod -> Crankshaft -> Clutch/Flywheel -> Manual Gearbox -> Main Driveshaft -> Rear Differential -> Rear Axle Shafts -> Rear Wheels.
  - `ICE-AWD`: ... -> Gearbox -> Center Differential / Coupling -> Front & Rear Driveshafts -> Front & Rear Differentials -> All 4 Axles & Wheels.
  - `ICE-4WD`: ... -> Gearbox -> Transfer Case (`2H` / `4H` / `4L` selector) -> Front & Rear Driveshafts -> Differentials -> Wheels.
  - `EV-FWD` / `EV-RWD`: Battery Pack -> BMS / HV Distribution -> Inverter (DC-to-AC) -> Traction Motor -> Single-Speed Reduction -> Differential -> Axles -> Wheels (plus bidirectional **Regen Mode**).
  - `EV-DUAL-AWD`: Battery Pack -> BMS -> Dual Front & Rear Inverters -> Dual Motors -> Independent Front & Rear Reduction Drives -> Independent Axles -> Wheels (plus **Front/Rear Electronic Torque Split** slider and **Regen Mode**).
- **Stage Telemetry Overlay:** At every active stage, shows live modeled input RPM, output RPM, gear/reduction ratio, stage efficiency $\eta$, power loss ($\text{W}$), and stage torque ($\text{N}\cdot\text{m}$).

## 5. Section 4 — Engineering Simulator

### 5.1 Module A: Powertrain Simulation
- **Live Controls:** Configuration selector, ICE RPM + Throttle OR EV Motor RPM + Throttle + SOC, Gear selector (`1`–`6` / `R` for ICE; `1-Speed` for EV; `2H`/`4H`/`4L` for `ICE-4WD`), Differential mode (`Open`, `Simplified LSD`, `Locked`, `Center Diff`, `EV Dual Torque Split`), Left/Right & Front/Rear surface $\mu$ sliders, Final Drive ratio, Tire effective radius.
- **Interactive Torque Curve / Efficiency Map Plot:** Displays operating point cursor dynamically on the ICE $T(\text{RPM})$ & $P(\text{RPM})$ curve or EV Motor envelope + efficiency contour.
- **Drivetrain Cascade Readout:** Explicit distinct numeric cards for: Engine/Motor Shaft Torque, Gearbox Output Torque, Driveshaft RPM (when applicable), Total Driven Axle Torque, Individual Wheel Torques ($FL, FR, RL, RR$), Wheel RPM, Tractive Force ($F_{tractive}$), Stage Power Losses, and EV Electrical Power / Battery Current / Estimated Wh/km.

### 5.2 Module B: Vehicle Dynamics Simulation
Organized into four tightly integrated analytical tabs sharing the active vehicle configuration state:
1. **Longitudinal & Grade:** Configure mass, $C_d$, frontal area $A$, $C_{rr}$, air density $\rho$, road gradient $\theta$ ($\%$/deg), and launch from $v_0$. Plots Speed vs. Time, Distance vs. Time, Acceleration vs. Time, and Resistance Force Breakdown ($F_{tractive}, F_{drag}, F_{rolling}, F_{grade}$).
2. **Lateral Bicycle Model:** Configure speed $v_x$, steering angle profile (step steer / ramp steer), wheelbase $L$, CG split $a:b$, yaw inertia $I_z$, $C_{\alpha f}, C_{\alpha r}$. Plots Yaw Rate $r(t)$, Lateral Acceleration $a_y(t)$, Slip Angles $\alpha_f, \alpha_r$, Sideslip $\beta$, 2D XY Vehicle Trajectory, and Understeer Gradient ($K_{us}$) diagnosis—plus live Linear Validity Banner when $|\alpha| > 6^\circ$ or $|a_y| > 0.4g$.
3. **Braking & Weight Transfer:** Configure initial speed $v_0$, deceleration demand or pedal force, brake bias ($\%\text{ front}$), tire $\mu$, CG height $h$, wheelbase $L$, track width $t$, and optional cornering $a_y$. Visualizes real-time 4-wheel normal load bars ($F_{z,FL..RR}$), longitudinal & lateral weight transfer ($\Delta F_z$), stopping distance/time, and conceptual ABS slip warning when requested brake force exceeds $\mu F_z$.
4. **Traction, Friction Circle & Performance Analysis:** Displays 4-wheel simplified friction circles $(F_x/\mu F_z)^2 + (F_y/\mu F_z)^2 \le 1$ showing longitudinal vs. lateral grip competition, plus the **Simulated Performance Summary Card** (0–100 km/h, 402 m quarter-mile, theoretical top speed, 100–0 km/h braking distance, gradeability, energy/range estimate, power-to-weight ratio) explicitly stamped *"Simulated Model Estimate"*.

### 5.3 Module C: Configuration Comparison
- **Multi-Select Tray:** Pick 2–4 configurations (or full 7-configuration summary table).
- **Controlled Experiment Guard:** Default `Matched Baseline` mode locks total mass, peak power, tire $\mu$, $C_d$, $A$, and road grade across selected vehicles while keeping each configuration's genuine drivetrain topology, weight distribution default (or user-matched), and drivetrain efficiency stage structure. Any intentionally varied parameter triggers an amber **"Variable Difference Detected"** chip so comparisons remain scientifically honest.
- **Overlaid Plots & Matrix:** Speed vs. time, Wheel Torque vs. speed, Traction Utilization per axle, Braking distance, Energy consumption, and Qualitative Engineering Trade-off Summary (never crowning a single overall winner).

## 6. Section 5 — Engineering Insights & Section 6 — Technical Library

- **Engineering Insights:** ~37 structured interactive topic cards grouped into 4 tracks, each featuring Learning Objectives, Prerequisite badges, LaTeX Equations with SI Variable Tables, Conceptual Visual/3D deep link, Worked Numeric Example, and Peer-Reviewed / Textbook Citations.
- **Technical Library:** 10 comprehensive reference textbooks-grade digital chapters featuring full mathematical derivations, model limits, canonical glossary popovers, downloadable/launchable simulator presets, and full bibliography.

## 7. Cross-References

- [`APPLICATION_STRUCTURE.md`](APPLICATION_STRUCTURE.md)
- [`FUNCTIONAL_REQUIREMENTS.md`](FUNCTIONAL_REQUIREMENTS.md)
- [`ACCEPTANCE_CRITERIA.md`](ACCEPTANCE_CRITERIA.md)
