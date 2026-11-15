# KINERA Security Considerations

**Document ID:** `KIN-DOC-11-05`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines threat surface minimization, Content Security Policy (CSP), WASM/worker memory safety, input/upload validation, and optional API hardening controls for KINERA V1.

---

## 2. Threat Model Summary (Static Offline-First Advantage)

Because KINERA V1 requires **no user accounts, no cloud database, no user-uploaded server execution, and zero mandatory backend API calls**, its primary attack surface is reduced to client-side asset integrity, JSON scenario import validation, XSS prevention in rendered learning content, and optional FastAPI DoS/CORS guards.

---

## 3. Security Controls

| Domain | Control Requirement |
| :--- | :--- |
| **Content Security Policy (CSP)** | Enforce strict `default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; worker-src 'self'; img-src 'self' data: blob:; connect-src 'self' <configured_optional_api>; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`. Zero arbitrary third-party script CDNs at runtime. |
| **XSS & Content Rendering** | Pre-render/sanitize static Insight & Library content at build time; forbid raw unsanitized HTML (`dangerouslySetInnerHTML`) for any dynamic/imported strings; render math exclusively via trusted KaTeX AST APIs. |
| **WASM Memory & Panic Safety** | Compile `kinera-physics` cleanly with bounds-checked slices, strict `f64::is_finite()` validation, and `#![deny(clippy::unwrap_used)]` on input paths (`KIN-SIM-030`) preventing out-of-bounds traps from corrupted imported JSON presets. |
| **Imported Scenario Validation** | Any user-imported JSON scenario/config file must be parsed safely (`JSON.parse` size cap $\le 1\text{ MB}$), checked against Draft 2020-12 schema + physics bounds before Worker dispatch. |
| **Supply Chain & Asset Integrity** | Lock Rust (`Cargo.lock`), npm (`package-lock.json` / `pnpm-lock.yaml`), and Python (`uv.lock` / `requirements.txt`) dependencies via CI vulnerability scanning (`cargo audit`, `npm audit`). Verify Subresource Integrity / hashed Vite manifests. |
| **Optional FastAPI Hardening** | Strict Pydantic request body size limits ($\le 64\text{ KB}$), explicit CORS origin whitelist (`KINERA_ALLOWED_ORIGINS`), rate-limiting middleware on `/validate`, and non-root minimal container user. |

---

## 4. Cross-References

- [`DEPLOYMENT_ARCHITECTURE.md`](DEPLOYMENT_ARCHITECTURE.md)
- [`ENVIRONMENT_CONFIGURATION.md`](ENVIRONMENT_CONFIGURATION.md)
- [`../05-simulation-engine/SIMULATION_ERROR_HANDLING.md`](../05-simulation-engine/SIMULATION_ERROR_HANDLING.md)
- [`../07-data-and-contracts/ERROR_CONTRACTS.md`](../07-data-and-contracts/ERROR_CONTRACTS.md)
