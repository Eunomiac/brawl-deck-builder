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

  /**
   * Global assert function for runtime assertions and type narrowing
   * Throws an error if the condition is false, otherwise narrows the type
   *
   * @param condition - The condition to assert
   * @param message - Optional error message
   *
   * Example:
   * const value: string | null = getValue();
   * assert(value !== null, "Value must not be null");
   * // TypeScript now knows value is string, not string | null
   */
  function assert(condition: unknown, message?: string): asserts condition;

  /**
   * Assert that a value is defined (not null or undefined)
   * @param value - The value to check
   * @param name - Optional name for better error messages
   */
  function assertDefined<T>(value: T, name?: string): asserts value is NonNullable<T>;

  /**
   * Assert that a value is of a specific type
   * @param value - The value to check
   * @param type - The expected type as a string
   * @param name - Optional name for better error messages
   */
  function assertType<T>(value: unknown, type: string, name?: string): asserts value is T;

  /**
   * Assert that a value is an instance of a specific class
   * @param value - The value to check
   * @param constructor - The constructor function to check against
   * @param name - Optional name for better error messages
   */
  function assertInstanceOf<T>(
    value: unknown,
    constructor: new (...args: unknown[]) => T,
    name?: string
  ): asserts value is T;
}

// This file needs to be a module to work with declare global
export {};
