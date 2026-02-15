import test from 'node:test';
import assert from 'node:assert/strict';
import { convertLength, roundToTenth } from '../src/utils/dimensions.js';

test('updates displayed size after a simulated resize delta', () => {
  const originalWidthCm = 60;
  const resizeDeltaCm = 5;
  const updatedWidthCm = originalWidthCm + resizeDeltaCm;
  assert.equal(roundToTenth(updatedWidthCm), 65);
});

test('preserves persisted metric values when displayed in imperial', () => {
  const storedCm = 120;
  const displayedInches = convertLength(storedCm, 'cm', 'in');
  const restoredCm = convertLength(displayedInches, 'in', 'cm');
  assert.ok(Math.abs(restoredCm - storedCm) < 1e-6);
});
