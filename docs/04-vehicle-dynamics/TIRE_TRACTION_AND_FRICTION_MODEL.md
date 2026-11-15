# Tire Traction and Friction Model — KINERA

**Document ID:** `KIN-DOC-04-06`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Specifies V1 tire-road grip bounds, longitudinal traction capping, wheel-slip warning indicators, and the **Simplified Friction Circle** (`KIN-VDY-022`–`KIN-VDY-025`) connecting powertrain drive/brake forces with lateral cornering demand.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-VDY-022** | Every driven or braked tire/axle shall obey peak friction cap $F_{max} = \mu F_z$ determined by instantaneous normal load and surface $\mu$. |
| **KIN-VDY-023** | Combined longitudinal and lateral tire utilization shall evaluate the simplified isotropic friction circle $(F_x / \mu F_z)^2 + (F_y / \mu F_z)^2 \le 1$. |
| **KIN-VDY-024** | Simulator shall provide selectable surface presets (`Dry Asphalt ~0.90`, `Wet Asphalt ~0.55`, `Gravel ~0.45`, `Packed Snow ~0.30`, `Ice ~0.15`) plus custom $\mu$ sliders per wheel/axle for differential traction experiments. |
| **KIN-VDY-025** | Documentation and UI shall clearly state that the friction circle is an educational boundary model rather than a Pacejka Magic Formula or thermal tire model. |

## 3. Mathematical Formulation

### 3.1 Maximum Friction Cap (`eq.dynamics.friction-limit`)
$$F_{max,i} = \mu_i \, F_{z,i} \quad [\text{N}]$$
where $\mu_i$ is the tire-road friction coefficient at wheel $i$ and $F_{z,i} \ge 0$ is dynamic normal force from `WEIGHT_TRANSFER_MODEL.md`.

### 3.2 Combined Force Friction Circle (`eq.dynamics.friction-circle`)
$$\left(\frac{F_{x,i}}{\mu_i F_{z,i}}\right)^2 + \left(\frac{F_{y,i}}{\mu_i F_{z,i}}\right)^2 \le 1$$
Define combined traction utilization index:
$$\text{Util}_i = \sqrt{\left(\frac{F_{x,i}}{\mu_i F_{z,i}}\right)^2 + \left(\frac{F_{y,i}}{\mu_i F_{z,i}}\right)^2}$$
- When $\text{Util}_i < 0.85$: Nominal grip margin.
- When $0.85 \le \text{Util}_i < 1.0$: Approaching saturation (**High Slip Risk** cue).
- When requested $\text{Util}_{req,i} > 1.0$: Tire saturates at the friction circle boundary; longitudinal force scales down proportionally (or traction-limited slip occurs) and remaining lateral grip capacity shrinks to:
  $$|F_{y,avail,i}| = \sqrt{\max\!\left(0, \; (\mu_i F_{z,i})^2 - F_{x,i}^2\right)}$$
  This directly illustrates why a front-wheel-drive vehicle accelerating hard out of a tight corner loses front lateral cornering capacity earlier than a rear-wheel-drive vehicle where front tires devote $100\%$ of $\mu F_z$ to steering!

## 4. Edge Cases

- **Zero Normal Load ($F_{z,i} = 0$):** $F_{max,i} = 0$, $\text{Util}_i = 0$ (no division by zero when $F_z = 0$ or $\mu = 0$).
- **Zero Friction ($\mu = 0$):** Wheel transmits zero longitudinal or lateral force; powertrain open/LSD/locked behaviors clamp cleanly without `NaN`.

## 5. Cross-References

- [`../03-powertrain-engineering/DIFFERENTIAL_MODEL.md`](../03-powertrain-engineering/DIFFERENTIAL_MODEL.md)
- [`WEIGHT_TRANSFER_MODEL.md`](WEIGHT_TRANSFER_MODEL.md)
- [`BRAKING_DYNAMICS.md`](BRAKING_DYNAMICS.md)
