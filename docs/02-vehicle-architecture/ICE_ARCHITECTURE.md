# ICE Vehicle Architecture — KINERA

**Document ID:** `KIN-DOC-02-03`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Details the structural, mechanical, and drivetrain architectures of KINERA's four Internal Combustion Engine configurations (`ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `ICE-4WD`), including engine orientation, transmission integration, architectural variations, and the formal engineering distinction between AWD and 4WD.

## 2. Shared ICE Powerplant & Support Systems

Across all four ICE layouts, KINERA models a shared reference **Naturally Aspirated Inline-4 Gasoline Engine (`ice.engine.assembly`)** coupled with intake (`ice.intake.manifold`), fuel delivery (`ice.fuel.delivery-system`), exhaust (`ice.exhaust.manifold-system`), cooling (`ice.cooling.radiator-loop`), and lubrication (`ice.lubrication.oil-circuit`) systems. Only the **mounting orientation**, **subframe geometry**, **clutch/transmission housing**, and **downstream drivetrain** change per configuration.

## 3. Configuration-by-Configuration Architecture

### 3.1 `ICE-FWD` — Front Transverse Transaxle
- **Engine Orientation:** Transverse (crankshaft axis aligned parallel to front axle, $+Y$ lateral).
- **Transmission Integration:** `ice.transmission.transaxle` houses both the multi-speed `ice.transmission.manual.gear-set` and the `drivetrain.fwd.front-differential` inside one compact cast housing bolted directly to the engine bellhousing.
- **Drivetrain Path:** Power flows across parallel shafts inside the transaxle directly into `drivetrain.common.axle-shaft-front-left` and `drivetrain.common.axle-shaft-front-right` equipped with inner/outer `drivetrain.common.cv-joint` assemblies to accommodate vertical suspension travel and steering articulation.
- **Architectural Notes & Variations:** No longitudinal driveshaft exists, saving cabin floor space and mass; however, packaging limits transverse engine cylinder count and places engine + transmission mass largely ahead of/over the front subframe (`vehicle.structure.front-subframe`).

### 3.2 `ICE-RWD` — Front Longitudinal Separated Layout
- **Engine Orientation:** Longitudinal (crankshaft axis aligned along vehicle $+X$ longitudinal axis).
- **Transmission & Drivetrain:** `ice.clutch.flywheel` and `ice.clutch.disc-pressure-plate` connect directly to a separate longitudinal `ice.transmission.manual.gear-set`. A `drivetrain.common.driveshaft-main` with `drivetrain.common.universal-joint` (or center support bearing + CV joint on long-wheelbase variants) carries torque rearward through a central chassis tunnel to `drivetrain.rwd.rear-differential`, which turns torque $90^\circ$ via hypoid bevel gears into rear axle shafts.
- **Architectural Notes & Variations:** Moves transmission mass rearward toward the wheelbase center, yielding closer-to-50/50 static weight balance. Mid-engine RWD and rear-transaxle RWD exist in sports vehicles (noted in Insights), while front-engine/rear-drive (`FR`) is KINERA's canonical V1 baseline.

### 3.3 `ICE-AWD` — All-Wheel Drive Architecture & Real-World Variations
- **Canonical V1 Reference:** Front longitudinal engine + manual gearbox + `drivetrain.awd.center-differential` splitting torque continuously to `drivetrain.common.driveshaft-front` (`drivetrain.awd.front-differential`) and `drivetrain.common.driveshaft-rear` (`drivetrain.awd.rear-differential`).
- **Mandatory Documented AWD Variations:** KINERA explicitly teaches that not all ICE AWD systems share identical hardware:
  1. **Symmetrical Full-Time Center-Differential AWD** *(KINERA 3D primary reference)*: Planetary or bevel center differential (often paired with viscous or clutch LSD) enabling continuous four-wheel torque delivery on dry pavement without driveline wind-up.
  2. **Transverse FWD-Biased On-Demand AWD (PTU + Rear Coupling):** Transverse transaxle drives front wheels continuously and taps a Power Transfer Unit (PTU) bevel gearset to spin a rear driveshaft; an electronically controlled multi-plate clutch at the rear differential engages rear torque dynamically upon slip or acceleration demand.
  3. **RWD-Biased Active Transfer AWD:** Longitudinal layout normally sending majority or 100% torque rearward, engaging a multi-plate clutch pack inside an active transfer mechanism to meter torque forward smoothly.

### 3.4 `ICE-4WD` — Four-Wheel Drive & Transfer Case Architecture
- **Canonical V1 Reference:** Ladder-frame (`vehicle.structure.ladder-frame`) body-on-frame architecture with longitudinal engine, manual gearbox, and mechanical `drivetrain.4wd.transfer-case` featuring selectable **2H**, **4H**, and **4L** modes.
- **Part-Time vs. Full-Time 4WD (Explicitly Distinguished):**
  - **Part-Time 4WD (KINERA baseline mode behavior):** Transfer case uses a rigid dog clutch/chain coupling in `4H` and `4L` with **no center differential**. Front and rear driveshafts are mechanically locked to identical rotational speed ($\omega_{front} = \omega_{rear}$). Intended strictly for loose/low-$\mu$ surfaces (gravel, mud, snow); turning tightly on high-$\mu$ dry asphalt induces **driveline wind-up / binding** because front wheels travel a larger radius than rear wheels.
  - **Full-Time 4WD:** Transfer case incorporates a **lockable center differential** so `4H` can run safely on dry pavement while still offering `4H Lock` and `4L Lock` for extreme off-road traction.

## 4. AWD vs. 4WD Engineering Comparison Table

| Dimension | ICE-AWD | ICE-4WD |
| :--- | :--- | :--- |
| **Primary Structural Platform** | Usually unibody (`vehicle.structure.unibody`) | Often ladder-frame (`vehicle.structure.ladder-frame`) or reinforced unibody |
| **Center Coupling** | Center differential or electro-hydraulic multi-plate coupling | Dedicated transfer case (`drivetrain.4wd.transfer-case`) |
| **Low-Range Reduction (`4L`)** | Typically absent | Present (`~2.0:1` to `3.0:1` planetary gear reduction; V1 default `2.48:1`) |
| **Driver Mode Selection** | Usually automatic / continuous | Explicit `2H`, `4H`, `4L` selector (plus optional `4Auto` on full-time variants) |
| **Dry-Pavement Tight Cornering** | Safe due to center differential / controlled slip | Part-time `4H`/`4L` causes driveline wind-up; requires `2H` or unlocked center diff |
| **Primary Design Purpose** | On-road all-weather traction, acceleration stability, light unpaved roads | High-torque low-speed off-road crawling, steep grades, towing, severe terrain |

## 5. Cross-References

- [`VEHICLE_CONFIGURATION_SPECIFICATION.md`](VEHICLE_CONFIGURATION_SPECIFICATION.md)
- [`DRIVETRAIN_TOPOLOGY.md`](DRIVETRAIN_TOPOLOGY.md)
- [`../03-powertrain-engineering/DIFFERENTIAL_MODEL.md`](../03-powertrain-engineering/DIFFERENTIAL_MODEL.md)
