// MTG Brawl Deck Builder - Environment Configuration
// Exports environment variables for use throughout the application
// This approach avoids import.meta.env issues in Jest tests

/**
 * Supabase configuration
 * These values are hardcoded since they won't change throughout this project
 * and this avoids Jest/TypeScript issues with import.meta.env
 */
export const SUPABASE_URL = "https://cvkjluvuaunikkrrunxx.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2a2psdXZ1YXVuaWtrcnJ1bnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjU4MzcsImV4cCI6MjA2NDA0MTgzN30.XKTbl3w9g45AEKH-44-5USZaaOfkib3c-C6RRAxe-rQ";

/**
 * Environment configuration object
 * Provides a centralized place for all environment-related settings
 */
export const ENV = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} as const;
