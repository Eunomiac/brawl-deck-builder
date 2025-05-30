// MTG Brawl Deck Builder - GSAP React Hooks
import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { animations, draggableUtils, ANIMATION_DURATION, EASING } from '../utils/animations';
import type { Draggable } from 'gsap/Draggable';

// Hook for basic GSAP animations with cleanup
export const useGSAP = (
  animationFn: (element: HTMLElement) => gsap.core.Timeline | gsap.core.Tween,
  dependencies: React.DependencyList = []
) => {
  const elementRef = useRef<HTMLElement>(null);
  const animationRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      // Kill previous animation
      if (animationRef.current) {
        animationRef.current.kill();
      }

      // Create new animation
      animationRef.current = animationFn(elementRef.current);
    }

    // Cleanup function
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, dependencies);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, []);

  return elementRef;
};

// Hook for fade in animation on mount
export const useFadeIn = (duration = ANIMATION_DURATION.NORMAL, delay = 0) => {
  return useGSAP((element) => {
    return gsap.fromTo(element,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: EASING.SMOOTH
      }
    );
  });
};

// Hook for slide in animations
export const useSlideIn = (
  direction: 'left' | 'right' | 'up' | 'down' = 'up',
  duration = ANIMATION_DURATION.NORMAL
) => {
  return useGSAP((element) => {
    const fromProps: Record<string, number> = { opacity: 0 };
    const toProps: Record<string, number> = { opacity: 1 };

    switch (direction) {
      case 'left':
        fromProps.x = -100;
        toProps.x = 0;
        break;
      case 'right':
        fromProps.x = 100;
        toProps.x = 0;
        break;
      case 'up':
        fromProps.y = 50;
        toProps.y = 0;
        break;
      case 'down':
        fromProps.y = -50;
        toProps.y = 0;
        break;
    }

    return gsap.fromTo(element, fromProps, {
      ...toProps,
      duration,
      ease: EASING.SMOOTH,
    });
  });
};

// Hook for hover animations
export const useHoverAnimation = (
  hoverAnimation: (element: HTMLElement) => gsap.core.Timeline | gsap.core.Tween,
  hoverOutAnimation?: (element: HTMLElement) => gsap.core.Timeline | gsap.core.Tween
) => {
  const elementRef = useRef<HTMLElement>(null);
  const hoverTween = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (elementRef.current) {
      if (hoverTween.current) {
        hoverTween.current.kill();
      }
      hoverTween.current = hoverAnimation(elementRef.current);
    }
  }, [hoverAnimation]);

  const handleMouseLeave = useCallback(() => {
    if (elementRef.current) {
      if (hoverTween.current) {
        hoverTween.current.kill();
      }
      if (hoverOutAnimation) {
        hoverTween.current = hoverOutAnimation(elementRef.current);
      } else {
        // Default hover out animation
        hoverTween.current = gsap.to(elementRef.current, {
          scale: 1,
          y: 0,
          duration: ANIMATION_DURATION.FAST,
          ease: EASING.SMOOTH,
        });
      }
    }
  }, [hoverOutAnimation]);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        if (hoverTween.current) {
          hoverTween.current.kill();
        }
      };
    }
  }, [handleMouseEnter, handleMouseLeave]);

  return elementRef;
};

// Hook for card hover effects
export const useCardHover = () => {
  return useHoverAnimation(
    (element) => animations.cardHover(element),
    (element) => animations.cardHoverOut(element)
  );
};

// Hook for draggable functionality
export const useDraggable = (
  options: Partial<Draggable.Vars> = {},
  dependencies: React.DependencyList = []
) => {
  const elementRef = useRef<HTMLElement>(null);
  const draggableRef = useRef<Draggable | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      // Kill previous draggable instance
      if (draggableRef.current) {
        draggableRef.current.kill();
      }

      // Create new draggable instance
      draggableRef.current = draggableUtils.createDraggableCard(
        elementRef.current,
        options
      );
    }

    return () => {
      if (draggableRef.current) {
        draggableRef.current.kill();
      }
    };
  }, dependencies);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (draggableRef.current) {
        draggableRef.current.kill();
      }
    };
  }, []);

  return {
    ref: elementRef,
    draggable: draggableRef.current,
  };
};

// Hook for stagger animations on lists
export const useStaggerAnimation = (
  itemSelector: string,
  duration = ANIMATION_DURATION.NORMAL,
  stagger = 0.1
) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll(itemSelector) as NodeListOf<HTMLElement>;

      if (items.length > 0) {
        gsap.fromTo(Array.from(items),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration,
            ease: EASING.SMOOTH,
            stagger,
          }
        );
      }
    }
  }, [itemSelector, duration, stagger]);

  return containerRef;
};

// Hook for timeline-based animations
export const useTimeline = (
  timelineFn: (tl: gsap.core.Timeline, element: HTMLElement) => void,
  dependencies: React.DependencyList = []
) => {
  const elementRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      // Kill previous timeline
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      // Create new timeline
      timelineRef.current = gsap.timeline();
      timelineFn(timelineRef.current, elementRef.current);
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, dependencies);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return {
    ref: elementRef,
    timeline: timelineRef.current,
    play: () => timelineRef.current?.play(),
    pause: () => timelineRef.current?.pause(),
    reverse: () => timelineRef.current?.reverse(),
    restart: () => timelineRef.current?.restart(),
  };
};

// Hook for scroll-triggered animations
export const useScrollAnimation = (
  animationFn: (element: HTMLElement) => gsap.core.Timeline | gsap.core.Tween,
  threshold = 0.1
) => {
  const elementRef = useRef<HTMLElement>(null);
  const animationRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            animationRef.current = animationFn(element);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [animationFn, threshold]);

  return elementRef;
};

// Hook for loading animations
export const useLoadingAnimation = (isLoading: boolean) => {
  const elementRef = useRef<HTMLElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      if (animationRef.current) {
        animationRef.current.kill();
      }

      if (isLoading) {
        animationRef.current = animations.spin(elementRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [isLoading]);

  return elementRef;
};
