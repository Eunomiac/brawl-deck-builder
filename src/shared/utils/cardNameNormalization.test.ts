// CardNameNormalizer Tests
import { CardNameNormalizer } from "./cardNameNormalization";

describe("CardNameNormalizer", () => {
  describe("normalizeForDisplay", () => {
    it("should remove A- prefix from card names", () => {
      expect(CardNameNormalizer.normalizeForDisplay("A-Lightning Bolt")).toBe("Lightning Bolt");
      expect(CardNameNormalizer.normalizeForDisplay("A-Counterspell")).toBe("Counterspell");
    });

    it("should normalize special characters", () => {
      expect(CardNameNormalizer.normalizeForDisplay("Lörièn")).toBe("Lorien");
      expect(CardNameNormalizer.normalizeForDisplay("Æther Vial")).toBe("Aether Vial");
      expect(CardNameNormalizer.normalizeForDisplay("Naïve")).toBe("Naive");
    });

    it("should standardize split card separators", () => {
      expect(CardNameNormalizer.normalizeForDisplay("Fire / Ice")).toBe("Fire // Ice");
      expect(CardNameNormalizer.normalizeForDisplay("Fire///Ice")).toBe("Fire // Ice");
      expect(CardNameNormalizer.normalizeForDisplay("Fire // Ice")).toBe("Fire // Ice");
    });

    it("should strip A- prefix from both halves of double-faced cards", () => {
      expect(CardNameNormalizer.normalizeForDisplay("A-Front Name // A-Back Name")).toBe("Front Name // Back Name");
      expect(CardNameNormalizer.normalizeForDisplay("A-Delver of Secrets // A-Insectile Aberration")).toBe("Delver of Secrets // Insectile Aberration");
    });

    it("should handle empty and invalid input", () => {
      expect(CardNameNormalizer.normalizeForDisplay("")).toBe("");
      expect(CardNameNormalizer.normalizeForDisplay("   ")).toBe("");
    });
  });

  describe("normalizeForSearch", () => {
    it("should remove A- prefix from card names", () => {
      expect(CardNameNormalizer.normalizeForSearch("A-Lightning Bolt")).toBe("lightningbolt");
      expect(CardNameNormalizer.normalizeForSearch("A-Counterspell")).toBe("counterspell");
    });

    it("should normalize special characters", () => {
      expect(CardNameNormalizer.normalizeForSearch("Lörièn")).toBe("lorien");
      expect(CardNameNormalizer.normalizeForSearch("Æther Vial")).toBe("aethervial");
      expect(CardNameNormalizer.normalizeForSearch("Naïve")).toBe("naive");
    });

    it("should handle double-faced cards with // separator", () => {
      expect(CardNameNormalizer.normalizeForSearch("Fire // Ice")).toBe("fire // ice");
      expect(CardNameNormalizer.normalizeForSearch("Delver of Secrets // Insectile Aberration")).toBe("delverofsecrets // insectileaberration");
    });

    it("should strip A- prefix from both halves of double-faced cards", () => {
      expect(CardNameNormalizer.normalizeForSearch("A-Front Name // A-Back Name")).toBe("frontname // backname");
      expect(CardNameNormalizer.normalizeForSearch("A-Delver of Secrets // A-Insectile Aberration")).toBe("delverofsecrets // insectileaberration");
    });

    it("should remove all non-alphanumeric characters except protected separators", () => {
      expect(CardNameNormalizer.normalizeForSearch("Ja-Gu'dul, Ghoul-Caster")).toBe("jagudulghoulcaster");
      expect(CardNameNormalizer.normalizeForSearch("Fire // Ice")).toBe("fire // ice");
    });

    it("should handle empty and invalid input", () => {
      expect(CardNameNormalizer.normalizeForSearch("")).toBe("");
      expect(CardNameNormalizer.normalizeForSearch("   ")).toBe("");
    });
  });

  describe("legacy normalize method", () => {
    it("should work the same as normalizeForSearch", () => {
      const testCases = [
        "A-Lightning Bolt",
        "Lörièn",
        "Fire // Ice",
        "A-Front // A-Back"
      ];

      testCases.forEach(testCase => {
        expect(CardNameNormalizer.normalize(testCase)).toBe(CardNameNormalizer.normalizeForSearch(testCase));
      });
    });
  });

  describe("validateNormalization", () => {
    it("should detect potential name collisions", () => {
      const testCases = [
        { original: "Test Card", normalized: "testcard" },
        { original: "Test-Card", normalized: "testcard" }, // Collision!
      ];

      const result = CardNameNormalizer.validateNormalization(testCases);
      expect(result.hasCollisions).toBe(true);
      expect(result.collisions).toHaveLength(1);
      expect(result.collisions[0].normalizedName).toBe("testcard");
      expect(result.collisions[0].originalNames).toEqual(["Test Card", "Test-Card"]);
    });

    it("should handle no collisions", () => {
      const testCases = [
        { original: "Lightning Bolt", normalized: "lightningbolt" },
        { original: "Counterspell", normalized: "counterspell" },
      ];

      const result = CardNameNormalizer.validateNormalization(testCases);
      expect(result.hasCollisions).toBe(false);
      expect(result.collisions).toHaveLength(0);
    });
  });
});
