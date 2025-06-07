// Card Import Button Component
// Provides UI for importing cards from Scryfall bulk data

import { useState, useEffect, useCallback } from "react";
import { useCardImport } from "../../../shared/hooks";

interface CardImportButtonProps {
  className?: string;
  onImportSuccess?: (cardCount: number) => void;
  onImportError?: (error?: string) => void;
  onImportStart?: () => void;
}

export function CardImportButton({
  className = "",
  onImportSuccess,
  onImportError,
  onImportStart
}: Readonly<CardImportButtonProps>) {
  const {
    isImporting,
    progress,
    result,
    progressPercentage,
    progressMessage,
    startImport,
    checkForUpdates,
    getImportStatus,
    resetImport,
    getFormattedDuration,
  } = useCardImport();

  const [updateInfo, setUpdateInfo] = useState<{
    needsUpdate: boolean;
    lastImport: Date | null;
    cardCount: number;
  } | null>(null);

  const [importStatus, setImportStatus] = useState<{
    hasCards: boolean;
    cardCount: number;
    lastImport: Date | null;
  } | null>(null);

  // Common function to refresh status
  const refreshStatus = useCallback(async () => {
    const [updates, status] = await Promise.all([
      checkForUpdates(),
      getImportStatus(),
    ]);

    setUpdateInfo(updates);
    setImportStatus(status);
  }, [checkForUpdates, getImportStatus]);

  // Check for updates and import status on mount
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Handle import completion
  useEffect(() => {
    if (result && !isImporting) {
      if (result.success) {
        onImportSuccess?.(result.totalSaved);
      } else {
        onImportError?.(result.errors?.[0] ?? "Unknown error");
      }

      // Refresh status after import
      refreshStatus();
    }
  }, [result, isImporting, onImportSuccess, onImportError, refreshStatus]);

  const handleImportClick = async () => {
    try {
      if (onImportStart) {
        onImportStart();
      }

      await startImport(true); // Clear existing cards
    } catch (error) {
      console.error("Failed to start import:", error);
    }
  };

  const getButtonText = (): string => {
    if (isImporting) {
      return "Importing...";
    }

    if (importStatus?.hasCards) {
      return updateInfo?.needsUpdate ? "Update Cards" : "Reimport Cards";
    }

    return "Import Cards";
  };

  const getStatusText = (): string => {
    if (isImporting) {
      return progressMessage;
    }

    if (result) {
      if (result.success) {
        return `✅ Import complete! ${result.totalSaved} cards saved in ${getFormattedDuration(result.duration)}`;
      } else {
        return `❌ Import failed: ${result.errors?.[0] ?? "Unknown error"}`;
      }
    }

    if (importStatus?.hasCards) {
      const lastImportText = importStatus.lastImport
        ? new Date(importStatus.lastImport).toLocaleDateString()
        : "Unknown";

      if (updateInfo?.needsUpdate) {
        return `📊 ${importStatus.cardCount} cards (Update available - last import: ${lastImportText})`;
      } else {
        return `📊 ${importStatus.cardCount} cards (Up to date - last import: ${lastImportText})`;
      }
    }

    return "No cards imported yet";
  };

  const getProgressBarColor = (): string => {
    if (!progress) return "bg-blue-500";

    switch (progress.status) {
      case "fetching_metadata":
        return "bg-blue-500";
      case "downloading_data":
        return "bg-yellow-500";
      case "processing_cards":
        return "bg-orange-500";
      case "saving_to_database":
        return "bg-green-500";
      case "complete":
        return "bg-green-600";
      case "error":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className={`card-import-button ${className}`}>
      <div className="import-controls">
        <button
          onClick={handleImportClick}
          disabled={isImporting}
          className={`
            import-button
            ${isImporting ? "importing" : ""}
            ${updateInfo?.needsUpdate ? "update-available" : ""}
          `}
        >
          {getButtonText()}
        </button>

        {result && !isImporting && (
          <button
            onClick={resetImport}
            className="reset-button"
          >
            Clear Status
          </button>
        )}
      </div>

      <div className="import-status">
        <div className="status-text">
          {getStatusText()}
        </div>

        {isImporting && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className={`progress-fill ${getProgressBarColor()}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="progress-text">
              {Math.round(progressPercentage)}%
            </div>
          </div>
        )}

        {progress?.totalCards && (
          <div className="import-details">
            {progress.processedCards && (
              <span>Processed: {progress.processedCards}/{progress.totalCards}</span>
            )}
            {progress.savedCards && (
              <span>Saved: {progress.savedCards}</span>
            )}
            {progress.errorCount && progress.errorCount > 0 && (
              <span className="error-count">Errors: {progress.errorCount}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
