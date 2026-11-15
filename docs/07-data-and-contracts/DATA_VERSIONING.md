# Data Versioning and Evolution — KINERA

**Document ID:** `KIN-DOC-07-08`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Establishes Semantic Versioning (`MAJOR.MINOR.PATCH`), schema migration, and canonical ID deprecation rules for all KINERA datasets, JSON schemas, and simulation contracts (`KIN-DATA-024`–`KIN-DATA-025`).

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-DATA-024** | All schemas, datasets, and simulation contracts shall carry `schemaVersion` (`1.0.0` for V1 baseline) following strict SemVer compatibility rules. |
| **KIN-DATA-025** | Canonical IDs shall never be silently deleted or renamed; retired identifiers must resolve via an explicit `deprecatedAliases` map for at least one major release cycle. |

## 3. SemVer Rules for Schemas & Data

- **PATCH (`1.0.x`):** Typo fixes in prose descriptions, non-breaking reference citation updates, numeric parameter tuning with identical units/fields.
- **MINOR (`1.x.0`):** Backward-compatible additive optional fields, new learning topics, or additional scenario presets.
- **MAJOR (`x.0.0`):** Breaking schema field renames, unit changes (forbidden within V1 SI lock), or altered simulation output structure requiring migration transformer on imported `.kinera.json` user files.

## 4. Canonical ID Deprecation Policy

- Example: If early conceptual documentation informally mentions `drivetrain.rear-differential` or `ice.transmission.gearbox` outside strict canonical tables, registry alias metadata maps conceptual shorthand cleanly to canonical `drivetrain.rwd.rear-differential` and `ice.transmission.manual.gear-set` without breaking published user scenario files.

## 5. Cross-References

- [`CANONICAL_ID_REGISTRY.md`](CANONICAL_ID_REGISTRY.md)
- [`DATA_MODEL.md`](DATA_MODEL.md)
