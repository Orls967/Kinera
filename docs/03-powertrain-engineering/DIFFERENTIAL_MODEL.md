# Differential and Torque Distribution Model — KINERA

**Document ID:** `KIN-DOC-03-05`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Specifies all five differential and torque-allocation models required in KINERA V1 (`KIN-PWT-017`–`KIN-PWT-021`): Open Differential, Simplified Limited-Slip Differential (LSD), Locked Differential, Center Differential, and EV Electronic Torque Allocation.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-PWT-017** | Open differential modeling shall strictly preserve equal torque split ($T_L = T_R$) capped by twice the lower-traction wheel limit; it shall never depict an open differential as routing extra torque to the high-grip wheel. |
| **KIN-PWT-018** | Simplified LSD modeling shall represent a bounded torque bias ratio ($TBR$) or speed-difference coupling bias while honoring total power conservation and wheel friction limits. |
| **KIN-PWT-019** | Locked differential modeling shall enforce equal shaft angular speed ($\omega_L = \omega_R$) and permit asymmetric torque up to each individual wheel's $\mu_i F_{z,i} r_{eff}$ cap. |
| **KIN-PWT-020** | Center differential modeling (`ICE-AWD`) shall distribute gearbox torque between front and rear axles per configured center split ($\lambda_F/\lambda_R$) and center lock/LSD state. |
| **KIN-PWT-021** | Dual-motor EV electronic allocation (`EV-DUAL-AWD`) shall allocate torque independently between front and rear e-axles without mechanical center speed locking. |

## 3. Mathematical Specifications of Each Differential Model

Let total axle torque entering the wheel end of an axle be $T_{axle,avail}$ (after final drive multiplication and differential efficiency $\eta_{diff}$), and let left/right wheel traction torque caps be:
$$T_{cap,L} = \mu_L F_{z,L} r_{eff}, \qquad T_{cap,R} = \mu_R F_{z,R} r_{eff}$$

### 3.1 Open Differential (`diff_mode = "open"`)
- **Kinematic Rule:** $\omega_{carrier} = \frac{\omega_L + \omega_R}{2}$ (wheels can spin at completely different speeds).
- **Torque Rule (`eq.powertrain.open-diff`):** Equal torque reaction on both side gears! Thus, neither wheel can sustain more drive torque than the other wheel's traction limit:
  $$T_{wheel,L} = T_{wheel,R} = \min\!\left(\frac{T_{axle,avail}}{2}, \; T_{cap,L}, \; T_{cap,R}\right)$$
  Total usable axle torque is therefore capped at $2 \cdot \min(T_{cap,L}, T_{cap,R})$.
- **Edge Case ($\mu_L = 0$ on ice, $\mu_R = 0.85$ on dry asphalt):** $T_{cap,L} = 0 \implies T_{wheel,L} = T_{wheel,R} = 0\text{ N}\cdot\text{m}$ (idealized zero-friction open diff stalls with zero forward thrust while the ice wheel spins freely!).

### 3.2 Simplified Limited-Slip Differential (`diff_mode = "lsd"`)
- **Kinematic Rule:** Allows speed differentiation during cornering while resisting excess slip via clutch preload $T_{preload}$ and torque-bias ratio $TBR \ge 1$ (default educational $TBR = 2.5$, $T_{preload} = 40\text{ N}\cdot\text{m}$).
- **Torque Rule (`eq.powertrain.lsd-diff`):** Let $T_{low\_cap} = \min(T_{cap,L}, T_{cap,R})$ and $T_{high\_cap} = \max(T_{cap,L}, T_{cap,R})$:
  1. Low-grip wheel holds $T_{low} = \min(0.5 T_{axle,avail}, T_{low\_cap})$.
  2. High-grip wheel can receive up to $T_{high,bias} = \min(TBR \cdot T_{low} + T_{preload}, \; T_{axle,avail} - T_{low}, \; T_{high\_cap})$.
  3. Notice: when $\mu_L = 0$ and $T_{preload} = 0$, a pure torque-sensing helical LSD behaves like an open diff ($TBR \cdot 0 = 0$), whereas preload clutch LSD still transfers $T_{preload}$—an insightful engineering distinction taught in KINERA!

### 3.3 Locked Differential (`diff_mode = "locked"`)
- **Kinematic Rule:** $\omega_L = \omega_R = \omega_{carrier}$ (rigid spool/dog lock).
- **Torque Rule (`eq.powertrain.locked-diff`):** Torque distributes automatically to each wheel according to its independent tire grip up to $T_{axle,avail}$:
  If $T_{cap,L} + T_{cap,R} \ge T_{axle,avail}$, total torque transfers without wheelspin; otherwise each wheel delivers $T_{wheel,i} = T_{cap,i}$.
- **Trade-off Note:** Prevents cornering differentiation ($\omega_L = \omega_R$), inducing tire scrub and understeer resistance on high-$\mu$ dry pavement.

### 3.4 Center Differential & 4WD Transfer (`ICE-AWD`, `ICE-4WD`)
- **Open / Biased Center Diff (`ICE-AWD`):** Splits transmission output torque $T_{trans\_out} \cdot \eta_{cd}$ by nominal bias $(\lambda_F, 1-\lambda_F)$ (e.g., `50/50` or `40/60`). If open center diff, front/rear axle inputs obey the same min-axle-cap proportion rule; if center LSD/locked, higher-traction axle absorbs up to bias/full remaining torque.
- **Part-Time 4WD Transfer (`ICE-4WD`):** `2H` sends $100\%$ rear ($\lambda_F = 0$); `4H`/`4L` locks front and rear driveshaft speeds ($\omega_F = \omega_R$ after equal F/R final drives) enabling independent axle traction up to $T_{cap,F} + T_{cap,R}$.

### 3.5 EV Electronic Torque Allocation (`EV-DUAL-AWD`)
- **No Mechanical Speed Lock:** Front and rear e-axles run independent motors ($T_{m,F}, T_{m,R}$).
- **Control Rule:** Requested front share $\lambda_F \in [0, 1]$ allocates total wheel torque request (or power split) across front and rear drive paths, subject independently to:
  1. Front motor envelope $T_{m,F,max}(\omega_{m,F})$ & front tire cap.
  2. Rear motor envelope $T_{m,R,max}(\omega_{m,R})$ & rear tire cap.
  3. Shared battery discharge ceiling $P_{elec,F} + P_{elec,R} \le P_{batt,max}$.

## 4. Validation Benchmark Example (Asymmetric Split-$\mu$ Launch)

Suppose $T_{axle,avail} = 2000\text{ N}\cdot\text{m}$, $r_{eff} = 0.315\text{ m}$, $F_{z,L} = F_{z,R} = 3500\text{ N}$, $\mu_L = 0.15$ (ice), $\mu_R = 0.85$ (dry):
- $T_{cap,L} = 0.15 \times 3500 \times 0.315 = 165.375\text{ N}\cdot\text{m}$
- $T_{cap,R} = 0.85 \times 3500 \times 0.315 = 937.125\text{ N}\cdot\text{m}$
- **Open Diff:** $T_L = T_R = 165.375\text{ N}\cdot\text{m} \implies T_{total} = 330.75\text{ N}\cdot\text{m}$ ($F_x = 1,050\text{ N}$).
- **LSD ($TBR=2.5, T_{preload}=40$):** $T_L = 165.375$, $T_R = \min(2.5 \times 165.375 + 40, 937.125) = 453.44\text{ N}\cdot\text{m} \implies T_{total} = 618.81\text{ N}\cdot\text{m}$ ($F_x = 1,964.5\text{ N}$).
- **Locked Diff:** $T_L = 165.375$, $T_R = 937.125 \implies T_{total} = 1,102.50\text{ N}\cdot\text{m}$ ($F_x = 3,500\text{ N}$).

## 5. Cross-References

- [`TRANSMISSION_MODEL.md`](TRANSMISSION_MODEL.md)
- [`../04-vehicle-dynamics/TIRE_TRACTION_AND_FRICTION_MODEL.md`](../04-vehicle-dynamics/TIRE_TRACTION_AND_FRICTION_MODEL.md)
- [`../05-simulation-engine/POWERTRAIN_SIMULATION_SPECIFICATION.md`](../05-simulation-engine/POWERTRAIN_SIMULATION_SPECIFICATION.md)
