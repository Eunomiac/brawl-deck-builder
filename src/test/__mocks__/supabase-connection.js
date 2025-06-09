// Mock for services/supabase/connection
const SupabaseConnection = {
  testConnection: jest.fn(() => Promise.resolve(true)),
  getConnectionInfo: jest.fn(() => ({
    url: "https://test.supabase.co",
    status: "connected",
    region: "test-region"
  })),
  validateEnvironment: jest.fn(() => Promise.resolve()),
  createTestClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        data: [],
        error: null
      }))
    }))
  }))
};

module.exports = { SupabaseConnection };
module.exports.SupabaseConnection = SupabaseConnection;
