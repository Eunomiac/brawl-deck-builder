// MTG Brawl Deck Builder - Draggable Card Component
import React, { type ReactNode, useCallback } from 'react';
import { useDraggable } from '../../hooks/useGSAP';
import { useGSAPContext } from '../../contexts/GSAPContext';
import type { Draggable } from 'gsap/Draggable';

interface DraggableCardProps {
  children: ReactNode;
  className?: string;
  onDragStart?: (draggable: Draggable) => void;
  onDrag?: (draggable: Draggable) => void;
  onDragEnd?: (draggable: Draggable) => void;
  bounds?: string | HTMLElement;
  disabled?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  children,
  className = '',
  onDragStart,
  onDrag,
  onDragEnd,
  bounds = 'body',
  disabled = false,
  snapToGrid = false,
  gridSize = 20,
}) => {
  const { enableAnimations } = useGSAPContext();

  const handleDragStart = useCallback((draggable: Draggable) => {
    // Add visual feedback
    if (draggable.target) {
      draggable.target.style.zIndex = '1000';
      draggable.target.style.transform += ' scale(1.05)';
    }
    onDragStart?.(draggable);
  }, [onDragStart]);

  const handleDrag = useCallback((draggable: Draggable) => {
    onDrag?.(draggable);
  }, [onDrag]);

  const handleDragEnd = useCallback((draggable: Draggable) => {
    // Remove visual feedback
    if (draggable.target) {
      draggable.target.style.zIndex = '';
      draggable.target.style.transform = draggable.target.style.transform.replace(' scale(1.05)', '');
    }
    onDragEnd?.(draggable);
  }, [onDragEnd]);

  const { ref } = useDraggable(
    enableAnimations && !disabled
      ? {
          bounds,
          onDragStart: handleDragStart,
          onDrag: handleDrag,
          onDragEnd: handleDragEnd,
          snap: snapToGrid
            ? {
                x: (value: number) => Math.round(value / gridSize) * gridSize,
                y: (value: number) => Math.round(value / gridSize) * gridSize,
              }
            : undefined,
          zIndexBoost: false, // We handle z-index manually
        }
      : {},
    [enableAnimations, disabled, bounds, snapToGrid, gridSize]
  );

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`card ${disabled ? 'cursor-default' : 'cursor-grab'} ${className}`}
      style={{
        touchAction: disabled ? 'auto' : 'none', // Prevent scrolling on touch devices
      }}
    >
      {children}
    </div>
  );
};
