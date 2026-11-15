# 3D Performance Budget and Adaptive Quality — KINERA

**Document ID:** `KIN-DOC-08-09`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines measurable triangle, draw-call, VRAM, and asset-loading performance targets (`KIN-3D-024`–`KIN-3D-025`), adaptive quality tiers for desktop/mobile GPUs, lazy-loading policies, and runtime profiling acceptance criteria.

## 2. Requirements & Measurable Initial Targets

| Req ID | Requirement |
| :--- | :--- |
| **KIN-3D-024** | Standard inspection scenes shall target **$\approx 150,000$ active triangles** (hard upper threshold $180,000$ on `High`) and **$\approx 120$ draw calls** (hard upper threshold $150$ on `High`) verified via profiling telemetry. |
| **KIN-3D-025** | Inactive vehicle configuration assemblies shall lazy-load on demand; renderer shall automatically step down quality tiers if frame time exceeds budget on mobile/integrated GPUs. |

## 3. Triangle & Draw-Call Allocation Budget (Standard Scene Target)

| Assembly Group | Target Triangles | Target Draw Calls | Optimization Technique |
| :--- | :---: | :---: | :--- |
| Exterior Ghost / Cutaway Shell | `25,000` | `12` | Smooth single-material shell, back-face culled |
| Chassis & Subframes | `22,000` | `18` | Merged static structural frame meshes |
| Active Powertrain (ICE or EV) | `42,000` | `35` | Cutaway internals instanced where symmetrical (4 pistons/rods) |
| Transmission & Drivetrain | `24,000` | `24` | Shared gear/shaft meshes per config |
| Suspension & Steering (4 corners) | `15,000` | `12` | Instanced springs, dampers, control arms |
| Braking & Wheels/Tires (4 corners) | `18,000` | `12` | Instanced rims, tires, rotors, calipers (`InstancedMesh`) |
| Power-Flow Splines & Grid Stage | `4,000` | `7` | Procedural lines / instanced pulse markers |
| **Total Standard Active Scene** | **`150,000`** | **`120`** | *Verified initial engineering target (to be profiled in Phase 2/7)* |

## 4. Adaptive Quality Tiers

| Tier | Target Hardware | Pixel Ratio (`dpr`) | Shadow Map | Post-Processing / Outline | LOD Mesh Variant |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **High** | Desktop discrete/modern integrated GPU | `min(dpr, 2.0)` | Soft `1024x1024` | Clean edge highlight + studio bloom subtle | Full CAD cutaway ($\le 150\text{k}$ tris) |
| **Medium** | Laptops, tablets, older desktops | `min(dpr, 1.5)` | Hard `512x512` | Emissive selection tint (no multi-pass bloom) | Standard LOD ($\le 105\text{k}$ tris) |
| **Low** | Low-end mobile / battery saver | `1.0` | Ground blob shadow | Emissive selection tint only | Simplified CAD LOD ($\le 65\text{k}$ tris) |

- **Auto-Downgrade Hysteresis:** If rolling 3-second average FPS drops below `28 FPS` on `High` or `Medium`, viewport offers/applies one tier step-down while keeping section cuts, selection, and telemetry 100% functional.

## 5. Cross-References

- [`../01-product-specification/NON_FUNCTIONAL_REQUIREMENTS.md`](../01-product-specification/NON_FUNCTIONAL_REQUIREMENTS.md)
- [`../10-quality-assurance/PERFORMANCE_TEST_PLAN.md`](../10-quality-assurance/PERFORMANCE_TEST_PLAN.md)
