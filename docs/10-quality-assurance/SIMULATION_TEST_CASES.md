# KINERA Simulation Test Cases

**Document ID:** `KIN-DOC-10-04`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines concrete, executable pass/fail simulation test vectors (`TEST-SIM-*`) covering core powertrain, vehicle dynamics, multi-configuration comparison, and all 19 mandatory physical/numerical edge cases specified in [`SIMULATION_ERROR_HANDLING.md`](../05-simulation-engine/SIMULATION_ERROR_HANDLING.md).

---

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-QA-009** | Every simulation mode (`Powertrain`, `Longitudinal`, `Lateral`, `Braking`, `Comparison`) shall have repeatable fixture test cases verifying numerical outputs, warnings, and disclaimer metadata. |
| **KIN-QA-010** | All 19 documented physical/numerical edge cases shall be covered by deterministic automated tests asserting safe clamping, graceful warnings, or clean structured error codes (`ERR_*`). |
| **KIN-QA-011** | Performance benchmark estimates (`0–100 km/h`, quarter-mile, top speed, braking distance, max steady-state $a_y$, gradeability) shall enforce conservative sanity bounds and return mandatory `Simulated Model Estimate` provenance flags. |

---

## 3. Core Functional & Physics Test Matrix

| Test ID | Scope / Config | Scenario Input (SI) | Expected Output / Assertion | Mapped Eq / Req |
| :--- | :--- | :--- | :--- | :--- |
| **TEST-SIM-001** | `ICE-FWD` Steady Cruise | `rpm=3000`, `G=1.0`, `F=4.05`, $\eta=0.917$, $T_{eng}=180\text{ N}\cdot\text{m}$, $r_{eff}=0.315\text{ m}$ | $\omega_{eng}=314.159\text{ rad/s}$, $T_{wheels}=668.493\text{ N}\cdot\text{m}$, $F_{trac}=2122.20\text{ N}$ ($\pm 10^{-3}$) | `eq.powertrain.gearbox-torque`, `KIN-PWT-006` |
| **TEST-SIM-002** | `ICE-RWD` Launch vs Weight Transfer | `m=1500 kg`, $L=2.70$, $a=1.15$, $b=1.55$, $h=0.54$, $\mu=0.85$, high throttle | Rear $\Delta F_z > 0$ boosts $F_{cap,R}$ above static load, enabling higher launch grip than `ICE-FWD` | `eq.dynamics.weight-transfer-longitudinal`, `AC-015` |
| **TEST-SIM-003** | `ICE-AWD` Split-$\mu$ Diff Comparison | Front open diff ($\mu_{FL}=0.15, \mu_{FR}=0.85$), Rear LSD ($\text{TBR}=2.5$) | Front axle total limited to $2 \times T_{cap,FL}$; rear LSD transfers bias up to `2.5x` inner cap + preload | `eq.powertrain.open-diff`, `eq.powertrain.lsd-diff`, `AC-009` |
| **TEST-SIM-004** | `ICE-4WD` Mode Transition `4H` -> `4L` | Same ICE `rpm=2500`, `G=1.8`, toggle `transferCaseMode`: `4H` (`1.0`) -> `4L` (`2.48`) | Wheel torque scales by `2.48 * (eta_4L/eta_4H)`; wheel RPM drops by `1/2.48`; `2H` sends `0 N*m` to front axle | `KIN-PWT-022`, `AC-009` |
| **TEST-SIM-005** | `EV-FWD` Motor Field Weakening | $T_{peak}=310\text{ N}\cdot\text{m}$, $P_{peak}=150\text{ kW}$, sweep $\omega: 0 \to 1200\text{ rad/s}$ | Constant $310\text{ N}\cdot\text{m}$ up to $\omega_{base}=483.87\text{ rad/s}$; hyperbolic $150000/\omega$ above | `eq.ev.motor-envelope`, `KIN-PWT-011` |
| **TEST-SIM-006** | `EV-DUAL-AWD` Torque Split | Front $100\text{ kW}$, Rear $200\text{ kW}$, split mode `35:65` then `50:50` | Front/Rear shaft torque & power draw match commanded split within motor caps; battery current sums both inverters | `KIN-PWT-012`, `eq.ev.electrical-power` |
| **TEST-SIM-007** | `EV-RWD` Regen Braking | $v_0 = 25\text{ m/s}$, negative torque command, `soc=0.50` | Mechanical friction brakes blend with motor regen; `soc` increases proportionally to regen energy absorbed | `eq.ev.energy-consumption`, `KIN-VEH-028` |
| **TEST-SIM-008** | Longitudinal Acceleration Sweep | Level road ($\theta=0$), `Cd=0.28, A=2.2, C_rr=0.011, m=1500`, WOT $0\to 30\text{ s}$ | $v_x$ converges asymptotically where $F_{tractive}(v) = F_{drag}(v) + F_{rolling}$; RK4 drift $< 0.2\%$ vs ref | `eq.dynamics.longitudinal-accel`, `AC-010` |
| **TEST-SIM-009** | 2-DOF Bicycle Steady-State Cornering | $v_x=20\text{ m/s}$, $\delta=0.025\text{ rad}$, understeer preset ($K_{us} > 0$) | $r(t)$ settles within $2\text{ s}$ to $r_{ss} = \frac{v_x \delta}{L + K_{us} v_x^2}$ ($\le 0.01\%$ error); $\alpha_f, \alpha_r$ within $|\alpha| \le 6^\circ$ | `eq.dynamics.bicycle-yaw`, `AC-011` |
| **TEST-SIM-010** | Straight-Line Braking & Bias | $v_0 = 27.7778\text{ m/s}$, brake force clamped by ABS $\mu F_z$ | Constant-decel check matches $v_0^2/(2|a|)$; dynamic front weight transfer increases $F_{cap,F}$ | `eq.dynamics.stopping-distance`, `AC-012` |
| **TEST-SIM-011** | Combined Friction Circle Clamp | Cornering at $a_y=7.0\text{ m/s}^2$ + simultaneous heavy throttle ($F_x$ demand exceeds circle) | Wheel force clamps cleanly onto circle boundary $(F_x/\mu F_z)^2 + (F_y/\mu F_z)^2 = 1.0$; emits `WARN_TRACTION_SATURATED` | `eq.dynamics.friction-circle`, `AC-013` |
| **TEST-SIM-012** | Controlled Config Comparison | Select `ICE-FWD`, `ICE-RWD`, `EV-DUAL-AWD` with Matched Baseline enabled | Shared mass/drag/tire inputs identical across all 3 runs; output table marks `Simulated Model Estimate` | `KIN-FR-030`, `AC-014`, `AC-015` |

---

## 4. Mandatory 19 Edge-Case Test Matrix

Every row below maps 1-to-1 to Section 3 of [`SIMULATION_ERROR_HANDLING.md`](../05-simulation-engine/SIMULATION_ERROR_HANDLING.md):

| Test ID | Edge Case | Concrete Failing/Boundary Input | Required Result / Status Code |
| :--- | :--- | :--- | :--- |
| **TEST-EDGE-001** | Zero RPM | `rpm = 0.0` (engine stalled / stopped EV motor) | $\omega = 0.0, P = 0.0, \text{RPM}_{wheel} = 0.0$; zero `NaN`s (`OK`) |
| **TEST-EDGE-002** | Zero Torque | `throttle = 0.0`, Neutral or zero motor request | $P_{prop} = 0.0$, $F_{tractive} \le 0$ (or $0$ coast), zero division errors (`OK`) |
| **TEST-EDGE-003** | Zero Vehicle Speed | `v_x = 0.0`, `steerAngleRad = 0.1` | Kinematic limit forces $v_y = 0.0, r = 0.0, F_{drag} = 0.0$; no $v_x$ zero-divide (`OK`) |
| **TEST-EDGE-004** | Zero Tractive Force | `gear = 'N'` OR `mu = 0.0` | $a_x$ driven solely by resistance/grade/braking (`OK`) |
| **TEST-EDGE-005** | Max Supported RPM | `rpm = rpm_max + 500` | ICE cuts torque ($T_{eng} = 0$); EV clamps $\omega = \omega_{max}$ + `WARN_RPM_CLAMPED` |
| **TEST-EDGE-006** | Invalid Gear | `gearIndex = 7` on 6-speed OR gear shift requested on single-speed `EV-FWD` | Rejects cleanly before solver step: `ERR_SIM_INVALID_GEAR` |
| **TEST-EDGE-007** | Extreme Gear Ratios | `gearRatio = -2.0` (in forward slot), `gearRatio = 65.0`, or `finalDrive = 0.0` | Rejects before solver loop: `ERR_SIM_INVALID_RATIO` |
| **TEST-EDGE-008** | Zero / Invalid Efficiency | `stageEfficiency = 0.0` or `stageEfficiency = 1.05` or `0.02` | Rejects cleanly (`eta` must lie in `(0.05, 1.0]`): `ERR_SIM_INVALID_EFFICIENCY` |
| **TEST-EDGE-009** | Battery Depletion | `soc = 0.0` initial OR `soc` hits `0.02` mid-run (`EV-*`) | Clamps discharge power `0 W`, stops motor drive, coasts smoothly + `WARN_BATTERY_DEPLETED` |
| **TEST-EDGE-010** | Invalid Voltage | `v_pack = 0.0`, `v_pack = -50.0`, `v_pack = 1500.0`, or `NaN` | Rejects before $I = P/V$ computation: `ERR_SIM_INVALID_VOLTAGE` |
| **TEST-EDGE-011** | Invalid Mass | `mass_kg = 0.0`, `50.0`, `80000.0`, or `Inf` | Rejects cleanly: `ERR_SIM_INVALID_MASS` |
| **TEST-EDGE-012** | Negative Road Gradient | `gradePct = -10.0` ($\theta < 0$) | $F_{grade} < 0$ assists downhill acceleration; held steady when braking holds load (`OK`) |
| **TEST-EDGE-013** | High Road Resistance | `gradePct = 45.0` exceeding max $F_{tractive}$ | Gradeability test sets `gradeable = false`, $a_x \le 0$ + `CANNOT_CLIMB_GRADE` flag |
| **TEST-EDGE-014** | Low / Zero Tire Friction | `mu = 0.0` or `mu = 0.05` | Caps wheel force $F_{max} = \mu F_z$; zero `NaN` + `WARN_TRACTION_SATURATED` |
| **TEST-EDGE-015** | Zero Normal Load | Extreme $a_y$ driving $F_{z,inner} \le 0$ | Clamps $F_{z,i} = 0$, preserves $\sum F_z = m g \cos\theta$, emits `WARN_WHEEL_LIFT` |
| **TEST-EDGE-016** | Invalid Steering Input | `steerAngleRad = 1.2` ($> 45^\circ$) or `NaN` | Rejects `NaN` or out-of-bounds angle: `ERR_SIM_INVALID_STEERING` |
| **TEST-EDGE-017** | Extreme Time Step | `dt = 0.0001` or `dt = 0.2` or `NaN` | Rejects cleanly with valid bounds `[0.001, 0.05]` guidance: `ERR_SIM_INVALID_TIMESTEP` |
| **TEST-EDGE-018** | Disconnected Drivetrain | Custom graph omitting driveshaft between gearbox & rear diff on `ICE-RWD` | Topology pre-check fails before simulation: `ERR_TOPO_DISCONNECTED_PATH` |
| **TEST-EDGE-019** | Unsupported Topology | Unknown config ID or `EV` assigned mechanical transfer case `4L` | Topology pre-check fails: `ERR_TOPO_UNSUPPORTED_CONFIG` |

---

## 5. Warning & Regime Advisory Checks

In addition to the 19 edge cases above, verify non-fatal advisory codes:
- `WARN_LINEAR_BICYCLE_EXCEEDED`: Emitted whenever $|\alpha_f|$ or $|\alpha_r| > 0.1047\text{ rad}$ ($6^\circ$).
- `WARN_CRITICAL_SPEED_APPROACHED`: Emitted on oversteer configs ($K_{us} < 0$) when $v_x \ge 0.85 \sqrt{L / |K_{us}|}$.
- `WARN_4WD_WINDUP_RISK`: Emitted when `ICE-4WD` runs in `4H`/`4L` on high-$\mu$ ($\mu \ge 0.75$) cornering without center slip.

---

## 6. Cross-References

- [`ENGINEERING_VALIDATION_PLAN.md`](ENGINEERING_VALIDATION_PLAN.md)
- [`TOPOLOGY_VALIDATION_TESTS.md`](TOPOLOGY_VALIDATION_TESTS.md)
- [`../05-simulation-engine/SIMULATION_ERROR_HANDLING.md`](../05-simulation-engine/SIMULATION_ERROR_HANDLING.md)
- [`../07-data-and-contracts/ERROR_CONTRACTS.md`](../07-data-and-contracts/ERROR_CONTRACTS.md)
