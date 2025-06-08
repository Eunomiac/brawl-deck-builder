// Set Date Utilities
// Helper functions for working with MTG set release dates

import { ScryfallUtils } from "../services/scryfall";
import type { ProcessedCard } from "../types/mtg";

/**
 * Example usage of the new set date functionality
 * This demonstrates how to use the set release dates extracted during card processing
 */

/**
 * Example: Sort a deck's set codes by release date to find when it could have been created
 */
export function dateDeckByMostRecentSet(
  deckSetCodes: string[],
  setReleaseDates: Record<string, string>
): {
  mostRecentSet: string;
  releaseDate: string;
  allSetsSorted: Array<{ setCode: string; releaseDate: string }>;
} | null {
  if (deckSetCodes.length === 0) return null;

  // Get the most recent set
  const mostRecent = ScryfallUtils.getMostRecentSet(deckSetCodes, setReleaseDates);
  if (!mostRecent) return null;

  // Sort all sets from most recent to oldest
  const sortedSets = ScryfallUtils.sortSetsByReleaseDate(deckSetCodes, setReleaseDates, false);
  
  return {
    mostRecentSet: mostRecent.setCode,
    releaseDate: mostRecent.releaseDate,
    allSetsSorted: sortedSets.map(setCode => ({
      setCode,
      releaseDate: setReleaseDates[setCode] || "1993-01-01"
    }))
  };
}

/**
 * Example: Get all Arena-legal sets sorted by release date
 */
export function getArenaSetsSortedByDate(
  processedCards: ProcessedCard[],
  setReleaseDates: Record<string, string>,
  ascending: boolean = false
): Array<{ setCode: string; releaseDate: string }> {
  const uniqueSetCodes = ScryfallUtils.getUniqueSetCodes(processedCards);
  const sortedSets = ScryfallUtils.sortSetsByReleaseDate(uniqueSetCodes, setReleaseDates, ascending);
  
  return sortedSets.map(setCode => ({
    setCode,
    releaseDate: setReleaseDates[setCode] || "1993-01-01"
  }));
}

/**
 * Example: Create a constant object with Arena-legal sets and their release dates
 * This can be used to generate a static constant for your codebase
 */
export function generateArenaLegalSetsConstant(
  processedCards: ProcessedCard[],
  setReleaseDates: Record<string, string>
): string {
  const uniqueSetCodes = ScryfallUtils.getUniqueSetCodes(processedCards);
  const sortedSets = ScryfallUtils.sortSetsByReleaseDate(uniqueSetCodes, setReleaseDates, true); // Oldest first for readability
  
  const entries = sortedSets.map(setCode => {
    const releaseDate = setReleaseDates[setCode] || "1993-01-01";
    return `  "${setCode}": "${releaseDate}"`;
  });

  return `// Arena-legal MTG sets with release dates
// Generated from Scryfall data
export const ARENA_LEGAL_SETS = {
${entries.join(",\n")}
} as const;

// Helper type for set codes
export type ArenaLegalSetCode = keyof typeof ARENA_LEGAL_SETS;
`;
}

/**
 * Example: Find sets released within a date range
 */
export function findSetsInDateRange(
  startDate: string, // YYYY-MM-DD format
  endDate: string,   // YYYY-MM-DD format
  setReleaseDates: Record<string, string>
): Array<{ setCode: string; releaseDate: string }> {
  const results: Array<{ setCode: string; releaseDate: string }> = [];
  
  for (const [setCode, releaseDate] of Object.entries(setReleaseDates)) {
    if (releaseDate >= startDate && releaseDate <= endDate) {
      results.push({ setCode, releaseDate });
    }
  }
  
  // Sort by release date
  return results.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
}
