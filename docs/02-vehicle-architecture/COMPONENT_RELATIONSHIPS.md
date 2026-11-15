# Component Relationships — KINERA

**Document ID:** `KIN-DOC-02-08`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the typed `ComponentRelationship` graph linking physical components across mechanical, electrical, structural, hydraulic, and control domains (`KIN-VEH-024`), ensuring Vehicle Anatomy relationship click-through and Powertrain Journey highlight logic remain strictly consistent.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-VEH-024** | Every component relationship shall specify `sourceId`, `targetId`, `relationshipType`, `configurations` scope, and directional input/output quantities using immutable canonical IDs. |

## 3. Relationship Types

- `mechanical_drive`: Torque and rotational speed transfer (gears, splines, shafts).
- `structural_mount`: Static/elastic load support (subframes, mounts, housings).
- `electrical_hv_dc`: High-voltage DC bus energy transfer.
- `electrical_ac_phase`: Variable-frequency 3-phase AC motor drive / regen.
- `control_signal`: Low-voltage command/telemetry link (e.g., BMS -> Inverter, ABS -> Modulator).
- `hydraulic_pressure`: Brake master cylinder / caliper actuation fluid path.
- `tire_road_contact`: Longitudinal & lateral friction reaction at ground patch.

## 4. Canonical Relationship Chains by Architecture

### 4.1 ICE Propulsion Core (Shared Upstream)
- `ice.engine.piston` --(`mechanical_drive`)--> `ice.engine.connecting-rod`
- `ice.engine.connecting-rod` --(`mechanical_drive`)--> `ice.engine.crankshaft`
- `ice.engine.crankshaft` --(`mechanical_drive`)--> `ice.clutch.flywheel`
- `ice.clutch.flywheel` --(`mechanical_drive`)--> `ice.clutch.disc-pressure-plate`

### 4.2 Configuration-Specific Downstream Chains
- **`ICE-FWD`:** `ice.clutch.disc-pressure-plate` -> `ice.transmission.transaxle` -> `drivetrain.fwd.front-differential` -> `drivetrain.common.cv-joint` -> `drivetrain.common.axle-shaft-front-left` / `right` -> `vehicle.wheel.hub-bearing` -> `vehicle.wheel.tire` -> `vehicle.wheel.contact-patch` (`vehicle.axle.front`).
- **`ICE-RWD`:** `ice.clutch.disc-pressure-plate` -> `ice.transmission.manual.gear-set` -> `drivetrain.common.universal-joint` -> `drivetrain.common.driveshaft-main` -> `drivetrain.rwd.rear-differential` -> `drivetrain.common.axle-shaft-rear-left` / `right` -> `vehicle.wheel.hub-bearing` -> `vehicle.wheel.tire` -> `vehicle.wheel.contact-patch` (`vehicle.axle.rear`).
- **`ICE-AWD`:** `ice.clutch.disc-pressure-plate` -> `ice.transmission.manual.gear-set` -> `drivetrain.awd.center-differential` -> (`driveshaft-front` -> `drivetrain.awd.front-differential` -> front axles; AND `driveshaft-rear` -> `drivetrain.awd.rear-differential` -> rear axles).
- **`ICE-4WD`:** `ice.clutch.disc-pressure-plate` -> `ice.transmission.manual.gear-set` -> `drivetrain.4wd.transfer-case` -> (`driveshaft-front` [when 4H/4L] -> `drivetrain.4wd.front-differential`; AND `driveshaft-rear` -> `drivetrain.4wd.rear-differential`).
- **`EV-FWD` / `EV-RWD`:** `ev.battery.pack` --(`electrical_hv_dc`)--> `ev.hv.pdu-cabling` --(`electrical_hv_dc`)--> `ev.inverter.*` --(`electrical_ac_phase`)--> `ev.motor.*` --(`mechanical_drive`)--> `ev.transmission.reduction-gearbox-*` -> `drivetrain.ev.*-differential` -> axle shafts -> hubs/tires.
- **`EV-DUAL-AWD`:** `ev.battery.pack` -> `ev.hv.pdu-cabling` branches electrically to BOTH `ev.inverter.front` -> `ev.motor.front` -> `reduction-gearbox-front` -> `ev.front-differential` AND `ev.inverter.rear` -> `ev.motor.rear` -> `reduction-gearbox-rear` -> `ev.rear-differential`.

### 4.3 Chassis, Suspension, Steering & Braking Relationships
- `vehicle.structure.front-subframe` --(`structural_mount`)--> `vehicle.suspension.front-control-arm`, `vehicle.steering.rack-pinion`.
- `vehicle.steering.column-wheel` --(`mechanical_drive`)--> `vehicle.steering.rack-pinion` -> `vehicle.steering.tie-rod` -> Front Knuckle/Hub (`vehicle.wheel.hub-bearing`).
- `vehicle.braking.master-cylinder` --(`hydraulic_pressure`)--> `vehicle.braking.abs-modulator` -> `vehicle.braking.hydraulic-lines` -> `vehicle.braking.caliper` -> `vehicle.braking.pads` -> `vehicle.braking.disc-rotor` -> `vehicle.wheel.hub-bearing`.

## 5. Cross-References

- [`COMPONENT_ANATOMY_SPECIFICATION.md`](COMPONENT_ANATOMY_SPECIFICATION.md)
- [`../07-data-and-contracts/COMPONENT_SCHEMA.md`](../07-data-and-contracts/COMPONENT_SCHEMA.md)
- [`../08-3d-and-visualization/ASSEMBLY_HIERARCHY.md`](../08-3d-and-visualization/ASSEMBLY_HIERARCHY.md)
