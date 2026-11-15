# Offline-First Architecture — KINERA

**Document ID:** `KIN-DOC-06-07`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines KINERA's offline-first Progressive Web App (PWA) caching architecture, bundled asset strategy, offline capability matrix, and graceful degradation rules (`KIN-NFR-011`–`KIN-NFR-012`).

## 2. Offline Capability Matrix

| Capability | Offline Available? | Storage / Delivery Mechanism |
| :--- | :---: | :--- |
| Six-section Navigation & UI | **Yes (100%)** | Vite precached app shell via Service Worker (`Workbox`) |
| 7 Vehicle Configurations & Component Registry | **Yes (100%)** | Bundled static JSON datasets precached on install |
| Rust/WASM Simulation Engine (`kinera-wasm`) | **Yes (100%)** | Static `.wasm` + worker chunk precached on install |
| Vehicle Anatomy 3D Assemblies (Active + Switched) | **Yes (100% once cached)** | Core assemblies precached; remaining config GLBs cached runtime `CacheFirst` + explicit "Download All Offline Assets" button for classrooms |
| Powertrain Journey Animations | **Yes (100%)** | Static animation definitions + shared WASM state |
| Engineering Simulator & Config Comparison | **Yes (100%)** | Local WASM Worker + `IndexedDB` scenario persistence |
| Engineering Insights & 10 Technical Library Modules | **Yes (100%)** | Bundled static markdown/JSON + local KaTeX fonts/CSS |
| Cloud Share Snapshot Link (`POST /api/v1/scenarios/share`) | **No (Online Optional)** | Clearly disabled offline with instant local `.kinera.json` file export fallback |

## 3. Caching Strategy

- **App Shell, WASM Binary, JSON Registries, KaTeX Fonts:** **Precache (`CacheFirst` with revision hash)** via Vite PWA / Workbox manifest during Service Worker install.
- **3D GLB Assemblies:** Initial active configuration (`ICE-RWD` or last-used) + shared chassis/wheel/brake meshes precached immediately; remaining 6 configuration powertrain deltas cached lazily on first visit (`StaleWhileRevalidate` / `CacheFirst`) AND prefetchable in one click via **"Prepare Full Offline Lab"** (~15–30 MB total compressed budget) for offline lecture halls.
- **User Saved Scenarios & Preferences:** Stored locally in `IndexedDB` (`kinera_local_db`).

## 4. Cross-References

- [`SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md)
- [`BACKEND_ARCHITECTURE.md`](BACKEND_ARCHITECTURE.md)
- [`../11-delivery-and-operations/DEPLOYMENT_ARCHITECTURE.md`](../11-delivery-and-operations/DEPLOYMENT_ARCHITECTURE.md)
