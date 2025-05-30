// MTG Brawl Deck Builder - GSAP Loading Spinner Component
import React from 'react';
import { useLoadingAnimation } from '../../hooks/useGSAP';
import { useGSAPContext } from '../../contexts/GSAPContext';

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

  const sizeClasses = {
    sm: "16px",
    md: "24px",
    lg: "32px",
  };

  // Always show animation - use GSAP if available and enabled, otherwise CSS fallback
  const useGSAPAnimation = isInitialized && enableAnimations;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        ref={useGSAPAnimation ? (spinnerRef as React.RefObject<HTMLDivElement>) : null}
        className={`border-2 border-secondary border-t-accent rounded-full loading-spinner`}
        style={{
          width: sizeClasses[size],
          height: sizeClasses[size],
        }}
        aria-label={label}
        role="status"
      />
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
};
