import test from 'node:test';
import assert from 'node:assert/strict';
import { cmToInches, inchesToCm, convertLength, formatFeetAndInchesFromCm, roundToTenth } from '../src/utils/dimensions.js';

test('converts cm to inches and back', () => {
  assert.ok(Math.abs(cmToInches(2.54) - 1) < 1e-6);
  assert.ok(Math.abs(inchesToCm(1) - 2.54) < 1e-6);
});

test('converts values across units', () => {
  assert.ok(Math.abs(convertLength(1000, 'mm', 'cm') - 100) < 1e-6);
  assert.ok(Math.abs(convertLength(1, 'm', 'cm') - 100) < 1e-6);
  assert.ok(Math.abs(convertLength(25.4, 'cm', 'in') - 10) < 1e-6);
});

test('formats feet and inches from cm', () => {
  assert.equal(formatFeetAndInchesFromCm(182.88), "6' 0\"");
});

test('rounds to tenth', () => {
  assert.equal(roundToTenth(59.999), 60);
});
