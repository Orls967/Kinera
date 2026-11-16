import { describe, expect, it } from 'vitest';
import { ANIMATION_SEQUENCES } from '../data/animations';
import { COMPONENT_BY_ID, COMPONENTS } from '../data/components';
import { VEHICLE_CONFIGURATIONS } from '../data/configs';
import { EQUATIONS } from '../data/equations';
import { ENGINEERING_INSIGHTS } from '../data/insights';
import { TECHNICAL_LIBRARY_MODULES } from '../data/library';
import { REFERENCES } from '../data/references';
import {
  validateAnimationSequenceSchema,
  validateComponentSchema,
  validateVehicleConfigurationSchema,
} from './validator';

const CANONICAL_ID_REGEX = /^[a-z][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*){2,4}$/;

describe('Schema & Canonical Registry Integrity', () => {
  it('validates all 7 vehicle configurations against vehicle-configuration.schema.json', () => {
    expect(VEHICLE_CONFIGURATIONS).toHaveLength(7);
    const ids = new Set<string>();
    for (const cfg of VEHICLE_CONFIGURATIONS) {
      expect(CANONICAL_ID_REGEX.test(cfg.id)).toBe(true);
      expect(ids.has(cfg.id)).toBe(false);
      ids.add(cfg.id);
      const res = validateVehicleConfigurationSchema(cfg);
      expect(res.errors).toEqual([]);
      expect(res.valid).toBe(true);
    }
  });

  it('validates all component metadata records against component.schema.json', () => {
    expect(COMPONENTS.length).toBeGreaterThanOrEqual(45);
    for (const comp of COMPONENTS) {
      expect(CANONICAL_ID_REGEX.test(comp.id)).toBe(true);
      const res = validateComponentSchema(comp);
      expect(res.errors).toEqual([]);
      expect(res.valid).toBe(true);
      for (const refId of comp.engineeringReferences) {
        expect(REFERENCES[refId]).toBeDefined();
      }
    }
  });

  it('validates all animation sequences against animation-sequence.schema.json', () => {
    for (const seq of ANIMATION_SEQUENCES) {
      expect(CANONICAL_ID_REGEX.test(seq.id)).toBe(true);
      const res = validateAnimationSequenceSchema(seq);
      expect(res.errors).toEqual([]);
      expect(res.valid).toBe(true);
    }
  });

  it('verifies all 29 canonical equations and verified references', () => {
    expect(Object.keys(EQUATIONS)).toHaveLength(29);
    for (const eq of Object.values(EQUATIONS)) {
      expect(CANONICAL_ID_REGEX.test(eq.id)).toBe(true);
      expect(REFERENCES[eq.referenceId]).toBeDefined();
      expect(REFERENCES[eq.referenceId].verificationStatus).toBe('VERIFIED');
    }
  });

  it('verifies all 37 Engineering Insights topics and cross-links', () => {
    expect(ENGINEERING_INSIGHTS).toHaveLength(37);
    for (const topic of ENGINEERING_INSIGHTS) {
      expect(CANONICAL_ID_REGEX.test(topic.id)).toBe(true);
      for (const eqId of topic.equationIds) {
        expect(EQUATIONS[eqId]).toBeDefined();
      }
      for (const compId of topic.componentIds) {
        const isDynamicsLogical = compId.startsWith('vehicle.dynamics.');
        if (!isDynamicsLogical) {
          expect(COMPONENT_BY_ID[compId]).toBeDefined();
        }
      }
      for (const refId of topic.referenceIds) {
        expect(REFERENCES[refId]).toBeDefined();
      }
    }
  });

  it('verifies all 10 Technical Library modules follow the 9-part template', () => {
    expect(TECHNICAL_LIBRARY_MODULES).toHaveLength(10);
    for (const mod of TECHNICAL_LIBRARY_MODULES) {
      expect(CANONICAL_ID_REGEX.test(mod.id)).toBe(true);
      expect(mod.overview.learningObjectives.length).toBeGreaterThan(0);
      expect(mod.fundamentals.length).toBeGreaterThan(0);
      expect(mod.operatingPrinciples.length).toBeGreaterThan(0);
      expect(mod.equationIds.length).toBeGreaterThan(0);
      expect(mod.engineeringApplications.length).toBeGreaterThan(0);
      expect(mod.relatedSimulations.length).toBeGreaterThan(0);
      expect(mod.glossaryTerms.length).toBeGreaterThan(0);
      expect(mod.referenceIds.length).toBeGreaterThan(0);
      for (const eqId of mod.equationIds) {
        expect(EQUATIONS[eqId]).toBeDefined();
      }
      for (const refId of mod.referenceIds) {
        expect(REFERENCES[refId]).toBeDefined();
      }
    }
  });
});
