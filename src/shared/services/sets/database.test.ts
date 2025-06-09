import { SetsDatabaseService } from "./database";

// Mock the Supabase client
jest.mock("../../../services/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from "../../../services/supabase";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe("SetsDatabaseService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock chain
    const mockDelete = jest.fn();
    const mockInsert = jest.fn();
    const mockSelect = jest.fn();
    const mockNeq = jest.fn();
    const mockOrder = jest.fn();
    const mockGte = jest.fn();
    const mockLte = jest.fn();
    const mockLimit = jest.fn();

    mockSupabase.from.mockReturnValue({
      delete: mockDelete,
      insert: mockInsert,
      select: mockSelect,
    } as any);

    mockDelete.mockReturnValue({
      neq: mockNeq,
    } as any);

    mockNeq.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });
    
    mockSelect.mockReturnValue({
      order: mockOrder,
      gte: mockGte,
      lte: mockLte,
      limit: mockLimit,
    } as any);

    mockOrder.mockResolvedValue({ data: [], error: null });
    mockGte.mockReturnValue({ lte: mockLte } as any);
    mockLte.mockReturnValue({ order: mockOrder } as any);
    mockLimit.mockResolvedValue({ data: [], error: null });
  });

  describe("clearExistingSets", () => {
    it("should clear existing sets successfully", async () => {
      const mockDelete = jest.fn().mockReturnValue({
        neq: jest.fn().mockResolvedValue({ error: null }),
      });
      
      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
      } as any);

      await expect(SetsDatabaseService.clearExistingSets()).resolves.toBeUndefined();

      expect(mockSupabase.from).toHaveBeenCalledWith("sets");
      expect(mockDelete).toHaveBeenCalled();
    });

    it("should handle table not existing gracefully", async () => {
      const mockDelete = jest.fn().mockReturnValue({
        neq: jest.fn().mockResolvedValue({
          error: { message: 'relation "public.sets" does not exist' },
        }),
      });
      
      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
      } as any);

      await expect(SetsDatabaseService.clearExistingSets()).resolves.toBeUndefined();
    });

    it("should throw error for other database errors", async () => {
      const mockDelete = jest.fn().mockReturnValue({
        neq: jest.fn().mockResolvedValue({
          error: { message: "Some other database error" },
        }),
      });
      
      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
      } as any);

      await expect(SetsDatabaseService.clearExistingSets()).rejects.toThrow("Failed to clear sets: Some other database error");
    });

    it("should handle unexpected errors", async () => {
      const mockDelete = jest.fn().mockReturnValue({
        neq: jest.fn().mockRejectedValue(new Error("Network error")),
      });
      
      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
      } as any);

      await expect(SetsDatabaseService.clearExistingSets()).rejects.toThrow("Network error");
    });
  });

  describe("saveSets", () => {
    const mockSetReleaseDates = {
      "BRO": "2022-11-18",
      "DMU": "2022-09-09",
      "SNC": "2022-04-29",
    };

    it("should save sets successfully", async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null });
      
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      } as any);

      const result = await SetsDatabaseService.saveSets(mockSetReleaseDates);

      expect(result).toEqual({
        success: true,
        totalSaved: 3,
        errors: [],
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("sets");
      expect(mockInsert).toHaveBeenCalledWith([
        {
          set_code: "BRO",
          name: "BRO",
          released_at: "2022-11-18",
          set_type: null,
          digital: false,
        },
        {
          set_code: "DMU",
          name: "DMU",
          released_at: "2022-09-09",
          set_type: null,
          digital: false,
        },
        {
          set_code: "SNC",
          name: "SNC",
          released_at: "2022-04-29",
          set_type: null,
          digital: false,
        },
      ]);
    });

    it("should handle batch insertion errors", async () => {
      const mockInsert = jest.fn().mockResolvedValue({
        error: { message: "Batch insertion failed" },
      });
      
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      } as any);

      const result = await SetsDatabaseService.saveSets(mockSetReleaseDates);

      expect(result).toEqual({
        success: false,
        totalSaved: 0,
        errors: ["Batch 1: Batch insertion failed"],
      });
    });

    it("should handle empty set data", async () => {
      const result = await SetsDatabaseService.saveSets({});

      expect(result).toEqual({
        success: true,
        totalSaved: 0,
        errors: [],
      });
    });

    it("should handle sets with null release dates", async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null });
      
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      } as any);

      const setsWithNullDate = { "TEST": "" };
      const result = await SetsDatabaseService.saveSets(setsWithNullDate);

      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith([
        {
          set_code: "TEST",
          name: "TEST",
          released_at: null,
          set_type: null,
          digital: false,
        },
      ]);
    });

    it("should handle unexpected errors during save", async () => {
      const mockInsert = jest.fn().mockRejectedValue(new Error("Network error"));
      
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      } as any);

      const result = await SetsDatabaseService.saveSets(mockSetReleaseDates);

      expect(result).toEqual({
        success: false,
        totalSaved: 0,
        errors: ["Batch 1: Network error"],
      });
    });
  });

  describe("getSetReleaseDates", () => {
    it("should fetch set release dates successfully", async () => {
      const mockData = [
        { set_code: "BRO", released_at: "2022-11-18" },
        { set_code: "DMU", released_at: "2022-09-09" },
        { set_code: "SNC", released_at: null },
      ];

      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await SetsDatabaseService.getSetReleaseDates();

      expect(result).toEqual({
        "BRO": "2022-11-18",
        "DMU": "2022-09-09",
        "SNC": "1993-01-01", // Default for null dates
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("sets");
      expect(mockSelect).toHaveBeenCalledWith("set_code, released_at");
    });

    it("should handle database errors", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Database connection failed" },
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      await expect(SetsDatabaseService.getSetReleaseDates()).rejects.toThrow("Failed to fetch sets: Database connection failed");
    });

    it("should handle empty data", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await SetsDatabaseService.getSetReleaseDates();

      expect(result).toEqual({});
    });

    it("should handle null data response", async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await SetsDatabaseService.getSetReleaseDates();

      expect(result).toEqual({});
    });
  });

  describe("getSetsInDateRange", () => {
    it("should fetch sets within date range successfully", async () => {
      const mockData = [
        {
          set_code: "DMU",
          name: "Dominaria United",
          released_at: "2022-09-09",
          set_type: "expansion",
          digital: false,
        },
        {
          set_code: "BRO",
          name: "The Brothers' War",
          released_at: "2022-11-18",
          set_type: "expansion",
          digital: false,
        },
      ];

      const mockOrder = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockLte = jest.fn().mockReturnValue({ order: mockOrder });
      const mockGte = jest.fn().mockReturnValue({ lte: mockLte });
      const mockSelect = jest.fn().mockReturnValue({ gte: mockGte });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await SetsDatabaseService.getSetsInDateRange("2022-09-01", "2022-12-01");

      expect(result).toEqual([
        {
          setCode: "DMU",
          name: "Dominaria United",
          releaseDate: "2022-09-09",
          setType: "expansion",
          digital: false,
        },
        {
          setCode: "BRO",
          name: "The Brothers' War",
          releaseDate: "2022-11-18",
          setType: "expansion",
          digital: false,
        },
      ]);

      expect(mockSelect).toHaveBeenCalledWith("set_code, name, released_at, set_type, digital");
      expect(mockGte).toHaveBeenCalledWith("released_at", "2022-09-01");
      expect(mockLte).toHaveBeenCalledWith("released_at", "2022-12-01");
    });

    it("should handle sets with null values", async () => {
      const mockData = [
        {
          set_code: "TEST",
          name: "Test Set",
          released_at: null,
          set_type: null,
          digital: null,
        },
      ];

      const mockOrder = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockLte = jest.fn().mockReturnValue({ order: mockOrder });
      const mockGte = jest.fn().mockReturnValue({ lte: mockLte });
      const mockSelect = jest.fn().mockReturnValue({ gte: mockGte });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await SetsDatabaseService.getSetsInDateRange("2022-01-01", "2022-12-31");

      expect(result).toEqual([
        {
          setCode: "TEST",
          name: "Test Set",
          releaseDate: "1993-01-01", // Default for null
          setType: null,
          digital: false, // Default for null
        },
      ]);
    });

    it("should handle database errors", async () => {
      const mockOrder = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Query failed" },
      });
      const mockLte = jest.fn().mockReturnValue({ order: mockOrder });
      const mockGte = jest.fn().mockReturnValue({ lte: mockLte });
      const mockSelect = jest.fn().mockReturnValue({ gte: mockGte });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      await expect(SetsDatabaseService.getSetsInDateRange("2022-01-01", "2022-12-31")).rejects.toThrow("Failed to fetch sets in date range: Query failed");
    });
  });

  describe("getMostRecentSet", () => {
    it("should fetch the most recent set successfully", async () => {
      const mockData = [
        {
          set_code: "BRO",
          name: "The Brothers' War",
          released_at: "2022-11-18",
        },
      ];

      const mockLimit = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await SetsDatabaseService.getMostRecentSet();

      expect(result).toEqual({
        setCode: "BRO",
        name: "The Brothers' War",
        releaseDate: "2022-11-18",
      });

      expect(mockSelect).toHaveBeenCalledWith("set_code, name, released_at");
      expect(mockOrder).toHaveBeenCalledWith("released_at", { ascending: false });
      expect(mockLimit).toHaveBeenCalledWith(1);
    });

    it("should return null when no sets are found", async () => {
      const mockLimit = jest.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await SetsDatabaseService.getMostRecentSet();

      expect(result).toBeNull();
    });

    it("should return null when data is null", async () => {
      const mockLimit = jest.fn().mockResolvedValue({ data: null, error: null });
      const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await SetsDatabaseService.getMostRecentSet();

      expect(result).toBeNull();
    });

    it("should handle sets with null release dates", async () => {
      const mockData = [
        {
          set_code: "TEST",
          name: "Test Set",
          released_at: null,
        },
      ];

      const mockLimit = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await SetsDatabaseService.getMostRecentSet();

      expect(result).toEqual({
        setCode: "TEST",
        name: "Test Set",
        releaseDate: "1993-01-01", // Default for null
      });
    });

    it("should handle database errors", async () => {
      const mockLimit = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Query failed" },
      });
      const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      await expect(SetsDatabaseService.getMostRecentSet()).rejects.toThrow("Failed to fetch most recent set: Query failed");
    });
  });
});
