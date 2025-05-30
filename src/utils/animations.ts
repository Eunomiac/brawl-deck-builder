// MTG Brawl Deck Builder - GSAP Animation Utilities
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

// Register GSAP plugins
gsap.registerPlugin(Draggable);

// Animation duration constants
export const ANIMATION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
  EXTRA_SLOW: 0.8,
} as const;

// Easing presets for consistent animations
export const EASING = {
  SMOOTH: 'power2.out',
  BOUNCE: 'back.out(1.7)',
  ELASTIC: 'elastic.out(1, 0.3)',
  QUICK: 'power1.out',
  CARD_FLIP: 'power2.inOut',
} as const;

// Common animation utilities
export const animations = {
  // Fade animations
  fadeIn: (element: HTMLElement, duration = ANIMATION_DURATION.NORMAL) => {
    return gsap.fromTo(element,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration, ease: EASING.SMOOTH }
    );
  },

  fadeOut: (element: HTMLElement, duration = ANIMATION_DURATION.FAST) => {
    return gsap.to(element, {
      opacity: 0,
      y: -20,
      duration,
      ease: EASING.QUICK,
    });
  },

  // Scale animations for hover effects
  scaleOnHover: (element: HTMLElement) => {
    const tl = gsap.timeline({ paused: true });
    tl.to(element, {
      scale: 1.05,
      duration: ANIMATION_DURATION.FAST,
      ease: EASING.SMOOTH,
    });
    return tl;
  },

  // Card-specific animations
  cardHover: (element: HTMLElement) => {
    return gsap.to(element, {
      y: -8,
      scale: 1.02,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      duration: ANIMATION_DURATION.FAST,
      ease: EASING.SMOOTH,
    });
  },

  cardHoverOut: (element: HTMLElement) => {
    return gsap.to(element, {
      y: 0,
      scale: 1,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.16)',
      duration: ANIMATION_DURATION.FAST,
      ease: EASING.SMOOTH,
    });
  },

  // Slide animations
  slideInFromLeft: (element: HTMLElement, duration = ANIMATION_DURATION.NORMAL) => {
    return gsap.fromTo(element,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration, ease: EASING.SMOOTH }
    );
  },

  slideInFromRight: (element: HTMLElement, duration = ANIMATION_DURATION.NORMAL) => {
    return gsap.fromTo(element,
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, duration, ease: EASING.SMOOTH }
    );
  },

  // Stagger animations for lists
  staggerIn: (elements: HTMLElement[], duration = ANIMATION_DURATION.NORMAL) => {
    return gsap.fromTo(elements,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration,
        ease: EASING.SMOOTH,
        stagger: 0.1
      }
    );
  },

  // Loading spinner
  spin: (element: HTMLElement) => {
    return gsap.to(element, {
      rotation: 360,
      duration: 1,
      ease: 'none',
      repeat: -1,
    });
  },

  // Pulse animation for notifications
  pulse: (element: HTMLElement, intensity = 1.1) => {
    return gsap.to(element, {
      scale: intensity,
      duration: ANIMATION_DURATION.FAST,
      ease: EASING.SMOOTH,
      yoyo: true,
      repeat: 1,
    });
  },

  // Shake animation for errors
  shake: (element: HTMLElement) => {
    return gsap.to(element, {
      keyframes: [
        { x: -10 },
        { x: 10 },
        { x: -8 },
        { x: 8 },
        { x: -6 },
        { x: 6 },
        { x: -4 },
        { x: 4 },
        { x: 0 }
      ],
      duration: ANIMATION_DURATION.SLOW,
      ease: EASING.QUICK,
    });
  },

  // Flip animation for card reveals
  flipCard: (element: HTMLElement, duration = ANIMATION_DURATION.SLOW) => {
    const tl = gsap.timeline();
    tl.to(element, {
      rotationY: 90,
      duration: duration / 2,
      ease: EASING.CARD_FLIP,
    })
    .to(element, {
      rotationY: 0,
      duration: duration / 2,
      ease: EASING.CARD_FLIP,
    });
    return tl;
  },
};

// Draggable utilities for deck building
export const draggableUtils = {
  // Create draggable card
  createDraggableCard: (element: HTMLElement, options: Partial<Draggable.Vars> = {}) => {
    return Draggable.create(element, {
      type: 'x,y',
      bounds: 'body',
      edgeResistance: 0.65,
      inertia: true,
      cursor: 'grab',
      activeCursor: 'grabbing',
      zIndexBoost: false,
      ...options,
    })[0];
  },

  // Create drop zone
  createDropZone: (element: HTMLElement, onDrop?: (draggable: Draggable) => void) => {
    return {
      element,
      onDrop,
      highlight: () => {
        gsap.to(element, {
          backgroundColor: 'rgba(74, 144, 226, 0.2)',
          borderColor: '#4a90e2',
          duration: ANIMATION_DURATION.FAST,
        });
      },
      unhighlight: () => {
        gsap.to(element, {
          backgroundColor: 'transparent',
          borderColor: '#2d2d2d',
          duration: ANIMATION_DURATION.FAST,
        });
      },
    };
  },

  // Snap to grid utility
  snapToGrid: (gridSize = 20) => (value: number) => Math.round(value / gridSize) * gridSize,
};

// Timeline utilities for complex animations
export const timelineUtils = {
  // Create entrance animation for multiple elements
  createEntranceSequence: (elements: HTMLElement[]) => {
    const tl = gsap.timeline();
    elements.forEach((element, index) => {
      tl.fromTo(element,
        { opacity: 0, y: 50, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: ANIMATION_DURATION.NORMAL,
          ease: EASING.BOUNCE,
        },
        index * 0.1
      );
    });
    return tl;
  },

  // Create exit animation sequence
  createExitSequence: (elements: HTMLElement[]) => {
    const tl = gsap.timeline();
    elements.forEach((element, index) => {
      tl.to(element,
        {
          opacity: 0,
          y: -30,
          scale: 0.8,
          duration: ANIMATION_DURATION.FAST,
          ease: EASING.QUICK,
        },
        index * 0.05
      );
    });
    return tl;
  },
};

// Performance utilities
export const performanceUtils = {
  // Optimize for 60fps
  optimizeForPerformance: () => {
    gsap.config({
      force3D: true,
      nullTargetWarn: false,
    });
  },

  // Kill all animations on cleanup
  killAllAnimations: () => {
    gsap.killTweensOf('*');
  },

  // Batch DOM reads/writes
  batchUpdate: (callback: () => void) => {
    gsap.set({}, { onComplete: callback });
  },
};

// Initialize GSAP with optimal settings
export const initializeGSAP = () => {
  performanceUtils.optimizeForPerformance();

  // Set default ease
  gsap.defaults({
    ease: EASING.SMOOTH,
    duration: ANIMATION_DURATION.NORMAL,
  });

  console.log('🎬 GSAP initialized with optimal settings');
};
