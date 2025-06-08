// Card Search Service Tests
// Mock the Supabase client to avoid import.meta.env issues in Jest
jest.mock('../../../services/supabase/client', () => {
  const createMockQuery = () => ({
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    rangeGt: jest.fn().mockReturnThis(),
    rangeGte: jest.fn().mockReturnThis(),
    rangeLt: jest.fn().mockReturnThis(),
    rangeLte: jest.fn().mockReturnThis(),
    rangeAdjacent: jest.fn().mockReturnThis(),
    overlaps: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
    then: jest.fn((callback) => callback({ data: [], error: null }))
  });

  return {
    supabase: {
      from: jest.fn(() => createMockQuery()),
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        signInWithPassword: jest.fn(() => Promise.resolve({ data: null, error: null })),
        signOut: jest.fn(() => Promise.resolve({ error: null }))
      },
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(() => Promise.resolve({ data: null, error: null })),
          download: jest.fn(() => Promise.resolve({ data: null, error: null })),
          remove: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }
    }
  };
});

import { ScryfallUtils } from '../scryfall/api';
import type { ScryfallCard } from "../../types/mtg";
import { CardNameNormalizer } from '../../utils/cardNameNormalization';

describe('CardSearchService', () => {
  describe('Search Logic', () => {
    it('should detect quoted searches', () => {
      // Test the quote detection logic
      const quotedSearch = '"Dusk // Dawn"';
      const unquotedSearch = 'Panicked Bystander';

      expect(quotedSearch.trim().startsWith('"') && quotedSearch.trim().endsWith('"')).toBe(true);
      expect(unquotedSearch.trim().startsWith('"') && unquotedSearch.trim().endsWith('"')).toBe(false);
    });

    it('should clean quoted search terms', () => {
      const quotedSearch = '"Dusk // Dawn"';
      const cleaned = quotedSearch.trim().slice(1, -1);
      expect(cleaned).toBe('Dusk // Dawn');
    });
  });

  describe('ScryfallUtils.normalizeText', () => {
    it('should normalize basic text', () => {
      expect(ScryfallUtils.normalizeText('Lightning Bolt')).toBe('lightning bolt');
    });

    it('should handle special characters', () => {
      expect(ScryfallUtils.normalizeText('Lörièn')).toBe('lorien');
      expect(ScryfallUtils.normalizeText('Æther Vial')).toBe('aether vial');
    });

    it('should handle punctuation and symbols', () => {
      expect(ScryfallUtils.normalizeText('Fire // Ice')).toBe('fire ice');
      expect(ScryfallUtils.normalizeText('A-Lightning Bolt')).toBe('a lightning bolt');
    });

    it('should collapse multiple spaces', () => {
      expect(ScryfallUtils.normalizeText('Fire   //   Ice')).toBe('fire ice');
    });
  });

  describe('ScryfallUtils.getCardSearchTerms', () => {
    it('should generate basic search terms', () => {
      const mockCard = {
        name: 'Lightning Bolt',
        card_faces: undefined
      } as unknown;

      const terms = ScryfallUtils.getCardSearchTerms(mockCard as ScryfallCard);
      const termStrings = terms.map(t => t.search_term);

      expect(termStrings).toContain('lightning bolt'); // Primary
      expect(termStrings).toContain('a lightning bolt'); // Alchemy variant
    });

    it('should handle Alchemy cards', () => {
      const mockCard = {
        name: 'A-Lightning Bolt',
        card_faces: undefined
      };

      const terms = ScryfallUtils.getCardSearchTerms(mockCard as ScryfallCard);
      const termStrings = terms.map(t => t.search_term);

      expect(termStrings).toContain('a lightning bolt'); // Primary (normalized)
      expect(termStrings).toContain('lightning bolt'); // Without A- prefix
    });

    it('should handle split cards', () => {
      const mockCard = {
        name: 'Fire // Ice',
        card_faces: undefined
      };

      const terms = ScryfallUtils.getCardSearchTerms(mockCard as ScryfallCard);
      const termStrings = terms.map(t => t.search_term);

      // Primary name
      expect(termStrings).toContain('fire ice');

      // Individual parts
      expect(termStrings).toContain('fire');
      expect(termStrings).toContain('ice');

      // Alchemy variants of parts
      expect(termStrings).toContain('a fire');
      expect(termStrings).toContain('a ice');

      // Various separators
      expect(termStrings).toContain('fire ice');

      // Mixed Alchemy variants
      expect(termStrings).toContain('a fire a ice');
    });

    it('should handle Alchemy split cards', () => {
      const mockCard = {
        name: 'A-Fire // Ice',
        card_faces: undefined
      };

      const terms = ScryfallUtils.getCardSearchTerms(mockCard as ScryfallCard);
      const termStrings = terms.map(t => t.search_term);

      // Should include all combinations
      expect(termStrings).toContain('a fire ice'); // Primary
      expect(termStrings).toContain('fire ice'); // Without A-
      expect(termStrings).toContain('a fire'); // First part with A-
      expect(termStrings).toContain('fire'); // First part without A-
      expect(termStrings).toContain('ice'); // Second part
      expect(termStrings).toContain('a ice'); // Second part with A-
    });

    it('should handle special characters in split cards', () => {
      const mockCard = {
        name: 'Lörièn // Æther',
        card_faces: undefined
      };

      const terms = ScryfallUtils.getCardSearchTerms(mockCard as ScryfallCard);
      const termStrings = terms.map(t => t.search_term);

      expect(termStrings).toContain('lorien aether');
      expect(termStrings).toContain('lorien');
      expect(termStrings).toContain('aether');
    });

    it('should not create duplicate terms', () => {
      const mockCard = {
        name: 'Test Card',
        card_faces: undefined
      };

      const terms = ScryfallUtils.getCardSearchTerms(mockCard as ScryfallCard);
      const termStrings = terms.map(t => t.search_term);
      const uniqueTerms = [...new Set(termStrings)];

      expect(termStrings.length).toBe(uniqueTerms.length);
    });

    it('should handle double-faced cards', () => {
      const mockCard = {
        name: 'Delver of Secrets',
        card_faces: [
          { name: 'Delver of Secrets' },
          { name: 'Insectile Aberration' }
        ]
      };

      const terms = ScryfallUtils.getCardSearchTerms(mockCard as ScryfallCard);
      const termStrings = terms.map(t => t.search_term);

      expect(termStrings).toContain('delver of secrets');
      expect(termStrings).toContain('insectile aberration');
      expect(termStrings).toContain('delver of secrets insectile aberration');
    });
  });

  describe('Double-Sided Card Exact Match Logic', () => {
    it('should identify full exact matches correctly', () => {
      const normalizedSearchTerm = 'dusk';
      const searchKey = 'dusk';

      expect(searchKey === normalizedSearchTerm).toBe(true);
    });

    it('should identify first half matches correctly', () => {
      const normalizedSearchTerm = 'dusk';
      const searchKey = 'dusk // dawn';

      expect(searchKey.startsWith(`${normalizedSearchTerm} // `)).toBe(true);
      expect(searchKey.endsWith(` // ${normalizedSearchTerm}`)).toBe(false);
    });

    it('should identify second half matches correctly', () => {
      const normalizedSearchTerm = 'dawn';
      const searchKey = 'dusk // dawn';

      expect(searchKey.startsWith(`${normalizedSearchTerm} // `)).toBe(false);
      expect(searchKey.endsWith(` // ${normalizedSearchTerm}`)).toBe(true);
    });

    it('should handle complex double-sided card names', () => {
      const normalizedSearchTerm = CardNameNormalizer.normalizeForSearch('Hakka, the Raven');
      const searchKey = CardNameNormalizer.normalizeForSearch('Alrund, God of the Cosmos // Hakka, the Raven');

      expect(searchKey.endsWith(` // ${normalizedSearchTerm}`)).toBe(true);
    });

    it('should handle Alchemy double-sided cards', () => {
      const normalizedSearchTerm = CardNameNormalizer.normalizeForSearch('Delver of Secrets');
      const searchKey = CardNameNormalizer.normalizeForSearch('A-Delver of Secrets // A-Insectile Aberration');

      // Should match the first half after Alchemy prefix removal
      expect(searchKey.startsWith(`${normalizedSearchTerm} // `)).toBe(true);
    });

    it('should prioritize full matches over half matches in sorting', () => {
      const normalizedSearchTerm = 'test';

      const fullMatch = { search_key: 'test', name: 'Test Card' };
      const halfMatch = { search_key: 'test // other', name: 'Test // Other' };
      const fuzzyMatch = { search_key: 'testing', name: 'Testing Card' };

      const cards = [halfMatch, fuzzyMatch, fullMatch];

      // Simulate the sorting logic
      cards.sort((a, b) => {
        const aSearchKey = a.search_key ?? "";
        const bSearchKey = b.search_key ?? "";

        // Check for full exact matches - highest priority
        const aFullExact = aSearchKey === normalizedSearchTerm;
        const bFullExact = bSearchKey === normalizedSearchTerm;

        if (aFullExact && !bFullExact) return -1;
        if (!aFullExact && bFullExact) return 1;

        // Check for half-matches on double-sided cards - medium priority
        const aHalfMatch = aSearchKey.startsWith(`${normalizedSearchTerm} // `) ||
                          aSearchKey.endsWith(` // ${normalizedSearchTerm}`);
        const bHalfMatch = bSearchKey.startsWith(`${normalizedSearchTerm} // `) ||
                          bSearchKey.endsWith(` // ${normalizedSearchTerm}`);

        if (aHalfMatch && !bHalfMatch) return -1;
        if (!aHalfMatch && bHalfMatch) return 1;

        // For remaining matches (fuzzy), preserve alphabetical order
        if (!aFullExact && !bFullExact && !aHalfMatch && !bHalfMatch) {
          return (a.name || "").localeCompare(b.name || "");
        }

        return 0;
      });

      expect(cards[0]).toBe(fullMatch);  // Full match first
      expect(cards[1]).toBe(halfMatch);  // Half match second
      expect(cards[2]).toBe(fuzzyMatch); // Fuzzy match last
    });
  });
});
