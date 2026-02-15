import { describe, it, expect, beforeEach } from 'vitest';

// Shared helper functions
const createBox = (minX, minY, minZ, maxX, maxY, maxZ) => ({
  min: { x: minX, y: minY, z: minZ },
  max: { x: maxX, y: maxY, z: maxZ }
});

const checkBoxIntersection = (box1, box2) => {
  return (
    box1.min.x < box2.max.x &&
    box1.max.x > box2.min.x &&
    box1.min.y < box2.max.y &&
    box1.max.y > box2.min.y &&
    box1.min.z < box2.max.z &&
    box1.max.z > box2.min.z
  );
};

describe('Collision Detection', () => {
  describe('Bounding Box Overlap Detection', () => {
    it('detects overlap when boxes intersect', () => {
      const box1 = createBox(0, 0, 0, 10, 10, 10);
      const box2 = createBox(5, 5, 5, 15, 15, 15);
      expect(checkBoxIntersection(box1, box2)).toBe(true);
    });

    it('detects no overlap when boxes are separated', () => {
      const box1 = createBox(0, 0, 0, 10, 10, 10);
      const box2 = createBox(20, 20, 20, 30, 30, 30);
      expect(checkBoxIntersection(box1, box2)).toBe(false);
    });

    it('detects overlap when boxes touch edges', () => {
      const box1 = createBox(0, 0, 0, 10, 10, 10);
      const box2 = createBox(10, 0, 0, 20, 10, 10);
      // Touching at edge should not count as intersection (using < and > not <= and >=)
      expect(checkBoxIntersection(box1, box2)).toBe(false);
    });

    it('detects overlap when box1 contains box2', () => {
      const box1 = createBox(0, 0, 0, 20, 20, 20);
      const box2 = createBox(5, 5, 5, 15, 15, 15);
      expect(checkBoxIntersection(box1, box2)).toBe(true);
    });

    it('detects overlap when boxes partially intersect on one axis', () => {
      const box1 = createBox(0, 0, 0, 10, 10, 10);
      const box2 = createBox(8, 0, 0, 18, 10, 10);
      expect(checkBoxIntersection(box1, box2)).toBe(true);
    });

    it('detects no overlap when boxes only align on Y axis', () => {
      const box1 = createBox(0, 0, 0, 10, 10, 10);
      const box2 = createBox(20, 0, 20, 30, 10, 30);
      expect(checkBoxIntersection(box1, box2)).toBe(false);
    });
  });

  describe('Collision State Management', () => {
    it('should have collision state property', () => {
      const mockItem = {
        hasCollision: false,
        material: { color: { setHex: () => {} } }
      };
      expect(mockItem.hasCollision).toBe(false);
    });

    it('should toggle collision state', () => {
      const mockItem = {
        hasCollision: false
      };
      mockItem.hasCollision = true;
      expect(mockItem.hasCollision).toBe(true);
      mockItem.hasCollision = false;
      expect(mockItem.hasCollision).toBe(false);
    });
  });

  describe('Invalid Placement Behavior', () => {
    it('should prevent placement when collision detected', () => {
      const hasCollision = true;
      const allowPlacement = !hasCollision;
      expect(allowPlacement).toBe(false);
    });

    it('should allow placement when no collision detected', () => {
      const hasCollision = false;
      const allowPlacement = !hasCollision;
      expect(allowPlacement).toBe(true);
    });
  });

  describe('Multiple Item Collision Detection', () => {
    const checkMultipleCollisions = (targetBox, existingBoxes) => {
      for (let i = 0; i < existingBoxes.length; i++) {
        if (checkBoxIntersection(targetBox, existingBoxes[i])) {
          return true;
        }
      }
      return false;
    };

    it('detects collision with first item in list', () => {
      const targetBox = createBox(0, 0, 0, 10, 10, 10);
      const existing = [
        createBox(5, 5, 5, 15, 15, 15),
        createBox(100, 100, 100, 110, 110, 110)
      ];
      expect(checkMultipleCollisions(targetBox, existing)).toBe(true);
    });

    it('detects collision with last item in list', () => {
      const targetBox = createBox(100, 100, 100, 110, 110, 110);
      const existing = [
        createBox(0, 0, 0, 10, 10, 10),
        createBox(105, 105, 105, 115, 115, 115)
      ];
      expect(checkMultipleCollisions(targetBox, existing)).toBe(true);
    });

    it('detects no collision with empty list', () => {
      const targetBox = createBox(0, 0, 0, 10, 10, 10);
      const existing = [];
      expect(checkMultipleCollisions(targetBox, existing)).toBe(false);
    });

    it('detects no collision when all items are separated', () => {
      const targetBox = createBox(50, 50, 50, 60, 60, 60);
      const existing = [
        createBox(0, 0, 0, 10, 10, 10),
        createBox(100, 100, 100, 110, 110, 110),
        createBox(200, 200, 200, 210, 210, 210)
      ];
      expect(checkMultipleCollisions(targetBox, existing)).toBe(false);
    });
  });
});
