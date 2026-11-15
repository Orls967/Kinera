# Non-Functional Requirements — KINERA

**Document ID:** `KIN-DOC-01-04`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines measurable, verifiable quality attributes (`KIN-NFR-001`–`KIN-NFR-024`) covering performance, simulation determinism, 3D rendering budgets, offline resilience, accessibility, responsiveness, browser compatibility, security, and maintainability.

## 2. Performance & 3D Rendering Requirements

| ID | Category | Requirement & Measurable Target | Verification Method |
| :--- | :--- | :--- | :--- |
| **KIN-NFR-001** | 3D Geometry Budget | Standard active 3D inspection scenes shall target **$\approx 150,000$ active triangles** (hard upper budget cap $180,000$ on `High` tier before adaptive reduction). | Three.js `renderer.info.render.triangles` automated telemetry test |
| **KIN-NFR-002** | 3D Draw Calls | Standard active 3D inspection scenes shall target **$\approx 120$ draw calls** (hard cap $150$ on `High` tier via mesh instancing & material sharing). | Three.js `renderer.info.render.calls` profiling test |
| **KIN-NFR-003** | Frame Rate | Interactive camera orbit, component highlight, and Journey animations shall sustain **$\ge 60\text{ FPS}$** ($\le 16.67\text{ ms}$ frame time) on reference desktop GPU and **$\ge 30\text{ FPS}$** ($\le 33.3\text{ ms}$) on mid-tier mobile devices using adaptive quality tiers (`High`, `Medium`, `Low`). | Automated FPS / frame-budget benchmark in `PERFORMANCE_TEST_PLAN.md` |
| **KIN-NFR-004** | Asset Lazy Loading | Switching between the 7 vehicle configurations shall lazy-load only delta assemblies not already cached; warm switch latency shall be **$\le 400\text{ ms}$** (cached) and cold mesh parse **$\le 2.0\text{ s}$** on standard broadband/local disk. | Performance timing trace during config swap |
| **KIN-NFR-005** | Simulation Latency | Single-point powertrain evaluation shall return from the Rust/WASM Worker in **$\le 2\text{ ms}$**; a $30\text{ s}$ vehicle dynamics time-series run at $\Delta t = 0.01\text{ s}$ ($3,000$ steps) shall complete in **$\le 25\text{ ms}$** on reference desktop. | Worker round-trip benchmark in CI |
| **KIN-NFR-006** | Initial Load & TTI | Core application shell (HTML/JS/CSS + Rust WASM core) shall achieve Time-to-Interactive **$\le 3.0\text{ s}$** on simulated Fast 3G / standard desktop cache miss, with compressed WASM core **$\le 500\text{ KB}$**. | Lighthouse / Vite bundle analyzer gate |

## 3. Determinism, Accuracy & Data Integrity

| ID | Category | Requirement & Measurable Target | Verification Method |
| :--- | :--- | :--- | :--- |
| **KIN-NFR-007** | Determinism | Executing identical `SimulationInput` JSON across repeated invocations (same browser/WASM build) shall produce **bit-identical** outputs (`0` stochastic drift; fixed PRNG forbidden in physics). | Determinism regression test (10x replay hash match) |
| **KIN-NFR-008** | Numerical Accuracy | All core powertrain and dynamics equations shall match closed-form analytical benchmarks within **$10^{-6}$** relative tolerance for algebraic equations and **$\le 0.5\%$** (or tighter per `ENGINEERING_VALIDATION_PLAN.md`) for RK4 time-stepped ODE integrations. | Rust engineering validation suite |
| **KIN-NFR-009** | SI Unit Invariance | All internal Rust/WASM structs, JSON schemas, and Worker contracts shall store exclusively SI units (`m`, `kg`, `s`, `N`, `N·m`, `rad`, `rad/s`, `W`, `J`, `V`, `A`, `K`); zero mixed imperial or implicit km/h internal fields permitted. | Schema audit & static type enforcement |
| **KIN-NFR-010** | Data Integrity | All configuration, component, scenario, and animation JSON bundles shall validate 100% against `docs/schemas/*.schema.json` with zero dangling canonical IDs at build time. | CI schema & cross-reference integrity script |

## 4. Offline Availability & Reliability

| ID | Category | Requirement & Measurable Target | Verification Method |
| :--- | :--- | :--- | :--- |
| **KIN-NFR-011** | Offline Core | After first successful page load and Service Worker activation, **100%** of core features (Navigation, 7-config switching, Vehicle Anatomy, Powertrain Journey, Engineering Simulator, Insights, Library) shall operate with `navigator.onLine === false`. | Playwright offline network-emulation test suite |
| **KIN-NFR-012** | Backend Non-Blocking | Unavailability or 5xx failure of the optional Python/FastAPI backend shall never block, crash, or degrade core 3D exploration or WASM simulation workflows. | Fault-injection test with unreachable API URL |
| **KIN-NFR-013** | Graceful Error Handling | Invalid simulation parameters, WebGL context loss, or WASM worker exceptions shall surface structured user-readable diagnostics (`ERROR_CONTRACTS.md`) and offer safe reset recovery without blank screens. | Error-boundary & simulation edge-case test suite |

## 5. Accessibility, Responsiveness & Compatibility

| ID | Category | Requirement & Measurable Target | Verification Method |
| :--- | :--- | :--- | :--- |
| **KIN-NFR-014** | Accessibility (WCAG) | All UI controls, simulation sliders, configuration selectors, tabs, data tables, and component hierarchy trees shall comply with **WCAG 2.1 Level AA** contrast ($\ge 4.5:1$ normal text) and full keyboard navigation (`Tab`, `Arrow`, `Enter`, `Escape`). | Automated `axe-core` scan + manual keyboard audit |
| **KIN-NFR-015** | 3D Keyboard Alternative | Every 3D component selectable via mouse/touch raycast shall also be inspectable, isolatable, and navigable via keyboard-accessible assembly hierarchy tree controls and accessible camera preset buttons. | Accessibility acceptance test |
| **KIN-NFR-016** | Reduced Motion | Enabling OS `prefers-reduced-motion: reduce` shall disable automatic camera sweeps and replace continuous rapid motion cues with clean stepped visual states. | Media-query UI behavioral test |
| **KIN-NFR-017** | Responsive Layouts | All 6 sections shall render without horizontal overflow or overlapping HUD controls at `375x812` (mobile), `768x1024` (tablet), and `1440x900` / `1920x1080` (desktop). | Responsive Playwright viewport suite |
| **KIN-NFR-018** | Browser Support | Desktop & mobile latest 2 stable major releases of Chrome/Edge (Chromium), Firefox, and Safari (macOS/iOS) supporting WebGL2, WebAssembly, and Web Workers. | Cross-browser compatibility matrix check |

## 6. Security, Maintainability & Observability

| ID | Category | Requirement & Measurable Target | Verification Method |
| :--- | :--- | :--- | :--- |
| **KIN-NFR-019** | Client Security | Static deployment shall enforce strict Content Security Policy (`default-src 'self'`, `wasm-unsafe-eval` scoped strictly as required, zero `eval` on user data, schema validation on imported scenario JSON). | Security header & JSON fuzz check |
| **KIN-NFR-020** | Backend Validation | Optional FastAPI endpoints shall validate all inbound payloads via strict Pydantic v2 models, enforce payload size caps ($\le 256\text{ KB}$), and sanitize persisted scenario records. | FastAPI pytest negative-input suite |
| **KIN-NFR-021** | Maintainability | Adding or updating parameters of a vehicle configuration shall require data/registry updates rather than duplicating physics solvers or 3D viewport code. | Architecture review & code-duplication audit |
| **KIN-NFR-022** | Traceable Versioning | Every exported simulation result and configuration JSON shall stamp `schemaVersion`, `engineVersion`, and `modelFidelityTag` for reproducibility. | Output contract verification test |

## 7. Cross-References

- [`PRODUCT_REQUIREMENTS_DOCUMENT.md`](PRODUCT_REQUIREMENTS_DOCUMENT.md)
- [`ACCEPTANCE_CRITERIA.md`](ACCEPTANCE_CRITERIA.md)
- [`../08-3d-and-visualization/3D_PERFORMANCE_BUDGET.md`](../08-3d-and-visualization/3D_PERFORMANCE_BUDGET.md)
- [`../10-quality-assurance/PERFORMANCE_TEST_PLAN.md`](../10-quality-assurance/PERFORMANCE_TEST_PLAN.md)
