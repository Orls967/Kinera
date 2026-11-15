# Configuration Comparison Specification — KINERA

**Document ID:** `KIN-DOC-05-05`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines the controlled experimental protocol, baseline-locking rules, parameter mismatch flags, and side-by-side output contracts for Module 3 (**Configuration Comparison**, `KIN-SIM-020`–`KIN-SIM-022`).

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-SIM-020** | Configuration Comparison shall evaluate 2 to 7 selected configurations against one identical `SimulationScenario` using the shared Rust/WASM solver. |
| **KIN-SIM-021** | Default **`Matched Baseline Mode`** shall equalize mass $m$, tire radius $r_{eff}$, tire friction $\mu$, aero ($C_d, A$), rolling resistance ($C_{rr}$), road gradient $\theta$, initial speed $v_0$, and driver inputs—and flag any user-unlocked differences in an explicit comparison audit table. |
| **KIN-SIM-022** | Comparison outputs shall never label one layout universally "better"; results shall report exact conditions and trade-offs (e.g., traction gain vs. mass/drivetrain loss). |

## 3. Canonical Comparison Scenarios

1. **Matched ICE Layout Comparison (`ICE-FWD` vs `ICE-RWD` vs `ICE-AWD`):** Locks $m = 1420\text{ kg}$, $2.0\text{ L}$ I4 ($118\text{ kW}$), identical 6-speed gear ratios, $r_{eff}=0.315\text{ m}$, $C_d=0.29$, $A=2.25\text{ m}^2$. Users toggle dry ($\mu = 0.90$) vs. wet/snow ($\mu = 0.30$) to observe FWD front-unloading wheelspin vs. RWD launch grip vs. AWD 4-wheel traction balanced against AWD's extra drivetrain stage loss ($\eta_{total} = 0.849$ vs $0.917$ FWD).
2. **ICE-AWD vs ICE-4WD Transfer Comparison:** Demonstrates `4L` low-range gradeability advantage vs. `ICE-AWD` lower highway drivetrain loss and on-road agility.
3. **EV Single vs Dual-Motor (`EV-FWD` vs `EV-RWD` vs `EV-DUAL-AWD`):** Locks $m = 1750\text{ kg}$ or uses realistic unladen delta masses (flagged explicitly!) to compare instant $310\text{ N}\cdot\text{m}$ front launch traction limitation vs. RWD grip vs. Dual-Motor split + regen capacity.
4. **ICE vs EV Propulsion Comparison (`ICE-RWD` vs `EV-RWD`):** Contrasts stepped gearbox torque multiplication against flat single-speed electric torque delivery and braking energy recovery.

## 4. Parameter Divergence Guard Algorithm

Before executing comparison, `compare_configs()` runs a field-by-field diff across all $N$ configuration payloads:
- Checks `mass_kg`, `peak_power_w`, `tire_radius_m`, `mu_nominal`, `cd`, `frontal_area_m2`, `crr`, `road_grade_rad`, `v0_mps`, `static_weight_split_f`.
- Emits `ComparisonParameterDiff[]` array classifying each parameter as `MATCHED` or `DIFFERENT (reason: natural_architecture_default | user_override)`.
- UI renders an amber badge on any chart whenever `DIFFERENT` items exist.

## 5. Cross-References

- [`SIMULATION_ARCHITECTURE.md`](SIMULATION_ARCHITECTURE.md)
- [`../01-product-specification/FEATURE_SPECIFICATIONS.md`](../01-product-specification/FEATURE_SPECIFICATIONS.md)
- [`../07-data-and-contracts/SIMULATION_CONTRACTS.md`](../07-data-and-contracts/SIMULATION_CONTRACTS.md)
