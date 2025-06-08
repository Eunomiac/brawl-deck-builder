// Scryfall Debug Control Panel
// Development-only component for debugging Scryfall data operations

import React, { useState, useRef, useEffect } from "react";
import { ScryfallDebugger, type DebugSummary } from "../../services/scryfall/debug";
import type { Json } from "../../../services/supabase/types";

// Database card type (matches the debug service)
type DatabaseCard = {
  oracle_id: string | null;
  name: string | null;
  mana_cost: string | null;
  cmc: number | null;
  type_line: string | null;
  oracle_text: string | null;
  colors: string[] | null;
  color_identity: string[] | null;
  rarity: string | null;
  set_code: string | null;
  can_be_commander: boolean | null;
  can_be_companion: boolean | null;
  companion_restriction: string | null;
  image_uris: Json;
  scryfall_uri: string | null;
};

interface DebugResult {
  type: "success" | "error" | "info";
  title: string;
  content: string;
  timestamp: Date;
}

export const ScryfallDebugPanel: React.FC = () => {
  // State for various debug operations
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLimit, setSearchLimit] = useState(10);
  const [watchTerm, setWatchTerm] = useState("");
  const [currentWatchTerm, setCurrentWatchTerm] = useState<string | null>(null);
  const [results, setResults] = useState<DebugResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  interface DebugFilterCriteria {
    rarity: string;
    colors: string[];
    canBeCommander: boolean | undefined;
    canBeCompanion: boolean | undefined;
    setCode: string;
    cmcMin: number | undefined;
    cmcMax: number | undefined;
  }

  // Filter criteria state
  const [filterCriteria, setFilterCriteria] = useState<DebugFilterCriteria>({
    rarity: "",
    colors: [] as string[],
    canBeCommander: undefined as boolean | undefined,
    canBeCompanion: undefined as boolean | undefined,
    setCode: "",
    cmcMin: undefined as number | undefined,
    cmcMax: undefined as number | undefined
  });

  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new results are added
  useEffect(() => {
    if (resultsRef.current) {
      resultsRef.current.scrollTop = resultsRef.current.scrollHeight;
    }
  }, [results]);

  // Check current watch term on component mount
  useEffect(() => {
    const currentWatch = ScryfallDebugger.getWatchCard();
    setCurrentWatchTerm(currentWatch);
    if (currentWatch) {
      setWatchTerm(currentWatch);
    }
  }, []);

  const addResult = (result: Omit<DebugResult, "timestamp">) => {
    setResults(prev => [...prev, { ...result, timestamp: new Date() }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const formatCardData = (cards: DatabaseCard[]): string => {
    if (cards.length === 0) return "No cards found.";

    return cards.map(card =>
      `${card.name} (${card.set_code}) - ${card.rarity} - CMC ${card.cmc}${card.can_be_commander ? " [Commander]" : ""}${card.can_be_companion ? " [Companion]" : ""}`
    ).join("\n");
  };

  const formatSummaryData = (summary: DebugSummary): string => {
    return `Total Cards: ${summary.totalCards}
Commanders: ${summary.commanders}
Companions: ${summary.companions}

By Rarity:
${Object.entries(summary.byRarity).map(([rarity, count]) => `  ${rarity}: ${count}`).join("\n")}

By Color Identity (top 10):
${Object.entries(summary.byColorIdentity)
  .sort(([,a], [,b]) => (b) - (a))
  .slice(0, 10)
  .map(([colors, count]) => `  ${colors || "Colorless"}: ${count}`)
  .join("\n")}

Top 10 Sets:
${Object.entries(summary.bySets)
  .sort(([,a], [,b]) => (b) - (a))
  .slice(0, 10)
  .map(([set, count]) => `  ${set}: ${count}`)
  .join("\n")}`;
  };

  // Debug operation handlers
  const handleGetImportSummary = async () => {
    setIsLoading(true);
    try {
      const { summary, error } = await ScryfallDebugger.getImportSummary();

      if (error) {
        addResult({
          type: "error",
          title: "Import Summary Error",
          content: error
        });
      } else {
        addResult({
          type: "success",
          title: "Import Summary",
          content: formatSummaryData(summary)
        });
      }
    } catch (err) {
      addResult({
        type: "error",
        title: "Import Summary Error",
        content: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchCards = async () => {
    if (!searchTerm.trim()) {
      addResult({
        type: "error",
        title: "Search Error",
        content: "Please enter a search term"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { cards, error } = await ScryfallDebugger.searchCardsByName(searchTerm, searchLimit);

      if (error) {
        addResult({
          type: "error",
          title: "Card Search Error",
          content: error
        });
      } else {
        addResult({
          type: "success",
          title: `Card Search Results for "${searchTerm}" (${cards.length} found)`,
          content: formatCardData(cards)
        });
      }
    } catch (err) {
      addResult({
        type: "error",
        title: "Card Search Error",
        content: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterCards = async () => {
    setIsLoading(true);
    try {
      // Build criteria object, excluding empty/undefined values
      const criteria: Partial<DebugFilterCriteria> = {};
      if (filterCriteria.rarity) criteria.rarity = filterCriteria.rarity;
      if (filterCriteria.colors.length > 0) criteria.colors = filterCriteria.colors;
      if (filterCriteria.canBeCommander !== undefined) criteria.canBeCommander = filterCriteria.canBeCommander;
      if (filterCriteria.canBeCompanion !== undefined) criteria.canBeCompanion = filterCriteria.canBeCompanion;
      if (filterCriteria.setCode) criteria.setCode = filterCriteria.setCode;
      if (filterCriteria.cmcMin !== undefined) criteria.cmcMin = filterCriteria.cmcMin;
      if (filterCriteria.cmcMax !== undefined) criteria.cmcMax = filterCriteria.cmcMax;

      const { cards, error } = await ScryfallDebugger.getCardsByCriteria(criteria, 100);

      if (error) {
        addResult({
          type: "error",
          title: "Filter Cards Error",
          content: error
        });
      } else {
        addResult({
          type: "success",
          title: `Filtered Cards (${cards.length} found)`,
          content: formatCardData(cards)
        });
      }
    } catch (err) {
      addResult({
        type: "error",
        title: "Filter Cards Error",
        content: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetWatchCard = () => {
    if (!watchTerm.trim()) {
      addResult({
        type: "error",
        title: "Watch Card Error",
        content: "Please enter a watch term"
      });
      return;
    }

    ScryfallDebugger.setWatchCard(watchTerm);
    setCurrentWatchTerm(watchTerm);
    addResult({
      type: "info",
      title: "Watch Card Set",
      content: `Watch card set to: "${watchTerm}"\nVerbose debugging will be enabled for matching cards during import.`
    });
  };

  const handleClearWatchCard = () => {
    ScryfallDebugger.clearWatchCard();
    setCurrentWatchTerm(null);
    addResult({
      type: "info",
      title: "Watch Card Cleared",
      content: "Watch card debugging has been disabled."
    });
  };

  const handleExportAllCards = async () => {
    setIsLoading(true);
    try {
      const { success, error } = await ScryfallDebugger.exportCardsToJSON();

      if (error) {
        addResult({
          type: "error",
          title: "Export Error",
          content: error
        });
      } else if (success) {
        addResult({
          type: "success",
          title: "Export Complete",
          content: "All cards exported to JSON file. Check your downloads folder."
        });
      }
    } catch (err) {
      addResult({
        type: "error",
        title: "Export Error",
        content: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCommanders = async () => {
    setIsLoading(true);
    try {
      const { success, error } = await ScryfallDebugger.exportCardsToJSON(
        { canBeCommander: true },
        "commanders.json"
      );

      if (error) {
        addResult({
          type: "error",
          title: "Export Error",
          content: error
        });
      } else if (success) {
        addResult({
          type: "success",
          title: "Export Complete",
          content: "Commander cards exported to commanders.json. Check your downloads folder."
        });
      }
    } catch (err) {
      addResult({
        type: "error",
        title: "Export Error",
        content: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="scryfall-debug-panel">
      <div className="debug-header">
        <h2>🔧 Scryfall Debug Control Panel</h2>
        <p className="debug-subtitle">
          Development tools for debugging Scryfall data operations
        </p>
      </div>

      <div className="debug-content">
        <div className="debug-controls">
          {/* Import Summary Section */}
          <div className="debug-section">
            <h3>📊 Import Summary</h3>
            <button
              className="btn-primary"
              onClick={handleGetImportSummary}
              disabled={isLoading}
            >
              Get Import Summary
            </button>
          </div>

          {/* Card Search Section */}
          <div className="debug-section">
            <h3>🔍 Card Search</h3>
            <div className="debug-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Search term (e.g., Lightning)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="debug-input"
                />
                <input
                  type="number"
                  placeholder="Limit"
                  value={searchLimit}
                  onChange={(e) => setSearchLimit(Number(e.target.value))}
                  className="debug-input-small"
                  min="1"
                  max="100"
                />
                <button
                  className="btn-secondary"
                  onClick={handleSearchCards}
                  disabled={isLoading}
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Card Filter Section */}
          <div className="debug-section">
            <h3>🎯 Filter Cards</h3>
            <div className="debug-form">
              <div className="form-row">
                <select
                  value={filterCriteria.rarity}
                  onChange={(e) => setFilterCriteria(prev => ({ ...prev, rarity: e.target.value }))}
                  className="debug-select"
                >
                  <option value="">Any Rarity</option>
                  <option value="common">Common</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="rare">Rare</option>
                  <option value="mythic">Mythic</option>
                </select>
                <input
                  type="text"
                  placeholder="Set Code (e.g., BRO)"
                  value={filterCriteria.setCode}
                  onChange={(e) => setFilterCriteria(prev => ({ ...prev, setCode: e.target.value }))}
                  className="debug-input-small"
                />
              </div>
              <div className="form-row">
                <input
                  type="number"
                  placeholder="Min CMC"
                  value={filterCriteria.cmcMin ?? ""}
                  onChange={(e) => setFilterCriteria(prev => ({
                    ...prev,
                    cmcMin: e.target.value ? Number(e.target.value) : undefined
                  }))}
                  className="debug-input-small"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Max CMC"
                  value={filterCriteria.cmcMax ?? ""}
                  onChange={(e) => setFilterCriteria(prev => ({
                    ...prev,
                    cmcMax: e.target.value ? Number(e.target.value) : undefined
                  }))}
                  className="debug-input-small"
                  min="0"
                />
                <select
                  value={filterCriteria.canBeCommander === undefined ? "" : String(filterCriteria.canBeCommander)}
                  onChange={(e) => setFilterCriteria(prev => ({
                    ...prev,
                    canBeCommander: e.target.value === "" ? undefined : e.target.value === "true"
                  }))}
                  className="debug-select"
                >
                  <option value="">Any Commander Status</option>
                  <option value="true">Commanders Only</option>
                  <option value="false">Non-Commanders Only</option>
                </select>
              </div>
              <div className="form-row">
                <select
                  value={filterCriteria.canBeCompanion === undefined ? "" : String(filterCriteria.canBeCompanion)}
                  onChange={(e) => setFilterCriteria(prev => ({
                    ...prev,
                    canBeCompanion: e.target.value === "" ? undefined : e.target.value === "true"
                  }))}
                  className="debug-select"
                >
                  <option value="">Any Companion Status</option>
                  <option value="true">Companions Only</option>
                  <option value="false">Non-Companions Only</option>
                </select>
                <button
                  className="btn-secondary"
                  onClick={handleFilterCards}
                  disabled={isLoading}
                >
                  Filter Cards
                </button>
              </div>
            </div>
          </div>

          {/* Watch Card Section */}
          <div className="debug-section">
            <h3>👁️ Watch Card Debugging</h3>
            <div className="debug-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Watch term (e.g., Lightning)"
                  value={watchTerm}
                  onChange={(e) => setWatchTerm(e.target.value)}
                  className="debug-input"
                />
                <button
                  className="btn-secondary"
                  onClick={handleSetWatchCard}
                  disabled={isLoading}
                >
                  Set Watch
                </button>
                <button
                  className="btn-danger"
                  onClick={handleClearWatchCard}
                  disabled={isLoading}
                >
                  Clear Watch
                </button>
              </div>
              {currentWatchTerm && (
                <div className="watch-status">
                  Currently watching: <strong>"{currentWatchTerm}"</strong>
                </div>
              )}
            </div>
          </div>

          {/* Export Section */}
          <div className="debug-section">
            <h3>📤 Export Data</h3>
            <div className="debug-form">
              <div className="form-row">
                <button
                  className="btn-secondary"
                  onClick={handleExportAllCards}
                  disabled={isLoading}
                >
                  Export All Cards
                </button>
                <button
                  className="btn-secondary"
                  onClick={handleExportCommanders}
                  disabled={isLoading}
                >
                  Export Commanders
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Display */}
        <div className="debug-results">
          <div className="results-header">
            <h3>📋 Results</h3>
            <button
              className="btn-small"
              onClick={clearResults}
            >
              Clear
            </button>
          </div>
          <div className="results-content" ref={resultsRef}>
            {results.length === 0 ? (
              <div className="no-results">
                No debug operations performed yet. Use the controls above to start debugging.
              </div>
            ) : (
              results.map((result, index) => (
                <div key={`result-${result.timestamp.getTime()}-${index}`} className={`result-item result-${result.type}`}>
                  <div className="result-header">
                    <span className="result-title">{result.title}</span>
                    <span className="result-timestamp">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="result-content">{result.content}</pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
