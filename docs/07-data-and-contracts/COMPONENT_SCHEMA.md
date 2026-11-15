# Component Schema Specification — KINERA

**Document ID:** `KIN-DOC-07-04`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the normative metadata contract for every component in the Component Registry validated by [`../schemas/component.schema.json`](../schemas/component.schema.json) (`KIN-DATA-013`–`KIN-DATA-014`).

## 2. Requirements & Nullability Rules

| Req ID | Requirement |
| :--- | :--- |
| **KIN-DATA-013** | All inspectable component entries shall validate against `schemas/component.schema.json` and define `kind`, `subsystemId`, `vehicleConfigurations`, `inputs`, `outputs`, `relationships`, and `engineeringReferences`. |
| **KIN-DATA-014** | Configuration-dependent optional fields (e.g., `ratedVoltageV` for EV components, `gearRatios` for transmissions) shall be explicitly nullable (`null`) when non-applicable rather than omitted inconsistently. |

### Field Contract Matrix

| Field | Required? | Nullable? | Configuration-Dependent? | Notes |
| :--- | :---: | :---: | :---: | :--- |
| `id`, `schemaVersion`, `name`, `kind`, `category`, `subsystemId` | Required | No | No | Immutable canonical identity & taxonomy |
| `vehicleConfigurations` | Required | No | Yes | Non-empty array of supported `vehicle.config.*` IDs |
| `description`, `primaryFunction`, `operatingPrinciple` | Required | No | No | Displayed in Vehicle Anatomy Inspector |
| `inputs`, `outputs` | Required | No | No | Typed mechanical/electrical port arrays |
| `physicalProperties` | Optional | Yes | Yes | Mass, material, dimensions (SI) |
| `technicalSpecifications` | Required | No | Yes | Key-value specs with SI units |
| `relationships`, `assetReferences`, `engineeringReferences` | Required | No | Yes | Canonical cross-links |
| `animationReferences` | Optional | No | Yes | Linked `anim.*` sequence IDs |

## 3. Concrete Example: `ice.engine.crankshaft`

```json
{
  "id": "ice.engine.crankshaft",
  "schemaVersion": "1.0.0",
  "name": "Engine Crankshaft",
  "kind": "physical",
  "category": "ICE Powerplant",
  "subsystemId": "subsystem.ice.powerplant",
  "vehicleConfigurations": [
    "vehicle.config.ice-fwd",
    "vehicle.config.ice-rwd",
    "vehicle.config.ice-awd",
    "vehicle.config.ice-4wd"
  ],
  "description": "Forged alloy steel shaft converting reciprocating piston forces into continuous rotary torque.",
  "primaryFunction": "Convert connecting-rod linear thrust into rotational torque and angular speed.",
  "operatingPrinciple": "Offset crankpins spaced 180 deg apart transform cylinder firing pulses into continuous torque delivered to the flywheel.",
  "inputs": [{ "quantity": "force", "unit": "N", "sourceId": "ice.engine.connecting-rod" }],
  "outputs": [{ "quantity": "torque", "unit": "N*m", "targetId": "ice.clutch.flywheel" }],
  "physicalProperties": { "massKg": { "value": 16.4, "unit": "kg" } },
  "technicalSpecifications": {
    "crankThrowRadiusM": { "value": 0.043, "unit": "m" },
    "maxOperatingSpeedRadS": { "value": 712.1, "unit": "rad/s" }
  },
  "relationships": [
    {
      "id": "rel-crank-flywheel",
      "sourceId": "ice.engine.crankshaft",
      "targetId": "ice.clutch.flywheel",
      "relationshipType": "mechanical_drive",
      "vehicleConfigurations": ["vehicle.config.ice-fwd", "vehicle.config.ice-rwd", "vehicle.config.ice-awd", "vehicle.config.ice-4wd"],
      "transferredQuantity": "torque_and_omega",
      "bidirectional": false
    }
  ],
  "assetReferences": ["asset.ice.crankshaft-glb"],
  "animationReferences": ["anim.journey.ice-four-stroke"],
  "engineeringReferences": ["ref.book.heywood-2018"]
}
```

## 4. Cross-References

- [`../schemas/component.schema.json`](../schemas/component.schema.json)
- [`../02-vehicle-architecture/COMPONENT_ANATOMY_SPECIFICATION.md`](../02-vehicle-architecture/COMPONENT_ANATOMY_SPECIFICATION.md)
