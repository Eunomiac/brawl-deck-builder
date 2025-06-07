// Shared Utils Barrel Export
// This file exports all utility functions used across features

// Animation Utilities (GSAP-dependent, excluded from unit testing)
export {
  ANIMATION_DURATION,
  EASING,
  animations,
  draggableUtils,
  timelineUtils,
  performanceUtils,
  initializeGSAP
} from './animations';

// Enum Utilities
export { AnimationDirection } from './enums';

// General Utilities (Pure functions, 100% unit tested)
export {
  mathUtils,
  arrayUtils,
  stringUtils,
  objectUtils,
  validationUtils
} from './general';
