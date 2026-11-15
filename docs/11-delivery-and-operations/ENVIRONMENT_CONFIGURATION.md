# KINERA Environment Configuration

**Document ID:** `KIN-DOC-11-04`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines client and optional backend configuration variables, runtime defaults, and environment parity rules across local development, CI staging, and offline-first production builds.

---

## 2. Frontend Build-Time Environment Variables (`VITE_*`)

| Variable | Type | Default (`prod` PWA) | Description |
| :--- | :--- | :--- | :--- |
| `VITE_APP_VERSION` | `string` | Injected SemVer tag | Displayed in about/diagnostics footer and telemetry metadata (`DATA_VERSIONING.md`). |
| `VITE_SCHEMA_VERSION` | `string` | `"1.0.0"` | Locked data contract compatibility tag validated at startup. |
| `VITE_OFFLINE_ONLY` | `boolean` | `"true"` | Disables any optional remote API fetches; uses bundled presets & local WASM Worker only. |
| `VITE_API_BASE_URL` | `string \| ""` | `""` | Optional FastAPI base URL (`http://localhost:8000` in dev if enabled); ignored when `VITE_OFFLINE_ONLY=true`. |
| `VITE_ENABLE_PERF_HUD` | `boolean` | `"false"` (`"true"` in CI/dev) | Exposes FPS, active triangles, draw calls, and Worker solve-time overlay for `TEST-PERF-*`. |
| `VITE_WASM_PREFETCH` | `boolean` | `"true"` | Triggers Worker WASM pre-warm during idle post-Overview mount. |

---

## 3. Optional FastAPI Companion Variables

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `KINERA_API_HOST` | `string` | `"127.0.0.1"` | ASGI bind host. |
| `KINERA_API_PORT` | `int` | `8000` | ASGI bind port. |
| `KINERA_ALLOWED_ORIGINS` | `string` | `"http://localhost:5173"` | Strict CORS origin whitelist for local/classroom companion deployments. |
| `KINERA_LOG_LEVEL` | `string` | `"info"` | Structured JSON logging level (`debug`, `info`, `warning`, `error`). |

---

## 4. Parity & Secret-Free Rules

1. **Zero Baked Secrets:** Neither frontend `VITE_*` variables nor public `.env.example` templates may ever contain API keys, auth tokens, or credentials (the browser PWA is public and offline-capable).
2. **Environment Parity:** Production physics execution is identical between local Vite dev, staging, and offline production because `kinera-wasm` runs deterministically in the browser's Web Worker (`KIN-NFR-007`).

---

## 5. Cross-References

- [`BUILD_AND_RELEASE_PROCESS.md`](BUILD_AND_RELEASE_PROCESS.md)
- [`SECURITY_CONSIDERATIONS.md`](SECURITY_CONSIDERATIONS.md)
- [`../07-data-and-contracts/DATA_VERSIONING.md`](../07-data-and-contracts/DATA_VERSIONING.md)
