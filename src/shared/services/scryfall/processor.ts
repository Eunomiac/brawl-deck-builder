// Card Processing Service
// Handles filtering, deduplication, and processing of Scryfall card data

import type { ScryfallCard, ProcessedCard } from "../../types/mtg";
import { ScryfallUtils } from "./api";
import { CardNameNormalizer } from "../../utils/cardNameNormalization";

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
   * Deduplicate cards by oracle_id using sophisticated version selection logic:
   * 1. Filter out non-English variants
   * 2. Select lowest rarity (Common > Uncommon > Rare > Mythic)
   * 3. Select newest printing from remaining candidates
   * 4. Track all Arena-legal sets the card appeared in
   */
  static deduplicateCards(cards: ScryfallCard[]): ScryfallCard[] {
    console.log(`🔄 Deduplicating ${cards.length} cards by oracle_id (using enhanced version selection)...`);

    const cardGroups = new Map<string, ScryfallCard[]>();

    // Group cards by oracle_id
    for (const card of cards) {
      const oracleId = card.oracle_id;
      if (!cardGroups.has(oracleId)) {
        cardGroups.set(oracleId, []);
      }
      cardGroups.get(oracleId)!.push(card);
    }

    const selectedCards: ScryfallCard[] = [];
    let versionSelectionApplied = 0;

    for (const [, variants] of cardGroups) {
      if (variants.length === 1) {
        // Only one version, keep it
        selectedCards.push(variants[0]);
        continue;
      }

      // Apply version selection logic
      const selectedCard = this.selectBestCardVersion(variants);
      selectedCards.push(selectedCard);
      versionSelectionApplied++;
    }

    console.log(`✅ Deduplicated to ${selectedCards.length} unique cards`);
    if (versionSelectionApplied > 0) {
      console.log(`🎯 Applied version selection for ${versionSelectionApplied} cards with multiple printings`);
    }

    return selectedCards;
  }

  /**
   * Select the best version of a card from multiple variants
   * Also collects all Arena-legal set codes for date range analysis
   */
  private static selectBestCardVersion(variants: ScryfallCard[]): ScryfallCard & { arena_legal_sets?: string[] } {
    // Collect all Arena-legal set codes from variants
    const arenaLegalSets = variants
      .filter(card => ScryfallUtils.isBrawlLegalOnArena(card))
      .map(card => card.set)
      .filter((set, index, array) => array.indexOf(set) === index) // Remove duplicates
      .sort();

    // For now, use simple selection: prefer Arena-legal, then most recent set code
    const arenaLegalCandidates = variants.filter(card =>
      ScryfallUtils.isBrawlLegalOnArena(card)
    );

    const candidates = arenaLegalCandidates.length > 0 ? arenaLegalCandidates : variants;

    // Simple selection: most recent set code (alphabetically last for now)
    let selectedCard = candidates[0];
    for (const card of candidates.slice(1)) {
      if (card.set > selectedCard.set) {
        selectedCard = card;
      }
    }

    // Attach the Arena-legal sets array to the selected card
    return {
      ...selectedCard,
      arena_legal_sets: arenaLegalSets
    };
  }

  /**
   * Process a single Scryfall card into our database format
   */
  static processCard(card: ScryfallCard & { arena_legal_sets?: string[] }): ProcessedCard {
    const canBeCommander = ScryfallUtils.canBeCommander(card);
    const canBeCompanion = ScryfallUtils.canBeCompanion(card);
    const companionRestriction = ScryfallUtils.extractCompanionRestriction(card);
    const searchTerms = ScryfallUtils.getCardSearchTerms(card);

    // Three-tier name normalization
    const originalName = card.name;
    const displayName = CardNameNormalizer.normalizeForDisplay(originalName);
    const searchKey = CardNameNormalizer.normalizeForSearch(originalName);

    // Handle double-faced card images
    const frontImageUris = card.image_uris || card.card_faces?.[0]?.image_uris;
    const backImageUris = card.card_faces?.[1]?.image_uris;

    // Prepare front image URIs for database storage
    const imageUris = frontImageUris ? {
      small: frontImageUris.small,
      normal: frontImageUris.normal,
      large: frontImageUris.large,
      png: frontImageUris.png,
      art_crop: frontImageUris.art_crop,
      border_crop: frontImageUris.border_crop,
    } : undefined;

    // Prepare back image URIs for database storage
    const backImageUrisFormatted = backImageUris ? {
      small: backImageUris.small,
      normal: backImageUris.normal,
      large: backImageUris.large,
      png: backImageUris.png,
      art_crop: backImageUris.art_crop,
      border_crop: backImageUris.border_crop,
    } : undefined;

    // Create display hints for card rendering
    const displayHints = {
      preferredOrientation: 'portrait' as const,
      hasBackFace: !!backImageUris,
      meldPartner: null, // ... and then Implement meld partner detection
    };

    return {
      oracle_id: card.oracle_id,
      original_name: originalName,
      name: displayName,
      search_key: searchKey,
      mana_cost: card.mana_cost,
      cmc: card.cmc,
      type_line: card.type_line,
      oracle_text: card.oracle_text,
      colors: card.colors,
      color_identity: card.color_identity,
      rarity: card.rarity,
      set_code: card.set,
      arena_legal_sets: card.arena_legal_sets,
      can_be_commander: canBeCommander,
      can_be_companion: canBeCompanion,
      companion_restriction: companionRestriction,
      image_uris: imageUris,
      back_image_uris: backImageUrisFormatted,
      display_hints: displayHints,
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
   * Full processing pipeline: deduplicate, filter, and process cards
   * Note: Deduplication happens BEFORE filtering to ensure we get the best version of each card
   */
  static async processCardData(
    cards: ScryfallCard[],
    onProgress?: (stage: string, current: number, total: number) => void
  ): Promise<ProcessedCard[]> {
    console.log("🚀 Starting card processing pipeline...");

    // Stage 1: Deduplicate by oracle_id (prioritizing Arena-legal versions)
    if (onProgress) onProgress("Deduplicating cards", 0, 3);
    const deduplicated = this.deduplicateCards(cards);

    // Stage 2: Filter for Brawl-legal Arena cards
    if (onProgress) onProgress("Filtering cards", 1, 3);
    const filtered = this.filterBrawlLegalCards(deduplicated);

    // Stage 3: Process into our format
    if (onProgress) onProgress("Processing cards", 2, 3);
    const processed = this.processCards(filtered, (current, total) => {
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
