// Sets Database Service
// Handles saving and retrieving MTG set data from the database

import { supabase } from "../../../services/supabase";
import type { TablesInsert } from "../../../services/supabase/types";

/**
 * Database service for MTG sets
 */
export class SetsDatabaseService {
  /**
   * Clear all existing set data from the database
   */
  static async clearExistingSets(): Promise<void> {
    console.log("🗑️ Clearing existing set data...");

    try {
      const { error } = await supabase
        .from("sets")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (error) {
        // Check if the table doesn't exist
        if (error.message.includes('relation "public.sets" does not exist')) {
          console.log("ℹ️ Sets table doesn't exist yet - skipping clear operation");
          return;
        }
        throw new Error(`Failed to clear sets: ${error.message}`);
      }

      console.log("✅ Existing set data cleared");
    } catch (error) {
      console.error("❌ Failed to clear existing set data:", error);
      throw error;
    }
  }

  /**
   * Save set data to the database
   */
  static async saveSets(setReleaseDates: Record<string, string>): Promise<{
    success: boolean;
    totalSaved: number;
    errors: string[];
  }> {
    console.log(`💾 Saving ${Object.keys(setReleaseDates).length} sets to database...`);

    const errors: string[] = [];
    let totalSaved = 0;

    try {
      // Prepare set data for insertion
      const setInserts: TablesInsert<"sets">[] = Object.entries(setReleaseDates).map(([setCode, releaseDate]) => ({
        set_code: setCode,
        name: setCode.toUpperCase(), // We'll use the set code as name for now
        released_at: releaseDate || null,
        set_type: null, // We don't have this info from card data
        digital: false, // Default to false, could be enhanced later
      }));

      // Insert sets in batches to avoid hitting database limits
      const batchSize = 100;
      for (let i = 0; i < setInserts.length; i += batchSize) {
        const batch = setInserts.slice(i, i + batchSize);

        try {
          const { error } = await supabase
            .from("sets")
            .insert(batch);

          if (error) {
            const errorMsg = `Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`;
            errors.push(errorMsg);
            console.warn(`⚠️ ${errorMsg}`);
            continue;
          }

          totalSaved += batch.length;
          console.log(`✅ Saved batch ${Math.floor(i / batchSize) + 1} (${batch.length} sets)`);

        } catch (batchError) {
          const errorMsg = `Batch ${Math.floor(i / batchSize) + 1}: ${batchError instanceof Error ? batchError.message : String(batchError)}`;
          errors.push(errorMsg);
          console.warn(`⚠️ ${errorMsg}`);
        }
      }

      const success = errors.length === 0;
      console.log(`${success ? "✅" : "⚠️"} Set saving complete: ${totalSaved} saved, ${errors.length} errors`);

      return {
        success,
        totalSaved,
        errors,
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("❌ Failed to save sets:", errorMsg);

      return {
        success: false,
        totalSaved,
        errors: [errorMsg],
      };
    }
  }

  /**
   * Get all sets from the database as a lookup map
   */
  static async getSetReleaseDates(): Promise<Record<string, string>> {
    console.log("📅 Fetching set release dates from database...");

    try {
      const { data, error } = await supabase
        .from("sets")
        .select("set_code, released_at")
        .order("set_code");

      if (error) {
        throw new Error(`Failed to fetch sets: ${error.message}`);
      }

      const setReleaseDates: Record<string, string> = {};

      for (const set of data || []) {
        setReleaseDates[set.set_code] = set.released_at ?? "1993-01-01";
      }

      console.log(`✅ Fetched ${Object.keys(setReleaseDates).length} sets from database`);
      return setReleaseDates;

    } catch (error) {
      console.error("❌ Failed to fetch set release dates:", error);
      throw error;
    }
  }

  /**
   * Get sets within a date range
   */
  static async getSetsInDateRange(startDate: string, endDate: string): Promise<Array<{
    setCode: string;
    name: string;
    releaseDate: string;
    setType: string | null;
    digital: boolean;
  }>> {
    console.log(`📅 Fetching sets between ${startDate} and ${endDate}...`);

    try {
      const { data, error } = await supabase
        .from("sets")
        .select("set_code, name, released_at, set_type, digital")
        .gte("released_at", startDate)
        .lte("released_at", endDate)
        .order("released_at");

      if (error) {
        throw new Error(`Failed to fetch sets in date range: ${error.message}`);
      }

      const results = (data || []).map(set => ({
        setCode: set.set_code,
        name: set.name,
        releaseDate: set.released_at ?? "1993-01-01",
        setType: set.set_type,
        digital: set.digital ?? false,
      }));

      console.log(`✅ Found ${results.length} sets in date range`);
      return results;

    } catch (error) {
      console.error("❌ Failed to fetch sets in date range:", error);
      throw error;
    }
  }

  /**
   * Get the most recent set from the database
   */
  static async getMostRecentSet(): Promise<{
    setCode: string;
    name: string;
    releaseDate: string;
  } | null> {
    console.log("📅 Fetching most recent set...");

    try {
      const { data, error } = await supabase
        .from("sets")
        .select("set_code, name, released_at")
        .order("released_at", { ascending: false })
        .limit(1);

      if (error) {
        throw new Error(`Failed to fetch most recent set: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.log("ℹ️ No sets found in database");
        return null;
      }

      const set = data[0];
      const result = {
        setCode: set.set_code,
        name: set.name,
        releaseDate: set.released_at ?? "1993-01-01",
      };

      console.log(`✅ Most recent set: ${result.setCode} (${result.releaseDate})`);
      return result;

    } catch (error) {
      console.error("❌ Failed to fetch most recent set:", error);
      throw error;
    }
  }
}
