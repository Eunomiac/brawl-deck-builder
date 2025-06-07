// MTG Brawl Deck Builder - Card Search Component
import React, { useState } from 'react';
import { CardSearchService } from '../../../shared/services/search';
import type { Tables } from '../../../services/supabase/types';
import { CardResults } from './CardResults';
import { CardDisplay } from './CardDisplay';

type DatabaseCard = Tables<"cards">;

export const CardSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<DatabaseCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear results if search is empty
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await CardSearchService.searchCards(searchTerm.trim(), {
        limit: 50,
        exactMatch: false,
        includeVariations: true
      });

      if (result.error) {
        setError(result.error);
        setSearchResults([]);
      } else {
        setSearchResults(result.cards);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm("");
    setSearchResults([]);
    setError(null);
  };

  const renderSearchResults = () => {
    if (searchResults.length === 1) {
      return <CardDisplay card={searchResults[0]} />;
    }

    if (searchResults.length > 1) {
      return <CardResults cards={searchResults} searchTerm={searchTerm} />;
    }

    if (searchTerm && !isLoading && !error) {
      return (
        <div className="no-results">
          <p className="text-sm text-secondary">No cards found for "{searchTerm}"</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="card-search">
      <div className="search-header">
        <h2 className="text-lg mb-md font-heading">Card Search</h2>
        <p className="text-sm text-secondary mb-lg">
          Search for cards by name. Use quotes for exact matches (e.g., "Dusk // Dawn").
          Without quotes, searches for cards starting with your term.
        </p>
      </div>

      <form onSubmit={handleSearch} className="search-form mb-lg">
        <div className="search-input-group">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Enter card name (e.g., Lightning Bolt, A-Lightning Bolt)"
            className="search-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary"
              disabled={isLoading}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="error-message mb-lg">
          <p className="text-sm text-error">Error: {error}</p>
        </div>
      )}

      {renderSearchResults()}
    </div>
  );
};
