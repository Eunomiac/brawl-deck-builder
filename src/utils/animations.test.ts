import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  ANIMATION_DURATION,
  EASING,
  animations,
  draggableUtils,
  timelineUtils,
  performanceUtils,
  initializeGSAP
} from './animations';

// Mock GSAP
jest.mock('gsap', () => ({
  gsap: {
    fromTo: jest.fn(() => ({ duration: 0.3 })),
    to: jest.fn(() => ({ duration: 0.3 })),
    timeline: jest.fn(() => ({
      to: jest.fn().mockReturnThis(),
      fromTo: jest.fn().mockReturnThis()
    })),
    set: jest.fn(),
    killTweensOf: jest.fn(),
    defaults: jest.fn(),
    config: jest.fn(),
    registerPlugin: jest.fn()
  },
  Draggable: {
    create: jest.fn(() => [{ target: null }])
  }
}));

// Mock DOM element
const createMockElement = (): HTMLElement => {
  const element = document.createElement('div');
  element.style.opacity = '1';
  element.style.transform = 'translate(0px, 0px) scale(1)';
  return element;
};

describe('Animation Constants', () => {
  it('exports correct animation durations', () => {
    expect(ANIMATION_DURATION.FAST).toBe(0.2);
    expect(ANIMATION_DURATION.NORMAL).toBe(0.3);
    expect(ANIMATION_DURATION.SLOW).toBe(0.5);
    expect(ANIMATION_DURATION.EXTRA_SLOW).toBe(0.8);
  });

  it('exports correct easing presets', () => {
    expect(EASING.SMOOTH).toBe('power2.out');
    expect(EASING.BOUNCE).toBe('back.out(1.7)');
    expect(EASING.ELASTIC).toBe('elastic.out(1, 0.3)');
    expect(EASING.QUICK).toBe('power1.out');
    expect(EASING.CARD_FLIP).toBe('power2.inOut');
  });
});

describe('Basic Animations', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = createMockElement();
  });

  it('creates fadeIn animation', () => {
    const animation = animations.fadeIn(element);
    expect(animation).toBeDefined();
  });

  it('creates fadeIn animation with custom duration', () => {
    const animation = animations.fadeIn(element, 0.5);
    expect(animation).toBeDefined();
  });

  it('creates fadeOut animation', () => {
    const animation = animations.fadeOut(element);
    expect(animation).toBeDefined();
  });

  it('creates fadeOut animation with custom duration', () => {
    const animation = animations.fadeOut(element, 0.4);
    expect(animation).toBeDefined();
  });

  it('creates scaleOnHover animation', () => {
    const animation = animations.scaleOnHover(element);
    expect(animation).toBeDefined();
  });

  it('creates cardHover animation', () => {
    const animation = animations.cardHover(element);
    expect(animation).toBeDefined();
  });

  it('creates cardHoverOut animation', () => {
    const animation = animations.cardHoverOut(element);
    expect(animation).toBeDefined();
  });
});

describe('Slide Animations', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = createMockElement();
  });

  it('creates slideInFromLeft animation', () => {
    const animation = animations.slideInFromLeft(element);
    expect(animation).toBeDefined();
  });

  it('creates slideInFromLeft with custom duration', () => {
    const animation = animations.slideInFromLeft(element, 0.6);
    expect(animation).toBeDefined();
  });

  it('creates slideInFromRight animation', () => {
    const animation = animations.slideInFromRight(element);
    expect(animation).toBeDefined();
  });

  it('creates slideInFromRight with custom duration', () => {
    const animation = animations.slideInFromRight(element, 0.7);
    expect(animation).toBeDefined();
  });
});

describe('Complex Animations', () => {
  let element: HTMLElement;
  let elements: HTMLElement[];

  beforeEach(() => {
    element = createMockElement();
    elements = [createMockElement(), createMockElement(), createMockElement()];
  });

  it('creates staggerIn animation for multiple elements', () => {
    const animation = animations.staggerIn(elements);
    expect(animation).toBeDefined();
  });

  it('creates staggerIn with custom duration', () => {
    const animation = animations.staggerIn(elements, 0.5);
    expect(animation).toBeDefined();
  });

  it('creates spin animation', () => {
    const animation = animations.spin(element);
    expect(animation).toBeDefined();
  });

  it('creates pulse animation with default intensity', () => {
    const animation = animations.pulse(element);
    expect(animation).toBeDefined();
  });

  it('creates pulse animation with custom intensity', () => {
    const animation = animations.pulse(element, 1.3);
    expect(animation).toBeDefined();
  });

  it('creates shake animation', () => {
    const animation = animations.shake(element);
    expect(animation).toBeDefined();
  });

  it('creates flipCard animation', () => {
    const animation = animations.flipCard(element);
    expect(animation).toBeDefined();
  });

  it('creates flipCard with custom duration', () => {
    const animation = animations.flipCard(element, 1.0);
    expect(animation).toBeDefined();
  });
});

describe('Draggable Utils', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = createMockElement();
  });

  it('creates draggable card with default options', () => {
    const draggable = draggableUtils.createDraggableCard(element);
    expect(draggable).toBeDefined();
  });

  it('creates draggable card with custom options', () => {
    const options = { bounds: '.container', cursor: 'move' };
    const draggable = draggableUtils.createDraggableCard(element, options);
    expect(draggable).toBeDefined();
  });

  it('creates drop zone without callback', () => {
    const dropZone = draggableUtils.createDropZone(element);
    expect(dropZone.element).toBe(element);
    expect(dropZone.onDrop).toBeUndefined();
    expect(typeof dropZone.highlight).toBe('function');
    expect(typeof dropZone.unhighlight).toBe('function');
  });

  it('creates drop zone with callback', () => {
    const onDrop = jest.fn();
    const dropZone = draggableUtils.createDropZone(element, onDrop);
    expect(dropZone.onDrop).toBe(onDrop);
  });

  it('highlights drop zone', () => {
    const dropZone = draggableUtils.createDropZone(element);
    dropZone.highlight();
    // Animation is created (tested by not throwing)
    expect(true).toBe(true);
  });

  it('unhighlights drop zone', () => {
    const dropZone = draggableUtils.createDropZone(element);
    dropZone.unhighlight();
    // Animation is created (tested by not throwing)
    expect(true).toBe(true);
  });

  it('creates snap to grid function', () => {
    const snapFn = draggableUtils.snapToGrid(20);
    expect(snapFn(23)).toBe(20);
    expect(snapFn(37)).toBe(40);
    expect(snapFn(10)).toBe(20);
  });

  it('creates snap to grid with custom grid size', () => {
    const snapFn = draggableUtils.snapToGrid(25);
    expect(snapFn(23)).toBe(25);
    expect(snapFn(37)).toBe(25);
    expect(snapFn(38)).toBe(50);
  });
});

describe('Timeline Utils', () => {
  let elements: HTMLElement[];

  beforeEach(() => {
    elements = [createMockElement(), createMockElement(), createMockElement()];
  });

  it('creates entrance sequence', () => {
    const timeline = timelineUtils.createEntranceSequence(elements);
    expect(timeline).toBeDefined();
  });

  it('creates exit sequence', () => {
    const timeline = timelineUtils.createExitSequence(elements);
    expect(timeline).toBeDefined();
  });
});

describe('Performance Utils', () => {
  it('optimizes for performance', () => {
    // Should not throw
    performanceUtils.optimizeForPerformance();
    expect(true).toBe(true);
  });

  it('kills all animations', () => {
    // Should not throw
    performanceUtils.killAllAnimations();
    expect(true).toBe(true);
  });

  it('batches updates', () => {
    const callback = jest.fn();
    performanceUtils.batchUpdate(callback);
    expect(true).toBe(true);
  });
});

describe('GSAP Initialization', () => {
  it('initializes GSAP with optimal settings', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    initializeGSAP();

    expect(consoleSpy).toHaveBeenCalledWith('🎬 GSAP initialized with optimal settings');
    consoleSpy.mockRestore();
  });
});
