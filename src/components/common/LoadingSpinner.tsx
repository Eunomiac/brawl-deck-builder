// MTG Brawl Deck Builder - GSAP Loading Spinner Component
import React from 'react';
import {useGSAPContext} from '../../contexts/GSAPContext';
import {useLoadingAnimation} from '../../hooks/useGSAP';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  label = 'Loading...',
}) => {
  const { enableAnimations, isInitialized } = useGSAPContext();
  const spinnerRef = useLoadingAnimation(true);

  // Always show animation - use GSAP if available and enabled, otherwise CSS fallback
  const useGSAPAnimation = isInitialized && enableAnimations;

  // Build CSS classes for size variants
  const sizeClass = size !== 'md' ? `loading-spinner-${size}` : '';
  const spinnerClasses = `border-2 border-secondary border-t-accent rounded-full loading-spinner ${sizeClass} ${className}`.trim();

  return (
    <div className="flex items-center justify-center">
      <output
        ref={useGSAPAnimation ? (spinnerRef as React.RefObject<HTMLOutputElement>) : null}
        className={spinnerClasses}
        aria-label={label}
      />
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
};
