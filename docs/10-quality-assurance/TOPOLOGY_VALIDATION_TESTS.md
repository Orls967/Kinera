# KINERA Topology Validation Tests

**Document ID:** `KIN-DOC-10-05`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines automated structural, graph-connectivity, mode-compatibility, and efficiency-path test cases for the shared multi-configuration drivetrain topology engine (`kinera-topology`) across all 7 canonical KINERA vehicle architectures.

---

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-QA-012** | All 7 canonical configurations shall pass automated directed acyclic / power-flow graph validation confirming every active prime mover reaches its driven wheel hubs without orphan or duplicate efficiency nodes. |
| **KIN-QA-013** | Invalid architectural combinations (e.g., `4L` transfer mode on `ICE-AWD` or `EV-*`, transverse transaxle assigned to longitudinal `ICE-RWD`, or missing differential links) shall be rejected cleanly with canonical `ERR_TOPO_*` errors. |

---

## 3. Canonical Topology Graph Test Matrix

| Test ID | Configuration ID | Expected Active Power-Flow Path(s) | Inactive / Prohibited Components | Mode / State Assertion |
| :--- | :--- | :--- | :--- | :--- |
| **TEST-TOPO-001** | `vehicle.config.ice-fwd` | ICE (Transverse) -> Clutch -> Transaxle Gearbox -> Front Diff -> Front Axle Shafts/CV -> Front Wheels | Rear driveshaft, center diff, transfer case, rear diff | `driveWheels = [FL, FR]`; `R` axle receives `0` torque |
| **TEST-TOPO-002** | `vehicle.config.ice-rwd` | ICE (Longitudinal) -> Clutch -> Gearbox -> Driveshaft -> Rear Diff -> Rear Half-Shafts -> Rear Wheels | Front half-shafts, transaxle, center diff, transfer case | `driveWheels = [RL, RR]`; `F` axle receives `0` torque |
| **TEST-TOPO-003** | `vehicle.config.ice-awd` | ICE -> Clutch/Torque Converter -> Gearbox -> Center Diff/PTU -> `[Front Driveshaft -> Front Diff -> FL/FR, Rear Driveshaft -> Rear Diff -> RL/RR]` | Mechanical low-range (`4L`) transfer reduction | `driveWheels = [FL, FR, RL, RR]`; `2H/4L` requests rejected |
| **TEST-TOPO-004** | `vehicle.config.ice-4wd` | ICE -> Clutch -> Gearbox -> Transfer Case (`2H/4H/4L`) -> `[Front Driveshaft -> Front Diff (4H/4L only), Rear Driveshaft -> Rear Diff]` | Full-time variable open center diff without lockup | `2H` zeroes front torque; `4L` applies low-range stage ratio + efficiency |
| **TEST-TOPO-005** | `vehicle.config.ev-fwd` | HV Battery -> DC Bus -> Front Inverter -> Front Motor -> Front Reduction Gear -> Front Diff -> FL/FR | Multi-speed gearbox, clutch, ICE block, rear motor | `driveWheels = [FL, FR]`; regen path mirrors drive path |
| **TEST-TOPO-006** | `vehicle.config.ev-rwd` | HV Battery -> DC Bus -> Rear Inverter -> Rear Motor -> Rear Reduction Gear -> Rear Diff -> RL/RR | Multi-speed gearbox, driveshaft tunnel, front motor | `driveWheels = [RL, RR]`; regen flows `Wheels -> Motor -> Inverter -> Battery` |
| **TEST-TOPO-007** | `vehicle.config.ev-dual-awd` | HV Battery -> `{Front Inverter -> Front Motor -> Front Reduction -> Front Diff -> FL/FR, Rear Inverter -> Rear Motor -> Rear Reduction -> Rear Diff -> RL/RR}` | Mechanical center driveshaft / mechanical transfer case | Independent front/rear electrical torque split (`0:100` to `100:0` bounded by motor caps) |

---

## 4. Negative & Mutation Validation Tests

| Test ID | Mutation Applied | Expected Validation Outcome |
| :--- | :--- | :--- |
| **TEST-TOPO-NEG-001** | Remove `rear-driveshaft` edge from `vehicle.config.ice-rwd` | Rejects with `ERR_TOPO_DISCONNECTED_PATH` listing unreachable node `RL/RR`. |
| **TEST-TOPO-NEG-002** | Inject duplicate self-loop or redundant efficiency edge on `front-diff` | Validator detects cycle/duplicate edge and rejects config load. |
| **TEST-TOPO-NEG-003** | Command `transferCaseMode = '4L'` on `vehicle.config.ice-awd` | Rejects with `ERR_TOPO_UNSUPPORTED_CONFIG` (AWD vs 4WD architecture guard). |
| **TEST-TOPO-NEG-004** | Command gear change `gear = 3` on `vehicle.config.ev-fwd` | Rejects with `ERR_SIM_INVALID_GEAR` (single-speed reduction ratio only). |
| **TEST-TOPO-NEG-005** | Provide unknown configuration ID `vehicle.config.hydrogen-8x8` | Rejects with `ERR_TOPO_UNSUPPORTED_CONFIG`. |

---

## 5. Cross-References

- [`../02-vehicle-architecture/DRIVETRAIN_TOPOLOGY.md`](../02-vehicle-architecture/DRIVETRAIN_TOPOLOGY.md)
- [`../02-vehicle-architecture/POWER_FLOW_TOPOLOGY.md`](../02-vehicle-architecture/POWER_FLOW_TOPOLOGY.md)
- [`SIMULATION_TEST_CASES.md`](SIMULATION_TEST_CASES.md)
- [`../07-data-and-contracts/ERROR_CONTRACTS.md`](../07-data-and-contracts/ERROR_CONTRACTS.md)
