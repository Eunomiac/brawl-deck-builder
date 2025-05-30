// MTG Brawl Deck Builder - Shared Enums
// Enums used across multiple files/components

/**
 * Animation direction for slide animations and similar directional effects
 * Used in GSAP hooks and animation utilities
 */
export enum AnimationDirection {
  Left = "left",
  Right = "right",
  Up = "up",
  Down = "down"
}

/**
 * Animation easing types for consistent animation feel
 * Maps to GSAP easing functions
 */
export enum AnimationEasing {
  Smooth = "power2.out",
  Bounce = "back.out(1.7)",
  Elastic = "elastic.out(1, 0.3)",
  Quick = "power1.out",
  CardFlip = "power2.inOut"
}

/**
 * Animation duration presets for consistent timing
 * Values in seconds
 */
export enum AnimationDuration {
  Fast = 0.2,
  Normal = 0.3,
  Slow = 0.5,
  ExtraSlow = 0.8
}

/**
 * Loading spinner size variants
 * Used in LoadingSpinner component
 */
export enum SpinnerSize {
  Small = "sm",
  Medium = "md",
  Large = "lg"
}

/**
 * Card rarity levels for MTG cards
 * Used for styling and filtering
 */
export enum CardRarity {
  Common = "common",
  Uncommon = "uncommon",
  Rare = "rare",
  Mythic = "mythic"
}

/**
 * MTG mana colors
 * Used for mana cost display and deck building
 */
export enum ManaColor {
  White = "W",
  Blue = "U",
  Black = "B",
  Red = "R",
  Green = "G",
  Colorless = "C"
}

/**
 * Deck building validation states
 * Used for deck legality checking
 */
export enum DeckValidationState {
  Valid = "valid",
  Invalid = "invalid",
  Warning = "warning",
  Pending = "pending"
}
