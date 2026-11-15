# KINERA Acceptance Test Plan

**Document ID:** `KIN-DOC-10-08`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the binding release-gating Acceptance Test Plan mapping every V1 acceptance criterion (`AC-001` through `AC-022` from [`ACCEPTANCE_CRITERIA.md`](../01-product-specification/ACCEPTANCE_CRITERIA.md)) to executable E2E verification steps, pass thresholds, and release sign-off evidence requirements.

---

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-QA-018** | Release candidate builds shall execute an end-to-end Acceptance Suite covering every criterion `AC-001` through `AC-022` in production PWA offline and online modes. |
| **KIN-QA-019** | Every failed acceptance criterion or unverified engineering tolerance shall constitute an automatic **NO-GO** release block. |
| **KIN-QA-020** | Sign-off evidence reports shall cite only observed outputs from unskipped test runs executed against the exact candidate commit hash. |

---

## 3. E2E Acceptance Verification Matrix (`AC-001`–`AC-022`)

| AC ID | Acceptance Title | Executable Verification Procedure | Required Proof of Pass |
| :--- | :--- | :--- | :--- |
| **AC-001** | Six-Section Shell | Navigate sequentially across `Overview`, `Vehicle Anatomy`, `Powertrain Journey`, `Engineering Simulator`, `Engineering Insights`, `Technical Library`. | All 6 routes render cleanly with active header nav & zero runtime errors. |
| **AC-002** | Seven Canonical Configs | Switch active configuration through all 7 (`ICE-FWD`, `ICE-RWD`, `ICE-AWD`, `ICE-4WD`, `EV-FWD`, `EV-RWD`, `EV-DUAL-AWD`). | Every section updates topology, visuals, specs, and solver context cleanly. |
| **AC-003** | Shared Framework Invariance | Static source audit + inspect shared config loader & single `kinera-physics` crate entry point. | Zero per-config forked engine/scene code paths exist. |
| **AC-004** | Full Vehicle Systems | Inspect `Vehicle Anatomy` subsystem layer list across ICE and EV configs. | Chassis/suspension/steering/brakes/wheels + ICE/EV propulsion assemblies render per config. |
| **AC-005** | 3D Inspection Tools | Run `TEST-3D-002` through `TEST-3D-006` in Playwright WebGL session. | Hover, click, isolate, transparency, explode slider, section-cut, camera presets all operate cleanly. |
| **AC-006** | Component Metadata Contract | Click representative components across Engine, Gearbox, Transfer Case, Diff, Inverter, Motor, Suspension, Brake Caliper. | Side inspector displays schema-valid role, subsystem, equations link, and config-specific metadata. |
| **AC-007** | ICE & EV Powertrain Journey | Play & step through Journey for `ICE-4WD` (`4L` mode) and `EV-DUAL-AWD`. | Animated energy/torque flow sequence matches active config path with Play/Pause/Step/Replay. |
| **AC-008** | ICE & EV Powertrain Sim | Run `TEST-SIM-001`, `TEST-SIM-005`, `TEST-SIM-006` via Simulator UI -> Worker. | Displayed $\omega$, $P$, stage torque, wheel RPM, EV current match analytical benchmarks ($\le 10^{-3}$). |
| **AC-009** | Differential & 4WD Fidelity | Run `TEST-SIM-003`, `TEST-SIM-004` via Simulator UI. | Open diff obeys $2\times T_{min}$; LSD & Locked behave per model; `4WD 2H/4H/4L` toggles verified. |
| **AC-010** | Longitudinal Dynamics | Run `TEST-SIM-008` in Longitudinal mode and compare sweep CSV/JSON against reference oracle. | $F_{drag}, F_{rolling}, F_{grade}$, $a_x$, $v_x(t)$ match analytical baseline ($\le 0.5\%$). |
| **AC-011** | Lateral Bicycle Model | Run `TEST-SIM-009` in Lateral mode (`K_us > 0` and `< 0`). | $K_{us}$, $r_{ss}$, $\beta$, $\alpha_{f/r}$ match 2-DOF analytical steady state ($\le 0.01\%$); regime warning shows at $> 6^\circ$. |
| **AC-012** | Braking & Weight Transfer | Run `TEST-SIM-002`, `TEST-SIM-010` across braking & accel cases. | Stopping distance matches $v_0^2/(2|a|)$; $\sum F_z = m g \cos\theta$ invariant holds. |
| **AC-013** | Tire Friction Circle | Run `TEST-SIM-011` and verify friction circle canvas polar plot. | Vector clamps cleanly at boundary $(F_x/\mu F_z)^2 + (F_y/\mu F_z)^2 = 1.0$; warning badge triggers. |
| **AC-014** | Performance Estimates & Labels | Run full Performance Analysis card on at least ICE and EV configs. | Outputs `0–100`, `1/4 mi`, `Vmax`, braking, peak $a_y$, gradeability with visible `Simulated Model Estimate` badge. |
| **AC-015** | Controlled Config Comparison | Run `TEST-SIM-012` comparing `ICE-FWD`, `ICE-RWD`, `ICE-4WD`, `EV-DUAL-AWD` in Matched Baseline mode. | Shared mass/drag/$\mu$ parameters locked equal; comparative chart & delta table render accurately. |
| **AC-016** | Insights & Library Content | Open sample & index views for all 37 Insights topics and 10 Technical Library modules offline. | KaTeX math, diagrams, citations, and simulator deep-links load without network access. |
| **AC-017** | Rust/WASM Worker Execution | Profile Worker messaging (`TEST-PERF-005..008`) & inspect payload units (`m, kg, s, rad, N, W`). | Zero solver code on main thread; Worker solves in $\le 50\text{ ms}$; zero `longtask` stalls. |
| **AC-018** | Offline-First Verification | Enable Chromium Service Worker cache, switch browser to `Offline`, hard-reload and run all 6 sections. | Full app works offline identically to online; optional FastAPI indicator degrades gracefully. |
| **AC-019** | Transparency & Citations | Open Simulator Equation/Assumptions Drawer + `TECHNICAL_REFERENCE_POLICY` citations. | Every equation lists assumptions, validity bounds, class, and verified citation ID (`ref.*`). |
| **AC-020** | 3D Performance & Accessibility | Run `TEST-PERF-001..004` + `TEST-3D-008` keyboard & `prefers-reduced-motion` pass. | Active tris $\le 150\text{k}$ target ($\le 180\text{k}$ cap), draw calls $\le 120$, keyboard/screen-reader usable. |
| **AC-021** | Edge-Case Resilience | Execute `TEST-EDGE-001` through `TEST-EDGE-019` against compiled WASM artifact. | Zero WASM panics, zero `NaN` leaks, all warnings & `ERR_*` messages match contracts. |
| **AC-022** | V1 Exclusions Honored | Content & capability review of UI copy, Insights, Library, and API docs. | Zero claims of CFD, FEA, crash, Pacejka nonlinear tires, thermals, or combustion chemistry in V1. |

---

## 4. Release Go / No-Go Sign-Off Checklist

A V1 build candidate is cleared for tagging ONLY when:
1. All `L1`–`L5` CI checks pass on the exact release commit with `0` skipped or relaxed tests.
2. `AC-001` through `AC-022` record explicit `PASS` with linked CI job logs / trace hashes.
3. No open `CRITICAL` or `HIGH` defects exist in solver math, topology validation, offline cache, or 3D memory cleanup.

---

## 5. Cross-References

- [`TEST_STRATEGY.md`](TEST_STRATEGY.md)
- [`ENGINEERING_VALIDATION_PLAN.md`](ENGINEERING_VALIDATION_PLAN.md)
- [`SIMULATION_TEST_CASES.md`](SIMULATION_TEST_CASES.md)
- [`../01-product-specification/ACCEPTANCE_CRITERIA.md`](../01-product-specification/ACCEPTANCE_CRITERIA.md)
- [`../12-project-governance/REQUIREMENTS_TRACEABILITY_MATRIX.md`](../12-project-governance/REQUIREMENTS_TRACEABILITY_MATRIX.md)
