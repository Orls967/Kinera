import type { AnimationSequence, ConfigId, FourWdMode, VehicleConfiguration } from '../types/kinera';

export interface JourneyStage {
  stepIndex: number;
  id: string;
  title: string;
  subtitle: string;
  componentIds: string[];
  flowMode: 'chemical' | 'mechanical' | 'electrical_dc' | 'electrical_ac' | 'regen';
  cameraPreset:
    | 'isometric-front'
    | 'side-profile'
    | 'top-plan'
    | 'front-axle'
    | 'rear-axle'
    | 'underbody-drivetrain'
    | 'powertrain-focus';
  explanation: string;
  telemetryKey: 'source' | 'prime_mover' | 'coupling' | 'gearbox' | 'transfer' | 'differential' | 'axles' | 'wheels';
}

export function buildJourneyStagesForConfig(
  cfg: VehicleConfiguration,
  options: { evRegenMode: boolean; fourWdMode: FourWdMode },
): JourneyStage[] {
  if (cfg.powertrainType === 'ev') {
    const isDual = cfg.id === 'vehicle.config.ev-dual-awd';
    const isFront = cfg.topology.drivenAxles.includes('front');
    const isRear = cfg.topology.drivenAxles.includes('rear');

    const inverterIds = [
      ...(isFront ? ['ev.inverter.front'] : []),
      ...(isRear ? ['ev.inverter.rear'] : []),
    ];
    const motorIds = [
      ...(isFront ? ['ev.motor.front'] : []),
      ...(isRear ? ['ev.motor.rear'] : []),
    ];
    const reductionIds = [
      ...(isFront ? ['ev.transmission.reduction-gearbox-front'] : []),
      ...(isRear ? ['ev.transmission.reduction-gearbox-rear'] : []),
    ];
    const diffIds = [
      ...(isFront ? ['drivetrain.ev.front-differential'] : []),
      ...(isRear ? ['drivetrain.ev.rear-differential'] : []),
    ];
    const axleIds = [
      ...(isFront ? ['drivetrain.common.axle-shaft-front-left', 'drivetrain.common.axle-shaft-front-right'] : []),
      ...(isRear ? ['drivetrain.common.axle-shaft-rear-left', 'drivetrain.common.axle-shaft-rear-right'] : []),
    ];

    const forwardStages: JourneyStage[] = [
      {
        stepIndex: 0,
        id: 'ev-battery-bms',
        title: '1. HV Battery Pack & BMS',
        subtitle: '400 V DC Electrochemical Storage',
        componentIds: ['ev.battery.pack', 'ev.bms.controller', 'ev.hv.pdu-cabling'],
        flowMode: options.evRegenMode ? 'regen' : 'electrical_dc',
        cameraPreset: 'underbody-drivetrain',
        explanation: options.evRegenMode
          ? 'In Regenerative Braking mode, recovered DC current flows back into the lithium-ion pack, bounded by BMS charge acceptance (tapered above 95% SOC) and pack voltage V_term = V_oc - I*R_int.'
          : 'The underfloor lithium-ion battery pack supplies 400 V DC through the HV junction box, regulated by the BMS discharge ceiling (165 kW single-motor / 240 kW dual-motor).',
        telemetryKey: 'source',
      },
      {
        stepIndex: 1,
        id: 'ev-inverter',
        title: isDual ? '2. Dual Front & Rear Inverters' : `2. ${isFront ? 'Front' : 'Rear'} Traction Inverter`,
        subtitle: 'HV DC <-> Variable-Frequency 3-Phase AC',
        componentIds: inverterIds,
        flowMode: options.evRegenMode ? 'regen' : 'electrical_ac',
        cameraPreset: isDual ? 'top-plan' : isFront ? 'front-axle' : 'rear-axle',
        explanation: options.evRegenMode
          ? 'Bidirectional IGBT/SiC power switches rectify 3-phase AC back into HV DC at ~96% conversion efficiency.'
          : 'Power electronics switch 400 V DC into synchronized 3-phase AC stator waveforms at ~96% efficiency.',
        telemetryKey: 'coupling',
      },
      {
        stepIndex: 2,
        id: 'ev-motor',
        title: isDual ? '3. Dual PMSM Traction Motors' : `3. ${isFront ? 'Front' : 'Rear'} PMSM Motor`,
        subtitle: 'Electromagnetic Torque Generation (0–14,000 RPM)',
        componentIds: motorIds,
        flowMode: options.evRegenMode ? 'regen' : 'mechanical',
        cameraPreset: isDual ? 'top-plan' : isFront ? 'front-axle' : 'rear-axle',
        explanation: options.evRegenMode
          ? 'Kinetic energy spins the rotor against stator field excitation, generating retarding generator torque while converting mechanical power into AC current.'
          : 'Produces full 310 N·m peak torque from standstill up to base speed (~4,620 RPM), then enters constant-power field weakening up to 14,000 RPM.',
        telemetryKey: 'prime_mover',
      },
      {
        stepIndex: 3,
        id: 'ev-reduction',
        title: isDual ? '4. Independent F/R Reduction Gearboxes' : '4. Single-Speed Reduction Gearbox',
        subtitle: isDual ? 'Front 8.90:1 / Rear 8.65:1 Helical' : 'Fixed 8.65:1 Two-Stage Helical',
        componentIds: reductionIds,
        flowMode: options.evRegenMode ? 'regen' : 'mechanical',
        cameraPreset: isFront && !isRear ? 'front-axle' : 'rear-axle',
        explanation:
          'Steps high-RPM motor shaft rotation down by 8.65x (8.90x front dual) while multiplying torque cleanly without multi-gear shifting.',
        telemetryKey: 'gearbox',
      },
      {
        stepIndex: 4,
        id: 'ev-differential',
        title: isDual ? '5. Independent F/R E-Axle Differentials' : `5. EV ${isFront ? 'Front' : 'Rear'} Differential`,
        subtitle: isDual ? 'Software-Defined Electronic Allocation' : 'Coaxial Bevel L/R Torque Split',
        componentIds: diffIds,
        flowMode: options.evRegenMode ? 'regen' : 'mechanical',
        cameraPreset: isDual ? 'top-plan' : isFront ? 'front-axle' : 'rear-axle',
        explanation: isDual
          ? 'With no mechanical driveshaft or center differential, front and rear motors vary torque allocation electronically from 0:100 to 100:0.'
          : 'Splits reduction output torque equally to left and right half-shafts while permitting wheel-speed differentiation in turns.',
        telemetryKey: 'differential',
      },
      {
        stepIndex: 5,
        id: 'ev-wheels',
        title: isDual ? '6. All 4 Driven Wheels & Contact Patches' : `6. ${isFront ? 'Front' : 'Rear'} Half-Shafts & Tires`,
        subtitle: 'Tractive Force F = T_wheel / r_eff (<= mu * F_z)',
        componentIds: [...axleIds, 'vehicle.wheel.tire', 'vehicle.wheel.contact-patch'],
        flowMode: options.evRegenMode ? 'regen' : 'mechanical',
        cameraPreset: 'isometric-front',
        explanation: options.evRegenMode
          ? 'Tire contact patches transmit decelerating force from the road back through half-shafts into the motor, blended with friction calipers if demand exceeds regen capacity.'
          : 'Half-shafts drive wheel hubs, reacting tractive force against road friction bounded by each tire’s instantaneous normal load.',
        telemetryKey: 'wheels',
      },
    ];

    return options.evRegenMode ? [...forwardStages].reverse().map((s, idx) => ({ ...s, stepIndex: idx })) : forwardStages;
  }

  // ICE Configurations
  const isFwd = cfg.id === 'vehicle.config.ice-fwd';
  const isRwd = cfg.id === 'vehicle.config.ice-rwd';
  const isAwd = cfg.id === 'vehicle.config.ice-awd';
  const is4wd = cfg.id === 'vehicle.config.ice-4wd';

  const frontActive = isFwd || isAwd || (is4wd && options.fourWdMode !== '2H');
  const rearActive = isRwd || isAwd || is4wd;

  const stages: JourneyStage[] = [
    {
      stepIndex: 0,
      id: 'ice-intake-fuel',
      title: '1. Air-Fuel Charge & Intake',
      subtitle: 'Throttle Valve & Stoichiometric Injection',
      componentIds: ['ice.intake.manifold', 'ice.fuel.delivery-system'],
      flowMode: 'chemical',
      cameraPreset: 'powertrain-focus',
      explanation:
        'Driver throttle command u_th modulates intake manifold airflow while injectors meter gasoline at ~14.7:1 air-fuel ratio.',
      telemetryKey: 'source',
    },
    {
      stepIndex: 1,
      id: 'ice-four-stroke',
      title: '2. Four-Stroke Combustion & Pistons',
      subtitle: 'Intake -> Compression -> Power -> Exhaust (720°)',
      componentIds: ['ice.engine.cylinder-head', 'ice.engine.piston', 'ice.engine.valvetrain'],
      flowMode: 'chemical',
      cameraPreset: 'powertrain-focus',
      explanation:
        'Spark ignition near Top Dead Center expands high-pressure combustion gases against the 86 mm piston crown during the Power stroke.',
      telemetryKey: 'source',
    },
    {
      stepIndex: 2,
      id: 'ice-crankshaft',
      title: '3. Connecting Rods & Crankshaft',
      subtitle: 'Reciprocating Force -> Rotary Torque T_eng',
      componentIds: ['ice.engine.connecting-rod', 'ice.engine.crankshaft', 'ice.clutch.flywheel'],
      flowMode: 'mechanical',
      cameraPreset: 'powertrain-focus',
      explanation:
        'Slider-crank geometry converts linear piston pressure into rotary crankshaft torque (up to 205 N·m @ 4,400 RPM), smoothed by the flywheel.',
      telemetryKey: 'prime_mover',
    },
    {
      stepIndex: 3,
      id: 'ice-clutch',
      title: '4. Friction Clutch Coupling',
      subtitle: 'Torque Transfer to Gearbox Input Shaft',
      componentIds: ['ice.clutch.flywheel', 'ice.clutch.disc-pressure-plate'],
      flowMode: 'mechanical',
      cameraPreset: 'powertrain-focus',
      explanation:
        'Diaphragm pressure plate clamps the friction disc against the flywheel to transmit engine torque smoothly into the transmission.',
      telemetryKey: 'coupling',
    },
    {
      stepIndex: 4,
      id: 'ice-gearbox',
      title: isFwd ? '5. Integrated Transverse Transaxle' : '5. 6-Speed Longitudinal Manual Gearbox',
      subtitle: 'Stepped Ratio Multiplication G_k & Stage Efficiency',
      componentIds: [isFwd ? 'ice.transmission.transaxle' : 'ice.transmission.manual.gear-set'],
      flowMode: 'mechanical',
      cameraPreset: isFwd ? 'front-axle' : 'underbody-drivetrain',
      explanation: isFwd
        ? 'Transaxle combines the 6-speed gearset and helical final drive (F = 3.94) beside the transverse engine, maximizing packaging efficiency (~91.7% total).'
        : 'Selected gear pair multiplies input torque by G_k (3.62 in 1st down to 0.69 overdrive) and divides shaft speed by G_k.',
      telemetryKey: 'gearbox',
    },
  ];

  if (isRwd) {
    stages.push({
      stepIndex: 5,
      id: 'ice-rwd-driveshaft',
      title: '6. U-Joints & Main Driveshaft',
      subtitle: 'Longitudinal Torque Tunnel Delivery',
      componentIds: ['drivetrain.common.universal-joint', 'drivetrain.common.driveshaft-main'],
      flowMode: 'mechanical',
      cameraPreset: 'underbody-drivetrain',
      explanation:
        'Tubular propeller shaft transmits gearbox output torque rearward along the chassis tunnel to the rear differential pinion.',
      telemetryKey: 'transfer',
    });
  } else if (isAwd) {
    stages.push({
      stepIndex: 5,
      id: 'ice-awd-center-diff',
      title: '6. Center Differential & F/R Shafts',
      subtitle: 'Continuous Center Torque Split',
      componentIds: [
        'drivetrain.awd.center-differential',
        'drivetrain.common.driveshaft-front',
        'drivetrain.common.driveshaft-rear',
      ],
      flowMode: 'mechanical',
      cameraPreset: 'underbody-drivetrain',
      explanation:
        'Center differential divides gearbox output between front and rear propeller shafts while allowing axle speed differences during paved turns.',
      telemetryKey: 'transfer',
    });
  } else if (is4wd) {
    stages.push({
      stepIndex: 5,
      id: 'ice-4wd-transfer-case',
      title: `6. 4WD Transfer Case (${options.fourWdMode})`,
      subtitle: options.fourWdMode === '4L' ? 'Low-Range 2.48:1 Crawling Reduction' : options.fourWdMode === '4H' ? 'Locked 4H Front+Rear Drive' : '2H Rear-Only Highway Mode',
      componentIds: [
        'drivetrain.4wd.transfer-case',
        'drivetrain.common.driveshaft-rear',
        ...(options.fourWdMode !== '2H' ? ['drivetrain.common.driveshaft-front'] : []),
      ],
      flowMode: 'mechanical',
      cameraPreset: 'underbody-drivetrain',
      explanation:
        options.fourWdMode === '2H'
          ? 'In 2H mode, the front driveshaft is disengaged and 100% of torque travels rearward.'
          : options.fourWdMode === '4L'
            ? 'Planetary reduction multiplies torque by 2.48x and locks front and rear driveshafts together for maximum low-speed climb traction.'
            : '4H rigidly couples front and rear driveshafts at 1.00:1 for loose/slippery surfaces (avoid high-mu pavement turns due to wind-up).',
      telemetryKey: 'transfer',
    });
  }

  const diffComponents: string[] = [];
  if (isFwd) diffComponents.push('drivetrain.fwd.front-differential');
  if (isRwd) diffComponents.push('drivetrain.rwd.rear-differential');
  if (isAwd) diffComponents.push('drivetrain.awd.front-differential', 'drivetrain.awd.rear-differential');
  if (is4wd) {
    diffComponents.push('drivetrain.4wd.rear-differential');
    if (options.fourWdMode !== '2H') diffComponents.push('drivetrain.4wd.front-differential');
  }

  stages.push({
    stepIndex: stages.length,
    id: 'ice-differentials',
    title: `${stages.length + 1}. Final Drive & Differential(s)`,
    subtitle: '90° Bevel/Helical Final Drive & L/R Split',
    componentIds: diffComponents,
    flowMode: 'mechanical',
    cameraPreset: isFwd ? 'front-axle' : isRwd ? 'rear-axle' : 'top-plan',
    explanation:
      'Final drive multiplies torque by F (3.94 or 4.10) and the differential governs left/right wheel torque distribution (Open, LSD, or Locked).',
    telemetryKey: 'differential',
  });

  const wheelSideIds: string[] = ['drivetrain.common.cv-joint', 'vehicle.wheel.tire', 'vehicle.wheel.contact-patch'];
  if (frontActive) {
    wheelSideIds.push('drivetrain.common.axle-shaft-front-left', 'drivetrain.common.axle-shaft-front-right');
  }
  if (rearActive) {
    wheelSideIds.push('drivetrain.common.axle-shaft-rear-left', 'drivetrain.common.axle-shaft-rear-right');
  }

  stages.push({
    stepIndex: stages.length,
    id: 'ice-axles-wheels',
    title: `${stages.length + 1}. Half-Shafts & Driven Tires`,
    subtitle: 'Tractive Force Applied to Road Contact Patch',
    componentIds: wheelSideIds,
    flowMode: 'mechanical',
    cameraPreset: 'isometric-front',
    explanation:
      'Driven half-shafts deliver wheel torque through CV joints to the tires, generating longitudinal tractive force bounded by mu * F_z.',
    telemetryKey: 'wheels',
  });

  return stages;
}

export const ANIMATION_SEQUENCES: AnimationSequence[] = [
  {
    id: 'anim.cinematic.turntable-360',
    schemaVersion: '1.0.0',
    title: '360° Engineering Laboratory Turntable',
    category: 'cinematic',
    vehicleConfigurations: [
      'vehicle.config.ice-fwd',
      'vehicle.config.ice-rwd',
      'vehicle.config.ice-awd',
      'vehicle.config.ice-4wd',
      'vehicle.config.ev-fwd',
      'vehicle.config.ev-rwd',
      'vehicle.config.ev-dual-awd',
    ],
    durationSec: 12.0,
    steps: [
      {
        stepIndex: 0,
        id: 'turntable-orbit',
        label: 'Full 360° Architecture Orbit',
        startTimeSec: 0,
        endTimeSec: 12,
        targetComponentIds: ['vehicle.wheel.tire'],
        cameraPresetId: 'isometric-front',
        flowMode: 'mechanical',
        educationalPurpose: 'Provides full spatial orientation of chassis proportions and drivetrain layout.',
      },
    ],
  },
  {
    id: 'anim.journey.ice-four-stroke',
    schemaVersion: '1.0.0',
    title: 'Four-Stroke Otto Cycle Synchronization',
    category: 'journey',
    vehicleConfigurations: [
      'vehicle.config.ice-fwd',
      'vehicle.config.ice-rwd',
      'vehicle.config.ice-awd',
      'vehicle.config.ice-4wd',
    ],
    durationSec: 4.0,
    steps: [
      {
        stepIndex: 0,
        id: 'intake',
        label: 'Intake Stroke (0–180°)',
        startTimeSec: 0,
        endTimeSec: 1,
        targetComponentIds: ['ice.engine.piston', 'ice.engine.valvetrain'],
        flowMode: 'chemical',
        educationalPurpose: 'Intake valve opens as piston descends to draw fresh air-fuel mixture.',
      },
      {
        stepIndex: 1,
        id: 'compression',
        label: 'Compression Stroke (180–360°)',
        startTimeSec: 1,
        endTimeSec: 2,
        targetComponentIds: ['ice.engine.piston', 'ice.engine.cylinder-head'],
        flowMode: 'chemical',
        educationalPurpose: 'Valves close and piston compresses charge by 10.5:1 before ignition.',
      },
      {
        stepIndex: 2,
        id: 'power',
        label: 'Power / Expansion Stroke (360–540°)',
        startTimeSec: 2,
        endTimeSec: 3,
        targetComponentIds: ['ice.engine.piston', 'ice.engine.connecting-rod', 'ice.engine.crankshaft'],
        flowMode: 'mechanical',
        educationalPurpose: 'Spark ignition expands combustion gases, driving crankpin torque.',
      },
      {
        stepIndex: 3,
        id: 'exhaust',
        label: 'Exhaust Stroke (540–720°)',
        startTimeSec: 3,
        endTimeSec: 4,
        targetComponentIds: ['ice.engine.piston', 'ice.exhaust.manifold-system'],
        flowMode: 'chemical',
        educationalPurpose: 'Exhaust valve opens as piston rises to scavenge burned gases.',
      },
    ],
  },
  {
    id: 'anim.journey.ev-single-propulsion',
    schemaVersion: '1.0.0',
    title: 'EV Single-Motor Propulsion & Regen',
    category: 'journey',
    vehicleConfigurations: ['vehicle.config.ev-fwd', 'vehicle.config.ev-rwd'],
    durationSec: 12.0,
    supportsReverseRegen: true,
    steps: [
      {
        stepIndex: 0,
        id: 'dc-bus',
        label: 'Battery Pack DC Output',
        startTimeSec: 0,
        endTimeSec: 3,
        targetComponentIds: ['ev.battery.pack', 'ev.bms.controller', 'ev.hv.pdu-cabling'],
        flowMode: 'electrical_dc',
        educationalPurpose: 'Shows 400 V DC energy delivery from battery modules to traction inverter.',
      },
      {
        stepIndex: 1,
        id: 'ac-drive',
        label: 'Inverter 3-Phase AC & Motor',
        startTimeSec: 3,
        endTimeSec: 7,
        targetComponentIds: ['ev.inverter.rear', 'ev.motor.rear'],
        flowMode: 'electrical_ac',
        educationalPurpose: 'Shows DC-to-AC inversion and electromagnetic rotor torque.',
      },
      {
        stepIndex: 2,
        id: 'e-axle-wheels',
        label: 'Reduction Gearbox, Diff & Wheels',
        startTimeSec: 7,
        endTimeSec: 12,
        targetComponentIds: ['ev.transmission.reduction-gearbox-rear', 'drivetrain.ev.rear-differential', 'vehicle.wheel.tire'],
        flowMode: 'mechanical',
        educationalPurpose: 'Demonstrates 8.65:1 torque multiplication to driven road wheels.',
      },
    ],
  },
];

export const CONFIG_OPTIONS_ORDER: ConfigId[] = [
  'vehicle.config.ice-fwd',
  'vehicle.config.ice-rwd',
  'vehicle.config.ice-awd',
  'vehicle.config.ice-4wd',
  'vehicle.config.ev-fwd',
  'vehicle.config.ev-rwd',
  'vehicle.config.ev-dual-awd',
];
