# Transmission Model — KINERA

**Document ID:** `KIN-DOC-03-04`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Specifies KINERA V1 mathematical and conceptual models for transmission and gear-reduction systems (`KIN-PWT-014`–`KIN-PWT-016`): manual gearbox, integrated transaxle, single-speed EV reduction, transfer case (`2H`/`4H`/`4L`), and conceptual automatic transmission boundaries.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-PWT-014** | Detailed V1 simulation shall support 6-speed manual transmissions (including Reverse & Neutral), integrated FWD transaxles, single-speed EV reduction gearboxes, and 4WD transfer-case range multipliers (`1.00` high, `2.48` low). |
| **KIN-PWT-015** | Torque multiplication and speed division shall preserve conservation of mechanical power ($P_{out} = \eta_{trans} P_{in}$). |
| **KIN-PWT-016** | Automatic transmissions (`ice.transmission.automatic-conceptual`) shall be documented for anatomy and concept learning only; V1 shall not claim hydrodynamic torque-converter or hydraulic shift-schedule transient simulation. |

## 3. Manual Gearbox & Transaxle Reference Ratios

| Gear | Ratio $G_k$ | Stage Efficiency $\eta_{trans,k}$ | Engineering Role |
| :---: | :---: | :---: | :--- |
| `1` | `3.62` | `0.95` | Maximum launch multiplication |
| `2` | `2.04` | `0.955` | Urban/corner acceleration |
| `3` | `1.38` | `0.96` | Midrange acceleration |
| `4` | `1.03` | `0.965` (direct/near-1:1) | Highest mechanical gear efficiency |
| `5` | `0.82` | `0.955` | Overdrive highway cruise |
| `6` | `0.69` | `0.95` | Low-RPM fuel-economy overdrive |
| `R` | `-3.45` | `0.93` | Reverse idler direction inversion |
| `N` | `0` (decoupled) | `—` | Zero torque transmitted ($T_{out} = 0$) |

### Core Transmission Equations (`eq.powertrain.gearbox-torque`, `eq.powertrain.wheel-rpm`)
$$T_{trans\_out} = T_{in} \cdot G_k \cdot \eta_{trans,k}, \qquad \omega_{trans\_out} = \frac{\omega_{in}}{G_k} \quad (G_k \ne 0)$$
For `ICE-FWD` transaxle, helical final drive reduction $F = 3.94$ operates inside the same transaxle housing immediately upstream of `drivetrain.fwd.front-differential`:
$$\text{RPM}_{wheel} = \frac{\text{RPM}_{in}}{|G_k| \cdot F}$$

## 4. Single-Speed EV Reduction Gearbox

Electric motors maintain usable torque from $0\text{ RPM}$ up to $>14,000\text{ RPM}$, eliminating multi-gear stepped shifting in baseline passenger EVs (`EV-FWD`, `EV-RWD`, `EV-DUAL-AWD`):
- **Reference Combined Reduction Ratio:** $G_{red} = 8.65$ (`EV-RWD`, `EV-FWD`, `EV-DUAL-AWD` rear) and $8.90$ (`EV-DUAL-AWD` front), typically realized as a two-stage helical gearset inside one compact housing ($\eta_{red} \approx 0.965$).
- **Kinematics:** $\omega_{axle\_diff} = \omega_{motor} / G_{red}$, $T_{axle\_total} = T_{motor} \cdot G_{red} \cdot \eta_{red}$. (Here $G_{red}$ already incorporates final drive gearing, so no second $F$ multiplier is applied!)

## 5. 4WD Transfer Case (`drivetrain.4wd.transfer-case`)

| Mode | Front Axle | Range Ratio $G_{tc}$ | Total Reduction (`1st` * `tc` * `F=4.10`) | Notes |
| :---: | :--- | :---: | :---: | :--- |
| `2H` | Disengaged | `1.00` | `14.84 : 1` | Rear-wheel drive on dry pavement |
| `4H` | Engaged | `1.00` | `14.84 : 1` | High-range 4WD; part-time locks F/R shafts |
| `4L` | Engaged | `2.48` | `36.81 : 1` | Low-range planetary crawling multiplication |

## 6. Conceptual Automatic Transmission Boundary

`ice.transmission.automatic-conceptual` explains hydrodynamic torque converter (impeller, turbine, stator torque multiplication at stall) and planetary epicyclic gearsets (`sun`, `planet carrier`, `ring gear`) visually inside Vehicle Anatomy and Engineering Insights. Simulation runs use explicit stepped manual/single-speed EV ratios.

## 7. Cross-References

- [`ICE_ENGINE_MODEL.md`](ICE_ENGINE_MODEL.md)
- [`EV_POWERTRAIN_MODEL.md`](EV_POWERTRAIN_MODEL.md)
- [`DIFFERENTIAL_MODEL.md`](DIFFERENTIAL_MODEL.md)
- [`DRIVETRAIN_EFFICIENCY_MODEL.md`](DRIVETRAIN_EFFICIENCY_MODEL.md)
