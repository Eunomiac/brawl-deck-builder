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
   * Get the Default Cards bulk data metadata
   * This includes all printings (including digital-only Arena cards)
   * unlike oracle_cards which only includes "recognizable" versions
   */
  static async getDefaultCardsBulkData(): Promise<ScryfallBulkData> {
    const bulkDataList = await this.getBulkDataList();

    const defaultData = bulkDataList.find(
      (item) => item.type === "default_cards"
    );

    assert(defaultData, "Default cards bulk data not found");

    return defaultData;
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
   * Download Default Cards bulk data
   * Convenience method that combines metadata fetch and download
   */
  static async downloadDefaultCards(
    onProgress?: (loaded: number, total: number) => void
  ): Promise<ScryfallCard[]> {
    const bulkData = await this.getDefaultCardsBulkData();
    return this.downloadBulkCardData(bulkData, onProgress);
  }

  /**
   * Check if bulk data has been updated since a given date
   */
  static async isBulkDataUpdated(lastUpdate: Date): Promise<boolean> {
    try {
      const bulkData = await this.getDefaultCardsBulkData();
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
    const bulkData = await this.getDefaultCardsBulkData();

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
   * Normalize text by removing special characters and converting to lowercase
   */
  static normalizeText(text: string): string {
    return text
      .toLowerCase()
      // Handle specific character replacements first
      .replace(/æ/g, 'ae')
      .replace(/œ/g, 'oe')
      .replace(/ß/g, 'ss')
      // Then normalize and remove diacritical marks
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
      .replace(/[^a-z0-9\s]/g, ' ') // Replace non-alphanumeric with spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  }

  /**
   * Get all possible names for a card (for search terms)
   * Handles Alchemy variants, split cards, and special characters
   */
  static getCardSearchTerms(card: ScryfallCard): Array<{ search_term: string; is_primary: boolean }> {
    const terms: Array<{ search_term: string; is_primary: boolean }> = [];
    const addedTerms = new Set<string>(); // Prevent duplicates

    const addTerm = (term: string, isPrimary: boolean = false) => {
      const normalized = this.normalizeText(term);
      if (normalized && !addedTerms.has(normalized)) {
        addedTerms.add(normalized);
        terms.push({ search_term: normalized, is_primary: isPrimary });
      }
    };

    // Primary name (normalized)
    addTerm(card.name, true);

    // Handle Alchemy variants (A- prefix)
    if (card.name.startsWith('A-')) {
      // Add version without A- prefix
      const withoutPrefix = card.name.substring(2);
      addTerm(withoutPrefix, false);
    } else {
      // Add version with A- prefix (for reverse lookup)
      addTerm(`A-${card.name}`, false);
    }

    // Handle split cards (cards with // in name)
    if (card.name.includes('//')) {
      const parts = card.name.split('//').map(part => part.trim());

      // Add individual parts
      parts.forEach(part => {
        addTerm(part, false);

        // Also add Alchemy variants of each part
        if (part.startsWith('A-')) {
          addTerm(part.substring(2), false);
        } else {
          addTerm(`A-${part}`, false);
        }
      });

      // Add various separator combinations
      const separators = [' ', ' / ', ' // ', ' /// '];
      separators.forEach(sep => {
        addTerm(parts.join(sep), false);

        // Mixed Alchemy variants
        const alchemyParts = parts.map(part => part.startsWith('A-') ? part : `A-${part}`);
        addTerm(alchemyParts.join(sep), false);

        const nonAlchemyParts = parts.map(part => part.startsWith('A-') ? part.substring(2) : part);
        addTerm(nonAlchemyParts.join(sep), false);
      });
    }

    // Handle double-faced cards (card_faces)
    if (card.card_faces && card.card_faces.length > 0) {
      card.card_faces.forEach((face) => {
        if (face.name !== card.name) {
          addTerm(face.name, false);

          // Alchemy variants for faces
          if (face.name.startsWith('A-')) {
            addTerm(face.name.substring(2), false);
          } else {
            addTerm(`A-${face.name}`, false);
          }
        }
      });

      // Combined face names with various separators
      const faceNames = card.card_faces.map(face => face.name);
      const separators = [' ', ' / ', ' // ', ' /// '];
      separators.forEach(sep => {
        addTerm(faceNames.join(sep), false);
      });
    }

    return terms;
  }
}
