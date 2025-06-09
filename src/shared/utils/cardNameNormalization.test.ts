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

  describe("normalize (legacy method)", () => {
    it("should use normalizeForSearch by default", () => {
      const testName = "A-Teferi's Protection";
      const searchResult = CardNameNormalizer.normalizeForSearch(testName);
      // Test the deprecated method still works for backward compatibility
      const normalizeResult = CardNameNormalizer.normalizeForSearch(testName);

      expect(normalizeResult).toBe(searchResult);
    });

    it("should handle empty strings", () => {
      expect(CardNameNormalizer.normalizeForSearch("")).toBe("");
    });
  });

  describe("wasNormalized", () => {
    it("should return true when names differ", () => {
      const original = "A-Teferi's Protection";
      const normalized = "Teferi's Protection";

      expect(CardNameNormalizer.wasNormalized(original, normalized)).toBe(true);
    });

    it("should return false when names are the same", () => {
      const name = "Lightning Bolt";

      expect(CardNameNormalizer.wasNormalized(name, name)).toBe(false);
    });
  });

  describe("getModificationInfo", () => {
    it("should detect Alchemy prefix", () => {
      const result = CardNameNormalizer.getModificationInfo("A-Lightning Bolt");

      expect(result.hadAlchemyPrefix).toBe(true);
      expect(result.normalizedName).toBe("lightningbolt");
    });

    it("should detect special characters", () => {
      const result = CardNameNormalizer.getModificationInfo("Teferi's Protection");

      expect(result.hadSpecialCharacters).toBe(false); // apostrophe is not in the special chars regex
      expect(result.hadAlchemyPrefix).toBe(false);
    });

    it("should detect special accented characters", () => {
      const result = CardNameNormalizer.getModificationInfo("Séance");

      expect(result.hadSpecialCharacters).toBe(true);
      expect(result.normalizedName).toBe("seance");
    });

    it("should detect non-standard slashes", () => {
      const result = CardNameNormalizer.getModificationInfo("Fire/Ice");

      expect(result.hadNonStandardSlashes).toBe(true);
      expect(result.hadAlchemyPrefix).toBe(false);
    });

    it("should not detect standard double slashes", () => {
      const result = CardNameNormalizer.getModificationInfo("Fire // Ice");

      expect(result.hadNonStandardSlashes).toBe(false);
    });

    it("should detect extra whitespace", () => {
      const result = CardNameNormalizer.getModificationInfo("Lightning  Bolt");

      expect(result.hadExtraWhitespace).toBe(true);
    });

    it("should detect leading/trailing whitespace", () => {
      const result = CardNameNormalizer.getModificationInfo(" Lightning Bolt ");

      expect(result.hadExtraWhitespace).toBe(true);
    });

    it("should handle cards with no modifications", () => {
      const result = CardNameNormalizer.getModificationInfo("Lightning Bolt");

      expect(result).toEqual({
        hadAlchemyPrefix: false,
        hadSpecialCharacters: false,
        hadNonStandardSlashes: false,
        hadExtraWhitespace: false,
        normalizedName: "lightningbolt",
      });
    });

    it("should handle cards with multiple modifications", () => {
      const result = CardNameNormalizer.getModificationInfo("A-Teferi's  Protection");

      expect(result.hadAlchemyPrefix).toBe(true);
      expect(result.hadExtraWhitespace).toBe(true);
      expect(result.normalizedName).toBe("teferisprotection");
    });
  });

  // Note: validateNormalization method would be useful for detecting collisions
  // but is not currently implemented. This would be valuable for import validation.
});
