// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { CardProcessor } from "./processor";
import { ScryfallUtils } from "./api";
import type { ScryfallCard, ProcessedCard } from "../../types/mtg";

// Mock global assert function
global.assert = jest.fn((condition, message) => {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
});

// Mock ScryfallUtils since it's in the excluded API file
jest.mock("./api", () => ({
  ScryfallUtils: {
    isBrawlLegalOnArena: jest.fn(),
    canBeCommander: jest.fn(),
    canBeCompanion: jest.fn(),
    extractCompanionRestriction: jest.fn(),
    getCardSearchTerms: jest.fn(),
  }
}));

// Mock ScryfallDebugger since it imports Supabase client
jest.mock("./debug", () => ({
  ScryfallDebugger: {
    logRawCard: jest.fn(),
    logProcessedCard: jest.fn(),
    logCardTransformation: jest.fn(),
  }
}));

describe("CardProcessor", () => {
  const mockScryfallUtils = ScryfallUtils as jest.Mocked<typeof ScryfallUtils>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock implementations
    mockScryfallUtils.isBrawlLegalOnArena.mockReturnValue(true);
    mockScryfallUtils.canBeCommander.mockReturnValue(false);
    mockScryfallUtils.canBeCompanion.mockReturnValue(false);
    mockScryfallUtils.extractCompanionRestriction.mockReturnValue(undefined);
    mockScryfallUtils.getCardSearchTerms.mockReturnValue([
      { search_term: "test", is_primary: true }
    ]);
  });

  describe("filterValidCards", () => {
    it("should filter cards using ScryfallUtils.isBrawlLegalOnArena and lang=en", () => {
      const cards: Partial<ScryfallCard>[] = [
        { name: "Legal English Card", oracle_id: "legal-1", lang: "en" },
        { name: "Illegal Card", oracle_id: "illegal-1", lang: "en" },
        { name: "Legal Foreign Card", oracle_id: "legal-2", lang: "ja" },
        { name: "Another Legal English Card", oracle_id: "legal-3", lang: "en" }
      ];

      mockScryfallUtils.isBrawlLegalOnArena
        .mockReturnValueOnce(true)   // Legal English Card
        .mockReturnValueOnce(false)  // Illegal Card
        .mockReturnValueOnce(true)   // Legal Foreign Card (but wrong language)
        .mockReturnValueOnce(true);  // Another Legal English Card

      const result = CardProcessor.filterValidCards(cards as ScryfallCard[]);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Legal English Card");
      expect(result[1].name).toBe("Another Legal English Card");
      expect(mockScryfallUtils.isBrawlLegalOnArena).toHaveBeenCalledTimes(4);
    });

    it("should return empty array when no cards are valid", () => {
      const cards: Partial<ScryfallCard>[] = [
        { name: "Illegal Card 1", oracle_id: "illegal-1", lang: "en" },
        { name: "Legal Foreign Card", oracle_id: "legal-1", lang: "ja" }
      ];

      mockScryfallUtils.isBrawlLegalOnArena
        .mockReturnValueOnce(false)  // Illegal Card 1
        .mockReturnValueOnce(true);  // Legal Foreign Card (but wrong language)

      const result = CardProcessor.filterValidCards(cards as ScryfallCard[]);

      expect(result).toHaveLength(0);
    });

    it("should handle empty input array", () => {
      const result = CardProcessor.filterValidCards([]);
      expect(result).toEqual([]);
    });
  });

  describe("deduplicateCards", () => {
    it("should keep the most recent printing based on set code", () => {
      const cards: Partial<ScryfallCard>[] = [
        {
          oracle_id: "same-oracle-id",
          name: "Lightning Bolt",
          set: "lea" // Alpha (older)
        },
        {
          oracle_id: "same-oracle-id",
          name: "Lightning Bolt",
          set: "m21" // Core 2021 (newer)
        },
        {
          oracle_id: "different-oracle-id",
          name: "Counterspell",
          set: "lea"
        }
      ];

      const result = CardProcessor.deduplicateCards(cards as ScryfallCard[]);

      expect(result).toHaveLength(2);

      // Should keep the M21 version (newer set)
      const lightningBolt = result.find(card => card.oracle_id === "same-oracle-id");
      expect(lightningBolt?.set).toBe("m21");

      // Should keep the unique card
      const counterspell = result.find(card => card.oracle_id === "different-oracle-id");
      expect(counterspell?.name).toBe("Counterspell");
    });

    it("should handle cards with same oracle_id and same set", () => {
      const cards: Partial<ScryfallCard>[] = [
        { oracle_id: "same-id", name: "Card A", set: "m21" },
        { oracle_id: "same-id", name: "Card A", set: "m21" }
      ];

      const result = CardProcessor.deduplicateCards(cards as ScryfallCard[]);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Card A");
    });

    it("should handle empty input array", () => {
      const result = CardProcessor.deduplicateCards([]);
      expect(result).toEqual([]);
    });

    it("should handle single card", () => {
      const cards: Partial<ScryfallCard>[] = [
        { oracle_id: "single-id", name: "Single Card", set: "m21" }
      ];

      const result = CardProcessor.deduplicateCards(cards as ScryfallCard[]);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Single Card");
    });

    it("should collect arena_legal_sets from all variants", () => {
      const cards: ScryfallCard[] = [
        {
          oracle_id: "oracle-1",
          name: "Test Card",
          set: "m21",
        } as ScryfallCard,
        {
          oracle_id: "oracle-1", // Same oracle_id
          name: "Test Card",
          set: "znr",
        } as ScryfallCard,
        {
          oracle_id: "oracle-1", // Same oracle_id
          name: "Test Card",
          set: "akr",
        } as ScryfallCard,
      ];

      const result = CardProcessor.deduplicateCards(cards);

      expect(result).toHaveLength(1);
      expect(result[0].arena_legal_sets).toEqual(["akr", "m21", "znr"]); // Sorted alphabetically
      expect(result[0].set).toBe("znr"); // Most recent set code (alphabetically last)
    });
  });

  describe("processCard", () => {
    it("should process a basic card correctly", () => {
      const card: Partial<ScryfallCard> = {
        oracle_id: "test-oracle-id",
        name: "Lightning Bolt",
        mana_cost: "{R}",
        cmc: 1,
        type_line: "Instant",
        oracle_text: "Lightning Bolt deals 3 damage to any target.",
        colors: ["R"],
        color_identity: ["R"],
        rarity: "common",
        set: "lea",
        scryfall_uri: "https://scryfall.com/card/test",
        image_uris: {
          small: "https://example.com/small.jpg",
          normal: "https://example.com/normal.jpg",
          large: "https://example.com/large.jpg",
          png: "https://example.com/png.png",
          art_crop: "https://example.com/art.jpg",
          border_crop: "https://example.com/border.jpg"
        }
      };

      mockScryfallUtils.canBeCommander.mockReturnValue(false);
      mockScryfallUtils.canBeCompanion.mockReturnValue(false);
      mockScryfallUtils.extractCompanionRestriction.mockReturnValue(undefined);
      mockScryfallUtils.getCardSearchTerms.mockReturnValue([
        { search_term: "lightning", is_primary: true },
        { search_term: "bolt", is_primary: false }
      ]);

      const result = CardProcessor.processCard(card as ScryfallCard);

      expect(result).toEqual({
        oracle_id: "test-oracle-id",
        original_name: "Lightning Bolt",
        name: "Lightning Bolt",
        search_key: "lightningbolt",
        mana_cost: "{R}",
        cmc: 1,
        type_line: "Instant",
        oracle_text: "Lightning Bolt deals 3 damage to any target.",
        colors: ["R"],
        color_identity: ["R"],
        rarity: "common",
        set_code: "lea",
        can_be_commander: false,
        can_be_companion: false,
        companion_restriction: undefined,
        image_uris: {
          small: "https://example.com/small.jpg",
          normal: "https://example.com/normal.jpg",
          large: "https://example.com/large.jpg",
          png: "https://example.com/png.png",
          art_crop: "https://example.com/art.jpg",
          border_crop: "https://example.com/border.jpg"
        },
        back_image_uris: undefined,
        display_hints: {
          preferredOrientation: "portrait",
          hasBackFace: false,
          meldPartner: null,
        },
        scryfall_uri: "https://scryfall.com/card/test",
        search_terms: [
          { search_term: "lightning", is_primary: true },
          { search_term: "bolt", is_primary: false }
        ]
      });
    });

    it("should process a commander card correctly", () => {
      const card: Partial<ScryfallCard> = {
        oracle_id: "commander-id",
        name: "Jace, the Mind Sculptor",
        type_line: "Legendary Planeswalker — Jace",
        set: "wwk"
      };

      mockScryfallUtils.canBeCommander.mockReturnValue(true);

      const result = CardProcessor.processCard(card as ScryfallCard);

      expect(result.can_be_commander).toBe(true);
      expect(mockScryfallUtils.canBeCommander).toHaveBeenCalledWith(card);
    });

    it("should process a companion card correctly", () => {
      const card: Partial<ScryfallCard> = {
        oracle_id: "companion-id",
        name: "Lurrus of the Dream-Den",
        oracle_text: "Companion — Each permanent card in your starting deck has mana value 2 or less.",
        set: "iko"
      };

      mockScryfallUtils.canBeCompanion.mockReturnValue(true);
      mockScryfallUtils.extractCompanionRestriction.mockReturnValue(
        "Each permanent card in your starting deck has mana value 2 or less."
      );

      const result = CardProcessor.processCard(card as ScryfallCard);

      expect(result.can_be_companion).toBe(true);
      expect(result.companion_restriction).toBe(
        "Each permanent card in your starting deck has mana value 2 or less."
      );
    });

    it("should handle cards without image_uris", () => {
      const card: Partial<ScryfallCard> = {
        oracle_id: "no-image-id",
        name: "Test Card",
        set: "test"
      };

      const result = CardProcessor.processCard(card as ScryfallCard);

      expect(result.image_uris).toBeUndefined();
    });
  });

  describe("processCards", () => {
    it("should process multiple cards and call progress callback", () => {
      const cards: Partial<ScryfallCard>[] = Array.from({ length: 250 }, (_, i) => ({
        oracle_id: `card-${i}`,
        name: `Card ${i}`,
        set: "test"
      }));

      const onProgress = jest.fn();
      const result = CardProcessor.processCards(cards as ScryfallCard[], onProgress);

      expect(result).toHaveLength(250);
      expect(onProgress).toHaveBeenCalledWith(100, 250); // Called at 100
      expect(onProgress).toHaveBeenCalledWith(200, 250); // Called at 200
      expect(onProgress).toHaveBeenCalledWith(250, 250); // Called at end
    });

    it("should handle processing errors gracefully", () => {
      const cards: Partial<ScryfallCard>[] = [
        { oracle_id: "good-card", name: "Good Card", set: "test" },
        { oracle_id: "bad-card", name: "Bad Card", set: "test" }
      ];

      // Mock processCard to throw error for the second card
      const originalProcessCard = CardProcessor.processCard;
      jest.spyOn(CardProcessor, 'processCard')
        .mockImplementationOnce(originalProcessCard)
        .mockImplementationOnce(() => {
          throw new Error("Processing failed");
        });

      const result = CardProcessor.processCards(cards as ScryfallCard[]);

      expect(result).toHaveLength(1); // Only the good card processed
      expect(result[0].name).toBe("Good Card");
    });

    it("should handle empty input array", () => {
      const onProgress = jest.fn();
      const result = CardProcessor.processCards([], onProgress);

      expect(result).toEqual([]);
      expect(onProgress).toHaveBeenCalledWith(0, 0);
    });
  });

  describe("processCardData", () => {
    it("should run the full processing pipeline", async () => {
      const cards: Partial<ScryfallCard>[] = [
        { oracle_id: "card1", name: "Card 1", set: "m21", lang: "en" },
        { oracle_id: "card2", name: "Card 2", set: "znr", lang: "en" },
        { oracle_id: "card1", name: "Card 1 Reprint", set: "m22", lang: "en" } // Duplicate oracle_id
      ];

      // Mock the filter to return all cards as legal
      mockScryfallUtils.isBrawlLegalOnArena.mockReturnValue(true);

      const onProgress = jest.fn();
      const result = await CardProcessor.processCardData(cards as ScryfallCard[], onProgress);

      // Should filter first, then deduplicate, and process
      expect(result).toHaveLength(2); // Deduplicated
      expect(onProgress).toHaveBeenCalledWith("Filtering cards", 0, 3);
      expect(onProgress).toHaveBeenCalledWith("Deduplicating cards", 1, 3);
      expect(onProgress).toHaveBeenCalledWith("Processing cards", 2, 3);
      expect(onProgress).toHaveBeenCalledWith("Complete", 3, 3);
    });

    it("should handle empty input array", async () => {
      const onProgress = jest.fn();
      const result = await CardProcessor.processCardData([], onProgress);

      expect(result).toEqual([]);
      expect(onProgress).toHaveBeenCalledWith("Complete", 3, 3);
    });
  });

  describe("getCardStatistics", () => {
    it("should calculate statistics correctly", () => {
      const cards: Partial<ProcessedCard>[] = [
        {
          oracle_id: "card1",
          name: "Commander Card",
          can_be_commander: true,
          can_be_companion: false,
          rarity: "mythic",
          color_identity: ["R", "W"]
        },
        {
          oracle_id: "card2",
          name: "Companion Card",
          can_be_commander: false,
          can_be_companion: true,
          rarity: "rare",
          color_identity: ["U"]
        },
        {
          oracle_id: "card3",
          name: "Regular Card",
          can_be_commander: false,
          can_be_companion: false,
          rarity: "common",
          color_identity: []
        },
        {
          oracle_id: "card4",
          name: "Another Common",
          can_be_commander: false,
          can_be_companion: false,
          rarity: "common",
          color_identity: ["G", "U"]
        }
      ];

      const result = CardProcessor.getCardStatistics(cards as ProcessedCard[]);

      expect(result).toEqual({
        total: 4,
        commanders: 1,
        companions: 1,
        byRarity: {
          mythic: 1,
          rare: 1,
          common: 2
        },
        byColorIdentity: {
          "RW": 1,
          "U": 1,
          "": 1, // Empty color_identity becomes empty string, not "colorless"
          "GU": 1
        }
      });
    });

    it("should handle cards without rarity", () => {
      const cards: Partial<ProcessedCard>[] = [
        {
          oracle_id: "card1",
          name: "No Rarity Card",
          can_be_commander: false,
          can_be_companion: false,
          color_identity: ["B"]
        }
      ];

      const result = CardProcessor.getCardStatistics(cards as ProcessedCard[]);

      expect(result.byRarity.unknown).toBe(1);
    });

    it("should handle cards without color_identity", () => {
      const cards: Partial<ProcessedCard>[] = [
        {
          oracle_id: "card1",
          name: "No Color Identity",
          can_be_commander: false,
          can_be_companion: false,
          rarity: "common"
        }
      ];

      const result = CardProcessor.getCardStatistics(cards as ProcessedCard[]);

      expect(result.byColorIdentity.colorless).toBe(1);
    });

    it("should handle empty input array", () => {
      const result = CardProcessor.getCardStatistics([]);

      expect(result).toEqual({
        total: 0,
        commanders: 0,
        companions: 0,
        byRarity: {},
        byColorIdentity: {}
      });
    });
  });

  describe("validateProcessedCards", () => {
    it("should validate cards successfully", () => {
      const cards: Partial<ProcessedCard>[] = [
        {
          oracle_id: "valid-id-1",
          name: "Valid Card 1",
          type_line: "Creature — Human",
          set_code: "m21"
        },
        {
          oracle_id: "valid-id-2",
          name: "Valid Card 2",
          type_line: "Instant",
          set_code: "znr"
        }
      ];

      const result = CardProcessor.validateProcessedCards(cards as ProcessedCard[]);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it("should detect missing required fields", () => {
      const cards: Partial<ProcessedCard>[] = [
        {
          oracle_id: "",
          name: "Missing Oracle ID"
        },
        {
          oracle_id: "valid-id",
          name: ""
        }
      ];

      const result = CardProcessor.validateProcessedCards(cards as ProcessedCard[]);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain("Card missing oracle_id");
      expect(result.errors[1]).toContain("Card missing name");
    });

    it("should detect missing optional fields as warnings", () => {
      const cards: Partial<ProcessedCard>[] = [
        {
          oracle_id: "valid-id",
          name: "Valid Card",
          type_line: "",
          set_code: ""
        }
      ];

      const result = CardProcessor.validateProcessedCards(cards as ProcessedCard[]);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[0]).toContain("Card missing type_line");
      expect(result.warnings[1]).toContain("Card missing set_code");
    });

    it("should detect duplicate oracle_ids", () => {
      const cards: Partial<ProcessedCard>[] = [
        {
          oracle_id: "duplicate-id",
          name: "Card 1"
        },
        {
          oracle_id: "duplicate-id",
          name: "Card 2"
        }
      ];

      const result = CardProcessor.validateProcessedCards(cards as ProcessedCard[]);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("Duplicate oracle_id found");
    });

    it("should handle empty input array", () => {
      const result = CardProcessor.validateProcessedCards([]);

      expect(result).toEqual({
        valid: true,
        errors: [],
        warnings: []
      });
    });
  });
});
