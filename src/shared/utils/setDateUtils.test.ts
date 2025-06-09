import { dateDeckByMostRecentSet, getArenaSetsSortedByDate, generateArenaLegalSetsConstant, findSetsInDateRange } from "./setDateUtils";
import type { ProcessedCard } from "../types/mtg";

// Mock ScryfallUtils
jest.mock("../services/scryfall", () => ({
  ScryfallUtils: {
    getMostRecentSet: jest.fn(),
    sortSetsByReleaseDate: jest.fn(),
    getUniqueSetCodes: jest.fn(),
  },
}));

import { ScryfallUtils } from "../services/scryfall";

const mockScryfallUtils = ScryfallUtils as jest.Mocked<typeof ScryfallUtils>;

describe("Set Date Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("dateDeckByMostRecentSet", () => {
    const mockSetReleaseDates = {
      "BRO": "2022-11-18",
      "DMU": "2022-09-09",
      "SNC": "2022-04-29",
    };

    it("should return null for empty deck set codes", () => {
      const result = dateDeckByMostRecentSet([], mockSetReleaseDates);
      expect(result).toBeNull();
    });

    it("should return null when no most recent set is found", () => {
      mockScryfallUtils.getMostRecentSet.mockReturnValue(null);
      
      const result = dateDeckByMostRecentSet(["BRO", "DMU"], mockSetReleaseDates);
      expect(result).toBeNull();
    });

    it("should return most recent set information", () => {
      const deckSetCodes = ["BRO", "DMU", "SNC"];
      
      mockScryfallUtils.getMostRecentSet.mockReturnValue({
        setCode: "BRO",
        releaseDate: "2022-11-18",
      });
      
      mockScryfallUtils.sortSetsByReleaseDate.mockReturnValue(["BRO", "DMU", "SNC"]);

      const result = dateDeckByMostRecentSet(deckSetCodes, mockSetReleaseDates);

      expect(result).toEqual({
        mostRecentSet: "BRO",
        releaseDate: "2022-11-18",
        allSetsSorted: [
          { setCode: "BRO", releaseDate: "2022-11-18" },
          { setCode: "DMU", releaseDate: "2022-09-09" },
          { setCode: "SNC", releaseDate: "2022-04-29" },
        ],
      });

      expect(mockScryfallUtils.getMostRecentSet).toHaveBeenCalledWith(deckSetCodes, mockSetReleaseDates);
      expect(mockScryfallUtils.sortSetsByReleaseDate).toHaveBeenCalledWith(deckSetCodes, mockSetReleaseDates, false);
    });

    it("should handle sets with missing release dates", () => {
      const deckSetCodes = ["BRO", "UNKNOWN"];
      
      mockScryfallUtils.getMostRecentSet.mockReturnValue({
        setCode: "BRO",
        releaseDate: "2022-11-18",
      });
      
      mockScryfallUtils.sortSetsByReleaseDate.mockReturnValue(["BRO", "UNKNOWN"]);

      const result = dateDeckByMostRecentSet(deckSetCodes, mockSetReleaseDates);

      expect(result?.allSetsSorted).toEqual([
        { setCode: "BRO", releaseDate: "2022-11-18" },
        { setCode: "UNKNOWN", releaseDate: "1993-01-01" },
      ]);
    });
  });

  describe("getArenaSetsSortedByDate", () => {
    const mockProcessedCards: ProcessedCard[] = [
      { oracle_id: "1", name: "Card 1", set_code: "BRO" } as ProcessedCard,
      { oracle_id: "2", name: "Card 2", set_code: "DMU" } as ProcessedCard,
    ];

    const mockSetReleaseDates = {
      "BRO": "2022-11-18",
      "DMU": "2022-09-09",
    };

    it("should return sets sorted by date in descending order by default", () => {
      mockScryfallUtils.getUniqueSetCodes.mockReturnValue(["BRO", "DMU"]);
      mockScryfallUtils.sortSetsByReleaseDate.mockReturnValue(["BRO", "DMU"]);

      const result = getArenaSetsSortedByDate(mockProcessedCards, mockSetReleaseDates);

      expect(result).toEqual([
        { setCode: "BRO", releaseDate: "2022-11-18" },
        { setCode: "DMU", releaseDate: "2022-09-09" },
      ]);

      expect(mockScryfallUtils.getUniqueSetCodes).toHaveBeenCalledWith(mockProcessedCards);
      expect(mockScryfallUtils.sortSetsByReleaseDate).toHaveBeenCalledWith(["BRO", "DMU"], mockSetReleaseDates, false);
    });

    it("should return sets sorted by date in ascending order when specified", () => {
      mockScryfallUtils.getUniqueSetCodes.mockReturnValue(["DMU", "BRO"]);
      mockScryfallUtils.sortSetsByReleaseDate.mockReturnValue(["DMU", "BRO"]);

      const result = getArenaSetsSortedByDate(mockProcessedCards, mockSetReleaseDates, true);

      expect(result).toEqual([
        { setCode: "DMU", releaseDate: "2022-09-09" },
        { setCode: "BRO", releaseDate: "2022-11-18" },
      ]);

      expect(mockScryfallUtils.sortSetsByReleaseDate).toHaveBeenCalledWith(["DMU", "BRO"], mockSetReleaseDates, true);
    });

    it("should handle sets with missing release dates", () => {
      mockScryfallUtils.getUniqueSetCodes.mockReturnValue(["BRO", "UNKNOWN"]);
      mockScryfallUtils.sortSetsByReleaseDate.mockReturnValue(["BRO", "UNKNOWN"]);

      const result = getArenaSetsSortedByDate(mockProcessedCards, mockSetReleaseDates);

      expect(result).toEqual([
        { setCode: "BRO", releaseDate: "2022-11-18" },
        { setCode: "UNKNOWN", releaseDate: "1993-01-01" },
      ]);
    });
  });

  describe("generateArenaLegalSetsConstant", () => {
    const mockProcessedCards: ProcessedCard[] = [
      { oracle_id: "1", name: "Card 1", set_code: "BRO" } as ProcessedCard,
      { oracle_id: "2", name: "Card 2", set_code: "DMU" } as ProcessedCard,
    ];

    const mockSetReleaseDates = {
      "BRO": "2022-11-18",
      "DMU": "2022-09-09",
    };

    it("should generate a TypeScript constant string", () => {
      mockScryfallUtils.getUniqueSetCodes.mockReturnValue(["DMU", "BRO"]);
      mockScryfallUtils.sortSetsByReleaseDate.mockReturnValue(["DMU", "BRO"]); // Oldest first

      const result = generateArenaLegalSetsConstant(mockProcessedCards, mockSetReleaseDates);

      expect(result).toContain("// Arena-legal MTG sets with release dates");
      expect(result).toContain("// Generated from Scryfall data");
      expect(result).toContain("export const ARENA_LEGAL_SETS = {");
      expect(result).toContain('"DMU": "2022-09-09"');
      expect(result).toContain('"BRO": "2022-11-18"');
      expect(result).toContain("} as const;");
      expect(result).toContain("export type ArenaLegalSetCode = keyof typeof ARENA_LEGAL_SETS;");

      expect(mockScryfallUtils.getUniqueSetCodes).toHaveBeenCalledWith(mockProcessedCards);
      expect(mockScryfallUtils.sortSetsByReleaseDate).toHaveBeenCalledWith(["DMU", "BRO"], mockSetReleaseDates, true);
    });

    it("should handle sets with missing release dates", () => {
      mockScryfallUtils.getUniqueSetCodes.mockReturnValue(["UNKNOWN"]);
      mockScryfallUtils.sortSetsByReleaseDate.mockReturnValue(["UNKNOWN"]);

      const result = generateArenaLegalSetsConstant(mockProcessedCards, mockSetReleaseDates);

      expect(result).toContain('"UNKNOWN": "1993-01-01"');
    });

    it("should format the constant with proper indentation", () => {
      mockScryfallUtils.getUniqueSetCodes.mockReturnValue(["DMU", "BRO"]);
      mockScryfallUtils.sortSetsByReleaseDate.mockReturnValue(["DMU", "BRO"]);

      const result = generateArenaLegalSetsConstant(mockProcessedCards, mockSetReleaseDates);

      // Check that entries are properly indented
      expect(result).toContain('  "DMU": "2022-09-09"');
      expect(result).toContain('  "BRO": "2022-11-18"');
    });
  });

  describe("findSetsInDateRange", () => {
    const mockSetReleaseDates = {
      "BRO": "2022-11-18",
      "DMU": "2022-09-09",
      "SNC": "2022-04-29",
      "NEO": "2022-02-18",
      "VOW": "2021-11-19",
    };

    it("should find sets within the specified date range", () => {
      const result = findSetsInDateRange("2022-04-01", "2022-10-01", mockSetReleaseDates);

      expect(result).toEqual([
        { setCode: "SNC", releaseDate: "2022-04-29" },
        { setCode: "DMU", releaseDate: "2022-09-09" },
      ]);
    });

    it("should return empty array when no sets are in range", () => {
      const result = findSetsInDateRange("2023-01-01", "2023-12-31", mockSetReleaseDates);

      expect(result).toEqual([]);
    });

    it("should include sets on the boundary dates", () => {
      const result = findSetsInDateRange("2022-04-29", "2022-09-09", mockSetReleaseDates);

      expect(result).toEqual([
        { setCode: "SNC", releaseDate: "2022-04-29" },
        { setCode: "DMU", releaseDate: "2022-09-09" },
      ]);
    });

    it("should return results sorted by release date", () => {
      const result = findSetsInDateRange("2021-01-01", "2022-12-31", mockSetReleaseDates);

      expect(result).toEqual([
        { setCode: "VOW", releaseDate: "2021-11-19" },
        { setCode: "NEO", releaseDate: "2022-02-18" },
        { setCode: "SNC", releaseDate: "2022-04-29" },
        { setCode: "DMU", releaseDate: "2022-09-09" },
        { setCode: "BRO", releaseDate: "2022-11-18" },
      ]);
    });

    it("should handle single date range", () => {
      const result = findSetsInDateRange("2022-09-09", "2022-09-09", mockSetReleaseDates);

      expect(result).toEqual([
        { setCode: "DMU", releaseDate: "2022-09-09" },
      ]);
    });

    it("should handle empty set release dates", () => {
      const result = findSetsInDateRange("2022-01-01", "2022-12-31", {});

      expect(result).toEqual([]);
    });
  });
});
