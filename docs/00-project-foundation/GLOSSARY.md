# Project Glossary — KINERA

**Document ID:** `KIN-DOC-00-05`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Establishes unambiguous definitions for key automotive engineering, vehicle dynamics, simulation, and software terms across all KINERA documentation. For mathematical symbol tables and cross-curriculum normalization, see [`../09-learning-and-content/GLOSSARY_AND_TERMINOLOGY.md`](../09-learning-and-content/GLOSSARY_AND_TERMINOLOGY.md).

## 2. Vehicle Architecture & Drivetrain Terms

- **Canonical Configuration:** One of the seven standardized V1 vehicle layouts identified by a stable ID (`vehicle.config.*`) and code (`ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `ICE-4WD`, `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD`).
- **Front-Wheel Drive (FWD):** Architecture delivering propulsion torque exclusively to the front axle; typically uses a transverse prime mover and integrated transaxle.
- **Rear-Wheel Drive (RWD):** Architecture delivering propulsion torque exclusively to the rear axle; ICE reference uses a longitudinal engine, separate gearbox, driveshaft, and rear differential.
- **All-Wheel Drive (AWD):** Multi-axle drive architecture capable of delivering torque to front and rear axles continuously or on-demand via a center differential, viscous/electro-hydraulic coupling, power transfer unit, or dual electric motors; lacks a dedicated mechanical low-range reduction transfer case (in passenger-car sense).
- **Four-Wheel Drive (4WD):** Multi-axle architecture utilizing a transfer case with selectable drive states (`2H`, `4H`, and low-range `4L` gear reduction), distinguished into **part-time 4WD** (rigidly couples front/rear axles in `4H`/`4L`, intended for low-traction surfaces) and **full-time 4WD** (incorporates a lockable center differential for paved-surface operation).
- **Transaxle:** Compact housing integrating the transmission gearset and final-drive differential into a single structural assembly, standard in transverse FWD layouts and certain mid/rear-engine architectures.
- **Transfer Case:** Auxiliary drivetrain gearbox downstream of the main transmission in 4WD/certain AWD layouts that splits torque to front and rear driveshafts and optionally provides a low-range reduction gearset (`4L`).
- **CV Joint (Constant-Velocity Joint):** Articulating shaft coupling allowing driven steerable or independently suspended wheels to transmit torque smoothly at variable suspension/steering angles without rotational speed fluctuation.
- **Universal Joint (U-Joint):** Cross-trunnion mechanical coupling typically used on longitudinal driveshafts operating at modest angles; exhibits non-uniform angular velocity across a single joint unless paired in phase.

## 3. Powertrain Engineering Terms

- **Torque ($T$):** Rotational turning moment measured in newton-meters ($\text{N}\cdot\text{m}$). Must always be qualified by location: engine/motor shaft torque, transmission output torque, total axle torque, or per-wheel torque.
- **Angular Velocity ($\omega$):** Rotational speed in radians per second ($\text{rad/s}$), converted from revolutions per minute via $\omega = 2\pi \cdot \text{RPM} / 60$.
- **Mechanical Power ($P$):** Rate of mechanical work ($P = T\omega$), expressed internally in watts ($\text{W}$) and displayed in $\text{W}$ or $\text{kW}$.
- **Gear Ratio ($G$):** Ratio of transmission input angular speed to output angular speed ($\omega_{in}/\omega_{out}$); values $>1$ multiply torque and reduce output speed.
- **Final Drive Ratio ($F$):** Fixed reduction ratio within the differential ring-and-pinion or transaxle final reduction stage between gearbox output and wheel axles.
- **Open Differential:** Gear mechanism allowing left and right output shafts to rotate at different speeds while turning, dividing input torque symmetrically (50/50 ignoring internal friction) such that maximum total axle torque is bounded by twice the torque sustainable by the lower-traction wheel.
- **Limited-Slip Differential (LSD):** Differential incorporating friction clutches, helical gears, or fluid coupling to bias torque toward the higher-traction wheel when wheel speed or torque asymmetry occurs.
- **Locked Differential:** Mechanical or electro-mechanical engagement forcing left and right (or front and rear) output shafts to rotate at identical angular velocity ($\omega_L = \omega_R$), permitting asymmetric torque distribution up to each tire's traction limit.
- **BMS (Battery Management System):** Electronic control and monitoring unit managing pack voltage, current, State of Charge (SOC), cell balancing awareness, thermal state, and safe power limits.
- **Inverter:** Power electronics assembly converting DC battery power into controlled multi-phase AC current/voltage for an AC electric traction motor, and reversing power flow during regenerative braking.
- **Regenerative Braking:** Operating an electric motor as a generator during deceleration so vehicle kinetic energy is converted via the inverter back into electrical energy stored in the battery pack, subject to motor, inverter, battery SOC, and tire-friction bounds.

## 4. Vehicle Dynamics Terms

- **SAE Vehicle Coordinate Convention (V1 Reference):** Right-handed vehicle-fixed axes at CG where $+X$ points forward along vehicle longitudinal axis, $+Y$ points to the driver's right (or ISO $+Y$ left—KINERA explicitly specifies its axis convention in `VEHICLE_DYNAMICS_OVERVIEW.md` and enforces sign consistency everywhere!). *(Note: KINERA adopts ISO 8855 for simulation dynamics: $+X$ forward, $+Y$ left, $+Z$ up, positive yaw $r$ counterclockwise looking from above; documented explicitly in `VEHICLE_DYNAMICS_OVERVIEW.md`.)*
- **Tractive Force ($F_{tractive}$):** Longitudinal force applied by driven tire contact patches onto the road surface to propel the vehicle ($\text{N}$).
- **Aerodynamic Drag ($F_{drag}$):** Retarding aerodynamic resistance proportional to air density, drag coefficient, frontal area, and velocity squared ($\frac{1}{2}\rho C_d A v^2$).
- **Rolling Resistance ($F_{rolling}$):** Energy-dissipation force from cyclic tire carcass deformation at the contact patch ($C_{rr} m g \cos\theta$).
- **Grade Resistance ($F_{grade}$):** Gravitational component opposing motion on an incline of angle $\theta$ ($m g \sin\theta$).
- **Bicycle Model (2-DOF Linear):** Simplified planar lateral dynamics model lumping left/right front tires into one front wheel and left/right rear tires into one rear wheel, modeling lateral velocity ($v_y$) and yaw rate ($r$) under small-angle linear tire stiffness ($F_y = C_\alpha \alpha$).
- **Slip Angle ($\alpha$):** Angle between the direction a wheel is pointing (wheel heading) and the direction its contact patch velocity vector is actually traveling ($\text{rad}$).
- **Understeer / Oversteer:** Steady-state cornering tendency measured via understeer gradient $K_{us}$: understeer ($K_{us} > 0$) requires increased steering angle with rising lateral acceleration as the front axle saturates earlier; oversteer ($K_{us} < 0$) shows rear slip angle exceeding front slip angle.
- **Weight Transfer ($\Delta F_z$):** Dynamic redistribution of vertical tire normal forces between front/rear axles under longitudinal acceleration ($a_x$) and left/right wheels under lateral acceleration ($a_y$), while total normal load remains conserved on flat level ground.
- **Friction Circle:** Simplified vector bound stating that combined longitudinal ($F_x$) and lateral ($F_y$) tire forces cannot exceed $\mu F_z$: $(F_x/\mu F_z)^2 + (F_y/\mu F_z)^2 \le 1$.

## 5. Software & Data Terms

- **Canonical ID:** Immutable, lowercase, dot-separated identifier (e.g., `ice.engine.crankshaft`) serving as the sole machine key across registries, 3D manifests, schemas, and simulation contracts.
- **Offline-First:** Architectural property ensuring all primary exploration, 3D inspection, and simulation workflows run locally in the browser using cached static bundles and WASM without requiring server connectivity.
- **Deterministic Simulation:** Property where identical `SimulationInput` payloads produce bit-identical (within cross-platform IEEE-754 floating-point rules) `SimulationOutput` results across repeated runs.
