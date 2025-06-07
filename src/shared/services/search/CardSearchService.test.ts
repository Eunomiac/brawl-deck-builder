// Card Search Service Tests
import { ScryfallUtils } from '../scryfall/api';

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
      } as any;

      const terms = ScryfallUtils.getCardSearchTerms(mockCard);
      const termStrings = terms.map(t => t.search_term);

      expect(termStrings).toContain('lightning bolt'); // Primary
      expect(termStrings).toContain('a lightning bolt'); // Alchemy variant
    });

    it('should handle Alchemy cards', () => {
      const mockCard = {
        name: 'A-Lightning Bolt',
        card_faces: undefined
      } as any;

      const terms = ScryfallUtils.getCardSearchTerms(mockCard);
      const termStrings = terms.map(t => t.search_term);

      expect(termStrings).toContain('a lightning bolt'); // Primary (normalized)
      expect(termStrings).toContain('lightning bolt'); // Without A- prefix
    });

    it('should handle split cards', () => {
      const mockCard = {
        name: 'Fire // Ice',
        card_faces: undefined
      } as any;

      const terms = ScryfallUtils.getCardSearchTerms(mockCard);
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
      } as any;

      const terms = ScryfallUtils.getCardSearchTerms(mockCard);
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
      } as any;

      const terms = ScryfallUtils.getCardSearchTerms(mockCard);
      const termStrings = terms.map(t => t.search_term);

      expect(termStrings).toContain('lorien aether');
      expect(termStrings).toContain('lorien');
      expect(termStrings).toContain('aether');
    });

    it('should not create duplicate terms', () => {
      const mockCard = {
        name: 'Test Card',
        card_faces: undefined
      } as any;

      const terms = ScryfallUtils.getCardSearchTerms(mockCard);
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
      } as any;

      const terms = ScryfallUtils.getCardSearchTerms(mockCard);
      const termStrings = terms.map(t => t.search_term);

      expect(termStrings).toContain('delver of secrets');
      expect(termStrings).toContain('insectile aberration');
      expect(termStrings).toContain('delver of secrets insectile aberration');
    });
  });
});
