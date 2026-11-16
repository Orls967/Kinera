import type { ReferenceSource } from '../types/kinera';

export const REFERENCES: Record<string, ReferenceSource> = {
  'ref.book.gillespie-2021': {
    id: 'ref.book.gillespie-2021',
    citation:
      'Gillespie, T. D. Fundamentals of Vehicle Dynamics (Revised Edition; Orig. 1992). SAE International, 2021. ISBN-13: 978-1-4686-0176-3.',
    primaryDomain: 'Longitudinal, braking, weight transfer, handling',
    verificationStatus: 'VERIFIED',
  },
  'ref.book.milliken-1995': {
    id: 'ref.book.milliken-1995',
    citation:
      'Milliken, W. F., & Milliken, D. L. Race Car Vehicle Dynamics. SAE International, 1995. ISBN-13: 978-1-56091-526-3.',
    primaryDomain: 'Friction circle, differentials, lateral load transfer',
    verificationStatus: 'VERIFIED',
  },
  'ref.book.rajamani-2012': {
    id: 'ref.book.rajamani-2012',
    citation:
      'Rajamani, R. Vehicle Dynamics and Control (2nd Edition). Springer, 2012. ISBN-13: 978-1-4614-1432-2.',
    primaryDomain: '2-DOF linear bicycle model, yaw dynamics, stability',
    verificationStatus: 'VERIFIED',
  },
  'ref.book.wong-2022': {
    id: 'ref.book.wong-2022',
    citation:
      'Wong, J. Y. Theory of Ground Vehicles (5th Edition). John Wiley & Sons, 2022. ISBN-13: 978-1119719700.',
    primaryDomain: 'Rolling resistance, aero drag, traction, gradeability',
    verificationStatus: 'VERIFIED',
  },
  'ref.book.heywood-2018': {
    id: 'ref.book.heywood-2018',
    citation:
      'Heywood, J. B. Internal Combustion Engine Fundamentals (2nd Edition). McGraw-Hill Education, 2018. ISBN-13: 978-1260116106.',
    primaryDomain: '4-stroke cycle, displacement, volumetric efficiency, ICE torque',
    verificationStatus: 'VERIFIED',
  },
  'ref.book.ehsani-2018': {
    id: 'ref.book.ehsani-2018',
    citation:
      'Ehsani, M., Gao, Y., Longo, S., & Ebrahimi, K. M. Modern Electric, Hybrid Electric, and Fuel Cell Vehicles (3rd Edition). CRC Press, 2018. ISBN-13: 978-1498761772.',
    primaryDomain: 'EV battery, inverter, PMSM/induction motor envelopes, regen',
    verificationStatus: 'VERIFIED',
  },
  'ref.standard.iso-8855': {
    id: 'ref.standard.iso-8855',
    citation:
      'ISO 8855:2011. Road vehicles — Vehicle dynamics and road-holding ability — Vocabulary (2nd Edition). ISO, 2011.',
    primaryDomain: 'Coordinate systems, vehicle dynamics vocabulary',
    verificationStatus: 'VERIFIED',
  },
  'ref.standard.sae-j670': {
    id: 'ref.standard.sae-j670',
    citation:
      'SAE J670_202206. Vehicle Dynamics Terminology. SAE International, June 2022.',
    primaryDomain: 'Vehicle axis terminology, slip angle, understeer gradient',
    verificationStatus: 'VERIFIED',
  },
};
