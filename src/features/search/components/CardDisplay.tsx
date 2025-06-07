// MTG Brawl Deck Builder - Single Card Display Component
import React, { useState } from 'react';
import type { Tables } from '../../../services/supabase/types';

type DatabaseCard = Tables<"cards">;

interface CardDisplayProps {
  card: DatabaseCard;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ card }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Extract image URL from image_uris JSON
  const getImageUrl = (): string | null => {
    if (!card.image_uris) return null;

    try {
      const imageUris = typeof card.image_uris === 'string'
        ? JSON.parse(card.image_uris)
        : card.image_uris;

      // Prefer normal size, fallback to other sizes
      return imageUris.normal ?? imageUris.large ?? imageUris.small ?? imageUris.png ?? null;
    } catch {
      return null;
    }
  };

  const imageUrl = getImageUrl();

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div className="card-display">
      <div className="card-display-header mb-md">
        <h3 className="text-md font-heading">Card Found</h3>
      </div>

      <div className="card-display-content">
        <div className="card-image-section">
          {imageUrl ? (
            <div className="card-image-container">
              {imageLoading && (
                <div className="image-loading">
                  <p className="text-sm text-secondary">Loading image...</p>
                </div>
              )}
              {imageError ? (
                <div className="image-error">
                  <p className="text-sm text-error">Failed to load image</p>
                  <p className="text-xs text-secondary">URL: {imageUrl}</p>
                </div>
              ) : (
                <img
                  src={imageUrl}
                  alt={card.name || "Card image"}
                  className="card-image"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{ display: imageLoading ? 'none' : 'block' }}
                />
              )}
            </div>
          ) : (
            <div className="no-image">
              <p className="text-sm text-secondary">No image available</p>
            </div>
          )}
        </div>

        <div className="card-details-section">
          <div className="card-details">
            <h4 className="card-name text-lg font-heading mb-sm">
              {card.name || "Unknown Card"}
            </h4>

            <div className="card-info-grid">
              <div className="info-item">
                <span className="info-label">Set:</span>
                <span className="info-value">{card.set_code?.toUpperCase() ?? "Unknown"}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Mana Cost:</span>
                <span className="info-value">{card.mana_cost ?? "—"}</span>
              </div>

              <div className="info-item">
                <span className="info-label">CMC:</span>
                <span className="info-value">{card.cmc ?? "—"}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Type:</span>
                <span className="info-value">{card.type_line ?? "—"}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Rarity:</span>
                <span className={`info-value rarity rarity-${card.rarity ?? "unknown"}`}>
                  {card.rarity ? card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1) : "—"}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">Colors:</span>
                <span className="info-value">
                  {card.color_identity && card.color_identity.length > 0
                    ? card.color_identity.join(", ")
                    : "Colorless"}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">Commander:</span>
                <span className="info-value">{card.can_be_commander ? "Yes" : "No"}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Companion:</span>
                <span className="info-value">{card.can_be_companion ? "Yes" : "No"}</span>
              </div>
            </div>

            {card.oracle_text && (
              <div className="card-text mt-md">
                <h5 className="text-sm font-heading mb-xs">Oracle Text:</h5>
                <p className="text-sm oracle-text">{card.oracle_text}</p>
              </div>
            )}

            {card.companion_restriction && (
              <div className="companion-restriction mt-md">
                <h5 className="text-sm font-heading mb-xs">Companion Restriction:</h5>
                <p className="text-sm restriction-text">{card.companion_restriction}</p>
              </div>
            )}

            {card.scryfall_uri && (
              <div className="external-link mt-md">
                <a
                  href={card.scryfall_uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent"
                >
                  View on Scryfall →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
