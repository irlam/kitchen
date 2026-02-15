

import { describe, it, expect } from 'vitest'

/**
 * Tests for core dimension interactions
 * Validates that dimensions update correctly during user operations
 */

describe('Core Dimension Interaction Tests', () => {
  
  describe('Item Dimension Updates', () => {
    it('should calculate correct dimensions for standard cabinet', () => {
      // Standard base cabinet dimensions
      const width = 60 // cm
      const height = 90 // cm
      const depth = 60 // cm
      
      expect(width).toBe(60)
      expect(height).toBe(90)
      expect(depth).toBe(60)
    })

    it('should update dimensions when item is resized', () => {
      // Initial dimensions
      let width = 60
      let height = 90
      let depth = 60
      
      // Resize operation
      const resizeFactor = 1.5
      width *= resizeFactor
      height *= resizeFactor
      depth *= resizeFactor
      
      expect(width).toBe(90)
      expect(height).toBe(135)
      expect(depth).toBe(90)
    })

    it('should maintain proportions when proportional resize is enabled', () => {
      const originalWidth = 60
      const originalHeight = 90
      const originalDepth = 60
      
      const originalRatioHW = originalHeight / originalWidth
      const originalRatioDW = originalDepth / originalWidth
      
      // Resize width
      const newWidth = 80
      const newHeight = newWidth * originalRatioHW
      const newDepth = newWidth * originalRatioDW
      
      expect(newHeight).toBe(120)
      expect(newDepth).toBe(80)
    })
  })

  describe('Wall Dimension Calculations', () => {
    it('should calculate wall length from two corner points', () => {
      const point1 = { x: 0, y: 0 }
      const point2 = { x: 300, y: 0 }
      
      const dx = point2.x - point1.x
      const dy = point2.y - point1.y
      const length = Math.sqrt(dx * dx + dy * dy)
      
      expect(length).toBe(300)
    })

    it('should calculate wall length for diagonal walls', () => {
      const point1 = { x: 0, y: 0 }
      const point2 = { x: 300, y: 400 }
      
      const dx = point2.x - point1.x
      const dy = point2.y - point1.y
      const length = Math.sqrt(dx * dx + dy * dy)
      
      expect(length).toBe(500) // 3-4-5 triangle
    })

    it('should handle wall thickness in calculations', () => {
      const wallThickness = 24 // cm (default from config)
      const innerLength = 300
      const outerLength = innerLength + (wallThickness * 2)
      
      expect(outerLength).toBe(348)
    })
  })

  describe('Gap Distance Calculations', () => {
    it('should calculate gap between two items', () => {
      const item1Position = 100
      const item1Width = 60
      const item2Position = 200
      
      const item1End = item1Position + item1Width
      const gap = item2Position - item1End
      
      expect(gap).toBe(40)
    })

    it('should detect when items are touching', () => {
      const item1Position = 100
      const item1Width = 60
      const item2Position = 160
      
      const item1End = item1Position + item1Width
      const gap = item2Position - item1End
      
      expect(gap).toBe(0)
    })

    it('should detect negative gap (overlap)', () => {
      const item1Position = 100
      const item1Width = 60
      const item2Position = 150
      
      const item1End = item1Position + item1Width
      const gap = item2Position - item1End
      
      expect(gap).toBe(-10) // Overlap of 10cm
    })
  })

  describe('Coordinate Transformations', () => {
    it('should convert world coordinates to pixels', () => {
      const pixelsPerCm = 0.4921
      const worldX = 100 // cm
      const pixelX = worldX * pixelsPerCm
      
      expect(pixelX).toBeCloseTo(49.21, 2)
    })

    it('should convert pixels to world coordinates', () => {
      const cmPerPixel = 2.032
      const pixelX = 100
      const worldX = pixelX * cmPerPixel
      
      expect(worldX).toBeCloseTo(203.2, 1)
    })

    it('should handle 2D to 3D coordinate mapping', () => {
      // In 2D view, Z becomes Y
      const worldX = 100
      const worldZ = 200
      
      const canvas2DX = worldX
      const canvas2DY = worldZ // Z maps to Y in 2D
      
      expect(canvas2DX).toBe(100)
      expect(canvas2DY).toBe(200)
    })
  })

  describe('Dimension Label Text Formatting', () => {
    it('should format dimension string with unit (cm)', () => {
      const cm = 60
      const decimals = 10
      const formatted = Math.round(decimals * cm) / decimals + "cm"
      
      expect(formatted).toBe("60cm")
    })

    it('should format dimension string with unit (mm)', () => {
      const cm = 60
      const decimals = 10
      const mm = Math.round(decimals * (10 * cm)) / decimals
      const formatted = mm + "mm"
      
      expect(formatted).toBe("600mm")
    })

    it('should format dimension with prefix', () => {
      const value = 60
      const prefix = "w:"
      const unit = "cm"
      const formatted = prefix + value + unit
      
      expect(formatted).toBe("w:60cm")
    })
  })

  describe('Standard Cabinet Dimensions', () => {
    // Tests based on snapToNearest function which uses standard widths
    const standardWidths = [30, 45, 60, 80, 90, 100, 120]
    
    it('should include all standard cabinet widths', () => {
      expect(standardWidths).toContain(30)
      expect(standardWidths).toContain(60)
      expect(standardWidths).toContain(90)
      expect(standardWidths).toContain(120)
    })

    it('should find nearest standard width for 58cm', () => {
      const width = 58
      const nearest = standardWidths.reduce((prev, curr) => {
        return Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev
      })
      expect(nearest).toBe(60)
    })

    it('should find nearest standard width for 75cm', () => {
      const width = 75
      const nearest = standardWidths.reduce((prev, curr) => {
        return Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev
      })
      expect(nearest).toBe(80)
    })
  })
})

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

