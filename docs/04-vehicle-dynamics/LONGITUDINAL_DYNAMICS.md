# Longitudinal Dynamics — KINERA

**Document ID:** `KIN-DOC-04-02`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Specifies the mathematical equations, parameters, numerical integration behavior, boundary edge cases, and required engineering experiments for **Longitudinal Dynamics** (`KIN-VDY-005`–`KIN-VDY-009`).

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-VDY-005** | Longitudinal simulation shall compute net force $F_{net}$, longitudinal acceleration $a_x$, velocity $v_x$, and displacement $x$ incorporating tractive force, aerodynamic drag, rolling resistance, and road gradient resistance. |
| **KIN-VDY-006** | All inputs (`m`, `C_d`, `A`, `rho`, `C_rr`, `theta`, `g`, `r_eff`, powertrain torque) shall be configurable within bounded valid SI ranges. |
| **KIN-VDY-007** | Rolling resistance and aerodynamic drag shall cleanly approach zero or oppose motion when $v_x \to 0$ without causing phantom reverse crawl when parked. |
| **KIN-VDY-008** | Simulator shall support explicit comparative sweeps for Mass, Drag Coefficient ($C_d$), Rolling Resistance ($C_{rr}$), Road Gradient ($\theta$), and Powertrain Output. |
| **KIN-VDY-009** | Time-series outputs shall include Speed vs. Time, Distance vs. Time, Acceleration vs. Time, Tractive Force vs. Speed, and Power Demand vs. Speed. |

## 3. Mathematical Formulation

### 3.1 Force Balance & Acceleration (`eq.dynamics.longitudinal-net-force`, `eq.dynamics.longitudinal-accel`)
$$F_{net} = F_{tractive} - F_{drag} - F_{rolling} - F_{grade}$$
$$a_x = \frac{F_{net}}{m}$$
*(Note: Baseline V1 uses rigid translational mass $m$ per the specification; an optional educational rotational-inertia factor toggle $\gamma_m = 1 + \delta_r$ may be enabled only when explicitly labeled.)*

### 3.2 Resistive Forces
1. **Aerodynamic Drag (`eq.dynamics.aero-drag`):**
   $$F_{drag} = \frac{1}{2} \rho C_d A v_x |v_x| \quad [\text{N}]$$
   Using $v_x |v_x|$ ensures drag always opposes motion direction (for $v_x \ge 0$, identical to $\frac{1}{2}\rho C_d A v^2$). Default $\rho = 1.225\text{ kg/m}^3$.
2. **Rolling Resistance (`eq.dynamics.rolling-resistance`):**
   $$F_{rolling} = \operatorname{sgn}(v_x) \cdot C_{rr} \, m \, g \cos(\theta) \quad [\text{N}]$$
   At $v_x = 0$, rolling resistance acts as static holding friction up to $C_{rr} m g \cos\theta$ opposing net applied $F_{tractive} - F_{grade}$ (preventing negative-creep bug on flat ground when throttle is zero).
3. **Road Gradient Resistance (`eq.dynamics.grade-resistance`):**
   $$F_{grade} = m \, g \sin(\theta) \quad [\text{N}]$$
   where $\theta = \arctan(\text{grade\_pct} / 100)$ is uphill slope angle ($\theta > 0$ uphill opposes forward climb; $\theta < 0$ downhill assists forward motion).

### 3.3 Power Demand at Wheels
$$P_{demand}(v_x) = (F_{drag} + F_{rolling} + F_{grade}) \cdot v_x \quad [\text{W}]$$
Theoretical steady-state top speed $v_{max}$ occurs where maximum gear-limited $F_{tractive}(v_x) = F_{drag}(v_x) + F_{rolling} + F_{grade}$ (or redline speed limit in highest gear).

## 4. Inputs, Outputs & Parameter Bounds

| Parameter | Symbol | Default | Valid Range (SI) | Units |
| :--- | :---: | :---: | :---: | :---: |
| Vehicle Mass | $m$ | Config default | `[400, 10000]` | $\text{kg}$ |
| Drag Coefficient | $C_d$ | `0.29` | `[0.15, 1.20]` | dimensionless |
| Frontal Area | $A$ | `2.25` | `[0.80, 10.0]` | $\text{m}^2$ |
| Air Density | $\rho$ | `1.225` | `[0.50, 1.60]` | $\text{kg/m}^3$ |
| Rolling Resistance Coeff | $C_{rr}$ | `0.011` | `[0.004, 0.080]` | dimensionless |
| Road Gradient Angle | $\theta$ | `0.0` | `[-0.5236, +0.5236]` ($\pm 30^\circ$) | $\text{rad}$ |
| Gravity | $g$ | `9.80665` | `[1.0, 20.0]` | $\text{m/s}^2$ |

## 5. Verification Benchmark

For `ICE-FWD` ($m = 1380\text{ kg}$, $C_d = 0.29$, $A = 2.25\text{ m}^2$, $\rho = 1.225\text{ kg/m}^3$, $C_{rr} = 0.011$, $\theta = 0$) at $v = 27.7778\text{ m/s}$ ($100\text{ km/h}$):
- $F_{drag} = 0.5 \times 1.225 \times 0.29 \times 2.25 \times (27.7778)^2 = 308.33\text{ N}$
- $F_{rolling} = 0.011 \times 1380 \times 9.80665 = 148.86\text{ N}$
- Total road load $= 457.19\text{ N}$; Road-load power $= 12,700\text{ W}$ ($12.70\text{ kW}$).
- Adding $5\%$ grade ($\theta = \arctan(0.05) = 0.049958\text{ rad}$): $F_{grade} = 675.82\text{ N}$, $F_{rolling} = 148.68\text{ N}$, total load $= 1132.83\text{ N}$, power $= 31.47\text{ kW}$.

## 6. Cross-References

- [`WEIGHT_TRANSFER_MODEL.md`](WEIGHT_TRANSFER_MODEL.md)
- [`TIRE_TRACTION_AND_FRICTION_MODEL.md`](TIRE_TRACTION_AND_FRICTION_MODEL.md)
- [`VEHICLE_PERFORMANCE_ANALYSIS.md`](VEHICLE_PERFORMANCE_ANALYSIS.md)
- [`../05-simulation-engine/NUMERICAL_METHODS_AND_STABILITY.md`](../05-simulation-engine/NUMERICAL_METHODS_AND_STABILITY.md)
