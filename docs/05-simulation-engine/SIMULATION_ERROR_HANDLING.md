# Simulation Error Handling and Edge Cases — KINERA

**Document ID:** `KIN-DOC-05-08`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines comprehensive input validation bounds, structured error codes, and deterministic fallback behavior for all 19 mandatory edge cases (`KIN-SIM-028`–`KIN-SIM-030`), guaranteeing the Rust/WASM solver never panics, loops infinitely, or emits `NaN`/`Inf`.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-SIM-028** | Every simulation input parameter shall pass explicit domain bounds and finiteness (`is_finite()`) validation before entering physics evaluation. |
| **KIN-SIM-029** | All documented physical/numerical edge cases shall resolve deterministically with either safe physical behavior (e.g., zero output, warning badge) or a structured `SimulationError` code (`ERROR_CONTRACTS.md`). |
| **KIN-SIM-030** | Rust/WASM simulation crates shall forbid `.unwrap()` / `.expect()` on untrusted input paths so zero WASM panics can occur in production. |

## 3. Mandatory Edge-Case Behavior Matrix (19+ Edge Cases)

| # | Edge Case | Condition / Input | Required Engine Behavior | Status / Code |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **Zero RPM** | `rpm == 0` | Return $\omega = 0, P = 0$, valid wheel speed `0`, zero NaNs | `OK` (with idle warning if ICE running) |
| 2 | **Zero Torque** | `torque == 0` or `throttle == 0` | $P_{prop} = 0$, $F_{tractive} = 0$ (or engine-drag coast), coast-down governed by resistances | `OK` |
| 3 | **Zero Vehicle Speed** | `v_x == 0` | Lateral bicycle uses kinematic limit (`v_y = 0, r = 0`); drag $= 0$; static rolling friction prevents backward crawl | `OK` |
| 4 | **Zero Tractive Force** | `F_tractive == 0` (e.g. Neutral or $\mu=0$) | $a_x$ governed strictly by resistance/grade/brakes; no zero-div | `OK` |
| 5 | **Max Supported RPM** | `rpm > rpm_max` | ICE rev-limiter sets $T_{eng} = 0$; EV caps speed at $\omega_{max}$ + `WARN_RPM_CLAMPED` | `OK` + Warning |
| 6 | **Invalid Gear** | Gear index not in config (`gear = 7` or EV gear change) | Reject request cleanly before solver loop | `ERR_SIM_INVALID_GEAR` |
| 7 | **Extreme Gear Ratios** | $G \le 0$ (except `R < 0`, `N == 0`) or $|G| > 50$ or $F \le 0$ | Reject non-positive final drive or out-of-range gear ratios ($|G| \notin [0.2, 15.0]$ for forward/rev) | `ERR_SIM_INVALID_RATIO` |
| 8 | **Zero / Invalid Efficiency** | $\eta \le 0$ or $\eta > 1.0$ | Reject out-of-bounds efficiency (`eta` must lie in `(0.05, 1.0]`) | `ERR_SIM_INVALID_EFFICIENCY` |
| 9 | **Battery Depletion** | `soc <= 0.0` (or hits `soc_min = 0.02` mid-run) | Clamp available discharge power to `0 W`, coast vehicle down cleanly, flag `WARN_BATTERY_DEPLETED` | `OK` + Warning |
| 10 | **Invalid Voltage** | `v_pack <= 0` or `> 1200 V` or `NaN` | Reject before calculation (prevents $I = P/V$ divide-by-zero) | `ERR_SIM_INVALID_VOLTAGE` |
| 11 | **Invalid Mass** | `mass_kg <= 0` or `< 100 kg` or `> 50000 kg` | Reject cleanly (prevents $a = F/m$ blowup) | `ERR_SIM_INVALID_MASS` |
| 12 | **Negative Road Gradient** | $\theta < 0$ (downhill, e.g., $-10\%$) | $F_{grade} < 0$ assists forward motion accurately; stationary brake hold flagged if parked | `OK` |
| 13 | **High Road Resistance** | Steep hill + high $C_{rr}$ exceeding $F_{tractive,max}$ | Vehicle fails to climb ($a_x \le 0$); gradeability check reports `CANNOT_CLIMB_GRADE` cleanly | `OK` + Warning |
| 14 | **Low / Zero Tire Friction** | $\mu = 0.0$ or $\mu = 0.05$ | Caps wheel force $F_{max} = \mu F_z = 0$; open diff holds 0 drive; no NaN in friction circle check | `OK` + `WARN_TRACTION_SATURATED` |
| 15 | **Zero Normal Load** | Extreme load transfer drives $F_{z,i} \le 0$ | Clamp $F_{z,i} = 0$, conserve total load across remaining wheels, emit `WARN_WHEEL_LIFT` | `OK` + Warning |
| 16 | **Invalid Steering Input** | $|\delta| > 0.785\text{ rad}$ ($45^\circ$) or `NaN` | Reject or clamp beyond physical steering lock + raise linear model invalidity warning $> 6^\circ$ | `ERR_SIM_INVALID_STEERING` |
| 17 | **Extreme Time Step** | $\Delta t < 0.001\text{ s}$ or $\Delta t > 0.05\text{ s}$ or `NaN` | Reject cleanly with required bounds guidance | `ERR_SIM_INVALID_TIMESTEP` |
| 18 | **Disconnected Drivetrain** | Graph traversal fails to reach driven axle | Pre-run topology validator rejects configuration | `ERR_TOPO_DISCONNECTED_PATH` |
| 19 | **Unsupported Topology** | Unknown config ID or malformed node graph | Pre-run validator rejects configuration | `ERR_TOPO_UNSUPPORTED_CONFIG` |

## 4. Cross-References

- [`NUMERICAL_METHODS_AND_STABILITY.md`](NUMERICAL_METHODS_AND_STABILITY.md)
- [`../07-data-and-contracts/ERROR_CONTRACTS.md`](../07-data-and-contracts/ERROR_CONTRACTS.md)
- [`../10-quality-assurance/SIMULATION_TEST_CASES.md`](../10-quality-assurance/SIMULATION_TEST_CASES.md)
