// MTG Brawl Deck Builder - Animated Card Component
import React, {type ReactNode} from 'react';
import {useGSAPContext} from '../../contexts/GSAPContext';
import {useCardHover, useFadeIn} from '../../hooks/useGSAP';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
  enableHover?: boolean;
  enableFadeIn?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  onClick,
  delay = 0,
  enableHover = true,
  enableFadeIn = true,
}) => {
  const { enableAnimations } = useGSAPContext();

  // Always call hooks unconditionally (Rules of Hooks)
  const hoverRef = useCardHover();
  const fadeRef = useFadeIn(0.3, delay);

  // Use the appropriate ref based on enabled animations
  let ref = null;
  if (enableAnimations && enableHover) {
    ref = hoverRef;
  } else if (enableAnimations && enableFadeIn) {
    ref = fadeRef;
  }

  // Render as button when clickable for accessibility, otherwise as div
  if (onClick) {
    return (
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        className={`card ${className}`}
        onClick={onClick}
        style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`card ${className}`}
    >
      {children}
    </div>
  );
};
