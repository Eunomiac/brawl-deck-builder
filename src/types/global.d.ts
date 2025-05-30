// MTG Brawl Deck Builder - Global Type Definitions
// Ambient types available throughout the application

/**
 * Convenience type for optional values
 * Use instead of `T | undefined` for cleaner code
 */
declare global {
  type Maybe<T> = T | undefined;

  /**
   * Override Array.includes() to accept unknown values
   * Allows checking if any value exists in a typed array without pre-validation
   * 
   * Example:
   * const colors = ["red", "blue", "green"];
   * colors.includes(3); // No TypeScript error, returns false
   * colors.includes("red"); // Returns true
   */
  interface Array<T> {
    includes(searchElement: unknown, fromIndex?: number): boolean;
  }

  /**
   * Override ReadonlyArray.includes() for consistency
   */
  interface ReadonlyArray<T> {
    includes(searchElement: unknown, fromIndex?: number): boolean;
  }
}

// This file needs to be a module to work with declare global
export {};
