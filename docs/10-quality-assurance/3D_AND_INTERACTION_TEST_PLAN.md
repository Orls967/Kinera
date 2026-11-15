# KINERA 3D and Interaction Test Plan

**Document ID:** `KIN-DOC-10-06`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines verification methods for 3D scene assembly, interactive raycasting, component inspection binding, parametric exploded view, section-cut clipping, Powertrain Journey synchronization, camera presets, and accessibility controls (`KIN-3D-*`, `AC-005`, `AC-006`, `AC-007`).

---

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-QA-014** | Every visible interactive 3D mesh node across all 7 canonical configurations shall resolve to a valid canonical component ID (`componentId`) and populate the inspection panel via validated metadata without orphaned meshes. |
| **KIN-QA-015** | Inspection modes (hover, select, isolate, subsystem visibility toggle, body-shell opacity, parametric explode `[0..1]`, section-cut plane, camera presets, and Powertrain Journey step playback) shall execute cleanly with zero WebGL console errors or broken transforms. |

---

## 3. 3D Scene & Asset Integrity Checks

1. **Manifest & Canonical ID Binding (`asset.*` <-> `componentId`):**
   - Traverse every GLB / procedural node tree loaded for all 7 configurations.
   - Assert every selectable `Object3D` carries `userData.canonicalComponentId` present in [`CANONICAL_ID_REGISTRY.md`](../07-data-and-contracts/CANONICAL_ID_REGISTRY.md) and linked to a valid schema-validated `ComponentSpec`.
2. **Coordinate System & Scale Audit:**
   - Verify right-handed coordinate transform mapping `ISO 8855` `(x_fwd, y_left, z_up)` -> Three.js `(y, z, x)` preserves wheel rotation direction (`+X_iso` forward motion rotates wheels forward cleanly without reversed spin).
   - Verify wheelbase `L` and track width `t` on rendered meshes match `VehicleConfiguration` geometry within `1 mm`.
3. **Instancing & Material Reuse Audit:**
   - Verify shared wheels, brakes, and suspension links use shared `InstancedMesh` / cloned material references with zero uncleaned `dispose()` leaks when switching across all 7 configurations sequentially.

---

## 4. Interaction & Visual Mode Verification Cases

| Test ID | Feature Under Test | Stimulus / Action | Expected Pass Condition |
| :--- | :--- | :--- | :--- |
| **TEST-3D-001** | Config Switch Scene Swap | Switch `ICE-FWD -> ICE-RWD -> ICE-AWD -> ICE-4WD -> EV-FWD -> EV-RWD -> EV-DUAL-AWD` | Active visible groups match `02-vehicle-architecture` config matrix; GPU memory delta returns near baseline (no leak). |
| **TEST-3D-002** | Hover & Click Selection | Raycast click on Front Differential (`drivetrain.*`) & Rear Coilover | Hover highlights target within 1 frame; click focuses inspection card with canonical name, role, subsystem, and active config specs (`AC-006`). |
| **TEST-3D-003** | Isolate & Subsystem Layers | Enable `Isolate` on Gearbox; then toggle off `Body Shell` and `Suspension` | Non-isolated components fade/hide cleanly; turning layers back on restores exact prior material opacity (`AC-005`). |
| **TEST-3D-004** | Parametric Exploded View | Sweep explode factor `0.0 -> 0.5 -> 1.0 -> 0.0` | Every movable subassembly translates strictly along its authored local/world explode axis and returns to `0.0` exact rest pose. |
| **TEST-3D-005** | Section-Cut Clipping Plane | Enable transverse/longitudinal section plane and scrub offset | Three.js clipping plane slices active geometry cleanly; `renderer.localClippingEnabled = true` active only when enabled. |
| **TEST-3D-006** | Camera Presets & Keyboard | Trigger keys/buttons `1..6` (`Overview`, `Engine/Motor`, `Drivetrain`, `Underbody`, `Front Axle`, `Side Profile`) + `R` reset | Smooth damped camera tween completes within budget and respects OrbitControls `minDistance` / `maxPolarAngle`. |
| **TEST-3D-007** | Powertrain Journey Sync | Run `Play`, `Pause`, `Step Forward`, `Step Back`, `Replay` on both `ICE-4WD` and `EV-DUAL-AWD` | Step index `i` matches highlighted glowing energy path, directional arrows (`fuel/elec -> torque -> wheel`), and synchronized explanation card (`AC-007`). |
| **TEST-3D-008** | Accessibility Controls | Enable `prefers-reduced-motion` + keyboard-only navigation across canvas toolbar & sliders | Tweens snap cleanly without disorienting camera swoops; non-WebGL component list/diagram tree fallback remains fully navigable (`AC-020`). |

---

## 5. Cross-References

- [`../08-3d-and-visualization/VISUAL_IDENTITY.md`](../08-3d-and-visualization/VISUAL_IDENTITY.md)
- [`../08-3d-and-visualization/ASSEMBLY_HIERARCHY.md`](../08-3d-and-visualization/ASSEMBLY_HIERARCHY.md)
- [`../08-3d-and-visualization/COMPONENT_INTERACTION_SPECIFICATION.md`](../08-3d-and-visualization/COMPONENT_INTERACTION_SPECIFICATION.md)
- [`../08-3d-and-visualization/ANIMATION_SYSTEM.md`](../08-3d-and-visualization/ANIMATION_SYSTEM.md)
- [`PERFORMANCE_TEST_PLAN.md`](PERFORMANCE_TEST_PLAN.md)
