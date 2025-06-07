// MTG Brawl Deck Builder - Card Search Results Component
import React from 'react';
import type { Tables } from '../../../services/supabase/types';

type DatabaseCard = Tables<"cards">;

interface CardResultsProps {
  cards: DatabaseCard[];
  searchTerm: string;
}

export const CardResults: React.FC<CardResultsProps> = ({ cards, searchTerm }) => {
  return (
    <div className="card-results">
      <div className="results-header mb-md">
        <h3 className="text-md font-heading">
          Search Results for "{searchTerm}" ({cards.length} cards found)
        </h3>
      </div>

      <div className="results-table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Set</th>
              <th>Mana Cost</th>
              <th>Type</th>
              <th>Rarity</th>
              <th>Commander</th>
              <th>Companion</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={`${card.oracle_id}-${card.set_code}`}>
                <td className="card-name">
                  <strong>{card.name || "Unknown"}</strong>
                </td>
                <td className="card-set">
                  {card.set_code?.toUpperCase() ?? "—"}
                </td>
                <td className="card-mana-cost">
                  {card.mana_cost ?? "—"}
                </td>
                <td className="card-type">
                  {card.type_line ?? "—"}
                </td>
                <td className="card-rarity">
                  <span className={`rarity rarity-${card.rarity ?? "unknown"}`}>
                    {card.rarity ? card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1) : "—"}
                  </span>
                </td>
                <td className="card-commander">
                  {card.can_be_commander ? "✓" : "—"}
                </td>
                <td className="card-companion">
                  {card.can_be_companion ? "✓" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="results-summary mt-md">
        <p className="text-sm text-secondary">
          Showing {cards.length} result{cards.length !== 1 ? "s" : ""} for "{searchTerm}"
        </p>
      </div>
    </div>
  );
};
