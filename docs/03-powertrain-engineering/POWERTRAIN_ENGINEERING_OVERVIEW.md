# Powertrain Engineering Overview — KINERA

**Document ID:** `KIN-DOC-03-01`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Establishes KINERA's unified powertrain engineering model separating prime-mover physics (ICE and EV) from configuration-specific transmission, differential, and efficiency routing (`KIN-PWT-001`–`KIN-PWT-004`).

## 2. Core Principles & Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-PWT-001** | Powertrain models shall maintain strict separation between energy source/prime mover (`EngineModel`, `ElectricMotorModel`), gear transformation (`TransmissionModel`), torque splitting (`DifferentialModel`), and chassis load interface (`TireModel`). |
| **KIN-PWT-002** | All powertrain states shall store rotational speed in $\text{rad/s}$ (converting from/to $\text{RPM}$ via `eq.powertrain.angular-velocity`), torque in $\text{N}\cdot\text{m}$, and power in $\text{W}$. |
| **KIN-PWT-003** | Models shall strictly distinguish prime-mover shaft torque, gearbox output torque, driveshaft torque, total driven-axle torque, and per-wheel torque. |
| **KIN-PWT-004** | Power conservation ($P_{out} = \eta P_{in}$) shall hold across every active stage without double-counting efficiencies or silently creating unmodeled torque. |

## 3. Unified Powertrain Mathematical Chain

1. **Rotational Kinematics (`eq.powertrain.angular-velocity`):**
   $$\omega = \frac{2\pi \cdot \text{RPM}}{60} \quad [\text{rad/s}]$$
2. **Mechanical Power (`eq.powertrain.mechanical-power`):**
   $$P = T \cdot \omega \quad [\text{W}]$$
3. **Stage Transformation:** Across any gear ratio $G_{stage}$ with stage mechanical efficiency $\eta_{stage} \in (0, 1]$:
   $$T_{out} = T_{in} \cdot G_{stage} \cdot \eta_{stage}, \qquad \omega_{out} = \frac{\omega_{in}}{G_{stage}}$$
4. **Axle-to-Tire Interface:** Total axle torque divides across left/right wheels per the active differential physics (`DIFFERENTIAL_MODEL.md`) and converts to tractive effort bounded by tire grip:
   $$F_{tractive,i} = \min\!\left(\frac{T_{wheel,i}}{r_{effective}}, \; F_{traction\_cap,i}\right)$$

## 4. Document Map (`03-powertrain-engineering/`)

- [`ICE_ENGINE_MODEL.md`](ICE_ENGINE_MODEL.md) — Reference 2.0 L NA Inline-4 four-stroke engine specification
- [`EV_POWERTRAIN_MODEL.md`](EV_POWERTRAIN_MODEL.md) — Battery, BMS, inverter, PMSM/Induction map, single-speed drive, regen
- [`TRANSMISSION_MODEL.md`](TRANSMISSION_MODEL.md) — Manual gearbox, transaxle, single-speed EV reduction, transfer case, conceptual AT
- [`DIFFERENTIAL_MODEL.md`](DIFFERENTIAL_MODEL.md) — Open, simplified LSD, locked, center differential, EV torque allocation
- [`DRIVETRAIN_EFFICIENCY_MODEL.md`](DRIVETRAIN_EFFICIENCY_MODEL.md) — Stage-by-stage loss accounting across all 7 topologies
- [`POWERTRAIN_JOURNEY_SPECIFICATION.md`](POWERTRAIN_JOURNEY_SPECIFICATION.md) — Interactive step sequences, animations, and telemetry overlays

## 5. Cross-References

- [`../02-vehicle-architecture/POWER_FLOW_TOPOLOGY.md`](../02-vehicle-architecture/POWER_FLOW_TOPOLOGY.md)
- [`../05-simulation-engine/POWERTRAIN_SIMULATION_SPECIFICATION.md`](../05-simulation-engine/POWERTRAIN_SIMULATION_SPECIFICATION.md)
- [`../09-learning-and-content/EQUATION_REFERENCE.md`](../09-learning-and-content/EQUATION_REFERENCE.md)
