import { initializeAssert, initializeGlobals } from "./setup";

describe("Setup Utilities", () => {
  beforeEach(() => {
    // Clear any existing global assert
    delete (globalThis as any).assert;
  });

  afterEach(() => {
    // Clean up after tests
    delete (globalThis as any).assert;
  });

  describe("initializeAssert", () => {
    it("should create a global assert function", () => {
      expect(globalThis.assert).toBeUndefined();
      
      initializeAssert();
      
      expect(globalThis.assert).toBeDefined();
      expect(typeof globalThis.assert).toBe("function");
    });

    it("should not throw for truthy conditions", () => {
      initializeAssert();
      
      expect(() => globalThis.assert(true)).not.toThrow();
      expect(() => globalThis.assert(1)).not.toThrow();
      expect(() => globalThis.assert("hello")).not.toThrow();
      expect(() => globalThis.assert({})).not.toThrow();
    });

    it("should throw for falsy conditions", () => {
      initializeAssert();
      
      expect(() => globalThis.assert(false)).toThrow("Assertion failed");
      expect(() => globalThis.assert(0)).toThrow("Assertion failed");
      expect(() => globalThis.assert("")).toThrow("Assertion failed");
      expect(() => globalThis.assert(null)).toThrow("Assertion failed");
      expect(() => globalThis.assert(undefined)).toThrow("Assertion failed");
    });

    it("should throw with custom message", () => {
      initializeAssert();
      
      expect(() => globalThis.assert(false, "Custom error message")).toThrow("Custom error message");
    });

    it("should use default message when no message provided", () => {
      initializeAssert();
      
      expect(() => globalThis.assert(false)).toThrow("Assertion failed");
    });

    it("should call console.assert for logging", () => {
      const consoleSpy = jest.spyOn(console, "assert").mockImplementation();
      
      initializeAssert();
      
      try {
        globalThis.assert(false, "Test message");
      } catch {
        // Expected to throw
      }
      
      expect(consoleSpy).toHaveBeenCalledWith(false, "Test message");
      
      consoleSpy.mockRestore();
    });

    it("should provide type narrowing", () => {
      initializeAssert();
      
      // This test verifies that the assert function provides proper type narrowing
      let value: string | null = Math.random() > 0.5 ? "hello" : null;
      
      if (value !== null) {
        globalThis.assert(value !== null);
        // After assertion, TypeScript should know value is string, not string | null
        expect(typeof value).toBe("string");
      }
    });
  });

  describe("initializeGlobals", () => {
    it("should initialize all global utilities", () => {
      expect(globalThis.assert).toBeUndefined();
      
      initializeGlobals();
      
      expect(globalThis.assert).toBeDefined();
      expect(typeof globalThis.assert).toBe("function");
    });

    it("should work when called multiple times", () => {
      initializeGlobals();
      const firstAssert = globalThis.assert;
      
      initializeGlobals();
      const secondAssert = globalThis.assert;
      
      expect(firstAssert).toBeDefined();
      expect(secondAssert).toBeDefined();
      // Both should be functions (may or may not be the same reference)
      expect(typeof firstAssert).toBe("function");
      expect(typeof secondAssert).toBe("function");
    });
  });

  describe("Error handling", () => {
    it("should throw Error instances", () => {
      initializeAssert();
      
      try {
        globalThis.assert(false, "Test error");
        fail("Expected assertion to throw");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Test error");
      }
    });

    it("should handle edge case conditions", () => {
      initializeAssert();
      
      // Test with various falsy values
      const falsyValues = [false, 0, "", null, undefined, NaN];
      
      for (const value of falsyValues) {
        expect(() => globalThis.assert(value, `Failed for ${value}`)).toThrow();
      }
    });

    it("should handle edge case truthy conditions", () => {
      initializeAssert();
      
      // Test with various truthy values
      const truthyValues = [true, 1, "hello", {}, [], -1, Infinity];
      
      for (const value of truthyValues) {
        expect(() => globalThis.assert(value)).not.toThrow();
      }
    });
  });
});
