// MTG-specific TypeScript type definitions
// Types for Scryfall API responses and card processing

/**
 * Scryfall API Types
 * Based on Scryfall API documentation: https://scryfall.com/docs/api
 */

// Type aliases for repeated union types
export type LegalityStatus = "legal" | "not_legal" | "restricted" | "banned";

export interface ScryfallImageUris {
  small?: string;
  normal?: string;
  large?: string;
  png?: string;
  art_crop?: string;
  border_crop?: string;
}

export interface ScryfallLegalities {
  standard?: LegalityStatus;
  future?: LegalityStatus;
  historic?: LegalityStatus;
  gladiator?: LegalityStatus;
  pioneer?: LegalityStatus;
  explorer?: LegalityStatus;
  modern?: LegalityStatus;
  legacy?: LegalityStatus;
  pauper?: LegalityStatus;
  vintage?: LegalityStatus;
  penny?: LegalityStatus;
  commander?: LegalityStatus;
  brawl?: LegalityStatus;
  historicbrawl?: LegalityStatus;
  alchemy?: LegalityStatus;
  paupercommander?: LegalityStatus;
  duel?: LegalityStatus;
  oldschool?: LegalityStatus;
  premodern?: LegalityStatus;
}

export interface ScryfallCard {
  // Core identifiers
  id: string;
  oracle_id: string;
  name: string;

  // Mana and casting
  mana_cost?: string;
  cmc: number;

  // Card text and types
  type_line: string;
  oracle_text?: string;

  // Colors
  colors?: string[];
  color_identity?: string[];

  // Set information
  set: string;
  set_name: string;
  rarity: string;

  // Legalities and games
  legalities: ScryfallLegalities;
  games: string[];

  // Images and URIs
  image_uris?: ScryfallImageUris;
  scryfall_uri: string;

  // Layout and faces (for double-faced cards)
  layout: string;
  card_faces?: Array<{
    name: string;
    mana_cost?: string;
    type_line: string;
    oracle_text?: string;
    colors?: string[];
    image_uris?: ScryfallImageUris;
  }>;

  // Additional properties we might need
  keywords?: string[];
  produced_mana?: string[];
  reserved?: boolean;
  digital?: boolean;
  arena_id?: number;
  mtgo_id?: number;
}

export interface ScryfallBulkData {
  object: "bulk_data";
  id: string;
  type: string;
  updated_at: string;
  uri: string;
  name: string;
  description: string;
  size: number;
  download_uri: string;
  content_type: string;
  content_encoding?: string;
}

/**
 * Card Processing Types
 * Types used during import and processing
 */

export interface ProcessedCard {
  // Database fields
  oracle_id: string;
  original_name: string;
  name: string;
  search_key: string;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  color_identity?: string[];
  rarity: string;
  set_code: string;
  can_be_commander: boolean;
  can_be_companion: boolean;
  companion_restriction?: string;
  image_uris?: Record<string, string | undefined>;
  back_image_uris?: Record<string, string | undefined>;
  display_hints: {
    preferredOrientation: 'portrait' | 'landscape';
    hasBackFace: boolean;
    meldPartner: string | null;
  };
  scryfall_uri: string;

  // Search terms for this card
  search_terms: Array<{
    search_term: string;
    is_primary: boolean;
  }>;
}

/**
 * Import Progress and Status Types
 */

export enum CardImportStatus {
  Idle = "idle",
  FetchingMetadata = "fetching_metadata",
  DownloadingData = "downloading_data",
  ProcessingCards = "processing_cards",
  SavingToDatabase = "saving_to_database",
  Complete = "complete",
  Error = "error"
}

export interface CardImportProgress {
  status: CardImportStatus;
  message: string;
  totalCards?: number;
  processedCards?: number;
  savedCards?: number;
  skippedCards?: number;
  errorCount?: number;
  startTime?: Date;
  endTime?: Date;
}

export interface CardImportResult {
  success: boolean;
  totalProcessed: number;
  totalSaved: number;
  totalSkipped: number;
  totalErrors: number;
  duration: number;
  errors?: string[];
}

/**
 * Companion Restriction Types
 * For storing companion deckbuilding restrictions
 */

export interface CompanionRestriction {
  name: string;
  description: string;
  rules: Array<{
    type: "mana_value" | "card_type" | "color" | "custom";
    condition: string;
    value?: string | number;
  }>;
}

/**
 * Card Search Term Types
 */

export interface CardSearchTerm {
  search_term: string;
  is_primary: boolean;
}

/**
 * MTG Color Constants
 */

export enum MTGColor {
  White = "W",
  Blue = "U",
  Black = "B",
  Red = "R",
  Green = "G"
}

export const MTG_COLORS = Object.values(MTGColor);

/**
 * MTG Rarity Constants
 */

export enum MTGRarity {
  Common = "common",
  Uncommon = "uncommon",
  Rare = "rare",
  Mythic = "mythic"
}

export const MTG_RARITIES = Object.values(MTGRarity);
