# Component Anatomy Specification — KINERA

**Document ID:** `KIN-DOC-02-07`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Catalogs every inspectable vehicle component across all seven canonical automotive systems for Vehicle Anatomy (`KIN-VEH-021`–`KIN-VEH-023`), defining subsystem membership, configuration availability, physical vs. logical classification, and metadata obligations.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-VEH-021** | Vehicle Anatomy shall represent all 7 vehicle systems from V1: Structure, ICE/Fuel, EV Electrical, Transmission/Drivetrain, Suspension/Steering, Braking, and Wheels/Tires. |
| **KIN-VEH-022** | Every component shall carry a canonical ID registered in `CANONICAL_ID_REGISTRY.md` and conform to `schemas/component.schema.json`. |
| **KIN-VEH-023** | Component records shall distinguish physical components, logical subsystems, assemblies, and per-configuration instances (e.g., front vs. rear inverter). |

## 3. Complete Component Inventory Across Seven Systems

### System 1 — Vehicle Structure (`subsystem.vehicle.structure`)
| Canonical ID | Name | Configs | Engineering Role |
| :--- | :--- | :--- | :--- |
| `vehicle.structure.unibody` | Unibody Monocoque Shell | `ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `EV-*` | Primary integrated structural body shell & floorpan |
| `vehicle.structure.ladder-frame` | Body-on-Frame Ladder Chassis | `ICE-4WD` | Rigid boxed steel frame rails carrying drivetrain & body |
| `vehicle.structure.front-subframe` | Front Subframe Cradle | All 7 | Isolates front suspension, steering rack & front powertrain mounts |
| `vehicle.structure.rear-subframe` | Rear Subframe Cradle | All 7 | Carries rear suspension links & rear diff / e-axle |
| `vehicle.structure.powertrain-mounts` | Engine / E-Axle Elastic Mounts | All 7 | Reacts powertrain torque & dampens NVH to chassis |

### System 2 — ICE & Fuel System (`subsystem.ice.powerplant`, `subsystem.ice.fuel-intake-exhaust`, `subsystem.ice.cooling-lubrication`)
| Canonical ID | Name | Configs | Engineering Role |
| :--- | :--- | :--- | :--- |
| `ice.engine.assembly` | 2.0L Inline-4 Gasoline Engine (Assembly) | `ICE-*` | Parent engine assembly |
| `ice.engine.block` | Engine Cylinder Block | `ICE-*` | Houses cylinders, water jackets, main bearing journals |
| `ice.engine.cylinder-head` | DOHC Cylinder Head | `ICE-*` | Houses intake/exhaust ports, combustion chambers, valves |
| `ice.engine.piston` | Piston Assembly | `ICE-*` | Converts gas combustion pressure into linear force |
| `ice.engine.connecting-rod` | Connecting Rod | `ICE-*` | Links reciprocating piston to rotating crankpin |
| `ice.engine.crankshaft` | Crankshaft | `ICE-*` | Converts reciprocating motion to rotary torque $T_{eng}$ |
| `ice.engine.valvetrain` | Camshaft & Valvetrain | `ICE-*` | Times intake/exhaust events across 4-stroke cycle |
| `ice.intake.manifold` | Intake Manifold & Throttle Body | `ICE-*` | Meters air mass flow into cylinders |
| `ice.fuel.delivery-system` | Fuel Tank, Pump & Injectors | `ICE-*` | Stores and injects fuel proportionally to air charge |
| `ice.exhaust.manifold-system` | Exhaust Manifold & Catalytic Pipe | `ICE-*` | Routes combustion gases and reduces emissions |
| `ice.cooling.radiator-loop` | Liquid Cooling Radiator & Water Pump | `ICE-*` | Rejects combustion waste heat to maintain thermal balance |
| `ice.lubrication.oil-circuit` | Oil Sump, Pump & Galleries | `ICE-*` | Pressurizes lubricating film across bearings & cylinder walls |

### System 3 — EV Electrical System (`subsystem.ev.energy-storage`, `subsystem.ev.power-electronics`, `subsystem.ev.electric-drive`)
| Canonical ID | Name | Configs | Engineering Role |
| :--- | :--- | :--- | :--- |
| `ev.battery.pack` | High-Voltage Traction Battery Pack | `EV-*` | Primary electrochemical DC energy storage |
| `ev.battery.enclosure` | Structural Battery Tray & Shield | `EV-*` | Crash/thermal protection & underbody stiffening |
| `ev.battery.cell-module` | Battery Cell Modules (Educational) | `EV-*` | Series/parallel cell banks building pack voltage & capacity |
| `ev.bms.controller` | Battery Management System (BMS) | `EV-*` | Monitors SOC, $V_{pack}$, $I$, thermal & regen limits |
| `ev.hv.pdu-cabling` | HV Junction Box & Bus Cabling | `EV-*` | Distributes HV DC to front/rear inverters safely |
| `ev.thermal.battery-motor-loop` | EV Liquid Thermal Loop | `EV-*` | Regulates battery, inverter, and stator temperatures |
| `ev.inverter.front` | Front Traction Inverter | `EV-FWD`, `EV-DUAL-AWD` | Converts HV DC <-> variable-frequency 3-phase AC |
| `ev.inverter.rear` | Rear Traction Inverter | `EV-RWD`, `EV-DUAL-AWD` | Converts HV DC <-> variable-frequency 3-phase AC |
| `ev.motor.pmsm` | Permanent Magnet Synchronous Motor (Type Ref) | `EV-*` | Reference high-efficiency traction motor architecture |
| `ev.motor.induction` | AC Induction Motor (Concept/Variant Ref) | `EV-DUAL-AWD` (doc variant) | Zero-back-EMF secondary/reference AC motor architecture |
| `ev.motor.front` | Front E-Axle Traction Motor | `EV-FWD`, `EV-DUAL-AWD` | Produces electromagnetic torque on front reduction input |
| `ev.motor.rear` | Rear E-Axle Traction Motor | `EV-RWD`, `EV-DUAL-AWD` | Produces electromagnetic torque on rear reduction input |

### System 4 — Transmission & Drivetrain (`subsystem.transmission.gearbox`, `subsystem.drivetrain.power-transfer`)
| Canonical ID | Name | Configs | Engineering Role |
| :--- | :--- | :--- | :--- |
| `ice.clutch.flywheel` | Engine Flywheel | `ICE-*` | Stores rotational inertia & mates crankshaft to clutch |
| `ice.clutch.disc-pressure-plate` | Friction Clutch Disc & Pressure Plate | `ICE-*` | Smoothly couples/decouples engine and gearbox input shaft |
| `ice.transmission.manual.gear-set` | 6-Speed Manual Gearbox | `ICE-RWD`, `ICE-AWD`, `ICE-4WD` | Selectable stepped gear ratios ($G_1..G_6, R$) |
| `ice.transmission.transaxle` | Integrated Front Transaxle | `ICE-FWD` | Combines manual gear-set and front differential |
| `ice.transmission.automatic-conceptual` | Automatic Transmission (Conceptual) | `ICE-*` (conceptual inspect) | Explains torque converter & planetary sets conceptually |
| `ev.transmission.reduction-gearbox-front` | Front Single-Speed Reduction Gearbox | `EV-FWD`, `EV-DUAL-AWD` | Fixed helical reduction stepping motor RPM down to axle |
| `ev.transmission.reduction-gearbox-rear` | Rear Single-Speed Reduction Gearbox | `EV-RWD`, `EV-DUAL-AWD` | Fixed helical reduction stepping motor RPM down to axle |
| `drivetrain.common.driveshaft-main` | Main Longitudinal Driveshaft | `ICE-RWD` | Transmits gearbox output rearward |
| `drivetrain.common.driveshaft-front` | Front Propeller Shaft | `ICE-AWD`, `ICE-4WD` | Transfers torque forward from center diff / transfer case |
| `drivetrain.common.driveshaft-rear` | Rear Propeller Shaft | `ICE-AWD`, `ICE-4WD` | Transfers torque rearward from center diff / transfer case |
| `drivetrain.common.universal-joint` | Universal Joint (U-Joint) | `ICE-RWD`, `ICE-AWD`, `ICE-4WD` | Accommodates driveshaft angular misalignment |
| `drivetrain.common.cv-joint` | Constant-Velocity (CV) Joint | All 7 | Smoothly transmits torque across steering/suspension angles |
| `drivetrain.fwd.front-differential` | ICE FWD Front Differential | `ICE-FWD` | Splits transaxle output torque between front half-shafts |
| `drivetrain.rwd.rear-differential` | ICE RWD Rear Differential | `ICE-RWD` | $90^\circ$ final drive + differential split to rear shafts |
| `drivetrain.awd.center-differential` | AWD Center Differential | `ICE-AWD` | Splits gearbox output between front and rear driveshafts |
| `drivetrain.awd.front-differential` | AWD Front Differential | `ICE-AWD` | Final drive & L/R split on AWD front axle |
| `drivetrain.awd.rear-differential` | AWD Rear Differential | `ICE-AWD` | Final drive & L/R split on AWD rear axle |
| `drivetrain.4wd.transfer-case` | 4WD Transfer Case (`2H`/`4H`/`4L`) | `ICE-4WD` | Selects rear/4-wheel drive & low-range reduction |
| `drivetrain.4wd.front-differential` | 4WD Front Differential | `ICE-4WD` | Heavy-duty front axle differential |
| `drivetrain.4wd.rear-differential` | 4WD Rear Differential | `ICE-4WD` | Heavy-duty rear axle differential |
| `drivetrain.ev.front-differential` | EV Front Differential | `EV-FWD`, `EV-DUAL-AWD` | Final reduction & L/R split inside front e-axle |
| `drivetrain.ev.rear-differential` | EV Rear Differential | `EV-RWD`, `EV-DUAL-AWD` | Final reduction & L/R split inside rear e-axle |
| `drivetrain.common.axle-shaft-front-left` | Front-Left Half-Shaft | All 7 (driven in FWD/AWD/4WD) | Transmits torque to front-left wheel hub |
| `drivetrain.common.axle-shaft-front-right` | Front-Right Half-Shaft | All 7 (driven in FWD/AWD/4WD) | Transmits torque to front-right wheel hub |
| `drivetrain.common.axle-shaft-rear-left` | Rear-Left Axle Shaft | `RWD`, `AWD`, `4WD`, `EV-DUAL` | Transmits torque to rear-left wheel hub |
| `drivetrain.common.axle-shaft-rear-right` | Rear-Right Axle Shaft | `RWD`, `AWD`, `4WD`, `EV-DUAL` | Transmits torque to rear-right wheel hub |

### Systems 5, 6, 7 — Suspension & Steering, Braking, Wheels & Tires
Covered in detail in [`SUSPENSION_AND_STEERING_SPECIFICATION.md`](SUSPENSION_AND_STEERING_SPECIFICATION.md), [`BRAKING_SYSTEM_SPECIFICATION.md`](BRAKING_SYSTEM_SPECIFICATION.md), and `CANONICAL_ID_REGISTRY.md` (`vehicle.suspension.*`, `vehicle.steering.*`, `vehicle.braking.*`, `vehicle.wheel.*`).

## 4. Cross-References

- [`COMPONENT_RELATIONSHIPS.md`](COMPONENT_RELATIONSHIPS.md)
- [`../07-data-and-contracts/COMPONENT_SCHEMA.md`](../07-data-and-contracts/COMPONENT_SCHEMA.md)
- [`../07-data-and-contracts/CANONICAL_ID_REGISTRY.md`](../07-data-and-contracts/CANONICAL_ID_REGISTRY.md)
