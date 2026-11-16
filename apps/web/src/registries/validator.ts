import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import vehicleConfigSchema from '../../../../docs/schemas/vehicle-configuration.schema.json';
import componentSchema from '../../../../docs/schemas/component.schema.json';
import simInputSchema from '../../../../docs/schemas/simulation-input.schema.json';
import simOutputSchema from '../../../../docs/schemas/simulation-output.schema.json';
import animSeqSchema from '../../../../docs/schemas/animation-sequence.schema.json';
import type {
  AnimationSequence,
  ComponentMetadata,
  SimulationInput,
  SimulationOutput,
  VehicleConfiguration,
} from '../types/kinera';

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const validateConfigFn = ajv.compile(vehicleConfigSchema);
const validateComponentFn = ajv.compile(componentSchema);
const validateSimInputFn = ajv.compile(simInputSchema);
const validateSimOutputFn = ajv.compile(simOutputSchema);
const validateAnimSeqFn = ajv.compile(animSeqSchema);

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function formatErrors(errors: typeof validateConfigFn.errors): string[] {
  if (!errors) return [];
  return errors.map((e) => `${e.instancePath || '/'} ${e.message ?? 'invalid'}`);
}

export function validateVehicleConfigurationSchema(config: VehicleConfiguration): ValidationResult {
  // Strip optional UI-only helper fields before strict additionalProperties:false schema check
  const { learningFocus: _lf, ...schemaPayload } = config;
  const valid = validateConfigFn(schemaPayload);
  return { valid: Boolean(valid), errors: formatErrors(validateConfigFn.errors) };
}

export function validateComponentSchema(component: ComponentMetadata): ValidationResult {
  const { layer: _layer, ...schemaPayload } = component;
  const valid = validateComponentFn(schemaPayload);
  return { valid: Boolean(valid), errors: formatErrors(validateComponentFn.errors) };
}

export function validateSimulationInputSchema(input: SimulationInput): ValidationResult {
  const valid = validateSimInputFn(input);
  return { valid: Boolean(valid), errors: formatErrors(validateSimInputFn.errors) };
}

export function validateSimulationOutputSchema(output: SimulationOutput): ValidationResult {
  const valid = validateSimOutputFn(output);
  return { valid: Boolean(valid), errors: formatErrors(validateSimOutputFn.errors) };
}

export function validateAnimationSequenceSchema(seq: AnimationSequence): ValidationResult {
  const valid = validateAnimSeqFn(seq);
  return { valid: Boolean(valid), errors: formatErrors(validateAnimSeqFn.errors) };
}
