// Database Import Service
// Handles saving processed card data to Supabase database

import { supabase } from "../../../services/supabase";
import type { ProcessedCard } from "../../types/mtg";
import type { TablesInsert } from "../../../services/supabase";

/**
 * Database service for importing card data
 */
export class CardDatabaseService {
  /**
   * Helper method to prepare search terms for a batch of cards
   */
  private static prepareSearchTermsForBatch(
    batch: ProcessedCard[],
    cardIdMap: Map<string, string>
  ): TablesInsert<"card_search_terms">[] {
    const searchTermInserts: TablesInsert<"card_search_terms">[] = [];

    batch.forEach(card => {
      const cardId = cardIdMap.get(card.oracle_id);
      if (cardId) {
        card.search_terms.forEach(term => {
          searchTermInserts.push({
            card_id: cardId,
            search_term: term.search_term,
            is_primary: term.is_primary,
          });
        });
      }
    });

    return searchTermInserts;
  }
  /**
   * Clear all existing card data from the database
   */
  static async clearExistingCards(): Promise<void> {
    console.log("🗑️ Clearing existing card data...");

    try {
      // Delete search terms first (foreign key constraint)
      const { error: searchTermsError } = await supabase
        .from("card_search_terms")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (searchTermsError) {
        throw new Error(`Failed to clear search terms: ${searchTermsError.message}`);
      }

      // Delete cards
      const { error: cardsError } = await supabase
        .from("cards")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (cardsError) {
        throw new Error(`Failed to clear cards: ${cardsError.message}`);
      }

      console.log("✅ Existing card data cleared");
    } catch (error) {
      console.error("❌ Failed to clear existing card data:", error);
      throw error;
    }
  }

  /**
   * Insert cards in batches to avoid overwhelming the database
   */
  static async insertCardsBatch(
    cards: ProcessedCard[],
    batchSize: number = 100,
    onProgress?: (inserted: number, total: number) => void
  ): Promise<{ inserted: number; errors: string[] }> {
    console.log(`💾 Inserting ${cards.length} cards in batches of ${batchSize}...`);

    let inserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < cards.length; i += batchSize) {
      const batch = cards.slice(i, i + batchSize);

      try {
        // Prepare card data for insertion
        const cardInserts: TablesInsert<"cards">[] = batch.map(card => ({
          oracle_id: card.oracle_id,
          scryfall_id: card.scryfall_id,
          original_name: card.original_name,
          name: card.name,
          search_key: card.search_key,
          mana_cost: card.mana_cost,
          cmc: card.cmc,
          type_line: card.type_line,
          oracle_text: card.oracle_text,
          colors: card.colors,
          color_identity: card.color_identity,
          rarity: card.rarity,
          set_code: card.set_code,
          can_be_commander: card.can_be_commander,
          can_be_companion: card.can_be_companion,
          companion_restriction: card.companion_restriction,
          image_uris: card.image_uris ? JSON.stringify(card.image_uris) : null,
          back_image_uris: card.back_image_uris ? JSON.stringify(card.back_image_uris) : null,
          display_hints: JSON.stringify(card.display_hints),
          scryfall_uri: card.scryfall_uri,
        }));

        // Insert cards
        const { data: insertedCards, error: cardsError } = await supabase
          .from("cards")
          .insert(cardInserts)
          .select("id, oracle_id");

        if (cardsError) {
          const errorMsg = `Batch ${Math.floor(i / batchSize) + 1}: ${cardsError.message}`;
          errors.push(errorMsg);
          console.warn(`⚠️ ${errorMsg}`);
          continue;
        }

        assert(insertedCards, `Batch ${Math.floor(i / batchSize) + 1}: No cards returned after insert`);

        // Create a map of oracle_id to card_id for search terms
        const cardIdMap = new Map<string, string>();
        insertedCards.forEach((card: { oracle_id: string; id: string }) => {
          cardIdMap.set(card.oracle_id, card.id);
        });

        // Prepare search terms for insertion
        const searchTermInserts = this.prepareSearchTermsForBatch(batch, cardIdMap);

        // Insert search terms
        let searchTermsError = null;
        if (searchTermInserts.length > 0) {
          ({ error: searchTermsError } = await supabase
            .from("card_search_terms")
            .insert(searchTermInserts));
        }

        if (searchTermsError) {
          const errorMsg = `Search terms batch ${Math.floor(i / batchSize) + 1}: ${searchTermsError.message}`;
          errors.push(errorMsg);
          console.warn(`⚠️ ${errorMsg}`);
        }

        inserted += insertedCards.length;

        if (onProgress) {
          onProgress(inserted, cards.length);
        }

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 250));

      } catch (error) {
        const errorMsg = `Batch ${Math.floor(i / batchSize) + 1}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.warn(`⚠️ ${errorMsg}`);
      }
    }

    console.log(`✅ Inserted ${inserted}/${cards.length} cards`);
    if (errors.length > 0) {
      console.warn(`⚠️ ${errors.length} batch errors occurred`);
    }

    return { inserted, errors };
  }

  /**
   * Get current card count in database
   */
  static async getCardCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("cards")
        .select("*", { count: "exact", head: true });

      assert(!error, `Failed to get card count: ${error?.message}`);

      return count ?? 0;
    } catch (error) {
      console.error("Error getting card count:", error);
      return 0;
    }
  }

  /**
   * Get last import timestamp (based on most recent card creation)
   */
  static async getLastImportTime(): Promise<Date | null> {
    try {
      const { data, error } = await supabase
        .from("cards")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      assert(!error, `Failed to get last import time: ${error?.message}`);

      if (!data || data.length === 0) {
        return null;
      }

      return new Date(data[0].created_at!);
    } catch (error) {
      console.error("Error getting last import time:", error);
      return null;
    }
  }

  /**
   * Verify database integrity after import
   */
  static async verifyImport(): Promise<{
    cardCount: number;
    searchTermCount: number;
    commanderCount: number;
    companionCount: number;
    issues: string[];
  }> {
    console.log("🔍 Verifying database integrity...");

    const issues: string[] = [];

    try {
      // Get card count
      const { count: cardCount, error: cardCountError } = await supabase
        .from("cards")
        .select("*", { count: "exact", head: true });

      if (cardCountError) {
        issues.push(`Failed to count cards: ${cardCountError.message}`);
      }

      // Get search term count
      const { count: searchTermCount, error: searchTermCountError } = await supabase
        .from("card_search_terms")
        .select("*", { count: "exact", head: true });

      if (searchTermCountError) {
        issues.push(`Failed to count search terms: ${searchTermCountError.message}`);
      }

      // Get commander count
      const { count: commanderCount, error: commanderCountError } = await supabase
        .from("cards")
        .select("*", { count: "exact", head: true })
        .eq("can_be_commander", true);

      if (commanderCountError) {
        issues.push(`Failed to count commanders: ${commanderCountError.message}`);
      }

      // Get companion count
      const { count: companionCount, error: companionCountError } = await supabase
        .from("cards")
        .select("*", { count: "exact", head: true })
        .eq("can_be_companion", true);

      if (companionCountError) {
        issues.push(`Failed to count companions: ${companionCountError.message}`);
      }

      // Check for orphaned search terms
      const { data: orphanedTerms, error: orphanedError } = await supabase
        .from("card_search_terms")
        .select("id")
        .is("card_id", null);

      if (orphanedError) {
        issues.push(`Failed to check for orphaned search terms: ${orphanedError.message}`);
      } else if (orphanedTerms && orphanedTerms.length > 0) {
        issues.push(`Found ${orphanedTerms.length} orphaned search terms`);
      }

      const result = {
        cardCount: cardCount ?? 0,
        searchTermCount: searchTermCount ?? 0,
        commanderCount: commanderCount ?? 0,
        companionCount: companionCount ?? 0,
        issues,
      };

      console.log("📊 Import verification results:", result);
      return result;

    } catch (error) {
      issues.push(`Verification failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        cardCount: 0,
        searchTermCount: 0,
        commanderCount: 0,
        companionCount: 0,
        issues,
      };
    }
  }
}
