// Scryfall Debug Control Panel
// Development-only component for debugging Scryfall data operations

import React, { useState, useRef, useEffect } from "react";
import { ScryfallDebugger, type DebugSummary } from "../../services/scryfall/debug";
import type { Json } from "../../../services/supabase/types";
import { supabase } from "../../../services/supabase";

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

interface DatabaseQueryResult {
  data: Json[] | null;
  count: number;
  error?: string;
  query: string;
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

  // Database query state
  const [sqlSelect, setSqlSelect] = useState("oracle_id,scryfall_id,name,rarity,cmc");
  const [sqlFilter, setSqlFilter] = useState("");
  const [dbQueryResult, setDbQueryResult] = useState<DatabaseQueryResult | null>(null);

  // Scryfall ID query state
  const [scryfallId, setScryfallId] = useState("");
  const [scryfallQueryResult, setScryfallQueryResult] = useState<DatabaseQueryResult | null>(null);

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

  const renderDatabaseResults = (queryResult: DatabaseQueryResult) => {
    if (queryResult.error) {
      return (
        <div className="database-error">
          <strong>Error:</strong> {queryResult.error}
        </div>
      );
    }

    if (queryResult.data && queryResult.data.length > 0) {
      return (
        <pre className="database-data">
          {JSON.stringify(queryResult.data, null, 2)}
        </pre>
      );
    }

    return (
      <div className="no-database-results">
        No data returned from query.
      </div>
    );
  };

  const renderScryfallResults = (queryResult: DatabaseQueryResult) => {
    if (queryResult.error) {
      return (
        <div className="database-error">
          <strong>Error:</strong> {queryResult.error}
        </div>
      );
    }

    if (queryResult.data && queryResult.data.length > 0) {
      return (
        <pre className="database-data">
          {JSON.stringify(queryResult.data, null, 2)}
        </pre>
      );
    }

    return (
      <div className="no-database-results">
        No results found for this ID.
      </div>
    );
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

  const handleDatabaseQuery = async () => {
    if (!sqlSelect.trim()) {
      addResult({
        type: "error",
        title: "Database Query Error",
        content: "Please enter columns to select (e.g., *, name, rarity, cmc)"
      });
      return;
    }

    setIsLoading(true);
    try {
      let query = supabase.from("cards").select(sqlSelect.trim());
      let queryDescription = `SELECT ${sqlSelect.trim()} FROM cards`;

      // Apply filters if provided
      if (sqlFilter.trim()) {
        const filters = sqlFilter.trim().split(",");
        for (const filter of filters) {
          const trimmedFilter = filter.trim();
          if (trimmedFilter.includes(".eq.")) {
            const [field, value] = trimmedFilter.split(".eq.");
            query = query.eq(field.trim(), value.trim());
            queryDescription += ` WHERE ${field.trim()} = '${value.trim()}'`;
          } else if (trimmedFilter.includes(".neq.")) {
            const [field, value] = trimmedFilter.split(".neq.");
            query = query.neq(field.trim(), value.trim());
            queryDescription += ` WHERE ${field.trim()} != '${value.trim()}'`;
          } else if (trimmedFilter.includes(".gt.")) {
            const [field, value] = trimmedFilter.split(".gt.");
            query = query.gt(field.trim(), parseInt(value.trim()));
            queryDescription += ` WHERE ${field.trim()} > ${value.trim()}`;
          } else if (trimmedFilter.includes(".lt.")) {
            const [field, value] = trimmedFilter.split(".lt.");
            query = query.lt(field.trim(), parseInt(value.trim()));
            queryDescription += ` WHERE ${field.trim()} < ${value.trim()}`;
          }
        }
      }

      const result = await query.limit(100);

      const queryResult: DatabaseQueryResult = {
        data: result.data as Json[] | null,
        count: result.data?.length ?? 0,
        error: result.error?.message,
        query: `${queryDescription} LIMIT 100`,
        timestamp: new Date()
      };

      setDbQueryResult(queryResult);

      if (result.error) {
        addResult({
          type: "error",
          title: "Database Query Error",
          content: result.error.message
        });
      } else {
        addResult({
          type: "success",
          title: "Database Query Executed",
          content: `Query executed successfully. ${queryResult.count} records returned. ${queryResult.count > 0 ? "Database results panel is now visible on the right." : ""}`
        });
      }
    } catch (err) {
      addResult({
        type: "error",
        title: "Database Query Error",
        content: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOracleIdQuery = async () => {
    console.log("🔍 Oracle ID Query started with ID:", scryfallId);

    if (!scryfallId.trim()) {
      addResult({
        type: "error",
        title: "Oracle ID Query Error",
        content: "Please enter an Oracle ID"
      });
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://api.scryfall.com/cards/search?q=oracle_id:${scryfallId.trim()}+game:arena`;
      console.log("🔍 Making Oracle ID request to:", url);

      // Query Scryfall API for all printings of this oracle ID
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Scryfall API error: ${response.status} ${response.statusText}`);
      }

      const scryfallData = await response.json();

      const queryResult: DatabaseQueryResult = {
        data: scryfallData.data ?? [],
        count: scryfallData.data?.length ?? 0,
        error: scryfallData.object === "error" ? scryfallData.details : undefined,
        query: `Scryfall API: oracle_id:${scryfallId.trim()}+game:arena`,
        timestamp: new Date()
      };

      setScryfallQueryResult(queryResult);

      if (scryfallData.object === "error") {
        addResult({
          type: "error",
          title: "Oracle ID Query Error",
          content: scryfallData.details ?? "Unknown Scryfall API error"
        });
      } else {
        addResult({
          type: "success",
          title: "Oracle ID Query Executed",
          content: `Found ${queryResult.count} Arena-playable printings. ${queryResult.count > 0 ? "Scryfall results panel is now visible on the right." : ""}`
        });
      }
    } catch (err) {
      addResult({
        type: "error",
        title: "Oracle ID Query Error",
        content: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScryfallIdQuery = async () => {
    console.log("🔮 Scryfall ID Query started with ID:", scryfallId);

    if (!scryfallId.trim()) {
      addResult({
        type: "error",
        title: "Scryfall ID Query Error",
        content: "Please enter a Scryfall ID"
      });
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://api.scryfall.com/cards/${scryfallId.trim()}`;
      console.log("🔮 Making request to:", url);

      // Query Scryfall API for this specific card ID
      const response = await fetch(url);
      console.log("🔮 Response status:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Scryfall API error: ${response.status} ${response.statusText}`);
      }

      const scryfallData = await response.json();
      console.log("🔮 Scryfall data received:", scryfallData);

      const queryResult: DatabaseQueryResult = {
        data: [scryfallData], // Single card result
        count: 1,
        error: scryfallData.object === "error" ? scryfallData.details : undefined,
        query: `Scryfall API: /cards/${scryfallId.trim()}`,
        timestamp: new Date()
      };

      console.log("🔮 Setting query result:", queryResult);
      setScryfallQueryResult(queryResult);

      if (scryfallData.object === "error") {
        addResult({
          type: "error",
          title: "Scryfall ID Query Error",
          content: scryfallData.details ?? "Unknown Scryfall API error"
        });
      } else {
        addResult({
          type: "success",
          title: "Scryfall ID Query Executed",
          content: `Found card: ${scryfallData.name}. Scryfall results panel is now visible on the right.`
        });
      }
    } catch (err) {
      console.error("🔮 Scryfall ID Query error:", err);
      addResult({
        type: "error",
        title: "Scryfall ID Query Error",
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

      <div className={`debug-content ${dbQueryResult || scryfallQueryResult ? "three-panel" : ""}`}>


        <div className="debug-controls">

          {/* Database Query Section */}
          <div className="debug-section">
            <h3>🗄️ Database Query</h3>
            <div className="debug-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Columns (e.g., oracle_id,scryfall_id,name,rarity,cmc)"
                  value={sqlSelect}
                  onChange={(e) => setSqlSelect(e.target.value)}
                  className="debug-input"
                />
                <input
                  type="text"
                  placeholder="Filters (e.g., rarity.eq.mythic, cmc.gt.5)"
                  value={sqlFilter}
                  onChange={(e) => setSqlFilter(e.target.value)}
                  className="debug-input"
                />
                <button
                  className="btn-secondary"
                  onClick={handleDatabaseQuery}
                  disabled={isLoading}
                >
                  Submit
                </button>
              </div>
              <div className="form-helper">
                Query: <code>SELECT {sqlSelect || "*"} FROM cards{sqlFilter ? ` WHERE ${sqlFilter}` : ""} LIMIT 100</code>
                <br />
                <small>
                  <strong>Operators:</strong> .eq. (equals), .neq. (not equals), .gt. (greater), .lt. (less), .gte. (≥), .lte. (≤)
                  <br />
                  <strong>Logic:</strong> Use commas for AND logic (e.g., rarity.eq.mythic,cmc.gt.5). OR logic requires separate queries.
                </small>
              </div>
            </div>
          </div>

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

        {/* Database Results Panel */}
        <div className="debug-controls">
        {dbQueryResult && (
          <div className="debug-database-results">
            <div className="results-header">
              <h3>🗄️ Database Results</h3>
              <button
                className="btn-small"
                onClick={() => setDbQueryResult(null)}
              >
                Close
              </button>
            </div>
            <div className="database-query-info">
              <strong>Query:</strong> {dbQueryResult.query}
              <br />
              <strong>Count:</strong> {dbQueryResult.count} records
              <br />
              <strong>Executed:</strong> {dbQueryResult.timestamp.toLocaleTimeString()}
            </div>
            <div className="database-results-content">
              {renderDatabaseResults(dbQueryResult)}
            </div>
          </div>
        )}
        </div>

        {/* Oracle ID Column */}
        <div className="debug-oracle-column">

          {/* Oracle ID Query Section */}
          <div className="debug-section">
            <h3>� Oracle ID Lookup</h3>
            <div className="debug-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="ID (Oracle ID or Scryfall ID)"
                  value={scryfallId}
                  onChange={(e) => setScryfallId(e.target.value)}
                  className="debug-input"
                />
                <button
                  className="btn-secondary"
                  onClick={handleOracleIdQuery}
                  disabled={isLoading}
                >
                  Oracle ID
                </button>
                <button
                  className="btn-secondary"
                  onClick={handleScryfallIdQuery}
                  disabled={isLoading}
                >
                  ID
                </button>
              </div>
              <div className="form-helper">
                <strong>Oracle ID:</strong> Finds all Arena-playable printings of a card (use oracle_id from database)
                <br />
                <strong>ID:</strong> Finds specific card by Scryfall ID (use scryfall_id from database)
              </div>
            </div>
          </div>

          {/* Scryfall Results Panel */}
          {scryfallQueryResult && (
            <div className="debug-database-results">
              <div className="results-header">
                <h3>🔮 Scryfall Results</h3>
                <button
                  className="btn-small"
                  onClick={() => setScryfallQueryResult(null)}
                >
                  Close
                </button>
              </div>
              <div className="database-query-info">
                <strong>Query:</strong> {scryfallQueryResult.query}
                <br />
                <strong>Count:</strong> {scryfallQueryResult.count} results
                <br />
                <strong>Executed:</strong> {scryfallQueryResult.timestamp.toLocaleTimeString()}
              </div>
              <div className="database-results-content">
                {renderScryfallResults(scryfallQueryResult)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
