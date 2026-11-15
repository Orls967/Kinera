# Component Interaction Specification — KINERA

**Document ID:** `KIN-DOC-08-05`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Specifies interactive raycast selection, hover feedback, isolation, layer visibility toggles, housing transparency, power-flow overlay highlighting, and keyboard accessibility parity inside the 3D viewport (`KIN-3D-012`–`KIN-3D-015`).

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-3D-012** | Pointer hover and click raycasting shall identify the hovered/selected `canonicalId`, emit visual outline/emissive highlight (`#00E5FF`), and synchronize bidirectionally with the left hierarchy tree. |
| **KIN-3D-013** | Isolation mode shall hide or ghost (`opacity = 0.08`, non-pickable) all non-selected components while smoothly framing the isolated component or subsystem. |
| **KIN-3D-014** | Users shall be able to toggle visibility independently per system layer (`Structure`, `ICE/EV Powerplant`, `Transmission/Drivetrain`, `Suspension/Steering`, `Braking`, `Wheels/Tires`, `Exterior Shell`). |
| **KIN-3D-015** | Power-flow highlighting shall illuminate active propulsion/regen drivetrain components along `DrivetrainPath` and mute idle non-driven parts. |

## 3. Interaction State Precedence

1. **Selected Component:** Emissive cyan edge/tint (`#00E5FF`), opens Component Inspector drawer.
2. **Related Upstream/Downstream Components (when Relationship Inspection active):** Deep blue / amber connector cues (`#3B82F6` upstream, `#F59E0B` downstream) matching `ComponentRelationship` direction.
3. **Isolation Active:** Only `isolatedId` (or its child assembly) renders solid; non-isolated nodes fade to ghost wireframe/low opacity or hide completely per toggle (`Ghost Neighbors` vs `Solo`).
4. **Keyboard Parity (`KIN-NFR-015`):** Arrow/Tab navigation inside the left Component Tree dispatches the exact same `selectComponent(id)` and `isolateComponent(id)` actions as mouse picking.

## 4. Cross-References

- [`ASSEMBLY_HIERARCHY.md`](ASSEMBLY_HIERARCHY.md)
- [`EXPLODED_VIEW_AND_SECTION_CUT.md`](EXPLODED_VIEW_AND_SECTION_CUT.md)
- [`../02-vehicle-architecture/COMPONENT_RELATIONSHIPS.md`](../02-vehicle-architecture/COMPONENT_RELATIONSHIPS.md)
