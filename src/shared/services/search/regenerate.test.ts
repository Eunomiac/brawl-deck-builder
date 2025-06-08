// Search Terms Regeneration Tests
// Mock the Supabase client to avoid import.meta.env issues in Jest
jest.mock('../../../services/supabase/client', () => {
  // Mock test card data
  const mockCards = [
    { id: 'test-card-1', name: 'Lightning Bolt' },
    { id: 'test-card-2', name: 'Dusk // Dawn' }
  ];

  const createMockQuery = () => {
    const query = {
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
    };

    // Override specific methods for different table operations
    query.order = jest.fn(() => Promise.resolve({ data: mockCards, error: null }));
    query.delete = jest.fn().mockReturnThis(); // Allow chaining for .delete().neq()
    query.insert = jest.fn(() => Promise.resolve({ data: null, error: null }));

    // Override neq to return a Promise when called after delete
    query.neq = jest.fn(() => Promise.resolve({ data: null, error: null }));

    return query;
  };

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

import { SearchTermsRegenerator } from './regenerate';

describe('SearchTermsRegenerator', () => {
  it('should show current search terms', async () => {
    await SearchTermsRegenerator.showCurrentSearchTerms();
  });

  it('should regenerate all search terms', async () => {
    const result = await SearchTermsRegenerator.regenerateAllSearchTerms();
    expect(result).toBeDefined();
  });

  it('should test search terms', async () => {
    const testQueries = [
      'dusk dawn',           // Normalized "Dusk // Dawn"
      'alrunds epiphany',    // Should match "A-Alrund's Epiphany"
      'a alrunds epiphany',  // Normalized "A-Alrund's Epiphany"
      'lothlorien',          // Should match "Lothlorièn"
    ];

    await SearchTermsRegenerator.testSearchTerms(testQueries);
  });
});
