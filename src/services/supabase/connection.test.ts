import { SupabaseConnection } from "./connection";

// Mock environment variables for testing
const mockEnv = {
  VITE_SUPABASE_URL: "https://test.supabase.co",
  VITE_SUPABASE_ANON_KEY: "test-anon-key",
};

// Mock import.meta.env
Object.defineProperty(import.meta, "env", {
  value: mockEnv,
  writable: true,
});

describe("SupabaseConnection", () => {
  describe("validateEnvironment", () => {
    it("should validate environment variables correctly", () => {
      const result = SupabaseConnection.validateEnvironment();
      
      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it("should detect missing environment variables", () => {
      const originalEnv = import.meta.env;
      
      // Mock missing variables
      Object.defineProperty(import.meta, "env", {
        value: {},
        writable: true,
      });

      const result = SupabaseConnection.validateEnvironment();
      
      expect(result.valid).toBe(false);
      expect(result.missing).toContain("VITE_SUPABASE_URL");
      expect(result.missing).toContain("VITE_SUPABASE_ANON_KEY");

      // Restore original env
      Object.defineProperty(import.meta, "env", {
        value: originalEnv,
        writable: true,
      });
    });

    it("should detect placeholder values", () => {
      const originalEnv = import.meta.env;
      
      // Mock placeholder values
      Object.defineProperty(import.meta, "env", {
        value: {
          VITE_SUPABASE_URL: "your_supabase_project_url",
          VITE_SUPABASE_ANON_KEY: "your_supabase_anon_key",
        },
        writable: true,
      });

      const result = SupabaseConnection.validateEnvironment();
      
      expect(result.warnings).toContain("VITE_SUPABASE_URL appears to be a placeholder value");
      expect(result.warnings).toContain("VITE_SUPABASE_ANON_KEY appears to be a placeholder value");

      // Restore original env
      Object.defineProperty(import.meta, "env", {
        value: originalEnv,
        writable: true,
      });
    });
  });

  describe("testConnection", () => {
    it("should handle connection errors gracefully", async () => {
      const result = await SupabaseConnection.testConnection();
      
      // Since we're using mock credentials, this should fail
      expect(result.connected).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.latency).toBe("number");
    });
  });

  describe("getStatus", () => {
    it("should return status information", async () => {
      const result = await SupabaseConnection.getStatus();
      
      expect(result.url).toBe("https://test.supabase.co");
      expect(typeof result.connected).toBe("boolean");
      expect(typeof result.timestamp).toBe("string");
    });
  });
});
