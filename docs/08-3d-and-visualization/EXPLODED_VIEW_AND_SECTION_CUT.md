# Exploded View and Section Cut Specification — KINERA

**Document ID:** `KIN-DOC-08-06`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Specifies the parametric exploded-assembly separation mechanics and WebGL local/global clipping-plane section cut behavior (`KIN-3D-016`–`KIN-3D-018`) for inspecting internal mechanisms inside Vehicle Anatomy.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-3D-016** | Exploded view shall smoothly translate subassemblies and internal parts along predefined local/world explosion vectors parameterized by `explodeFactor` $\in [0.0, 1.0]$. |
| **KIN-3D-017** | Section cut shall apply WebGL clipping planes along selectable `X` (longitudinal), `Y` (transverse), or `Z` (vertical cutaway) axes with real-time offset scrubbing across housings while keeping internal solid/moving parts crisp. |
| **KIN-3D-018** | Outer housing transparency (`0%`–`90%`) and section cut shall interoperate cleanly without Z-fighting or lost raycast hit-testing on exposed internal parts. |

## 3. Exploded View Parametric Model

Every movable node inside `VehicleAssemblyRoot` carries metadata `(explodeVector: [dx, dy, dz], explodeOrder: 1..3)`:
- **Stage 1 (`explodeFactor` $0.0 \to 0.35$):** Exterior body shell lifts vertically (`+Z_iso`), wheels/brakes step laterally outward along `±Y_iso`.
- **Stage 2 (`0.35 \to 0.70$):** Subframes, suspension arms, and powertrain casings separate axially (e.g., clutch separates from flywheel; driveshaft separates between gearbox and differential).
- **Stage 3 (`0.70 \to 1.00$):** Cutaway internals (pistons, gear-set shafts, differential spider carrier, EV rotor/stator, battery modules) fan cleanly for individual selection.

## 4. Section Cut Clipping Strategy

- Uses Three.js `gl.localClippingEnabled = true` with configurable `THREE.Plane` normals aligned to Three.js converted coordinates.
- Shell housings (`ice.engine.block`, `ice.transmission.transaxle`, `drivetrain.*-differential` housings, `ev.battery.enclosure`) receive the active clipping plane plus an optional dark-graphite backface/stencil rim highlight so sliced walls read like precision engineering CAD cross-sections!
- Internal working parts (`ice.engine.piston`, gears, EV rotor) can optionally opt out of clipping (`clipExclude: true`) so gears remain visually intact inside sliced housings.

## 5. Cross-References

- [`ASSEMBLY_HIERARCHY.md`](ASSEMBLY_HIERARCHY.md)
- [`COMPONENT_INTERACTION_SPECIFICATION.md`](COMPONENT_INTERACTION_SPECIFICATION.md)
