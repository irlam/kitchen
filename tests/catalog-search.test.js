import { describe, it, expect } from 'vitest';

describe('Catalog Search and Filter', () => {
  describe('Search Filtering', () => {
    const mockItems = [
      { name: 'Base Cabinet 600', type: '1', category: 'floor' },
      { name: 'Wall Cabinet 800', type: '2', category: 'wall' },
      { name: 'Single Door', type: '3', category: 'in-wall' },
      { name: 'Double Door', type: '3', category: 'in-wall' },
      { name: 'Office Chair', type: '1', category: 'floor' },
      { name: 'Dining Table', type: '1', category: 'floor' }
    ];

    const filterByName = (items, query) => {
      if (!query || query.trim() === '') {
        return items;
      }
      const lowerQuery = query.toLowerCase();
      return items.filter(item => 
        item.name.toLowerCase().includes(lowerQuery)
      );
    };

    it('filters items by exact name match', () => {
      const result = filterByName(mockItems, 'Office Chair');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Office Chair');
    });

    it('filters items by partial name match', () => {
      const result = filterByName(mockItems, 'Cabinet');
      expect(result).toHaveLength(2);
      expect(result.every(item => item.name.includes('Cabinet'))).toBe(true);
    });

    it('filters items case-insensitively', () => {
      const result = filterByName(mockItems, 'DOOR');
      expect(result).toHaveLength(2);
      expect(result.every(item => item.name.toLowerCase().includes('door'))).toBe(true);
    });

    it('returns all items when query is empty', () => {
      const result = filterByName(mockItems, '');
      expect(result).toHaveLength(mockItems.length);
    });

    it('returns all items when query is whitespace', () => {
      const result = filterByName(mockItems, '   ');
      expect(result).toHaveLength(mockItems.length);
    });

    it('returns empty array when no matches found', () => {
      const result = filterByName(mockItems, 'NonExistent');
      expect(result).toHaveLength(0);
    });

    it('handles special characters in search', () => {
      const itemsWithSpecial = [
        { name: 'Cabinet (600mm)', type: '1' },
        { name: 'Door-Frame', type: '2' }
      ];
      const result1 = filterByName(itemsWithSpecial, '(600');
      expect(result1).toHaveLength(1);
      
      const result2 = filterByName(itemsWithSpecial, 'Door-');
      expect(result2).toHaveLength(1);
    });

    it('handles numeric search', () => {
      const result = filterByName(mockItems, '600');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Base Cabinet 600');
    });
  });

  describe('Category/Type Filtering', () => {
    const mockItems = [
      { name: 'Item 1', type: '1', category: 'floor' },
      { name: 'Item 2', type: '1', category: 'floor' },
      { name: 'Item 3', type: '2', category: 'wall' },
      { name: 'Item 4', type: '2', category: 'wall' },
      { name: 'Item 5', type: '3', category: 'in-wall' }
    ];

    const filterByType = (items, type) => {
      if (!type || type === 'all') {
        return items;
      }
      return items.filter(item => item.type === type);
    };

    it('filters floor items (type 1)', () => {
      const result = filterByType(mockItems, '1');
      expect(result).toHaveLength(2);
      expect(result.every(item => item.type === '1')).toBe(true);
    });

    it('filters wall items (type 2)', () => {
      const result = filterByType(mockItems, '2');
      expect(result).toHaveLength(2);
      expect(result.every(item => item.type === '2')).toBe(true);
    });

    it('filters in-wall items (type 3)', () => {
      const result = filterByType(mockItems, '3');
      expect(result).toHaveLength(1);
      expect(result.every(item => item.type === '3')).toBe(true);
    });

    it('shows all items when type is "all"', () => {
      const result = filterByType(mockItems, 'all');
      expect(result).toHaveLength(mockItems.length);
    });

    it('shows all items when type is null', () => {
      const result = filterByType(mockItems, null);
      expect(result).toHaveLength(mockItems.length);
    });
  });

  describe('Combined Search and Category Filter', () => {
    const mockItems = [
      { name: 'Base Cabinet 600', type: '1', category: 'floor' },
      { name: 'Base Cabinet 800', type: '1', category: 'floor' },
      { name: 'Wall Cabinet 600', type: '2', category: 'wall' },
      { name: 'Wall Cabinet 800', type: '2', category: 'wall' },
      { name: 'Single Door', type: '3', category: 'in-wall' },
      { name: 'Office Chair', type: '1', category: 'floor' }
    ];

    const filterItems = (items, nameQuery, typeFilter) => {
      let filtered = items;
      
      // Apply name filter
      if (nameQuery && nameQuery.trim() !== '') {
        const lowerQuery = nameQuery.toLowerCase();
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(lowerQuery)
        );
      }
      
      // Apply type filter
      if (typeFilter && typeFilter !== 'all') {
        filtered = filtered.filter(item => item.type === typeFilter);
      }
      
      return filtered;
    };

    it('filters by both name and type', () => {
      const result = filterItems(mockItems, 'Cabinet', '1');
      expect(result).toHaveLength(2);
      expect(result.every(item => 
        item.name.includes('Cabinet') && item.type === '1'
      )).toBe(true);
    });

    it('shows only wall items with "Cabinet" in name', () => {
      const result = filterItems(mockItems, 'Cabinet', '2');
      expect(result).toHaveLength(2);
      expect(result.every(item => item.type === '2')).toBe(true);
    });

    it('returns empty when combined filters match nothing', () => {
      const result = filterItems(mockItems, 'Cabinet', '3');
      expect(result).toHaveLength(0);
    });

    it('applies only type filter when search is empty', () => {
      const result = filterItems(mockItems, '', '1');
      expect(result).toHaveLength(3);
      expect(result.every(item => item.type === '1')).toBe(true);
    });

    it('applies only search filter when type is "all"', () => {
      const result = filterItems(mockItems, '600', 'all');
      expect(result).toHaveLength(2);
      expect(result.every(item => item.name.includes('600'))).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles undefined search query', () => {
      const items = [{ name: 'Test', type: '1' }];
      const filter = (items, query) => {
        if (!query || query.trim() === '') return items;
        return items.filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase())
        );
      };
      expect(() => filter(items, undefined)).not.toThrow();
      expect(filter(items, undefined)).toHaveLength(1);
    });

    it('handles null search query', () => {
      const items = [{ name: 'Test', type: '1' }];
      const filter = (items, query) => {
        if (!query || query.trim() === '') return items;
        return items.filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase())
        );
      };
      expect(() => filter(items, null)).not.toThrow();
      expect(filter(items, null)).toHaveLength(1);
    });

    it('handles empty items array', () => {
      const filter = (items, query) => {
        if (!query || query.trim() === '') return items;
        return items.filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase())
        );
      };
      expect(filter([], 'test')).toHaveLength(0);
    });

    it('handles items without name property gracefully', () => {
      const items = [
        { name: 'Valid Item', type: '1' },
        { type: '2' }  // Missing name
      ];
      const filter = (items, query) => {
        if (!query || query.trim() === '') return items;
        return items.filter(item => 
          item.name && item.name.toLowerCase().includes(query.toLowerCase())
        );
      };
      const result = filter(items, 'Valid');
      expect(result).toHaveLength(1);
    });
  });
});
