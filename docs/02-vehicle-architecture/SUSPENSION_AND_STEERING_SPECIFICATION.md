# Suspension and Steering Specification — KINERA

**Document ID:** `KIN-DOC-02-09`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the Suspension, Steering, and Wheel/Tire components included in Vehicle Anatomy from V1 (`KIN-VEH-025`–`KIN-VEH-026`), clarifying their 3D educational representation, configuration-dependent geometry notes, and explicit boundary with V1 dynamics modeling.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-VEH-025** | Vehicle Anatomy shall include inspectable 3D suspension, steering, and wheel/tire components across all 7 configurations (`vehicle.suspension.*`, `vehicle.steering.*`, `vehicle.wheel.*`). |
| **KIN-VEH-026** | Documentation and UI shall clearly distinguish 3D visual suspension kinematics from V1 rigid-plane vehicle dynamics calculations (no full multibody K&C solver claim in V1). |

## 3. Canonical Components

### 3.1 Suspension (`subsystem.chassis.suspension`)
- `vehicle.suspension.front-control-arm` — Lower/upper wishbone or MacPherson control arm locating wheel hub laterally and longitudinally.
- `vehicle.suspension.rear-control-arm` — Multi-link / trailing control links (or solid-axle trailing arms on `ICE-4WD` reference).
- `vehicle.suspension.coil-spring` — Supports static vehicle sprung mass and controls ride height / wheel travel stiffness.
- `vehicle.suspension.damper` — Hydraulic shock absorber dissipating oscillation energy for tire road-contact stability.
- `vehicle.suspension.anti-roll-bar` — Torsion bar linking left/right wheels to resist body roll and tune roll-stiffness distribution (conceptual link to understeer/oversteer).

### 3.2 Steering (`subsystem.chassis.steering`)
- `vehicle.steering.column-wheel` — Driver steering input shaft transmitting steering angle $\delta_{sw}$ to steering gear.
- `vehicle.steering.rack-pinion` — Converts rotational steering wheel input into linear lateral tie-rod translation across steering ratio $G_{steer}$ (typically $14:1$–$16:1$ so road-wheel angle $\delta = \delta_{sw} / G_{steer}$).
- `vehicle.steering.tie-rod` — Articulated link rotating front wheel steering knuckles; accommodates suspension bounce/rebound via ball joints.

### 3.3 Wheels & Tires (`subsystem.chassis.wheels-tires`)
- `vehicle.wheel.rim` — Structural alloy/steel wheel mounting tire bead to hub.
- `vehicle.wheel.hub-bearing` — Low-friction hub assembly supporting radial/axial loads while transmitting drive & brake torques.
- `vehicle.wheel.tire` — Pneumatic elastomer tire generating tractive, braking, and lateral cornering forces.
- `vehicle.wheel.contact-patch` — Virtual visualization marker representing tire-road footprint where normal force $F_z$, longitudinal $F_x$, and lateral $F_y$ act.

## 4. Connection to V1 Vehicle Dynamics

- **Steering Angle ($\delta$):** Directly feeds `LATERAL_DYNAMICS_BICYCLE_MODEL.md` ($F_{yf} = C_{\alpha f}\alpha_f$).
- **Wheelbase ($L$), Track Width ($t$), CG Height ($h$):** Govern `WEIGHT_TRANSFER_MODEL.md`.
- **Effective Tire Radius ($r_{eff}$):** Governs `POWERTRAIN_SIMULATION_SPECIFICATION.md` ($F_{tractive} = T_{wheel}/r_{eff}$).
- **V1 Boundary:** Visual suspension deflection/pitch/roll animations in 3D respond proportionally to computed quasi-static $a_x, a_y$ outputs for educational clarity without running a full K&C multibody solver.

## 5. Cross-References

- [`COMPONENT_ANATOMY_SPECIFICATION.md`](COMPONENT_ANATOMY_SPECIFICATION.md)
- [`../04-vehicle-dynamics/LATERAL_DYNAMICS_BICYCLE_MODEL.md`](../04-vehicle-dynamics/LATERAL_DYNAMICS_BICYCLE_MODEL.md)
- [`../04-vehicle-dynamics/WEIGHT_TRANSFER_MODEL.md`](../04-vehicle-dynamics/WEIGHT_TRANSFER_MODEL.md)
