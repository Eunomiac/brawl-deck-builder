// Card Search Service
// Robust search functionality using normalized search terms

import { supabase } from "../../../services/supabase/client";
import type { Tables } from "../../../services/supabase/types";
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

      // Normalize the search term
      const normalizedSearchTerm = CardNameNormalizer.normalizeForSearch(cleanSearchTerm);

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

      // If no exact matches found for unquoted search, try prefix matching
      if (!isQuotedSearch && !exactMatch && (!data || data.length === 0)) {
        query = supabase
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
          .ilike("search_key", `${normalizedSearchTerm}%`) // Prefix match
          .order("name")
          .limit(limit);

        const prefixResult = await query;
        data = prefixResult.data;
        error = prefixResult.error;
        count = prefixResult.count;
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

      // Sort results: exact matches first, then by name
      cards.sort((a, b) => {
        const aSearchKey = a.search_key ?? "";
        const bSearchKey = b.search_key ?? "";

        // Check for exact matches
        const aExact = aSearchKey === normalizedSearchTerm;
        const bExact = bSearchKey === normalizedSearchTerm;

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Sort by display name
        return (a.name || "").localeCompare(b.name || "");
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
   * Generate search term variations for exact matching (used with quoted searches)
   */
  private static generateSearchVariations(normalizedTerm: string): string[] {
    const variations = new Set<string>();

    // Add the original term
    variations.add(normalizedTerm);

    // Handle Alchemy variants
    if (normalizedTerm.startsWith('a ')) {
      // Remove 'a ' prefix (normalized 'A-')
      variations.add(normalizedTerm.substring(2));
    } else {
      // Add 'a ' prefix
      variations.add(`a ${normalizedTerm}`);
    }

    // Handle split card separator variations (for exact matching)
    // This handles cases like "Dusk / Dawn" vs "Dusk // Dawn"
    if (normalizedTerm.includes(' ')) {
      const words = normalizedTerm.split(' ').filter(word => word.length > 0);

      // For split cards, try different separator patterns
      if (words.length >= 2) {
        // Join with single space (normalized from any separator)
        variations.add(words.join(' '));

        // Also try without spaces (for cards that might be stored differently)
        variations.add(words.join(''));

        // Alchemy variants for the whole phrase
        const alchemyWords = words.map(word =>
          word.startsWith('a ') ? word : `a ${word}`
        );
        variations.add(alchemyWords.join(' '));

        const nonAlchemyWords = words.map(word =>
          word.startsWith('a ') ? word.substring(2) : word
        );
        variations.add(nonAlchemyWords.join(' '));
      }
    }

    return Array.from(variations).filter(term => term.length > 0);
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
