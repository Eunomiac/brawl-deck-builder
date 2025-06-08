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

  describe("normalization consistency", () => {
    it("should produce consistent results for the same input", () => {
      const testCases = [
        "A-Lightning Bolt",
        "Lörièn",
        "Fire // Ice",
        "A-Front // A-Back"
      ];

      testCases.forEach(testCase => {
        // Test that normalizeForSearch produces consistent results
        const result1 = CardNameNormalizer.normalizeForSearch(testCase);
        const result2 = CardNameNormalizer.normalizeForSearch(testCase);
        expect(result1).toBe(result2);
      });
    });
  });

  // Note: validateNormalization method would be useful for detecting collisions
  // but is not currently implemented. This would be valuable for import validation.
});
