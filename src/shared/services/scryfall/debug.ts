// Scryfall Data Debugging Utilities
// Tools for inspecting and analyzing imported card data

import { supabase } from "../../../services/supabase/client";
import type { Json } from "../../../services/supabase/types";
import type { ScryfallCard, ProcessedCard } from "../../types/mtg";

// Database card type (what we get from Supabase)
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
  image_uris: Json; // JSON field from Supabase
  scryfall_uri: string | null;
};

/**
 * Summary of card collection statistics for debugging purposes.
 * Provides counts and distributions across various card attributes.
 */
export interface DebugSummary {
  totalCards: number;
  commanders: number;
  companions: number;
  byRarity: Record<string, number>;
  byColorIdentity: Record<string, number>;
  bySets: Record<string, number>;
  cmcDistribution: Record<number, number>;
}

/**
 * Debugging utilities for inspecting imported Scryfall data
 */
export class ScryfallDebugger {
  // Watch card functionality for detailed processing debugging
  private static watchTerm: string | null = null;
  private static watchMatchCount: number = 0;
  /**
   * Get all imported cards with optional filtering
   * Note: Default limit is now 50000 to ensure all cards are returned
   */
  static async getAllCards(options: {
    limit?: number;
    offset?: number;
    orderBy?: "name" | "cmc" | "rarity" | "set_code";
    orderDirection?: "asc" | "desc";
  } = {}): Promise<{
    cards: DatabaseCard[];
    total: number;
    error?: string;
  }> {
    try {
      const {
        limit = 50000, // Increased default to ensure all cards are returned
        offset = 0,
        orderBy = "name",
        orderDirection = "asc"
      } = options;

      // Get total count
      const { count, error: countError } = await supabase
        .from("cards")
        .select("*", { count: "exact", head: true });

      if (countError) {
        return { cards: [], total: 0, error: countError.message };
      }

      // Get cards with pagination and sorting
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .order(orderBy, { ascending: orderDirection === "asc" })
        .range(offset, offset + limit - 1);

      if (error) {
        return { cards: [], total: count ?? 0, error: error.message };
      }

      return {
        cards: data || [],
        total: count ?? 0
      };

    } catch (error) {
      return {
        cards: [],
        total: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get ALL cards without any limit (convenience method)
   * This ensures you get the complete database
   */
  static async getAllCardsUnlimited(): Promise<{
    cards: DatabaseCard[];
    total: number;
    error?: string;
  }> {
    try {
      // First get the total count
      const { count, error: countError } = await supabase
        .from("cards")
        .select("*", { count: "exact", head: true });

      if (countError) {
        return { cards: [], total: 0, error: countError.message };
      }

      const totalCards = count ?? 0;
      console.log(`🔍 Getting all ${totalCards} cards from database...`);

      // Get all cards using a range that covers the full count
      // Supabase has a default limit, so we need to specify a range
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .order("name")
        .range(0, totalCards - 1); // Get from 0 to total-1 (inclusive)

      if (error) {
        return { cards: [], total: totalCards, error: error.message };
      }

      console.log(`✅ Retrieved ${data?.length ?? 0} cards from database`);

      return {
        cards: data as DatabaseCard[],
        total: totalCards
      };

    } catch (error) {
      return {
        cards: [],
        total: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Search for cards by name (partial match)
   */
  static async searchCardsByName(searchTerm: string, limit: number = 50): Promise<{
    cards: DatabaseCard[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .or(`name.ilike.%${searchTerm}%,search_key.ilike.%${searchTerm}%`)
        .order("name")
        .limit(limit);

      if (error) {
        return { cards: [], error: error.message };
      }

      return { cards: data || [] };

    } catch (error) {
      return {
        cards: [],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get cards by specific criteria for debugging
   */
  static async getCardsByCriteria(criteria: {
    rarity?: string;
    colors?: string[];
    canBeCommander?: boolean;
    canBeCompanion?: boolean;
    setCode?: string;
    cmcMin?: number;
    cmcMax?: number;
  }, limit: number = 100): Promise<{
    cards: DatabaseCard[];
    error?: string;
  }> {
    try {
      let query = supabase.from("cards").select("*");

      // Apply filters
      if (criteria.rarity) {
        query = query.eq("rarity", criteria.rarity);
      }

      if (criteria.canBeCommander !== undefined) {
        query = query.eq("can_be_commander", criteria.canBeCommander);
      }

      if (criteria.canBeCompanion !== undefined) {
        query = query.eq("can_be_companion", criteria.canBeCompanion);
      }

      if (criteria.setCode) {
        query = query.eq("set_code", criteria.setCode);
      }

      if (criteria.cmcMin !== undefined) {
        query = query.gte("cmc", criteria.cmcMin);
      }

      if (criteria.cmcMax !== undefined) {
        query = query.lte("cmc", criteria.cmcMax);
      }

      // Color filtering (contains any of the specified colors)
      if (criteria.colors && criteria.colors.length > 0) {
        query = query.overlaps("color_identity", criteria.colors);
      }

      const { data, error } = await query
        .order("name")
        .limit(limit);

      if (error) {
        return { cards: [], error: error.message };
      }

      return { cards: data || [] };

    } catch (error) {
      return {
        cards: [],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get import statistics and summary
   */
  static async getImportSummary(): Promise<{
    summary: DebugSummary;
    error?: string;
  }> {
    try {
      const { data: cards, error } = await supabase
        .from("cards")
        .select("rarity, can_be_commander, can_be_companion, color_identity, set_code, cmc");

      if (error) {
        return {
          summary: {
            totalCards: 0,
            commanders: 0,
            companions: 0,
            byRarity: {},
            byColorIdentity: {},
            bySets: {},
            cmcDistribution: {}
          },
          error: error.message
        };
      }

      const summary = {
        totalCards: cards.length,
        commanders: 0,
        companions: 0,
        byRarity: {} as Record<string, number>,
        byColorIdentity: {} as Record<string, number>,
        bySets: {} as Record<string, number>,
        cmcDistribution: {} as Record<number, number>
      };

      cards.forEach(card => {
        // Count commanders and companions
        if (card.can_be_commander) summary.commanders++;
        if (card.can_be_companion) summary.companions++;

        // Count by rarity (handle null values)
        const rarity = card.rarity ?? "unknown";
        summary.byRarity[rarity] = (summary.byRarity[rarity] || 0) + 1;

        // Count by set (handle null values)
        const setCode = card.set_code ?? "unknown";
        summary.bySets[setCode] = (summary.bySets[setCode] || 0) + 1;

        // Count by CMC (handle null values)
        const cmc = card.cmc ?? 0;
        summary.cmcDistribution[cmc] = (summary.cmcDistribution[cmc] || 0) + 1;

        // Count by color identity
        const colorKey = card.color_identity?.sort().join("") ?? "Colorless";
        summary.byColorIdentity[colorKey] = (summary.byColorIdentity[colorKey] || 0) + 1;
      });

      return { summary };

    } catch (error) {
      return {
        summary: {
          totalCards: 0,
          commanders: 0,
          companions: 0,
          byRarity: {},
          byColorIdentity: {},
          bySets: {},
          cmcDistribution: {}
        },
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Export card data to JSON for external analysis
   */
  static async exportCardsToJSON(
    criteria?: Parameters<typeof ScryfallDebugger.getCardsByCriteria>[0],
    filename?: string
  ): Promise<{ success: boolean; error?: string; downloadUrl?: string }> {
    try {
      const { cards, error } = criteria
        ? await this.getCardsByCriteria(criteria, 10000)
        : await this.getAllCards({ limit: 10000 });

      if (error) {
        return { success: false, error };
      }

      // Create JSON blob
      const jsonData = JSON.stringify(cards, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = filename ?? `scryfall-cards-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      return { success: true, downloadUrl: url };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Quick console logging helpers for debugging
   */
  static async logImportSummary(): Promise<void> {
    const { summary, error } = await this.getImportSummary();

    if (error) {
      console.error("❌ Error getting import summary:", error);
      return;
    }

    console.log("📊 Scryfall Import Summary:");
    console.log(`   Total Cards: ${summary.totalCards}`);
    console.log(`   Commanders: ${summary.commanders}`);
    console.log(`   Companions: ${summary.companions}`);
    console.log("   By Rarity:", summary.byRarity);
    console.log("   By Color Identity:", summary.byColorIdentity);
    console.log("   Top 10 Sets:",
      Object.entries(summary.bySets)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {})
    );
    console.log("");
    console.log("🔧 Available Methods:");
    console.log("   ScryfallDebugger.getAllCardsUnlimited() - Get all cards without limit");
    console.log("   ScryfallDebugger.getAllCards({limit: 100}) - Get cards with custom limit");
    console.log("   ScryfallDebugger.searchCardsByName('lightning') - Search by name");
    console.log("   ScryfallDebugger.exportToJson() - Download all cards as JSON");
    console.log("");
    console.log("🎯 Watch Card Debugging:");
    console.log("   ScryfallDebugger.setWatchCard('lightning') - Enable verbose debugging for matching cards");
    console.log("   ScryfallDebugger.clearWatchCard() - Disable watch card debugging");
    console.log("   ScryfallDebugger.getWatchCard() - Get current watch term");
  }

  /**
   * Log specific cards for debugging
   */
  static async logCards(searchTerm: string, limit: number = 10): Promise<void> {
    const { cards, error } = await this.searchCardsByName(searchTerm, limit);

    if (error) {
      console.error("❌ Error searching cards:", error);
      return;
    }

    console.log(`🔍 Found ${cards.length} cards matching "${searchTerm}":`);
    cards.forEach(card => {
      console.log(`   ${card.name} (${card.set_code}) - ${card.rarity} - CMC ${card.cmc}`);
    });
  }

  // ========================================
  // WATCH CARD FUNCTIONALITY
  // ========================================

  /**
   * Set a watch term to enable verbose debugging for specific cards during import
   * When a card name matches this term, detailed processing steps will be logged
   */
  static setWatchCard(searchTerm: string): void {
    this.watchTerm = searchTerm.toLowerCase();
    this.watchMatchCount = 0;
    console.log(`🔍 Watch card set to: "${searchTerm}"`);
    console.log("   Verbose debugging will be enabled for matching cards during import");
  }

  /**
   * Clear the current watch card term
   */
  static clearWatchCard(): void {
    const previousTerm = this.watchTerm;
    this.watchTerm = null;
    this.watchMatchCount = 0;
    if (previousTerm) {
      console.log(`🔍 Watch card cleared (was: "${previousTerm}")`);
    } else {
      console.log("🔍 No watch card was set");
    }
  }

  /**
   * Get the current watch card term
   */
  static getWatchCard(): string | null {
    return this.watchTerm;
  }

  /**
   * Check if a card name matches the current watch term
   */
  static isWatchCard(cardName: string): boolean {
    if (!this.watchTerm) return false;
    return cardName.toLowerCase().includes(this.watchTerm);
  }

  /**
   * Log detailed information about a raw Scryfall card (before processing)
   */
  static logRawCard(card: ScryfallCard, stage: string = "Raw Scryfall Data"): void {
    if (!this.isWatchCard(card.name)) return;

    this.watchMatchCount++;
    console.log(`\n🎯 WATCH CARD #${this.watchMatchCount} - ${stage}`);
    console.log(`📋 Card: ${card.name}`);
    console.log("📊 Raw Scryfall Data:");
    console.log("   oracle_id:", card.oracle_id);
    console.log("   name:", card.name);
    console.log("   mana_cost:", card.mana_cost);
    console.log("   cmc:", card.cmc);
    console.log("   type_line:", card.type_line);
    let oracleTextDisplay = "none";
    if (card.oracle_text) {
      oracleTextDisplay = card.oracle_text.length > 100
        ? card.oracle_text.substring(0, 100) + "..."
        : card.oracle_text;
    }
    console.log("   oracle_text:", oracleTextDisplay);
    console.log("   colors:", card.colors);
    console.log("   color_identity:", card.color_identity);
    console.log("   rarity:", card.rarity);
    console.log("   set:", card.set);
    console.log("   legalities.brawl:", card.legalities?.brawl);
    console.log("   games:", card.games);
    console.log("   layout:", card.layout);
    console.log("   card_faces:", card.card_faces ? `${card.card_faces.length} faces` : "none");
  }

  /**
   * Log detailed information about a processed card (after transformation)
   */
  static logProcessedCard(card: ProcessedCard, stage: string = "Processed Card"): void {
    if (!this.isWatchCard(card.name) && !this.isWatchCard(card.original_name)) return;

    console.log(`\n🎯 WATCH CARD - ${stage}`);
    console.log(`📋 Card: ${card.name || card.original_name}`);
    console.log("📊 Processed Data:");
    console.log("   oracle_id:", card.oracle_id);
    console.log("   original_name:", card.original_name);
    console.log("   name (display):", card.name);
    console.log("   search_key:", card.search_key);
    console.log("   mana_cost:", card.mana_cost);
    console.log("   cmc:", card.cmc);
    console.log("   type_line:", card.type_line);
    let processedOracleTextDisplay = "none";
    if (card.oracle_text) {
      processedOracleTextDisplay = card.oracle_text.length > 100
        ? card.oracle_text.substring(0, 100) + "..."
        : card.oracle_text;
    }
    console.log("   oracle_text:", processedOracleTextDisplay);
    console.log("   colors:", card.colors);
    console.log("   color_identity:", card.color_identity);
    console.log("   rarity:", card.rarity);
    console.log("   set_code:", card.set_code);
    console.log("   can_be_commander:", card.can_be_commander);
    console.log("   can_be_companion:", card.can_be_companion);
    console.log("   companion_restriction:", card.companion_restriction);
    console.log("   arena_legal_sets:", card.arena_legal_sets);
    console.log("   display_hints:", card.display_hints);
  }

  /**
   * Log the complete transformation pipeline for a watch card
   */
  static logCardTransformation(rawCard: ScryfallCard, processedCard: ProcessedCard): void {
    if (!this.isWatchCard(rawCard.name)) return;

    console.log(`\n🔄 WATCH CARD - Complete Transformation`);
    console.log(`📋 Card: ${rawCard.name}`);
    console.log("\n📥 BEFORE (Raw Scryfall):");
    console.log("   name:", rawCard.name);
    console.log("   type_line:", rawCard.type_line);
    console.log("   mana_cost:", rawCard.mana_cost);
    console.log("   colors:", rawCard.colors);
    console.log("   rarity:", rawCard.rarity);
    console.log("   set:", rawCard.set);
    console.log("   legalities.brawl:", rawCard.legalities?.brawl);

    console.log("\n📤 AFTER (Processed):");
    console.log("   original_name:", processedCard.original_name);
    console.log("   name (display):", processedCard.name);
    console.log("   search_key:", processedCard.search_key);
    console.log("   type_line:", processedCard.type_line);
    console.log("   mana_cost:", processedCard.mana_cost);
    console.log("   colors:", processedCard.colors);
    console.log("   rarity:", processedCard.rarity);
    console.log("   set_code:", processedCard.set_code);
    console.log("   can_be_commander:", processedCard.can_be_commander);
    console.log("   can_be_companion:", processedCard.can_be_companion);

    console.log("\n🔍 KEY TRANSFORMATIONS:");
    if (rawCard.name !== processedCard.name) {
      console.log(`   Name: "${rawCard.name}" → "${processedCard.name}"`);
    }
    if (rawCard.set !== processedCard.set_code) {
      console.log(`   Set: "${rawCard.set}" → "${processedCard.set_code}"`);
    }
    console.log(`   Search Key: "${processedCard.search_key}"`);
    console.log(`   Commander: ${processedCard.can_be_commander}`);
    console.log(`   Companion: ${processedCard.can_be_companion}`);
  }
}
