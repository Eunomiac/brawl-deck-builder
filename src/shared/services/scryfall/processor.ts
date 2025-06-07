// Card Processing Service
// Handles filtering, deduplication, and processing of Scryfall card data

import type { ScryfallCard, ProcessedCard } from "../../types/mtg";
import { ScryfallUtils } from "./api";

/**
 * Card processor for filtering and transforming Scryfall data
 */
export class CardProcessor {
  /**
   * Filter cards to only include Brawl-legal Arena cards
   */
  static filterBrawlLegalCards(cards: ScryfallCard[]): ScryfallCard[] {
    console.log(`🔍 Filtering ${cards.length} cards for Brawl legality on Arena...`);

    const filtered = cards.filter(card => ScryfallUtils.isBrawlLegalOnArena(card));

    console.log(`✅ Found ${filtered.length} Brawl-legal Arena cards`);
    return filtered;
  }

  /**
   * Deduplicate cards by oracle_id, keeping the most recent printing
   */
  static deduplicateCards(cards: ScryfallCard[]): ScryfallCard[] {
    console.log(`🔄 Deduplicating ${cards.length} cards by oracle_id...`);

    const cardMap = new Map<string, ScryfallCard>();

    for (const card of cards) {
      const existing = cardMap.get(card.oracle_id);

      if (!existing || card.set > existing.set) {
        // Keep the card from the more recent set (simple heuristic)
        // In a more sophisticated version, we might prefer certain sets
        cardMap.set(card.oracle_id, card);
      }
    }

    const deduplicated = Array.from(cardMap.values());
    console.log(`✅ Deduplicated to ${deduplicated.length} unique cards`);

    return deduplicated;
  }

  /**
   * Process a single Scryfall card into our database format
   */
  static processCard(card: ScryfallCard): ProcessedCard {
    const canBeCommander = ScryfallUtils.canBeCommander(card);
    const canBeCompanion = ScryfallUtils.canBeCompanion(card);
    const companionRestriction = ScryfallUtils.extractCompanionRestriction(card);
    const searchTerms = ScryfallUtils.getCardSearchTerms(card);

    // Prepare image URIs for database storage
    const imageUris = card.image_uris ? {
      small: card.image_uris.small,
      normal: card.image_uris.normal,
      large: card.image_uris.large,
      png: card.image_uris.png,
      art_crop: card.image_uris.art_crop,
      border_crop: card.image_uris.border_crop,
    } : undefined;

    return {
      oracle_id: card.oracle_id,
      name: card.name,
      mana_cost: card.mana_cost,
      cmc: card.cmc,
      type_line: card.type_line,
      oracle_text: card.oracle_text,
      colors: card.colors,
      color_identity: card.color_identity,
      rarity: card.rarity,
      set_code: card.set,
      can_be_commander: canBeCommander,
      can_be_companion: canBeCompanion,
      companion_restriction: companionRestriction,
      image_uris: imageUris,
      scryfall_uri: card.scryfall_uri,
      search_terms: searchTerms,
    };
  }

  /**
   * Process multiple cards with progress tracking
   */
  static processCards(
    cards: ScryfallCard[],
    onProgress?: (processed: number, total: number) => void
  ): ProcessedCard[] {
    console.log(`⚙️ Processing ${cards.length} cards...`);

    const processed: ProcessedCard[] = [];

    for (let i = 0; i < cards.length; i++) {
      try {
        const processedCard = this.processCard(cards[i]);
        processed.push(processedCard);

        if (onProgress && (i + 1) % 100 === 0) {
          onProgress(i + 1, cards.length);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to process card ${cards[i].name}:`, error);
        // Continue processing other cards
      }
    }

    if (onProgress) {
      onProgress(cards.length, cards.length);
    }

    console.log(`✅ Successfully processed ${processed.length}/${cards.length} cards`);
    return processed;
  }

  /**
   * Full processing pipeline: filter, deduplicate, and process cards
   */
  static async processCardData(
    cards: ScryfallCard[],
    onProgress?: (stage: string, current: number, total: number) => void
  ): Promise<ProcessedCard[]> {
    console.log("🚀 Starting card processing pipeline...");

    // Stage 1: Filter for Brawl-legal Arena cards
    if (onProgress) onProgress("Filtering cards", 0, 3);
    const filtered = this.filterBrawlLegalCards(cards);

    // Stage 2: Deduplicate by oracle_id
    if (onProgress) onProgress("Deduplicating cards", 1, 3);
    const deduplicated = this.deduplicateCards(filtered);

    // Stage 3: Process into our format
    if (onProgress) onProgress("Processing cards", 2, 3);
    const processed = this.processCards(deduplicated, (current, total) => {
      if (onProgress) {
        onProgress(`Processing cards (${current}/${total})`, 2, 3);
      }
    });

    if (onProgress) onProgress("Complete", 3, 3);

    console.log("✅ Card processing pipeline complete");
    return processed;
  }

  /**
   * Get statistics about processed cards
   */
  static getCardStatistics(cards: ProcessedCard[]): {
    total: number;
    commanders: number;
    companions: number;
    byRarity: Record<string, number>;
    byColorIdentity: Record<string, number>;
  } {
    const stats = {
      total: cards.length,
      commanders: 0,
      companions: 0,
      byRarity: {} as Record<string, number>,
      byColorIdentity: {} as Record<string, number>,
    };

    for (const card of cards) {
      // Count commanders and companions
      if (card.can_be_commander) stats.commanders++;
      if (card.can_be_companion) stats.companions++;

      // Count by rarity
      const rarity = card.rarity || "unknown";
      stats.byRarity[rarity] = (stats.byRarity[rarity] || 0) + 1;

      // Count by color identity
      const colorIdentity = card.color_identity?.sort().join("") ?? "colorless";
      stats.byColorIdentity[colorIdentity] = (stats.byColorIdentity[colorIdentity] || 0) + 1;
    }

    return stats;
  }

  /**
   * Validate processed card data
   */
  static validateProcessedCards(cards: ProcessedCard[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required fields using assert for critical fields
    for (const card of cards) {
      try {
        assert(card.oracle_id, `Card missing oracle_id: ${card.name}`);
        assert(card.name, `Card missing name: ${card.oracle_id}`);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }

      // Non-critical fields as warnings
      if (!card.type_line) {
        warnings.push(`Card missing type_line: ${card.name}`);
      }
      if (!card.set_code) {
        warnings.push(`Card missing set_code: ${card.name}`);
      }
    }

    // Check for duplicates
    const oracleIds = new Set<string>();
    for (const card of cards) {
      if (oracleIds.has(card.oracle_id)) {
        errors.push(`Duplicate oracle_id found: ${card.oracle_id} (${card.name})`);
      }
      oracleIds.add(card.oracle_id);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
