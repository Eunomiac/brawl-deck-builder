# Supabase Setup Guide

This document outlines the Supabase configuration for the MTG Brawl Deck Builder project.

## Project Information

- **Project ID**: `cvkjluvuaunikkrrunxx`
- **Region**: `ca-central-1`
- **Project URL**: `https://cvkjluvuaunikkrrunxx.supabase.co`
- **Status**: Currently INACTIVE (needs to be activated)

## Environment Configuration

The project uses environment variables to configure the Supabase connection:

### Required Variables

Create a `.env.local` file in the project root with:

```env
VITE_SUPABASE_URL=https://cvkjluvuaunikkrrunxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### Getting the API Keys

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project: `mtg-brawl-deck-builder`
3. Go to Settings → API
4. Copy the "anon public" key
5. Replace `your_actual_anon_key_here` in `.env.local`

## Project Structure

The Supabase integration is organized as follows:

```
src/services/supabase/
├── client.ts          # Supabase client configuration
├── connection.ts      # Connection utilities and health checks
├── types.ts           # TypeScript type definitions (placeholder)
└── index.ts           # Main exports
```

## Usage

### Basic Client Usage

```typescript
import { supabase } from '@/services/supabase';

// Example: Query a table
const { data, error } = await supabase
  .from('your_table')
  .select('*');
```

### Connection Status

The app includes a `SupabaseStatus` component that displays:
- Environment variable validation
- Connection status
- Project URL and timestamp

This component is visible on the main page for development purposes.

### Health Checks

```typescript
import { SupabaseConnection } from '@/services/supabase';

// Test connection
const result = await SupabaseConnection.testConnection();

// Full health check
const health = await SupabaseConnection.healthCheck();
```

## Next Steps

1. **Activate the Supabase project** in the dashboard
2. **Get the API keys** and update `.env.local`
3. **Create database schema** for MTG cards, decks, and collections
4. **Generate TypeScript types** using Supabase CLI:
   ```bash
   npx supabase gen types typescript --project-id cvkjluvuaunikkrrunxx > src/services/supabase/types.ts
   ```

## Security Notes

- Never commit `.env.local` to version control
- Use Row Level Security (RLS) policies for multi-user data protection
- Keep the service role key secure and never expose it in client-side code
- The anon key is safe to use in client-side code as it has limited permissions

## Troubleshooting

### Connection Issues

1. Check that environment variables are set correctly
2. Verify the project is active in Supabase dashboard
3. Ensure API keys are valid and not expired
4. Check network connectivity

### Environment Variable Issues

The `SupabaseStatus` component will show warnings for:
- Missing environment variables
- Placeholder values that haven't been replaced
- Invalid URL formats

## Development Workflow

1. The connection status is visible on the main page during development
2. Environment validation happens automatically on app startup
3. Connection errors are logged to the console
4. Use the health check utilities for debugging connection issues
