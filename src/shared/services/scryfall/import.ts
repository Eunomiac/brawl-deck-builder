// Card Import Service
// Main orchestrator for the complete card import process

import { ScryfallAPI } from "./api";
import { CardProcessor } from "./processor";
import { CardDatabaseService } from "./database";
import type {
  CardImportProgress,
  CardImportResult,
  ScryfallCard,
  ProcessedCard
} from "../../types/mtg";
import { CardImportStatus } from "../../types/mtg";

/**
 * Main card import service that orchestrates the complete import process
 */
export class CardImportService {
  private static currentImport: Promise<CardImportResult> | null = null;

  /**
   * Check if an import is currently in progress
   */
  static isImportInProgress(): boolean {
    return this.currentImport !== null;
  }

  /**
   * Import cards from Scryfall with progress tracking
   */
  static async importCards(
    onProgress?: (progress: CardImportProgress) => void,
    clearExisting: boolean = true
  ): Promise<CardImportResult> {
    // Prevent multiple simultaneous imports
    if (this.currentImport) {
      throw new Error("Import already in progress");
    }

    const startTime = new Date();

    const updateProgress = (status: CardImportStatus, message: string, extra?: Partial<CardImportProgress>) => {
      if (onProgress) {
        onProgress({
          status,
          message,
          startTime,
          ...extra,
        });
      }
    };

    try {
      this.currentImport = this.performImport(
        updateProgress,
        clearExisting,
        startTime
      );

      const result = await this.currentImport;
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      updateProgress(CardImportStatus.Error, `Import failed: ${errorMessage}`);

      return {
        success: false,
        totalProcessed: 0,
        totalSaved: 0,
        totalSkipped: 0,
        totalErrors: 1,
        duration: Date.now() - startTime.getTime(),
        errors: [errorMessage],
      };
    } finally {
      this.currentImport = null;
    }
  }

  /**
   * Perform the actual import process
   */
  private static async performImport(
    updateProgress: (status: CardImportStatus, message: string, extra?: Partial<CardImportProgress>) => void,
    clearExisting: boolean,
    startTime: Date
  ): Promise<CardImportResult> {
    let rawCards: ScryfallCard[] = [];
    let processedCards: ProcessedCard[] = [];
    const errors: string[] = [];

    try {
      // Step 1: Fetch bulk data metadata
      updateProgress(CardImportStatus.FetchingMetadata, "Fetching Scryfall bulk data information...");

      const bulkDataInfo = await ScryfallAPI.getBulkDataInfo();
      console.log(`📊 Bulk data info:`, bulkDataInfo);

      // Step 2: Download bulk data
      updateProgress(CardImportStatus.DownloadingData, "Downloading card data from Scryfall...");

      rawCards = await ScryfallAPI.downloadOracleCards((loaded, total) => {
        const percentage = Math.round((loaded / total) * 100);
        updateProgress(
          CardImportStatus.DownloadingData,
          `Downloading card data... ${percentage}% (${Math.round(loaded / 1024 / 1024)}MB / ${Math.round(total / 1024 / 1024)}MB)`
        );
      });

      updateProgress(
        CardImportStatus.ProcessingCards,
        "Processing and filtering cards...",
        { totalCards: rawCards.length }
      );

      // Step 3: Process cards
      processedCards = await CardProcessor.processCardData(rawCards, (stage, current) => {
        updateProgress(
          CardImportStatus.ProcessingCards,
          `${stage}...`,
          {
            totalCards: rawCards.length,
            processedCards: current,
          }
        );
      });

      // Validate processed cards
      const validation = CardProcessor.validateProcessedCards(processedCards);
      if (!validation.valid) {
        errors.push(...validation.errors);
        console.warn("⚠️ Card validation issues:", validation);
      }

      if (validation.warnings.length > 0) {
        console.warn("⚠️ Card validation warnings:", validation.warnings);
      }

      // Step 4: Save to database
      updateProgress(
        CardImportStatus.SavingToDatabase,
        "Saving cards to database...",
        {
          totalCards: rawCards.length,
          processedCards: processedCards.length,
        }
      );

      // Clear existing data if requested
      if (clearExisting) {
        await CardDatabaseService.clearExistingCards();
      }

      // Insert cards in batches
      const { inserted, errors: insertErrors } = await CardDatabaseService.insertCardsBatch(
        processedCards,
        100, // batch size
        (inserted, total) => {
          updateProgress(
            CardImportStatus.SavingToDatabase,
            `Saving cards to database... ${inserted}/${total}`,
            {
              totalCards: rawCards.length,
              processedCards: processedCards.length,
              savedCards: inserted,
            }
          );
        }
      );

      errors.push(...insertErrors);

      // Step 5: Verify import
      const verification = await CardDatabaseService.verifyImport();
      if (verification.issues.length > 0) {
        errors.push(...verification.issues);
      }

      // Get statistics
      const stats = CardProcessor.getCardStatistics(processedCards);
      console.log("📊 Import statistics:", stats);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      updateProgress(
        CardImportStatus.Complete,
        `Import complete! Saved ${inserted} cards in ${Math.round(duration / 1000)}s`,
        {
          totalCards: rawCards.length,
          processedCards: processedCards.length,
          savedCards: inserted,
          errorCount: errors.length,
          endTime,
        }
      );

      return {
        success: errors.length === 0,
        totalProcessed: processedCards.length,
        totalSaved: inserted,
        totalSkipped: rawCards.length - processedCards.length,
        totalErrors: errors.length,
        duration,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Import failed:", error);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      return {
        success: false,
        totalProcessed: processedCards.length,
        totalSaved: 0,
        totalSkipped: 0,
        totalErrors: 1,
        duration,
        errors: [errorMessage],
      };
    }
  }

  /**
   * Check if cards need to be updated
   */
  static async checkForUpdates(): Promise<{
    needsUpdate: boolean;
    lastImport: Date | null;
    lastScryfallUpdate: Date | null;
    cardCount: number;
  }> {
    try {
      const [lastImport, bulkDataInfo, cardCount] = await Promise.all([
        CardDatabaseService.getLastImportTime(),
        ScryfallAPI.getBulkDataInfo(),
        CardDatabaseService.getCardCount(),
      ]);

      const needsUpdate = !lastImport || bulkDataInfo.updatedAt > lastImport || cardCount === 0;

      return {
        needsUpdate,
        lastImport,
        lastScryfallUpdate: bulkDataInfo.updatedAt,
        cardCount,
      };
    } catch (error) {
      console.error("Error checking for updates:", error);
      return {
        needsUpdate: true, // Assume update needed if we can't check
        lastImport: null,
        lastScryfallUpdate: null,
        cardCount: 0,
      };
    }
  }

  /**
   * Get import status information
   */
  static async getImportStatus(): Promise<{
    hasCards: boolean;
    cardCount: number;
    lastImport: Date | null;
    isImportInProgress: boolean;
  }> {
    const cardCount = await CardDatabaseService.getCardCount();
    const lastImport = await CardDatabaseService.getLastImportTime();

    return {
      hasCards: cardCount > 0,
      cardCount,
      lastImport,
      isImportInProgress: this.isImportInProgress(),
    };
  }
}
