import type { TechnicalLibraryModule } from '../types/kinera';

export const TECHNICAL_LIBRARY_MODULES: TechnicalLibraryModule[] = [
  {
    id: 'library.module.automotive-fundamentals',
    number: 1,
    title: 'Automotive Engineering Fundamentals',
    subtitle: 'SI Unit Discipline, Coordinate Systems (ISO 8855), and Energy Conservation',
    overview: {
      scope: 'Establishes rigorous SI unit conventions, ISO 8855 vs Three.js coordinate transforms, rotational mechanics, and chassis structural foundations.',
      learningObjectives: [
        'Apply strict SI units (m, kg, s, N, N·m, rad/s, W, J) inside all vehicle equations.',
        'Convert between ISO 8855 (+X forward, +Y left, +Z up) and Three.js (+Y up, +Z forward, +X left) with det = +1.',
      ],
      prerequisites: [],
    },
    fundamentals: [
      'Every mechanical or electrical automotive model reduces to Newton-Euler motion laws and energy conservation. Mixing km/h with m/s or degrees with radians is the leading source of engineering calculation errors.',
      'KINERA stores strictly SI quantities inside its Rust/WASM physics core and converts display values only at the UI boundary.',
    ],
    componentIds: ['vehicle.structure.unibody', 'vehicle.structure.ladder-frame', 'vehicle.structure.front-subframe', 'vehicle.structure.rear-subframe'],
    operatingPrinciples: [
      'Rotational power equals torque multiplied by angular velocity (P = T * omega).',
      'Cyclic permutation (x_iso, y_iso, z_iso) -> (y_iso, z_iso, x_iso) preserves right-handed 3D geometry without mirroring.',
    ],
    equationIds: ['eq.powertrain.angular-velocity', 'eq.powertrain.mechanical-power'],
    engineeringApplications: [
      'Unibody monocoques optimize stiffness-to-mass ratio on paved platforms (`ICE-FWD/RWD/AWD`, `EV-*`).',
      'Boxed steel ladder frames isolate off-road shock loads on `ICE-4WD`.',
    ],
    relatedSimulations: [
      {
        title: 'Powertrain RPM & Torque Sweep',
        description: 'Observe real-time conversion between RPM, rad/s, N·m, and Watts.',
        route: '/simulator',
        configId: 'vehicle.config.ice-rwd',
      },
    ],
    glossaryTerms: [
      { term: 'Angular Velocity', symbol: 'omega', unit: 'rad/s', definition: 'Rotational rate equal to 2*pi*RPM/60.' },
      { term: 'ISO 8855', definition: 'International vehicle dynamics coordinate standard (+X forward, +Y left, +Z up).' },
    ],
    linkedInsightIds: ['insight.powertrain.torque-rotational-motion', 'insight.powertrain.mechanical-power', 'insight.architecture.chassis-subframes'],
    referenceIds: ['ref.book.gillespie-2021', 'ref.standard.iso-8855'],
  },
  {
    id: 'library.module.internal-combustion-engine',
    number: 2,
    title: 'Internal Combustion Engines',
    subtitle: 'Four-Stroke Kinematics, Displacement Geometry, and Steady-State Torque Maps',
    overview: {
      scope: 'Covers KINERA’s reference 2.0 L naturally aspirated inline-four spark-ignition gasoline engine.',
      learningObjectives: [
        'Compute swept displacement from bore, stroke, and cylinder count.',
        'Interpret full-load WOT torque/power curves and throttle-modulated pumping drag.',
      ],
      prerequisites: ['library.module.automotive-fundamentals'],
    },
    fundamentals: [
      'A four-stroke spark-ignition engine executes Intake, Compression, Power, and Exhaust across 720 degrees of crank rotation.',
      'KINERA V1 models torque via a validated steady-state lookup map modulated by throttle u_th and engine braking friction T_fric (explicitly excluding transient 1D gas dynamics).',
    ],
    componentIds: ['ice.engine.assembly', 'ice.engine.block', 'ice.engine.cylinder-head', 'ice.engine.piston', 'ice.engine.connecting-rod', 'ice.engine.crankshaft', 'ice.engine.valvetrain'],
    operatingPrinciples: [
      'Firing order 1-3-4-2 spaces combustion impulses evenly every 180 deg of crank angle.',
      'Peak torque reaches 205 N·m @ 4,400 RPM; peak power reaches 117.96 kW @ 6,400 RPM; fuel cut engages above 6,800 RPM.',
    ],
    equationIds: ['eq.powertrain.ice-displacement', 'eq.powertrain.ice-torque-output'],
    engineeringApplications: [
      'Square bore/stroke geometry (86 x 86 mm) balances mid-range torque with high-RPM breathing.',
      'Engine mounts and dual-mass flywheels damp cyclic cylinder firing torque pulses.',
    ],
    relatedSimulations: [
      {
        title: '4-Stroke Cutaway & ICE Torque Curve',
        description: 'Inspect piston kinematics and run WOT RPM sweeps.',
        route: '/journey',
        configId: 'vehicle.config.ice-rwd',
      },
    ],
    glossaryTerms: [
      { term: 'Swept Displacement', symbol: 'V_d', unit: 'm³', definition: 'Total volume displaced by all pistons moving from BDC to TDC.' },
      { term: 'WOT', definition: 'Wide-Open Throttle (u_th = 1.0 full-load operating condition).' },
    ],
    linkedInsightIds: ['insight.powertrain.engine-displacement', 'insight.powertrain.compression-ratio', 'insight.powertrain.four-stroke-cycle', 'insight.powertrain.torque-power-curves'],
    referenceIds: ['ref.book.heywood-2018'],
  },
  {
    id: 'library.module.transmission-systems',
    number: 3,
    title: 'Transmission and Gear Systems',
    subtitle: '6-Speed Manual Gearboxes, Integrated Transaxles, Single-Speed EV Reductions, and Transfer Cases',
    overview: {
      scope: 'Explains torque multiplication, speed reduction, stage efficiency, and transfer case low-range gearing.',
      learningObjectives: [
        'Calculate gearbox output torque and wheel RPM across ratios G_k and final drive F.',
        'Distinguish stepped ICE transmissions from fixed single-speed EV reduction units.',
      ],
      prerequisites: ['library.module.internal-combustion-engine'],
    },
    fundamentals: [
      'Internal combustion engines produce useful torque only across ~800–6,800 RPM, requiring multi-ratio stepped gearboxes to span 0–200+ km/h.',
      'Electric traction motors generate peak torque from 0 RPM past 14,000 RPM, allowing a single fixed helical reduction (~8.65:1).',
    ],
    componentIds: ['ice.clutch.flywheel', 'ice.clutch.disc-pressure-plate', 'ice.transmission.manual.gear-set', 'ice.transmission.transaxle', 'ev.transmission.reduction-gearbox-front', 'ev.transmission.reduction-gearbox-rear'],
    operatingPrinciples: [
      'Manual 6-speed ratios span 3.62 (1st) to 0.69 (6th overdrive), plus -3.45 Reverse and Neutral decoupling.',
      'ICE-4WD transfer case adds 2.48:1 planetary low-range multiplication in 4L.',
    ],
    equationIds: ['eq.powertrain.gearbox-torque', 'eq.powertrain.wheel-rpm'],
    engineeringApplications: [
      'Transverse transaxles combine gearbox and front differential to save engine-bay length.',
      'Automatic transmissions are represented conceptually in V1 anatomy without hydrodynamic transient modeling.',
    ],
    relatedSimulations: [
      {
        title: 'Gear-by-Gear Tractive Force Comparison',
        description: 'Sweep gears 1–6 and compare against single-speed EV reduction.',
        route: '/simulator',
        configId: 'vehicle.config.ice-fwd',
      },
    ],
    glossaryTerms: [
      { term: 'Overdrive', definition: 'Gear ratio < 1.0 where output shaft rotates faster than input shaft.' },
      { term: 'Transaxle', definition: 'Combined transmission and differential housing used in transverse FWD layouts.' },
    ],
    linkedInsightIds: ['insight.powertrain.gear-ratios', 'insight.powertrain.manual-transmission', 'insight.architecture.transaxle'],
    referenceIds: ['ref.book.gillespie-2021', 'ref.book.ehsani-2018'],
  },
  {
    id: 'library.module.drivetrain-differential',
    number: 4,
    title: 'Drivetrain and Differential Systems',
    subtitle: 'Open, Limited-Slip, Locked, Center Differentials, and Single-Pass Efficiency Accounting',
    overview: {
      scope: 'Covers differential kinematics/torque reaction laws and stage-by-stage driveline efficiency.',
      learningObjectives: [
        'Explain why an open differential enforces equal left/right torque capped by the low-grip wheel.',
        'Compare Open, Simplified LSD, Locked, Center Diff, and EV Electronic Allocation.',
      ],
      prerequisites: ['library.module.transmission-systems'],
    },
    fundamentals: [
      'When turning, the outer wheel travels a longer arc than the inner wheel. Differentials permit omega_L != omega_R while transmitting drive torque.',
      'Efficiency losses must be applied strictly once per active mechanical stage to satisfy power conservation.',
    ],
    componentIds: ['drivetrain.fwd.front-differential', 'drivetrain.rwd.rear-differential', 'drivetrain.awd.center-differential', 'drivetrain.4wd.transfer-case', 'drivetrain.common.driveshaft-main'],
    operatingPrinciples: [
      'Open diff: T_L = T_R = min(0.5*T_axle, T_cap,L, T_cap,R).',
      'Simplified LSD: biases high-grip side up to TBR * T_low + T_preload.',
    ],
    equationIds: ['eq.powertrain.open-diff', 'eq.powertrain.lsd-diff', 'eq.powertrain.locked-diff'],
    engineeringApplications: [
      'Locked axles maximize straight-line off-road/split-mu traction at the expense of cornering tire scrub.',
      'AWD center differentials avoid 4WD pavement wind-up.',
    ],
    relatedSimulations: [
      {
        title: 'Split-mu Ice/Asphalt Differential Lab',
        description: 'Set Left mu=0.15 and Right mu=0.90 and toggle Open vs LSD vs Locked.',
        route: '/simulator',
        configId: 'vehicle.config.ice-rwd',
      },
    ],
    glossaryTerms: [
      { term: 'Torque Bias Ratio', symbol: 'TBR', definition: 'Maximum torque ratio an LSD can support between high-grip and low-grip wheels.' },
    ],
    linkedInsightIds: ['insight.powertrain.differential-operation', 'insight.powertrain.drivetrain-efficiency'],
    referenceIds: ['ref.book.milliken-1995'],
  },
  {
    id: 'library.module.vehicle-architecture',
    number: 5,
    title: 'Vehicle Architecture and Layout',
    subtitle: 'Comparative Engineering of All Seven Canonical ICE and EV Layouts',
    overview: {
      scope: 'Synthesizes packaging, static weight distribution, traction, efficiency, and dynamic trade-offs across all 7 KINERA configurations.',
      learningObjectives: [
        'Contrast ICE-FWD, ICE-RWD, ICE-AWD, ICE-4WD, EV-FWD, EV-RWD, and EV-DUAL-AWD.',
        'Evaluate architectural differences using matched-baseline controlled simulations.',
      ],
      prerequisites: ['library.module.drivetrain-differential'],
    },
    fundamentals: [
      'No single drivetrain architecture dominates every metric: FWD excels in packaging and drivetrain efficiency, RWD separates steering from launch grip, AWD/EV-DUAL excel in all-weather traction, and 4WD excels in low-range steep climbs.',
    ],
    componentIds: ['vehicle.axle.front', 'vehicle.axle.rear', 'drivetrain.common.cv-joint', 'drivetrain.common.universal-joint'],
    operatingPrinciples: [
      'Every configuration executes through one topology-driven physics engine and one shared 3D assembly hierarchy.',
    ],
    equationIds: ['eq.powertrain.tractive-force', 'eq.dynamics.weight-transfer-longitudinal'],
    engineeringApplications: [
      'Matched-baseline comparison isolates drivetrain topology effects from vehicle mass or tire changes.',
    ],
    relatedSimulations: [
      {
        title: '7-Configuration Controlled Comparison',
        description: 'Run side-by-side matched-baseline acceleration and efficiency benchmarks.',
        route: '/simulator',
        configId: 'vehicle.config.ice-awd',
      },
    ],
    glossaryTerms: [
      { term: 'Matched Baseline', definition: 'Controlled comparison locking mass, tires, aero, and road mu across configurations.' },
    ],
    linkedInsightIds: ['insight.architecture.fwd', 'insight.architecture.rwd', 'insight.architecture.awd', 'insight.architecture.4wd'],
    referenceIds: ['ref.book.gillespie-2021', 'ref.book.wong-2022'],
  },
  {
    id: 'library.module.ev-powertrain',
    number: 6,
    title: 'Electric Vehicle Powertrain',
    subtitle: 'Battery Packs, BMS Ceilings, Energy Consumption (Wh/km), and Dual-Motor Allocation',
    overview: {
      scope: 'Covers electrochemical energy storage, BMS constraints, SOC integration, and multi-motor EV architecture.',
      learningObjectives: [
        'Model battery terminal voltage drop and Joule heat losses.',
        'Analyze single-motor vs dual-motor EV packaging and regenerative braking capture.',
      ],
      prerequisites: ['library.module.vehicle-architecture'],
    },
    fundamentals: [
      'EV powertrains replace mechanical multi-gear transmissions and longitudinal shafts with high-voltage DC buses and compact e-axles.',
      'Battery energy consumption integrates V_oc * I_batt over time, capturing both motor output and internal R_int losses.',
    ],
    componentIds: ['ev.battery.pack', 'ev.battery.enclosure', 'ev.battery.cell-module', 'ev.bms.controller', 'ev.hv.pdu-cabling'],
    operatingPrinciples: [
      'BMS enforces 165 kW (single) or 240 kW (dual) discharge caps, 2% minimum SOC cutoff, and regen tapering above 95% SOC.',
    ],
    equationIds: ['eq.ev.electrical-power', 'eq.ev.energy-consumption'],
    engineeringApplications: [
      'EV-DUAL-AWD varies front/rear torque split purely in software.',
    ],
    relatedSimulations: [
      {
        title: 'EV Single vs Dual-Motor Comparison',
        description: 'Compare launch grip, Wh/km efficiency, and dual-axle regen.',
        route: '/simulator',
        configId: 'vehicle.config.ev-dual-awd',
      },
    ],
    glossaryTerms: [
      { term: 'SOC', definition: 'Battery State of Charge in [0, 1] (0% to 100%).' },
      { term: 'BMS', definition: 'Battery Management System supervising voltage, current, SOC, and thermal limits.' },
    ],
    linkedInsightIds: ['insight.ev.battery-architecture', 'insight.ev.bms', 'insight.ev.reduction-gearbox', 'insight.ev.energy-efficiency'],
    referenceIds: ['ref.book.ehsani-2018'],
  },
  {
    id: 'library.module.ev-motors-electronics',
    number: 7,
    title: 'Electric Motors and Power Electronics',
    subtitle: 'Traction Inverters, PMSM Constant-Torque/Field-Weakening Envelopes, and Induction Variants',
    overview: {
      scope: 'Details bidirectional DC-to-AC inverters, PMSM torque-speed curves, 2D efficiency maps, and induction coast behavior.',
      learningObjectives: [
        'Sketch and compute PMSM torque envelopes across base speed and field-weakening regions.',
        'Explain PMSM vs Induction motor trade-offs without electromagnetic FEA.',
      ],
      prerequisites: ['library.module.ev-powertrain'],
    },
    fundamentals: [
      'Below base speed omega_base = P_peak / T_peak, motor torque stays constant at 310 N·m; above omega_base, torque tapers as P_peak / omega.',
    ],
    componentIds: ['ev.inverter.front', 'ev.inverter.rear', 'ev.motor.front', 'ev.motor.rear', 'ev.motor.pmsm', 'ev.motor.induction'],
    operatingPrinciples: [
      'Inverter efficiency (~96%) and 2D motor efficiency (78%–96%) chain cleanly to compute DC bus current.',
    ],
    equationIds: ['eq.ev.motor-envelope', 'eq.ev.motor-efficiency', 'eq.ev.electrical-power'],
    engineeringApplications: [
      'Combining a rear PMSM with a front induction or disconnect unit optimizes highway cruise Wh/km.',
    ],
    relatedSimulations: [
      {
        title: 'EV Motor Envelope & Efficiency Explorer',
        description: 'Sweep motor RPM from 0 to 14,000 RPM and observe field weakening.',
        route: '/simulator',
        configId: 'vehicle.config.ev-rwd',
      },
    ],
    glossaryTerms: [
      { term: 'Field Weakening', definition: 'D-axis flux reduction enabling motor rotation above base speed at constant power.' },
    ],
    linkedInsightIds: ['insight.ev.inverter', 'insight.ev.pmsm', 'insight.ev.induction-motor'],
    referenceIds: ['ref.book.ehsani-2018'],
  },
  {
    id: 'library.module.vehicle-dynamics',
    number: 8,
    title: 'Vehicle Dynamics Fundamentals',
    subtitle: 'Longitudinal Forces, Quasi-Static Weight Transfer, and 2-DOF Linear Bicycle Handling',
    overview: {
      scope: 'Presents KINERA’s core V1 longitudinal and lateral vehicle dynamics equations, RK4 integration, and linear validity limits.',
      learningObjectives: [
        'Solve longitudinal speed, distance, and top-speed equilibrium.',
        'Analyze yaw rate, sideslip, and understeer gradient K_us using the 2-DOF bicycle model.',
      ],
      prerequisites: ['library.module.automotive-fundamentals'],
    },
    fundamentals: [
      'Longitudinal dynamics balances wheel thrust against quadratic aerodynamic drag, rolling resistance, and road gradient.',
      'Lateral dynamics tracks lateral velocity v_y and yaw rate r with validity warnings whenever |alpha| > 6 deg or |a_y| > 0.4g.',
    ],
    componentIds: ['vehicle.dynamics.longitudinal', 'vehicle.dynamics.lateral', 'vehicle.dynamics.weight-transfer', 'vehicle.steering.rack-pinion'],
    operatingPrinciples: [
      'Classical 4th-order Runge-Kutta (RK4) integrates ODE states deterministically with low-speed sub-stepping and Ackermann transition below 1 m/s.',
    ],
    equationIds: ['eq.dynamics.longitudinal-net-force', 'eq.dynamics.aero-drag', 'eq.dynamics.bicycle-lateral', 'eq.dynamics.bicycle-yaw', 'eq.dynamics.understeer-gradient', 'eq.dynamics.weight-transfer-longitudinal', 'eq.dynamics.weight-transfer-lateral'],
    engineeringApplications: [
      'CG location (a vs b) directly governs understeer gradient K_us and static launch traction.',
    ],
    relatedSimulations: [
      {
        title: 'Longitudinal & 2-DOF Bicycle Simulator',
        description: 'Run step-steer trajectories and grade-climb sweeps.',
        route: '/simulator',
        configId: 'vehicle.config.ice-rwd',
      },
    ],
    glossaryTerms: [
      { term: 'Understeer Gradient', symbol: 'K_us', unit: 'rad/(m/s²)', definition: 'Measure of steady-state steering angle change required per unit lateral acceleration.' },
    ],
    linkedInsightIds: ['insight.dynamics.longitudinal', 'insight.dynamics.aero-drag', 'insight.dynamics.weight-transfer', 'insight.dynamics.lateral-bicycle', 'insight.dynamics.understeer-oversteer'],
    referenceIds: ['ref.book.gillespie-2021', 'ref.book.rajamani-2012'],
  },
  {
    id: 'library.module.tire-traction',
    number: 9,
    title: 'Tire Mechanics and Traction',
    subtitle: 'Friction Bounds (μ · F_z) and the Simplified Isotropic Friction Circle',
    overview: {
      scope: 'Connects vertical tire loads from weight transfer to peak longitudinal/lateral grip and combined slip limits.',
      learningObjectives: [
        'Evaluate combined utilization index Util_i <= 1.0.',
        'Explain why V1 uses an educational friction circle rather than Pacejka nonlinear fitting.',
      ],
      prerequisites: ['library.module.vehicle-dynamics'],
    },
    fundamentals: [
      'Every tire force—acceleration, braking, or cornering—must pass through four small contact patches bounded by mu * F_z.',
    ],
    componentIds: ['vehicle.wheel.tire', 'vehicle.wheel.contact-patch', 'vehicle.dynamics.tire-traction'],
    operatingPrinciples: [
      'When longitudinal demand F_x consumes grip, available lateral grip shrinks to sqrt((mu*Fz)^2 - F_x^2).',
    ],
    equationIds: ['eq.dynamics.friction-limit', 'eq.dynamics.friction-circle'],
    engineeringApplications: [
      'Explains FWD corner-exit understeer vs RWD power-oversteer saturation.',
    ],
    relatedSimulations: [
      {
        title: '4-Wheel Friction Circle Lab',
        description: 'Combine heavy throttle with steering on dry and wet surfaces.',
        route: '/simulator',
        configId: 'vehicle.config.ice-fwd',
      },
    ],
    glossaryTerms: [
      { term: 'Friction Circle', definition: 'Simplified isotropic boundary (Fx / mu*Fz)^2 + (Fy / mu*Fz)^2 <= 1.' },
    ],
    linkedInsightIds: ['insight.dynamics.tire-friction', 'insight.dynamics.combined-tire-forces'],
    referenceIds: ['ref.book.milliken-1995', 'ref.book.wong-2022'],
  },
  {
    id: 'library.module.braking-stability',
    number: 10,
    title: 'Braking Systems and Vehicle Stability',
    subtitle: 'Stopping Distance, Front/Rear Brake Bias, Conceptual ABS, and EV Regenerative Blending',
    overview: {
      scope: 'Covers braking force limits, dynamic weight transfer under deceleration, conceptual ABS clamping, and EV energy recovery.',
      learningObjectives: [
        'Compute stopping distance d = v_0^2 / (2|a|) and compare against biased time-stepped braking.',
        'Analyze front vs rear axle lockup consequences and regenerative brake blending.',
      ],
      prerequisites: ['library.module.tire-traction'],
    },
    fundamentals: [
      'Braking transfers load forward onto the front axle while unloading the rear axle, making front brake bias (~70%) essential for stability.',
    ],
    componentIds: ['vehicle.braking.master-cylinder', 'vehicle.braking.abs-modulator', 'vehicle.braking.caliper', 'vehicle.braking.disc-rotor', 'vehicle.dynamics.braking'],
    operatingPrinciples: [
      'Conceptual ABS clamps wheel braking force at 0.95 * mu * F_z instead of dropping to 0.80 * mu locked-wheel sliding friction.',
      'EV regenerative braking reverses motor torque first, supplemented by friction calipers.',
    ],
    equationIds: ['eq.dynamics.braking-force', 'eq.dynamics.stopping-distance', 'eq.ev.energy-consumption'],
    engineeringApplications: [
      'Zero-crossing sub-step interpolation ensures exact stopping distance without phantom negative reverse creep.',
    ],
    relatedSimulations: [
      {
        title: 'Braking Bias & Regen Journey',
        description: 'Toggle conceptual ABS and inspect 4-wheel deceleration normal loads.',
        route: '/simulator',
        configId: 'vehicle.config.ev-rwd',
      },
    ],
    glossaryTerms: [
      { term: 'Brake Bias', definition: 'Percentage of total hydraulic braking force allocated to the front axle (default 70%).' },
    ],
    linkedInsightIds: ['insight.architecture.braking', 'insight.dynamics.braking', 'insight.ev.regenerative-braking'],
    referenceIds: ['ref.book.gillespie-2021', 'ref.book.ehsani-2018'],
  },
];
