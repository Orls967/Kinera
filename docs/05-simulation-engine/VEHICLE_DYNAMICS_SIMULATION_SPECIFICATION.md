# Vehicle Dynamics Simulation Specification — KINERA

**Document ID:** `KIN-DOC-05-04`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines execution workflows, state coupling, solver rules, and validity monitoring for Module 2 (**Vehicle Dynamics Simulation**, `KIN-SIM-015`–`KIN-SIM-019`) across Longitudinal, Lateral Bicycle, Braking, Weight Transfer, and Tire Traction sub-solvers.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-SIM-015** | Longitudinal solver shall support open-throttle launch (with deterministic ICE upshift logic at optimal torque-intersection or redline), constant-throttle cruise, grade climbing, and coast-down experiments. |
| **KIN-SIM-016** | Lateral solver shall integrate the 2-DOF bicycle ODEs across step-steer, sine-steer, or constant-steer inputs and emit trajectory $(X, Y, \psi)$, $r(t)$, $a_y(t)$, $\beta(t)$, $\alpha_f(t)$, $\alpha_r(t)$, and linear validity flags. |
| **KIN-SIM-017** | Braking solver shall compute deceleration time-series from $v_0$ to stop, dynamically updating front/rear $F_z$, checking front/rear lockup thresholds, blending EV regen, and honoring conceptual ABS toggle. |
| **KIN-SIM-018** | Weight transfer and simplified friction-circle utilization shall update at every simulation step and expose 4-wheel arrays (`[FL, FR, RL, RR]`). |
| **KIN-SIM-019** | Combined maneuver mode (steady cornering + throttle/brake request) shall enforce the friction-circle cap `(Fx/(mu*Fz))^2 + (Fy/(mu*Fz))^2 <= 1` and warn when lateral/longitudinal saturation occurs. |

## 3. Sub-Solver Coupling & Automatic Shift Strategy (ICE Acceleration Runs)

During automated ICE 0–100 km/h or quarter-mile runs:
- **Deterministic Upshift Rule:** Upshift from gear $k$ to $k+1$ occurs when EITHER:
  1. Engine reaches redline ($\text{RPM}_{eng} \ge \text{RPM}_{max} - 50$), OR
  2. Next gear's wheel torque exceeds current gear's wheel torque ($T_{eng}(\text{RPM}_{k+1}) \cdot G_{k+1} > T_{eng}(\text{RPM}_k) \cdot G_k$) while $\text{RPM}_{k+1} \ge \text{RPM}_{idle} + 400$.
- **Shift Pause:** Configurable deterministic shift interruption $\Delta t_{shift} = 0.20\text{ s}$ (default manual gearshift) during which $T_{clutch} = 0$ and drag/rolling/grade act smoothly, or `0.00 s` when evaluating idealized continuous tractive envelope.

## 4. Quasi-Static Weight Transfer Fixed-Point Update

Notice that $F_{z,i}$ depends on $a_x$, while traction-capped $F_{tractive}$ (and hence $a_x$) depends on $F_{z,i}$!
To prevent algebraic oscillation or one-step lag instability on borderline traction limits:
- Inside each step, solver executes 2 fixed-point iterations (converging rapidly because $h/L \approx 0.20 < 1$) to solve mutually consistent $(a_x, F_{z,F}, F_{z,R}, F_{tractive,capped})$.
- Verify convergence: since $\mu \frac{h}{L} < 1$ for normal road vehicles ($\mu \le 1.3, h/L \approx 0.2 \implies \mu h/L \approx 0.26 \ll 1$), contraction mapping converges exponentially in 2–3 iterations!

## 5. Cross-References

- [`../04-vehicle-dynamics/LONGITUDINAL_DYNAMICS.md`](../04-vehicle-dynamics/LONGITUDINAL_DYNAMICS.md)
- [`../04-vehicle-dynamics/LATERAL_DYNAMICS_BICYCLE_MODEL.md`](../04-vehicle-dynamics/LATERAL_DYNAMICS_BICYCLE_MODEL.md)
- [`../04-vehicle-dynamics/BRAKING_DYNAMICS.md`](../04-vehicle-dynamics/BRAKING_DYNAMICS.md)
- [`NUMERICAL_METHODS_AND_STABILITY.md`](NUMERICAL_METHODS_AND_STABILITY.md)
