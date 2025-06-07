// Card Search Service
// Robust search functionality using normalized search terms

import { supabase } from "../../../services/supabase/client";
import type { Tables } from "../../../services/supabase/types";
import { ScryfallUtils } from "../scryfall/api";

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
      const normalizedSearchTerm = ScryfallUtils.normalizeText(cleanSearchTerm);

      // For quoted searches, use exact matching with variations
      // For unquoted searches, be more precise
      let searchTerms: string[];

      if (isQuotedSearch) {
        // Quoted search: generate variations but use exact matching
        searchTerms = this.generateSearchVariations(normalizedSearchTerm);
      } else {
        // Unquoted search: try exact match first, then prefix match
        searchTerms = [normalizedSearchTerm];
      }

      // Search using the card_search_terms table
      let query = supabase
        .from("card_search_terms")
        .select(`
          search_term,
          is_primary,
          cards!inner (
            id,
            oracle_id,
            name,
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
            scryfall_uri,
            created_at
          )
        `);

      if (isQuotedSearch || exactMatch) {
        // Exact match against any of the search terms
        query = query.in("search_term", searchTerms);
      } else {
        // For unquoted searches, try exact match first
        const exactConditions = searchTerms.map(term => `search_term.eq.${term}`).join(',');
        query = query.or(exactConditions);
      }

      let { data, error, count } = await query
        .order("is_primary", { ascending: false }) // Primary terms first
        .limit(limit);

      // If no exact matches found for unquoted search, try prefix matching
      if (!isQuotedSearch && !exactMatch && (!data || data.length === 0)) {
        query = supabase
          .from("card_search_terms")
          .select(`
            search_term,
            is_primary,
            cards!inner (
              id,
              oracle_id,
              name,
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
              scryfall_uri,
              created_at
            )
          `)
          .ilike("search_term", `${normalizedSearchTerm}%`) // Prefix match
          .order("is_primary", { ascending: false })
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

      // Extract unique cards (since multiple search terms can match the same card)
      const uniqueCards = new Map<string, DatabaseCard>();

      data?.forEach((result) => {
        const card = result.cards as DatabaseCard;
        if (card && !uniqueCards.has(card.id)) {
          uniqueCards.set(card.id, card);
        }
      });

      const cards = Array.from(uniqueCards.values());

      // Sort results: exact matches first, then by name
      cards.sort((a, b) => {
        const aNameNormalized = ScryfallUtils.normalizeText(a.name || "");
        const bNameNormalized = ScryfallUtils.normalizeText(b.name || "");

        // Check for exact matches
        const aExact = searchTerms.some(term => aNameNormalized === term);
        const bExact = searchTerms.some(term => bNameNormalized === term);

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Sort by name
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
        normalizedSearchTerm: ScryfallUtils.normalizeText(searchTerm.trim()),
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
