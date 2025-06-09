// MTG Brawl Deck Builder - CardPile Tests
import { CardPile, BasicCardPile, type CardValidationResult } from "./CardPile";
import type { ProcessedCard } from "../types/mtg";
import { MTGColor } from "../types/mtg";

// Test implementation that can simulate validation failures
class TestCardPile extends CardPile {
  private shouldFailAddition = false;
  private shouldFailRemoval = false;
  private additionError = "Addition not allowed";
  private removalError = "Removal not allowed";

  constructor(name: string, cards: ProcessedCard[] = [], description?: string) {
    super(name, cards, description);
  }

  setAdditionFailure(shouldFail: boolean, error = "Addition not allowed"): void {
    this.shouldFailAddition = shouldFail;
    this.additionError = error;
  }

  setRemovalFailure(shouldFail: boolean, error = "Removal not allowed"): void {
    this.shouldFailRemoval = shouldFail;
    this.removalError = error;
  }

  protected validateCardAddition(card: ProcessedCard): CardValidationResult {
    if (this.shouldFailAddition) {
      return {
        isValid: false,
        errors: [`${this.additionError} for ${card.name}`],
        warnings: [],
      };
    }
    return {
      isValid: true,
      errors: [],
      warnings: [],
    };
  }

  protected validateCardRemoval(card: ProcessedCard): CardValidationResult {
    if (this.shouldFailRemoval) {
      return {
        isValid: false,
        errors: [`${this.removalError} for ${card.name}`],
        warnings: [],
      };
    }
    return {
      isValid: true,
      errors: [],
      warnings: [],
    };
  }
}

// Mock card data for testing
const createMockCard = (overrides: Partial<ProcessedCard> = {}): ProcessedCard => ({
  oracle_id: "test-oracle-id",
  original_name: "Test Card",
  name: "Test Card",
  search_key: "testcard",
  mana_cost: "{1}{R}",
  cmc: 2,
  type_line: "Creature — Human Warrior",
  oracle_text: "Test oracle text",
  colors: ["R"],
  color_identity: ["R"],
  rarity: "common",
  set_code: "tst",
  arena_legal_sets: ["tst"],
  can_be_commander: false,
  can_be_companion: false,
  companion_restriction: undefined,
  image_uris: {},
  back_image_uris: undefined,
  display_hints: {
    preferredOrientation: "portrait",
    hasBackFace: false,
    meldPartner: null
  },
  scryfall_uri: "https://scryfall.com/test",
  search_terms: [
    { search_term: "test card", is_primary: true }
  ],
  ...overrides
});

const mockRedCreature = createMockCard({
  oracle_id: "red-creature-1",
  name: "Red Creature",
  color_identity: [MTGColor.Red],
  type_line: "Creature — Dragon"
});

const mockBlueInstant = createMockCard({
  oracle_id: "blue-instant-1",
  name: "Blue Instant",
  color_identity: [MTGColor.Blue],
  type_line: "Instant",
  cmc: 3
});

const mockColorlessArtifact = createMockCard({
  oracle_id: "colorless-artifact-1",
  name: "Colorless Artifact",
  color_identity: [],
  type_line: "Artifact",
  cmc: 1
});

const mockMulticolorCard = createMockCard({
  oracle_id: "multicolor-1",
  name: "Multicolor Card",
  color_identity: [MTGColor.Red, MTGColor.Blue],
  type_line: "Creature — Wizard",
  cmc: 4
});

describe("CardPile", () => {
  let cardPile: BasicCardPile;

  beforeEach(() => {
    cardPile = new BasicCardPile("Test Pile");
  });

  describe("Basic Properties", () => {
    it("should initialize with correct name and empty cards", () => {
      expect(cardPile.name).toBe("Test Pile");
      expect(cardPile.cardCount).toBe(0);
      expect(cardPile.isEmpty).toBe(true);
      expect(cardPile.cards).toEqual([]);
    });

    it("should initialize with provided cards", () => {
      const cards = [mockRedCreature, mockBlueInstant];
      const pile = new BasicCardPile("Test Pile", cards);

      expect(pile.cardCount).toBe(2);
      expect(pile.isEmpty).toBe(false);
      expect(pile.cards).toHaveLength(2);
    });

    it("should allow setting name and description", () => {
      cardPile.name = "New Name";
      cardPile.description = "New Description";

      expect(cardPile.name).toBe("New Name");
      expect(cardPile.description).toBe("New Description");
    });
  });

  describe("Card Management", () => {
    it("should add cards successfully", () => {
      const result = cardPile.addCard(mockRedCreature);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(cardPile.cardCount).toBe(1);
      expect(cardPile.contains(mockRedCreature)).toBe(true);
    });

    it("should prevent duplicate cards by default", () => {
      cardPile.addCard(mockRedCreature);
      const result = cardPile.addCard(mockRedCreature);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("already exists");
      expect(cardPile.cardCount).toBe(1);
    });

    it("should allow duplicates when specified", () => {
      cardPile.addCard(mockRedCreature);
      const result = cardPile.addCard(mockRedCreature, { allowDuplicates: true });

      expect(result.isValid).toBe(true);
      expect(cardPile.cardCount).toBe(2);
    });

    it("should add multiple cards", () => {
      const cards = [mockRedCreature, mockBlueInstant, mockColorlessArtifact];
      const result = cardPile.addCards(cards);

      expect(result.isValid).toBe(true);
      expect(cardPile.cardCount).toBe(3);
    });

    it("should rollback on failed multiple card addition", () => {
      cardPile.addCard(mockRedCreature);
      const cards = [mockBlueInstant, mockRedCreature]; // Second card is duplicate
      const result = cardPile.addCards(cards);

      expect(result.isValid).toBe(false);
      expect(cardPile.cardCount).toBe(1); // Only original card remains
    });

    it("should remove cards successfully", () => {
      cardPile.addCard(mockRedCreature);
      const result = cardPile.removeCard(mockRedCreature);

      expect(result.isValid).toBe(true);
      expect(cardPile.cardCount).toBe(0);
      expect(cardPile.contains(mockRedCreature)).toBe(false);
    });

    it("should clear all cards", () => {
      cardPile.addCards([mockRedCreature, mockBlueInstant]);
      cardPile.clear();

      expect(cardPile.cardCount).toBe(0);
      expect(cardPile.isEmpty).toBe(true);
    });
  });

  describe("Card Lookup", () => {
    beforeEach(() => {
      cardPile.addCards([mockRedCreature, mockBlueInstant, mockColorlessArtifact]);
    });

    it("should find cards by oracle ID", () => {
      expect(cardPile.containsOracleId("red-creature-1")).toBe(true);
      expect(cardPile.containsOracleId("nonexistent")).toBe(false);

      const found = cardPile.getCardByOracleId("blue-instant-1");
      expect(found).toBeDefined();
      expect(found?.name).toBe("Blue Instant");
    });

    it("should find cards by name", () => {
      const found = cardPile.getCardsByName("Red Creature");
      expect(found).toHaveLength(1);
      expect(found[0].oracle_id).toBe("red-creature-1");
    });

    it("should search cards by name", () => {
      const results = cardPile.searchByName("blue");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Blue Instant");
    });
  });

  describe("Analysis Methods", () => {
    beforeEach(() => {
      cardPile.addCards([mockRedCreature, mockBlueInstant, mockColorlessArtifact, mockMulticolorCard]);
    });

    it("should calculate mana distribution correctly", () => {
      const distribution = cardPile.manaDistribution;

      expect(distribution.red).toBe(1);
      expect(distribution.blue).toBe(1);
      expect(distribution.colorless).toBe(1);
      expect(distribution.multicolor).toBe(1);
      expect(distribution.white).toBe(0);
      expect(distribution.black).toBe(0);
      expect(distribution.green).toBe(0);
    });

    it("should calculate type distribution correctly", () => {
      const distribution = cardPile.typeDistribution;

      expect(distribution.creatures).toBe(2); // Red creature + multicolor creature
      expect(distribution.instants).toBe(1);
      expect(distribution.artifacts).toBe(1);
      expect(distribution.sorceries).toBe(0);
    });

    it("should calculate color identity correctly", () => {
      const colors = cardPile.colorIdentity;

      expect(colors).toContain(MTGColor.Red);
      expect(colors).toContain(MTGColor.Blue);
      expect(colors).toHaveLength(2);
    });

    it("should calculate average CMC correctly", () => {
      const avgCMC = cardPile.averageCMC;
      // (2 + 3 + 1 + 4) / 4 = 2.5
      expect(avgCMC).toBe(2.5);
    });

    it("should detect duplicates correctly", () => {
      expect(cardPile.includesDuplicates).toBe(false);

      cardPile.addCard(mockRedCreature, { allowDuplicates: true });
      expect(cardPile.includesDuplicates).toBe(true);

      const duplicates = cardPile.getDuplicates();
      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].oracle_id).toBe("red-creature-1");
    });
  });

  describe("Filtering Methods", () => {
    beforeEach(() => {
      cardPile.addCards([mockRedCreature, mockBlueInstant, mockColorlessArtifact, mockMulticolorCard]);
    });

    it("should filter by type", () => {
      const creatures = cardPile.getCardsByType("creature");
      expect(creatures).toHaveLength(2);

      const instants = cardPile.getCardsByType("instant");
      expect(instants).toHaveLength(1);
    });

    it("should filter by CMC", () => {
      const cmc3Cards = cardPile.getCardsByCMC(3);
      expect(cmc3Cards).toHaveLength(1);
      expect(cmc3Cards[0].name).toBe("Blue Instant");

      const lowCostCards = cardPile.getCardsByCMCRange(1, 2);
      expect(lowCostCards).toHaveLength(2); // Red creature (2) + artifact (1)
    });

    it("should validate color identity", () => {
      const isValidForRed = cardPile.isValidForColorIdentity([MTGColor.Red]);
      expect(isValidForRed).toBe(false); // Contains blue and multicolor cards

      const isValidForAll = cardPile.isValidForColorIdentity([MTGColor.Red, MTGColor.Blue]);
      expect(isValidForAll).toBe(true);

      const violations = cardPile.getColorIdentityViolations([MTGColor.Red]);
      expect(violations).toHaveLength(2); // Blue instant + multicolor card
    });
  });

  describe("Validation Failure Paths", () => {
    let testPile: TestCardPile;

    beforeEach(() => {
      testPile = new TestCardPile("Test Validation Pile");
    });

    it("should handle validation failure on card addition", () => {
      testPile.setAdditionFailure(true, "Custom addition error");

      const result = testPile.addCard(mockRedCreature, { validateFormat: true });

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(["Custom addition error for Red Creature"]);
      expect(testPile.cardCount).toBe(0);
    });

    it("should handle validation failure on card removal", () => {
      // First add a card successfully
      testPile.addCard(mockRedCreature);
      expect(testPile.cardCount).toBe(1);

      // Then set removal to fail
      testPile.setRemovalFailure(true, "Custom removal error");

      const result = testPile.removeCard(mockRedCreature);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(["Custom removal error for Red Creature"]);
      expect(testPile.cardCount).toBe(1); // Card should still be there
    });

    it("should handle validation failure in removeCards", () => {
      // Add multiple cards
      testPile.addCards([mockRedCreature, mockBlueInstant]);
      expect(testPile.cardCount).toBe(2);

      // Set removal to fail
      testPile.setRemovalFailure(true, "Batch removal error");

      const result = testPile.removeCards([mockRedCreature, mockBlueInstant]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(["Batch removal error for Red Creature"]);
      expect(testPile.cardCount).toBe(2); // Both cards should still be there
    });

    it("should skip validation when skipValidation is true", () => {
      testPile.addCard(mockRedCreature);
      testPile.setRemovalFailure(true, "Should not see this error");

      const result = testPile.removeCard(mockRedCreature, { skipValidation: true });

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(testPile.cardCount).toBe(0);
    });

    it("should remove all copies when removeAll is true", () => {
      // Add multiple copies of the same card
      testPile.addCard(mockRedCreature);
      testPile.addCard(mockRedCreature, { allowDuplicates: true });
      testPile.addCard(mockRedCreature, { allowDuplicates: true });
      expect(testPile.cardCount).toBe(3);

      const result = testPile.removeCard(mockRedCreature, { removeAll: true });

      expect(result.isValid).toBe(true);
      expect(testPile.cardCount).toBe(0);
    });

    it("should handle card not found in removeCard", () => {
      // Try to remove a card that doesn't exist
      const result = testPile.removeCard(mockRedCreature);

      expect(result.isValid).toBe(true); // Should succeed even if card not found
      expect(testPile.cardCount).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    let cardPile: BasicCardPile;

    beforeEach(() => {
      cardPile = new BasicCardPile("Edge Case Pile");
    });

    it("should handle empty pile analysis methods", () => {
      expect(cardPile.averageCMC).toBe(0);
      expect(cardPile.newestIncludedSet).toBeUndefined();
      expect(cardPile.includesDuplicates).toBe(false);
      expect(cardPile.getDuplicates()).toEqual([]);
      expect(cardPile.colorIdentity).toEqual([]);
    });

    it("should handle cards with null/undefined properties", () => {
      const cardWithNulls = createMockCard({
        oracle_id: "null-card",
        color_identity: undefined,
        type_line: undefined,
        cmc: undefined,
        name: undefined,
        search_key: undefined,
      });

      cardPile.addCard(cardWithNulls);

      // Should not crash on analysis
      const manaDistribution = cardPile.manaDistribution;
      expect(manaDistribution.colorless).toBe(1);

      const typeDistribution = cardPile.typeDistribution;
      expect(typeDistribution.other).toBe(1);

      expect(cardPile.averageCMC).toBe(0);
      expect(cardPile.colorIdentity).toEqual([]);
    });

    it("should handle search with null name and search_key", () => {
      const cardWithNulls = createMockCard({
        oracle_id: "null-search-card",
        name: undefined,
        search_key: undefined,
      });

      cardPile.addCard(cardWithNulls);
      const results = cardPile.searchByName("test");
      expect(results).toEqual([]);
    });

    it("should handle getCardsByColorIdentity with exact match logic", () => {
      // Add cards with different color identities
      cardPile.addCards([mockRedCreature, mockMulticolorCard, mockColorlessArtifact]);

      // getCardsByColorIdentity returns cards where ALL card colors are in the allowed list
      // So a red card matches [Red] and [Red, Blue], but multicolor doesn't match [Red] only
      const redOnlyCards = cardPile.getCardsByColorIdentity([MTGColor.Red]);
      expect(redOnlyCards).toHaveLength(2); // Red creature + colorless artifact (empty color identity matches any list)

      const multiColorCards = cardPile.getCardsByColorIdentity([MTGColor.Red, MTGColor.Blue]);
      expect(multiColorCards).toHaveLength(3); // All cards match since all their colors are in the allowed list

      const colorlessCards = cardPile.getCardsByColorIdentity([]);
      expect(colorlessCards).toHaveLength(1); // Only the colorless artifact
    });

    it("should handle mana distribution with unknown colors", () => {
      const cardWithUnknownColor = createMockCard({
        oracle_id: "unknown-color-card",
        color_identity: ["X"], // Unknown color for testing
      });

      cardPile.addCard(cardWithUnknownColor);
      const distribution = cardPile.manaDistribution;

      // Unknown colors don't match any of the switch cases, so nothing gets incremented
      // The card has length 1 but doesn't match any case, so no counter is incremented
      expect(distribution.white).toBe(0);
      expect(distribution.blue).toBe(0);
      expect(distribution.black).toBe(0);
      expect(distribution.red).toBe(0);
      expect(distribution.green).toBe(0);
      expect(distribution.colorless).toBe(0);
      expect(distribution.multicolor).toBe(0); // Nothing gets incremented for unknown single colors
    });
  });
});
