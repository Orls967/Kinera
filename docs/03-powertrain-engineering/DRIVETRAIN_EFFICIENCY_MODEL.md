# Drivetrain Efficiency Model — KINERA

**Document ID:** `KIN-DOC-03-06`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines stage-by-stage mechanical and electrical efficiency loss accounting across all seven vehicle topologies (`KIN-PWT-022`–`KIN-PWT-024`), explicitly preventing efficiency double-counting and guaranteeing strict power balance $P_{in} = P_{out} + P_{loss}$.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-PWT-022** | Every mechanical/electrical stage in a configuration's power-flow path shall apply its own stage efficiency strictly once (or expose a single user-override aggregate $\eta_{total}$ that disables sub-stage factors when active). |
| **KIN-PWT-023** | Powertrain simulation outputs shall report per-stage losses ($\text{W}$) and cumulative powertrain efficiency ($\eta_{total} = P_{wheels}/P_{source\_output}$). |
| **KIN-PWT-024** | Baseline default efficiencies shall reflect realistic architectural differences across FWD transaxles, RWD hypoid differentials, AWD multi-axle drivetrains, 4WD transfer cases, and EV e-axles. |

## 3. Canonical Stage Efficiency Defaults (Nominal V1 Reference)

| Stage | Applicable Configurations | Default $\eta$ | Physical Loss Source |
| :--- | :--- | :---: | :--- |
| Manual Gearbox ($\eta_{trans}$) | All `ICE-*` | `0.95`–`0.965` (gear-dep) | Gear mesh friction, oil churning, bearing drag |
| Driveshaft / U-Joints ($\eta_{shaft}$) | `ICE-RWD`, `ICE-AWD`, `ICE-4WD` | `0.97` | Universal/center bearing articulation losses |
| Center Diff / Coupling ($\eta_{cd}$) | `ICE-AWD` | `0.96` | Planetary/viscous shear & seal drag |
| Transfer Case ($\eta_{tc}$) | `ICE-4WD` (`2H`/`4H`/`4L`) | `0.97` (`2H`/`4H`), `0.93` (`4L`) | Chain/gear mesh & oil splash (`4L` double reduction) |
| Front Transaxle Final Drive ($\eta_{fd,helical}$) | `ICE-FWD` | `0.96` | Parallel helical final gearset + open diff |
| Hypoid Axle Final Drive ($\eta_{fd,hypoid}$) | `ICE-RWD`, `ICE-AWD`, `ICE-4WD` | `0.955` | $90^\circ$ hypoid bevel sliding friction + bearings |
| CV Half-Shaft Joints ($\eta_{cv}$) | All 7 (per active axle) | `0.99` | Boot seal & ball-track rolling friction |
| EV Inverter ($\eta_{inv}$) | `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD` | `0.96` (load-map) | MOSFET/IGBT switching & conduction losses |
| EV Motor ($\eta_{motor}$) | `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD` | `0.94` nominal (2D map) | Stator copper ($I^2 R$), core iron, windage |
| EV Reduction + Diff ($\eta_{ev\_mech}$) | `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD` | `0.95` | Helical dual-stage gearset + differential |

## 4. Resulting Cumulative Efficiency Summary (Default Baseline, 4th Gear / Cruise)

| Configuration | Active Multiplicative Mechanical Chain ($\eta_{mech\_total}$) | Cumulative Mech Efficiency | EV Electrical Chain ($\eta_{inv} \cdot \eta_{motor}$) |
| :--- | :--- | :---: | :---: |
| `ICE-FWD` | $\eta_{trans} \cdot \eta_{fd,helical} \cdot \eta_{cv}$ ($0.965 \times 0.96 \times 0.99$) | **`0.917`** | N/A |
| `ICE-RWD` | $\eta_{trans} \cdot \eta_{shaft} \cdot \eta_{fd,hypoid} \cdot \eta_{cv}$ ($0.965 \times 0.97 \times 0.955 \times 0.99$) | **`0.885`** | N/A |
| `ICE-AWD` | $\eta_{trans} \cdot \eta_{cd} \cdot \eta_{shaft} \cdot \eta_{fd,hypoid} \cdot \eta_{cv}$ | **`0.849`** | N/A |
| `ICE-4WD` (`2H`) | $\eta_{trans} \cdot \eta_{tc,2H} \cdot \eta_{shaft} \cdot \eta_{fd,hypoid} \cdot \eta_{cv}$ | **`0.858`** | N/A |
| `ICE-4WD` (`4L`) | $\eta_{trans} \cdot \eta_{tc,4L} \cdot \eta_{shaft} \cdot \eta_{fd,hypoid} \cdot \eta_{cv}$ | **`0.823`** | N/A |
| `EV-FWD` / `EV-RWD` | $\eta_{ev\_mech} \cdot \eta_{cv}$ ($0.95 \times 0.99$) | **`0.941`** | $\approx 0.902$ ($\eta_{total} \approx 0.849$ batt-to-wheel) |
| `EV-DUAL-AWD` | Independent per active axle ($\eta_{ev\_mech} \cdot \eta_{cv}$) | **`0.941`** (per loaded path) | $\approx 0.902$ (when both motors loaded efficiently) |

## 5. Anti-Double-Counting Rule

When a user switches the Powertrain Simulator into **"Custom Aggregate Drivetrain Efficiency Override"** ($\eta_{override}$), the engine assigns $\eta_{override}$ cleanly to the aggregate drivetrain path and forces individual downstream mechanical stage multipliers to `1.0` internally so stage losses are never applied twice.

## 6. Cross-References

- [`TRANSMISSION_MODEL.md`](TRANSMISSION_MODEL.md)
- [`../02-vehicle-architecture/POWER_FLOW_TOPOLOGY.md`](../02-vehicle-architecture/POWER_FLOW_TOPOLOGY.md)
- [`../05-simulation-engine/POWERTRAIN_SIMULATION_SPECIFICATION.md`](../05-simulation-engine/POWERTRAIN_SIMULATION_SPECIFICATION.md)
