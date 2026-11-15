# Camera and Viewport Specification — KINERA

**Document ID:** `KIN-DOC-08-07`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines camera presets, smooth damped orbit/zoom constraints, component auto-framing, and responsive viewport behaviors (`KIN-3D-019`–`KIN-3D-020`).

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-3D-019** | Camera controller shall provide 7 deterministic presets (`isometric-front`, `side-profile`, `top-plan`, `front-axle`, `rear-axle`, `underbody-drivetrain`, `powertrain-focus`) with smooth damped interpolation (`<= 0.65 s` transition, disabled immediately under `prefers-reduced-motion`). |
| **KIN-3D-020** | Orbit controls shall clamp polar elevation above the ground plane (`maxPolarAngle = 88 deg` except dedicated `underbody-drivetrain` inspection mode) and bound zoom distance (`min = 0.6 m`, `max = 12.0 m`). |

## 3. Standard Camera Presets (Three.js SI Meters)

| Preset ID | Position `[x, y, z]` | LookAt Target `[x, y, z]` | FOV | Engineering Use |
| :--- | :---: | :---: | :---: | :--- |
| `isometric-front` | `[3.4, 1.8, 3.6]` | `[0.0, 0.55, 0.0]` | `40°` | Default Overview & 3/4 anatomy |
| `side-profile` | `[5.2, 0.85, 0.0]` | `[0.0, 0.60, 0.0]` | `35°` | Wheelbase, CG, overhang, driveshaft slope |
| `top-plan` | `[0.0, 6.2, 0.01]` | `[0.0, 0.40, 0.0]` | `35°` | Symmetric AWD/4WD/EV F-R layout comparison |
| `front-axle` | `[2.0, 0.9, 2.2]` | `[0.0, 0.42, 1.35]` | `38°` | Transaxle, front e-axle, steering rack, suspension |
| `rear-axle` | `[2.0, 0.9, -2.2]` | `[0.0, 0.42, -1.35]` | `38°` | Rear differential, rear e-axle, trailing links |
| `underbody-drivetrain` | `[2.4, -0.45, 0.0]` | `[0.0, 0.35, 0.0]` | `42°` | Full undercarriage tunnel, floor battery, transfer case |
| `powertrain-focus` | Dynamic per config | Active prime mover center | `36°` | Close-up on ICE block / motor / transmission |

## 4. Cross-References

- [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md)
- [`COMPONENT_INTERACTION_SPECIFICATION.md`](COMPONENT_INTERACTION_SPECIFICATION.md)
