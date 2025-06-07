// Scryfall API Service
// Handles communication with Scryfall API for bulk data downloads

import type { ScryfallBulkData, ScryfallCard } from "../../types/mtg";

/**
 * Scryfall API base URL
 */
const SCRYFALL_API_BASE = "https://api.scryfall.com";

/**
 * Scryfall API client for fetching bulk data
 */
export class ScryfallAPI {
  /**
   * Fetch bulk data metadata from Scryfall
   * Returns information about available bulk data files
   */
  static async getBulkDataList(): Promise<ScryfallBulkData[]> {
    try {
      const response = await fetch(`${SCRYFALL_API_BASE}/bulk-data`);

      if (!response.ok) {
        throw new Error(`Failed to fetch bulk data list: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      assert(data.data && Array.isArray(data.data), "Invalid bulk data response format");

      return data.data as ScryfallBulkData[];
    } catch (error) {
      console.error("Error fetching Scryfall bulk data list:", error);
      throw error;
    }
  }

  /**
   * Get the Oracle Cards bulk data metadata
   * This is the main dataset we need for card information
   */
  static async getOracleCardsBulkData(): Promise<ScryfallBulkData> {
    const bulkDataList = await this.getBulkDataList();

    const oracleData = bulkDataList.find(
      (item) => item.type === "oracle_cards"
    );

    assert(oracleData, "Oracle cards bulk data not found");

    return oracleData;
  }

  /**
   * Download and parse bulk card data from Scryfall
   * Returns an array of all cards from the bulk data file
   */
  static async downloadBulkCardData(
    bulkData: ScryfallBulkData,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<ScryfallCard[]> {
    try {
      console.log(`📥 Downloading bulk data: ${bulkData.name} (${Math.round(bulkData.size / 1024 / 1024)}MB)`);

      const response = await fetch(bulkData.download_uri);

      if (!response.ok) {
        throw new Error(`Failed to download bulk data: ${response.status} ${response.statusText}`);
      }

      // Get content length for progress tracking
      const contentLength = response.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : bulkData.size;

      assert(response.body, "Response body is null");

      // Read the response with progress tracking
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        loaded += value.length;

        if (onProgress) {
          onProgress(loaded, total);
        }
      }

      // Combine chunks and decode
      const allChunks = new Uint8Array(loaded);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      const text = new TextDecoder().decode(allChunks);

      console.log("📊 Parsing JSON data...");
      const cards = JSON.parse(text) as ScryfallCard[];

      assert(Array.isArray(cards), "Invalid card data format - expected array");

      console.log(`✅ Downloaded and parsed ${cards.length} cards`);
      return cards;

    } catch (error) {
      console.error("Error downloading bulk card data:", error);
      throw error;
    }
  }

  /**
   * Download Oracle Cards bulk data
   * Convenience method that combines metadata fetch and download
   */
  static async downloadOracleCards(
    onProgress?: (loaded: number, total: number) => void
  ): Promise<ScryfallCard[]> {
    const bulkData = await this.getOracleCardsBulkData();
    return this.downloadBulkCardData(bulkData, onProgress);
  }

  /**
   * Check if bulk data has been updated since a given date
   */
  static async isBulkDataUpdated(lastUpdate: Date): Promise<boolean> {
    try {
      const bulkData = await this.getOracleCardsBulkData();
      const updatedAt = new Date(bulkData.updated_at);
      return updatedAt > lastUpdate;
    } catch (error) {
      console.error("Error checking bulk data update status:", error);
      // If we can't check, assume it's updated to be safe
      return true;
    }
  }

  /**
   * Get bulk data update information
   */
  static async getBulkDataInfo(): Promise<{
    name: string;
    description: string;
    size: number;
    updatedAt: Date;
    downloadUri: string;
  }> {
    const bulkData = await this.getOracleCardsBulkData();

    return {
      name: bulkData.name,
      description: bulkData.description,
      size: bulkData.size,
      updatedAt: new Date(bulkData.updated_at),
      downloadUri: bulkData.download_uri,
    };
  }
}

/**
 * Utility functions for working with Scryfall data
 */
export class ScryfallUtils {
  /**
   * Check if a card is legal in Brawl format on Arena
   */
  static isBrawlLegalOnArena(card: ScryfallCard): boolean {
    return (
      card.legalities.brawl === "legal" &&
      card.games.includes("arena")
    );
  }

  /**
   * Check if a card can be a Brawl commander
   */
  static canBeCommander(card: ScryfallCard): boolean {
    const typeLine = card.type_line.toLowerCase();
    return (
      typeLine.includes("legendary") &&
      (typeLine.includes("creature") || typeLine.includes("planeswalker"))
    );
  }

  /**
   * Check if a card can be a companion
   */
  static canBeCompanion(card: ScryfallCard): boolean {
    const oracleText = card.oracle_text?.toLowerCase() ?? "";
    return oracleText.includes("companion");
  }

  /**
   * Extract companion restriction from oracle text
   */
  static extractCompanionRestriction(card: ScryfallCard): string | undefined {
    if (!this.canBeCompanion(card) || !card.oracle_text) {
      return undefined;
    }

    // Extract the companion restriction text
    // This is a simplified version - might need refinement
    const oracleText = card.oracle_text;
    const companionRegex = /Companion[^(]*\(([^)]+)\)/i;
    const companionMatch = companionRegex.exec(oracleText);

    return companionMatch ? companionMatch[1].trim() : undefined;
  }

  /**
   * Get the best image URI for a card
   */
  static getBestImageUri(card: ScryfallCard): string | undefined {
    const imageUris = card.image_uris;
    if (!imageUris) return undefined;

    // Prefer normal size, fall back to others
    return imageUris.normal ?? imageUris.large ?? imageUris.small ?? imageUris.png;
  }

  /**
   * Get all possible names for a card (for search terms)
   */
  static getCardSearchTerms(card: ScryfallCard): Array<{ search_term: string; is_primary: boolean }> {
    const terms: Array<{ search_term: string; is_primary: boolean }> = [];

    // Primary name
    terms.push({ search_term: card.name, is_primary: true });

    // Handle double-faced cards
    if (card.card_faces && card.card_faces.length > 0) {
      // Add individual face names
      card.card_faces.forEach((face) => {
        if (face.name !== card.name) {
          terms.push({ search_term: face.name, is_primary: false });
        }
      });

      // Add combined name with " // " separator
      const combinedName = card.card_faces.map(face => face.name).join(" // ");
      if (combinedName !== card.name) {
        terms.push({ search_term: combinedName, is_primary: false });
      }
    }

    return terms;
  }
}
