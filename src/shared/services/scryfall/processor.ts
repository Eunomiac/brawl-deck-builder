// Card Processing Service
// Handles filtering, deduplication, and processing of Scryfall card data

import type { ScryfallCard, ProcessedCard } from "../../types/mtg";
import { ScryfallUtils } from "./api";
import { CardNameNormalizer } from "../../utils/cardNameNormalization";
import { ScryfallDebugger } from "./debug";
import { SetsDatabaseService } from "../sets/database";
import { CardRarity } from "../../utils/enums";

/**
 * Card processor for filtering and transforming Scryfall data
 */
export class CardProcessor {
  /**
   * Filter cards to only include valid cards for our database:
   * 1. Must be Brawl-legal on Arena
   * 2. Must be in English (to avoid foreign language cosmetic prints)
   */
  static filterValidCards(cards: ScryfallCard[]): ScryfallCard[] {
    console.log(`🔍 Filtering ${cards.length} cards for validity (Brawl-legal + English)...`);

    const filtered = cards.filter(card =>
      ScryfallUtils.isBrawlLegalOnArena(card) && card.lang === "en"
    );

    console.log(`✅ Found ${filtered.length} valid cards (${cards.length - filtered.length} filtered out)`);
    return filtered;
  }



  /**
   * Extract set release dates from cards for database storage
   * This is a utility method used during import to populate the sets table
   */
  static extractSetReleaseDates(cards: ScryfallCard[]): Record<string, string> {
    console.log(`📅 Extracting set release dates from ${cards.length} cards...`);

    const setDates: Record<string, string> = {};

    for (const card of cards) {
      if (!setDates[card.set]) {
        // Use the card's released_at if available, otherwise fall back to a default
        setDates[card.set] = card.released_at ?? "1993-01-01";
      }
    }

    const setCount = Object.keys(setDates).length;
    console.log(`✅ Found ${setCount} unique sets with release dates`);

    return setDates;
  }

  /**
   * Deduplicate cards by oracle_id using proper version selection logic:
   * Since we've already filtered to valid cards, we just need to pick the best version
   * from the remaining candidates and track all sets the card appeared in
   */
  static async deduplicateCards(cards: ScryfallCard[]): Promise<ScryfallCard[]> {
    console.log(`🔄 Deduplicating ${cards.length} valid cards by oracle_id...`);

    // Get set release dates from database
    const setReleaseDates = await SetsDatabaseService.getSetReleaseDates();

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
      const selectedCard = this.selectBestCardVersion(variants, setReleaseDates);
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
   * Since all variants are already valid (Arena-legal + English), we just need to pick the best one
   * and collect all set codes for date range analysis
   */
  private static selectBestCardVersion(variants: ScryfallCard[], setReleaseDates: Record<string, string>): ScryfallCard & { arena_legal_sets?: string[] } {

    // If only one variant, no need to select - but still need to populate `arena_legal_sets` property
    if (variants.length === 1) {
      return {
        ...variants[0],
        arena_legal_sets: [variants[0].set]
      };
    }

    // Collect all set codes from variants (all are Arena-legal since we pre-filtered)
    const arenaLegalSets = variants
      .map(card => card.set)
      .filter((set, index, array) => array.indexOf(set) === index) // Remove duplicates
      .sort((a, b) => a.localeCompare(b));

    // Find the lowest rarity present in the cards in variants:  CardRarity.Mythic > CardRarity.Rare > CardRarity.Uncommon > CardRarity.Common
    function getRarityScore(rarity: string) {
      return {
        [CardRarity.Mythic]: 4,
        [CardRarity.Rare]: 3,
        [CardRarity.Uncommon]: 2,
        [CardRarity.Common]: 1
      }[rarity] ?? 0;
    }
    const lowestRarity = variants.reduce<Maybe<CardRarity>>((lowest, card) => {
      if (!card.rarity) return lowest;
      if (!lowest) return card.rarity as CardRarity;
      return getRarityScore(card.rarity) < getRarityScore(lowest) ? card.rarity as CardRarity : lowest;
    }, undefined as Maybe<CardRarity>);

    // Filter variants to only include that rarity
    let filteredVariants = variants.filter(card => card.rarity === lowestRarity);

    // Filter to only include default versions unless none are available
    const defaultVariants = filteredVariants.filter(card => ScryfallUtils.isDefaultVersion(card));
    if (defaultVariants.length) {
      filteredVariants = defaultVariants;
    }

    // Select the most recently released version using set release dates
    let selectedCard = filteredVariants[0];
    for (const card of filteredVariants.slice(1)) {
      const currentReleaseDate = setReleaseDates[selectedCard.set] || "1993-01-01";
      const candidateReleaseDate = setReleaseDates[card.set] || "1993-01-01";

      // Choose the more recently released set (later date)
      if (candidateReleaseDate > currentReleaseDate) {
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
    // Watch card debugging: Log raw card data
    ScryfallDebugger.logRawCard(card, "Raw Card Processing");

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

    const processedCard: ProcessedCard = {
      oracle_id: card.oracle_id,
      scryfall_id: card.id,
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

    // Watch card debugging: Log processed card and transformation
    ScryfallDebugger.logProcessedCard(processedCard, "Final Processed Card");
    ScryfallDebugger.logCardTransformation(card, processedCard);

    return processedCard;
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
   * Note: Filtering happens FIRST to remove invalid cards, then deduplication for efficiency
   */
  static async processCardData(
    cards: ScryfallCard[],
    onProgress?: (stage: string, current: number, total: number) => void
  ): Promise<ProcessedCard[]> {
    console.log("🚀 Starting card processing pipeline...");

    // Stage 1: Filter for valid cards (Brawl-legal + English)
    if (onProgress) onProgress("Filtering cards", 0, 3);
    const filtered = this.filterValidCards(cards);

    // Stage 2: Deduplicate by oracle_id (gets set release dates from database)
    if (onProgress) onProgress("Deduplicating cards", 1, 3);
    const deduplicated = await this.deduplicateCards(filtered);

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
