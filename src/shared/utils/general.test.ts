// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable react-hooks/rules-of-hooks */

import {
  mathUtils,
  arrayUtils,
  stringUtils,
  objectUtils,
  validationUtils
} from "./general";

describe("General Utilities", () => {
  describe("mathUtils", () => {
    describe("snapToGrid", () => {
      it("should snap values to grid with default size", () => {
        const snapFn = mathUtils.snapToGrid();

        expect(snapFn(0)).toBe(0);
        expect(snapFn(10)).toBe(20);
        expect(snapFn(15)).toBe(20);
        expect(snapFn(25)).toBe(20);
        expect(snapFn(30)).toBe(40);
      });

      it("should snap values to custom grid size", () => {
        const snapFn = mathUtils.snapToGrid(10);

        expect(snapFn(0)).toBe(0);
        expect(snapFn(5)).toBe(10);
        expect(snapFn(7)).toBe(10);
        expect(snapFn(12)).toBe(10);
        expect(snapFn(15)).toBe(20);
      });

      it("should handle negative values", () => {
        const snapFn = mathUtils.snapToGrid(20);

        expect(snapFn(-10)).toBe(-0); // Math.round(-10/20) * 20 = 0 * 20 = -0 (JavaScript quirk)
        expect(snapFn(-15)).toBe(-20); // Math.round(-15/20) * 20 = -1 * 20 = -20
        expect(snapFn(-25)).toBe(-20); // Math.round(-25/20) * 20 = -1 * 20 = -20
      });
    });

    describe("clamp", () => {
      it("should clamp values within range", () => {
        expect(mathUtils.clamp(5, 0, 10)).toBe(5);
        expect(mathUtils.clamp(-5, 0, 10)).toBe(0);
        expect(mathUtils.clamp(15, 0, 10)).toBe(10);
      });

      it("should handle edge cases", () => {
        expect(mathUtils.clamp(0, 0, 10)).toBe(0);
        expect(mathUtils.clamp(10, 0, 10)).toBe(10);
        expect(mathUtils.clamp(5, 5, 5)).toBe(5);
      });
    });

    describe("lerp", () => {
      it("should interpolate between values", () => {
        expect(mathUtils.lerp(0, 10, 0)).toBe(0);
        expect(mathUtils.lerp(0, 10, 1)).toBe(10);
        expect(mathUtils.lerp(0, 10, 0.5)).toBe(5);
        expect(mathUtils.lerp(10, 20, 0.3)).toBe(13);
      });

      it("should handle negative values", () => {
        expect(mathUtils.lerp(-10, 10, 0.5)).toBe(0);
        expect(mathUtils.lerp(0, -10, 0.5)).toBe(-5);
      });
    });

    describe("mapRange", () => {
      it("should map values between ranges", () => {
        expect(mathUtils.mapRange(5, 0, 10, 0, 100)).toBe(50);
        expect(mathUtils.mapRange(0, 0, 10, 0, 100)).toBe(0);
        expect(mathUtils.mapRange(10, 0, 10, 0, 100)).toBe(100);
      });

      it("should handle different ranges", () => {
        expect(mathUtils.mapRange(2, 0, 4, 10, 20)).toBe(15);
        expect(mathUtils.mapRange(-5, -10, 0, 0, 100)).toBe(50);
      });
    });

    describe("roundTo", () => {
      it("should round to specified decimal places", () => {
        expect(mathUtils.roundTo(3.14159)).toBe(3.14);
        expect(mathUtils.roundTo(3.14159, 3)).toBe(3.142);
        expect(mathUtils.roundTo(3.14159, 0)).toBe(3);
      });

      it("should handle edge cases", () => {
        expect(mathUtils.roundTo(0)).toBe(0);
        expect(mathUtils.roundTo(1.999, 2)).toBe(2);
        expect(mathUtils.roundTo(-3.14159, 2)).toBe(-3.14);
      });
    });
  });

  describe("arrayUtils", () => {
    describe("shuffle", () => {
      it("should return array with same length", () => {
        const original = [1, 2, 3, 4, 5];
        const shuffled = arrayUtils.shuffle(original);

        expect(shuffled).toHaveLength(original.length);
        expect(shuffled).not.toBe(original); // Should be new array
      });

      it("should contain all original elements", () => {
        const original = [1, 2, 3, 4, 5];
        const shuffled = arrayUtils.shuffle(original);

        original.forEach(item => {
          expect(shuffled).toContain(item);
        });
      });

      it("should handle empty array", () => {
        expect(arrayUtils.shuffle([])).toEqual([]);
      });

      it("should handle single element", () => {
        expect(arrayUtils.shuffle([1])).toEqual([1]);
      });
    });

    describe("randomElement", () => {
      it("should return element from array", () => {
        const array = [1, 2, 3, 4, 5];
        const element = arrayUtils.randomElement(array);

        expect(array).toContain(element);
      });

      it("should return undefined for empty array", () => {
        expect(arrayUtils.randomElement([])).toBeUndefined();
      });

      it("should return single element for single-item array", () => {
        expect(arrayUtils.randomElement([42])).toBe(42);
      });
    });

    describe("unique", () => {
      it("should remove duplicates from primitive array", () => {
        const result = arrayUtils.unique([1, 2, 2, 3, 3, 3]);
        expect(result).toEqual([1, 2, 3]);
      });

      it("should remove duplicates using key function", () => {
        const objects = [
          { id: 1, name: "A" },
          { id: 2, name: "B" },
          { id: 1, name: "C" }
        ];

        const result = arrayUtils.unique(objects, obj => obj.id);
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe(1);
        expect(result[1].id).toBe(2);
      });

      it("should handle empty array", () => {
        expect(arrayUtils.unique([])).toEqual([]);
      });
    });

    describe("chunk", () => {
      it("should split array into chunks", () => {
        const result = arrayUtils.chunk([1, 2, 3, 4, 5, 6], 2);
        expect(result).toEqual([[1, 2], [3, 4], [5, 6]]);
      });

      it("should handle remainder", () => {
        const result = arrayUtils.chunk([1, 2, 3, 4, 5], 2);
        expect(result).toEqual([[1, 2], [3, 4], [5]]);
      });

      it("should handle empty array", () => {
        expect(arrayUtils.chunk([], 2)).toEqual([]);
      });

      it("should handle chunk size larger than array", () => {
        const result = arrayUtils.chunk([1, 2], 5);
        expect(result).toEqual([[1, 2]]);
      });
    });
  });

  describe("stringUtils", () => {
    describe("capitalize", () => {
      it("should capitalize first letter", () => {
        expect(stringUtils.capitalize("hello")).toBe("Hello");
        expect(stringUtils.capitalize("HELLO")).toBe("Hello");
        expect(stringUtils.capitalize("hELLO")).toBe("Hello");
      });

      it("should handle edge cases", () => {
        expect(stringUtils.capitalize("")).toBe("");
        expect(stringUtils.capitalize("a")).toBe("A");
        expect(stringUtils.capitalize("A")).toBe("A");
      });
    });

    describe("toKebabCase", () => {
      it("should convert camelCase to kebab-case", () => {
        expect(stringUtils.toKebabCase("camelCase")).toBe("camel-case");
        expect(stringUtils.toKebabCase("PascalCase")).toBe("pascal-case");
      });

      it("should handle spaces and underscores", () => {
        expect(stringUtils.toKebabCase("hello world")).toBe("hello-world");
        expect(stringUtils.toKebabCase("hello_world")).toBe("hello-world");
        expect(stringUtils.toKebabCase("hello   world")).toBe("hello-world");
      });

      it("should handle already kebab-case", () => {
        expect(stringUtils.toKebabCase("already-kebab")).toBe("already-kebab");
      });
    });

    describe("toCamelCase", () => {
      it("should convert kebab-case to camelCase", () => {
        expect(stringUtils.toCamelCase("kebab-case")).toBe("kebabCase");
        expect(stringUtils.toCamelCase("hello-world")).toBe("helloWorld");
      });

      it("should handle spaces and underscores", () => {
        expect(stringUtils.toCamelCase("hello world")).toBe("helloWorld");
        expect(stringUtils.toCamelCase("hello_world")).toBe("helloWorld");
      });

      it("should handle PascalCase input", () => {
        expect(stringUtils.toCamelCase("PascalCase")).toBe("pascalCase");
      });
    });

    describe("truncate", () => {
      it("should truncate long strings", () => {
        expect(stringUtils.truncate("Hello World", 5)).toBe("He...");
        expect(stringUtils.truncate("Hello World", 8)).toBe("Hello...");
      });

      it("should not truncate short strings", () => {
        expect(stringUtils.truncate("Hello", 10)).toBe("Hello");
        expect(stringUtils.truncate("Hello", 5)).toBe("Hello");
      });

      it("should use custom suffix", () => {
        expect(stringUtils.truncate("Hello World", 5, "***")).toBe("He***");
      });
    });
  });

  describe("objectUtils", () => {
    describe("deepClone", () => {
      it("should clone primitive values", () => {
        expect(objectUtils.deepClone(42)).toBe(42);
        expect(objectUtils.deepClone("hello")).toBe("hello");
        expect(objectUtils.deepClone(null)).toBe(null);
      });

      it("should clone arrays", () => {
        const original = [1, 2, [3, 4]];
        const cloned = objectUtils.deepClone(original);

        expect(cloned).toEqual(original);
        expect(cloned).not.toBe(original);
        expect(cloned[2]).not.toBe(original[2]);
      });

      it("should clone objects", () => {
        const original = { a: 1, b: { c: 2 } };
        const cloned = objectUtils.deepClone(original);

        expect(cloned).toEqual(original);
        expect(cloned).not.toBe(original);
        expect(cloned.b).not.toBe(original.b);
      });

      it("should clone dates", () => {
        const original = new Date("2023-01-01");
        const cloned = objectUtils.deepClone(original);

        expect(cloned).toEqual(original);
        expect(cloned).not.toBe(original);
      });
    });

    describe("isEmpty", () => {
      it("should detect empty objects", () => {
        expect(objectUtils.isEmpty({})).toBe(true);
        expect(objectUtils.isEmpty({ a: 1 })).toBe(false);
      });
    });

    describe("pick", () => {
      it("should pick specified properties", () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = objectUtils.pick(obj, ["a", "c"]);

        expect(result).toEqual({ a: 1, c: 3 });
      });

      it("should handle missing properties", () => {
        const obj = { a: 1, b: 2 };
        const result = objectUtils.pick(obj, ["a", "c"] as any);

        expect(result).toEqual({ a: 1 });
      });
    });

    describe("omit", () => {
      it("should omit specified properties", () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = objectUtils.omit(obj, ["b"]);

        expect(result).toEqual({ a: 1, c: 3 });
      });
    });
  });

  describe("validationUtils", () => {
    describe("isValidEmail", () => {
      it("should validate correct emails", () => {
        expect(validationUtils.isValidEmail("test@example.com")).toBe(true);
        expect(validationUtils.isValidEmail("user.name@domain.co.uk")).toBe(true);
      });

      it("should reject invalid emails", () => {
        expect(validationUtils.isValidEmail("invalid")).toBe(false);
        expect(validationUtils.isValidEmail("@example.com")).toBe(false);
        expect(validationUtils.isValidEmail("test@")).toBe(false);
      });
    });

    describe("isValidUrl", () => {
      it("should validate correct URLs", () => {
        expect(validationUtils.isValidUrl("https://example.com")).toBe(true);
        expect(validationUtils.isValidUrl("http://localhost:3000")).toBe(true);
      });

      it("should reject invalid URLs", () => {
        expect(validationUtils.isValidUrl("invalid")).toBe(false);
        expect(validationUtils.isValidUrl("not-a-url")).toBe(false);
        expect(validationUtils.isValidUrl("://missing-protocol")).toBe(false);
      });
    });

    describe("isNotEmpty", () => {
      it("should detect non-empty strings", () => {
        expect(validationUtils.isNotEmpty("hello")).toBe(true);
        expect(validationUtils.isNotEmpty(" hello ")).toBe(true);
      });

      it("should detect empty strings", () => {
        expect(validationUtils.isNotEmpty("")).toBe(false);
        expect(validationUtils.isNotEmpty("   ")).toBe(false);
      });
    });
  });
});
