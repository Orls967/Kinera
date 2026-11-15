# Powertrain Simulation Specification — KINERA

**Document ID:** `KIN-DOC-05-03`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines exact input/output fields, configuration-aware routing algorithms, differential solver logic, and stage loss computation for Module 1 (**Powertrain Simulation**, `KIN-SIM-010`–`KIN-SIM-014`).

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-SIM-010** | Powertrain solver shall resolve configuration topology (`ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `ICE-4WD`, `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD`) dynamically to determine active shafts, gear stages, differentials, and driven wheels. |
| **KIN-SIM-011** | ICE mode shall compute $\omega_{eng}$, $T_{eng}$, $P_{eng}$, clutch state, transmission output torque/RPM, driveshaft RPM (if present), differential/transfer outputs, per-wheel torques, wheel RPM, tractive force, and per-stage losses. |
| **KIN-SIM-012** | EV mode shall compute $\omega_m$, $T_m$, $P_{mech}$, $P_{elec,ac}$, $P_{dc,bus}$, $I_{batt}$, $V_{term}$, SOC consumption, inverter/motor/reduction losses, wheel torques/RPM, and regen power when braking. |
| **KIN-SIM-013** | Differential solver shall faithfully evaluate `open`, `lsd`, `locked`, `center_diff`, and `ev_electronic` constraints against instantaneous per-wheel $\mu_i F_{z,i} r_{eff}$ traction bounds. |
| **KIN-SIM-014** | If `ICE-4WD` is in `4H` or `4L` on high-$\mu$ paved cornering, simulator shall surface an educational **Driveline Wind-Up Caution** flag. |

## 3. Topology-Aware Evaluation Algorithm

```text
Inputs: config_topology, driver_cmd (rpm/speed, throttle, gear, 4wd_mode, diff_mode, f_r_split), tire_loads[4], surface_mu[4]
1. Evaluate Prime Mover(s):
   - ICE: T_in = interpolate_wot(rpm) * throttle - friction_drag; P_in = T_in * omega_in
   - EV single: T_m = min(T_cmd, T_env(omega_m)), clamped by P_batt_max * eta_inv * eta_motor / omega_m
   - EV dual: split total demand via f_r_split -> clamp motor_F, motor_R independently + total battery discharge ceiling
2. Apply Gearbox / Reduction Stage(s):
   - If gear == Neutral (G == 0): T_trans_out = 0; P_loss = engine idle/spin loss; return zero tractive force.
   - ICE: T_trans_out = T_in * G * eta_trans; omega_trans_out = omega_in / G
   - ICE-4WD transfer case: apply G_tc (1.0 in 2H/4H, 2.48 in 4L) & eta_tc
   - EV: apply G_red_axle & eta_red directly (single-speed combined reduction)
3. Route Through Center Coupling (if multi-axle ICE):
   - ICE-FWD: 100% -> front differential (via transaxle final drive F * eta_fd)
   - ICE-RWD: 100% -> driveshaft (omega_ds = omega_trans_out, loss eta_shaft) -> rear diff (F * eta_fd)
   - ICE-AWD: center diff splits torque by lambda_F / (1 - lambda_F) * eta_cd -> F/R final drives
   - ICE-4WD: 2H -> 100% rear; 4H/4L -> F/R shafts via transfer case -> F/R final drives
4. Evaluate Per-Axle Differential Model against Wheel Traction Caps (T_cap_i = mu_i * F_z_i * r_eff):
   - Apply Open / LSD / Locked rules per active driven axle (`DIFFERENTIAL_MODEL.md`)
5. Compute Outputs:
   - Per-wheel T_wheel[4], omega_wheel[4], RPM_wheel[4], F_tractive[4] = T_wheel_i / r_eff
   - Total F_tractive = sum(F_tractive[0..4]); total P_wheels = sum(T_wheel_i * omega_wheel_i)
   - Cumulative eta_total = P_wheels / P_source_output (guarded if P_source == 0)
```

## 4. Edge-Case Guards

- **Reverse Gear (`G < 0`):** `T_wheel` sign reverses properly ($T_{out} < 0$ for forward engine spin, driving negative $F_{tractive}$), while $|G|$ computes power-loss magnitude using $|\eta|$ safely so losses never turn negative (`eta_loss` never creates energy!).
- **Zero Input RPM / Zero Speed:** Returns $P = 0$, zero divide-by-zero; during standing launch (`v_x < v_clutch_lock`), ICE launch uses clutch engagement speed $\omega_{launch} = \max(\omega_{wheel} G F, \omega_{idle})$ for torque lookup while smoothly matching wheel speed at launch.

## 5. Cross-References

- [`../03-powertrain-engineering/DIFFERENTIAL_MODEL.md`](../03-powertrain-engineering/DIFFERENTIAL_MODEL.md)
- [`../03-powertrain-engineering/DRIVETRAIN_EFFICIENCY_MODEL.md`](../03-powertrain-engineering/DRIVETRAIN_EFFICIENCY_MODEL.md)
- [`../07-data-and-contracts/SIMULATION_CONTRACTS.md`](../07-data-and-contracts/SIMULATION_CONTRACTS.md)
