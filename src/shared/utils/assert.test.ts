// MTG Brawl Deck Builder - Assert Function Tests
import {
  assert,
  assertDefined,
  assertType,
  assertInstanceOf,
  AssertionError
} from "./assert";

// Test class for instanceof testing
class TestClass {
  constructor(...args: unknown[]) {
    this.value = String(args[0] || "default");
  }
  public value: string;
}

describe("assert function", () => {
  describe("basic assert", () => {
    it("should not throw when condition is truthy", () => {
      expect(() => assert(true)).not.toThrow();
      expect(() => assert(1)).not.toThrow();
      expect(() => assert("hello")).not.toThrow();
      expect(() => assert({})).not.toThrow();
      expect(() => assert([])).not.toThrow();
    });

    it("should throw AssertionError when condition is falsy", () => {
      expect(() => assert(false)).toThrow(AssertionError);
      expect(() => assert(0)).toThrow(AssertionError);
      expect(() => assert("")).toThrow(AssertionError);
      expect(() => assert(null)).toThrow(AssertionError);
      expect(() => assert(undefined)).toThrow(AssertionError);
    });

    it("should use custom error message when provided", () => {
      const customMessage = "Custom assertion failed";
      expect(() => assert(false, customMessage)).toThrow(customMessage);
    });

    it("should use default error message when not provided", () => {
      expect(() => assert(false)).toThrow("Assertion failed");
    });

    it("should narrow types correctly", () => {
      // This test demonstrates type narrowing - it won't fail at runtime
      // but shows how TypeScript understands the types after assertion
      const value: string | null = Math.random() > 0.5 ? "hello" : null;

      if (value !== null) {
        assert(value !== null, "Value should not be null");
        // TypeScript now knows value is string, not string | null
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0); // This wouldn't compile if value could be null
      }
    });
  });

  describe("assertDefined", () => {
    it("should not throw when value is defined", () => {
      expect(() => assertDefined("hello")).not.toThrow();
      expect(() => assertDefined(0)).not.toThrow();
      expect(() => assertDefined(false)).not.toThrow();
      expect(() => assertDefined({})).not.toThrow();
    });

    it("should throw when value is null", () => {
      expect(() => assertDefined(null)).toThrow(AssertionError);
      expect(() => assertDefined(null)).toThrow("Expected to be defined, but got null");
    });

    it("should throw when value is undefined", () => {
      expect(() => assertDefined(undefined)).toThrow(AssertionError);
      expect(() => assertDefined(undefined)).toThrow("Expected to be defined, but got undefined");
    });

    it("should include name in error message when provided", () => {
      expect(() => assertDefined(null, "user")).toThrow('Expected "user" to be defined, but got null');
    });

    it("should handle empty string as name", () => {
      expect(() => assertDefined(null, "")).toThrow('Expected to be defined, but got null');
    });

    it("should handle undefined with name", () => {
      expect(() => assertDefined(undefined, "config")).toThrow('Expected "config" to be defined, but got undefined');
    });

    it("should narrow types correctly", () => {
      const value: string | undefined = Math.random() > 0.5 ? "hello" : undefined;

      if (value !== undefined) {
        assertDefined(value, "test value");
        // TypeScript now knows value is string, not string | undefined
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
      }
    });
  });

  describe("assertType", () => {
    it("should not throw when value is of expected type", () => {
      expect(() => assertType("hello", "string")).not.toThrow();
      expect(() => assertType(42, "number")).not.toThrow();
      expect(() => assertType(true, "boolean")).not.toThrow();
      expect(() => assertType({}, "object")).not.toThrow();
    });

    it("should throw when value is not of expected type", () => {
      expect(() => assertType("hello", "number")).toThrow(AssertionError);
      expect(() => assertType("hello", "number")).toThrow('Expected to be of type "number", but got "string"');
    });

    it("should include name in error message when provided", () => {
      expect(() => assertType("hello", "number", "age")).toThrow(
        'Expected "age" to be of type "number", but got "string"'
      );
    });

    it("should narrow types correctly", () => {
      const value: unknown = "hello world";

      assertType<string>(value, "string", "test value");
      // TypeScript now knows value is string
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
      expect(value.toUpperCase()).toBe("HELLO WORLD");
    });

    it("should handle all primitive types", () => {
      expect(() => assertType("string", "string")).not.toThrow();
      expect(() => assertType(42, "number")).not.toThrow();
      expect(() => assertType(true, "boolean")).not.toThrow();
      expect(() => assertType(undefined, "undefined")).not.toThrow();
      expect(() => assertType(Symbol("test"), "symbol")).not.toThrow();
      expect(() => assertType(BigInt(123), "bigint")).not.toThrow();
      expect(() => assertType(() => {}, "function")).not.toThrow();
    });

    it("should handle edge cases for type checking", () => {
      expect(() => assertType(null, "object")).not.toThrow(); // null is typeof "object"
      expect(() => assertType([], "object")).not.toThrow(); // arrays are typeof "object"
      expect(() => assertType({}, "object")).not.toThrow();
    });
  });

  describe("assertInstanceOf", () => {
    it("should not throw when value is instance of expected class", () => {
      expect(() => assertInstanceOf(new Date(), Date)).not.toThrow();
      expect(() => assertInstanceOf([], Array)).not.toThrow();
      expect(() => assertInstanceOf(new TestClass("test"), TestClass)).not.toThrow();
    });

    it("should throw when value is not instance of expected class", () => {
      expect(() => assertInstanceOf("hello", Date)).toThrow(AssertionError);
      expect(() => assertInstanceOf("hello", Date)).toThrow(
        'Expected to be an instance of Date, but got string'
      );
    });

    it("should include name in error message when provided", () => {
      expect(() => assertInstanceOf("hello", Date, "timestamp")).toThrow(
        'Expected "timestamp" to be an instance of Date, but got string'
      );
    });

    it("should handle constructor without name property", () => {
      // Create a constructor function without a name
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AnonymousConstructor = function(this: any) {};
      Object.defineProperty(AnonymousConstructor, 'name', { value: '' });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => assertInstanceOf("hello", AnonymousConstructor as any, "test")).toThrow(
        'Expected "test" to be an instance of Unknown, but got string'
      );
    });

    it("should handle null and undefined values", () => {
      expect(() => assertInstanceOf(null, Date)).toThrow(
        'Expected to be an instance of Date, but got object'
      );
      expect(() => assertInstanceOf(undefined, Date)).toThrow(
        'Expected to be an instance of Date, but got undefined'
      );
    });

    it("should narrow types correctly", () => {
      const value: unknown = new Date();

      assertInstanceOf(value, Date, "test date");
      // TypeScript now knows value is Date
      expect(value instanceof Date).toBe(true);
      expect(typeof value.getTime).toBe("function");
      expect(value.getFullYear()).toBeGreaterThan(2000);
    });
  });

  describe("AssertionError", () => {
    it("should be an instance of Error", () => {
      const error = new AssertionError("test message");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AssertionError);
    });

    it("should have correct name property", () => {
      const error = new AssertionError("test message");
      expect(error.name).toBe("AssertionError");
    });

    it("should preserve the message", () => {
      const message = "Custom error message";
      const error = new AssertionError(message);
      expect(error.message).toBe(message);
    });

    it("should have a stack trace", () => {
      const error = new AssertionError("test message");
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
    });

    it("should handle Error.captureStackTrace when available", () => {
      // Mock Error.captureStackTrace to test the conditional path
      const originalCaptureStackTrace = Error.captureStackTrace;
      const mockCaptureStackTrace = jest.fn();
      Error.captureStackTrace = mockCaptureStackTrace;

      const error = new AssertionError("test message");
      expect(mockCaptureStackTrace).toHaveBeenCalledWith(error, AssertionError);

      // Restore original
      Error.captureStackTrace = originalCaptureStackTrace;
    });

    it("should work when Error.captureStackTrace is not available", () => {
      // Mock Error.captureStackTrace as undefined to test the other path
      const originalCaptureStackTrace = Error.captureStackTrace;
      // @ts-expect-error - Intentionally setting to undefined for testing
      Error.captureStackTrace = undefined;

      expect(() => new AssertionError("test message")).not.toThrow();

      // Restore original
      Error.captureStackTrace = originalCaptureStackTrace;
    });
  });
});
