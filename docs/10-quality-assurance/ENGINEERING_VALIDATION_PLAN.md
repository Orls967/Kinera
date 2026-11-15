# KINERA Engineering Validation Plan

**Document ID:** `KIN-DOC-10-02`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines objective numerical verification against independent closed-form analytical solutions, conservation laws, dimensional analysis checks, and qualitative comparative behavioral invariants for all 29 authoritative equations in [`EQUATION_REFERENCE.md`](../09-learning-and-content/EQUATION_REFERENCE.md).

---

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-QA-004** | Every equation (`eq.*`) implemented in Rust/WASM shall match an independent closed-form analytical solution or tabular oracle within explicit numerical tolerance across the V1 domain. |
| **KIN-QA-005** | Fundamental conservation laws (total normal load, positive power dissipation across stages, friction-circle utilization bound) and coordinate sign conventions (`ISO 8855` internal / R3F cyclic $+1$ determinant) shall be asserted on every solver integration run. |
| **KIN-QA-006** | Qualitative engineering differentiation hypotheses (`FWD` vs `RWD` vs `AWD` vs `4WD` vs `EV` trade-offs) shall be regression-tested against matched baseline presets (`KIN-FR-030`, `AC-015`). |

---

## 3. Closed-Form Analytical Verification Matrix

> **Tolerance Tiers:**
> - **Tier A (`exact_identity` / algebraic stage):** Relative error $\le 10^{-9}$ (f64 solver core) or $\le 10^{-6}$ at JSON serialization boundaries.
> - **Tier B (`idealized_model` / time-stepped RK4):** Steady-state error $\le 10^{-4}$; transient integration error vs analytical ODE $\le 0.5\%$ at $\Delta t = 0.01\text{ s}$.
> - **Tier C (`educational_approximation`):** Exact match to documented simplified equation ($\le 10^{-9}$ algebraic) while clearly carrying `Simulated Model Estimate` and validity warnings outside linear regime ($|\alpha| > 6^\circ$ or $a_y / g \ge \text{SSF}$).

| Equation ID | Independent Analytical Check Case (SI Inputs) | Exact Expected Output | Tier & Tolerance |
| :--- | :--- | :--- | :--- |
| `eq.powertrain.angular-velocity` | $\text{RPM} = 3000\text{ rev/min}$ | $\omega = 100\pi \approx 314.159265\text{ rad/s}$ | Tier A ($\le 10^{-9}$) |
| `eq.powertrain.mechanical-power` | $T = 250\text{ N}\cdot\text{m}$, $\omega = 314.159265\text{ rad/s}$ | $P = 78539.8163\text{ W}$ ($78.54\text{ kW}$) | Tier A ($\le 10^{-9}$) |
| `eq.powertrain.ice-displacement` | $B = 0.086\text{ m}, S = 0.086\text{ m}, N_{cyl} = 4$ | $V_d = 0.00199823\text{ m}^3$ (`1.998 L`) | Tier A ($\le 10^{-9}$) |
| `eq.powertrain.ice-torque-output` | $u_{th} = 0.6$, $T_{WOT} = 220\text{ N}\cdot\text{m}$, $T_{fric} = 25\text{ N}\cdot\text{m}$ | $T_{eng} = 0.6(220) - 0.4(25) = 122.0\text{ N}\cdot\text{m}$ | Tier A ($\le 10^{-9}$) |
| `eq.powertrain.gearbox-torque` | $T_{in} = 200\text{ N}\cdot\text{m}, G = 3.5, \eta = 0.96$ | $T_{out} = 672.0\text{ N}\cdot\text{m}$ | Tier A ($\le 10^{-9}$) |
| `eq.powertrain.wheel-rpm` | $\text{RPM}_{in} = 3000, G = 1.5, F = 4.0$ | $\text{RPM}_{wheel} = 500.0\text{ rev/min}$ | Tier A ($\le 10^{-9}$) |
| `eq.powertrain.tractive-force` | $T_{wheel} = 1050\text{ N}\cdot\text{m}, r_{eff} = 0.32\text{ m}$ | $F_{tractive} = 3281.25\text{ N}$ | Tier A ($\le 10^{-9}$) |
| `eq.powertrain.open-diff` | $T_{axle} = 1000\text{ N}\cdot\text{m}, T_{cap,L} = 300\text{ N}\cdot\text{m}, T_{cap,R} = 1800\text{ N}\cdot\text{m}$ | $T_L = 300.0\text{ N}\cdot\text{m}, T_R = 300.0\text{ N}\cdot\text{m}$ | Tier A ($\le 10^{-9}$) |
| `eq.powertrain.lsd-diff` | $T_{cap,L} = 300\text{ N}\cdot\text{m}, \text{TBR} = 2.5, T_{preload} = 50\text{ N}\cdot\text{m}, T_{axle} = 1200$ | $T_L = 300.0\text{ N}\cdot\text{m}, T_R = 800.0\text{ N}\cdot\text{m}$ ($\le 2.5\times 300+50$) | Tier A ($\le 10^{-9}$) |
| `eq.powertrain.locked-diff` | $\omega_L = \omega_R$, $T_{axle} = 1200\text{ N}\cdot\text{m}, T_{cap,L}=300, T_{cap,R}=1800$ | $T_L = 300.0\text{ N}\cdot\text{m}, T_R = 900.0\text{ N}\cdot\text{m}$ | Tier A ($\le 10^{-9}$) |
| `eq.ev.motor-envelope` | $T_{peak} = 320\text{ N}\cdot\text{m}, P_{peak} = 150000\text{ W}$ at $\omega = 625\text{ rad/s}$ | $T_{max} = \min(320, 150000/625) = 240.0\text{ N}\cdot\text{m}$ | Tier A ($\le 10^{-9}$) |
| `eq.ev.electrical-power` | $V = 400\text{ V}, I = 250\text{ A}$ | $P_{elec} = 100000.0\text{ W}$ ($100\text{ kW}$) | Tier A ($\le 10^{-9}$) |
| `eq.ev.motor-efficiency` | $P_{mech} = 92000\text{ W}, P_{elec,ac} = 100000\text{ W}$ | $\eta_{motor} = 0.92$ | Tier A ($\le 10^{-9}$) |
| `eq.ev.energy-consumption` | $V_{oc} = 400\text{ V}, I_{batt} = 150\text{ A}, \Delta t = 60\text{ s}, E_{pack} = 2.16\times 10^8\text{ J}$ | $\Delta\text{SOC} = -0.0166667$ ($-1.667\%$) | Tier B ($\le 10^{-6}$) |
| `eq.dynamics.aero-drag` | $\rho = 1.225, C_d = 0.28, A = 2.2, v_x = 30\text{ m/s}$ | $F_{drag} = 339.57\text{ N}$ | Tier A ($\le 10^{-9}$) |
| `eq.dynamics.rolling-resistance` | $C_{rr} = 0.011, m = 1500, g = 9.81, \theta = 0\text{ rad}, v_x > 0$ | $F_{rolling} = 161.865\text{ N}$ | Tier A ($\le 10^{-9}$) |
| `eq.dynamics.grade-resistance` | $m = 1500, g = 9.81, \sin\theta = 0.10 / \sqrt{1.01}$ ($\text{10\% grade}$) | $F_{grade} = 1464.2225\text{ N}$ | Tier A ($\le 10^{-9}$) |
| `eq.dynamics.longitudinal-net-force` | $F_{tractive}=4000, F_{drag}=339.57, F_{roll}=161.865, F_{grade}=0$ | $F_{net} = 3498.565\text{ N}$ | Tier A ($\le 10^{-9}$) |
| `eq.dynamics.longitudinal-accel` | $F_{net} = 3498.565\text{ N}, m = 1500\text{ kg}$ | $a_x = 2.332377\text{ m/s}^2$ | Tier B ($\le 10^{-6}$) |
| `eq.dynamics.bicycle-lateral` | Constant $F_x=0$ coast/steady turn vs RK4 analytical decay | Steady state $\dot{v}_y = 0 \implies v_x r = (F_{yf}+F_{yr})/m$ | Tier B ($\le 10^{-4}$) |
| `eq.dynamics.bicycle-yaw` | Steady-state turn at $\delta = 0.03\text{ rad}, v_x = 20\text{ m/s}$ | $\dot{r} = 0 \implies a F_{yf} = b F_{yr}$ & $r_{ss} = \frac{v_x \delta}{L + K_{us} v_x^2 / g}$ (Wait: check $g$ normalization in Section 4!) | Tier B ($\le 10^{-4}$) |
| `eq.dynamics.tire-linear-lateral` | $C_\alpha = 55000\text{ N/rad}, \alpha = 0.04\text{ rad}$ ($\approx 2.29^\circ$) | $F_y = 2200.0\text{ N}$ | Tier C ($\le 10^{-9}$) |
| `eq.dynamics.understeer-gradient` | $m=1500, L=2.7, a=1.15, b=1.55, C_{\alpha f}=55000, C_{\alpha r}=60000$ | $K_{us} = +0.0050084\text{ rad}/(\text{m/s}^2)$ | Tier C ($\le 10^{-9}$) |
| `eq.dynamics.braking-force` | $m = 1500\text{ kg}, |a| = 8.0\text{ m/s}^2$ | $F_{brake} = 12000.0\text{ N}$ | Tier A ($\le 10^{-9}$) |
| `eq.dynamics.stopping-distance` | $v_0 = 27.777778\text{ m/s}$ ($100\text{ km/h}$), const $|a| = 8.0\text{ m/s}^2$ | $d = 48.225309\text{ m}$ | Tier A ($\le 10^{-9}$) |
| `eq.dynamics.weight-transfer-longitudinal` | $m=1500, h=0.54, L=2.70, a_x = +5.0\text{ m/s}^2$ | $\Delta F_z = 1500.0\text{ N}$ (Rear $+1500$, Front $-1500$) | Tier C ($\le 10^{-9}$) |
| `eq.dynamics.weight-transfer-lateral` | $m=1500, h=0.54, t=1.56, a_y = +6.0\text{ m/s}^2$ | Total shift $\Delta F_{z,lat} = 3115.3846\text{ N}$ ($\pm 1557.6923\text{ N}$/wheel at 50:50) | Tier C ($\le 10^{-9}$) |
| `eq.dynamics.friction-limit` | $\mu = 0.90, F_z = 4000\text{ N}$ | $F_{max} = 3600.0\text{ N}$ | Tier C ($\le 10^{-9}$) |
| `eq.dynamics.friction-circle` | $F_x = 2400\text{ N}, F_y = 2400\text{ N}, \mu F_z = 3600\text{ N}$ | $(2400/3600)^2 + (2400/3600)^2 = 0.888889 \le 1.0$ (`u = 94.28%`) | Tier C ($\le 10^{-9}$) |

> **Unit Consistency Note for `eq.dynamics.understeer-gradient`:** As specified in [`LATERAL_DYNAMICS_BICYCLE_MODEL.md`](../04-vehicle-dynamics/LATERAL_DYNAMICS_BICYCLE_MODEL.md), `eq.dynamics.understeer-gradient` uses mass-unit $K_{us}$ in $\text{rad}/(\text{m/s}^2)$, so steady-state yaw rate is $r_{ss} = \dfrac{v_x \delta}{L + K_{us} v_x^2}$ (no division by $g$). When displayed to users in $\text{deg}/g$, UI converts $K_{us,g} = K_{us} \cdot g \cdot \frac{180}{\pi}$.

---

## 4. Conservation, Symmetry & Dimensional Invariants

1. **Normal Load Conservation ($\Sigma F_z = m g \cos\theta$):** Across every combination of $a_x$, $a_y$, $\theta$, and wheel-lift clamping ($F_{z,i} \ge 0$), the sum of all four tire vertical forces must equal $m g \cos\theta$ within $10^{-6}\text{ N}$.
2. **Stage Efficiency Ordering:** For an identical prime mover torque, stage-by-stage mechanical efficiency must obey strictly $P_{out} \le P_{in}$ and match reference single-pass path products (`ICE-FWD` $\approx 0.917$, `ICE-RWD` $\approx 0.885$, `ICE-AWD` $\approx 0.849$, `ICE-4WD` `2H` $\approx 0.858$ / `4L` $\approx 0.823$, `EV` mechanical $\approx 0.941$).
3. **Right/Left Symmetry:** Zero steer ($\delta = 0$) and zero bank/wind with symmetric $\mu$ must yield $a_y = 0, r = 0, F_{z,FL} = F_{z,FR}, F_{z,RL} = F_{z,RR}$ to machine precision.
4. **Coordinate Determinant Check:** Converting `ISO 8855` $(x,y,z)$ vectors into Three.js $(y, z, x)$ preserves right-handed orientation ($\det = +1$).

---

## 5. Comparative Behavioral Invariants (Matched Baseline)

Using Matched Baseline presets (`vehicleMassKg = 1550 kg`, `dragCoefficient = 0.29`, `frontalAreaM2 = 2.25 m²`, `mu = 0.90`, `C_rr = 0.011`, equal peak power/tire sizing):
- Under hard launch on $\mu = 0.85$ dry asphalt, rear weight transfer ($\Delta F_z > 0$) gives `ICE-RWD` and `ICE-AWD` higher launch traction ceiling than `ICE-FWD`.
- On split-$\mu$ ice/asphalt ($\mu_L = 0.15, \mu_R = 0.85$), an open-diff axle transmits strictly $2 \times T_{cap,L}$, whereas `LSD` (`TBR = 2.5`) transmits up to $3.5 \times T_{cap,L} + T_{preload}$ and a `Locked` axle transmits up to $T_{cap,L} + T_{cap,R}$.
- Engaging `ICE-4WD` `4L` (`low_range_ratio = 2.48`) multiplies available axle torque by $\sim 2.4\times$ (after stage efficiency) and proportionally reduces top wheel speed per RPM compared to `4H`.
- For constant-power sweep at high speed ($v_x > 35\text{ m/s}$), aerodynamic drag grows as $v_x^2$ (power demand $v_x^3$), governing top-speed equilibrium where $F_{tractive}(v) = F_{drag}(v) + F_{rolling}$.

---

## 6. Cross-References

- [`../09-learning-and-content/EQUATION_REFERENCE.md`](../09-learning-and-content/EQUATION_REFERENCE.md)
- [`SIMULATION_TEST_CASES.md`](SIMULATION_TEST_CASES.md)
- [`../04-vehicle-dynamics/LATERAL_DYNAMICS_BICYCLE_MODEL.md`](../04-vehicle-dynamics/LATERAL_DYNAMICS_BICYCLE_MODEL.md)
- [`../03-powertrain-engineering/DRIVETRAIN_EFFICIENCY_MODEL.md`](../03-powertrain-engineering/DRIVETRAIN_EFFICIENCY_MODEL.md)
