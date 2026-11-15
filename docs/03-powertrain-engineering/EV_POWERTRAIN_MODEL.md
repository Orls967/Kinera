# EV Powertrain Model — KINERA

**Document ID:** `KIN-DOC-03-03`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the mathematical and architectural model for KINERA's Electric Vehicle powertrain (`KIN-PWT-009`–`KIN-PWT-013`), covering battery pack voltage/SOC behavior, BMS limits, inverter conversion, parameterized PMSM/Induction motor torque-speed envelopes, efficiency accounting, and regenerative braking.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-PWT-009** | KINERA V1 shall model EV battery pack capacity ($\text{J}$ / $\text{kWh}$), terminal voltage ($V$), State of Charge ($\text{SOC} \in [0, 1]$), battery current ($I$), and BMS discharge/charge power ceilings. |
| **KIN-PWT-010** | The motor model shall expose a parameterized torque-speed envelope (constant-torque base region transitioning at base speed $\omega_{base}$ into constant-power field-weakening region) plus an explicit efficiency map $\eta_{motor}(\omega, T)$. |
| **KIN-PWT-011** | Documentation shall explain operating principles of both **PMSM** and **Induction Motor** architectures while explicitly stating V1 uses parameterized torque/efficiency curves rather than electromagnetic FEA. |
| **KIN-PWT-012** | Inverter efficiency ($\eta_{inv}$) and mechanical reduction efficiency ($\eta_{red}$) shall be tracked cleanly without double-counting. |
| **KIN-PWT-013** | Regenerative braking mode shall compute electrical energy returned to the battery bounded by motor generator envelope, BMS charge acceptance ($I_{chg,max}$, reduced near $\text{SOC} > 0.95$), and tire friction limits. |

## 3. Reference EV Parameters (SI Baseline)

| Subsystem | Parameter | Single-Motor (`EV-FWD`/`EV-RWD`) | Dual-Motor (`EV-DUAL-AWD`) |
| :--- | :--- | :---: | :---: |
| **Battery Pack** | Energy Capacity | $230.4\text{ MJ}$ ($64.0\text{ kWh}$) | $278.64\text{ MJ}$ ($77.4\text{ kWh}$) |
| | Nominal Open-Circuit Voltage | $400\text{ V}$ ($350\text{--}420\text{ V}$ SOC curve) | $400\text{ V}$ (configurable up to $800\text{ V}$) |
| | Internal Resistance ($R_{int}$) | $0.065\;\Omega$ | $0.055\;\Omega$ |
| | Max Discharge Power | $165,000\text{ W}$ ($165\text{ kW}$) | $240,000\text{ W}$ ($240\text{ kW}$) |
| **Inverter** | Efficiency ($\eta_{inv}$) | `0.96` nominal ($0.93$–$0.98$ load-dep) | `0.96` front, `0.96` rear |
| **Motor(s)** | Peak Torque ($T_{max}$) | `310 N·m` (`0`–`4620 RPM` base*) | Front `200 N·m`, Rear `310 N·m` |
| | Peak Mechanical Power | `150,000 W` (`150 kW`) | Front `110 kW`, Rear `150 kW` (capped at battery limit) |
| | Max Speed ($\text{RPM}_{max}$) | `14,000 RPM` ($1466.08\text{ rad/s}$) | `14,000 RPM` |
| | Reference Efficiency ($\eta_{motor}$) | `0.94` nominal (2D map `0.80`–`0.96`) | `0.94` nominal (2D map) |
| **Reduction** | Fixed Ratio ($G_{red}$) | `8.65` | Front `8.90`, Rear `8.65` |

*\*Note on Base Speed:* At $T_{max} = 310\text{ N}\cdot\text{m}$ and $P_{max} = 150,000\text{ W}$, $\omega_{base} = P_{max} / T_{max} = 150,000 / 310 = 483.87\text{ rad/s} \approx 4,620.6\text{ RPM}$. Above $\omega_{base}$, peak motor torque tapers hyperbolically as $T_{env}(\omega) = P_{max}/\omega$ (field-weakening region) up to $\text{RPM}_{max}$.

## 4. Core EV Equations

### 4.1 Motor Mechanical Envelope (`eq.ev.motor-envelope`)
$$T_{motor,max}(\omega) = \begin{cases} T_{peak}, & |\omega| \le \omega_{base} \\ \dfrac{P_{peak}}{|\omega|}, & \omega_{base} < |\omega| \le \omega_{max} \\ 0, & |\omega| > \omega_{max} \end{cases}$$

### 4.2 Electrical Power, Efficiency & Battery Current (`eq.ev.electrical-power`, `eq.ev.motor-efficiency`)
- **Motoring ($T \cdot \omega > 0$):**
  $$P_{mech} = T_{motor} \omega_{motor}, \qquad \eta_{motor} = \frac{P_{mech}}{P_{elec,ac}}, \qquad P_{dc,bus} = \frac{P_{mech}}{\eta_{motor} \cdot \eta_{inv}}$$
- **Regenerative Braking ($T_{regen} < 0, \omega > 0$):**
  $$P_{dc,regen} = |T_{regen} \omega_{motor}| \cdot \eta_{motor} \cdot \eta_{inv} \le P_{bms,chg\_cap}(\text{SOC})$$
- **Battery Terminal Voltage & Current (`eq.ev.electrical-power`):**
  $$P_{batt} = V_{term} \cdot I_{batt}, \qquad V_{term} = V_{oc}(\text{SOC}) - I_{batt} R_{int}$$
  Solving the quadratic relation ($P_{batt} = V_{oc}I - I^2 R_{int}$) for discharge current yields real current only when $P_{batt} \le \frac{V_{oc}^2}{4 R_{int}}$; otherwise BMS power limit clamps cleanly.
- **State of Charge Update (`eq.ev.energy-consumption`):**
  $$\text{SOC}(t + \Delta t) = \text{SOC}(t) - \frac{P_{batt,internal} \cdot \Delta t}{E_{pack,J}}$$
  where $P_{batt,internal} = V_{oc}(\text{SOC}) \cdot I_{batt}$ (accounting for $I^2 R_{int}$ battery Joule heat!).

## 5. PMSM vs. Induction Motor Educational Comparison

| Characteristic | PMSM (Primary Reference) | Induction Motor (Reference Variant) |
| :--- | :--- | :--- |
| **Rotor Magnetic Field** | Permanent magnets embedded in rotor | Induced rotor currents via stator slip |
| **Low/Mid Load Efficiency** | Very high (minimal rotor copper loss) | Slightly lower under heavy slip; high at steady light load |
| **Coasting / Zero-Torque Drag** | Produces back-EMF cogging/iron loss unless mechanically decoupled | Zero magnetic field when inverter disabled (zero coast drag) |
| **V1 Simulation Model** | Parameterized $(T(\omega), \eta(\omega, T))$ map | Parameterized $(T(\omega), \eta(\omega, T))$ map with optional zero-coast drag flag |

## 6. Verification Example

At $\text{RPM} = 3000\text{ RPM}$ ($\omega = 314.1593\text{ rad/s}$), $T_{motor} = 310\text{ N}\cdot\text{m}$, $\eta_{motor} = 0.94$, $\eta_{inv} = 0.96$, $V_{term} \approx 400\text{ V}$:
- $P_{mech} = 310 \times 314.1593 = 97,389.4\text{ W}$ ($97.39\text{ kW}$)
- $P_{dc,bus} = \frac{97,389.4}{0.94 \times 0.96} = 107,922.6\text{ W}$ ($107.92\text{ kW}$)
- $I_{batt} \approx \frac{107,922.6}{400} = 269.81\text{ A}$

## 7. Cross-References

- [`../02-vehicle-architecture/EV_ARCHITECTURE.md`](../02-vehicle-architecture/EV_ARCHITECTURE.md)
- [`TRANSMISSION_MODEL.md`](TRANSMISSION_MODEL.md)
- [`DRIVETRAIN_EFFICIENCY_MODEL.md`](DRIVETRAIN_EFFICIENCY_MODEL.md)
