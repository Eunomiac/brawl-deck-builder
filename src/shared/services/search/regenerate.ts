// Search Terms Regeneration Utility
import { supabase } from "../../../services/supabase/client";
import { ScryfallUtils } from "../scryfall/api";

export class SearchTermsRegenerator {
  /**
   * Show current search terms in the database
   */
  static async showCurrentSearchTerms() {
    console.log('🔍 Checking current search terms in database...');

    // Get all cards
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id, name, oracle_id')
      .order('name');

    if (cardsError) {
      console.error('❌ Error getting cards:', cardsError);
      return;
    }

    console.log(`📋 Found ${cards?.length || 0} cards`);

    // Get all search terms
    const { data: searchTerms, error: termsError } = await supabase
      .from('card_search_terms')
      .select('card_id, search_term, is_primary')
      .order('card_id, is_primary desc, search_term');

    if (termsError) {
      console.error('❌ Error getting search terms:', termsError);
      return;
    }

    console.log(`🔍 Found ${searchTerms?.length || 0} search terms`);

    // Group search terms by card
    const termsByCard = new Map<string, Array<{search_term: string, is_primary: boolean}>>();
    searchTerms?.forEach(term => {
      if (term.card_id && term.search_term && term.is_primary !== null) {
        if (!termsByCard.has(term.card_id)) {
          termsByCard.set(term.card_id, []);
        }
        termsByCard.get(term.card_id)!.push({
          search_term: term.search_term,
          is_primary: term.is_primary
        });
      }
    });

    // Display results
    cards?.forEach(card => {
      console.log(`\n📄 Card: ${card.name} (ID: ${card.id})`);
      const terms = termsByCard.get(card.id) || [];
      if (terms.length === 0) {
        console.log('  ⚠️  No search terms found');
      } else {
        terms.forEach(term => {
          const marker = term.is_primary ? '🎯' : '🔍';
          console.log(`  ${marker} "${term.search_term}"`);
        });
      }
    });

    return { cards, searchTerms, termsByCard };
  }

  /**
   * Regenerate search terms for all cards using the enhanced logic
   */
  static async regenerateAllSearchTerms() {
    console.log('🔄 Starting search terms regeneration...');

    // Get all cards
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .order('name');

    if (cardsError) {
      console.error('❌ Error getting cards:', cardsError);
      return;
    }

    console.log(`📋 Found ${cards?.length || 0} cards to process`);

    if (!cards || cards.length === 0) {
      console.log('ℹ️  No cards found to process');
      return;
    }

    // Delete existing search terms
    console.log('🗑️  Deleting existing search terms...');
    const { error: deleteError } = await supabase
      .from('card_search_terms')
      .delete()
      .neq('card_id', ''); // Delete all (using a condition that's always true)

    if (deleteError) {
      console.error('❌ Error deleting existing search terms:', deleteError);
      return;
    }

    console.log('✅ Existing search terms deleted');

    // Generate new search terms for each card
    let processedCount = 0;
    let errorCount = 0;

    for (const card of cards) {
      try {
        console.log(`\n🔄 Processing: ${card.name}`);

        // Create a mock Scryfall card object for the search term generation
        const mockScryfallCard = {
          name: card.name,
          card_faces: undefined // We don't have card_faces data in our simplified schema
        } as any; // Type assertion for mock object

        // Generate search terms using the enhanced logic
        const searchTerms = ScryfallUtils.getCardSearchTerms(mockScryfallCard);

        console.log(`  📝 Generated ${searchTerms.length} search terms`);
        searchTerms.forEach(term => {
          const marker = term.is_primary ? '🎯' : '🔍';
          console.log(`    ${marker} "${term.search_term}"`);
        });

        // Insert search terms into database
        const searchTermsToInsert = searchTerms.map(term => ({
          card_id: card.id,
          search_term: term.search_term,
          is_primary: term.is_primary
        }));

        const { error: insertError } = await supabase
          .from('card_search_terms')
          .insert(searchTermsToInsert);

        if (insertError) {
          console.error(`❌ Error inserting search terms for ${card.name}:`, insertError);
          errorCount++;
        } else {
          console.log(`  ✅ Inserted ${searchTerms.length} search terms`);
          processedCount++;
        }

      } catch (error) {
        console.error(`❌ Error processing ${card.name}:`, error);
        errorCount++;
      }
    }

    console.log(`\n📊 Regeneration complete:`);
    console.log(`  ✅ Successfully processed: ${processedCount} cards`);
    console.log(`  ❌ Errors: ${errorCount} cards`);

    if (errorCount === 0) {
      console.log('🎉 All search terms regenerated successfully!');
    }

    return { processedCount, errorCount };
  }

  /**
   * Test the new search terms
   */
  static async testSearchTerms(testQueries: string[]) {
    console.log('\n🧪 Testing search terms...');

    for (const query of testQueries) {
      console.log(`\n🔍 Testing: "${query}"`);

      const normalizedQuery = ScryfallUtils.normalizeText(query);
      console.log(`  📝 Normalized: "${normalizedQuery}"`);

      const { data, error } = await supabase
        .from('card_search_terms')
        .select(`
          search_term,
          is_primary,
          cards!inner (name)
        `)
        .eq('search_term', normalizedQuery);

      if (error) {
        console.error(`  ❌ Error: ${error.message}`);
      } else if (data && data.length > 0) {
        console.log(`  ✅ Found ${data.length} matches:`);
        data.forEach((result: any) => {
          const marker = result.is_primary ? '🎯' : '🔍';
          console.log(`    ${marker} ${result.cards.name} (term: "${result.search_term}")`);
        });
      } else {
        console.log(`  ❌ No matches found`);
      }
    }
  }
}
