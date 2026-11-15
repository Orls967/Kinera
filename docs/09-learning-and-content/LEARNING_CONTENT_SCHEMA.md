# Learning Content Schema — KINERA

**Document ID:** `KIN-DOC-09-03`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the shared JSON data structure for Engineering Insights topics and Technical Library modules so equations, glossary definitions, component descriptions, and references remain normalized with zero contradictory duplication.

## 2. Single-Source Reference Pattern

- Insights and Library entries **do not duplicate** equation expressions, variable unit tables, or bibliographic strings inline.
- Instead, `LearningModule` records store arrays of `equationIds` (`eq.*`), `componentIds`, `conceptIds` (`concept.*`), `scenarioIds` (`sim.scenario.*`), and `referenceIds` (`ref.*`), which the UI resolves from canonical JSON dictionaries at render time.

## 3. Canonical JSON Structure (`LearningModule`)

```json
{
  "id": "insight.dynamics.understeer-oversteer",
  "schemaVersion": "1.0.0",
  "kind": "insight_topic",
  "group": "vehicle-dynamics",
  "title": "Understeer, Oversteer, and Critical Speed",
  "learningObjectives": [
    "Define understeer gradient K_us in terms of axle loads and cornering stiffnesses.",
    "Explain why forward CG shift increases steady-state understeer tendency."
  ],
  "prerequisites": ["insight.dynamics.yaw-response"],
  "conceptIds": ["concept.dynamics.understeer"],
  "equationIds": ["eq.dynamics.understeer-gradient", "eq.dynamics.bicycle-yaw"],
  "componentIds": ["vehicle.steering.rack-pinion", "vehicle.wheel.tire"],
  "scenarioIds": ["sim.scenario.bicycle-cg-sweep"],
  "workedExample": {
    "prompt": "Compute K_us for m=1420 kg, L=2.70 m, a=1.296 m, b=1.404 m, Caf=65000 N/rad, Car=70000 N/rad.",
    "resultSummary": "K_us = +0.001622 rad/(m/s^2), indicating mild steady-state understeer."
  },
  "referenceIds": ["ref.book.gillespie-2021", "ref.book.rajamani-2012"]
}
```

## 4. Cross-References

- [`ENGINEERING_INSIGHTS_CURRICULUM.md`](ENGINEERING_INSIGHTS_CURRICULUM.md)
- [`TECHNICAL_LIBRARY_STRUCTURE.md`](TECHNICAL_LIBRARY_STRUCTURE.md)
- [`../07-data-and-contracts/DATA_MODEL.md`](../07-data-and-contracts/DATA_MODEL.md)
