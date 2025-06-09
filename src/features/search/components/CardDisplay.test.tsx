// MTG Brawl Deck Builder - Card Display Component Tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CardDisplay } from './CardDisplay';
import type { Tables } from '../../../services/supabase/types';

type DatabaseCard = Tables<"cards">;

// Mock card data for testing
const mockCardWithImage: DatabaseCard = {
  id: 'test-card-1',
  oracle_id: 'oracle-1',
  scryfall_id: 'scryfall-1',
  original_name: 'Lightning Bolt',
  name: 'Lightning Bolt',
  search_key: 'lightningbolt',
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
  image_uris: JSON.stringify({
    normal: 'https://example.com/normal.jpg',
    large: 'https://example.com/large.jpg',
    small: 'https://example.com/small.jpg',
    png: 'https://example.com/card.png'
  }),
  back_image_uris: null,
  display_hints: null,
  scryfall_uri: 'https://scryfall.com/card/lea/161/lightning-bolt',
  created_at: '2024-01-01T00:00:00Z',
};

const mockCardNoImage: DatabaseCard = {
  ...mockCardWithImage,
  id: 'test-card-2',
  image_uris: null,
};

const mockCardWithCompanion: DatabaseCard = {
  ...mockCardWithImage,
  id: 'test-card-3',
  name: 'Lurrus of the Dream-Den',
  can_be_companion: true,
  companion_restriction: 'Each permanent card in your starting deck has mana value 2 or less.',
};

const mockCardWithNulls: DatabaseCard = {
  id: 'test-card-null',
  oracle_id: 'oracle-null',
  scryfall_id: 'scryfall-null',
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

describe('CardDisplay Component', () => {
  describe('Rendering', () => {
    it('should render the component', () => {
      render(<CardDisplay card={mockCardWithImage} />);

      expect(screen.getByText('Card Found')).toBeInTheDocument();
      expect(screen.getByText('Lightning Bolt')).toBeInTheDocument();
    });

    it('should render card details correctly', () => {
      render(<CardDisplay card={mockCardWithImage} />);

      expect(screen.getByText('Lightning Bolt')).toBeInTheDocument();
      expect(screen.getByText('LEA')).toBeInTheDocument();
      expect(screen.getByText('{R}')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Instant')).toBeInTheDocument();
      expect(screen.getByText('Common')).toBeInTheDocument();
      expect(screen.getByText('R')).toBeInTheDocument();
    });

    it('should render oracle text when present', () => {
      render(<CardDisplay card={mockCardWithImage} />);

      expect(screen.getByText('Oracle Text:')).toBeInTheDocument();
      expect(screen.getByText('Lightning Bolt deals 3 damage to any target.')).toBeInTheDocument();
    });

    it('should render companion restriction when present', () => {
      render(<CardDisplay card={mockCardWithCompanion} />);

      expect(screen.getByText('Companion Restriction:')).toBeInTheDocument();
      expect(screen.getByText('Each permanent card in your starting deck has mana value 2 or less.')).toBeInTheDocument();
    });

    it('should render Scryfall link when present', () => {
      render(<CardDisplay card={mockCardWithImage} />);

      const scryfallLink = screen.getByText('View on Scryfall →');
      expect(scryfallLink).toBeInTheDocument();
      expect(scryfallLink.closest('a')).toHaveAttribute('href', 'https://scryfall.com/card/lea/161/lightning-bolt');
      expect(scryfallLink.closest('a')).toHaveAttribute('target', '_blank');
      expect(scryfallLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Image Handling', () => {
    it('should show loading state initially', () => {
      render(<CardDisplay card={mockCardWithImage} />);

      expect(screen.getByText('Loading image...')).toBeInTheDocument();
    });

    it('should render image when available', async () => {
      render(<CardDisplay card={mockCardWithImage} />);

      const image = screen.getByAltText('Lightning Bolt');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/normal.jpg');
      expect(image).toHaveStyle({ display: 'none' }); // Initially hidden while loading

      // Simulate image load
      fireEvent.load(image);

      await waitFor(() => {
        expect(screen.queryByText('Loading image...')).not.toBeInTheDocument();
      });
    });

    it('should handle image load error', async () => {
      render(<CardDisplay card={mockCardWithImage} />);

      const image = screen.getByAltText('Lightning Bolt');

      // Simulate image error
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('Failed to load image')).toBeInTheDocument();
        expect(screen.getByText('URL: https://example.com/normal.jpg')).toBeInTheDocument();
      });
    });

    it('should show no image message when image_uris is null', () => {
      render(<CardDisplay card={mockCardNoImage} />);

      expect(screen.getByText('No image available')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('should handle malformed image_uris JSON', () => {
      const cardWithBadJson: DatabaseCard = {
        ...mockCardWithImage,
        image_uris: 'invalid json',
      };

      render(<CardDisplay card={cardWithBadJson} />);

      expect(screen.getByText('No image available')).toBeInTheDocument();
    });

    it('should prefer normal size image', () => {
      render(<CardDisplay card={mockCardWithImage} />);

      const image = screen.getByAltText('Lightning Bolt');
      expect(image).toHaveAttribute('src', 'https://example.com/normal.jpg');
    });

    it('should fallback to other image sizes', () => {
      const cardWithLimitedImages: DatabaseCard = {
        ...mockCardWithImage,
        image_uris: JSON.stringify({
          large: 'https://example.com/large.jpg',
          png: 'https://example.com/card.png'
        }),
      };

      render(<CardDisplay card={cardWithLimitedImages} />);

      const image = screen.getByAltText('Lightning Bolt');
      expect(image).toHaveAttribute('src', 'https://example.com/large.jpg');
    });
  });

  describe('Card Information Display', () => {
    it('should display commander status correctly', () => {
      const { rerender } = render(<CardDisplay card={mockCardWithImage} />);

      // Find the Commander info item specifically
      const commanderLabel = screen.getByText('Commander:');
      const commanderValue = commanderLabel.parentElement?.querySelector('.info-value');
      expect(commanderValue).toHaveTextContent('No');

      const commanderCard: DatabaseCard = {
        ...mockCardWithImage,
        can_be_commander: true,
      };

      rerender(<CardDisplay card={commanderCard} />);

      const commanderLabelYes = screen.getByText('Commander:');
      const commanderValueYes = commanderLabelYes.parentElement?.querySelector('.info-value');
      expect(commanderValueYes).toHaveTextContent('Yes');
    });

    it('should display companion status correctly', () => {
      render(<CardDisplay card={mockCardWithImage} />);

      // Should show "No" for companion (can_be_companion: false)
      const companionLabels = screen.getAllByText('Companion:');
      expect(companionLabels[0].parentElement).toHaveTextContent('No');
    });

    it('should display color identity correctly', () => {
      render(<CardDisplay card={mockCardWithImage} />);
      expect(screen.getByText('R')).toBeInTheDocument();

      const multiColorCard: DatabaseCard = {
        ...mockCardWithImage,
        color_identity: ['W', 'U', 'B'],
      };

      render(<CardDisplay card={multiColorCard} />);
      expect(screen.getByText('W, U, B')).toBeInTheDocument();
    });

    it('should display colorless correctly', () => {
      const colorlessCard: DatabaseCard = {
        ...mockCardWithImage,
        color_identity: [],
      };

      render(<CardDisplay card={colorlessCard} />);
      expect(screen.getByText('Colorless')).toBeInTheDocument();
    });

    it('should handle null color identity', () => {
      const cardNullColors: DatabaseCard = {
        ...mockCardWithImage,
        color_identity: null,
      };

      render(<CardDisplay card={cardNullColors} />);
      expect(screen.getByText('Colorless')).toBeInTheDocument();
    });
  });

  describe('Null/Undefined Value Handling', () => {
    it('should handle card with all null values', () => {
      render(<CardDisplay card={mockCardWithNulls} />);

      expect(screen.getByText('Unknown Card')).toBeInTheDocument();
      expect(screen.getByText('Unknown')).toBeInTheDocument(); // Set
      expect(screen.getAllByText('—')).toHaveLength(4); // Mana Cost, CMC, Type, Rarity
      expect(screen.getByText('Colorless')).toBeInTheDocument();
      expect(screen.getAllByText('No')).toHaveLength(2); // Commander, Companion
    });

    it('should handle missing oracle text gracefully', () => {
      const cardNoText: DatabaseCard = {
        ...mockCardWithImage,
        oracle_text: null,
      };

      render(<CardDisplay card={cardNoText} />);
      expect(screen.queryByText('Oracle Text:')).not.toBeInTheDocument();
    });

    it('should handle missing companion restriction gracefully', () => {
      render(<CardDisplay card={mockCardWithImage} />);
      expect(screen.queryByText('Companion Restriction:')).not.toBeInTheDocument();
    });

    it('should handle missing Scryfall URI gracefully', () => {
      const cardNoUri: DatabaseCard = {
        ...mockCardWithImage,
        scryfall_uri: null,
      };

      render(<CardDisplay card={cardNoUri} />);
      expect(screen.queryByText('View on Scryfall →')).not.toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply rarity CSS class', () => {
      render(<CardDisplay card={mockCardWithImage} />);

      const rarityElement = screen.getByText('Common');
      expect(rarityElement).toHaveClass('rarity', 'rarity-common');
    });

    it('should handle unknown rarity', () => {
      render(<CardDisplay card={mockCardWithNulls} />);

      // Find the rarity element specifically by looking for the one with rarity classes
      const rarityLabel = screen.getByText('Rarity:');
      const rarityElement = rarityLabel.parentElement?.querySelector('.rarity');
      expect(rarityElement).toHaveClass('rarity', 'rarity-unknown');
      expect(rarityElement).toHaveTextContent('—');
    });
  });
});
