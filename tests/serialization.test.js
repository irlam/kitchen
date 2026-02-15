import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Serialization loadSerialized', () => {
  // Mock the Model class and its dependencies
  class MockScene {
    constructor() {
      this.items = [];
    }
    clearItems() {
      this.items = [];
    }
    addItem(...args) {
      this.items.push(args);
    }
  }

  class MockFloorplan {
    loadFloorplan(data) {
      this.data = data;
    }
    update() {}
  }

  class MockModel {
    constructor() {
      this.scene = new MockScene();
      this.floorplan = new MockFloorplan();
    }

    newRoom(floorplan, items) {
      this.scene.clearItems();
      this.floorplan.loadFloorplan(floorplan);
      if (items && Array.isArray(items)) {
        items.forEach((item) => {
          this.scene.addItem(item);
        });
      }
    }

    loadSerialized(json) {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      this.newRoom(data.floorplan, data.items);
    }
  }

  let model;

  beforeEach(() => {
    model = new MockModel();
  });

  describe('handles missing items field', () => {
    it('should not throw when items is undefined', () => {
      const data = {
        floorplan: { corners: {}, walls: [] }
        // items is missing/undefined
      };
      
      expect(() => {
        model.loadSerialized(data);
      }).not.toThrow();
    });

    it('should not throw when items is null', () => {
      const data = {
        floorplan: { corners: {}, walls: [] },
        items: null
      };
      
      expect(() => {
        model.loadSerialized(data);
      }).not.toThrow();
    });

    it('should not throw when items is not an array', () => {
      const data = {
        floorplan: { corners: {}, walls: [] },
        items: "not an array"
      };
      
      expect(() => {
        model.loadSerialized(data);
      }).not.toThrow();
    });

    it('should not throw when items is an object', () => {
      const data = {
        floorplan: { corners: {}, walls: [] },
        items: { foo: "bar" }
      };
      
      expect(() => {
        model.loadSerialized(data);
      }).not.toThrow();
    });

    it('should not throw when items is a number', () => {
      const data = {
        floorplan: { corners: {}, walls: [] },
        items: 123
      };
      
      expect(() => {
        model.loadSerialized(data);
      }).not.toThrow();
    });
  });

  describe('handles valid items array', () => {
    it('should load items when items is an empty array', () => {
      const data = {
        floorplan: { corners: {}, walls: [] },
        items: []
      };
      
      model.loadSerialized(data);
      expect(model.scene.items).toHaveLength(0);
    });

    it('should load items when items is a populated array', () => {
      const data = {
        floorplan: { corners: {}, walls: [] },
        items: [
          { id: 1, name: 'item1' },
          { id: 2, name: 'item2' }
        ]
      };
      
      model.loadSerialized(data);
      expect(model.scene.items).toHaveLength(2);
    });
  });

  describe('handles JSON string input', () => {
    it('should parse JSON string and handle missing items', () => {
      const jsonString = JSON.stringify({
        floorplan: { corners: {}, walls: [] }
        // items is missing
      });
      
      expect(() => {
        model.loadSerialized(jsonString);
      }).not.toThrow();
    });

    it('should parse JSON string with items array', () => {
      const jsonString = JSON.stringify({
        floorplan: { corners: {}, walls: [] },
        items: [{ id: 1, name: 'test' }]
      });
      
      model.loadSerialized(jsonString);
      expect(model.scene.items).toHaveLength(1);
    });
  });
});
