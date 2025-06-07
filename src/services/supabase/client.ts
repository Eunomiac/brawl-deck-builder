import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Environment variables validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY environment variable");
}

// Create Supabase client with proper TypeScript typing
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export default supabase;
