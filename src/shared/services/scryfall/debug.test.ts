// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { ScryfallDebugger } from "./debug";

// Mock Supabase client
jest.mock("../../../services/supabase/client", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          range: jest.fn(() => ({
            data: [
              {
                oracle_id: "test-1",
                scryfall_id: "scryfall-test-1",
                name: "Test Card 1",
                rarity: "common",
                cmc: 2,
                can_be_commander: false,
                can_be_companion: false,
                color_identity: ["U"],
                set_code: "TST"
              },
              {
                oracle_id: "test-2",
                scryfall_id: "scryfall-test-2",
                name: "Test Commander",
                rarity: "mythic",
                cmc: 5,
                can_be_commander: true,
                can_be_companion: false,
                color_identity: ["W", "U"],
                set_code: "TST"
              }
            ],
            error: null
          })),
          limit: jest.fn(() => ({
            data: [],
            error: null
          })),
          data: [],
          error: null
        })),
        ilike: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              data: [],
              error: null
            }))
          }))
        })),
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              data: [],
              error: null
            }))
          }))
        })),
        count: 2,
        error: null
      }))
    }))
  }
}));

describe("ScryfallDebugger", () => {
  describe("function exports", () => {
    it("should export all required debugging functions", () => {
      expect(typeof ScryfallDebugger.getAllCards).toBe("function");
      expect(typeof ScryfallDebugger.searchCardsByName).toBe("function");
      expect(typeof ScryfallDebugger.getCardsByCriteria).toBe("function");
      expect(typeof ScryfallDebugger.getImportSummary).toBe("function");
      expect(typeof ScryfallDebugger.exportCardsToJSON).toBe("function");
      expect(typeof ScryfallDebugger.logImportSummary).toBe("function");
      expect(typeof ScryfallDebugger.logCards).toBe("function");
    });

    it("should export all watch card functions", () => {
      expect(typeof ScryfallDebugger.setWatchCard).toBe("function");
      expect(typeof ScryfallDebugger.clearWatchCard).toBe("function");
      expect(typeof ScryfallDebugger.getWatchCard).toBe("function");
      expect(typeof ScryfallDebugger.isWatchCard).toBe("function");
      expect(typeof ScryfallDebugger.logRawCard).toBe("function");
      expect(typeof ScryfallDebugger.logProcessedCard).toBe("function");
      expect(typeof ScryfallDebugger.logCardTransformation).toBe("function");
    });
  });

  describe("getAllCards", () => {
    it("should have default options", async () => {
      const result = await ScryfallDebugger.getAllCards();

      expect(result).toHaveProperty("cards");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.cards)).toBe(true);
      expect(typeof result.total).toBe("number");
    });

    it("should accept custom options", async () => {
      const options = {
        limit: 50,
        offset: 10,
        orderBy: "cmc" as const,
        orderDirection: "desc" as const
      };

      const result = await ScryfallDebugger.getAllCards(options);

      expect(result).toHaveProperty("cards");
      expect(result).toHaveProperty("total");
    });
  });

  describe("getAllCardsUnlimited", () => {
    it("should get all cards without limit", async () => {
      const result = await ScryfallDebugger.getAllCardsUnlimited();

      expect(result).toHaveProperty("cards");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.cards)).toBe(true);
      expect(typeof result.total).toBe("number");
    });
  });

  describe("searchCardsByName", () => {
    it("should search for cards by name", async () => {
      const result = await ScryfallDebugger.searchCardsByName("Lightning");

      expect(result).toHaveProperty("cards");
      expect(Array.isArray(result.cards)).toBe(true);
    });

    it("should accept custom limit", async () => {
      const result = await ScryfallDebugger.searchCardsByName("Test", 10);

      expect(result).toHaveProperty("cards");
      expect(Array.isArray(result.cards)).toBe(true);
    });
  });

  describe("getCardsByCriteria", () => {
    it("should filter cards by criteria", async () => {
      const criteria = {
        rarity: "mythic",
        canBeCommander: true,
        colors: ["W", "U"]
      };

      const result = await ScryfallDebugger.getCardsByCriteria(criteria);

      expect(result).toHaveProperty("cards");
      expect(Array.isArray(result.cards)).toBe(true);
    });

    it("should handle empty criteria", async () => {
      const result = await ScryfallDebugger.getCardsByCriteria({});

      expect(result).toHaveProperty("cards");
      expect(Array.isArray(result.cards)).toBe(true);
    });
  });

  describe("getImportSummary", () => {
    it("should return import statistics", async () => {
      const result = await ScryfallDebugger.getImportSummary();

      expect(result).toHaveProperty("summary");
      expect(result.summary).toHaveProperty("totalCards");
      expect(result.summary).toHaveProperty("commanders");
      expect(result.summary).toHaveProperty("companions");
      expect(result.summary).toHaveProperty("byRarity");
      expect(result.summary).toHaveProperty("byColorIdentity");
      expect(result.summary).toHaveProperty("bySets");
      expect(result.summary).toHaveProperty("cmcDistribution");
    });
  });

  describe("console logging methods", () => {
    beforeEach(() => {
      jest.spyOn(console, "log").mockImplementation();
      jest.spyOn(console, "error").mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should have logImportSummary method", async () => {
      await ScryfallDebugger.logImportSummary();

      // Should not throw and should be callable
      expect(typeof ScryfallDebugger.logImportSummary).toBe("function");
    });

    it("should have logCards method", async () => {
      await ScryfallDebugger.logCards("test");

      // Should not throw and should be callable
      expect(typeof ScryfallDebugger.logCards).toBe("function");
    });
  });

  describe("watch card functionality", () => {
    beforeEach(() => {
      jest.spyOn(console, "log").mockImplementation();
      jest.spyOn(console, "error").mockImplementation();
      // Clear any existing watch card
      ScryfallDebugger.clearWatchCard();
    });

    afterEach(() => {
      jest.restoreAllMocks();
      ScryfallDebugger.clearWatchCard();
    });

    describe("setWatchCard", () => {
      it("should set watch card term", () => {
        ScryfallDebugger.setWatchCard("Lightning");
        expect(ScryfallDebugger.getWatchCard()).toBe("lightning");
      });

      it("should convert to lowercase", () => {
        ScryfallDebugger.setWatchCard("LIGHTNING BOLT");
        expect(ScryfallDebugger.getWatchCard()).toBe("lightning bolt");
      });

      it("should log when setting watch card", () => {
        ScryfallDebugger.setWatchCard("Test Card");
        expect(console.log).toHaveBeenCalledWith('🔍 Watch card set to: "Test Card"');
      });
    });

    describe("clearWatchCard", () => {
      it("should clear watch card term", () => {
        ScryfallDebugger.setWatchCard("Lightning");
        ScryfallDebugger.clearWatchCard();
        expect(ScryfallDebugger.getWatchCard()).toBeNull();
      });

      it("should log when clearing existing watch card", () => {
        ScryfallDebugger.setWatchCard("Lightning");
        ScryfallDebugger.clearWatchCard();
        expect(console.log).toHaveBeenCalledWith('🔍 Watch card cleared (was: "lightning")');
      });

      it("should log when no watch card was set", () => {
        ScryfallDebugger.clearWatchCard();
        expect(console.log).toHaveBeenCalledWith("🔍 No watch card was set");
      });
    });

    describe("getWatchCard", () => {
      it("should return null when no watch card is set", () => {
        expect(ScryfallDebugger.getWatchCard()).toBeNull();
      });

      it("should return current watch term", () => {
        ScryfallDebugger.setWatchCard("Lightning");
        expect(ScryfallDebugger.getWatchCard()).toBe("lightning");
      });
    });

    describe("isWatchCard", () => {
      it("should return false when no watch card is set", () => {
        expect(ScryfallDebugger.isWatchCard("Lightning Bolt")).toBe(false);
      });

      it("should return true for matching card names", () => {
        ScryfallDebugger.setWatchCard("Lightning");
        expect(ScryfallDebugger.isWatchCard("Lightning Bolt")).toBe(true);
        expect(ScryfallDebugger.isWatchCard("Lightning Strike")).toBe(true);
      });

      it("should return false for non-matching card names", () => {
        ScryfallDebugger.setWatchCard("Lightning");
        expect(ScryfallDebugger.isWatchCard("Shock")).toBe(false);
        expect(ScryfallDebugger.isWatchCard("Fireball")).toBe(false);
      });

      it("should be case insensitive", () => {
        ScryfallDebugger.setWatchCard("lightning");
        expect(ScryfallDebugger.isWatchCard("LIGHTNING BOLT")).toBe(true);
        expect(ScryfallDebugger.isWatchCard("Lightning Strike")).toBe(true);
      });

      it("should handle partial matches", () => {
        ScryfallDebugger.setWatchCard("Teferi");
        expect(ScryfallDebugger.isWatchCard("Teferi, Hero of Dominaria")).toBe(true);
        expect(ScryfallDebugger.isWatchCard("Teferi's Protection")).toBe(true);
        expect(ScryfallDebugger.isWatchCard("Young Pyromancer")).toBe(false);
      });
    });

    describe("logging methods", () => {
      const mockScryfallCard = {
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
        legalities: { brawl: "legal" },
        games: ["arena"],
        scryfall_uri: "https://scryfall.com/card/test"
      };

      const mockProcessedCard = {
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
        scryfall_uri: "https://scryfall.com/card/test"
      };

      describe("logRawCard", () => {
        it("should not log when card doesn't match watch term", () => {
          ScryfallDebugger.setWatchCard("Dragon");
          ScryfallDebugger.logRawCard(mockScryfallCard);
          expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining("🎯 WATCH CARD"));
        });

        it("should log when card matches watch term", () => {
          ScryfallDebugger.setWatchCard("Lightning");
          ScryfallDebugger.logRawCard(mockScryfallCard);
          expect(console.log).toHaveBeenCalledWith(expect.stringContaining("🎯 WATCH CARD"));
          expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Lightning Bolt"));
        });

        it("should use custom stage name", () => {
          ScryfallDebugger.setWatchCard("Lightning");
          ScryfallDebugger.logRawCard(mockScryfallCard, "Custom Stage");
          expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Custom Stage"));
        });
      });

      describe("logProcessedCard", () => {
        it("should not log when card doesn't match watch term", () => {
          ScryfallDebugger.setWatchCard("Dragon");
          ScryfallDebugger.logProcessedCard(mockProcessedCard);
          expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining("🎯 WATCH CARD"));
        });

        it("should log when card matches watch term", () => {
          ScryfallDebugger.setWatchCard("Lightning");
          ScryfallDebugger.logProcessedCard(mockProcessedCard);
          expect(console.log).toHaveBeenCalledWith(expect.stringContaining("🎯 WATCH CARD"));
          expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Lightning Bolt"));
        });

        it("should check both name and original_name", () => {
          // Clear any previous console.log calls
          jest.clearAllMocks();
          ScryfallDebugger.setWatchCard("Lightning");
          const cardWithDifferentNames = {
            ...mockProcessedCard,
            name: "Different Name",
            original_name: "Lightning Bolt"
          };
          ScryfallDebugger.logProcessedCard(cardWithDifferentNames);
          expect(console.log).toHaveBeenCalledWith(expect.stringContaining("🎯 WATCH CARD"));
        });
      });

      describe("logCardTransformation", () => {
        it("should not log when card doesn't match watch term", () => {
          ScryfallDebugger.setWatchCard("Dragon");
          ScryfallDebugger.logCardTransformation(mockScryfallCard, mockProcessedCard);
          expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining("🔄 WATCH CARD"));
        });

        it("should log when card matches watch term", () => {
          ScryfallDebugger.setWatchCard("Lightning");
          ScryfallDebugger.logCardTransformation(mockScryfallCard, mockProcessedCard);
          expect(console.log).toHaveBeenCalledWith(expect.stringContaining("🔄 WATCH CARD"));
          expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Complete Transformation"));
        });

        it("should show before and after data", () => {
          ScryfallDebugger.setWatchCard("Lightning");
          ScryfallDebugger.logCardTransformation(mockScryfallCard, mockProcessedCard);
          expect(console.log).toHaveBeenCalledWith(expect.stringContaining("📥 BEFORE"));
          expect(console.log).toHaveBeenCalledWith(expect.stringContaining("📤 AFTER"));
          expect(console.log).toHaveBeenCalledWith(expect.stringContaining("🔍 KEY TRANSFORMATIONS"));
        });
      });
    });
  });
});
