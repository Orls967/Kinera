# Engineering Insights Curriculum — KINERA

**Document ID:** `KIN-DOC-09-01`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the complete curriculum specification for Section 5 (**Engineering Insights**), covering **37 structured topics across 4 engineering domains** (`Powertrain Fundamentals`, `Vehicle Architecture`, `Vehicle Dynamics`, `EV Engineering`). Every topic carries a canonical `insight.*` ID, learning objectives, prerequisite links, equations, visual requirements, examples, interactive simulator deep-links, and verified references.

## 2. Group A — Powertrain Fundamentals (10 Topics)

| Canonical ID | Title | Prerequisites | Key Equations & Components | Interactive Sim Link |
| :--- | :--- | :--- | :--- | :--- |
| `insight.powertrain.torque-rotational-motion` | Torque and Rotational Motion | None | `eq.powertrain.angular-velocity`, `ice.engine.crankshaft` | Powertrain RPM sweep |
| `insight.powertrain.mechanical-power` | Mechanical Power ($P = T\omega$) | `torque-rotational-motion` | `eq.powertrain.mechanical-power` | Torque vs Power crossover |
| `insight.powertrain.engine-displacement` | Engine Displacement & Geometry | None | `eq.powertrain.ice-displacement`, `ice.engine.piston` | I4 bore/stroke readout |
| `insight.powertrain.compression-ratio` | Compression Ratio & Cycle Context | `engine-displacement` | `ice.engine.cylinder-head` | Conceptual thermal efficiency note |
| `insight.powertrain.four-stroke-cycle` | Four-Stroke Combustion Cycle | `engine-displacement` | `ice.engine.valvetrain`, `anim.journey.ice-four-stroke` | Journey 4-stroke step view |
| `insight.powertrain.torque-power-curves` | Engine Torque and Power Curves | `mechanical-power` | `eq.powertrain.ice-torque-output` | WOT torque curve explorer |
| `insight.powertrain.gear-ratios` | Gear Ratios & Speed-Torque Trade-Off | `mechanical-power` | `eq.powertrain.gearbox-torque`, `eq.powertrain.wheel-rpm` | 1st–6th gear tractive sweep |
| `insight.powertrain.manual-transmission` | Manual Transmission Operation | `gear-ratios` | `ice.transmission.manual.gear-set`, `ice.clutch.flywheel` | Powertrain Journey gear mesh |
| `insight.powertrain.differential-operation` | Differential Operation (Open, LSD, Locked) | `gear-ratios` | `eq.powertrain.open-diff`, `eq.powertrain.lsd-diff`, `eq.powertrain.locked-diff` | Split-$\mu$ asymmetric launch |
| `insight.powertrain.drivetrain-efficiency` | Drivetrain Efficiency & Stage Losses | `manual-transmission` | `DRIVETRAIN_EFFICIENCY_MODEL` | FWD vs RWD vs AWD loss compare |

## 3. Group B — Vehicle Architecture (9 Topics)

| Canonical ID | Title | Prerequisites | Key Components | Interactive Deep Link |
| :--- | :--- | :--- | :--- | :--- |
| `insight.architecture.fwd` | Front-Wheel Drive (FWD) | `gear-ratios` | `vehicle.config.ice-fwd`, `drivetrain.fwd.front-differential` | Anatomy `ICE-FWD` + Compare |
| `insight.architecture.rwd` | Rear-Wheel Drive (RWD) | `gear-ratios` | `vehicle.config.ice-rwd`, `drivetrain.rwd.rear-differential` | Anatomy `ICE-RWD` + Compare |
| `insight.architecture.awd` | All-Wheel Drive (AWD) & Variants | `fwd`, `rwd` | `vehicle.config.ice-awd`, `drivetrain.awd.center-differential` | `ICE-AWD` low-$\mu$ comparison |
| `insight.architecture.4wd` | Four-Wheel Drive (4WD) & Transfer Cases | `awd` | `vehicle.config.ice-4wd`, `drivetrain.4wd.transfer-case` | `2H`/`4H`/`4L` gradeability test |
| `insight.architecture.transaxle` | Transaxle Packaging Architecture | `fwd` | `ice.transmission.transaxle` | Section cut transaxle inspect |
| `insight.architecture.chassis-subframes` | Chassis, Unibody, Ladder Frame & Subframes | None | `vehicle.structure.unibody`, `vehicle.structure.ladder-frame` | Chassis view preset |
| `insight.architecture.suspension` | Suspension Fundamentals & Anatomy | `chassis-subframes` | `vehicle.suspension.front-control-arm`, `coil-spring`, `damper` | Suspension view preset |
| `insight.architecture.steering` | Steering Geometry & Rack-Pinion | `chassis-subframes` | `vehicle.steering.rack-pinion`, `tie-rod` | Front-axle camera preset |
| `insight.architecture.braking` | Hydraulic & Blended Braking Architecture | `chassis-subframes` | `vehicle.braking.master-cylinder`, `caliper`, `disc-rotor` | Brake system view preset |

## 4. Group C — Vehicle Dynamics (10 Topics)

| Canonical ID | Title | Prerequisites | Key Equations | Interactive Sim Link |
| :--- | :--- | :--- | :--- | :--- |
| `insight.dynamics.longitudinal` | Longitudinal Dynamics & Net Force | `mechanical-power` | `eq.dynamics.longitudinal-net-force`, `longitudinal-accel` | Longitudinal mass sweep |
| `insight.dynamics.aero-drag` | Aerodynamic Drag ($v^2$ & Power $v^3$) | `longitudinal` | `eq.dynamics.aero-drag` | $C_d$ top-speed comparison |
| `insight.dynamics.rolling-resistance` | Rolling Resistance & Grade Force | `longitudinal` | `eq.dynamics.rolling-resistance`, `grade-resistance` | Road gradient % climb test |
| `insight.dynamics.tire-friction` | Tire-Road Friction Limits ($\mu F_z$) | `longitudinal` | `eq.dynamics.friction-limit` | Ice vs dry asphalt $\mu$ test |
| `insight.dynamics.weight-transfer` | Longitudinal & Lateral Weight Transfer | `tire-friction` | `eq.dynamics.weight-transfer-longitudinal`, `lateral` | CG height & braking dive bars |
| `insight.dynamics.lateral-bicycle` | Lateral Dynamics & Linear Bicycle Model | `steering`, `tire-friction` | `eq.dynamics.bicycle-lateral`, `bicycle-yaw` | Step-steer yaw & path plot |
| `insight.dynamics.yaw-response` | Yaw Rate, Sideslip & Transient Response | `lateral-bicycle` | `eq.dynamics.tire-linear-lateral` | Speed sweep cornering test |
| `insight.dynamics.understeer-oversteer` | Understeer, Oversteer & Critical Speed | `yaw-response` | `eq.dynamics.understeer-gradient` | CG shift $K_{us}$ experiment |
| `insight.dynamics.braking` | Braking Dynamics & Stopping Distance | `weight-transfer` | `eq.dynamics.braking-force`, `stopping-distance` | Brake bias & ABS toggle test |
| `insight.dynamics.combined-tire-forces` | Combined Tire Forces & Friction Circle | `tire-friction`, `lateral-bicycle` | `eq.dynamics.friction-circle` | Throttle-in-corner friction circle |

## 5. Group D — EV Engineering (8 Topics)

| Canonical ID | Title | Prerequisites | Key Equations & Components | Interactive Deep Link |
| :--- | :--- | :--- | :--- | :--- |
| `insight.ev.battery-architecture` | EV Battery Pack & Energy Capacity | None | `ev.battery.pack`, `ev.battery.cell-module` | `EV-RWD` underbody battery view |
| `insight.ev.bms` | Battery Management System (BMS) | `battery-architecture` | `ev.bms.controller`, SOC/current ceilings | Low-SOC / high-SOC regen clamp |
| `insight.ev.inverter` | Traction Inverter (DC <-> 3-Phase AC) | `battery-architecture` | `ev.inverter.front`, `eq.ev.electrical-power` | Powertrain Journey EV inverter |
| `insight.ev.pmsm` | Permanent Magnet Synchronous Motor | `inverter` | `eq.ev.motor-envelope`, `ev.motor.pmsm` | EV torque-speed curve plot |
| `insight.ev.induction-motor` | AC Induction Motor Principles | `inverter` | `ev.motor.induction` | PMSM vs Induction coast comparison |
| `insight.ev.reduction-gearbox` | Single-Speed EV Reduction Gearbox | `pmsm`, `gear-ratios` | `ev.transmission.reduction-gearbox-rear` | Why EVs skip 6-speed manuals |
| `insight.ev.regenerative-braking` | Regenerative Braking & Blending | `bms`, `braking` | `eq.ev.motor-efficiency` (reverse) | Journey Regen Mode + Braking tab |
| `insight.ev.energy-efficiency` | EV Energy Efficiency & Dual-Motor Strategy | `pmsm`, `awd` | `eq.ev.energy-consumption`, `vehicle.config.ev-dual-awd` | `EV-RWD` vs `EV-DUAL-AWD` compare |

## 6. Cross-References

- [`TECHNICAL_LIBRARY_STRUCTURE.md`](TECHNICAL_LIBRARY_STRUCTURE.md)
- [`LEARNING_CONTENT_SCHEMA.md`](LEARNING_CONTENT_SCHEMA.md)
- [`EQUATION_REFERENCE.md`](EQUATION_REFERENCE.md)
