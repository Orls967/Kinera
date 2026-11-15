# ICE Engine Model — KINERA

**Document ID:** `KIN-DOC-03-02`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Specifies the mathematical, geometric, and thermodynamic-conceptual model of KINERA's reference Internal Combustion Engine (`KIN-PWT-005`–`KIN-PWT-008`), grounding engine torque/power curves and 4-stroke visualization in verifiable engineering principles.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-PWT-005** | KINERA V1 shall implement a reference naturally aspirated inline-four four-stroke spark-ignition gasoline engine (`EngineModel`). |
| **KIN-PWT-006** | The ICE model shall expose displacement, bore, stroke, cylinder count, compression ratio, volumetric efficiency concept, RPM bounds, full-load torque curve, and derived mechanical power. |
| **KIN-PWT-007** | Powertrain Journey and Vehicle Anatomy shall animate the four-stroke cycle (Intake, Compression, Power, Exhaust) with synchronized piston motion, connecting rod articulation, crankshaft rotation, valve state, and ignition spark cue. |
| **KIN-PWT-008** | The model shall explicitly declare that it uses a steady-state lookup/interpolated torque curve rather than transient 1D gas-dynamics or chemical combustion kinetics. |

## 3. Reference Engine Geometric & Operating Parameters

| Parameter | Symbol | Default Value (SI) | Engineering Display | Notes |
| :--- | :---: | :---: | :---: | :--- |
| Configuration | — | Inline-4, 4-Stroke NA | 2.0 L NA I4 | Spark-ignition gasoline |
| Cylinders | $N_{cyl}$ | `4` | 4 cylinders | Firing order `1-3-4-2` |
| Bore | $B$ | `0.086 m` | `86.0 mm` | Square bore/stroke geometry |
| Stroke | $S$ | `0.086 m` | `86.0 mm` | Crank throw $r_c = S/2 = 0.043\text{ m}$ |
| Swept Displacement | $V_d$ | `0.001998 m^3` | `1.998 L` (`1998 cc`) | Computed via `eq.powertrain.ice-displacement` |
| Compression Ratio | $r_c$ | `10.5` | `10.5 : 1` | Educational indicator for thermal efficiency context |
| Idle / Redline RPM | $\text{RPM}_{idle} / \text{RPM}_{max}$ | `800` / `6800 RPM` | $83.78$ / $712.10\text{ rad/s}$ | Hard fuel-cut above redline ($T \to 0$) |
| Peak Torque | $T_{peak}$ | `205 N·m` | `205 N·m @ 4400 RPM` | Midrange volumetric efficiency peak ($\eta_v \approx 0.92$) |
| Peak Power | $P_{peak}$ | `117,956 W` | `118.0 kW @ 6400 RPM` | $176\text{ N}\cdot\text{m}$ at $6400\text{ RPM}$ |
| Thermal/Mech Reference | $\eta_{brake}$ | `~0.34 peak` | `34%` peak BTE (edu ref) | Used conceptually to contextualize fuel energy vs. shaft work |

## 4. Mathematical Equations & Torque Curve

### 4.1 Geometric Displacement (`eq.powertrain.ice-displacement`)
$$V_d = \frac{\pi}{4} B^2 S N_{cyl} \quad [\text{m}^3]$$
- **Verification:** $\frac{\pi}{4}(0.086)^2(0.086)(4) = 0.00199824\text{ m}^3 = 1.998\text{ L}$.

### 4.2 Torque Interpolation & Throttle Modulation (`eq.powertrain.ice-torque-output`)
Piecewise-cubic / linear-clamped full-load torque curve $T_{WOT}(\text{RPM})$ defined at canonical breakpoints:

| RPM | 800 | 1500 | 2500 | 3500 | 4400 | 5500 | 6400 | 6800 | >6800 (Cut) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **$T_{WOT}$ ($\text{N}\cdot\text{m}$)** | 135 | 158 | 182 | 198 | **205** | 194 | 176 | 162 | 0 |
| **$P_{WOT}$ ($\text{kW}$)** | 11.31 | 24.82 | 47.65 | 72.57 | 94.46 | 111.74 | **117.96** | 115.36 | 0 |

For throttle command $u_{th} \in [0, 1]$ and active speed $\omega_{eng}$:
$$T_{eng}(\text{RPM}, u_{th}) = u_{th} \cdot T_{WOT}(\text{RPM}) - (1 - u_{th}) \cdot T_{friction}(\text{RPM})$$
where $T_{friction}(\text{RPM}) \ge 0$ models pumping/engine-braking drag when throttle closes (capped to avoid unphysical reverse propulsion when stationary). During full-throttle acceleration sweeps ($u_{th}=1.0$), $T_{eng} = T_{WOT}(\text{RPM})$.

### 4.3 Four-Stroke Cycle Kinematics (Journey Visualization)
Across $720^\circ$ ($4\pi\text{ rad}$) crankshaft cycle per cylinder (with phase offsets $0^\circ, 180^\circ, 540^\circ, 360^\circ$ for `1-3-4-2`):
- **Intake ($0^\circ$–$180^\circ$):** Intake valve open, piston descending, air-fuel charge drawn in.
- **Compression ($180^\circ$–$360^\circ$):** Valves closed, piston rising, pressure/temperature rise.
- **Power / Expansion ($360^\circ$–$540^\circ$):** Spark ignition near TDC ($360^\circ$), high-pressure gas drives piston downward generating positive crank torque.
- **Exhaust ($540^\circ$–$720^\circ$):** Exhaust valve open, piston rising, spent gases expelled.

## 5. Assumptions, Edge Cases & Validation

- **Assumptions:** Standard sea-level ambient air ($101.325\text{ kPa}$, $298\text{ K}$), steady-state torque map (no intake acoustic resonance delay or coolant cold-start enrichment).
- **Edge Cases:** Below $\text{RPM}_{idle}$, clutch-slip launch blending smoothly caps minimum torque delivery to prevent zero-RPM divide-by-zero; above $\text{RPM}_{max}$, rev-limiter cuts $T_{eng} \to 0$.
- **Validation:** Power at $4400\text{ RPM}$ must equal $205 \times \frac{2\pi(4400)}{60} = 94,457.2\text{ W} \pm 0.01\text{ W}$; peak power at $6400\text{ RPM}$ must equal $117,956.3\text{ W}$.

## 6. Cross-References

- [`POWERTRAIN_ENGINEERING_OVERVIEW.md`](POWERTRAIN_ENGINEERING_OVERVIEW.md)
- [`TRANSMISSION_MODEL.md`](TRANSMISSION_MODEL.md)
- [`../05-simulation-engine/POWERTRAIN_SIMULATION_SPECIFICATION.md`](../05-simulation-engine/POWERTRAIN_SIMULATION_SPECIFICATION.md)
