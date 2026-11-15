# Power-Flow Topology — KINERA

**Document ID:** `KIN-DOC-02-06`  
**Status:** COMPLETE  
**Last Updated:** 2026-11-16  

---

## 1. Purpose

Defines bidirectional energy and mechanical power-flow paths across all seven KINERA configurations, specifying stage efficiencies, speed transformation nodes, torque split nodes, and EV regenerative braking reversal paths (`KIN-VEH-019`–`KIN-VEH-020`).

## 2. Requirements

| Req ID | Requirement |
| :--- | :--- |
| **KIN-VEH-019** | Power-flow topology shall annotate each graph edge with energy carrier (`chemical`, `thermal-mechanical`, `mechanical-rotational`, `dc-electrical`, `ac-3phase`), ratio rule, and loss factor $\eta$. |
| **KIN-VEH-020** | EV topologies shall support bidirectional flow direction (`propulsion` vs `regenerative-braking`), enforcing BMS/battery SOC charge power caps and per-axle tire friction caps. |

## 3. Ordered Power-Flow Stages per Configuration

### 3.1 `ICE-FWD`
1. `ice.fuel.delivery-system` -> `ice.engine.assembly` *(Chemical -> Mechanical crankshaft torque $T_{eng}, \omega_{eng}$)*
2. `ice.engine.crankshaft` -> `ice.clutch.flywheel` -> `ice.clutch.disc-pressure-plate` *(Speed $\omega_{eng}$, friction lock $\eta_{clutch} \approx 1.0$ engaged)*
3. `ice.transmission.transaxle` (Gear stage $G_k$, $\eta_{trans}$) -> `drivetrain.fwd.front-differential` (Final drive $F$, $\eta_{fd}$, L/R torque split)
4. `drivetrain.common.axle-shaft-front-left` / `right` (via `cv-joint`, $\eta_{joint}$) -> Front Wheels ($F_{tractive,FL}, F_{tractive,FR}$)

### 3.2 `ICE-RWD`
1. `ice.engine.crankshaft` -> `ice.clutch.flywheel` -> `ice.transmission.manual.gear-set` ($G_k, \eta_{trans}$)
2. `drivetrain.common.driveshaft-main` + `universal-joint` ($\eta_{shaft}$) -> `drivetrain.rwd.rear-differential` ($F, \eta_{fd}$, L/R torque split)
3. `drivetrain.common.axle-shaft-rear-left` / `right` -> Rear Wheels ($F_{tractive,RL}, F_{tractive,RR}$)

### 3.3 `ICE-AWD`
1. `ice.engine.crankshaft` -> Clutch -> `ice.transmission.manual.gear-set` ($G_k, \eta_{trans}$)
2. `drivetrain.awd.center-differential` ($\eta_{cd}$, splits $T_{trans\_out}$ by center bias $\lambda_F / \lambda_R$)
3. Front path (`driveshaft-front` -> `awd.front-differential`, $F, \eta_{fd,F}$) & Rear path (`driveshaft-rear` -> `awd.rear-differential`, $F, \eta_{fd,R}$) -> All 4 Wheels

### 3.4 `ICE-4WD`
1. `ice.engine.crankshaft` -> Clutch -> `ice.transmission.manual.gear-set` ($G_k, \eta_{trans}$)
2. `drivetrain.4wd.transfer-case` (Mode selector: `2H` sends 100% rear @ $G_{tc}=1.0$; `4H` locks front+rear @ $G_{tc}=1.0$; `4L` engages low-range planetary $G_{tc}=2.48$, $\eta_{tc}$)
3. Active axle driveshaft(s) -> `4wd.rear-differential` (always) + `4wd.front-differential` (`4H`/`4L`) -> Wheels

### 3.5 `EV-FWD` & `EV-RWD`
- **Propulsion:** `ev.battery.pack` ($V_{pack}, I$) -> `ev.hv.pdu-cabling` -> `ev.inverter.*` ($\eta_{inv}$) -> `ev.motor.*` ($\eta_{motor}$) -> `ev.transmission.reduction-gearbox-*` ($G_{red}, \eta_{red}$) -> `drivetrain.ev.*-differential` ($\eta_{diff}$, L/R split) -> Driven Axle Shafts -> Wheels.
- **Regenerative Braking (Reversed):** Driven Wheels -> Axles -> Differential -> Reduction Gearbox ($1/G_{red}$ speed step-up, $\eta_{red}$) -> Motor acting as Generator ($\eta_{gen}$) -> Inverter (AC-to-DC rectification, $\eta_{inv}$) -> `ev.bms.controller` -> `ev.battery.pack` (capped by max charge acceptance and friction brake blending).

### 3.6 `EV-DUAL-AWD`
- **Parallel Electrical Split:** `ev.battery.pack` ($P_{batt} = P_{elec,F} + P_{elec,R}$) feeds `ev.inverter.front` and `ev.inverter.rear` independently.
- **Independent Mechanical Branches:** Front branch produces $T_{axle,F}$ via $G_{red,F}$; Rear branch produces $T_{axle,R}$ via $G_{red,R}$. Electronic torque allocator adjusts $\lambda_F / \lambda_R$ subject to motor envelopes and battery power budget.

## 4. Cross-References

- [`DRIVETRAIN_TOPOLOGY.md`](DRIVETRAIN_TOPOLOGY.md)
- [`../03-powertrain-engineering/DRIVETRAIN_EFFICIENCY_MODEL.md`](../03-powertrain-engineering/DRIVETRAIN_EFFICIENCY_MODEL.md)
- [`../03-powertrain-engineering/POWERTRAIN_JOURNEY_SPECIFICATION.md`](../03-powertrain-engineering/POWERTRAIN_JOURNEY_SPECIFICATION.md)
