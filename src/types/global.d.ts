// MTG Brawl Deck Builder - Global Type Definitions
// Ambient types available throughout the application

import { gsap } from 'gsap';

declare global {

  /**
   * Convenience type for optional values
   * Use instead of `T | undefined` for cleaner code
   */
  type Maybe<T> = T | undefined;

  /**
   * GSAP Animation type alias to reduce union type complexity
   * Use instead of `gsap.core.Timeline | gsap.core.Tween`
   */
  type GSAPAnimation = gsap.core.Timeline | gsap.core.Tween;



  /**
   * Override Array.includes() to accept unknown values
   * Allows checking if any value exists in a typed array without pre-validation
   *
   * Example:
   * const colors = ["red", "blue", "green"];
   * colors.includes(3); // No TypeScript error, returns false
   * colors.includes("red"); // Returns true
   */

  // Generic variable required to merge with existing Array<T> definition
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Array<T> {
    includes(searchElement: unknown, fromIndex?: number): boolean;
  }

  /**
   * Override ReadonlyArray.includes() for consistency
   */

  // Generic variable required to merge with existing ReadonlyArray<T> definition
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ReadonlyArray<T> {
    includes(searchElement: unknown, fromIndex?: number): boolean;
  }
}

// This file needs to be a module to work with declare global
export {};
