// Search Debug Utilities
import { supabase } from "../../../services/supabase/client";

export class SearchDebugger {
  /**
   * Get all cards and their search terms for debugging
   */
  static async getCardsWithSearchTerms() {
    console.log('🔍 Getting cards with search terms...');

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
   * Test search functionality
   */
  static async testSearch(searchTerm: string) {
    console.log(`\n🔍 Testing search for: "${searchTerm}"`);

    const { data, error } = await supabase
      .from('card_search_terms')
      .select(`
        search_term,
        is_primary,
        cards!inner (
          id,
          name,
          oracle_id
        )
      `)
      .ilike('search_term', `%${searchTerm}%`);

    if (error) {
      console.error('❌ Search error:', error);
      return;
    }

    console.log(`📋 Found ${data?.length || 0} matching search terms`);

    // Extract unique cards
    const uniqueCards = new Map();
    data?.forEach((result: any) => {
      const card = result.cards;
      if (card && !uniqueCards.has(card.id)) {
        uniqueCards.set(card.id, card);
        console.log(`  📄 ${card.name} (matched: "${result.search_term}")`);
      }
    });

    return Array.from(uniqueCards.values());
  }
}
