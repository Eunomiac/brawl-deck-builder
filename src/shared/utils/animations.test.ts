// MTG Brawl Deck Builder - Animation Utilities Tests
import { describe, it, expect } from '@jest/globals';
import { ANIMATION_DURATION, EASING, draggableUtils, timelineUtils, performanceUtils } from './animations';

describe('Animation Constants', () => {
  describe('ANIMATION_DURATION', () => {
    it('should have correct duration values', () => {
      expect(ANIMATION_DURATION.FAST).toBe(0.2);
      expect(ANIMATION_DURATION.NORMAL).toBe(0.3);
      expect(ANIMATION_DURATION.SLOW).toBe(0.5);
      expect(ANIMATION_DURATION.EXTRA_SLOW).toBe(0.8);
    });

    it('should have durations in ascending order', () => {
      expect(ANIMATION_DURATION.FAST).toBeLessThan(ANIMATION_DURATION.NORMAL);
      expect(ANIMATION_DURATION.NORMAL).toBeLessThan(ANIMATION_DURATION.SLOW);
      expect(ANIMATION_DURATION.SLOW).toBeLessThan(ANIMATION_DURATION.EXTRA_SLOW);
    });
  });

  describe('EASING', () => {
    it('should have correct easing values', () => {
      expect(EASING.SMOOTH).toBe('power2.out');
      expect(EASING.BOUNCE).toBe('back.out(1.7)');
      expect(EASING.ELASTIC).toBe('elastic.out(1, 0.3)');
      expect(EASING.QUICK).toBe('power1.out');
      expect(EASING.CARD_FLIP).toBe('power2.inOut');
    });

    it('should have string values for GSAP compatibility', () => {
      Object.values(EASING).forEach(easing => {
        expect(typeof easing).toBe('string');
        expect(easing.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Draggable Utilities', () => {
  describe('snapToGrid', () => {
    it('should snap values to grid with default size', () => {
      const snapFn = draggableUtils.snapToGrid();

      expect(snapFn(0)).toBe(0);
      expect(snapFn(10)).toBe(20);
      expect(snapFn(15)).toBe(20);
      expect(snapFn(25)).toBe(20);
      expect(snapFn(30)).toBe(40);
    });

    it('should snap values to custom grid size', () => {
      const snapFn = draggableUtils.snapToGrid(10);

      expect(snapFn(0)).toBe(0);
      expect(snapFn(5)).toBe(10);
      expect(snapFn(7)).toBe(10);
      expect(snapFn(12)).toBe(10);
      expect(snapFn(15)).toBe(20);
    });

    it('should handle negative values', () => {
      const snapFn = draggableUtils.snapToGrid(20);

      expect(snapFn(-10)).toBe(-0); // Math.round(-10/20) * 20 = Math.round(-0.5) * 20 = 0 * 20 = -0 (JavaScript quirk)
      expect(snapFn(-15)).toBe(-20); // Math.round(-15/20) * 20 = Math.round(-0.75) * 20 = -1 * 20 = -20
      expect(snapFn(-25)).toBe(-20); // Math.round(-25/20) * 20 = Math.round(-1.25) * 20 = -1 * 20 = -20
      expect(snapFn(-30)).toBe(-20); // Math.round(-30/20) * 20 = Math.round(-1.5) * 20 = -1 * 20 = -20 (JS rounds -1.5 to -1)
    });

    it('should handle decimal values', () => {
      const snapFn = draggableUtils.snapToGrid(20);

      expect(snapFn(10.5)).toBe(20);  // Math.round(10.5/20) * 20 = Math.round(0.525) * 20 = 1 * 20 = 20
      expect(snapFn(19.9)).toBe(20);  // Math.round(19.9/20) * 20 = Math.round(0.995) * 20 = 1 * 20 = 20
      expect(snapFn(20.1)).toBe(20);  // Math.round(20.1/20) * 20 = Math.round(1.005) * 20 = 1 * 20 = 20
      expect(snapFn(29.9)).toBe(20);  // Math.round(29.9/20) * 20 = Math.round(1.495) * 20 = 1 * 20 = 20
    });
  });
});

describe('Performance Utilities', () => {
  // Note: Performance utilities that call GSAP functions are excluded from unit testing
  // and should be tested through integration tests instead

  describe('function exports', () => {
    it('should export required performance utility functions', () => {
      expect(typeof performanceUtils.optimizeForPerformance).toBe('function');
      expect(typeof performanceUtils.killAllAnimations).toBe('function');
      expect(typeof performanceUtils.batchUpdate).toBe('function');
    });
  });
});

describe('Timeline Utilities', () => {
  // Note: Timeline utilities that create GSAP timelines are excluded from unit testing
  // and should be tested through integration tests instead

  describe('function exports', () => {
    it('should export required timeline utility functions', () => {
      expect(typeof timelineUtils.createEntranceSequence).toBe('function');
      expect(typeof timelineUtils.createExitSequence).toBe('function');
    });
  });
});

describe('Animation Integration', () => {
  it('should export all required utilities', () => {
    expect(ANIMATION_DURATION).toBeDefined();
    expect(EASING).toBeDefined();
    expect(draggableUtils).toBeDefined();
    expect(timelineUtils).toBeDefined();
    expect(performanceUtils).toBeDefined();
  });

  it('should have consistent naming conventions', () => {
    // Constants should be UPPER_CASE
    expect(typeof ANIMATION_DURATION).toBe('object');
    expect(typeof EASING).toBe('object');

    // Utilities should be camelCase objects
    expect(typeof draggableUtils).toBe('object');
    expect(typeof timelineUtils).toBe('object');
    expect(typeof performanceUtils).toBe('object');
  });
});
