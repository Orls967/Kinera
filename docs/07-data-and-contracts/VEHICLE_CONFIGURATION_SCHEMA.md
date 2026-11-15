# Vehicle Configuration Schema Specification — KINERA

**Document ID:** `KIN-DOC-07-03`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Documents the normative structure, validation rules, and concrete JSON payload examples for `VehicleConfiguration` instances validated by [`../schemas/vehicle-configuration.schema.json`](../schemas/vehicle-configuration.schema.json) (`KIN-DATA-010`–`KIN-DATA-012`).

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-DATA-010** | Every canonical configuration dataset file shall validate cleanly against `schemas/vehicle-configuration.schema.json` (JSON Schema Draft 2020-12). |
| **KIN-DATA-011** | Topology paths inside `powertrainTopology.paths` shall cite exclusively canonical component IDs registered in `CANONICAL_ID_REGISTRY.md`. |
| **KIN-DATA-012** | Parameter blocks shall satisfy geometric consistency (`cgToFrontAxleM + cgToRearAxleM == wheelbaseM`). |

## 3. Concrete Example: `vehicle.config.ice-fwd` (Excerpt)

```json
{
  "id": "vehicle.config.ice-fwd",
  "schemaVersion": "1.0.0",
  "code": "ICE-FWD",
  "name": "Front-Wheel Drive (ICE Transverse Transaxle)",
  "powertrainType": "ice",
  "drivetrainLayout": "fwd",
  "specification": {
    "massKg": 1380.0,
    "wheelbaseM": 2.70,
    "trackWidthM": 1.56,
    "cgHeightM": 0.54,
    "cgToFrontAxleM": 1.08,
    "cgToRearAxleM": 1.62,
    "yawInertiaKgM2": 2150.0,
    "dragCoefficient": 0.29,
    "frontalAreaM2": 2.25,
    "rollingResistanceCoeff": 0.011,
    "tireEffectiveRadiusM": 0.315,
    "frontAxleCorneringStiffnessNPerRad": 65000.0,
    "rearAxleCorneringStiffnessNPerRad": 70000.0
  },
  "topology": {
    "placement": "front-transverse",
    "drivenAxles": ["front"],
    "steeredAxles": ["front"],
    "hasMechanicalCenterCoupling": false,
    "hasLowRangeTransferCase": false,
    "paths": [
      {
        "id": "path-front",
        "axleTarget": "front",
        "orderedComponentIds": [
          "ice.engine.assembly",
          "ice.clutch.flywheel",
          "ice.clutch.disc-pressure-plate",
          "ice.transmission.transaxle",
          "drivetrain.fwd.front-differential",
          "drivetrain.common.axle-shaft-front-left",
          "vehicle.wheel.tire"
        ],
        "stageEfficiencies": [1.0, 1.0, 0.955, 0.96, 0.99]
      }
    ]
  },
  "supportedDiffModes": ["open", "lsd", "locked"],
  "rootAssemblyAssetId": "asset.vehicle.ice-fwd-assembly"
}
```

## 4. Cross-References

- [`../schemas/vehicle-configuration.schema.json`](../schemas/vehicle-configuration.schema.json)
- [`../02-vehicle-architecture/VEHICLE_CONFIGURATION_SPECIFICATION.md`](../02-vehicle-architecture/VEHICLE_CONFIGURATION_SPECIFICATION.md)
