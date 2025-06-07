// React hook for managing card import from Scryfall
import { useState, useCallback, useRef } from "react";
import { CardImportService } from "../services/scryfall";
import type { CardImportProgress, CardImportResult } from "../types/mtg";
import { CardImportStatus } from "../types/mtg";

/**
 * Hook for managing card import state and operations
 */
export function useCardImport() {
  const [progress, setProgress] = useState<CardImportProgress | null>(null);
  const [result, setResult] = useState<CardImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Start the card import process
   */
  const startImport = useCallback(async (clearExisting: boolean = true): Promise<CardImportResult> => {
    if (isImporting) {
      throw new Error("Import already in progress");
    }

    setIsImporting(true);
    setResult(null);
    setProgress(null);

    // Create abort controller for potential cancellation
    abortControllerRef.current = new AbortController();

    try {
      const importResult = await CardImportService.importCards(
        (progressUpdate) => {
          setProgress(progressUpdate);
        },
        clearExisting
      );

      setResult(importResult);
      return importResult;

    } catch (error) {
      const errorResult: CardImportResult = {
        success: false,
        totalProcessed: 0,
        totalSaved: 0,
        totalSkipped: 0,
        totalErrors: 1,
        duration: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };

      setResult(errorResult);
      return errorResult;

    } finally {
      setIsImporting(false);
      abortControllerRef.current = null;
    }
  }, [isImporting]);

  /**
   * Check if cards need to be updated
   */
  const checkForUpdates = useCallback(async () => {
    try {
      return await CardImportService.checkForUpdates();
    } catch (error) {
      console.error("Error checking for updates:", error);
      return {
        needsUpdate: true,
        lastImport: null,
        lastScryfallUpdate: null,
        cardCount: 0,
      };
    }
  }, []);

  /**
   * Get current import status
   */
  const getImportStatus = useCallback(async () => {
    try {
      return await CardImportService.getImportStatus();
    } catch (error) {
      console.error("Error getting import status:", error);
      return {
        hasCards: false,
        cardCount: 0,
        lastImport: null,
        isImportInProgress: false,
      };
    }
  }, []);

  /**
   * Reset import state
   */
  const resetImport = useCallback(() => {
    setProgress(null);
    setResult(null);
    setIsImporting(false);
  }, []);

  /**
   * Get current import progress percentage
   */
  const getProgressPercentage = useCallback((): number => {
    if (!progress) return 0;

    switch (progress.status) {
      case "idle":
        return 0;
      case "fetching_metadata":
        return 5;
      case "downloading_data":
        return 25;
      case "processing_cards":
        if (progress.totalCards && progress.processedCards) {
          return 25 + (progress.processedCards / progress.totalCards) * 50;
        }
        return 50;
      case "saving_to_database":
        if (progress.processedCards && progress.savedCards) {
          return 75 + (progress.savedCards / progress.processedCards) * 20;
        }
        return 85;
      case "complete":
        return 100;
      case "error":
        return 0;
      default:
        return 0;
    }
  }, [progress]);

  /**
   * Get formatted progress message
   */
  const getProgressMessage = useCallback((): string => {
    if (!progress) return "Ready to import";

    switch (progress.status) {
      case "idle":
        return "Ready to import";
      case "fetching_metadata":
        return "Fetching Scryfall data information...";
      case "downloading_data":
        return progress.message || "Downloading card data...";
      case "processing_cards":
        if (progress.totalCards && progress.processedCards) {
          return `Processing cards (${progress.processedCards}/${progress.totalCards})`;
        }
        return "Processing cards...";
      case "saving_to_database":
        if (progress.processedCards && progress.savedCards) {
          return `Saving to database (${progress.savedCards}/${progress.processedCards})`;
        }
        return "Saving to database...";
      case "complete":
        return progress.message || "Import complete!";
      case "error":
        return progress.message || "Import failed";
      default:
        return progress.message || "Processing...";
    }
  }, [progress]);

  /**
   * Get import duration in a human-readable format
   */
  const getFormattedDuration = useCallback((durationMs: number): string => {
    const seconds = Math.round(durationMs / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }, []);

  /**
   * Check if import is in a specific status
   */
  const isStatus = useCallback((status: CardImportStatus): boolean => {
    return progress?.status === status;
  }, [progress]);

  return {
    // State
    progress,
    result,
    isImporting,

    // Actions
    startImport,
    checkForUpdates,
    getImportStatus,
    resetImport,

    // Computed values
    progressPercentage: getProgressPercentage(),
    progressMessage: getProgressMessage(),

    // Utilities
    getFormattedDuration,
    isStatus,

    // Status checks
    isIdle: isStatus(CardImportStatus.Idle),
    isFetchingMetadata: isStatus(CardImportStatus.FetchingMetadata),
    isDownloading: isStatus(CardImportStatus.DownloadingData),
    isProcessing: isStatus(CardImportStatus.ProcessingCards),
    isSaving: isStatus(CardImportStatus.SavingToDatabase),
    isComplete: isStatus(CardImportStatus.Complete),
    isError: isStatus(CardImportStatus.Error),
  };
}
