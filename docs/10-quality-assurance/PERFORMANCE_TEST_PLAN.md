# KINERA Performance Test Plan

**Document ID:** `KIN-DOC-10-07`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Specifies automated and benchmark profiling gates enforcing KINERA's NFR and 3D performance budgets: frame rate, triangle/draw-call budgets, Rust/WASM Web Worker solver latency, bundle weight, memory bounds, and offline cold-load startup (`KIN-NFR-001`–`KIN-NFR-006`, `KIN-3D-022`–`KIN-3D-025`, `AC-017`, `AC-020`).

---

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-QA-016** | Standard and exploded 3D scenes across all 7 configurations shall be profiled for triangle count ($\le 150\text{k}$ target, $\le 180\text{k}$ hard cap), draw calls ($\le 120$), texture memory, and steady desktop/mobile FPS. |
| **KIN-QA-017** | Rust/WASM simulation sweeps (`Powertrain`, `Longitudinal`, `2-DOF Lateral`, and 4-config `Comparison`) and cold PWA offline load times shall meet strict latency budgets with zero main-thread UI stalls $> 16.6\text{ ms}$. |

---

## 4. Performance Budget Matrix & Test Protocol

| Test ID | Metric | Target Budget | Hard Failure Ceiling | Profiling Tool / Harness |
| :--- | :--- | :--- | :--- | :--- |
| **TEST-PERF-001** | Active 3D Triangle Count (per config) | $\le 150,000$ tris | $> 180,000$ tris | `renderer.info.render.triangles` sampled across all 7 configs + exploded state |
| **TEST-PERF-002** | Active WebGL Draw Calls | $\le 120$ calls | $> 150$ calls | `renderer.info.render.calls` sampled across Orbit, Explode, and Journey views |
| **TEST-PERF-003** | Desktop Viewport Frame Rate | $\ge 60\text{ FPS}$ (`< 16.6\text{ ms}` frame) | Sustained $< 45\text{ FPS}$ (`> 22\text{ ms}` P95) | Chrome DevTools / Playwright `requestAnimationFrame` delta over 5s Orbit + Journey sweep |
| **TEST-PERF-004** | Mid-Tier / Throttled Frame Rate | $\ge 30\text{ FPS}$ (`4x` CPU throttle) | Sustained $< 24\text{ FPS}$ | Playwright with `4x` CPU throttle & reduced DPR fallback (`0.75–1.0x`) |
| **TEST-PERF-005** | Single-Step Solver + Worker Round-Trip | $\le 16\text{ ms}$ (live slider scrub) | $> 50\text{ ms}$ P95 | Performance mark across `postMessage` -> WASM solve -> response receipt |
| **TEST-PERF-006** | Full 0–100 / Quarter-Mile / 30s Sweep | $\le 50\text{ ms}$ single config | $> 150\text{ ms}$ | `cargo bench` + browser WASM benchmark (2500–3000 RK4 steps at $\Delta t = 0.01\text{ s}$) |
| **TEST-PERF-007** | Multi-Config Comparison (4 Configs) | $\le 180\text{ ms}$ total | $> 400\text{ ms}$ | Parallel/batched Worker execution over 4 configs |
| **TEST-PERF-008** | Main-Thread Blocking During Sim | `0 ms` solver work on UI thread | Any Long Task $> 50\text{ ms}$ | PerformanceObserver `longtask` monitor during heavy comparison runs |
| **TEST-PERF-009** | Offline Cold Boot to Interactive | $\le 3.0\text{ s}$ (cached Service Worker) | $> 5.0\text{ s}$ | Lighthouse / Playwright cold cached load in offline mode |
| **TEST-PERF-010** | GPU / JS Heap Stability Across Switches | Bounded steady plateau | Monotonic leak $> +30\text{ MB}$ over 21 config switches | 3 full cycles across all 7 configs checking `renderer.info.memory.geometries/textures` |

---

## 5. Graceful Degradation Verification

Automated test verifies that when simulated frame time drops below `28 FPS` for `> 1.5 s`, the adaptive quality controller:
1. Lowers shadow map resolution (`2048 -> 1024 -> off`) and caps `devicePixelRatio` at `1.0`.
2. Switches complex exterior meshes to LOD1/LOD2 cleanly without hiding primary powertrain components.
3. Restores physics clarity (2D plots and schematic HUD remain crisp regardless of 3D quality tier).

---

## 6. Cross-References

- [`../01-product-specification/NON_FUNCTIONAL_REQUIREMENTS.md`](../01-product-specification/NON_FUNCTIONAL_REQUIREMENTS.md)
- [`../08-3d-and-visualization/3D_PERFORMANCE_BUDGET.md`](../08-3d-and-visualization/3D_PERFORMANCE_BUDGET.md)
- [`3D_AND_INTERACTION_TEST_PLAN.md`](3D_AND_INTERACTION_TEST_PLAN.md)
