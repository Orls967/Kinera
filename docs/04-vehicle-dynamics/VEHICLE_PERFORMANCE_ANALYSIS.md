# Vehicle Performance Analysis — KINERA

**Document ID:** `KIN-DOC-04-07`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the eight standardized vehicle performance benchmark outputs computed by KINERA V1 (`KIN-VDY-026`–`KIN-VDY-028`), specifying exact numerical extraction methods, validity conditions, and mandatory simulated-estimate labeling.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-VDY-026** | Engineering Simulator shall compute model-based estimates for 0–100 km/h time, 402.336 m (quarter-mile) time & trap speed, theoretical top speed, 100–0 km/h braking distance, steady cornering capability, maximum gradeability, energy consumption, and power-to-weight ratio. |
| **KIN-VDY-027** | Every performance output shall execute deterministically using the active configuration's coupled powertrain + longitudinal/braking/traction solver. |
| **KIN-VDY-028** | Every displayed or exported performance metric shall carry an unmistakable *"Simulated Model Estimate — Not Production Vehicle Data"* label and expose exact run assumptions. |

## 3. Metric Extraction Specifications

| Metric | Units (Display / SI) | Extraction Method & Governing Equations | Key Assumptions / Limitations |
| :--- | :---: | :--- | :--- |
| **0–100 km/h Time** | $\text{s}$ ($0 \to 27.7778\text{ m/s}$) | Time-domain RK4 longitudinal run at WOT ($u_{th}=1.0$) on $\theta=0$, $\mu=0.90$, optimal shift RPM for ICE (instantaneous deterministic shift time $\Delta t_{shift}=0.20\text{ s}$ torque pause or ideal zero-pause toggle documented explicitly) | Neglects tire temperature, clutch slip heat, driver reaction |
| **Quarter-Mile** | $\text{s}$, $\text{km/h}$ ($x = 402.336\text{ m}$) | Interpolated crossing time & exit velocity from WOT acceleration run | Same flat-surface, constant-$\mu$ assumptions |
| **Theoretical Top Speed** | $\text{km/h}$ ($\text{m/s}$) | Bisection root of $F_{tractive,max\_gear}(v) - F_{drag}(v) - F_{rolling} - F_{grade} = 0$, capped by top-gear motor/engine redline speed | Ideal zero wind, steady level pavement |
| **100–0 km/h Braking** | $\text{m}$, $\text{s}$ | Full braking integration from $v_0 = 27.7778\text{ m/s}$ with weight transfer, bias, and conceptual ABS active | Assumes uniform surface $\mu$ and instant hydraulic build |
| **Cornering Response** | $a_{y,max}$ ($\text{m/s}^2, g$), $K_{us}$ | Linear bicycle steady-state check up to linear validity threshold ($|\alpha| \le 6^\circ$ or $0.4g$) plus friction-limited steady radius estimate | Explicitly flagged as linear bicycle + simplified grip estimate |
| **Gradeability** | $\%$ grade / $\theta_{max}$ ($\text{deg}$) | Maximum slope $\theta$ in lowest gear (`1st` / `4L` on `ICE-4WD`) where $F_{tractive,capped}(\theta) \ge C_{rr} m g \cos\theta + m g \sin\theta$ | Static traction check on specified surface $\mu$ |
| **Energy Consumption** | $\text{Wh/km}$ (EV), $\text{MJ/100km}$ (ICE mech) | Integrated battery DC energy (EV) or mechanical shaft work + conceptual BTE reference (ICE) over standard test speed/cycle profile | Simplified constant-efficiency/cruise benchmark, not WLTP/EPA dyno homologation |
| **Power-to-Weight** | $\text{kW/tonne}$ ($\text{W/kg}$) | $\frac{P_{peak,system}}{m}$ using nominal peak prime-mover power and vehicle mass | Ignores drivetrain losses and torque curve shape |

## 4. Cross-References

- [`LONGITUDINAL_DYNAMICS.md`](LONGITUDINAL_DYNAMICS.md)
- [`BRAKING_DYNAMICS.md`](BRAKING_DYNAMICS.md)
- [`../05-simulation-engine/CONFIGURATION_COMPARISON_SPECIFICATION.md`](../05-simulation-engine/CONFIGURATION_COMPARISON_SPECIFICATION.md)
