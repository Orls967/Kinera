# EV Vehicle Architecture — KINERA

**Document ID:** `KIN-DOC-02-04`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the electrical, mechanical, structural, and control architectures of KINERA's three V1 Electric Vehicle configurations (`EV-FWD`, `EV-RWD`, `EV-DUAL-AWD`), contrasting e-axle packaging, floor-mounted battery integration, and software-defined dual-motor torque allocation against ICE drivetrains.

## 2. Shared EV Core Subsystems

All three EV configurations share a skateboard-style structural battery architecture embedded between front and rear subframes (`vehicle.structure.unibody` floor bay):
- **Energy Storage:** `ev.battery.pack` housed inside protective structural `ev.battery.enclosure`, subdivided educationally into `ev.battery.cell-module` stacks.
- **Monitoring & Safety:** `ev.bms.controller` governing pack terminal voltage ($V_{pack}$), pack current ($I$), State of Charge ($\text{SOC}$), thermal operating limits, and regenerative charge power ceiling.
- **High-Voltage Distribution & Thermal:** `ev.hv.pdu-cabling` (orange HV DC bus, contactors, pyro-fuse concepts) and `ev.thermal.battery-motor-loop` cooling battery modules, inverter power stages, and motor stator jackets.

## 3. Configuration-by-Configuration Architecture

### 3.1 `EV-FWD` — Single-Motor Front E-Axle
- **Topology:** `ev.battery.pack` -> `ev.hv.pdu-cabling` -> `ev.inverter.front` -> `ev.motor.front` (`ev.motor.pmsm`) -> `ev.transmission.reduction-gearbox-front` -> `drivetrain.ev.front-differential` -> Front CV Axle Shafts -> Front Wheels.
- **Packaging & Structural Characteristics:** Consolidates inverter, motor, single-speed helical reduction gearbox, and front differential into the front subframe bay (often packaged as an integrated 3-in-1 e-drive unit).
- **Dynamics Implications:** Front axle handles propulsion, regenerative braking, and steering. Because electric motors deliver full peak torque immediately from $0\text{ RPM}$ while longitudinal launch weight transfers load *away* from the front axle, `EV-FWD` frequently encounters front traction limits ($\mu F_{z,f}$) sooner than `EV-RWD` at matched power and mass.

### 3.2 `EV-RWD` — Single-Motor Rear E-Axle
- **Topology:** `ev.battery.pack` -> `ev.hv.pdu-cabling` -> `ev.inverter.rear` -> `ev.motor.rear` (`ev.motor.pmsm`) -> `ev.transmission.reduction-gearbox-rear` -> `drivetrain.ev.rear-differential` -> Rear Half-Shafts -> Rear Wheels.
- **Packaging & Structural Characteristics:** Places the compact e-drive directly inside the rear subframe between the rear wheels, freeing the front bay (frunk/HVAC space) and removing the longitudinal driveshaft completely.
- **Dynamics Implications:** Slight rear static weight bias (~48/52) combined with longitudinal load transfer onto the rear axle under launch gives higher available tractive grip $\mu F_{z,r}$ on launch while preserving pure front steering. Rear regenerative braking must be bounded by rear tire friction limits to prevent rear-axle lock/oversteer instability during heavy deceleration on low-$\mu$ surfaces.

### 3.3 `EV-DUAL-AWD` — Independent Front & Rear E-Axles
- **Topology:** `ev.battery.pack` -> `ev.hv.pdu-cabling` splits DC power to two independent drive channels:
  - **Front Channel:** `ev.inverter.front` -> `ev.motor.front` -> `ev.transmission.reduction-gearbox-front` -> `drivetrain.ev.front-differential` -> Front Axles.
  - **Rear Channel:** `ev.inverter.rear` -> `ev.motor.rear` -> `ev.transmission.reduction-gearbox-rear` -> `drivetrain.ev.rear-differential` -> Rear Axles.
- **No Mechanical Center Differential or Driveshaft:** Unlike `ICE-AWD` and `ICE-4WD`, front and rear axles have **zero mechanical shaft linkage**. Front/rear wheels remain kinematically linked only through the vehicle chassis moving over the road. Torque distribution is governed electronically by inverter phase-current commands!
- **Motor Pairing & Efficiency Strategy:**
  - Often pairs a high-efficiency **PMSM** on the primary axle with a low-drag **Induction Motor** (which exhibits zero permanent-magnet back-EMF drag losses when de-energized while coasting) or a clutch-disconnect PMSM on the secondary axle.
  - KINERA V1 models independent front/rear torque allocation ratio $\lambda_{F} \in [0, 1]$ ($\lambda_R = 1 - \lambda_F$), constrained simultaneously by individual motor torque-speed envelopes, total battery discharge power limit ($P_{batt,max}$), and per-axle tire friction caps.
- **Dual-Axle Regenerative Braking:** Allows balanced front/rear electric regeneration aligned closer to ideal braking distribution, increasing kinetic energy recovery compared to single-axle EVs while maintaining stability.

## 4. 400V vs. 800V Architecture Note

KINERA's default V1 EV configurations standardize on a **$400\text{ V}$ nominal DC bus** for baseline comparability, while documenting $800\text{ V}$ class architectures conceptually (halving current $I = P/V$ for identical power, reducing $I^2R$ cabling losses and enabling higher peak DC fast-charging rates). Users may adjust nominal pack voltage in Engineering Simulator within safe bounds (`250 V`–`900 V`) to observe current reduction directly via $P_{elec} = V \cdot I$.

## 5. Cross-References

- [`VEHICLE_CONFIGURATION_SPECIFICATION.md`](VEHICLE_CONFIGURATION_SPECIFICATION.md)
- [`DRIVETRAIN_TOPOLOGY.md`](DRIVETRAIN_TOPOLOGY.md)
- [`../03-powertrain-engineering/EV_POWERTRAIN_MODEL.md`](../03-powertrain-engineering/EV_POWERTRAIN_MODEL.md)
- [`../03-powertrain-engineering/DIFFERENTIAL_MODEL.md`](../03-powertrain-engineering/DIFFERENTIAL_MODEL.md)
