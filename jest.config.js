/** @type {import('jest').Config} */
export default {
  // Test environment
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: 'tsconfig.test.json',
    }],
  },

  // Module name mapping for path aliases and assets
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^gsap$': '<rootDir>/src/test/__mocks__/gsap.js',
    '^gsap/(.*)$': '<rootDir>/src/test/__mocks__/gsap.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
  },

  // Global setup for environment variables
  globals: {
    'import.meta': {
      env: {
        VITE_SUPABASE_URL: 'https://cvkjluvuaunikkrrunxx.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2a2psdXZ1YXVuaWtrcnJ1bnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjU4MzcsImV4cCI6MjA2NDA0MTgzN30.XKTbl3w9g45AEKH-44-5USZaaOfkib3c-C6RRAxe-rQ',
      },
    },
  },

  // Test file patterns
  testMatch: [
    '**/src/**/__tests__/**/*.(ts|tsx|js)',
    '**/src/**/*.(test|spec).(ts|tsx|js)',
  ],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['text', 'lcov', 'html', 'json', 'json-summary'],

  // Coverage collection patterns
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/app/App.tsx', // Main application component with complex dependencies
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/test/**',
    '!src/**/index.ts', // Barrel export files - pure export statements
    '!src/shared/types/mtg.ts', // Pure type definitions, no executable code
    // GSAP integration files excluded due to complex library interactions
    // requiring integration testing rather than unit testing
    '!src/shared/utils/animations.ts', // GSAP animation utilities - integration testing only
    '!src/shared/hooks/useGSAP.ts',
    '!src/shared/contexts/GSAPContext.tsx',
    '!src/shared/components/animations/AnimatedCard.tsx',
    '!src/shared/components/animations/DraggableCard.tsx',
    '!src/shared/components/animations/LoadingSpinner.tsx',
    // Supabase files excluded from coverage requirements
    '!src/services/supabase/types.ts', // Auto-generated types
    '!src/services/supabase/client.ts', // Simple configuration with import.meta.env
    '!src/services/supabase/index.ts', // Barrel export
    '!src/services/supabase/connection.ts', // Environment-dependent utilities
    '!src/services/supabase/database-test.ts', // Testing utilities
    '!src/shared/components/SupabaseStatus.tsx', // React component with complex dependencies
    // Scryfall integration files excluded due to complex external service interactions
    // requiring integration testing rather than unit testing
    '!src/shared/services/scryfall/api.ts', // Network API calls, streaming responses
    '!src/shared/services/scryfall/database.ts', // Database operations, batch processing
    '!src/shared/services/scryfall/import.ts', // Orchestration service, coordinates multiple systems
    '!src/shared/services/scryfall/debug.ts', // Debug utilities - not production code
    '!src/features/collection/components/CardImportButton.tsx', // UI component with real-time progress
    '!src/shared/hooks/useCardImport.ts', // React hook with complex state management
    // Search integration files excluded due to complex database interactions
    // requiring integration testing rather than unit testing
    '!src/shared/services/search/CardSearchService.ts', // Database service with complex Supabase queries
    '!src/features/search/components/CardSearch.tsx', // React component with complex async state management
  ],

  // Coverage thresholds - 80% for new code, 20% global for existing code
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20,
    },
    // Note: Jest doesn't support "new code" thresholds like SonarQube
    // SonarQube will enforce 80% on new code via sonar-project.properties
  },

  // Test results reporter for SonarQube
  testResultsProcessor: 'jest-sonar-reporter',

  // ESM support
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true,
};
