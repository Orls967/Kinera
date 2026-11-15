# Technical Reference Policy — KINERA

**Document ID:** `KIN-DOC-09-06`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Governs citation integrity across all KINERA engineering documentation, equations, simulator disclosures, and learning modules (`KIN-PRD-019`). Strictly forbids fabricating DOIs, ISBNs, page numbers, standards, or URLs.

## 2. Citation Integrity Rules

1. **Authoritative Source Categories Only:** Textbooks, SAE/ISO/IEEE standards, peer-reviewed journals, university engineering texts, government/NHTSA publications, and verifiable OEM technical manuals.
2. **Zero Fabrication:** Never invent bibliographic details from memory. Any source not verified against primary publisher records must carry `verificationStatus: "VERIFICATION_REQUIRED"`.
3. **Traceability:** Every `EngineeringEquation` and `LearningModule` cites at least one `ref.*` entry from the verified registry below.

## 3. Verified Core Engineering Bibliography (`VERIFIED`)

| Canonical ID | Citation (Verified Authors, Title, Edition, Publisher, Year, Identifier) | Primary Domain | Status |
| :--- | :--- | :--- | :---: |
| `ref.book.gillespie-2021` | Gillespie, T. D. *Fundamentals of Vehicle Dynamics* (Revised Edition; Orig. 1992). SAE International, 2021. ISBN-13: `978-1-4686-0176-3` (1992 ed.: `978-1-56091-199-9`). | Longitudinal, braking, weight transfer, handling | `VERIFIED` |
| `ref.book.milliken-1995` | Milliken, W. F., & Milliken, D. L. *Race Car Vehicle Dynamics*. SAE International, 1995 (c. 1994). ISBN-13: `978-1-56091-526-3`. | Friction circle, differentials, lateral load transfer | `VERIFIED` |
| `ref.book.rajamani-2012` | Rajamani, R. *Vehicle Dynamics and Control* (2nd Edition). Springer, 2012. ISBN-13: `978-1-4614-1432-2`. | 2-DOF linear bicycle model, yaw dynamics, stability | `VERIFIED` |
| `ref.book.wong-2022` | Wong, J. Y. *Theory of Ground Vehicles* (5th Edition). John Wiley & Sons, 2022 (4th ed. 2008: `978-0470170380`). ISBN-13: `978-1119719700`. | Rolling resistance, aero drag, traction, gradeability | `VERIFIED` |
| `ref.book.heywood-2018` | Heywood, J. B. *Internal Combustion Engine Fundamentals* (2nd Edition). McGraw-Hill Education, 2018. ISBN-13: `978-1260116106`. | 4-stroke cycle, displacement, volumetric efficiency, ICE torque | `VERIFIED` |
| `ref.book.ehsani-2018` | Ehsani, M., Gao, Y., Longo, S., & Ebrahimi, K. M. *Modern Electric, Hybrid Electric, and Fuel Cell Vehicles* (3rd Edition). CRC Press, 2018/2019. ISBN-13: `978-1498761772`. | EV battery, inverter, PMSM/induction motor envelopes, regen | `VERIFIED` |
| `ref.standard.iso-8855` | ISO 8855:2011. *Road vehicles — Vehicle dynamics and road-holding ability — Vocabulary* (2nd Edition). International Organization for Standardization, 2011. | Coordinate systems, vehicle dynamics vocabulary | `VERIFIED` |
| `ref.standard.sae-j670` | SAE J670_202206. *Vehicle Dynamics Terminology*. SAE International, June 2022. | Vehicle axis terminology, slip angle, understeer gradient | `VERIFIED` |

*(Additional specialized references added in Phase 6 content authoring—such as specific IEEE motor control papers or university lab notes—must undergo primary DOI/URL verification before removing `VERIFICATION_REQUIRED`.)*

## 4. Cross-References

- [`EQUATION_REFERENCE.md`](EQUATION_REFERENCE.md)
- [`TECHNICAL_LIBRARY_STRUCTURE.md`](TECHNICAL_LIBRARY_STRUCTURE.md)
- [`../00-project-foundation/ASSUMPTIONS_AND_CONSTRAINTS.md`](../00-project-foundation/ASSUMPTIONS_AND_CONSTRAINTS.md)
