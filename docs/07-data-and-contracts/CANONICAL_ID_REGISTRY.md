# Canonical ID Registry — KINERA

**Document ID:** `KIN-DOC-07-02`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the formal grammar, lifecycle, immutability, deprecation rules, and authoritative registry of all canonical identifiers across **KINERA** (`KIN-DATA-006`–`KIN-DATA-009`).

## 2. Grammar & Validation Rules (`KIN-DATA-006` – `KIN-DATA-009`)

| Req ID | Rule |
| :--- | :--- |
| **KIN-DATA-006** | Every canonical ID shall match the regex `^[a-z][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*){2,4}$` (3 to 5 dot-separated lowercase alphanumeric/kebab-case segments). |
| **KIN-DATA-007** | Display names (`"2.0L Inline-4"`, `"Rear Differential"`) shall never act as foreign keys or identifiers; all lookups must resolve strictly by canonical ID. |
| **KIN-DATA-008** | Canonical IDs are globally unique across all registries and immutable once published; obsolete IDs must move to `deprecatedAliases` rather than being silently renamed or deleted. |
| **KIN-DATA-009** | Every foreign-key canonical ID reference in configs, components, scenarios, animations, and content modules must resolve cleanly to a registered ID. |

## 3. Allowed Top-Level Domain Prefixes

`vehicle`, `ice`, `ev`, `drivetrain`, `subsystem`, `sim`, `eq`, `concept`, `insight`, `library`, `anim`, `asset`, `ref`.

## 4. Authoritative Canonical ID Registry

### 4.1 Vehicle Configurations (`vehicle.config.*`)
- `vehicle.config.ice-fwd` (`ICE-FWD`)
- `vehicle.config.ice-rwd` (`ICE-RWD`)
- `vehicle.config.ice-awd` (`ICE-AWD`)
- `vehicle.config.ice-4wd` (`ICE-4WD`)
- `vehicle.config.ev-fwd` (`EV-FWD`)
- `vehicle.config.ev-rwd` (`EV-RWD`)
- `vehicle.config.ev-dual-awd` (`EV-DUAL-AWD`)

### 4.2 Vehicle Platforms, Subsystems & Axles
- `vehicle.platform.passenger-reference`, `vehicle.platform.utility-4wd-reference`
- `vehicle.axle.front`, `vehicle.axle.rear`
- `subsystem.vehicle.structure`, `subsystem.ice.powerplant`, `subsystem.ice.fuel-intake-exhaust`, `subsystem.ice.cooling-lubrication`, `subsystem.ev.energy-storage`, `subsystem.ev.power-electronics`, `subsystem.ev.electric-drive`, `subsystem.transmission.gearbox`, `subsystem.drivetrain.power-transfer`, `subsystem.chassis.suspension`, `subsystem.chassis.steering`, `subsystem.chassis.braking`, `subsystem.chassis.wheels-tires`

### 4.3 Components — Vehicle Structure, Suspension, Steering, Braking & Wheels
- `vehicle.structure.unibody`, `vehicle.structure.ladder-frame`, `vehicle.structure.front-subframe`, `vehicle.structure.rear-subframe`, `vehicle.structure.powertrain-mounts`
- `vehicle.suspension.front-control-arm`, `vehicle.suspension.rear-control-arm`, `vehicle.suspension.coil-spring`, `vehicle.suspension.damper`, `vehicle.suspension.anti-roll-bar`
- `vehicle.steering.column-wheel`, `vehicle.steering.rack-pinion`, `vehicle.steering.tie-rod`
- `vehicle.braking.master-cylinder`, `vehicle.braking.abs-modulator`, `vehicle.braking.hydraulic-lines`, `vehicle.braking.caliper`, `vehicle.braking.pads`, `vehicle.braking.disc-rotor`
- `vehicle.wheel.rim`, `vehicle.wheel.hub-bearing`, `vehicle.wheel.tire`, `vehicle.wheel.contact-patch`

### 4.4 Components — ICE Powerplant, Clutch & Transmissions
- `ice.engine.assembly`, `ice.engine.block`, `ice.engine.cylinder-head`, `ice.engine.piston`, `ice.engine.connecting-rod`, `ice.engine.crankshaft`, `ice.engine.valvetrain`
- `ice.intake.manifold`, `ice.fuel.delivery-system`, `ice.exhaust.manifold-system`, `ice.cooling.radiator-loop`, `ice.lubrication.oil-circuit`
- `ice.clutch.flywheel`, `ice.clutch.disc-pressure-plate`
- `ice.transmission.manual.gear-set`, `ice.transmission.transaxle`, `ice.transmission.automatic-conceptual`

### 4.5 Components — EV Electrical & Electric Drive
- `ev.battery.pack`, `ev.battery.enclosure`, `ev.battery.cell-module`, `ev.bms.controller`, `ev.hv.pdu-cabling`, `ev.thermal.battery-motor-loop`
- `ev.inverter.front`, `ev.inverter.rear`
- `ev.motor.pmsm`, `ev.motor.induction`, `ev.motor.front`, `ev.motor.rear`
- `ev.transmission.reduction-gearbox-front`, `ev.transmission.reduction-gearbox-rear`

### 4.6 Components — Drivetrain Shafts, Joints & Differentials
- `drivetrain.common.driveshaft-main`, `drivetrain.common.driveshaft-front`, `drivetrain.common.driveshaft-rear`, `drivetrain.common.universal-joint`, `drivetrain.common.cv-joint`
- `drivetrain.common.axle-shaft-front-left`, `drivetrain.common.axle-shaft-front-right`, `drivetrain.common.axle-shaft-rear-left`, `drivetrain.common.axle-shaft-rear-right`
- `drivetrain.fwd.front-differential`, `drivetrain.rwd.rear-differential`
- `drivetrain.awd.center-differential`, `drivetrain.awd.front-differential`, `drivetrain.awd.rear-differential`
- `drivetrain.4wd.transfer-case`, `drivetrain.4wd.front-differential`, `drivetrain.4wd.rear-differential`
- `drivetrain.ev.front-differential`, `drivetrain.ev.rear-differential`

### 4.7 Dynamics Models (`vehicle.dynamics.*`) & Parameter Models
- `vehicle.dynamics.longitudinal`, `vehicle.dynamics.lateral`, `vehicle.dynamics.braking`, `vehicle.dynamics.weight-transfer`, `vehicle.dynamics.tire-traction`
- `ice.engine.model-i4-2000cc`, `ev.motor.model-pmsm-150kw`, `ev.motor.model-pmsm-110kw`, `ev.motor.model-induction-ref`

### 4.8 Canonical Equations (`eq.*`)
- `eq.powertrain.angular-velocity`, `eq.powertrain.mechanical-power`, `eq.powertrain.ice-displacement`, `eq.powertrain.ice-torque-output`, `eq.powertrain.gearbox-torque`, `eq.powertrain.wheel-rpm`, `eq.powertrain.tractive-force`, `eq.powertrain.open-diff`, `eq.powertrain.lsd-diff`, `eq.powertrain.locked-diff`
- `eq.ev.motor-envelope`, `eq.ev.electrical-power`, `eq.ev.motor-efficiency`, `eq.ev.energy-consumption`
- `eq.dynamics.longitudinal-net-force`, `eq.dynamics.longitudinal-accel`, `eq.dynamics.aero-drag`, `eq.dynamics.rolling-resistance`, `eq.dynamics.grade-resistance`, `eq.dynamics.bicycle-lateral`, `eq.dynamics.bicycle-yaw`, `eq.dynamics.tire-linear-lateral`, `eq.dynamics.understeer-gradient`, `eq.dynamics.braking-force`, `eq.dynamics.stopping-distance`, `eq.dynamics.weight-transfer-longitudinal`, `eq.dynamics.weight-transfer-lateral`, `eq.dynamics.friction-limit`, `eq.dynamics.friction-circle`

### 4.9 Simulation Scenarios, 3D Assets, Animations, Insights, Library & References
Defined and enumerated explicitly in [`SIMULATION_CONTRACTS.md`](SIMULATION_CONTRACTS.md), [`../08-3d-and-visualization/3D_ASSET_SPECIFICATION.md`](../08-3d-and-visualization/3D_ASSET_SPECIFICATION.md), [`../08-3d-and-visualization/ANIMATION_SYSTEM.md`](../08-3d-and-visualization/ANIMATION_SYSTEM.md), [`../09-learning-and-content/ENGINEERING_INSIGHTS_CURRICULUM.md`](../09-learning-and-content/ENGINEERING_INSIGHTS_CURRICULUM.md), [`../09-learning-and-content/TECHNICAL_LIBRARY_STRUCTURE.md`](../09-learning-and-content/TECHNICAL_LIBRARY_STRUCTURE.md), and [`../09-learning-and-content/TECHNICAL_REFERENCE_POLICY.md`](../09-learning-and-content/TECHNICAL_REFERENCE_POLICY.md), all conforming to the same `3–5` segment canonical ID grammar.

## 5. Cross-References

- [`DATA_MODEL.md`](DATA_MODEL.md)
- [`DATA_VERSIONING.md`](DATA_VERSIONING.md)
- [`../12-project-governance/DOCUMENTATION_AUDIT_REPORT.md`](../12-project-governance/DOCUMENTATION_AUDIT_REPORT.md)
