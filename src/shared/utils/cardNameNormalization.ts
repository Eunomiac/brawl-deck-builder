/**
 * Card Name Normalization Utility
 *
 * Single source of truth for card name normalization used throughout the application.
 * Handles Alchemy prefixes, special characters, slash formatting, and other transformations
 * to create consistent, searchable card names.
 */

export class CardNameNormalizer {
  /**
   * Normalize a card name for display purposes
   * Applies character normalization and formatting but keeps it human-readable
   *
   * @param name - The original card name from Scryfall
   * @returns The display-friendly normalized card name
   */
  static normalizeForDisplay(name: string): string {
    if (!name || typeof name !== 'string') {
      return '';
    }

    let normalized = name.trim();

    // =================================================================
    // DISPLAY NORMALIZATION TRANSFORMATIONS
    // =================================================================
    // Normalize for readability but keep human-friendly


    // Standardize slash separators for split cards, and allow at most two parts
    // (Fire / Ice, Fire///Ice, Fire // Ice → Fire // Ice)
    if (normalized.includes('/')) {
      return normalized
        .split(/\s*\/[\s/]*\s*/)
        .slice(0,2)
        .map((part) => this.normalizeForDisplay(part))
        .join(' // ');
    }

    // Remove Alchemy prefixes from both halves of double-faced cards
    // (A-Front Name // A-Back Name → Front Name // Back Name)
    normalized = normalized.replace(/^A-/, '').replace(/ \/\/ A-/g, ' // ');

    // Handle specific character replacements FIRST (before NFD decomposition)
    // Most characters get simple one-for-one swaps to their natural Western equivalent
    normalized = normalized
      .replace(/ä/g, 'a').replace(/Ä/g, 'A')  // ä → a, Ä → A
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')  // ö → o, Ö → O
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')  // ü → u, Ü → U
      .replace(/ç/g, 'c').replace(/Ç/g, 'C')  // ç → c, Ç → C
      .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')  // ñ → n, Ñ → N
      // Special cases that need multi-character replacements
      .replace(/æ/g, 'ae').replace(/Æ/g, 'Ae') // æ → ae, Æ → Ae (ligature)
      .replace(/œ/g, 'oe').replace(/Œ/g, 'Oe') // œ → oe, Œ → Oe (ligature)
      .replace(/ß/g, 'ss');               // ß → ss (German eszett)

    // THEN handle remaining accented characters via NFD decomposition
    normalized = normalized
      .normalize('NFD')                    // Decompose remaining accented characters
      .replace(/[\u0300-\u036f]/g, '');   // Remove diacritical marks

    // Clean up extra whitespace but keep normal spacing
    normalized = normalized
      .replace(/\s+/g, ' ')               // Collapse multiple spaces
      .trim();                            // Remove leading/trailing spaces

    // =================================================================
    // END DISPLAY NORMALIZATION TRANSFORMATIONS
    // =================================================================

    return normalized;
  }

  /**
   * Normalize a card name for search/lookup purposes
   * Applies aggressive normalization for consistent searching
   *
   * @param name - The original card name from Scryfall
   * @returns The fully normalized search key
   */
  static normalizeForSearch(name: string): string {
    if (!name || typeof name !== 'string') {
      return '';
    }

    let normalized = name.trim();

    // =================================================================
    // SEARCH NORMALIZATION TRANSFORMATIONS
    // =================================================================
    // Aggressive normalization for search matching

    // Remove Alchemy prefixes from both halves of double-faced cards
    // (A-Front Name // A-Back Name → Front Name // Back Name)
    normalized = normalized.replace(/^A-/, '').replace(/ \/\/ A-/g, ' // ');

    // Standardize slash separators for split cards
    // (Fire / Ice, Fire///Ice, Fire // Ice → Fire // Ice)
    normalized = normalized.replace(/\s*\/+\s*/g, ' // ');

    // Handle specific character replacements FIRST (before NFD decomposition)
    // Most characters get simple one-for-one swaps to their natural Western equivalent
    normalized = normalized
      .replace(/ä/g, 'a').replace(/Ä/g, 'A')  // ä → a, Ä → A
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')  // ö → o, Ö → O
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')  // ü → u, Ü → U
      .replace(/ç/g, 'c').replace(/Ç/g, 'C')  // ç → c, Ç → C
      .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')  // ñ → n, Ñ → N
      // Special cases that need multi-character replacements
      .replace(/æ/g, 'ae').replace(/Æ/g, 'Ae') // æ → ae, Æ → Ae (ligature)
      .replace(/œ/g, 'oe').replace(/Œ/g, 'Oe') // œ → oe, Œ → Oe (ligature)
      .replace(/ß/g, 'ss');               // ß → ss (German eszett)

    // THEN handle remaining accented characters via NFD decomposition
    normalized = normalized
      .normalize('NFD')                    // Decompose remaining accented characters
      .replace(/[\u0300-\u036f]/g, '');   // Remove diacritical marks

    // Convert to lowercase for consistent searching
    normalized = normalized.toLowerCase();

    // Aggressive normalization: Strip all non-alphanumeric except protected separators
    normalized = normalized
      .replace(/ \/\/ /g, 'ZZZZZ')        // Protect double-faced card separator
      .replace(/[^a-z0-9Z]/g, '')         // Strip everything except alphanumeric + our marker
      .replace(/ZZZZZ/g, ' // ');         // Restore the separator

    // =================================================================
    // END SEARCH NORMALIZATION TRANSFORMATIONS
    // =================================================================

    return normalized;
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use normalizeForSearch() instead
   */
  static normalize(name: string): string {
    return this.normalizeForSearch(name);
  }

  /**
   * Check if a card name would be modified by normalization
   * Useful for determining if we need to preserve the original name
   *
   * @param originalName - The original card name
   * @param normalizedName - The normalized card name
   * @returns True if the names differ (normalization occurred)
   */
  static wasNormalized(originalName: string, normalizedName: string): boolean {
    return originalName !== normalizedName;
  }

  /**
   * Get information about what modifications were applied during normalization
   * Useful for debugging and understanding normalization behavior
   *
   * @param originalName - The original card name
   * @returns Object describing what changes were made
   */
  static getModificationInfo(originalName: string): {
    hadAlchemyPrefix: boolean;
    hadSpecialCharacters: boolean;
    hadNonStandardSlashes: boolean;
    hadExtraWhitespace: boolean;
    normalizedName: string;
  } {
    const normalizedName = this.normalizeForSearch(originalName);

    return {
      hadAlchemyPrefix: originalName.startsWith('A-'),
      hadSpecialCharacters: /[àáâãäåæçèéêëìíîïñòóôõöøùúûüýß]/i.test(originalName),
      hadNonStandardSlashes: /\s*\/+\s*/.test(originalName) && !/\s\/\/\s/.test(originalName),
      hadExtraWhitespace: /\s{2,}/.test(originalName) || originalName !== originalName.trim(),
      normalizedName
    };
  }
}
