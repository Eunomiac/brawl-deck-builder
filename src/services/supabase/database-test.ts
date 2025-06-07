import { supabase } from "./client";
import type { Tables } from "./types";

/**
 * Simple database connectivity tests
 * These functions can be used to verify the database connection and schema
 */

export async function testDatabaseConnection() {
  console.log("🔍 Testing database connection...");
  
  try {
    // Test basic connection
    const { error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error("❌ Auth connection failed:", authError.message);
      return false;
    }
    console.log("✅ Auth connection successful");

    // Test database query - get count of cards
    const { count, error: countError } = await supabase
      .from("cards")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Database query failed:", countError.message);
      return false;
    }

    console.log(`✅ Database query successful - Found ${count} cards in database`);
    return true;

  } catch (error) {
    console.error("❌ Connection test failed:", error);
    return false;
  }
}

export async function getCardSample(): Promise<Tables<"cards">[]> {
  console.log("🃏 Fetching sample cards...");
  
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .limit(5);

  if (error) {
    console.error("❌ Failed to fetch cards:", error.message);
    return [];
  }

  console.log(`✅ Fetched ${data.length} sample cards`);
  return data;
}

export async function getDeckSample(): Promise<Tables<"decks">[]> {
  console.log("🏗️ Fetching sample decks...");
  
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .limit(5);

  if (error) {
    console.error("❌ Failed to fetch decks:", error.message);
    return [];
  }

  console.log(`✅ Fetched ${data.length} sample decks`);
  return data;
}

export async function getCollectionSample(): Promise<Tables<"collection">[]> {
  console.log("📦 Fetching sample collection...");
  
  const { data, error } = await supabase
    .from("collection")
    .select("*")
    .limit(5);

  if (error) {
    console.error("❌ Failed to fetch collection:", error.message);
    return [];
  }

  console.log(`✅ Fetched ${data.length} collection entries`);
  return data;
}

// Run all tests
export async function runDatabaseTests() {
  console.log("🚀 Running database tests...");
  
  const connectionOk = await testDatabaseConnection();
  if (!connectionOk) {
    console.log("❌ Database tests failed - connection issues");
    return;
  }

  const [cards, decks, collection] = await Promise.all([
    getCardSample(),
    getDeckSample(),
    getCollectionSample(),
  ]);

  console.log("📊 Database test results:");
  console.log(`- Cards: ${cards.length} samples`);
  console.log(`- Decks: ${decks.length} samples`);
  console.log(`- Collection: ${collection.length} samples`);
  
  if (cards.length > 0) {
    console.log("🃏 Sample card:", cards[0].name);
  }
  
  console.log("✅ Database tests completed!");
}
