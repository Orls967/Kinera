# Glossary and Terminology Normalization — KINERA

**Document ID:** `KIN-DOC-09-05`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Normalizes symbol names, terminology, and unit conventions across Powertrain, Vehicle Architecture, Vehicle Dynamics, and EV Engineering content so Technical Library and Engineering Insights never introduce conflicting notations.

## 2. Disambiguation & Symbol Table

| Symbol | Canonical Meaning in KINERA | SI Unit | Explicitly Avoid Confusing With |
| :---: | :--- | :---: | :--- |
| $a$ | Distance from CG to front axle (or subscripted $a_x, a_y$ for acceleration) | $\text{m}$ / $\text{m/s}^2$ | Always write $a_x, a_y$ for accelerations and bare $a$ (with $b$) for CG front distance! |
| $F$ | Final drive ratio (or force when subscripted $F_{drag}, F_{z}, F_x, F_y$) | $-$ / $\text{N}$ | Always subscript force vectors ($F_{tractive}, F_z, F_{yf}$) vs. bare $F$ for final drive ratio |
| $G$ | Transmission gear ratio | $-$ | Never mix with gravity $g = 9.80665\text{ m/s}^2$ |
| $h$ | Center of gravity (CG) height above ground | $\text{m}$ | Never confuse with time step $\Delta t$ |
| $L$ | Vehicle wheelbase ($a + b$) | $\text{m}$ | Not vehicle overall length |
| $t$ | Track width (in weight transfer $\Delta F_{z,lat}$) or elapsed simulation time | $\text{m}$ / $\text{s}$ | Always specify context or $t_{track}$ vs $t$ (time) in prose |
| $\alpha_f, \alpha_r$ | Front / rear axle tire slip angles | $\text{rad}$ | Never confuse with angular acceleration $\dot{\omega}$ |
| $\beta$ | Vehicle body sideslip angle ($\approx v_y/v_x$) vs $\beta_b$ brake bias | $\text{rad}$ / $-$ | Always use $\beta_b$ for front brake bias fraction |
| $\theta$ | Road slope / gradient angle ($\theta > 0$ uphill) | $\text{rad}$ | Distinguish from road grade percentage ($\text{grade\%} = 100 \tan\theta$) |
| $\mu$ | Tire-road peak friction coefficient | $-$ | Distinguish per-wheel $\mu_i$ vs uniform $\mu$ |

## 3. Terminology Rules

- **AWD vs. 4WD:** Always distinguish on-road center-diff/coupling AWD from transfer-case low-range (`2H/4H/4L`) 4WD.
- **Shaft Torque vs. Axle Torque vs. Wheel Torque:** Never omit the qualifier when reporting torque values.
- **Simulated Estimate vs. OEM Specification:** Never describe modeled outputs as real vehicle dyno/track measurements.

## 4. Cross-References

- [`../00-project-foundation/GLOSSARY.md`](../00-project-foundation/GLOSSARY.md)
- [`EQUATION_REFERENCE.md`](EQUATION_REFERENCE.md)
