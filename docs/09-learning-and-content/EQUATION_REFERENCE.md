# Authoritative Equation Reference — KINERA

**Document ID:** `KIN-DOC-09-04`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Serves as the single authoritative registry of every mathematical equation implemented across KINERA V1, verifying dimensional consistency, documenting model classification (`exact_identity`, `idealized_model`, `educational_approximation`, `empirical_map`), assumptions, limits, verified references, and numerical check benchmarks.

## 2. Powertrain & EV Equations

| Equation ID | Name & Expression | Variables & SI Units | Class & Assumptions | Verified Source |
| :--- | :--- | :--- | :--- | :--- |
| `eq.powertrain.angular-velocity` | **Angular Velocity**<br>$\omega = \dfrac{2\pi \cdot \text{RPM}}{60}$ | $\omega$ [$\text{rad/s}$], $\text{RPM}$ [$\text{rev/min}$] | `exact_identity`; steady rotation | Standard mechanics (`ref.book.gillespie-2021`) |
| `eq.powertrain.mechanical-power` | **Mechanical Shaft Power**<br>$P = T \cdot \omega$ | $P$ [$\text{W}$], $T$ [$\text{N}\cdot\text{m}$], $\omega$ [$\text{rad/s}$] | `exact_identity`; rigid shaft | Standard mechanics (`ref.book.gillespie-2021`) |
| `eq.powertrain.ice-displacement` | **ICE Swept Displacement**<br>$V_d = \dfrac{\pi}{4} B^2 S N_{cyl}$ | $V_d$ [$\text{m}^3$], $B,S$ [$\text{m}$], $N_{cyl}$ [$-$] | `exact_identity`; uniform cylindrical bores | `ref.book.heywood-2018` |
| `eq.powertrain.ice-torque-output` | **Throttle-Modulated ICE Torque**<br>$T_{eng} = u_{th} T_{WOT}(\text{RPM}) - (1-u_{th}) T_{fric}$ | $T$ [$\text{N}\cdot\text{m}$], $u_{th} \in [0,1]$ [$-$] | `empirical_map`; steady-state WOT lookup | `ref.book.heywood-2018` |
| `eq.powertrain.gearbox-torque` | **Gear Stage Torque**<br>$T_{out} = T_{in} \cdot G \cdot \eta$ | $T$ [$\text{N}\cdot\text{m}$], $G$ [$-$], $\eta \in (0,1]$ | `idealized_model`; constant stage $\eta$, rigid mesh | `ref.book.gillespie-2021` |
| `eq.powertrain.wheel-rpm` | **Driven Wheel Speed**<br>$\text{RPM}_{wheel} = \dfrac{\text{RPM}_{in}}{|G| \cdot F}$ | $\text{RPM}$ [$\text{rev/min}$], $G, F$ [$-$] | `idealized_model`; zero tire slip & zero clutch slip | `ref.book.gillespie-2021` |
| `eq.powertrain.tractive-force` | **Wheel Tractive Force**<br>$F_{tractive,i} = \dfrac{T_{wheel,i}}{r_{eff}}$ | $F$ [$\text{N}$], $T_{wheel,i}$ [$\text{N}\cdot\text{m}$], $r_{eff}$ [$\text{m}$] | `idealized_model`; steady rolling radius, capped by $\mu F_z$ | `ref.book.gillespie-2021` |
| `eq.powertrain.open-diff` | **Open Differential Split**<br>$T_L = T_R = \min(0.5 T_{axle}, T_{cap,L}, T_{cap,R})$ | $T$ [$\text{N}\cdot\text{m}$], $T_{cap} = \mu F_z r_{eff}$ | `idealized_model`; neglects small bevel friction | `ref.book.milliken-1995` |
| `eq.powertrain.lsd-diff` | **Simplified LSD Split**<br>$T_{high} \le TBR \cdot T_{low} + T_{preload}$ | $TBR \ge 1$ [$-$], $T_{preload}$ [$\text{N}\cdot\text{m}$] | `educational_approximation`; static bias clamp | `ref.book.milliken-1995` |
| `eq.powertrain.locked-diff` | **Locked Differential**<br>$\omega_L = \omega_R, \; T_i \le T_{cap,i}$ | $\omega$ [$\text{rad/s}$], $T$ [$\text{N}\cdot\text{m}$] | `idealized_model`; rigid axle spool | `ref.book.milliken-1995` |
| `eq.ev.motor-envelope` | **EV Motor Envelope**<br>$T_{max}(\omega) = \min(T_{peak}, P_{peak}/|\omega|)$ | $T$ [$\text{N}\cdot\text{m}$], $P$ [$\text{W}$], $\omega$ [$\text{rad/s}$] | `idealized_model`; constant-torque + field weakening | `ref.book.ehsani-2018` |
| `eq.ev.electrical-power` | **DC Electrical Power**<br>$P_{elec} = V \cdot I$ | $P_{elec}$ [$\text{W}$], $V$ [$\text{V}$], $I$ [$\text{A}$] | `exact_identity`; steady DC bus | `ref.book.ehsani-2018` |
| `eq.ev.motor-efficiency` | **Motor Conversion Efficiency**<br>$\eta_{motor} = \dfrac{P_{mech}}{P_{elec,ac}}$ | $\eta_{motor} \in (0,1]$, $P$ [$\text{W}$] | `empirical_map`; 2D $(\omega, T)$ efficiency lookup | `ref.book.ehsani-2018` |
| `eq.ev.energy-consumption` | **Energy & SOC Evolution**<br>$\Delta \text{SOC} = -\dfrac{V_{oc} I_{batt} \Delta t}{E_{pack}}$ | $E_{pack}$ [$\text{J}$], $\Delta t$ [$\text{s}$] | `idealized_model`; $V_{oc}-I R_{int}$ battery model | `ref.book.ehsani-2018` |

## 3. Vehicle Dynamics Equations

| Equation ID | Name & Expression | Variables & SI Units | Class & Assumptions | Verified Source |
| :--- | :--- | :--- | :--- | :--- |
| `eq.dynamics.longitudinal-net-force` | **Longitudinal Force Sum**<br>$F_{net} = F_{tractive} - F_{drag} - F_{rolling} - F_{grade}$ | Forces [$\text{N}$] | `idealized_model`; rigid straight-line plane | `ref.book.gillespie-2021` |
| `eq.dynamics.longitudinal-accel` | **Longitudinal Acceleration**<br>$a_x = \dfrac{F_{net}}{m}$ | $a_x$ [$\text{m/s}^2$], $m$ [$\text{kg}$] | `idealized_model`; excludes rotational mass unless toggled | `ref.book.gillespie-2021` |
| `eq.dynamics.aero-drag` | **Aerodynamic Drag**<br>$F_{drag} = \frac{1}{2} \rho C_d A v_x |v_x|$ | $\rho$ [$\text{kg/m}^3$], $C_d$ [$-$], $A$ [$\text{m}^2$], $v_x$ [$\text{m/s}$] | `idealized_model`; zero headwind, constant $C_d$ | `ref.book.wong-2022` |
| `eq.dynamics.rolling-resistance` | **Rolling Resistance**<br>$F_{rolling} = \operatorname{sgn}(v_x) C_{rr} m g \cos(\theta)$ | $C_{rr}$ [$-$], $g$ [$\text{m/s}^2$], $\theta$ [$\text{rad}$] | `empirical_map`; speed-independent $C_{rr}$ | `ref.book.wong-2022` |
| `eq.dynamics.grade-resistance` | **Road Gradient Force**<br>$F_{grade} = m g \sin(\theta)$ | $\theta$ [$\text{rad}$], $m$ [$\text{kg}$] | `exact_identity`; rigid slope geometry | `ref.book.gillespie-2021` |
| `eq.dynamics.bicycle-lateral` | **2-DOF Bicycle Lateral Force**<br>$m(\dot{v}_y + v_x r) = F_{yf} + F_{yr}$ | $v_y$ [$\text{m/s}$], $r$ [$\text{rad/s}$], $F_y$ [$\text{N}$] | `educational_approximation`; small angles, constant $v_x$ | `ref.book.rajamani-2012` |
| `eq.dynamics.bicycle-yaw` | **2-DOF Bicycle Yaw Moment**<br>$I_z \dot{r} = a F_{yf} - b F_{yr}$ | $I_z$ [$\text{kg}\cdot\text{m}^2$], $a,b$ [$\text{m}$] | `educational_approximation`; linear planar body | `ref.book.rajamani-2012` |
| `eq.dynamics.tire-linear-lateral` | **Linear Cornering Force**<br>$F_y = C_\alpha \alpha$ | $C_\alpha$ [$\text{N/rad}$], $\alpha$ [$\text{rad}$] | `educational_approximation`; valid $|\alpha| \le 6^\circ$ | `ref.book.rajamani-2012` |
| `eq.dynamics.understeer-gradient` | **Understeer Gradient**<br>$K_{us} = \dfrac{m b}{L C_{\alpha f}} - \dfrac{m a}{L C_{\alpha r}}$ | $K_{us}$ [$\text{rad}/(\text{m/s}^2)$] | `educational_approximation`; steady-state linear | `ref.book.gillespie-2021` |
| `eq.dynamics.braking-force` | **Ideal Braking Force**<br>$F_{brake} = m |a|$ | $F_{brake}$ [$\text{N}$], $|a|$ [$\text{m/s}^2$] | `idealized_model`; ignores drag/rolling in ideal form | `ref.book.gillespie-2021` |
| `eq.dynamics.stopping-distance` | **Constant-Decel Stopping Dist**<br>$d = \dfrac{v_0^2}{2 |a|}$ | $d$ [$\text{m}$], $v_0$ [$\text{m/s}$] | `exact_identity` (for constant $a$); time-stepped run adds bias/aero | `ref.book.gillespie-2021` |
| `eq.dynamics.weight-transfer-longitudinal` | **Longitudinal Load Transfer**<br>$\Delta F_z = \dfrac{m a_x h}{L}$ | $h, L$ [$\text{m}$], $\Delta F_z$ [$\text{N}$] | `educational_approximation`; rigid quasi-static CG height | `ref.book.gillespie-2021` |
| `eq.dynamics.weight-transfer-lateral` | **Lateral Load Transfer**<br>$\Delta F_{z,lat} \approx \dfrac{m a_y h}{t}$ | $h, t$ [$\text{m}$], $a_y$ [$\text{m/s}^2$] | `educational_approximation`; ignores roll center & suspension K&C | `ref.book.milliken-1995` |
| `eq.dynamics.friction-limit` | **Peak Tire Friction**<br>$F_{max} = \mu F_z$ | $\mu$ [$-$], $F_z$ [$\text{N}$] | `educational_approximation`; neglects $\mu$ load sensitivity | `ref.book.wong-2022` |
| `eq.dynamics.friction-circle` | **Simplified Friction Circle**<br>$\left(\dfrac{F_x}{\mu F_z}\right)^2 + \left(\dfrac{F_y}{\mu F_z}\right)^2 \le 1$ | $F_x, F_y, F_z$ [$\text{N}$] | `educational_approximation`; isotropic grip limit | `ref.book.milliken-1995` |

## 4. Cross-References

- [`TECHNICAL_REFERENCE_POLICY.md`](TECHNICAL_REFERENCE_POLICY.md)
- [`../10-quality-assurance/ENGINEERING_VALIDATION_PLAN.md`](../10-quality-assurance/ENGINEERING_VALIDATION_PLAN.md)
