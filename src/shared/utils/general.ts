// MTG Brawl Deck Builder - General Utility Functions
// Pure utility functions that can be easily unit tested

/**
 * Math Utilities
 */
export const mathUtils = {
  /**
   * Snap a value to the nearest grid position
   * @param gridSize - Size of the grid (default: 20)
   * @returns Function that snaps values to the grid
   */
  snapToGrid: (gridSize = 20) => (value: number) => Math.round(value / gridSize) * gridSize,

  /**
   * Clamp a number between min and max values
   * @param value - The value to clamp
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Clamped value
   */
  clamp: (value: number, min: number, max: number) => Math.min(Math.max(value, min), max),

  /**
   * Linear interpolation between two values
   * @param start - Start value
   * @param end - End value
   * @param progress - Progress between 0 and 1
   * @returns Interpolated value
   */
  lerp: (start: number, end: number, progress: number) => start + (end - start) * progress,

  /**
   * Map a value from one range to another
   * @param value - Input value
   * @param inMin - Input range minimum
   * @param inMax - Input range maximum
   * @param outMin - Output range minimum
   * @param outMax - Output range maximum
   * @returns Mapped value
   */
  mapRange: (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  },

  /**
   * Round a number to specified decimal places
   * @param value - Number to round
   * @param decimals - Number of decimal places (default: 2)
   * @returns Rounded number
   */
  roundTo: (value: number, decimals = 2) => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
};

/**
 * Array Utilities
 */
export const arrayUtils = {
  /**
   * Shuffle an array using Fisher-Yates algorithm
   * @param array - Array to shuffle
   * @returns New shuffled array
   */
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * Get a random element from an array
   * @param array - Array to pick from
   * @returns Random element or undefined if array is empty
   */
  randomElement: <T>(array: T[]): T | undefined => {
    if (array.length === 0) return undefined;
    return array[Math.floor(Math.random() * array.length)];
  },

  /**
   * Remove duplicates from an array
   * @param array - Array to deduplicate
   * @param keyFn - Optional function to extract comparison key
   * @returns Array with duplicates removed
   */
  unique: <T>(array: T[], keyFn?: (item: T) => unknown): T[] => {
    if (!keyFn) {
      return [...new Set(array)];
    }

    const seen = new Set();
    return array.filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  },

  /**
   * Chunk an array into smaller arrays of specified size
   * @param array - Array to chunk
   * @param size - Size of each chunk
   * @returns Array of chunks
   */
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
};

/**
 * String Utilities
 */
export const stringUtils = {
  /**
   * Capitalize the first letter of a string
   * @param str - String to capitalize
   * @returns Capitalized string
   */
  capitalize: (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Convert string to kebab-case
   * @param str - String to convert
   * @returns kebab-case string
   */
  toKebabCase: (str: string): string => {
    return str
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  },

  /**
   * Convert string to camelCase
   * @param str - String to convert
   * @returns camelCase string
   */
  toCamelCase: (str: string): string => {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
      .replace(/^[A-Z]/, char => char.toLowerCase());
  },

  /**
   * Truncate string to specified length with ellipsis
   * @param str - String to truncate
   * @param maxLength - Maximum length
   * @param suffix - Suffix to add (default: "...")
   * @returns Truncated string
   */
  truncate: (str: string, maxLength: number, suffix = "..."): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
  }
};

/**
 * Object Utilities
 */
export const objectUtils = {
  /**
   * Deep clone an object
   * @param obj - Object to clone
   * @returns Deep cloned object
   */
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array) return obj.map(item => objectUtils.deepClone(item)) as unknown as T;
    if (typeof obj === "object") {
      const cloned = {} as T;
      Object.keys(obj).forEach(key => {
        cloned[key as keyof typeof cloned] = objectUtils.deepClone(obj[key as keyof typeof obj]);
      });
      return cloned;
    }
    return obj;
  },

  /**
   * Check if an object is empty
   * @param obj - Object to check
   * @returns True if object is empty
   */
  isEmpty: (obj: object): boolean => {
    return Object.keys(obj).length === 0;
  },

  /**
   * Pick specific properties from an object
   * @param obj - Source object
   * @param keys - Keys to pick
   * @returns New object with only specified keys
   */
  pick: <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },

  /**
   * Omit specific properties from an object
   * @param obj - Source object
   * @param keys - Keys to omit
   * @returns New object without specified keys
   */
  omit: <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  }
};

/**
 * Validation Utilities
 */
export const validationUtils = {
  /**
   * Check if a value is a valid email
   * @param email - Email to validate
   * @returns True if valid email
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Check if a value is a valid URL
   * @param url - URL to validate
   * @returns True if valid URL
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if a string is not empty (after trimming)
   * @param str - String to check
   * @returns True if string is not empty
   */
  isNotEmpty: (str: string): boolean => {
    return str.trim().length > 0;
  }
};
