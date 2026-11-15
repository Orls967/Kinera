# User Personas and Journeys — KINERA

**Document ID:** `KIN-DOC-01-02`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines primary target user personas and concrete end-to-end learning/engineering workflows validating how KINERA's six sections and seven configurations interact coherently.

## 2. Primary Personas

### Persona 1: Undergraduate Automotive/Mechanical Engineering Student ("Alya")
- **Context:** Taking courses in Machine Elements, Internal Combustion Engines, and Ground Vehicle Dynamics.
- **Pain Point:** Textbooks show static 2D free-body diagrams disconnected from real drivetrain layouts and dynamic time-series responses.
- **Core Goal:** Inspect how crankshaft torque multiplies through a gearbox and differential in 3D, then verify textbook equations for 0–100 km/h acceleration, gradeability, and understeer gradient numerically.

### Persona 2: EV Systems & Mobility Learner ("Rafi")
- **Context:** Transitioning from ICE mechanics or electronics into electric powertrains.
- **Pain Point:** Needs clarity on why single-speed EV reduction differs from 5/6-speed ICE gearboxes, how inverters bridge DC batteries and AC PMSMs, and how dual-motor AWD allocates torque electronically.
- **Core Goal:** Step through `EV-RWD` vs. `EV-DUAL-AWD` in Powertrain Journey (including regenerative braking) and inspect battery power draw vs. efficiency maps in Engineering Simulator.

### Persona 3: Technical Educator / University Lecturer ("Dr. Hendra")
- **Context:** Teaching a classroom of 40 students, sometimes on offline campus projectors.
- **Pain Point:** Needs zero-latency offline stability, transparent assumptions, and side-by-side layout comparisons that do not perpetuate "AWD is always faster/better" myths.
- **Core Goal:** Launch controlled `ICE-FWD` vs `ICE-RWD` vs `ICE-AWD` comparison presets under low-$\mu$ ($\mu = 0.35$) vs high-$\mu$ ($\mu = 0.90$) conditions during class.

### Persona 4: Analytical Automotive Enthusiast ("Dito")
- **Context:** Understands driving feel (understeer, braking dive, 4L crawling) and wants rigorous engineering explanations.
- **Pain Point:** Online forums oversimplify open vs. limited-slip differentials and confuse AWD with 4WD.
- **Core Goal:** Inspect differential mechanics, run weight-transfer experiments under heavy braking/cornering, and read structured Technical Library articles.

## 3. Core End-to-End User Journeys

### Journey J1: Mechanics-to-Motion Exploration (`ICE-FWD` vs `ICE-RWD`)
1. User opens **Overview** -> selects `ICE-RWD` -> triggers "Chassis Reveal" preset.
2. Enters **Vehicle Anatomy** -> isolates `ice.transmission.manual.gear-set` and `drivetrain.rwd.rear-differential` -> inspects mechanical input/output relationships.
3. Switches configuration selector to `ICE-FWD` -> observes engine orientation flip from longitudinal to transverse and replacement of rear driveshaft/differential by `ice.transmission.transaxle` + `drivetrain.fwd.front-differential`.
4. Enters **Powertrain Journey** -> steps through combustion -> crankshaft -> transaxle -> front CV axles -> wheels.
5. Opens **Engineering Simulator -> Configuration Comparison** -> compares `ICE-FWD` and `ICE-RWD` with matched mass ($1450\text{ kg}$), engine curve, gear ratios, and tires; inspects longitudinal weight transfer unloading the front axle on launch.

### Journey J2: EV Architecture & Regenerative Braking Investigation
1. User selects `EV-DUAL-AWD`.
2. In **Vehicle Anatomy**, toggles `EV Electrical` and `Braking` layers to trace `ev.battery.pack` -> `ev.inverter.front` / `ev.inverter.rear` -> `ev.motor.front` / `ev.motor.rear`.
3. In **Powertrain Journey**, plays forward drive mode (independent front/rear torque split), then toggles **Regenerative Braking** mode to observe reverse energy flow back into `ev.battery.pack`.
4. Opens **Engineering Simulator -> Powertrain Simulation** -> sweeps motor RPM and torque split (e.g., 50/50 vs 30/70) and monitors electrical power ($P = VI$), inverter/motor losses, and SOC depletion.

### Journey J3: Cornering & Tire Friction Limits Experiment
1. User enters **Engineering Simulator -> Vehicle Dynamics -> Lateral Bicycle Model**.
2. Sets speed $v_x = 22\text{ m/s}$ ($\approx 79.2\text{ km/h}$), steering angle $\delta = 2.5^\circ$, and shifts CG forward vs. rearward.
3. Observes yaw rate $r$, lateral acceleration $a_y$, slip angles $\alpha_f, \alpha_r$, vehicle path, and understeer vs. oversteer classification.
4. Increases steering angle until $|\alpha| > 6^\circ$ -> system displays explicit **Linear Bicycle Validity Warning** explaining tire saturation beyond the linear model's assumptions.
5. Switches to **Tire Traction & Friction Circle** tab -> combines braking and cornering to watch the force vector approach the $\mu F_z$ circle boundary.

## 4. Cross-References

- [`APPLICATION_STRUCTURE.md`](APPLICATION_STRUCTURE.md)
- [`FEATURE_SPECIFICATIONS.md`](FEATURE_SPECIFICATIONS.md)
- [`FUNCTIONAL_REQUIREMENTS.md`](FUNCTIONAL_REQUIREMENTS.md)
