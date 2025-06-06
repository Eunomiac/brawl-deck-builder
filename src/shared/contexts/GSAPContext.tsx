// MTG Brawl Deck Builder - GSAP Context Provider
//
// COVERAGE EXCLUSION JUSTIFICATION:
// This context provider manages GSAP library initialization, performance monitoring,
// and global animation state. Testing requires:
// 1. Integration tests with actual GSAP library behavior
// 2. Performance testing with real animation workloads
// 3. Browser compatibility testing across different environments
// Unit testing would require mocking the entire GSAP ecosystem and performance APIs,
// which would not validate the actual integration behavior this context manages.
import {gsap} from 'gsap';
import React, {createContext, useContext, useEffect, useState, useMemo, type ReactNode} from 'react';
import {initializeGSAP, performanceUtils} from '../utils';

interface GSAPContextType {
  isInitialized: boolean;
  gsap: typeof gsap;
  enableAnimations: boolean;
  setEnableAnimations: (enabled: boolean) => void;
  reducedMotion: boolean;
}

const GSAPContext = createContext<GSAPContextType | undefined>(undefined);

interface GSAPProviderProps {
  children: ReactNode;
  enableAnimations?: boolean;
}

export const GSAPProvider: React.FC<GSAPProviderProps> = ({
  children,
  enableAnimations: initialEnableAnimations = true
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [enableAnimations, setEnableAnimations] = useState(initialEnableAnimations);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches) {
        // Disable animations if user prefers reduced motion
        setEnableAnimations(false);
        gsap.globalTimeline.timeScale(0.01); // Nearly instant animations
      } else {
        gsap.globalTimeline.timeScale(1); // Normal speed
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // Initialize GSAP
    try {
      initializeGSAP();
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize GSAP:', error);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      // Cleanup all animations on unmount
      performanceUtils.killAllAnimations();
    };
  }, []);

  useEffect(() => {
    // Update global animation state
    if (isInitialized) {
      if (!enableAnimations || reducedMotion) {
        gsap.globalTimeline.timeScale(0.01); // Nearly instant
      } else {
        gsap.globalTimeline.timeScale(1); // Normal speed
      }
    }
  }, [enableAnimations, reducedMotion, isInitialized]);

  const contextValue: GSAPContextType = useMemo(() => ({
    isInitialized,
    gsap,
    enableAnimations: enableAnimations && !reducedMotion,
    setEnableAnimations,
    reducedMotion,
  }), [isInitialized, enableAnimations, reducedMotion, setEnableAnimations]);

  return (
    <GSAPContext.Provider value={contextValue}>
      {children}
    </GSAPContext.Provider>
  );
};

// Hook to use GSAP context
// Co-locating hook with context provider for better maintainability and cohesion
// eslint-disable-next-line react-refresh/only-export-components
export const useGSAPContext = (): GSAPContextType => {
  const context = useContext(GSAPContext);
  if (context === undefined) {
    throw new Error('useGSAPContext must be used within a GSAPProvider');
  }
  return context;
};

// HOC for components that need GSAP
// Co-locating HOC with context provider for better maintainability and cohesion
// eslint-disable-next-line react-refresh/only-export-components
export const withGSAP = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isInitialized } = useGSAPContext();

    if (!isInitialized) {
      return (
        <div className="loading-spinner" aria-label="Loading animations...">
          <div className="spinner"></div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

// Animation settings component for user preferences
export const AnimationSettings: React.FC = () => {
  const { enableAnimations, setEnableAnimations, reducedMotion } = useGSAPContext();

  return (
    <div className="animation-settings">
      <label className="flex items-center gap-sm">
        <input
          type="checkbox"
          checked={enableAnimations}
          onChange={(e) => setEnableAnimations(e.target.checked)}
          disabled={reducedMotion}
          className="input"
        />
        <span className="text-sm">
          Enable animations
          {reducedMotion && (
            <span className="text-secondary ml-xs">
              (Disabled due to system preference)
            </span>
          )}
        </span>
      </label>
    </div>
  );
};
