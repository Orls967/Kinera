# Backend Architecture (Optional Services) — KINERA

**Document ID:** `KIN-DOC-06-03`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the strict boundaries, legitimate responsibilities, and Python + FastAPI + Pydantic architecture of KINERA's **optional** backend layer—preventing unnecessary server coupling that would violate offline-first requirements.

## 2. Non-Blocking Principle (`KIN-NFR-012`)

**Core Rule:** KINERA's 3D Vehicle Anatomy, Powertrain Journey, Powertrain Simulator, Vehicle Dynamics Simulator, Configuration Comparison, Engineering Insights, and Technical Library **must never require the backend**. If `VITE_API_BASE_URL` is unset or unreachable, the frontend gracefully hides cloud-share actions while preserving 100% local export/import and simulation execution.

## 3. Legitimate Optional Backend Responsibilities

| Capability | Endpoint Role | Why Optional Backend Helps |
| :--- | :--- | :--- |
| **Scenario Snapshot Sharing** | `POST /api/v1/scenarios/share`, `GET /api/v1/scenarios/{shareId}` | Lets educators generate short shareable links for classroom assignments |
| **Curriculum Pack Distribution** | `GET /api/v1/packs/catalog` | Allows instructors to publish optional supplemental scenario packs beyond bundled defaults |
| **Server-Side Audit / Export Verification** | `POST /api/v1/exports/verify-report` | Validates exported scenario JSON against canonical Pydantic models and signs/formats clean classroom submission bundles |
| **Health & Version Metadata** | `GET /api/v1/health` | Exposes backend readiness and compatible `schemaVersion` |

**Explicitly Excluded from Backend:** Real-time frame-by-frame physics stepping, 3D geometry streaming proxy, mandatory user authentication gates blocking local exploration, or duplicate physics formulas diverging from Rust/WASM.

## 4. Python / FastAPI / Pydantic Structure

```text
services/api/app/
├── main.py          # FastAPI app, strict CORS, security headers, health route
├── config.py        # Pydantic BaseSettings (env config)
├── schemas/         # Pydantic v2 models mirroring docs/schemas/*.schema.json
├── routers/         # scenarios.py, packs.py, health.py
└── storage/         # Lightweight SQLite / object store adapter for shared snapshots
```

## 5. Cross-References

- [`OFFLINE_FIRST_ARCHITECTURE.md`](OFFLINE_FIRST_ARCHITECTURE.md)
- [`../07-data-and-contracts/API_SPECIFICATION.md`](../07-data-and-contracts/API_SPECIFICATION.md)
- [`../11-delivery-and-operations/SECURITY_CONSIDERATIONS.md`](../11-delivery-and-operations/SECURITY_CONSIDERATIONS.md)
