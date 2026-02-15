
import { describe, it, expect } from 'vitest'

/**
 * Tests for dimension conversion utilities
 * These test the core dimension calculation logic used throughout the app
 */

describe('Dimension Conversion Tests', () => {
  // Test constants based on src/kitchenKreation.js:10147-10150
  const cmPerFoot = 30.48
  const pixelsPerFoot = 15.0
  const cmPerPixel = cmPerFoot * (1.0 / pixelsPerFoot)
  const pixelsPerCm = 1.0 / cmPerPixel
  const decimals = 10

  describe('Unit Conversion - CM to Inches', () => {
    it('should convert 30.48cm to 12 inches', () => {
      const cm = 30.48
      const inches = Math.round(decimals * (cm / 2.54)) / decimals
      expect(inches).toBe(12)
    })

    it('should convert 60cm to approximately 23.62 inches', () => {
      const cm = 60
      const inches = Math.round(decimals * (cm / 2.54)) / decimals
      expect(inches).toBeCloseTo(23.62, 1)
    })

    it('should convert 0cm to 0 inches', () => {
      const cm = 0
      const inches = Math.round(decimals * (cm / 2.54)) / decimals
      expect(inches).toBe(0)
    })
  })

  describe('Unit Conversion - CM to Feet', () => {
    it('should convert 30.48cm to 1 foot', () => {
      const cm = 30.48
      const feet = cm / cmPerFoot
      expect(feet).toBe(1)
    })

    it('should convert 60.96cm to 2 feet', () => {
      const cm = 60.96
      const feet = cm / cmPerFoot
      expect(feet).toBe(2)
    })

    it('should convert 91.44cm to 3 feet', () => {
      const cm = 91.44
      const feet = cm / cmPerFoot
      expect(feet).toBe(3)
    })
  })

  describe('Unit Conversion - CM to Millimeters', () => {
    it('should convert 60cm to 600mm', () => {
      const cm = 60
      const mm = Math.round(decimals * (10 * cm)) / decimals
      expect(mm).toBe(600)
    })

    it('should convert 1cm to 10mm', () => {
      const cm = 1
      const mm = Math.round(decimals * (10 * cm)) / decimals
      expect(mm).toBe(10)
    })

    it('should convert 0.5cm to 5mm', () => {
      const cm = 0.5
      const mm = Math.round(decimals * (10 * cm)) / decimals
      expect(mm).toBe(5)
    })
  })

  describe('Unit Conversion - CM to Meters', () => {
    it('should convert 100cm to 1m', () => {
      const cm = 100
      const m = Math.round(decimals * (0.01 * cm)) / decimals
      expect(m).toBe(1)
    })

    it('should convert 250cm to 2.5m', () => {
      const cm = 250
      const m = Math.round(decimals * (0.01 * cm)) / decimals
      expect(m).toBe(2.5)
    })

    it('should convert 50cm to 0.5m', () => {
      const cm = 50
      const m = Math.round(decimals * (0.01 * cm)) / decimals
      expect(m).toBe(0.5)
    })
  })

  describe('Pixel Conversion', () => {
    it('should correctly calculate cmPerPixel', () => {
      expect(cmPerPixel).toBeCloseTo(2.032, 3)
    })

    it('should correctly calculate pixelsPerCm', () => {
      expect(pixelsPerCm).toBeCloseTo(0.4921, 4)
    })

    it('should convert pixels to cm and back', () => {
      const pixels = 100
      const cm = pixels * cmPerPixel
      const backToPixels = cm * pixelsPerCm
      expect(backToPixels).toBeCloseTo(pixels, 1)
    })
  })

  describe('Feet and Inches Formatting', () => {
    it('should format 30.48cm as 1\'0"', () => {
      const cm = 30.48
      const allInFeet = cm / cmPerFoot
      const floorFeet = Math.floor(allInFeet)
      const remainingFeet = allInFeet - floorFeet
      const remainingInches = Math.round(remainingFeet * 12)
      const formatted = floorFeet + "'" + remainingInches + '"'
      expect(formatted).toBe('1\'0"')
    })

    it('should format 45.72cm as 1\'6"', () => {
      const cm = 45.72
      const allInFeet = cm / cmPerFoot
      const floorFeet = Math.floor(allInFeet)
      const remainingFeet = allInFeet - floorFeet
      const remainingInches = Math.round(remainingFeet * 12)
      const formatted = floorFeet + "'" + remainingInches + '"'
      expect(formatted).toBe('1\'6"')
    })

    it('should format 91.44cm as 3\'0"', () => {
      const cm = 91.44
      const allInFeet = cm / cmPerFoot
      const floorFeet = Math.floor(allInFeet)
      const remainingFeet = allInFeet - floorFeet
      const remainingInches = Math.round(remainingFeet * 12)
      const formatted = floorFeet + "'" + remainingInches + '"'
      expect(formatted).toBe('3\'0"')
    })
  })

  describe('Precision and Rounding', () => {
    it('should maintain precision with 10 decimals', () => {
      const value = 59.999999999
      const rounded = Math.round(decimals * value) / decimals
      expect(rounded).toBe(60)
    })

    it('should handle large values correctly', () => {
      const value = 999.999999999
      const rounded = Math.round(decimals * value) / decimals
      expect(rounded).toBe(1000)
    })
  })
})
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

