import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldShowDimensionLabel } from '../src/utils/dimensions.js';

test('keeps 3D labels visible by default in 3D view', () => {
  assert.equal(shouldShowDimensionLabel({ is3DView: true, isSelected: false }), true);
});

test('shows label when selected in non-3D contexts', () => {
  assert.equal(shouldShowDimensionLabel({ is3DView: false, isSelected: true, alwaysVisibleIn3D: false }), true);
});

test('hides label when not selected and not always-visible 3D', () => {
  assert.equal(shouldShowDimensionLabel({ is3DView: false, isSelected: false, alwaysVisibleIn3D: false }), false);
});
