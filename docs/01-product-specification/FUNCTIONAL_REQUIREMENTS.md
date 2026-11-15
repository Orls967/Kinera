# Functional Requirements — KINERA

**Document ID:** `KIN-DOC-01-03`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Decomposes high-level PRD goals (`KIN-PRD-001`–`KIN-PRD-020`) into atomic, uniquely identified, testable functional requirements (`KIN-FR-001`–`KIN-FR-048`) organized by application domain.

## 2. Global Navigation & Configuration Architecture (`KIN-FR-001` – `KIN-FR-007`)

| ID | PRD Ref | Functional Requirement |
| :--- | :--- | :--- |
| **KIN-FR-001** | KIN-PRD-001 | The application shall provide persistent top-level navigation across `Overview`, `Vehicle Anatomy`, `Powertrain Journey`, `Engineering Simulator`, `Engineering Insights`, and `Technical Library`. |
| **KIN-FR-002** | KIN-PRD-002 | The global Configuration Selector shall expose all 7 canonical configurations (`ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `ICE-4WD`, `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD`) with clear ICE/EV and driven-axle tags. |
| **KIN-FR-003** | KIN-PRD-003 | Changing the active configuration shall update the active 3D vehicle assembly, component hierarchy tree, drivetrain topology graph, power-flow sequence, simulator parameter defaults, and contextual learning links atomically without page reload. |
| **KIN-FR-004** | KIN-PRD-017 | The UI shall provide a unit display preference (`km/h` vs `m/s`, `kW` vs `W`, `deg` vs `rad`) while guaranteeing that internal state and Rust/WASM payloads remain strictly in SI units. |
| **KIN-FR-005** | KIN-PRD-018 | An offline status indicator shall reflect Service Worker cache readiness and verify that core simulation and exploration functions remain operational with network disabled. |
| **KIN-FR-006** | KIN-PRD-001 | The `Overview` section shall present KINERA's three core pillars, an interactive 360° vehicle showcase with exterior-to-chassis reveal, and direct deep links to each configuration's anatomy and simulation presets. |
| **KIN-FR-007** | KIN-PRD-009 | For `ICE-4WD`, the configuration state shall support selectable transfer-case operating modes (`2H`, `4H`, `4L`) and display whether part-time or full-time center coupling is modeled. |

## 3. Vehicle Anatomy & 3D Inspection (`KIN-FR-008` – `KIN-FR-017`)

| ID | PRD Ref | Functional Requirement |
| :--- | :--- | :--- |
| **KIN-FR-008** | KIN-PRD-004 | Vehicle Anatomy shall display the complete 3D assembly matching the active configuration across all 7 system categories: Vehicle Structure, ICE & Fuel, EV Electrical, Transmission & Drivetrain, Suspension & Steering, Braking, and Wheels & Tires. |
| **KIN-FR-009** | KIN-PRD-004 | Users shall be able to switch inspection focus presets: Full Vehicle, Powertrain, Chassis, Suspension, and Brake System. |
| **KIN-FR-010** | KIN-PRD-004 | Clicking or selecting any component in the 3D viewport or hierarchy tree shall highlight the component, frame or focus the camera cleanly on user request, and open its Component Inspector panel. |
| **KIN-FR-011** | KIN-PRD-004 | Users shall be able to isolate a single component or subsystem, toggle per-layer visibility, adjust body/housing transparency, and trigger parametric exploded-assembly separation. |
| **KIN-FR-012** | KIN-PRD-004 | Users shall be able to enable and scrub an interactive section-cut plane across supported assemblies (e.g., engine block, transaxle/gearbox, differential housing, battery pack). |
| **KIN-FR-013** | KIN-PRD-005 | The Component Inspector shall render all contract fields for the selected canonical ID: name, category, subsystem, supported configs, description, primary function, operating principle, inputs/outputs, physical properties, technical specs, and references. |
| **KIN-FR-014** | KIN-PRD-005 | The Component Inspector shall display interactive upstream and downstream relationship links (e.g., `ice.engine.crankshaft` -> `ice.clutch.flywheel`) allowing click-through navigation to adjacent components. |
| **KIN-FR-015** | KIN-PRD-004 | Users shall be able to toggle power-flow edge highlighting directly onto the 3D anatomy to visualize which shafts and axles carry torque under the active configuration. |
| **KIN-FR-016** | KIN-PRD-004 | Camera presets (Isometric Front-3/4, Side Profile, Top Plan, Front Axle, Rear Axle, Underbody Drivetrain) shall smoothly interpolate camera position and target without snapping abruptly. |
| **KIN-FR-017** | KIN-PRD-020 | Inactive vehicle configuration meshes shall be lazy-loaded on demand and unloaded/cached within the memory budget. |

## 4. Powertrain Journey (`KIN-FR-018` – `KIN-FR-023`)

| ID | PRD Ref | Functional Requirement |
| :--- | :--- | :--- |
| **KIN-FR-018** | KIN-PRD-006 | Powertrain Journey shall adapt its step sequence automatically to the selected configuration's propulsion type (ICE vs. EV) and axle topology (FWD, RWD, AWD, 4WD, Dual-Motor AWD). |
| **KIN-FR-019** | KIN-PRD-006 | Users shall have full playback controls: Play, Pause, Replay, Step Forward, Step Backward, Playback Speed (`0.5x`, `1.0x`, `2.0x`), and direct step scrubber. |
| **KIN-FR-020** | KIN-PRD-006 | Each journey stage shall highlight active components in 3D, animate mechanical/electrical motion (pistons/crankshaft, gears, differential spiders, motor rotor, wheel spin), and display stage-level RPM, torque, power, and cumulative loss indicators. |
| **KIN-FR-021** | KIN-PRD-006 | For `ICE-AWD`, `ICE-4WD`, and `EV-DUAL-AWD`, Powertrain Journey shall visually depict torque branching to both front and rear axles with live percentage split callouts. |
| **KIN-FR-022** | KIN-PRD-006 | For EV configurations (`EV-FWD`, `EV-RWD`, `EV-DUAL-AWD`), Powertrain Journey shall support switching between **Propulsion Mode** (Battery -> Wheels) and **Regenerative Braking Mode** (Wheels -> Motor/Generator -> Inverter -> Battery). |
| **KIN-FR-023** | KIN-PRD-006 | Journey annotations shall distinguish **energy flow** ($\text{J}, \text{kWh}$), **power flow** ($\text{W}, \text{kW}$), **torque** ($\text{N}\cdot\text{m}$), and **rotational speed** ($\text{RPM}, \text{rad/s}$). |

## 5. Engineering Simulator (`KIN-FR-024` – `KIN-FR-041`)

### 5.1 Powertrain Simulation Module
| ID | PRD Ref | Functional Requirement |
| :--- | :--- | :--- |
| **KIN-FR-024** | KIN-PRD-007, 010 | For ICE configurations, Powertrain Simulation shall accept engine RPM or torque-curve throttle, gear selection (`1`–`5`/`6` + Reverse/Neutral), gear ratios, final drive ratio, drivetrain efficiency, tire effective radius, and vehicle mass. |
| **KIN-FR-025** | KIN-PRD-008, 010 | For EV configurations, Powertrain Simulation shall accept battery voltage/SOC, motor RPM, motor torque or torque-speed map, motor efficiency, inverter efficiency, reduction ratio, tire effective radius, and vehicle mass (plus front/rear split for `EV-DUAL-AWD`). |
| **KIN-FR-026** | KIN-PRD-010 | Powertrain Simulation shall compute and display angular velocity ($\omega$), engine/motor mechanical power, electrical input power & battery current (EV), transmission/reduction output torque & RPM, driveshaft RPM (where present), total axle torque, per-wheel torque, wheel RPM, tractive force, stage losses, and estimated steady-state speed. |
| **KIN-FR-027** | KIN-PRD-009 | Users shall be able to select differential behavior (`Open`, `Simplified LSD`, `Locked`, `Center Differential`, or `EV Electronic Allocation` where supported) and apply asymmetric left/right or front/rear surface $\mu$ to observe torque transfer vs. wheel-spin limits. |
| **KIN-FR-028** | KIN-PRD-010 | The solver shall enforce topology-aware power routing across all 7 layouts without double-counting efficiencies or applying a single generic single-axle equation to multi-axle layouts. |

### 5.2 Vehicle Dynamics Simulation Module
| ID | PRD Ref | Functional Requirement |
| :--- | :--- | :--- |
| **KIN-FR-029** | KIN-PRD-011 | Longitudinal Dynamics shall simulate time-history acceleration and steady-state force balance incorporating $F_{tractive}$, $F_{drag}$, $F_{rolling}$, and $F_{grade}$ across configurable mass, $C_d$, frontal area, $C_{rr}$, air density, and road gradient $\theta$. |
| **KIN-FR-030** | KIN-PRD-011 | Longitudinal Dynamics shall render interactive plots for Speed vs. Time, Distance vs. Time, Acceleration vs. Time, Tractive Force vs. Speed, and Power Demand vs. Speed. |
| **KIN-FR-031** | KIN-PRD-012 | Lateral Dynamics shall execute a 2-DOF linear bicycle model accepting speed $v_x$, steering angle $\delta$, wheelbase $L$, mass $m$, CG position ($a, b$), yaw inertia $I_z$, and cornering stiffnesses $C_{\alpha f}, C_{\alpha r}$. |
| **KIN-FR-032** | KIN-PRD-012 | Lateral Dynamics shall output and plot yaw rate $r$, lateral acceleration $a_y$, body sideslip angle $\beta$, front/rear slip angles $\alpha_f, \alpha_r$, turning radius, XY vehicle trajectory, and understeer/oversteer gradient indicator. |
| **KIN-FR-033** | KIN-PRD-012, 019 | Lateral Dynamics shall trigger an explicit non-blocking model validity banner whenever $|\alpha_f|$ or $|\alpha_r|$ exceeds the small-angle linear threshold ($> 6^\circ$) or $|a_y| > 0.4g$. |
| **KIN-FR-034** | KIN-PRD-013 | Braking Dynamics shall compute deceleration, stopping distance, stopping time, front/rear brake force allocation (via configurable brake bias), friction-limit clamping ($|F_x| \le \mu F_z$), and conceptual ABS wheel-slip threshold indicators. |
| **KIN-FR-035** | KIN-PRD-013 | Weight Transfer shall compute and visualize quasi-static front/rear longitudinal load transfer ($\Delta F_z = m a_x h / L$) and left/right lateral load transfer ($\Delta F_{z,lat} \approx m a_y h / t$) dynamically updating 4-wheel normal load bars ($F_{z,FL}, F_{z,FR}, F_{z,RL}, F_{z,RR}$). |
| **KIN-FR-036** | KIN-PRD-014 | Tire Traction & Friction Circle shall display per-wheel or per-axle friction limit $\mu F_z$ and plot real-time combined $(F_x, F_y)$ operating points inside the simplified friction circle $(F_x/\mu F_z)^2 + (F_y/\mu F_z)^2 \le 1$. |
| **KIN-FR-037** | KIN-PRD-014 | Performance Analysis shall compute model-based estimates for 0–100 km/h, quarter-mile (402.336 m) time & trap speed, theoretical top speed, 100–0 km/h braking distance, steady cornering speed/radius, maximum gradeability, EV/ICE energy consumption, and power-to-weight ratio ($\text{kW/tonne}$). |
| **KIN-FR-038** | KIN-PRD-014, 019 | Every performance metric shall carry a visible badge: *"Simulated Model Estimate — Not Production Vehicle Data"* and link to its exact equations and assumptions. |

### 5.3 Configuration Comparison Module
| ID | PRD Ref | Functional Requirement |
| :--- | :--- | :--- |
| **KIN-FR-039** | KIN-PRD-015 | Configuration Comparison shall allow users to select 2 to 4 (up to all 7 in summary matrix) configurations to run against a shared simulation scenario. |
| **KIN-FR-040** | KIN-PRD-015 | Comparison mode shall provide a **"Lock Matched Baseline"** toggle synchronizing shared mass, peak power, tire radius, tire $\mu$, aero ($C_d, A$), road gradient, and driver inputs across compared configurations, and prominently flag any parameter that differs. |
| **KIN-FR-041** | KIN-PRD-015 | Comparison outputs shall render overlaid speed/acceleration/traction/energy charts and tabular trade-off metrics without assigning a universal "winner" badge. |

## 6. Engineering Insights & Technical Library (`KIN-FR-042` – `KIN-FR-048`)

| ID | PRD Ref | Functional Requirement |
| :--- | :--- | :--- |
| **KIN-FR-042** | KIN-PRD-016 | Engineering Insights shall present all four structured curriculum groups (Powertrain Fundamentals, Vehicle Architecture, Vehicle Dynamics, EV Engineering) with search, prerequisite tags, and topic filtering. |
| **KIN-FR-043** | KIN-PRD-016 | Each Insights topic shall display learning objectives, engineering explanation, rendered mathematical equations with variable/SI unit definitions, visual diagram/3D link, worked example, and references. |
| **KIN-FR-044** | KIN-PRD-016 | Insights topics and Technical Library modules shall include **"Inspect in 3D"** and **"Run in Simulator"** deep-link actions that pre-load the relevant configuration, component isolation, or simulation preset. |
| **KIN-FR-045** | KIN-PRD-016 | Technical Library shall present all 10 canonical engineering modules using the uniform 9-part module template (Overview, Fundamentals, Component Breakdown, Operating Principles, Equations & Models, Applications, Related Simulations, Glossary, References). |
| **KIN-FR-046** | KIN-PRD-016 | Equation definitions and glossary terms displayed across Simulator, Insights, and Library shall resolve from shared canonical JSON registries to prevent contradictory definitions. |
| **KIN-FR-047** | KIN-PRD-019 | Every simulation input panel shall offer inline contextual explanation tooltips ("Understand Before Simulating") linking to the underlying Engineering Insights topic. |
| **KIN-FR-048** | KIN-PRD-018 | Users shall be able to export/import custom simulation scenario JSON presets locally offline (plus optional FastAPI share snapshot when online). |

## 7. Cross-References

- [`PRODUCT_REQUIREMENTS_DOCUMENT.md`](PRODUCT_REQUIREMENTS_DOCUMENT.md)
- [`FEATURE_SPECIFICATIONS.md`](FEATURE_SPECIFICATIONS.md)
- [`ACCEPTANCE_CRITERIA.md`](ACCEPTANCE_CRITERIA.md)
- [`../12-project-governance/REQUIREMENTS_TRACEABILITY_MATRIX.md`](../12-project-governance/REQUIREMENTS_TRACEABILITY_MATRIX.md)
