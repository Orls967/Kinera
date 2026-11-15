# 3D Asset Specification — KINERA

**Document ID:** `KIN-DOC-08-03`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Establishes CAD/cutaway modeling standards, glTF 2.0 / `.glb` asset packaging, SI scale conventions, coordinate frame conversion between ISO 8855 physics and Three.js rendering, and asset naming rules (`KIN-3D-006`–`KIN-3D-009`).

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-3D-006** | All 3D meshes shall export in binary glTF 2.0 (`.glb`) using Draco mesh compression and PBR (`metalness`/`roughness`) materials at strict `1 unit = 1.0 meter` SI scale. |
| **KIN-3D-007** | Every selectable GLB mesh node shall carry `userData.canonicalId` matching a registered ID in `CANONICAL_ID_REGISTRY.md`. |
| **KIN-3D-008** | Physics-to-3D coordinate transforms shall convert deterministically from ISO 8855 ($+X$ forward, $+Y$ left, $+Z$ up) to Three.js right-handed space ($+Y_{3D}$ up, $+Z_{3D}$ forward, $+X_{3D}$ left). |
| **KIN-3D-009** | Cutaway housings (engine block, transaxle, manual gearbox, differentials, transfer case, battery enclosure) shall feature separate outer shell and internal gear/piston/cell geometry so section cuts and transparency reveal working internals. |

## 3. Coordinate & Pivot Standards

- **World Origin (`[0, 0, 0]`):** Mid-wheelbase ground contact point projected directly beneath vehicle centerline (`y_3d = 0` is ground road plane).
- **ISO 8855 -> Three.js Mapping:** `(x_iso, y_iso, z_iso) -> (y_iso, z_iso, x_iso)` (preserving right-handedness: `(i, j, k) -> (j, k, i)` cyclic permutation has $\det = +1$!).
  - Let's verify cyclic determinant: $\begin{vmatrix} 0 & 1 & 0 \\ 0 & 0 & 1 \\ 1 & 0 & 0 \end{vmatrix} = +1$! Right-handedness is preserved without mirroring meshes!
- **Component Pivots:** Rotating components (`ice.engine.crankshaft`, `drivetrain.common.driveshaft-main`, `vehicle.wheel.rim`, gears) must place local origin strictly on their physical axis of rotation.

## 4. Asset Manifest Naming Convention

Every modular GLB package maps to a canonical `asset.*` ID in `assets-manifest.json`, e.g.:
- `asset.vehicle.shared-chassis-wheels` (`shared/chassis-wheels-suspension-brakes.glb`)
- `asset.ice.inline4-powerplant` (`ice/inline4-cutaway.glb`)
- `asset.ice.drivetrain-fwd-transaxle`, `asset.ice.drivetrain-rwd`, `asset.ice.drivetrain-awd`, `asset.ice.drivetrain-4wd`
- `asset.ev.battery-skate-pack`, `asset.ev.e-axle-front`, `asset.ev.e-axle-rear`

## 5. Cross-References

- [`ASSEMBLY_HIERARCHY.md`](ASSEMBLY_HIERARCHY.md)
- [`EXPLODED_VIEW_AND_SECTION_CUT.md`](EXPLODED_VIEW_AND_SECTION_CUT.md)
- [`3D_PERFORMANCE_BUDGET.md`](3D_PERFORMANCE_BUDGET.md)
