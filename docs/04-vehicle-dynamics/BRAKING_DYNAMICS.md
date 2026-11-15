# Braking Dynamics — KINERA

**Document ID:** `KIN-DOC-04-04`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines KINERA V1 mathematical models, inputs, outputs, friction boundaries, brake bias effects, EV regenerative blending, and conceptual ABS wheel-slip indicators for **Braking Dynamics** (`KIN-VDY-015`–`KIN-VDY-018`).

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-VDY-015** | Braking simulation shall compute deceleration $a_x \le 0$, stopping distance $d$, stopping time $t_{stop}$, front/rear brake force allocation, and tire friction utilization. |
| **KIN-VDY-016** | Braking shall couple directly with longitudinal weight transfer (`WEIGHT_TRANSFER_MODEL.md`), reflecting increased front axle load and unloaded rear axle load during deceleration. |
| **KIN-VDY-017** | Braking limits shall enforce tire-road friction $|F_{x,axle}| \le \mu F_{z,axle}$ per axle and clearly flag premature front or rear lockup risk under mismatched brake bias. |
| **KIN-VDY-018** | ABS behavior shall be represented strictly at conceptual threshold-clamping fidelity (explicitly excluding hydraulic solenoid pulse modulation). |

## 3. Mathematical Formulation

### 3.1 Ideal Constant-Deceleration Benchmark (`eq.dynamics.braking-force`, `eq.dynamics.stopping-distance`)
For pure constant deceleration $|a|$ from initial speed $v_0$ to rest:
$$F_{brake} = m |a|, \qquad d = \frac{v_0^2}{2 |a|}, \qquad t_{stop} = \frac{v_0}{|a|}$$
Maximum friction-limited flat-road deceleration is $|a|_{max} = \mu g$ (when ideal brake proportioning utilizes 100% of both front and rear grip simultaneously).

### 3.2 Dynamic Time-Stepped Braking Balance (With Bias, Weight Transfer & Resistances)
Given requested total braking force $F_{brake,req} \ge 0$ and front brake bias ratio $\beta_b \in [0, 1]$ (default $\beta_b = 0.70$ front / $0.30$ rear):
1. Raw requested axle brake forces: $F_{x,req,F} = -\beta_b F_{brake,req}$, $F_{x,req,R} = -(1 - \beta_b) F_{brake,req}$.
2. For EV configurations with regen active, electric motor generator torque supplies up to $T_{regen,max}$ on driven axle(s) first, and friction calipers supply the remainder.
3. Each axle force is capped by instantaneous normal load $\mu F_{z,F}(a_x)$, $\mu F_{z,R}(a_x)$:
   $$F_{x,actual,axle} = -\min\!\left(|F_{x,req,axle}|, \; \mu F_{z,axle}\right)$$
   - **Conceptual ABS Disabled (`abs_enabled = false`):** If $|F_{x,req,axle}| > \mu F_{z,axle}$, the tire enters **locked slip** (simplified sliding friction factor $\mu_{slide} = 0.80 \mu$ educational penalty + **Wheel Lock Warning**: rear lock flags oversteer spin risk; front lock flags steering loss).
   - **Conceptual ABS Enabled (`abs_enabled = true`):** Holds braking force near peak $\eta_{abs} \mu F_{z,axle}$ ($\eta_{abs} = 0.95$) and displays active **ABS Modulation Indicator** without modeling hydraulic valve frequencies.
4. Net decelerating balance:
   $$m a_x = F_{x,actual,F} + F_{x,actual,R} - F_{drag}(v_x) - F_{rolling} - F_{grade}(\theta)$$
   Stopped cleanly when $v_x$ crosses $0\text{ m/s}$ (no reverse roll from friction brakes).

## 4. Verification Benchmark

With $v_0 = 27.7778\text{ m/s}$ ($100\text{ km/h}$), $m = 1380\text{ kg}$, ideal constant deceleration $|a| = 0.85 \times 9.80665 = 8.33565\text{ m/s}^2$ (ignoring drag/rolling in ideal analytical benchmark):
- $F_{brake} = 1380 \times 8.33565 = 11,503.2\text{ N}$
- $d = \frac{27.7778^2}{2 \times 8.33565} = 46.28\text{ m}$
- $t_{stop} = \frac{27.7778}{8.33565} = 3.332\text{ s}$

## 5. Cross-References

- [`../02-vehicle-architecture/BRAKING_SYSTEM_SPECIFICATION.md`](../02-vehicle-architecture/BRAKING_SYSTEM_SPECIFICATION.md)
- [`WEIGHT_TRANSFER_MODEL.md`](WEIGHT_TRANSFER_MODEL.md)
- [`TIRE_TRACTION_AND_FRICTION_MODEL.md`](TIRE_TRACTION_AND_FRICTION_MODEL.md)
