// Scryfall Data Debugging Utilities
// Tools for inspecting and analyzing imported card data

import { supabase } from "../../../services/supabase/client";
import type { Json } from "../../../services/supabase/types";

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
 * Debugging utilities for inspecting imported Scryfall data
 */
export class ScryfallDebugger {
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
    summary: {
      totalCards: number;
      commanders: number;
      companions: number;
      byRarity: Record<string, number>;
      byColorIdentity: Record<string, number>;
      bySets: Record<string, number>;
      cmcDistribution: Record<number, number>;
    };
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
}
