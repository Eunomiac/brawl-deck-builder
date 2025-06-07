// Search Terms Regeneration Tests
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
