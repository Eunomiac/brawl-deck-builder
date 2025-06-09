// Mock for @supabase/supabase-js
const createClient = jest.fn(() => ({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        data: [],
        error: null,
        count: 0
      })),
      limit: jest.fn(() => ({
        data: [],
        error: null,
        count: 0
      })),
      order: jest.fn(() => ({
        data: [],
        error: null,
        count: 0
      })),
      range: jest.fn(() => ({
        data: [],
        error: null,
        count: 0
      })),
      data: [],
      error: null,
      count: 0
    })),
    insert: jest.fn(() => ({
      data: [],
      error: null
    })),
    update: jest.fn(() => ({
      data: [],
      error: null
    })),
    delete: jest.fn(() => ({
      data: [],
      error: null
    }))
  })),
  auth: {
    getSession: jest.fn(() => ({
      data: { session: null },
      error: null
    }))
  }
}));

module.exports = { createClient };
module.exports.createClient = createClient;
