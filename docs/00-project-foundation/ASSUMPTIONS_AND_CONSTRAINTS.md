# Assumptions and Constraints — KINERA

**Document ID:** `KIN-DOC-00-06`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Documents every foundational engineering, physical, numerical, technical, and educational constraint governing KINERA V1. Making these boundaries explicit enforces the *Engineering Accuracy* and *Transparent Simulation* product principles.

## 2. Physics & Mathematical Modeling Assumptions

### 2.1 Powertrain Modeling Assumptions
- **ASM-PWT-01 (Reference ICE):** Default ICE models a naturally aspirated inline-4 four-stroke spark-ignition engine represented via a steady-state full-load torque curve $T_{eng}(\text{RPM})$ modulated by throttle demand $\tau \in [0, 1]$, neglecting transient intake manifold filling and turbocharger spool lag.
- **ASM-PWT-02 (Manual Gearbox Clutch Coupling):** Steady-state gear engagement assumes locked clutch above idle/launch blend speed; clutch launch slip is approximated smoothly near zero vehicle speed to prevent division-by-zero or zero-RPM stall singularities without modeling thermal clutch wear.
- **ASM-PWT-03 (Single Efficiency Accounting):** Drivetrain stage efficiencies ($\eta_{trans}, \eta_{fd}, \eta_{tc}$) are multiplied strictly once along each active mechanical path—never stacked redundantly on top of an aggregate $\eta_{drivetrain}$.
- **ASM-PWT-04 (EV Motor & Battery):** EV motors use parameterized peak torque-speed envelopes (constant-torque region transitioning into constant-power field-weakening region) and 2D efficiency maps $\eta_{motor}(\text{RPM}, T)$; battery voltage $V_{pack}(\text{SOC})$ uses a simplified open-circuit plus internal resistance ($V_{oc} - I R_{int}$) curve rather than electrochemical PDEs.
- **ASM-PWT-05 (No Free Energy in Differentials):** Total mechanical power leaving any differential cannot exceed input power times differential efficiency ($\sum T_{out,i}\omega_{out,i} \le \eta_{diff} T_{in}\omega_{in}$).

### 2.2 Vehicle Dynamics Modeling Assumptions
- **ASM-VDY-01 (Coordinate System):** ISO 8855 vehicle-fixed coordinates ($+X$ forward, $+Y$ left, $+Z$ up) are locked across all physics equations and converted explicitly at the Three.js rendering boundary ($+Y_{3D}$ up, $+Z_{3D}$ forward/right-handed mapping documented in `3D_ASSET_SPECIFICATION.md`).
- **ASM-VDY-02 (Rigid-Body Flat/Constant-Slope Surface):** Longitudinal and braking models treat the vehicle as a rigid mass on a uniform plane of slope $\theta$; suspension heave, pitch angle dynamics, and bumpy road profiles are omitted.
- **ASM-VDY-03 (Linear Bicycle Model Bounds):** Lateral dynamics assumes constant or slowly varying longitudinal speed $v_x > v_{min}$, small steering angles ($\sin\delta \approx \delta$), small tire slip angles ($|\alpha| \le 6^\circ\text{--}8^\circ$), linear lateral stiffness ($F_y = C_\alpha \alpha$), and negligible aerodynamic lift/roll steer. UI must display a validity warning when $|\alpha| > 6^\circ$ or lateral acceleration $|a_y| > 0.4g$ (configurable threshold) where real tires become nonlinear.
- **ASM-VDY-04 (Quasi-Static Weight Transfer):** $\Delta F_z = m a_x h / L$ and $\Delta F_{z,lat} \approx m a_y h / t$ neglect suspension roll-center height, anti-dive/anti-squat geometry, sprung vs. unsprung mass split, and chassis torsional compliance.
- **ASM-VDY-05 (Simplified Tire Friction):** Peak tire force obeys $|F| \le \mu F_z$ using an isotropic simplified friction circle; camber thrust, load sensitivity degradation ($\mu$ dropping at high $F_z$), and wet hydroplaning transients are excluded.
- **ASM-VDY-06 (Rotational Inertia Approximation):** Effective translational mass may optionally include a documented rotational inertia factor $\gamma_m$ (or explicit wheel/drivetrain inertia $J$) only when explicitly toggled and displayed; baseline longitudinal equations use $a = F_{net}/m$ as specified in V1 baseline equations so analytical verification matches hand calculations cleanly.

## 3. Technical & Architectural Constraints

- **CON-TECH-01 (SI Units Internals):** Every Rust struct, WASM payload, JSON dataset, and internal TypeScript simulation state stores values strictly in SI base/derived units ($\text{m}, \text{kg}, \text{s}, \text{N}, \text{N}\cdot\text{m}, \text{rad}, \text{rad/s}, \text{W}, \text{J}, \text{V}, \text{A}$). Unit conversions (e.g., $\text{km/h}$, $\text{kW}$, $\text{kWh}$, $\text{RPM}$, degrees) occur strictly at UI presentation and human input parsing boundaries.
- **CON-TECH-02 (Zero Main-Thread Blocking Physics):** Multi-step time-series simulations execute inside a dedicated Web Worker hosting the Rust/WASM module; main UI thread handles React state, controls, and Three.js rendering.
- **CON-TECH-03 (Offline Self-Containment):** All 7 vehicle configurations, component metadata, JSON schemas, equation definitions, Insights/Library markdown/JSON, WASM binary, and core 3D GLB assets must bundle into static build artifacts cacheable by a Service Worker.
- **CON-TECH-04 (3D Rendering Budget):** Standard scenes target $\approx 150,000$ active triangles and $\approx 120$ draw calls, enforcing lazy loading of inactive vehicle assemblies so mobile GPUs remain stable during configuration switching.
- **CON-TECH-05 (Immutable Canonical IDs):** Display names may localize or change, whereas canonical dot-separated IDs (e.g., `ice.engine.crankshaft`) must never be altered once published without a versioned deprecation alias.

## 4. Educational & Product Constraints

- **CON-EDU-01 (No Universal Winner):** Configuration comparisons must never label FWD, RWD, AWD, 4WD, or EV layouts as universally superior; outputs must show exact scenario parameters alongside trade-offs.
- **CON-EDU-02 (Simulated Estimate Labeling):** Every 0–100 km/h, quarter-mile, top speed, range, or stopping distance output must carry an explicit UI notice clarifying it is an educational simulation output from modeled assumptions, not a verified production vehicle test result.
- **CON-EDU-03 (Verified References):** Every cited textbook, SAE standard, or IEEE paper must follow `TECHNICAL_REFERENCE_POLICY.md`; unverified citations must be tagged `[VERIFICATION_REQUIRED]`.

## 5. Cross-References

- [`PRODUCT_SCOPE.md`](PRODUCT_SCOPE.md)
- [`../04-vehicle-dynamics/VEHICLE_DYNAMICS_OVERVIEW.md`](../04-vehicle-dynamics/VEHICLE_DYNAMICS_OVERVIEW.md)
- [`../05-simulation-engine/NUMERICAL_METHODS_AND_STABILITY.md`](../05-simulation-engine/NUMERICAL_METHODS_AND_STABILITY.md)
- [`../09-learning-and-content/TECHNICAL_REFERENCE_POLICY.md`](../09-learning-and-content/TECHNICAL_REFERENCE_POLICY.md)
