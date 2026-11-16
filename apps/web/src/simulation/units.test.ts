import { describe, expect, it } from 'vitest';
import {
  formatAngle,
  formatAngularSpeed,
  formatPower,
  formatSpeed,
  parseAngleToRad,
} from './units';

describe('SI and Engineering Display Unit Conversions', () => {
  it('converts speed between m/s and km/h accurately', () => {
    expect(formatSpeed(27.7778, 'si', 2)).toEqual({ value: '27.78', unit: 'm/s' });
    expect(formatSpeed(27.7778, 'engineering', 1)).toEqual({ value: '100.0', unit: 'km/h' });
  });

  it('converts angular speed between rad/s and RPM', () => {
    const omega = (2 * Math.PI * 3000) / 60;
    expect(formatAngularSpeed(omega, 'si')).toEqual({ value: '314.16', unit: 'rad/s' });
    expect(formatAngularSpeed(omega, 'engineering')).toEqual({ value: '3000', unit: 'RPM' });
  });

  it('converts power between W and kW', () => {
    expect(formatPower(118000, 'si')).toEqual({ value: '118,000', unit: 'W' });
    expect(formatPower(118000, 'engineering', 1)).toEqual({ value: '118.0', unit: 'kW' });
  });

  it('converts steering angles between rad and deg', () => {
    const rad = Math.PI / 18; // 10 deg
    expect(formatAngle(rad, 'engineering', 1)).toEqual({ value: '10.0', unit: 'deg' });
    expect(parseAngleToRad(10, 'engineering')).toBeCloseTo(rad, 9);
  });
});
