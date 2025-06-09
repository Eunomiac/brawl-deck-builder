// MTG Brawl Deck Builder - CardPile Tests
import { BasicCardPile } from "./CardPile";
import type { ProcessedCard } from "../types/mtg";
import { MTGColor } from "../types/mtg";

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
});
