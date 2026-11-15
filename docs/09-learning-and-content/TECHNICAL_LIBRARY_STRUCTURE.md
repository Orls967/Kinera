# Technical Library Structure — KINERA

**Document ID:** `KIN-DOC-09-02`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the curriculum, canonical module IDs, and mandatory 9-section template for all **10 Technical Library modules** in Section 6 (**Technical Library**).

## 2. Standard 9-Part Module Template

Every module (`library.module.*`) must organize its content strictly into these 9 structured sections:
1. **Overview** (scope, learning objectives, prerequisites)
2. **Fundamentals** (physical intuition & first principles)
3. **Component Breakdown** (linked canonical `Component` cards)
4. **Operating Principles** (stepwise mechanical/electrical/dynamic mechanics)
5. **Equations & Mathematical Models** (rendered from shared `EQUATION_REFERENCE.md` JSON with SI units and explicit model limits)
6. **Engineering Applications** (real-world design trade-offs across configurations)
7. **Related Simulations** (one-click preset launchers into Engineering Simulator)
8. **Glossary** (shared canonical terms from `GLOSSARY_AND_TERMINOLOGY.md`)
9. **References** (verified citations from `TECHNICAL_REFERENCE_POLICY.md`)

## 3. Ten Canonical Technical Library Modules

| # | Canonical ID | Module Title | Linked Insights Topics | Linked Sim Presets & Components |
| :---: | :--- | :--- | :--- | :--- |
| 1 | `library.module.automotive-fundamentals` | Automotive Engineering Fundamentals | `torque-rotational-motion`, `mechanical-power`, `chassis-subframes` | Overview + All 7 configs |
| 2 | `library.module.internal-combustion-engine` | Internal Combustion Engines | `engine-displacement`, `compression-ratio`, `four-stroke-cycle`, `torque-power-curves` | `ice.engine.*`, ICE torque curve sim |
| 3 | `library.module.transmission-systems` | Transmission and Gear Systems | `gear-ratios`, `manual-transmission`, `transaxle` | `ice.transmission.*`, `ev.transmission.*` |
| 4 | `library.module.drivetrain-differential` | Drivetrain and Differential Systems | `differential-operation`, `drivetrain-efficiency` | `drivetrain.*`, split-$\mu$ diff preset |
| 5 | `library.module.vehicle-architecture` | Vehicle Architecture and Layout | `fwd`, `rwd`, `awd`, `4wd` | All 7 `vehicle.config.*`, Config Comparison |
| 6 | `library.module.ev-powertrain` | Electric Vehicle Powertrain | `battery-architecture`, `bms`, `reduction-gearbox`, `energy-efficiency` | `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD` |
| 7 | `library.module.ev-motors-electronics` | Electric Motors and Power Electronics | `inverter`, `pmsm`, `induction-motor` | `ev.inverter.*`, `ev.motor.*` |
| 8 | `library.module.vehicle-dynamics` | Vehicle Dynamics Fundamentals | `longitudinal`, `aero-drag`, `rolling-resistance`, `weight-transfer`, `lateral-bicycle`, `yaw-response`, `understeer-oversteer` | `vehicle.dynamics.longitudinal`, `lateral`, `weight-transfer` |
| 9 | `library.module.tire-traction` | Tire Mechanics and Traction | `tire-friction`, `combined-tire-forces` | `vehicle.wheel.tire`, friction circle preset |
| 10 | `library.module.braking-stability` | Braking Systems and Vehicle Stability | `braking` (arch), `braking` (dyn), `regenerative-braking` | `vehicle.braking.*`, `vehicle.dynamics.braking` |

## 4. Cross-References

- [`ENGINEERING_INSIGHTS_CURRICULUM.md`](ENGINEERING_INSIGHTS_CURRICULUM.md)
- [`LEARNING_CONTENT_SCHEMA.md`](LEARNING_CONTENT_SCHEMA.md)
- [`TECHNICAL_REFERENCE_POLICY.md`](TECHNICAL_REFERENCE_POLICY.md)
