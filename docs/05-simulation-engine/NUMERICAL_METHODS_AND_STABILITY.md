# Numerical Methods and Stability — KINERA

**Document ID:** `KIN-DOC-05-07`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Specifies numerical integration algorithms, step-size bounds, stiffness/stability criteria for the bicycle and longitudinal models, root-finding tolerances, and IEEE-754 floating-point safeguards (`KIN-SIM-025`–`KIN-SIM-027`).

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-SIM-025** | Time-domain ODEs (longitudinal motion, braking, EV SOC, and 2-DOF lateral bicycle dynamics) shall use **Classical 4th-Order Runge-Kutta (RK4)** integration with fixed deterministic step size $\Delta t$ (with documented sub-stepping for stiff low-speed lateral cases). |
| **KIN-SIM-026** | Time-step $\Delta t$ shall be strictly bounded to $[0.001\text{ s}, 0.05\text{ s}]$ (default $\Delta t = 0.01\text{ s}$); extreme time steps outside bounds shall be rejected with `SIM_INVALID_TIMESTEP`. |
| **KIN-SIM-027** | Every solver output array shall be guarded against `NaN`, `±Infinity`, or unphysical sign flips (e.g., negative speed during pure braking). |

## 3. Integration & Root-Finding Methods

### 3.1 Fixed-Step Classical RK4
For state vector $\mathbf{y}(t)$ and derivative $\mathbf{f}(t, \mathbf{y})$:
$$\mathbf{k}_1 = \mathbf{f}(t_n, \mathbf{y}_n)$$
$$\mathbf{k}_2 = \mathbf{f}\!\left(t_n + \tfrac{\Delta t}{2}, \; \mathbf{y}_n + \tfrac{\Delta t}{2}\mathbf{k}_1\right)$$
$$\mathbf{k}_3 = \mathbf{f}\!\left(t_n + \tfrac{\Delta t}{2}, \; \mathbf{y}_n + \tfrac{\Delta t}{2}\mathbf{k}_2\right)$$
$$\mathbf{k}_4 = \mathbf{f}(t_n + \Delta t, \; \mathbf{y}_n + \Delta t\mathbf{k}_3)$$
$$\mathbf{y}_{n+1} = \mathbf{y}_n + \frac{\Delta t}{6}(\mathbf{k}_1 + 2\mathbf{k}_2 + 2\mathbf{k}_3 + \mathbf{k}_4)$$
- **Global Error Order:** $\mathcal{O}(\Delta t^4)$. At default $\Delta t = 0.01\text{ s}$, integration error on smooth acceleration and lateral bicycle responses is $< 10^{-5}$, far tighter than the $\le 0.5\%$ QA tolerance (`KIN-NFR-008`).

### 3.2 Bicycle Model Numerical Stability at Low Speed
Notice the bicycle state matrix $\mathbf{A}$ has eigenvalues scaling inversely with $v_x$:
$$\lambda_{real} \sim -\frac{C_{\alpha f} + C_{\alpha r}}{m v_x}$$
For $C_{\alpha} \approx 135,000\text{ N/rad}, m = 1420\text{ kg}$ at $v_x = 2.0\text{ m/s}$, $|\lambda| \approx 47.5\text{ s}^{-1}$. For RK4 stability, $|\lambda| \Delta t \le 2.78$ requires $\Delta t \le 0.058\text{ s}$ (so $\Delta t = 0.01\text{ s}$ gives $|\lambda|\Delta t = 0.475$, completely stable!). If $1.0 \le v_x < 5.0\text{ m/s}$ and user chooses $\Delta t > 0.01\text{ s}$, solver automatically applies $N_{sub} = 5$ internal sub-steps ($\Delta t_{sub} \le 0.01\text{ s}$). Below $v_x < 1.0\text{ m/s}$, kinematic Ackermann transition prevents $1/v_x$ stiffness entirely!

### 3.3 Event Interpolation & Top-Speed Bisection
- **0–100 km/h & Quarter-Mile Crossings:** Linear interpolation between the step immediately before and after crossing $v = 27.7778\text{ m/s}$ or $x = 402.336\text{ m}$ eliminates $\pm \Delta t$ quantization jitter.
- **Braking Zero-Crossing:** When $v_{n+1} \le 0$ during braking, compute exact stop sub-fraction $\alpha = v_n / (v_n - v_{n+1}) \in [0, 1]$, clamp $v_{end} = 0$, $x_{end} = x_n + \alpha (x_{n+1} - x_n)$, $t_{stop} = t_n + \alpha \Delta t$, and halt cleanly.
- **Top Speed Bisection:** Evaluates $F_{net}(v)$ over $[0, v_{gear\_redline}]$ with 40 bisection iterations ($\text{error} < 10^{-10}\text{ m/s}$).

## 4. Cross-References

- [`SIMULATION_ENGINE_SPECIFICATION.md`](SIMULATION_ENGINE_SPECIFICATION.md)
- [`SIMULATION_ERROR_HANDLING.md`](SIMULATION_ERROR_HANDLING.md)
- [`../10-quality-assurance/ENGINEERING_VALIDATION_PLAN.md`](../10-quality-assurance/ENGINEERING_VALIDATION_PLAN.md)
