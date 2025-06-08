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
      let query = supabase
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

      // try exact match first
      query = query.eq("search_key", normalizedSearchTerm);

      let { data, error, count } = await query
        .order("name") // Sort by display name
        .limit(limit);

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
          normalizedSearchTerm,
          error: error.message,
        };
      }

      // Since we're querying cards directly, no need to extract from nested structure
      const cards = (data || []) as DatabaseCard[];

      // Sort results: exact matches first, then preserve uFuzzy ordering for fuzzy matches
      cards.sort((a, b) => {
        const aSearchKey = a.search_key ?? "";
        const bSearchKey = b.search_key ?? "";

        // Check for exact matches (using search_key) - these should always come first
        const aExact = aSearchKey === normalizedSearchTerm;
        const bExact = bSearchKey === normalizedSearchTerm;

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // For non-exact matches, preserve the order from uFuzzy (or fallback to name sort)
        // uFuzzy already provides optimal fuzzy match ordering based on display names
        if (!aExact && !bExact) {
          return (a.name || "").localeCompare(b.name || "");
        }

        return 0;
      });

      return {
        cards,
        totalCount: count ?? cards.length,
        searchTerm,
        normalizedSearchTerm,
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
    // Fetch all cards for fuzzy searching using pagination to bypass 1000 row limit
    const allCards: DatabaseCard[] = [];
    let hasMore = true;
    let offset = 0;
    const batchSize = 1000;

    while (hasMore) {
      const batchQuery = supabase
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
        `)
        .order("name")
        .range(offset, offset + batchSize - 1);

      const batchResult = await batchQuery;

      if (batchResult.error) {
        return {
          data: null,
          error: batchResult.error,
          count: 0
        };
      }

      if (batchResult.data && batchResult.data.length > 0) {
        allCards.push(...(batchResult.data as DatabaseCard[]));
        offset += batchSize;
        hasMore = batchResult.data.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    // Create a mock result object for compatibility
    const allCardsResult = {
      data: allCards,
      error: null,
      count: allCards.length
    };

    if (allCardsResult.error) {
      return {
        data: null,
        error: allCardsResult.error,
        count: 0
      };
    }

    if (!allCardsResult.data) {
      return {
        data: [],
        error: null,
        count: 0
      };
    }

    // Perform fuzzy search using uFuzzy
    const cards = allCardsResult.data;
    const cardNames = cards.map(card => card.name ?? "");

    // Debug logging
    console.log("🔍 Fuzzy Search Debug:");
    console.log(`  Search term: "${displayNormalizedSearchTerm}"`);
    console.log(`  Total cards: ${allCards.length}`);
    console.log(`  Sample card names:`, cardNames.slice(0, 10));

    // Look for cards that should match our search term
    const shouldMatch = cardNames.filter(name =>
      name.toLowerCase().includes(displayNormalizedSearchTerm.toLowerCase())
    );
    console.log(`  Cards that should match (simple includes): ${shouldMatch.length}`);
    if (shouldMatch.length > 0) {
      console.log(`  Sample matches:`, shouldMatch.slice(0, 5));
    }

    // Configure uFuzzy for optimal MTG card searching with display names
    const uf = new uFuzzy({
      intraMode: 0,        // MultiInsert mode for partial matches
      intraIns: 1,         // Allow 1 extra char between each char within a term
      interIns: Infinity,  // Allow unlimited chars between terms
      intraChars: "[a-z\\d'\\s]", // Match display names with spaces
    });

    // Perform fuzzy search
    console.log("  Running uFuzzy search...");
    const fuzzyResults = uf.search(cardNames, displayNormalizedSearchTerm);

    console.log("  uFuzzy results:", fuzzyResults);
    if (fuzzyResults?.[0]) {
      console.log(`  uFuzzy found ${fuzzyResults[0].length} matches`);
    } else {
      console.log("  uFuzzy found no matches");
    }

    if (fuzzyResults?.[0]?.length) {
      const [idxs, info, order] = fuzzyResults;

      // Extract matched cards in the order returned by uFuzzy
      const fuzzyMatches: DatabaseCard[] = [];

      if (idxs && idxs.length > 0) {
        const maxResults = Math.min(limit, order ? order.length : idxs.length);

        for (let i = 0; i < maxResults; i++) {
          const orderIdx = order ? order[i] : i;
          const cardIdx = info ? info.idx[orderIdx] : idxs[orderIdx];
          if (cardIdx !== undefined && cards[cardIdx]) {
            fuzzyMatches.push(cards[cardIdx]);
          }
        }
      }

      return {
        data: fuzzyMatches,
        error: null,
        count: fuzzyMatches.length
      };
    }

    return {
      data: [],
      error: null,
      count: 0
    };
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
