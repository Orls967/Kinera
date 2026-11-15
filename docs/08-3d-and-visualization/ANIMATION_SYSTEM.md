# Animation System Specification — KINERA

**Document ID:** `KIN-DOC-08-08`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines KINERA's declarative animation architecture combining **Cinematic Product Experience** and **Guided Engineering Inspection** (`KIN-3D-021`–`KIN-3D-023`), conforming to [`../schemas/animation-sequence.schema.json`](../schemas/animation-sequence.schema.json). Every animation serves an explicit pedagogical purpose.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-3D-021** | Every animation sequence shall carry a canonical `anim.*` ID, target component list, timing envelope, dependencies, and explicit educational purpose conforming to `schemas/animation-sequence.schema.json`. |
| **KIN-3D-022** | Mechanical rotations (crankshaft, gears, driveshafts, differential spider/axles, motor rotor, wheels) shall scale proportionally to simulated ratios (`G_k`, `F`, `G_red`) rather than arbitrary decoupled speeds. |
| **KIN-3D-023** | All animation loops shall honor playback controls (`play`, `pause`, `replay`, `step`, speed scalar) and `prefers-reduced-motion` accessibility settings. |

## 3. Canonical Animation Sequence Catalog

| Canonical ID | Category | Config Scope | Duration | Educational Purpose |
| :--- | :--- | :--- | :---: | :--- |
| `anim.cinematic.turntable-360` | `cinematic` | All 7 | `12.0 s` | Full spatial orientation of vehicle layout |
| `anim.cinematic.exterior-chassis-reveal` | `cinematic` | All 7 | `4.5 s` | Transitions outer body shell opacity to reveal chassis & powertrain |
| `anim.inspection.explode-assembly` | `inspection` | All 7 | `3.0 s` | Separates layered subsystems along mounting vectors |
| `anim.journey.ice-four-stroke` | `journey` | `ICE-*` | `4.0 s` (loop) | Synchronized intake/compression/power/exhaust piston-valve-spark cycle |
| `anim.journey.ice-fwd-flow` | `journey` | `ICE-FWD` | `16.0 s` | Step-by-step torque flow through transverse transaxle |
| `anim.journey.ice-rwd-flow` | `journey` | `ICE-RWD` | `16.0 s` | Step-by-step longitudinal gearbox -> driveshaft -> rear differential flow |
| `anim.journey.ice-awd-flow` | `journey` | `ICE-AWD` | `18.0 s` | Center differential split into front and rear driveshafts |
| `anim.journey.ice-4wd-flow` | `journey` | `ICE-4WD` | `18.0 s` | Transfer case `2H` vs `4H` vs `4L` low-range gearing & shaft engagement |
| `anim.journey.ev-single-propulsion` | `journey` | `EV-FWD`, `EV-RWD` | `12.0 s` | Battery -> Inverter -> PMSM -> Reduction -> Wheels + reverse regen |
| `anim.journey.ev-dual-awd-flow` | `journey` | `EV-DUAL-AWD` | `14.0 s` | Independent front/rear inverter-motor torque allocation + dual regen |
| `anim.inspection.differential-action` | `inspection` | All 7 | `6.0 s` | Spider gear rotation during cornering wheel-speed differentiation vs lock |
| `anim.inspection.weight-transfer-cues` | `inspection` | All 7 | `5.0 s` | Visual chassis pitch/roll & tire load-bar expansion proportional to $a_x, a_y$ |
| `anim.inspection.vehicle-trajectory` | `inspection` | All 7 | Dynamic | Moves miniature/scaled vehicle path marker along bicycle XY output |

## 4. Cross-References

- [`../schemas/animation-sequence.schema.json`](../schemas/animation-sequence.schema.json)
- [`../03-powertrain-engineering/POWERTRAIN_JOURNEY_SPECIFICATION.md`](../03-powertrain-engineering/POWERTRAIN_JOURNEY_SPECIFICATION.md)
