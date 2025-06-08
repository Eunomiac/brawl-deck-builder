// MTG Brawl Deck Builder - Navigation Component Tests
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from './Navigation';

// Mock data for testing
const mockTabs = [
  { id: 'search', label: 'Card Search' },
  { id: 'collection', label: 'Collection' },
  { id: 'deck-builder', label: 'Deck Builder' },
  { id: 'analysis', label: 'Analysis' },
];

describe('Navigation Component', () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    mockOnTabChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render the navigation component', () => {
      render(
        <Navigation
          activeTab="search"
          onTabChange={mockOnTabChange}
          tabs={mockTabs}
        />
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should render the brand name', () => {
      render(
        <Navigation
          activeTab="search"
          onTabChange={mockOnTabChange}
          tabs={mockTabs}
        />
      );

      expect(screen.getByText('MTG Brawl Deck Builder')).toBeInTheDocument();
    });

    it('should render all provided tabs', () => {
      render(
        <Navigation
          activeTab="search"
          onTabChange={mockOnTabChange}
          tabs={mockTabs}
        />
      );

      mockTabs.forEach(tab => {
        expect(screen.getByText(tab.label)).toBeInTheDocument();
      });
    });

    it('should render with correct structure', () => {
      render(
        <Navigation
          activeTab="search"
          onTabChange={mockOnTabChange}
          tabs={mockTabs}
        />
      );

      expect(screen.getByRole('navigation')).toHaveClass('navigation');
      expect(screen.getByRole('list')).toHaveClass('nav-tabs');
    });
  });

  describe('Active Tab Highlighting', () => {
    it('should highlight the active tab', () => {
      render(
        <Navigation
          activeTab="collection"
          onTabChange={mockOnTabChange}
          tabs={mockTabs}
        />
      );

      const collectionLink = screen.getByText('Collection').closest('a');
      expect(collectionLink).toHaveClass('active');
    });

    it('should not highlight inactive tabs', () => {
      render(
        <Navigation
          activeTab="collection"
          onTabChange={mockOnTabChange}
          tabs={mockTabs}
        />
      );

      const searchLink = screen.getByText('Card Search').closest('a');
      const deckBuilderLink = screen.getByText('Deck Builder').closest('a');

      expect(searchLink).not.toHaveClass('active');
      expect(deckBuilderLink).not.toHaveClass('active');
    });

    it('should handle non-existent active tab gracefully', () => {
      render(
        <Navigation
          activeTab="non-existent"
          onTabChange={mockOnTabChange}
          tabs={mockTabs}
        />
      );

      // No tab should be active
      mockTabs.forEach(tab => {
        const link = screen.getByText(tab.label).closest('a');
        expect(link).not.toHaveClass('active');
      });
    });
  });

  describe('Tab Interaction', () => {
    it('should call onTabChange when a tab is clicked', () => {
      render(
        <Navigation
          activeTab="search"
          onTabChange={mockOnTabChange}
          tabs={mockTabs}
        />
      );

      fireEvent.click(screen.getByText('Collection'));
      expect(mockOnTabChange).toHaveBeenCalledWith('collection');
    });

    it('should prevent default link behavior', () => {
      render(
        <Navigation
          activeTab="search"
          onTabChange={mockOnTabChange}
          tabs={mockTabs}
        />
      );

      const collectionLink = screen.getByText('Collection').closest('a');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

      fireEvent(collectionLink!, clickEvent);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should call onTabChange for each different tab', () => {
      render(
        <Navigation
          activeTab="search"
          onTabChange={mockOnTabChange}
          tabs={mockTabs}
        />
      );

      fireEvent.click(screen.getByText('Collection'));
      expect(mockOnTabChange).toHaveBeenCalledWith('collection');

      fireEvent.click(screen.getByText('Deck Builder'));
      expect(mockOnTabChange).toHaveBeenCalledWith('deck-builder');

      fireEvent.click(screen.getByText('Analysis'));
      expect(mockOnTabChange).toHaveBeenCalledWith('analysis');

      expect(mockOnTabChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tabs array', () => {
      render(
        <Navigation
          activeTab="search"
          onTabChange={mockOnTabChange}
          tabs={[]}
        />
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('MTG Brawl Deck Builder')).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('should handle single tab', () => {
      const singleTab = [{ id: 'only', label: 'Only Tab' }];

      render(
        <Navigation
          activeTab="only"
          onTabChange={mockOnTabChange}
          tabs={singleTab}
        />
      );

      expect(screen.getByText('Only Tab')).toBeInTheDocument();
      const link = screen.getByText('Only Tab').closest('a');
      expect(link).toHaveClass('active');
    });

    it('should handle tabs with special characters in labels', () => {
      const specialTabs = [
        { id: 'special', label: 'Tab & More' },
        { id: 'unicode', label: 'Tab ⚡ Lightning' },
      ];

      render(
        <Navigation
          activeTab="special"
          onTabChange={mockOnTabChange}
          tabs={specialTabs}
        />
      );

      expect(screen.getByText('Tab & More')).toBeInTheDocument();
      expect(screen.getByText('Tab ⚡ Lightning')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      render(
        <Navigation
          activeTab="search"
          onTabChange={mockOnTabChange}
          tabs={mockTabs}
        />
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('should have proper link structure', () => {
      render(
        <Navigation
          activeTab="search"
          onTabChange={mockOnTabChange}
          tabs={mockTabs}
        />
      );

      mockTabs.forEach(tab => {
        const link = screen.getByText(tab.label).closest('a');
        expect(link).toHaveAttribute('href', '#');
      });
    });
  });
});
