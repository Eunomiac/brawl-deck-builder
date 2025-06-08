// MTG Brawl Deck Builder - Environment Configuration Tests
import { SUPABASE_URL, SUPABASE_ANON_KEY, ENV } from './env';

describe('Environment Configuration', () => {
  describe('SUPABASE_URL', () => {
    it('should be a valid Supabase URL', () => {
      expect(SUPABASE_URL).toBeDefined();
      expect(typeof SUPABASE_URL).toBe('string');
      expect(SUPABASE_URL).toMatch(/^https:\/\/.*\.supabase\.co$/);
      expect(SUPABASE_URL).toBe('https://cvkjluvuaunikkrrunxx.supabase.co');
    });

    it('should not be empty', () => {
      expect(SUPABASE_URL.length).toBeGreaterThan(0);
    });
  });

  describe('SUPABASE_ANON_KEY', () => {
    it('should be a valid JWT token format', () => {
      expect(SUPABASE_ANON_KEY).toBeDefined();
      expect(typeof SUPABASE_ANON_KEY).toBe('string');
      // JWT tokens have 3 parts separated by dots
      expect(SUPABASE_ANON_KEY.split('.')).toHaveLength(3);
    });

    it('should start with eyJ (base64 encoded JSON)', () => {
      expect(SUPABASE_ANON_KEY).toMatch(/^eyJ/);
    });

    it('should not be empty', () => {
      expect(SUPABASE_ANON_KEY.length).toBeGreaterThan(0);
    });
  });

  describe('ENV object', () => {
    it('should contain all required environment variables', () => {
      expect(ENV).toBeDefined();
      expect(ENV.SUPABASE_URL).toBe(SUPABASE_URL);
      expect(ENV.SUPABASE_ANON_KEY).toBe(SUPABASE_ANON_KEY);
    });

    it('should be a readonly object', () => {
      // TypeScript const assertion makes it readonly at compile time
      expect(Object.isFrozen(ENV)).toBe(false); // Not frozen at runtime, but readonly in TS
      expect(ENV).toEqual({
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
      });
    });

    it('should have consistent values with individual exports', () => {
      expect(ENV.SUPABASE_URL).toBe(SUPABASE_URL);
      expect(ENV.SUPABASE_ANON_KEY).toBe(SUPABASE_ANON_KEY);
    });
  });

  describe('Environment validation', () => {
    it('should have valid Supabase configuration', () => {
      // Validate that we have a complete Supabase configuration
      expect(SUPABASE_URL).toContain('supabase.co');
      expect(SUPABASE_ANON_KEY).toMatch(/^eyJ.*\./); // JWT format
      
      // Ensure they're not placeholder values
      expect(SUPABASE_URL).not.toBe('your-supabase-url');
      expect(SUPABASE_ANON_KEY).not.toBe('your-anon-key');
    });

    it('should have production-ready configuration', () => {
      // Ensure we're not using development/test placeholders
      expect(SUPABASE_URL).not.toContain('localhost');
      expect(SUPABASE_URL).not.toContain('127.0.0.1');
      expect(SUPABASE_URL).not.toContain('test');
      expect(SUPABASE_URL).not.toContain('dev');
    });
  });
});
