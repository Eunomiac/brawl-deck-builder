// Search Debug Tests
import { SearchDebugger } from './debug';

describe('SearchDebugger', () => {
  it('should show current cards and search terms', async () => {
    const result = await SearchDebugger.getCardsWithSearchTerms();
    expect(result).toBeDefined();
  });
  
  it('should test basic search', async () => {
    // Test some basic searches
    await SearchDebugger.testSearch('lightning');
    await SearchDebugger.testSearch('bolt');
    await SearchDebugger.testSearch('fire');
  });
});
