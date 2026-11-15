# Vehicle Configuration Specification — KINERA

**Document ID:** `KIN-DOC-02-02`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Provides the formal engineering specification for all seven canonical vehicle configurations supported in KINERA V1, locking their metadata, component memberships, driven axles, power-flow topologies, baseline SI vehicle parameters, and educational focus areas.

## 2. Formal Configuration Contracts (`KIN-VEH-009` – `KIN-VEH-015`)

| Req ID | Requirement |
| :--- | :--- |
| **KIN-VEH-009** | `vehicle.config.ice-fwd` shall implement a transverse front engine coupled to an integrated transaxle containing manual gears and front differential driving front CV axle shafts. |
| **KIN-VEH-010** | `vehicle.config.ice-rwd` shall implement a longitudinal front engine, clutch/flywheel, separate manual transmission, main driveshaft with U/CV joints, rear differential, and rear axle shafts. |
| **KIN-VEH-011** | `vehicle.config.ice-awd` shall implement front and rear differentials coupled via a center differential or center torque-transfer mechanism, supporting configurable front/rear split behavior and documenting real-world AWD variations. |
| **KIN-VEH-012** | `vehicle.config.ice-4wd` shall implement a longitudinal drivetrain with a transfer case supporting `2H`, `4H`, and `4L` (low-range reduction), clearly distinguishing part-time vs. full-time 4WD and distinguishing 4WD from AWD. |
| **KIN-VEH-013** | `vehicle.config.ev-fwd` and `vehicle.config.ev-rwd` shall implement single-motor EV topologies comprising battery pack, BMS, inverter, traction motor, single-speed reduction gearbox, differential, and driven axle shafts. |
| **KIN-VEH-014** | `vehicle.config.ev-dual-awd` shall implement independent front and rear inverters, motors, reduction units, and differentials sharing a central battery/BMS without a mechanical driveshaft or mechanical center differential. |
| **KIN-VEH-015** | Every configuration definition shall list supported differential modes, valid simulation modules, 3D assembly references, and baseline SI parameter blocks. |

## 3. Detailed Specification of the Seven Canonical Configurations

### 3.1 `vehicle.config.ice-fwd` (`ICE-FWD`)
- **Powertrain Type:** `ice` | **Drivetrain Layout:** `fwd` | **Placement:** Front Transverse
- **Active Component Topology:**
  `ice.engine.assembly` -> `ice.clutch.flywheel` -> `ice.clutch.disc-pressure-plate` -> `ice.transmission.transaxle` (integrating `ice.transmission.manual.gear-set` + `drivetrain.fwd.front-differential`) -> `drivetrain.common.cv-joint` -> `drivetrain.common.axle-shaft-front-left` / `drivetrain.common.axle-shaft-front-right` -> `vehicle.axle.front` (`vehicle.wheel.tire`).
- **Default Baseline Specs (SI):** Mass $1380\text{ kg}$, $L = 2.70\text{ m}$, $t = 1.56\text{ m}$, $h = 0.54\text{ m}$, Static F/R Weight = $60\% / 40\%$ ($a = 1.08\text{ m}, b = 1.62\text{ m}$), $I_z = 2150\text{ kg}\cdot\text{m}^2$, $C_d = 0.29$, $A = 2.25\text{ m}^2$, $C_{rr} = 0.011$, $r_{eff} = 0.315\text{ m}$.
- **Powertrain Specs:** 2.0 L NA I4 ($118\text{ kW}$ peak @ $6400\text{ RPM}$, $205\text{ N}\cdot\text{m}$ peak @ $4400\text{ RPM}$), 6-speed manual ratios `[3.62, 2.04, 1.38, 1.03, 0.82, 0.69]`, Final Drive $F = 3.94$, overall drivetrain efficiency $\eta_{total} \approx 0.91$.
- **Learning Focus:** Transverse packaging efficiency, integrated transaxle vs. separate gearbox/diff, unequal/half-shaft CV joints, front-heavy static traction vs. launch weight-transfer unloading, combined steer-plus-drive friction circle competition on front tires.

### 3.2 `vehicle.config.ice-rwd` (`ICE-RWD`)
- **Powertrain Type:** `ice` | **Drivetrain Layout:** `rwd` | **Placement:** Front Longitudinal
- **Active Component Topology:**
  `ice.engine.assembly` -> `ice.clutch.flywheel` -> `ice.clutch.disc-pressure-plate` -> `ice.transmission.manual.gear-set` -> `drivetrain.common.universal-joint` -> `drivetrain.common.driveshaft-main` -> `drivetrain.rwd.rear-differential` -> `drivetrain.common.axle-shaft-rear-left` / `drivetrain.common.axle-shaft-rear-right` -> `vehicle.axle.rear`.
- **Default Baseline Specs (SI):** Mass $1420\text{ kg}$, $L = 2.70\text{ m}$, $t = 1.56\text{ m}$, $h = 0.54\text{ m}$, Static F/R Weight = $52\% / 48\%$ ($a = 1.296\text{ m}, b = 1.404\text{ m}$), $I_z = 2280\text{ kg}\cdot\text{m}^2$, $C_d = 0.29$, $A = 2.25\text{ m}^2$, $C_{rr} = 0.011$, $r_{eff} = 0.315\text{ m}$.
- **Powertrain Specs:** Same 2.0 L NA I4 ($118\text{ kW} / 205\text{ N}\cdot\text{m}$), 6-speed manual, Final Drive $F = 3.94$, overall drivetrain efficiency $\eta_{total} \approx 0.88$ (hypoid bevel gear + driveshaft joint losses).
- **Learning Focus:** Longitudinal separation of engine, gearbox, and rear axle; driveshaft rotational speed; separation of steering (front) and propulsion (rear) friction circles; launch weight-transfer favoring rear traction.

### 3.3 `vehicle.config.ice-awd` (`ICE-AWD`)
- **Powertrain Type:** `ice` | **Drivetrain Layout:** `awd` | **Placement:** Front Longitudinal (Symmetrical/Center-Diff Reference)
- **Active Component Topology:**
  `ice.engine.assembly` -> `ice.clutch.flywheel` -> `ice.transmission.manual.gear-set` -> `drivetrain.awd.center-differential` -> [Front Branch: `drivetrain.common.driveshaft-front` -> `drivetrain.awd.front-differential` -> Front Axles] AND [Rear Branch: `drivetrain.common.driveshaft-rear` -> `drivetrain.awd.rear-differential` -> Rear Axles].
- **Default Baseline Specs (SI):** Mass $1520\text{ kg}$, $L = 2.70\text{ m}$, $t = 1.56\text{ m}$, $h = 0.55\text{ m}$, Static F/R Weight = $56\% / 44\%$ ($a = 1.188\text{ m}, b = 1.512\text{ m}$), $I_z = 2480\text{ kg}\cdot\text{m}^2$, $C_d = 0.30$, $A = 2.30\text{ m}^2$, $C_{rr} = 0.012$, $r_{eff} = 0.315\text{ m}$.
- **Powertrain Specs:** Same 2.0 L NA I4, 6-speed manual, Center torque split default `50/50` (configurable `40/60` or dynamic coupling), Front/Rear Final Drives $F = 3.94$, overall drivetrain efficiency $\eta_{total} \approx 0.84$.
- **Learning Focus:** Continuous 4-wheel traction sharing, center differential vs. on-demand hang-on PTU/coupling, extra mass & drivetrain drag trade-offs vs. low-$\mu$ acceleration gains.

### 3.4 `vehicle.config.ice-4wd` (`ICE-4WD`)
- **Powertrain Type:** `ice` | **Drivetrain Layout:** `4wd` | **Placement:** Front Longitudinal Body-on-Frame / Ladder Reference
- **Active Component Topology:**
  `ice.engine.assembly` -> `ice.clutch.flywheel` -> `ice.transmission.manual.gear-set` -> `drivetrain.4wd.transfer-case` -> [Rear Branch (Always Active): `drivetrain.common.driveshaft-rear` -> `drivetrain.4wd.rear-differential` -> Rear Axles] + [Front Branch (Engaged in `4H`/`4L`): `drivetrain.common.driveshaft-front` -> `drivetrain.4wd.front-differential` -> Front Axles].
- **Default Baseline Specs (SI):** Mass $1880\text{ kg}$, $L = 2.85\text{ m}$, $t = 1.60\text{ m}$, $h = 0.65\text{ m}$, Static F/R Weight = $54\% / 46\%$ ($a = 1.311\text{ m}, b = 1.539\text{ m}$), $I_z = 3450\text{ kg}\cdot\text{m}^2$, $C_d = 0.36$, $A = 2.55\text{ m}^2$, $C_{rr} = 0.014$, $r_{eff} = 0.365\text{ m}$.
- **Powertrain Specs:** 2.0 L NA I4 reference (or comparable torque rating clearly flagged in comparison), 6-speed manual, Transfer Case modes `2H` ($G_{tc}=1.0$, Rear only), `4H` ($G_{tc}=1.0$, 50/50 locked or center-diff full-time), `4L` ($G_{tc}=2.48$, low-range multiplier), Final Drive $F = 4.10$, $\eta_{total} \approx 0.86$ (`2H`) / $0.82$ (`4H`/`4L`).
- **Learning Focus:** Transfer case mechanics, low-range torque multiplication for steep gradeability, part-time vs. full-time 4WD driveline wind-up constraint on high-$\mu$ pavement, and why 4WD is distinct from passenger-car AWD.

### 3.5 `vehicle.config.ev-fwd` (`EV-FWD`)
- **Powertrain Type:** `ev` | **Drivetrain Layout:** `fwd` | **Placement:** Front Transverse E-Axle + Floor Battery
- **Active Component Topology:**
  `ev.battery.pack` (`ev.bms.controller`) -> `ev.hv.pdu-cabling` -> `ev.inverter.front` -> `ev.motor.front` (`ev.motor.pmsm`) -> `ev.transmission.reduction-gearbox-front` -> `drivetrain.ev.front-differential` -> Front CV Axles -> `vehicle.axle.front`.
- **Default Baseline Specs (SI):** Mass $1660\text{ kg}$, $L = 2.70\text{ m}$, $t = 1.56\text{ m}$, $h = 0.48\text{ m}$, Static F/R Weight = $53\% / 47\%$ ($a = 1.269\text{ m}, b = 1.431\text{ m}$), $I_z = 2620\text{ kg}\cdot\text{m}^2$, $C_d = 0.26$, $A = 2.25\text{ m}^2$, $C_{rr} = 0.010$, $r_{eff} = 0.315\text{ m}$.
- **Powertrain Specs:** $64.0\text{ kWh}$ / $400\text{ V}$ battery, $150\text{ kW} / 310\text{ N}\cdot\text{m}$ PMSM, single-speed reduction $G_{red} = 8.65$, mechanical reduction+diff $\eta_{mech} \approx 0.95$, inverter $\eta_{inv} \approx 0.96$.
- **Learning Focus:** High low-RPM motor torque vs. front tire traction limit on launch, single-speed gear simplicity, low CG from floor battery, front-axle regenerative braking limits.

### 3.6 `vehicle.config.ev-rwd` (`EV-RWD`)
- **Powertrain Type:** `ev` | **Drivetrain Layout:** `rwd` | **Placement:** Rear E-Axle + Floor Battery
- **Active Component Topology:**
  `ev.battery.pack` (`ev.bms.controller`) -> `ev.hv.pdu-cabling` -> `ev.inverter.rear` -> `ev.motor.rear` (`ev.motor.pmsm`) -> `ev.transmission.reduction-gearbox-rear` -> `drivetrain.ev.rear-differential` -> Rear Half-Shafts -> `vehicle.axle.rear`.
- **Default Baseline Specs (SI):** Mass $1680\text{ kg}$, $L = 2.70\text{ m}$, $t = 1.56\text{ m}$, $h = 0.48\text{ m}$, Static F/R Weight = $48\% / 52\%$ ($a = 1.404\text{ m}, b = 1.296\text{ m}$), $I_z = 2650\text{ kg}\cdot\text{m}^2$, $C_d = 0.25$, $A = 2.25\text{ m}^2$, $C_{rr} = 0.010$, $r_{eff} = 0.315\text{ m}$.
- **Powertrain Specs:** $64.0\text{ kWh}$ / $400\text{ V}$ battery, $150\text{ kW} / 310\text{ N}\cdot\text{m}$ PMSM, single-speed reduction $G_{red} = 8.65$, $\eta_{mech} \approx 0.95$, $\eta_{inv} \approx 0.96$.
- **Learning Focus:** Rear packaging eliminating longitudinal driveshaft tunnel, near-50/50 weight balance + rearward load transfer under strong electric launch torque, front steering freed from drive torque.

### 3.7 `vehicle.config.ev-dual-awd` (`EV-DUAL-AWD`)
- **Powertrain Type:** `ev` | **Drivetrain Layout:** `dual-awd` | **Placement:** Independent Front & Rear E-Axles + Floor Battery
- **Active Component Topology:**
  `ev.battery.pack` (`ev.bms.controller`) -> `ev.hv.pdu-cabling` ->
  - **Front Path:** `ev.inverter.front` -> `ev.motor.front` -> `ev.transmission.reduction-gearbox-front` -> `drivetrain.ev.front-differential` -> Front Axles -> `vehicle.axle.front`
  - **Rear Path:** `ev.inverter.rear` -> `ev.motor.rear` -> `ev.transmission.reduction-gearbox-rear` -> `drivetrain.ev.rear-differential` -> Rear Axles -> `vehicle.axle.rear`
- **Default Baseline Specs (SI):** Mass $1840\text{ kg}$, $L = 2.70\text{ m}$, $t = 1.56\text{ m}$, $h = 0.48\text{ m}$, Static F/R Weight = $50\% / 50\%$ ($a = 1.35\text{ m}, b = 1.35\text{ m}$), $I_z = 2950\text{ kg}\cdot\text{m}^2$, $C_d = 0.26$, $A = 2.28\text{ m}^2$, $C_{rr} = 0.010$, $r_{eff} = 0.315\text{ m}$.
- **Powertrain Specs:** $77.4\text{ kWh}$ / $400\text{ V}$ battery (max discharge $240\text{ kW}$), Front motor ($110\text{ kW} / 200\text{ N}\cdot\text{m}$, $G_{red,F} = 8.90$), Rear motor ($150\text{ kW} / 310\text{ N}\cdot\text{m}$, $G_{red,R} = 8.65$), electronic torque allocation slider (`0/100` to `100/0` bounded by motor + battery limits).
- **Learning Focus:** Absence of mechanical center differential or longitudinal driveshaft, software-defined torque distribution, cruising efficiency (front disconnect/coast vs. dual-motor cruise), dual-axle regenerative braking capture.

## 4. Cross-References

- [`ICE_ARCHITECTURE.md`](ICE_ARCHITECTURE.md)
- [`EV_ARCHITECTURE.md`](EV_ARCHITECTURE.md)
- [`DRIVETRAIN_TOPOLOGY.md`](DRIVETRAIN_TOPOLOGY.md)
- [`../07-data-and-contracts/VEHICLE_CONFIGURATION_SCHEMA.md`](../07-data-and-contracts/VEHICLE_CONFIGURATION_SCHEMA.md)
- [`../schemas/vehicle-configuration.schema.json`](../schemas/vehicle-configuration.schema.json)
