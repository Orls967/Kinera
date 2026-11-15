# Web Worker Communication — KINERA

**Document ID:** `KIN-DOC-06-05`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the typed asynchronous messaging protocol between the React/TypeScript main thread and the dedicated simulation Web Worker (`sim.worker.ts`) hosting `kinera-wasm`.

## 2. Message Envelope Protocol

### 2.1 Main Thread -> Worker (`WorkerRequest`)
```json
{
  "requestId": "req-01948a2c",
  "type": "RUN_DYNAMICS_SIMULATION",
  "schemaVersion": "1.0.0",
  "payload": { "...": "SimulationInput JSON" }
}
```
Supported `type` values:
- `INIT_WASM`
- `VALIDATE_CONFIGURATION`
- `EVALUATE_POWERTRAIN_SINGLE`
- `RUN_DYNAMICS_SIMULATION`
- `RUN_PERFORMANCE_BENCHMARK`
- `RUN_CONFIGURATION_COMPARISON`
- `CANCEL_REQUEST`

### 2.2 Worker -> Main Thread (`WorkerResponse`)
```json
{
  "requestId": "req-01948a2c",
  "status": "OK",
  "durationMs": 4.82,
  "engineVersion": "0.1.0-phase1",
  "payload": { "...": "SimulationOutput JSON" }
}
```
Or on failure (`status: "ERROR"`), returns standardized `ErrorEnvelope` (`ERROR_CONTRACTS.md`).

## 3. Concurrency, Throttling & Latest-Wins Semantics

- **Sequential Queue + Supersede Cancellation:** Interactive slider drags (e.g., steering angle or RPM sweep) debounce at `16 ms` (`1` frame) and tag each request with monotonic `requestId`. When a newer request of the same simulation channel arrives while an older queued message waits, superseded queued requests resolve immediately as `CANCELLED` so the UI never lags behind slider motion ("latest-wins").
- **Worker Recovery:** If the browser terminates a Worker unexpectedly, `SimulationClient` cleanly restarts a fresh Worker instance, re-initializes `kinera-wasm`, and surfaces a recoverable retry banner (`KIN-NFR-013`).

## 4. Cross-References

- [`RUST_WASM_ARCHITECTURE.md`](RUST_WASM_ARCHITECTURE.md)
- [`DATA_FLOW.md`](DATA_FLOW.md)
- [`../07-data-and-contracts/ERROR_CONTRACTS.md`](../07-data-and-contracts/ERROR_CONTRACTS.md)
