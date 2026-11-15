# Braking System Specification — KINERA

**Document ID:** `KIN-DOC-02-10`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Specifies the mechanical, hydraulic, conceptual ABS, and EV regenerative braking system anatomy in KINERA (`KIN-VEH-027`–`KIN-VEH-028`), linking 3D hardware inspection directly to `BRAKING_DYNAMICS.md`.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-VEH-027** | Vehicle Anatomy shall represent `vehicle.braking.*` components across all 7 configurations and visualize brake caliper/rotor clamping alongside regenerative paths on EVs. |
| **KIN-VEH-028** | ABS representation shall be documented explicitly as a conceptual hydraulic modulator + threshold slip clamping explanation—not a high-fidelity solenoid-pulse simulation. |

## 3. Canonical Braking Components (`subsystem.chassis.braking`)

| Canonical ID | Name | Engineering Function |
| :--- | :--- | :--- |
| `vehicle.braking.master-cylinder` | Tandem Hydraulic Master Cylinder | Converts pedal force into dual-circuit hydraulic line pressure |
| `vehicle.braking.abs-modulator` | ABS Hydraulic Control Unit (Conceptual) | Modulates individual wheel brake pressure conceptually near peak traction limit |
| `vehicle.braking.hydraulic-lines` | Brake Fluid Lines & Hoses | Routes hydraulic pressure to front and rear calipers |
| `vehicle.braking.caliper` | Hydraulic Brake Caliper | Converts line pressure via pistons into clamping normal force on pads |
| `vehicle.braking.pads` | Friction Brake Pads | Converts kinetic energy into thermal energy against spinning rotor |
| `vehicle.braking.disc-rotor` | Ventilated / Solid Brake Disc Rotor | Rotating iron/composite friction surface bolted to `vehicle.wheel.hub-bearing` |

## 4. Friction vs. EV Blended Regenerative Braking

- **ICE Vehicles (`ICE-*`):** 100% of braking deceleration torque is supplied by friction pads clamping `vehicle.braking.disc-rotor` (plus minor engine-braking drag in gear). Static brake bias typically allocates $65\%$–$75\%$ to the front axle because braking weight transfer loads front tires and unloads rear tires.
- **EV Vehicles (`EV-*`):** Total braking demand $F_{brake,req}$ blends **Regenerative Braking** on driven axle(s) (`ev.motor.*` acting as generator -> `ev.inverter.*` -> `ev.battery.pack`) with **Friction Braking** (`vehicle.braking.caliper`). Friction braking supplements whenever driver demand exceeds motor regen torque limit, battery high-SOC charge ceiling, or near $0\text{ m/s}$ stop hold.

## 5. Cross-References

- [`COMPONENT_ANATOMY_SPECIFICATION.md`](COMPONENT_ANATOMY_SPECIFICATION.md)
- [`../04-vehicle-dynamics/BRAKING_DYNAMICS.md`](../04-vehicle-dynamics/BRAKING_DYNAMICS.md)
- [`../03-powertrain-engineering/EV_POWERTRAIN_MODEL.md`](../03-powertrain-engineering/EV_POWERTRAIN_MODEL.md)
