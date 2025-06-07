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
});
