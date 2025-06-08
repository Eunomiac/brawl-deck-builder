// Scryfall Debug Panel Component Tests
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ScryfallDebugPanel } from "./ScryfallDebugPanel";

// Mock the ScryfallDebugger before importing
jest.mock("../../services/scryfall/debug", () => ({
  ScryfallDebugger: {
    getImportSummary: jest.fn(),
    searchCardsByName: jest.fn(),
    getCardsByCriteria: jest.fn(),
    exportCardsToJSON: jest.fn(),
    getWatchCard: jest.fn(),
    setWatchCard: jest.fn(),
    clearWatchCard: jest.fn(),
  }
}));

import { ScryfallDebugger } from "../../services/scryfall/debug";
const mockScryfallDebugger = ScryfallDebugger as jest.Mocked<typeof ScryfallDebugger>;

describe("ScryfallDebugPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    mockScryfallDebugger.getImportSummary.mockResolvedValue({
      summary: {
        totalCards: 100,
        commanders: 10,
        companions: 5,
        byRarity: { common: 50, uncommon: 30, rare: 15, mythic: 5 },
        byColorIdentity: { "": 20, "W": 15, "U": 15, "B": 15, "R": 15, "G": 15, "WU": 5 },
        bySets: { "BRO": 50, "DMU": 30, "SNC": 20 },
        cmcDistribution: { 0: 10, 1: 20, 2: 25, 3: 20, 4: 15, 5: 10 }
      }
    });

    mockScryfallDebugger.searchCardsByName.mockResolvedValue({
      cards: [
        {
          oracle_id: "test-id",
          name: "Lightning Bolt",
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
          companion_restriction: null,
          image_uris: {},
          scryfall_uri: "https://scryfall.com/card/test"
        }
      ]
    });

    mockScryfallDebugger.getCardsByCriteria.mockResolvedValue({
      cards: []
    });

    mockScryfallDebugger.exportCardsToJSON.mockResolvedValue({
      success: true
    });

    mockScryfallDebugger.getWatchCard.mockReturnValue(null);
  });

  it("should render the debug panel header", () => {
    render(<ScryfallDebugPanel />);

    expect(screen.getByText("🔧 Scryfall Debug Control Panel")).toBeInTheDocument();
    expect(screen.getByText("Development tools for debugging Scryfall data operations")).toBeInTheDocument();
  });

  it("should render all debug sections", () => {
    render(<ScryfallDebugPanel />);

    expect(screen.getByText("📊 Import Summary")).toBeInTheDocument();
    expect(screen.getByText("🔍 Card Search")).toBeInTheDocument();
    expect(screen.getByText("🎯 Filter Cards")).toBeInTheDocument();
    expect(screen.getByText("👁️ Watch Card Debugging")).toBeInTheDocument();
    expect(screen.getByText("📤 Export Data")).toBeInTheDocument();
  });

  it("should handle import summary button click", async () => {
    render(<ScryfallDebugPanel />);

    const summaryButton = screen.getByText("Get Import Summary");
    fireEvent.click(summaryButton);

    await waitFor(() => {
      expect(mockScryfallDebugger.getImportSummary).toHaveBeenCalled();
    });

    // Check that results are displayed
    await waitFor(() => {
      expect(screen.getByText("Import Summary")).toBeInTheDocument();
    });
  });

  it("should handle card search", async () => {
    render(<ScryfallDebugPanel />);

    const searchInput = screen.getByPlaceholderText("Search term (e.g., Lightning)");
    const searchButton = screen.getByText("Search");

    fireEvent.change(searchInput, { target: { value: "Lightning" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockScryfallDebugger.searchCardsByName).toHaveBeenCalledWith("Lightning", 10);
    });
  });

  it("should handle watch card operations", async () => {
    render(<ScryfallDebugPanel />);

    const watchInput = screen.getByPlaceholderText("Watch term (e.g., Lightning)");
    const setWatchButton = screen.getByText("Set Watch");

    fireEvent.change(watchInput, { target: { value: "Lightning" } });
    fireEvent.click(setWatchButton);

    expect(mockScryfallDebugger.setWatchCard).toHaveBeenCalledWith("Lightning");
  });

  it("should handle export operations", async () => {
    render(<ScryfallDebugPanel />);

    const exportAllButton = screen.getByText("Export All Cards");
    fireEvent.click(exportAllButton);

    await waitFor(() => {
      expect(mockScryfallDebugger.exportCardsToJSON).toHaveBeenCalled();
    });
  });

  it("should clear results when clear button is clicked", () => {
    render(<ScryfallDebugPanel />);

    const clearButton = screen.getByText("Clear");
    fireEvent.click(clearButton);

    // Should show the no results message
    expect(screen.getByText("No debug operations performed yet. Use the controls above to start debugging.")).toBeInTheDocument();
  });

  it("should handle search term validation", async () => {
    render(<ScryfallDebugPanel />);

    const searchButton = screen.getByText("Search");
    fireEvent.click(searchButton);

    // Should show error for empty search term
    await waitFor(() => {
      expect(screen.getByText("Search Error")).toBeInTheDocument();
    });
  });

  it("should handle watch term validation", async () => {
    render(<ScryfallDebugPanel />);

    const setWatchButton = screen.getByText("Set Watch");
    fireEvent.click(setWatchButton);

    // Should show error for empty watch term
    await waitFor(() => {
      expect(screen.getByText("Watch Card Error")).toBeInTheDocument();
    });
  });
});
