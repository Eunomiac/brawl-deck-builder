// MTG Brawl Deck Builder - Assert Utility
// Runtime assertion function with TypeScript type narrowing

/**
 * Runtime assertion function that throws an error if condition is false
 * and narrows TypeScript types when the assertion passes.
 * 
 * This function acts as both a runtime check and a TypeScript type guard,
 * allowing you to assert conditions and have TypeScript understand the
 * type implications of those assertions.
 * 
 * @param condition - The condition to assert (must be truthy)
 * @param message - Optional error message to display if assertion fails
 * @throws {AssertionError} When condition is falsy
 * 
 * @example
 * // Basic usage
 * const value: string | null = getValue();
 * assert(value !== null, "Value must not be null");
 * // TypeScript now knows value is string, not string | null
 * 
 * @example
 * // Type narrowing with objects
 * const user: { name?: string } = getUser();
 * assert(user.name, "User must have a name");
 * // TypeScript now knows user.name is string, not string | undefined
 * 
 * @example
 * // Array type narrowing
 * const items: unknown[] = getItems();
 * assert(items.length > 0, "Items array must not be empty");
 * assert(typeof items[0] === "string", "First item must be a string");
 * // TypeScript now knows items[0] is string
 */
export function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new AssertionError(message || "Assertion failed");
  }
}

/**
 * Custom error class for assertion failures
 * Extends the standard Error class with additional context
 */
export class AssertionError extends Error {
  public readonly name = "AssertionError";
  
  constructor(message: string) {
    super(message);
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssertionError);
    }
  }
}

/**
 * Utility function to assert that a value is defined (not null or undefined)
 * Provides better error messages for common null/undefined checks
 * 
 * @param value - The value to check
 * @param name - Optional name of the value for better error messages
 * @throws {AssertionError} When value is null or undefined
 * 
 * @example
 * const element = document.getElementById("my-element");
 * assertDefined(element, "my-element");
 * // TypeScript now knows element is HTMLElement, not HTMLElement | null
 */
export function assertDefined<T>(
  value: T,
  name?: string
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    const valueName = name ? ` "${name}"` : "";
    throw new AssertionError(`Expected${valueName} to be defined, but got ${value}`);
  }
}

/**
 * Utility function to assert that a value is of a specific type
 * Useful for runtime type checking with TypeScript type narrowing
 * 
 * @param value - The value to check
 * @param type - The expected type as a string
 * @param name - Optional name of the value for better error messages
 * @throws {AssertionError} When value is not of the expected type
 * 
 * @example
 * const input: unknown = getUserInput();
 * assertType(input, "string", "user input");
 * // TypeScript now knows input is string
 */
export function assertType<T>(
  value: unknown,
  type: string,
  name?: string
): asserts value is T {
  if (typeof value !== type) {
    const valueName = name ? ` "${name}"` : "";
    throw new AssertionError(
      `Expected${valueName} to be of type "${type}", but got "${typeof value}"`
    );
  }
}

/**
 * Utility function to assert that a value is an instance of a specific class
 * Useful for runtime instanceof checks with TypeScript type narrowing
 * 
 * @param value - The value to check
 * @param constructor - The constructor function to check against
 * @param name - Optional name of the value for better error messages
 * @throws {AssertionError} When value is not an instance of the constructor
 * 
 * @example
 * const element: Element | null = document.querySelector(".my-class");
 * assertInstanceOf(element, HTMLElement, "selected element");
 * // TypeScript now knows element is HTMLElement
 */
export function assertInstanceOf<T>(
  value: unknown,
  constructor: new (...args: unknown[]) => T,
  name?: string
): asserts value is T {
  if (!(value instanceof constructor)) {
    const valueName = name ? ` "${name}"` : "";
    const constructorName = constructor.name || "Unknown";
    throw new AssertionError(
      `Expected${valueName} to be an instance of ${constructorName}, but got ${typeof value}`
    );
  }
}
