# KINERA Deployment Architecture

**Document ID:** `KIN-DOC-11-02`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the runtime hosting, edge CDN delivery, offline Service Worker cache topology, and optional FastAPI companion service deployment architecture for KINERA.

---

## 2. Client-First Static PWA Topology (Required Core)

```
+---------------------------+
|      User Browser         |
|  React + R3F UI           |
|  Service Worker Cache     |<---+ Cache-first WASM, GLB, JSON, KaTeX fonts
|  Web Worker (Rust/WASM)   |
+-------------+-------------+
              | HTTPS (Initial load / updates only)
              v
+---------------------------+        Optional (Non-blocking)
|   Static Edge CDN Host    |        +--------------------------+
|  (HTML/JS/WASM/GLB/JSON)  |        | FastAPI Container (ASGI) |
+---------------------------+        | /api/v1/configurations   |
                                     | /api/v1/simulations/...  |
                                     +--------------------------+
```

### 2.1 Core Deployment Guarantees
1. **Zero Mandatory Server Dependency:** Production builds run 100% inside the browser once static assets (`index.html`, Vite ES chunks, `.wasm`, `.glb`, bundled `.json` presets & Insights/Library content, KaTeX stylesheets/fonts) are served over HTTPS from any static CDN (Cloudflare Pages, Netlify, Vercel, GitHub Pages, or Nginx).
2. **Service Worker Caching Strategy:**
   - **Pre-cached Immutable Hashed Assets (`CacheFirst`):** Vite JS/CSS chunks, Rust/WASM `.wasm` binary, Draco/KTX2 compressed `.glb` assemblies, KaTeX `.woff2` fonts, and bundled baseline `.json` payloads.
   - **App Shell (`StaleWhileRevalidate` / `NetworkFirst` with quick fallback):** `index.html` with atomic update banner prompting reload when a new Service Worker activates.
3. **MIME & Compression Headers:**
   - `.wasm`: `application/wasm` with Brotli/Gzip compression.
   - `.glb`: `model/gltf-binary` with aggressive long-term `Cache-Control: public, max-age=31536000, immutable`.
   - `sw.js`: `Cache-Control: no-cache, must-revalidate` so browsers detect new app releases promptly.

---

## 3. Optional Backend Companion Deployment

When deployed for classroom presets or REST schema verification (`ADR-002`):
- **Runtime:** Python 3.12 + Uvicorn/Gunicorn managing FastAPI workers inside a stateless OCI container.
- **Health Checks:** `GET /api/v1/health` configured for container orchestrator liveness/readiness probes.
- **Failure Isolation:** Browser client treats backend unavailability (`5xx`, timeout, or offline) as silent non-blocking degradation to local bundled presets.

---

## 4. Cross-References

- [`../06-software-architecture/OFFLINE_FIRST_ARCHITECTURE.md`](../06-software-architecture/OFFLINE_FIRST_ARCHITECTURE.md)
- [`../06-software-architecture/SYSTEM_ARCHITECTURE.md`](../06-software-architecture/SYSTEM_ARCHITECTURE.md)
- [`BUILD_AND_RELEASE_PROCESS.md`](BUILD_AND_RELEASE_PROCESS.md)
- [`SECURITY_CONSIDERATIONS.md`](SECURITY_CONSIDERATIONS.md)
