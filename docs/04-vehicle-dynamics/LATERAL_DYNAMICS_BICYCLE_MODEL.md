# Lateral Dynamics — Simplified 2-DOF Linear Bicycle Model — KINERA

**Document ID:** `KIN-DOC-04-03`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Specifies the 2-DOF linear bicycle model (`KIN-VDY-010`–`KIN-VDY-014`) used in KINERA V1 to teach steering response, yaw rate dynamics, lateral acceleration, sideslip, vehicle trajectory, and understeer/oversteer behavior—with strict enforcement of linear validity boundaries.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-VDY-010** | Lateral dynamics simulation shall implement the 2-DOF linear bicycle ODEs for lateral velocity $v_y$ and yaw rate $r$ at constant/prescribed longitudinal speed $v_x$. |
| **KIN-VDY-011** | Simulator shall compute steady-state understeer gradient $K_{us}$, turning radius $R$, yaw rate $r(t)$, lateral acceleration $a_y(t)$, body sideslip $\beta(t)$, front/rear slip angles $\alpha_f(t), \alpha_r(t)$, and 2D $(X, Y)$ world path. |
| **KIN-VDY-012** | Simulator shall classify handling tendency (`Understeer`, `Neutral Steer`, `Oversteer`) and compute critical speed $v_{crit}$ when $K_{us} < 0$. |
| **KIN-VDY-013** | Linear validity bounds shall be monitored at every integration step: flag explicit warning if $|\alpha_f| > 6^\circ$ ($0.1047\text{ rad}$), $|\alpha_r| > 6^\circ$, or $|a_y| > 0.4g$, or if $v_x < 1.0\text{ m/s}$ (low-speed kinematic regime switch/clamp). |
| **KIN-VDY-014** | Documentation and UI shall clearly explain that V1 lateral dynamics is a linear small-angle educational model, not a nonlinear tire/suspension handling simulation. |

## 3. Mathematical Formulation (ISO 8855)

### 3.1 Equations of Motion (`eq.dynamics.bicycle-lateral`, `eq.dynamics.bicycle-yaw`)
$$m (\dot{v}_y + v_x r) = F_{yf} + F_{yr}$$
$$I_z \dot{r} = a F_{yf} - b F_{yr}$$
where $L = a + b$ is total wheelbase, $a$ is CG-to-front-axle distance, $b$ is CG-to-rear-axle distance, and $I_z$ is vehicle yaw moment of inertia.

### 3.2 Slip Angles & Linear Tire Forces (`eq.dynamics.tire-linear-lateral`)
For small road-wheel steering angle $\delta$ (radians) and forward speed $v_x > 0$:
$$\alpha_f = \delta - \frac{v_y + a r}{v_x}, \qquad \alpha_r = -\frac{v_y - b r}{v_x}$$
$$F_{yf} = C_{\alpha f} \alpha_f, \qquad F_{yr} = C_{\alpha r} \alpha_r$$
where $C_{\alpha f}, C_{\alpha r} > 0$ denote **total front axle** and **total rear axle** cornering stiffnesses ($\text{N/rad}$, i.e., $2 \times$ per-tire stiffness). Body sideslip angle is $\beta = \arctan2(v_y, v_x) \approx v_y / v_x$.

### 3.3 State-Space Form for Integration
Expanding into $\dot{\mathbf{x}} = \mathbf{A}\mathbf{x} + \mathbf{B}\delta$ with $\mathbf{x} = [v_y, r]^T$:
$$\begin{bmatrix} \dot{v}_y \\ \dot{r} \end{bmatrix} = \begin{bmatrix} -\dfrac{C_{\alpha f} + C_{\alpha r}}{m v_x} & -v_x - \dfrac{a C_{\alpha f} - b C_{\alpha r}}{m v_x} \\ -\dfrac{a C_{\alpha f} - b C_{\alpha r}}{I_z v_x} & -\dfrac{a^2 C_{\alpha f} + b^2 C_{\alpha r}}{I_z v_x} \end{bmatrix} \begin{bmatrix} v_y \\ r \end{bmatrix} + \begin{bmatrix} \dfrac{C_{\alpha f}}{m} \\ \dfrac{a C_{\alpha f}}{I_z} \end{bmatrix} \delta$$
World trajectory $(X, Y, \psi)$ integrates concurrently:
$$\dot{\psi} = r, \qquad \dot{X} = v_x \cos\psi - v_y \sin\psi, \qquad \dot{Y} = v_x \sin\psi + v_y \cos\psi$$

### 3.4 Steady-State Handling Metrics
- **Understeer Gradient (`eq.dynamics.understeer-gradient`):**
  $$K_{us} = \frac{m b}{L C_{\alpha f}} - \frac{m a}{L C_{\alpha r}} \quad [\text{rad}/(\text{m/s}^2)]$$
  - $K_{us} > 0$: **Understeer** ($W_f / C_{\alpha f} > W_r / C_{\alpha r}$)
  - $K_{us} = 0$: **Neutral Steer**
  - $K_{us} < 0$: **Oversteer** (with theoretical critical speed $v_{crit} = \sqrt{-L / K_{us}}$ beyond which the linear model becomes dynamically unstable!)
- **Steady-State Yaw Rate Gain & Lateral Acceleration:**
  $$r_{ss} = \frac{v_x}{L + K_{us} v_x^2} \delta, \qquad a_{y,ss} = v_x r_{ss}, \qquad R_{ss} = \frac{v_x}{r_{ss}}$$

## 4. Assumptions, Limits & Edge Cases

- **Low-Speed Singularity ($v_x \to 0$):** Because $1/v_x$ diverges as $v_x \to 0$, below $v_x = 1.0\text{ m/s}$ the solver smoothly transitions to kinematic Ackermann steering ($r = \frac{v_x}{L}\tan\delta$, $v_y \approx 0$, $a_y = v_x r$).
- **Linear Validity Warning Thresholds:** Warn user clearly whenever $\max(|\alpha_f|, |\alpha_r|) > 6^\circ$ or $|a_y| > 0.4g$ ($3.92\text{ m/s}^2$) or $K_{us} < 0$ with $v_x \ge 0.9 v_{crit}$.
- **Excluded Effects:** Roll steer, suspension compliance steer, tire load sensitivity on $C_\alpha$ during load transfer, and combined longitudinal-lateral $F_x$ degradation of $C_\alpha$ (latter shown conceptually via Friction Circle).

## 5. Verification Benchmark

Using `ICE-RWD` defaults ($m = 1420\text{ kg}$, $L = 2.70\text{ m}$, $a = 1.296\text{ m}$, $b = 1.404\text{ m}$, $C_{\alpha f} = 65,000\text{ N/rad}$, $C_{\alpha r} = 70,000\text{ N/rad}$) at $v_x = 20\text{ m/s}$, $\delta = 0.03\text{ rad}$ ($1.719^\circ$):
- $K_{us} = \frac{1420 \times 1.404}{2.70 \times 65000} - \frac{1420 \times 1.296}{2.70 \times 70000} = 0.0016225\text{ rad}/(\text{m/s}^2)$ (Understeer)
- $r_{ss} = \frac{20}{2.70 + 0.0016225 \times 400} \times 0.03 = 0.17916\text{ rad/s}$
- $a_{y,ss} = 3.583\text{ m/s}^2$ ($0.365g$), $\alpha_f = 2.33^\circ$, $\alpha_r = 2.00^\circ$.

## 6. Cross-References

- [`VEHICLE_DYNAMICS_OVERVIEW.md`](VEHICLE_DYNAMICS_OVERVIEW.md)
- [`WEIGHT_TRANSFER_MODEL.md`](WEIGHT_TRANSFER_MODEL.md)
- [`../05-simulation-engine/NUMERICAL_METHODS_AND_STABILITY.md`](../05-simulation-engine/NUMERICAL_METHODS_AND_STABILITY.md)
