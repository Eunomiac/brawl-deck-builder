// Card Search Service
// Robust search functionality using normalized search terms

import uFuzzy from "@leeoniya/ufuzzy";
import { supabase } from "../../../services/supabase/client";
import type { Tables } from "../../../services/supabase/types";
import type { PostgrestError } from "@supabase/supabase-js";
import { CardNameNormalizer } from "../../utils/cardNameNormalization";

type DatabaseCard = Tables<"cards">;

export interface SearchResult {
  cards: DatabaseCard[];
  totalCount: number;
  searchTerm: string;
  normalizedSearchTerm: string;
  error?: string;
}

/**
 * Advanced card search service that handles:
 * - Alchemy variants (A- prefix)
 * - Split cards with various separators
 * - Special character normalization
 * - Search term variations
 * - Fuzzy search using uFuzzy for comprehensive matching
 */
export class CardSearchService {
  /**
   * Search for cards using normalized search terms
   */
  static async searchCards(
    searchTerm: string,
    options: {
      limit?: number;
      exactMatch?: boolean; // what does this mean?
      includeVariations?: boolean; // what does this mean?
    } = {}
  ): Promise<SearchResult> {
    const { limit = 50, exactMatch = false } = options;

    if (!searchTerm.trim()) {
      return {
        cards: [],
        totalCount: 0,
        searchTerm,
        normalizedSearchTerm: "",
      };
    }

    try {
      // Check if search term is quoted (exact search)
      const isQuotedSearch = searchTerm.trim().startsWith('"') && searchTerm.trim().endsWith('"');
      const cleanSearchTerm = isQuotedSearch
        ? searchTerm.trim().slice(1, -1) // Remove quotes
        : searchTerm.trim();

      // Normalize the search term for exact matching (aggressive normalization)
      const normalizedSearchTerm = CardNameNormalizer.normalizeForSearch(cleanSearchTerm);

      // Normalize the search term for fuzzy matching (display-friendly normalization)
      const displayNormalizedSearchTerm = CardNameNormalizer.normalizeForDisplay(cleanSearchTerm);

      // Debug logging
      console.log("🔍 Search Debug:");
      console.log(`  Original: "${searchTerm}"`);
      console.log(`  Clean: "${cleanSearchTerm}"`);
      console.log(`  Normalized (exact): "${normalizedSearchTerm}"`);
      console.log(`  Normalized (display): "${displayNormalizedSearchTerm}"`);
      console.log(`  Is quoted: ${isQuotedSearch}`);

      // Search using normalized search key for consistent matching

      // Search directly using the search_key field for better performance
      const query = supabase
        .from("cards")
        .select(`
          id,
          oracle_id,
          original_name,
          name,
          search_key,
          mana_cost,
          cmc,
          type_line,
          oracle_text,
          colors,
          color_identity,
          rarity,
          set_code,
          can_be_commander,
          can_be_companion,
          companion_restriction,
          image_uris,
          back_image_uris,
          display_hints,
          scryfall_uri,
          created_at
        `);

      // Try multiple exact match strategies for comprehensive coverage
      const exactMatchResults = await this.performExactMatches(query, normalizedSearchTerm, limit);
      let { data, error, count } = exactMatchResults;

      // If no exact matches found for unquoted search, try fuzzy search
      if (!isQuotedSearch && !exactMatch && (!data || data.length === 0)) {
        const fuzzySearchResult = await this.performFuzzySearch(displayNormalizedSearchTerm, limit);
        data = fuzzySearchResult.data;
        error = fuzzySearchResult.error;
        count = fuzzySearchResult.count;
      }

      if (error) {
        return {
          cards: [],
          totalCount: 0,
          searchTerm,
          normalizedSearchTerm: normalizedSearchTerm,
          error: error.message,
        };
      }

      // Since we're querying cards directly, no need to extract from nested structure
      const cards = data ?? [];

      // Sort results: prioritize full exact matches, then half-matches, then fuzzy matches
      cards.sort((a, b) => {
        const aSearchKey = a.search_key ?? "";
        const bSearchKey = b.search_key ?? "";

        // Check for full exact matches - highest priority
        const aFullExact = aSearchKey === normalizedSearchTerm;
        const bFullExact = bSearchKey === normalizedSearchTerm;

        if (aFullExact && !bFullExact) return -1;
        if (!aFullExact && bFullExact) return 1;

        // Check for half-matches on double-sided cards - medium priority
        const aHalfMatch = aSearchKey.startsWith(`${normalizedSearchTerm} // `) ||
                          aSearchKey.endsWith(` // ${normalizedSearchTerm}`);
        const bHalfMatch = bSearchKey.startsWith(`${normalizedSearchTerm} // `) ||
                          bSearchKey.endsWith(` // ${normalizedSearchTerm}`);

        if (aHalfMatch && !bHalfMatch) return -1;
        if (!aHalfMatch && bHalfMatch) return 1;

        // For remaining matches (fuzzy), preserve alphabetical order
        if (!aFullExact && !bFullExact && !aHalfMatch && !bHalfMatch) {
          return (a.name || "").localeCompare(b.name || "");
        }

        return 0;
      });

      return {
        cards,
        totalCount: count ?? cards.length,
        searchTerm,
        normalizedSearchTerm: normalizedSearchTerm,
      };

    } catch (error) {
      return {
        cards: [],
        totalCount: 0,
        searchTerm,
        normalizedSearchTerm: CardNameNormalizer.normalizeForSearch(searchTerm.trim()),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Perform exact matches using multiple strategies:
   * 1. Full exact match (search_key = normalizedSearchTerm)
   * 2. First half of double-sided card (search_key LIKE 'normalizedSearchTerm // %')
   * 3. Second half of double-sided card (search_key LIKE '% // normalizedSearchTerm')
   */
  private static async performExactMatches(
    baseQuery: ReturnType<typeof supabase.from>,
    normalizedSearchTerm: string,
    limit: number
  ): Promise<{
    data: DatabaseCard[] | null;
    error: PostgrestError | null;
    count: number;
  }> {
    try {
      // Try full exact match first
      const fullMatchResult = await this.tryExactMatch(baseQuery, normalizedSearchTerm, limit);
      if (fullMatchResult.error) {
        return fullMatchResult;
      }

      if (fullMatchResult.data && fullMatchResult.data.length > 0) {
        return fullMatchResult;
      }

      // Try half-matches for double-sided cards
      const halfMatchResult = await this.tryHalfMatches(baseQuery, normalizedSearchTerm, limit);
      return halfMatchResult;

    } catch (error) {
      console.error("Error in performExactMatches:", error);
      return { data: [], error: null, count: 0 };
    }
  }

  /**
   * Try full exact match
   */
  private static async tryExactMatch(
    baseQuery: ReturnType<typeof supabase.from>,
    normalizedSearchTerm: string,
    limit: number
  ): Promise<{
    data: DatabaseCard[] | null;
    error: PostgrestError | null;
    count: number;
  }> {
    const query = baseQuery.eq("search_key", normalizedSearchTerm);
    const result = await query.order("name").limit(limit);

    if (result.error) {
      return { data: null, error: result.error, count: 0 };
    }

    const cards = (result.data ?? []) as DatabaseCard[];
    return { data: cards, error: null, count: cards.length };
  }

  /**
   * Try half-matches for double-sided cards
   */
  private static async tryHalfMatches(
    baseQuery: ReturnType<typeof supabase.from>,
    normalizedSearchTerm: string,
    limit: number
  ): Promise<{
    data: DatabaseCard[] | null;
    error: PostgrestError | null;
    count: number;
  }> {
    const allResults: DatabaseCard[] = [];
    const seenIds = new Set<string>();

    // Try first half match
    const firstHalfResult = await this.tryHalfMatch(
      baseQuery,
      `${normalizedSearchTerm} // %`,
      limit
    );

    if (firstHalfResult.error) {
      return firstHalfResult;
    }

    this.addUniqueCards(firstHalfResult.data ?? [], allResults, seenIds);

    // Try second half match if we still have room
    if (allResults.length < limit) {
      const secondHalfResult = await this.tryHalfMatch(
        baseQuery,
        `% // ${normalizedSearchTerm}`,
        limit - allResults.length
      );

      if (!secondHalfResult.error) {
        this.addUniqueCards(secondHalfResult.data ?? [], allResults, seenIds);
      }
    }

    return { data: allResults, error: null, count: allResults.length };
  }

  /**
   * Try a single half-match pattern
   */
  private static async tryHalfMatch(
    baseQuery: ReturnType<typeof supabase.from>,
    pattern: string,
    limit: number
  ): Promise<{
    data: DatabaseCard[] | null;
    error: PostgrestError | null;
    count: number;
  }> {
    const query = baseQuery.like("search_key", pattern);
    const result = await query.order("name").limit(limit);

    if (result.error) {
      return { data: null, error: result.error, count: 0 };
    }

    const cards = (result.data ?? []) as DatabaseCard[];
    return { data: cards, error: null, count: cards.length };
  }

  /**
   * Add unique cards to results array
   */
  private static addUniqueCards(
    newCards: DatabaseCard[],
    allResults: DatabaseCard[],
    seenIds: Set<string>
  ): void {
    for (const card of newCards) {
      if (!seenIds.has(card.id)) {
        seenIds.add(card.id);
        allResults.push(card);
      }
    }
  }

  /**
   * Perform fuzzy search using uFuzzy on all cards using display names
   */
  private static async performFuzzySearch(
    displayNormalizedSearchTerm: string,
    limit: number
  ): Promise<{
    data: DatabaseCard[] | null;
    error: PostgrestError | null;
    count: number;
  }> {
    try {
      // Fetch all cards for fuzzy searching
      const { allCards, error } = await this.fetchAllCards();

      if (error) {
        return { data: null, error, count: 0 };
      }

      if (!allCards.length) {
        return { data: [], error: null, count: 0 };
      }

      // Log search debug info
      this.logFuzzySearchDebug(displayNormalizedSearchTerm, allCards);

      // Perform the fuzzy search
      const fuzzyMatches = this.executeFuzzySearch(
        allCards,
        displayNormalizedSearchTerm,
        limit
      );

      return {
        data: fuzzyMatches,
        error: null,
        count: fuzzyMatches.length
      };
    } catch (error) {
      console.error("Error in fuzzy search:", error);
      return { data: [], error: null, count: 0 };
    }
  }

  /**
   * Fetch all cards from the database using pagination
   */
  private static async fetchAllCards(): Promise<{
    allCards: DatabaseCard[];
    error: PostgrestError | null;
  }> {
    const allCards: DatabaseCard[] = [];
    let hasMore = true;
    let offset = 0;
    const batchSize = 1000;

    while (hasMore) {
      const batchQuery = supabase
        .from("cards")
        .select(`
          id, oracle_id, original_name, name, search_key, mana_cost, cmc,
          type_line, oracle_text, colors, color_identity, rarity, set_code,
          can_be_commander, can_be_companion, companion_restriction,
          image_uris, back_image_uris, display_hints, scryfall_uri, created_at
        `)
        .order("name")
        .range(offset, offset + batchSize - 1);

      const batchResult = await batchQuery;

      if (batchResult.error) {
        return { allCards: [], error: batchResult.error };
      }

      if (batchResult.data && batchResult.data.length > 0) {
        allCards.push(...(batchResult.data as DatabaseCard[]));
        offset += batchSize;
        hasMore = batchResult.data.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    return { allCards, error: null };
  }

  /**
   * Log debug information for fuzzy search
   */
  private static logFuzzySearchDebug(
    searchTerm: string,
    cards: DatabaseCard[]
  ): void {
    const cardNames = cards.map(card => card.name ?? "");

    console.log("🔍 Fuzzy Search Debug:");
    console.log(`  Search term: "${searchTerm}"`);
    console.log(`  Total cards: ${cards.length}`);
    console.log(`  Sample card names:`, cardNames.slice(0, 10));

    // Look for cards that should match our search term
    const shouldMatch = cardNames.filter(name =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log(`  Cards that should match (simple includes): ${shouldMatch.length}`);
    if (shouldMatch.length > 0) {
      console.log(`  Sample matches:`, shouldMatch.slice(0, 5));
    }
  }

  /**
   * Execute fuzzy search using uFuzzy
   */
  private static executeFuzzySearch(
    cards: DatabaseCard[],
    searchTerm: string,
    limit: number
  ): DatabaseCard[] {
    const cardNames = cards.map(card => card.name ?? "");

    // Configure uFuzzy for optimal MTG card searching
    const uf = new uFuzzy({
      intraMode: 0,        // MultiInsert mode for partial matches
      intraIns: 1,         // Allow 1 extra char between each char within a term
      interIns: Infinity,  // Allow unlimited chars between terms
      intraChars: "[a-z\\d'\\s]", // Match display names with spaces
    });

    // Perform fuzzy search
    console.log("  Running uFuzzy search...");
    const fuzzyResults = uf.search(cardNames, searchTerm);

    console.log("  uFuzzy results:", fuzzyResults);
    if (fuzzyResults?.[0]) {
      console.log(`  uFuzzy found ${fuzzyResults[0].length} matches`);
    } else {
      console.log("  uFuzzy found no matches");
      return [];
    }

    if (!fuzzyResults?.[0]?.length) {
      return [];
    }

    // Extract matched cards in order
    return this.extractMatchedCards(fuzzyResults, cards, limit);
  }

  /**
   * Extract matched cards from fuzzy search results
   */
  private static extractMatchedCards(
    fuzzyResults: uFuzzy.SearchResult,
    cards: DatabaseCard[],
    limit: number
  ): DatabaseCard[] {
    const [idxs, info, order] = fuzzyResults;
    if (!idxs?.length) { return []; }

    const fuzzyMatches: DatabaseCard[] = [];
    const maxResults = Math.min(limit, order ? order.length : idxs.length);

    for (let i = 0; i < maxResults; i++) {
      const orderIdx = order ? order[i] : i;
      const cardIdx = info ? info.idx[orderIdx] : idxs[orderIdx];
      if (cardIdx !== undefined && cards[cardIdx]) {
        fuzzyMatches.push(cards[cardIdx]);
      }
    }

    return fuzzyMatches;
  }

  /**
   * Search for exact card name matches
   */
  static async findExactCard(cardName: string): Promise<DatabaseCard | null> {
    // Use quoted search for exact matching
    const quotedSearch = `"${cardName}"`;
    const result = await this.searchCards(quotedSearch, {
      limit: 1,
      exactMatch: true
    });

    return result.cards.length > 0 ? result.cards[0] : null;
  }

  /**
   * Batch search for multiple card names (useful for deck imports)
   */
  static async batchSearchCards(cardNames: string[]): Promise<{
    found: Map<string, DatabaseCard>;
    notFound: string[];
    errors: string[];
  }> {
    const found = new Map<string, DatabaseCard>();
    const notFound: string[] = [];
    const errors: string[] = [];

    for (const cardName of cardNames) {
      try {
        const card = await this.findExactCard(cardName);
        if (card) {
          found.set(cardName, card);
        } else {
          notFound.push(cardName);
        }
      } catch (error) {
        errors.push(`${cardName}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return { found, notFound, errors };
  }
}
