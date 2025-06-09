// MTG Brawl Deck Builder - CardPile Base Class
// Foundational class for all card collections in the application

import type { ProcessedCard,  } from "../types/mtg";
import { MTGColor } from "../types/mtg";

/**
 * Represents a mana distribution across the five MTG colors
 */
export interface ManaDistribution {
  white: number;
  blue: number;
  black: number;
  red: number;
  green: number;
  colorless: number;
  multicolor: number;
}

/**
 * Represents card type distribution
 */
export interface TypeDistribution {
  creatures: number;
  instants: number;
  sorceries: number;
  artifacts: number;
  enchantments: number;
  planeswalkers: number;
  lands: number;
  other: number;
}

/**
 * Validation result for card operations
 */
export interface CardValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Options for adding cards to a CardPile
 */
export interface AddCardOptions {
  allowDuplicates?: boolean;
  validateFormat?: boolean;
  skipValidation?: boolean;
}

/**
 * Options for removing cards from a CardPile
 */
export interface RemoveCardOptions {
  removeAll?: boolean; // Remove all copies if duplicates exist
  skipValidation?: boolean;
}

/**
 * Base class for all card collections in the MTG Brawl Deck Builder.
 * Provides unified interface for managing cards regardless of collection type.
 */
export abstract class CardPile {
  protected _cards: ProcessedCard[] = [];
  protected _name: string;
  protected _description?: string;

  constructor(name: string, cards: ProcessedCard[] = [], description?: string) {
    this._name = name;
    this._description = description;
    this._cards = [...cards]; // Create defensive copy
  }

  // ===== BASIC PROPERTIES =====

  /**
   * Get the name of this card pile
   */
  get name(): string {
    return this._name;
  }

  /**
   * Set the name of this card pile
   */
  set name(value: string) {
    this._name = value;
  }

  /**
   * Get the description of this card pile
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * Set the description of this card pile
   */
  set description(value: string | undefined) {
    this._description = value;
  }

  /**
   * Get a defensive copy of all cards in this pile
   */
  get cards(): ProcessedCard[] {
    return [...this._cards];
  }

  /**
   * Get the number of cards in this pile
   */
  get cardCount(): number {
    return this._cards.length;
  }

  /**
   * Check if this pile is empty
   */
  get isEmpty(): boolean {
    return this._cards.length === 0;
  }

  // ===== CARD MANAGEMENT =====

  /**
   * Add a card to this pile
   */
  addCard(card: ProcessedCard, options: AddCardOptions = {}): CardValidationResult {
    const { allowDuplicates = false, validateFormat = true, skipValidation = false } = options;

    if (!skipValidation) {
      // Check for duplicates if not allowed
      if (!allowDuplicates && this.contains(card)) {
        return {
          isValid: false,
          errors: [`Card "${card.name}" already exists in ${this._name}`],
          warnings: []
        };
      }

      // Perform format validation if requested
      if (validateFormat) {
        const validation = this.validateCardAddition(card);
        if (!validation.isValid) {
          return validation;
        }
      }
    }

    this._cards.push(card);
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  /**
   * Add multiple cards to this pile
   */
  addCards(cards: ProcessedCard[], options: AddCardOptions = {}): CardValidationResult {
    const results: CardValidationResult[] = [];
    const addedCards: ProcessedCard[] = [];

    for (const card of cards) {
      const result = this.addCard(card, options);
      results.push(result);

      if (!result.isValid) {
        // Rollback any cards that were added before this failure
        for (const addedCard of addedCards) {
          this.removeCard(addedCard, { skipValidation: true });
        }
        return result;
      }
      addedCards.push(card);
    }

    // Combine all warnings
    const allWarnings = results.flatMap(r => r.warnings);
    return {
      isValid: true,
      errors: [],
      warnings: allWarnings
    };
  }

  /**
   * Remove a card from this pile
   */
  removeCard(card: ProcessedCard, options: RemoveCardOptions = {}): CardValidationResult {
    const { removeAll = false, skipValidation = false } = options;

    if (!skipValidation) {
      const validation = this.validateCardRemoval(card);
      if (!validation.isValid) {
        return validation;
      }
    }

    if (removeAll) {
      // Remove all copies of this card
      this._cards = this._cards.filter(c => c.oracle_id !== card.oracle_id);
    } else {
      // Remove only the first occurrence
      const index = this._cards.findIndex(c => c.oracle_id === card.oracle_id);
      if (index !== -1) {
        this._cards.splice(index, 1);
      }
    }

    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  /**
   * Remove multiple cards from this pile
   */
  removeCards(cards: ProcessedCard[], options: RemoveCardOptions = {}): CardValidationResult {
    const results: CardValidationResult[] = [];

    for (const card of cards) {
      const result = this.removeCard(card, options);
      results.push(result);

      if (!result.isValid) {
        return result;
      }
    }

    // Combine all warnings
    const allWarnings = results.flatMap(r => r.warnings);
    return {
      isValid: true,
      errors: [],
      warnings: allWarnings
    };
  }

  /**
   * Clear all cards from this pile
   */
  clear(): void {
    this._cards = [];
  }

  /**
   * Check if this pile contains a specific card
   */
  contains(card: ProcessedCard): boolean {
    return this._cards.some(c => c.oracle_id === card.oracle_id);
  }

  /**
   * Check if this pile contains a card with the given oracle ID
   */
  containsOracleId(oracleId: string): boolean {
    return this._cards.some(c => c.oracle_id === oracleId);
  }

  /**
   * Get a card by its oracle ID
   */
  getCardByOracleId(oracleId: string): ProcessedCard | undefined {
    return this._cards.find(c => c.oracle_id === oracleId);
  }

  /**
   * Get all cards with the given name
   */
  getCardsByName(name: string): ProcessedCard[] {
    return this._cards.filter(c => c.name === name);
  }

  // ===== ANALYSIS METHODS =====

  /**
   * Get the mana distribution of cards in this pile
   */
  get manaDistribution(): ManaDistribution {
    const distribution: ManaDistribution = {
      white: 0,
      blue: 0,
      black: 0,
      red: 0,
      green: 0,
      colorless: 0,
      multicolor: 0
    };

    for (const card of this._cards) {
      const colors = card.color_identity || [];

      if (colors.length === 0) {
        distribution.colorless++;
      } else if (colors.length === 1) {
        switch (colors[0]) {
          case MTGColor.White:
            distribution.white++;
            break;
          case MTGColor.Blue:
            distribution.blue++;
            break;
          case MTGColor.Black:
            distribution.black++;
            break;
          case MTGColor.Red:
            distribution.red++;
            break;
          case MTGColor.Green:
            distribution.green++;
            break;
        }
      } else {
        distribution.multicolor++;
      }
    }

    return distribution;
  }

  /**
   * Get the type distribution of cards in this pile
   */
  get typeDistribution(): TypeDistribution {
    const distribution: TypeDistribution = {
      creatures: 0,
      instants: 0,
      sorceries: 0,
      artifacts: 0,
      enchantments: 0,
      planeswalkers: 0,
      lands: 0,
      other: 0
    };

    for (const card of this._cards) {
      const typeLine = card.type_line?.toLowerCase() || "";

      if (typeLine.includes("creature")) {
        distribution.creatures++;
      } else if (typeLine.includes("instant")) {
        distribution.instants++;
      } else if (typeLine.includes("sorcery")) {
        distribution.sorceries++;
      } else if (typeLine.includes("artifact")) {
        distribution.artifacts++;
      } else if (typeLine.includes("enchantment")) {
        distribution.enchantments++;
      } else if (typeLine.includes("planeswalker")) {
        distribution.planeswalkers++;
      } else if (typeLine.includes("land")) {
        distribution.lands++;
      } else {
        distribution.other++;
      }
    }

    return distribution;
  }

  /**
   * Get the combined color identity of all cards in this pile
   */
  get colorIdentity(): string[] {
    const colors = new Set<string>();

    for (const card of this._cards) {
      if (card.color_identity) {
        for (const color of card.color_identity) {
          colors.add(color);
        }
      }
    }

    return Array.from(colors).sort( (a, b) => a.localeCompare(b));
  }

  /**
   * Get the average converted mana cost of cards in this pile
   */
  get averageCMC(): number {
    if (this._cards.length === 0) return 0;

    const totalCMC = this._cards.reduce((sum, card) => sum + (card.cmc || 0), 0);
    return totalCMC / this._cards.length;
  }

  /**
   * Get the most recent set represented in this pile
   */
  get newestIncludedSet(): string | undefined {
    if (this._cards.length === 0) return undefined;

    // This would need set release date data to work properly
    // For now, just return the first set found
    return this._cards[0]?.set_code;
  }

  /**
   * Check if this pile contains duplicate cards (by oracle_id)
   */
  get includesDuplicates(): boolean {
    const oracleIds = new Set<string>();

    for (const card of this._cards) {
      if (oracleIds.has(card.oracle_id)) {
        return true;
      }
      oracleIds.add(card.oracle_id);
    }

    return false;
  }

  /**
   * Get all duplicate cards in this pile
   */
  getDuplicates(): ProcessedCard[] {
    const seen = new Set<string>();
    const duplicates: ProcessedCard[] = [];

    for (const card of this._cards) {
      if (seen.has(card.oracle_id)) {
        duplicates.push(card);
      } else {
        seen.add(card.oracle_id);
      }
    }

    return duplicates;
  }

  /**
   * Check if this pile is valid for a given color identity
   */
  isValidForColorIdentity(allowedColors: string[]): boolean {
    const pileColors = this.colorIdentity;
    return pileColors.every(color => allowedColors.includes(color));
  }

  /**
   * Get cards that violate the given color identity
   */
  getColorIdentityViolations(allowedColors: string[]): ProcessedCard[] {
    return this._cards.filter(card => {
      const cardColors = card.color_identity || [];
      return !cardColors.every(color => allowedColors.includes(color));
    });
  }

  // ===== FILTERING AND SEARCHING =====

  /**
   * Filter cards by type
   */
  getCardsByType(type: string): ProcessedCard[] {
    const lowerType = type.toLowerCase();
    return this._cards.filter(card =>
      card.type_line?.toLowerCase().includes(lowerType)
    );
  }

  /**
   * Filter cards by color identity
   */
  getCardsByColorIdentity(colors: string[]): ProcessedCard[] {
    return this._cards.filter(card => {
      const cardColors = card.color_identity || [];
      return cardColors.every(color => colors.includes(color));
    });
  }

  /**
   * Filter cards by CMC
   */
  getCardsByCMC(cmc: number): ProcessedCard[] {
    return this._cards.filter(card => card.cmc === cmc);
  }

  /**
   * Filter cards by CMC range
   */
  getCardsByCMCRange(minCMC: number, maxCMC: number): ProcessedCard[] {
    return this._cards.filter(card => {
      const cardCMC = card.cmc || 0;
      return cardCMC >= minCMC && cardCMC <= maxCMC;
    });
  }

  /**
   * Search cards by name (partial match)
   */
  searchByName(query: string): ProcessedCard[] {
    const lowerQuery = query.toLowerCase();
    return this._cards.filter(card =>
      card.name?.toLowerCase().includes(lowerQuery) ||
      card.search_key?.toLowerCase().includes(lowerQuery)
    );
  }

  // ===== ABSTRACT METHODS =====
  // These must be implemented by subclasses

  /**
   * Validate whether a card can be added to this pile
   * Subclasses should implement format-specific validation
   */
  protected abstract validateCardAddition(card: ProcessedCard): CardValidationResult;

  /**
   * Validate whether a card can be removed from this pile
   * Subclasses should implement format-specific validation
   */
  protected abstract validateCardRemoval(card: ProcessedCard): CardValidationResult;
}

/**
 * Basic CardPile implementation with minimal validation
 * Useful for general card collections and testing
 */
export class BasicCardPile extends CardPile {
  constructor(name: string, cards: ProcessedCard[] = [], description?: string) {
    super(name, cards, description);
  }

  protected validateCardAddition(_card: ProcessedCard): CardValidationResult { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Basic implementation allows all cards
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  protected validateCardRemoval(_card: ProcessedCard): CardValidationResult { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Basic implementation allows all removals - no restrictions on removal
    return {
      isValid: true,
      errors: [],
      warnings: [] // Empty warnings for removal validation
    };
  }
}
