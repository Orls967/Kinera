# 3D Assembly Hierarchy — KINERA

**Document ID:** `KIN-DOC-08-04`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines KINERA's modular, configuration-driven 3D scene graph (`KIN-3D-010`–`KIN-3D-011`) allowing all seven vehicle configurations to share common chassis/suspension/braking/wheel subassemblies while swapping only layout-specific propulsion and drivetrain mounts.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-3D-010** | The R3F `VehicleAssemblyRoot` shall dynamically compose modular subassemblies driven by `VehicleConfiguration.topology` and `componentIds`. |
| **KIN-3D-011** | Every subassembly node shall expose local/world transforms, explosion direction vectors, and visibility-layer tags (`structure`, `ice`, `ev`, `transmission`, `drivetrain`, `suspension`, `braking`, `wheels`). |

## 3. Unified Scene Graph Tree

```text
VehicleAssemblyRoot (origin: ground-plane center)
├── BodyShellGroup (transparency-controllable outer silhouette)
├── ChassisStructureGroup
│   ├── vehicle.structure.unibody OR vehicle.structure.ladder-frame
│   ├── vehicle.structure.front-subframe
│   └── vehicle.structure.rear-subframe
├── PropulsionMountGroup (resolved per config)
│   ├── [ICE-FWD]       Transverse I4 + ice.transmission.transaxle + drivetrain.fwd.front-differential
│   ├── [ICE-RWD]       Longitudinal I4 + gearbox + driveshaft-main + rwd.rear-differential
│   ├── [ICE-AWD]       Longitudinal I4 + gearbox + center-diff + front/rear shafts + diffs
│   ├── [ICE-4WD]       Longitudinal I4 + gearbox + transfer-case + front/rear shafts + diffs
│   ├── [EV-FWD]        ev.battery.pack + front inverter/motor/reduction/diff
│   ├── [EV-RWD]        ev.battery.pack + rear inverter/motor/reduction/diff
│   └── [EV-DUAL-AWD]   ev.battery.pack + front e-axle + rear e-axle
├── SuspensionSteeringGroup (FL, FR, RL, RR corner subassemblies + steering rack)
├── BrakingSystemGroup (master cylinder, lines, calipers, pads, rotors)
├── WheelTireGroup (4 instanced rim/tire hubs rotated dynamically + contact patch indicators)
└── PowerFlowOverlayGroup (spline tubes & directional pulse arrows bound to active DrivetrainPaths)
```

## 4. Cross-References

- [`3D_ASSET_SPECIFICATION.md`](3D_ASSET_SPECIFICATION.md)
- [`COMPONENT_INTERACTION_SPECIFICATION.md`](COMPONENT_INTERACTION_SPECIFICATION.md)
- [`../02-vehicle-architecture/VEHICLE_CONFIGURATION_SPECIFICATION.md`](../02-vehicle-architecture/VEHICLE_CONFIGURATION_SPECIFICATION.md)
