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
  const { enableAnimations } = useGSAPContext();
  const spinnerRef = useLoadingAnimation(true);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        ref={enableAnimations ? (spinnerRef as React.RefObject<HTMLDivElement>) : null}
        className={`${sizeClasses[size]} border-2 border-secondary border-t-accent rounded-full ${
          !enableAnimations ? 'loading-spinner' : ''
        }`}
        aria-label={label}
        role="status"
      />
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
};
