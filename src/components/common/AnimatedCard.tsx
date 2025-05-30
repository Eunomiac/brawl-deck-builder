// MTG Brawl Deck Builder - Animated Card Component
import React, { type ReactNode } from 'react';
import { useCardHover, useFadeIn } from '../../hooks/useGSAP';
import { useGSAPContext } from '../../contexts/GSAPContext';

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

  // Only apply animations if enabled
  const hoverRef = enableAnimations && enableHover ? useCardHover() : null;
  const fadeRef = enableAnimations && enableFadeIn ? useFadeIn(0.3, delay) : null;

  // Use the appropriate ref or create a fallback
  const ref = hoverRef || fadeRef;

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`card ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </div>
  );
};
