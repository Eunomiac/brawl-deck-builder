// MTG Brawl Deck Builder - Card Results Component Tests
import { render, screen } from '@testing-library/react';
import { CardResults } from './CardResults';
import type { Tables } from '../../../services/supabase/types';

type DatabaseCard = Tables<"cards">;

// Mock card data for testing
const mockCard1: DatabaseCard = {
  id: 'test-card-1',
  oracle_id: 'oracle-1',
  original_name: 'Lightning Bolt',
  name: 'Lightning Bolt',
  search_key: 'lightning bolt',
  mana_cost: '{R}',
  cmc: 1,
  type_line: 'Instant',
  oracle_text: 'Lightning Bolt deals 3 damage to any target.',
  colors: ['R'],
  color_identity: ['R'],
  rarity: 'common',
  set_code: 'lea',
  can_be_commander: false,
  can_be_companion: false,
  companion_restriction: null,
  image_uris: null,
  back_image_uris: null,
  display_hints: null,
  scryfall_uri: 'https://scryfall.com/card/lea/161/lightning-bolt',
  created_at: '2024-01-01T00:00:00Z',
};

const mockCard2: DatabaseCard = {
  id: 'test-card-2',
  oracle_id: 'oracle-2',
  original_name: 'Teferi, Hero of Dominaria',
  name: 'Teferi, Hero of Dominaria',
  search_key: 'teferi hero of dominaria',
  mana_cost: '{3}{W}{U}',
  cmc: 5,
  type_line: 'Legendary Planeswalker — Teferi',
  oracle_text: '+1: Draw a card. At the beginning of the next end step, untap two lands.',
  colors: ['W', 'U'],
  color_identity: ['W', 'U'],
  rarity: 'mythic',
  set_code: 'dom',
  can_be_commander: true,
  can_be_companion: false,
  companion_restriction: null,
  image_uris: null,
  back_image_uris: null,
  display_hints: null,
  scryfall_uri: 'https://scryfall.com/card/dom/207/teferi-hero-of-dominaria',
  created_at: '2024-01-01T00:00:00Z',
};

const mockCardWithNulls: DatabaseCard = {
  id: 'test-card-null',
  oracle_id: 'oracle-null',
  original_name: null,
  name: "",
  search_key: null,
  mana_cost: null,
  cmc: null,
  type_line: null,
  oracle_text: null,
  colors: null,
  color_identity: null,
  rarity: null,
  set_code: null,
  can_be_commander: false,
  can_be_companion: false,
  companion_restriction: null,
  image_uris: null,
  back_image_uris: null,
  display_hints: null,
  scryfall_uri: null,
  created_at: '2024-01-01T00:00:00Z',
};

describe('CardResults Component', () => {
  describe('Rendering', () => {
    it('should render the component with search results', () => {
      render(
        <CardResults
          cards={[mockCard1, mockCard2]}
          searchTerm="lightning"
        />
      );

      expect(screen.getByText('Search Results for "lightning" (2 cards found)')).toBeInTheDocument();
    });

    it('should render the results table', () => {
      render(
        <CardResults
          cards={[mockCard1]}
          searchTerm="bolt"
        />
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Set')).toBeInTheDocument();
      expect(screen.getByText('Mana Cost')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Rarity')).toBeInTheDocument();
      expect(screen.getByText('Commander')).toBeInTheDocument();
      expect(screen.getByText('Companion')).toBeInTheDocument();
    });

    it('should render card data correctly', () => {
      render(
        <CardResults
          cards={[mockCard1]}
          searchTerm="lightning"
        />
      );

      expect(screen.getByText('Lightning Bolt')).toBeInTheDocument();
      expect(screen.getByText('LEA')).toBeInTheDocument();
      expect(screen.getByText('{R}')).toBeInTheDocument();
      expect(screen.getByText('Instant')).toBeInTheDocument();
      expect(screen.getByText('Common')).toBeInTheDocument();
    });

    it('should render multiple cards', () => {
      render(
        <CardResults
          cards={[mockCard1, mockCard2]}
          searchTerm="test"
        />
      );

      expect(screen.getByText('Lightning Bolt')).toBeInTheDocument();
      expect(screen.getByText('Teferi, Hero of Dominaria')).toBeInTheDocument();
    });
  });

  describe('Header Information', () => {
    it('should show correct count for single card', () => {
      render(
        <CardResults
          cards={[mockCard1]}
          searchTerm="lightning"
        />
      );

      expect(screen.getByText('Search Results for "lightning" (1 cards found)')).toBeInTheDocument();
    });

    it('should show correct count for multiple cards', () => {
      render(
        <CardResults
          cards={[mockCard1, mockCard2]}
          searchTerm="test"
        />
      );

      expect(screen.getByText('Search Results for "test" (2 cards found)')).toBeInTheDocument();
    });

    it('should show correct count for no cards', () => {
      render(
        <CardResults
          cards={[]}
          searchTerm="nothing"
        />
      );

      expect(screen.getByText('Search Results for "nothing" (0 cards found)')).toBeInTheDocument();
    });
  });

  describe('Summary Information', () => {
    it('should show singular result summary', () => {
      render(
        <CardResults
          cards={[mockCard1]}
          searchTerm="lightning"
        />
      );

      expect(screen.getByText('Showing 1 result for "lightning"')).toBeInTheDocument();
    });

    it('should show plural results summary', () => {
      render(
        <CardResults
          cards={[mockCard1, mockCard2]}
          searchTerm="test"
        />
      );

      expect(screen.getByText('Showing 2 results for "test"')).toBeInTheDocument();
    });

    it('should show zero results summary', () => {
      render(
        <CardResults
          cards={[]}
          searchTerm="nothing"
        />
      );

      expect(screen.getByText('Showing 0 results for "nothing"')).toBeInTheDocument();
    });
  });

  describe('Card Data Display', () => {
    it('should display commander and companion indicators correctly', () => {
      render(
        <CardResults
          cards={[mockCard1, mockCard2]}
          searchTerm="test"
        />
      );

      const rows = screen.getAllByRole('row');
      // Header row + 2 data rows
      expect(rows).toHaveLength(3);

      // Lightning Bolt row (not commander, not companion)
      expect(screen.getAllByText('—')[0]).toBeInTheDocument(); // Commander column
      expect(screen.getAllByText('—')[1]).toBeInTheDocument(); // Companion column

      // Teferi row (is commander, not companion)
      expect(screen.getByText('✓')).toBeInTheDocument(); // Commander column
    });

    it('should handle null/undefined values gracefully', () => {
      render(
        <CardResults
          cards={[mockCardWithNulls]}
          searchTerm="test"
        />
      );

      expect(screen.getByText('Unknown')).toBeInTheDocument(); // Name
      expect(screen.getAllByText('—')).toHaveLength(6); // Set, Mana Cost, Type, Rarity, Commander, Companion
    });

    it('should format set codes in uppercase', () => {
      render(
        <CardResults
          cards={[mockCard1]}
          searchTerm="test"
        />
      );

      expect(screen.getByText('LEA')).toBeInTheDocument();
    });

    it('should capitalize rarity correctly', () => {
      render(
        <CardResults
          cards={[mockCard1, mockCard2]}
          searchTerm="test"
        />
      );

      expect(screen.getByText('Common')).toBeInTheDocument();
      expect(screen.getByText('Mythic')).toBeInTheDocument();
    });

    it('should apply rarity CSS classes', () => {
      render(
        <CardResults
          cards={[mockCard1, mockCard2]}
          searchTerm="test"
        />
      );

      const commonRarity = screen.getByText('Common');
      const mythicRarity = screen.getByText('Mythic');

      expect(commonRarity).toHaveClass('rarity', 'rarity-common');
      expect(mythicRarity).toHaveClass('rarity', 'rarity-mythic');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search term', () => {
      render(
        <CardResults
          cards={[mockCard1]}
          searchTerm=""
        />
      );

      expect(screen.getByText('Search Results for "" (1 cards found)')).toBeInTheDocument();
      expect(screen.getByText('Showing 1 result for ""')).toBeInTheDocument();
    });

    it('should handle special characters in search term', () => {
      const specialSearchTerm = 'test "quoted" & special';
      render(
        <CardResults
          cards={[mockCard1]}
          searchTerm={specialSearchTerm}
        />
      );

      expect(screen.getByText(`Search Results for "${specialSearchTerm}" (1 cards found)`)).toBeInTheDocument();
    });

    it('should handle cards with unique oracle_id and set_code combinations', () => {
      const cardSameOracle: DatabaseCard = {
        ...mockCard1,
        id: 'test-card-1-alt',
        set_code: 'alt',
      };

      render(
        <CardResults
          cards={[mockCard1, cardSameOracle]}
          searchTerm="test"
        />
      );

      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(3); // Header + 2 data rows
    });
  });
});
