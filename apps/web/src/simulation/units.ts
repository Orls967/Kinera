import type { UnitDisplayMode } from '../types/kinera';

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;
const RAD_S_TO_RPM = 60 / (2 * Math.PI);

export function formatSpeed(mps: number, mode: UnitDisplayMode, decimals = 1): { value: string; unit: string } {
  if (!Number.isFinite(mps)) return { value: '—', unit: mode === 'si' ? 'm/s' : 'km/h' };
  if (mode === 'si') {
    return { value: mps.toFixed(decimals), unit: 'm/s' };
  }
  return { value: (mps * 3.6).toFixed(decimals), unit: 'km/h' };
}

export function formatPower(watts: number, mode: UnitDisplayMode, decimals = 1): { value: string; unit: string } {
  if (!Number.isFinite(watts)) return { value: '—', unit: mode === 'si' ? 'W' : 'kW' };
  if (mode === 'si') {
    return { value: Math.round(watts).toLocaleString('en-US'), unit: 'W' };
  }
  return { value: (watts / 1000).toFixed(decimals), unit: 'kW' };
}

export function formatAngularSpeed(
  radPerSec: number,
  mode: UnitDisplayMode,
): { value: string; unit: string } {
  if (!Number.isFinite(radPerSec)) return { value: '—', unit: mode === 'si' ? 'rad/s' : 'RPM' };
  if (mode === 'si') {
    return { value: radPerSec.toFixed(2), unit: 'rad/s' };
  }
  return { value: Math.round(radPerSec * RAD_S_TO_RPM).toString(), unit: 'RPM' };
}

export function formatAngle(rad: number, mode: UnitDisplayMode, decimals = 2): { value: string; unit: string } {
  if (!Number.isFinite(rad)) return { value: '—', unit: mode === 'si' ? 'rad' : 'deg' };
  if (mode === 'si') {
    return { value: rad.toFixed(4), unit: 'rad' };
  }
  return { value: (rad * RAD_TO_DEG).toFixed(decimals), unit: 'deg' };
}

export function formatForce(newtons: number): { value: string; unit: string } {
  if (!Number.isFinite(newtons)) return { value: '—', unit: 'N' };
  return { value: newtons.toFixed(1), unit: 'N' };
}

export function formatTorque(nm: number): { value: string; unit: string } {
  if (!Number.isFinite(nm)) return { value: '—', unit: 'N·m' };
  return { value: nm.toFixed(1), unit: 'N·m' };
}

export function parseAngleToRad(val: number, mode: UnitDisplayMode): number {
  return mode === 'si' ? val : val * DEG_TO_RAD;
}

export function radToDeg(rad: number): number {
  return rad * RAD_TO_DEG;
}

export function degToRad(deg: number): number {
  return deg * DEG_TO_RAD;
}
