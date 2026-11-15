# API and Internal Interface Specification — KINERA

**Document ID:** `KIN-DOC-07-06`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Clearly distinguishes KINERA's **static data registry loaders**, **internal Worker/WASM simulation API**, and **optional Python/FastAPI REST endpoints** (`KIN-DATA-019`–`KIN-DATA-021`). Zero core exploration or simulation features depend on HTTP API availability.

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-DATA-019** | Static registry loading, Worker simulation calls, and optional REST endpoints shall be documented separately with concrete canonical-ID request/response payloads. |
| **KIN-DATA-020** | Public optional REST endpoints shall remain limited strictly to snapshot sharing, curriculum pack discovery, health, and report verification—avoiding redundant backend simulation endpoints. |
| **KIN-DATA-021** | Every API boundary shall enforce schema version validation and return standardized `ErrorEnvelope` responses upon invalid input. |

## 3. Layer 1 — Static Offline Data Loaders (Client Registry API)

- `GET /data/v1/vehicle-configurations.json` -> `VehicleConfiguration[]` (all 7 configs)
- `GET /data/v1/components.json` -> `Component[]` (complete anatomy catalog)
- `GET /data/v1/equations.json` -> `EngineeringEquation[]`
- `GET /data/v1/learning-content.json` -> `{ insights: LearningModule[], library: LearningModule[], references: ReferenceSource[] }`
- `GET /data/v1/animations.json` -> `AnimationSequence[]`
- `GET /data/v1/assets-manifest.json` -> `Asset[]`

*(Served locally from static Vite build assets & Service Worker cache; zero dynamic backend required.)*

## 4. Layer 2 — Internal Worker / WASM Simulation API

- `SimulationClient.evaluatePowertrain(input: SimulationInput): Promise<SimulationOutput>` -> Worker `EVALUATE_POWERTRAIN_SINGLE` -> Rust `evaluate_powertrain_single`
- `SimulationClient.runDynamics(input: SimulationInput): Promise<SimulationOutput>` -> Worker `RUN_DYNAMICS_SIMULATION` -> Rust `run_dynamics_simulation`
- `SimulationClient.runComparison(input: SimulationInput): Promise<SimulationOutput>` -> Worker `RUN_CONFIGURATION_COMPARISON` -> Rust `run_configuration_comparison`

## 5. Layer 3 — Optional Python / FastAPI Endpoints (`/api/v1`)

| Method & Path | Purpose | Request Body | Response Body |
| :--- | :--- | :--- | :--- |
| `GET /api/v1/health` | Service status & version compatibility | None | `{ "status": "ok", "schemaVersion": "1.0.0" }` |
| `POST /api/v1/scenarios/share` | Save & mint short ID for scenario snapshot | `{ "title": "...", "input": SimulationInput }` | `201 Created`: `{ "shareId": "kin-8f3a12", "expiresAt": null }` |
| `GET /api/v1/scenarios/{shareId}` | Retrieve shared scenario JSON | None | `200 OK`: `{ "shareId": "kin-8f3a12", "title": "...", "input": SimulationInput }` |
| `POST /api/v1/exports/verify-report` | Validate exported scenario/output bundle | `{ "input": SimulationInput, "output": SimulationOutput }` | `200 OK`: `{ "valid": true, "checkedSchemaVersion": "1.0.0" }` |

## 6. Cross-References

- [`../06-software-architecture/BACKEND_ARCHITECTURE.md`](../06-software-architecture/BACKEND_ARCHITECTURE.md)
- [`../06-software-architecture/WORKER_COMMUNICATION.md`](../06-software-architecture/WORKER_COMMUNICATION.md)
- [`ERROR_CONTRACTS.md`](ERROR_CONTRACTS.md)
