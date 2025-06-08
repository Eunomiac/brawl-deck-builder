# Scryfall Data Debugger Guide

This guide explains how to use the Scryfall debugging utilities to inspect and analyze imported card data.

## Overview

The `ScryfallDebugger` provides tools to:
- Access imported card data from the database
- Search and filter cards by various criteria
- Generate import statistics and summaries
- Export card data for external analysis
- Compare imported data with Scryfall's standard search
- **Watch specific cards during import** for detailed processing debugging

## Quick Start

### Browser Console Access

In development mode, the debugger is automatically available in the browser console:

```javascript
// Get a quick summary of imported data
ScryfallDebugger.logImportSummary()

// Search for specific cards
ScryfallDebugger.logCards("Lightning")

// Get detailed statistics
const { summary } = await ScryfallDebugger.getImportSummary()
console.log(summary)
```

## Available Methods

### 1. Get All Cards

```javascript
// Get first 1000 cards (default)
const { cards, total } = await ScryfallDebugger.getAllCards()

// Get cards with custom options
const result = await ScryfallDebugger.getAllCards({
  limit: 50,
  offset: 100,
  orderBy: "cmc",
  orderDirection: "desc"
})
```

### 2. Search Cards by Name

```javascript
// Search for cards containing "Lightning"
const { cards } = await ScryfallDebugger.searchCardsByName("Lightning")

// Search with custom limit
const { cards } = await ScryfallDebugger.searchCardsByName("Dragon", 20)
```

### 3. Filter Cards by Criteria

```javascript
// Find all mythic commanders
const { cards } = await ScryfallDebugger.getCardsByCriteria({
  rarity: "mythic",
  canBeCommander: true
})

// Find blue/white cards with CMC 3-5
const { cards } = await ScryfallDebugger.getCardsByCriteria({
  colors: ["W", "U"],
  cmcMin: 3,
  cmcMax: 5
})

// Find companions
const { cards } = await ScryfallDebugger.getCardsByCriteria({
  canBeCompanion: true
})
```

### 4. Get Import Statistics

```javascript
// Get comprehensive statistics
const { summary } = await ScryfallDebugger.getImportSummary()

// Summary includes:
// - totalCards: number
// - commanders: number
// - companions: number
// - byRarity: { common: 1234, uncommon: 567, ... }
// - byColorIdentity: { "": 123, "W": 456, "WU": 78, ... }
// - bySets: { "BRO": 123, "DMU": 456, ... }
// - cmcDistribution: { 0: 123, 1: 456, 2: 789, ... }
```

### 5. Export Data

```javascript
// Export all cards to JSON file
await ScryfallDebugger.exportCardsToJSON()

// Export filtered cards
await ScryfallDebugger.exportCardsToJSON({
  rarity: "mythic",
  canBeCommander: true
}, "mythic-commanders.json")
```

### 6. Console Logging Helpers

```javascript
// Quick summary in console
await ScryfallDebugger.logImportSummary()

// Search and log specific cards
await ScryfallDebugger.logCards("Teferi", 5)
```

## Watch Card Debugging

The watch card feature enables detailed debugging of the data transformation pipeline for specific cards during import. This is essential for understanding how raw Scryfall data gets processed into your database format.

### Setting Up Watch Card

```javascript
// Set a watch term - cards containing this term will trigger verbose debugging
ScryfallDebugger.setWatchCard("Lightning Bolt")

// Check current watch term
ScryfallDebugger.getWatchCard()  // Returns: "lightning bolt"

// Clear watch term
ScryfallDebugger.clearWatchCard()
```

### What Gets Logged

When a card name matches your watch term during import, you'll see:

1. **Raw Scryfall Data**: The original card data as received from Scryfall
2. **Processing Steps**: Each transformation step applied to the card
3. **Final Processed Card**: The card data ready for database storage
4. **Complete Transformation**: Side-by-side comparison of before/after

### Example Output

```
🎯 WATCH CARD #1 - Raw Card Processing
📋 Card: Lightning Bolt
📊 Raw Scryfall Data:
   oracle_id: 196da6f4-8d8c-4882-a2b6-f3c6b5c8e9f2
   name: Lightning Bolt
   mana_cost: {R}
   cmc: 1
   type_line: Instant
   oracle_text: Lightning Bolt deals 3 damage to any target.
   colors: ["R"]
   color_identity: ["R"]
   rarity: common
   set: lea
   legalities.brawl: legal
   games: ["arena", "mtgo", "paper"]

🎯 WATCH CARD - Final Processed Card
📋 Card: Lightning Bolt
📊 Processed Data:
   oracle_id: 196da6f4-8d8c-4882-a2b6-f3c6b5c8e9f2
   original_name: Lightning Bolt
   name (display): Lightning Bolt
   search_key: lightningbolt
   mana_cost: {R}
   cmc: 1
   type_line: Instant
   oracle_text: Lightning Bolt deals 3 damage to any target.
   colors: ["R"]
   color_identity: ["R"]
   rarity: common
   set_code: lea
   can_be_commander: false
   can_be_companion: false

🔄 WATCH CARD - Complete Transformation
📋 Card: Lightning Bolt
📥 BEFORE (Raw Scryfall):
   name: Lightning Bolt
   set: lea
   legalities.brawl: legal

📤 AFTER (Processed):
   original_name: Lightning Bolt
   name (display): Lightning Bolt
   search_key: lightningbolt
   set_code: lea
   can_be_commander: false
   can_be_companion: false

🔍 KEY TRANSFORMATIONS:
   Search Key: "lightningbolt"
   Commander: false
   Companion: false
```

### Best Practices

1. **Use specific terms**: Instead of "dragon", use "Shivan Dragon" to avoid spam
2. **Set before import**: Watch cards only work during the import process
3. **Clear when done**: Remember to clear the watch term to avoid future spam
4. **Check match count**: The debugger shows how many matching cards were found

### Troubleshooting Import Issues

Watch cards are particularly useful for:

- **Name normalization issues**: See how card names get transformed
- **Missing cards**: Verify if a card is being filtered out during processing
- **Commander detection**: Check why a card isn't being marked as a commander
- **Set code mapping**: Verify set codes are being mapped correctly
- **Double-faced cards**: Debug image URI handling for complex cards

## Common Debugging Scenarios

### Finding Missing Cards

1. **Get total count**: Check if the expected number of cards were imported
```javascript
const { summary } = await ScryfallDebugger.getImportSummary()
console.log(`Total cards: ${summary.totalCards}`)
```

2. **Search for specific cards**: Look for cards you expect to be present
```javascript
await ScryfallDebugger.logCards("Teferi")
await ScryfallDebugger.logCards("Lightning Bolt")
```

3. **Check by set**: Verify cards from specific sets
```javascript
const { cards } = await ScryfallDebugger.getCardsByCriteria({
  setCode: "BRO"  // Brothers' War
})
console.log(`BRO cards: ${cards.length}`)
```

### Analyzing Import Quality

1. **Check rarity distribution**:
```javascript
const { summary } = await ScryfallDebugger.getImportSummary()
console.log("Rarity distribution:", summary.byRarity)
```

2. **Verify commander/companion counts**:
```javascript
const { summary } = await ScryfallDebugger.getImportSummary()
console.log(`Commanders: ${summary.commanders}`)
console.log(`Companions: ${summary.companions}`)
```

3. **Check color distribution**:
```javascript
const { summary } = await ScryfallDebugger.getImportSummary()
console.log("Color identity distribution:", summary.byColorIdentity)
```

### Comparing with Scryfall

1. **Export data for external comparison**:
```javascript
// Export all cards
await ScryfallDebugger.exportCardsToJSON()

// Export specific subset
await ScryfallDebugger.exportCardsToJSON({
  rarity: "mythic"
}, "mythic-cards.json")
```

2. **Search for specific missing cards**:
```javascript
// Cards you expect but might be missing
const suspectedMissing = ["Teferi, Hero of Dominaria", "Lightning Bolt", "Sol Ring"]

for (const cardName of suspectedMissing) {
  const { cards } = await ScryfallDebugger.searchCardsByName(cardName)
  console.log(`${cardName}: ${cards.length > 0 ? "FOUND" : "MISSING"}`)
}
```

## Data Structure

Each card object contains:
```typescript
{
  oracle_id: string | null,
  name: string | null,
  mana_cost: string | null,
  cmc: number | null,
  type_line: string | null,
  oracle_text: string | null,
  colors: string[] | null,
  color_identity: string[] | null,
  rarity: string | null,
  set_code: string | null,
  can_be_commander: boolean | null,
  can_be_companion: boolean | null,
  companion_restriction: string | null,
  image_uris: any, // JSON object
  scryfall_uri: string | null
}
```

## Tips

- **Use console.table()** for better data visualization:
  ```javascript
  const { cards } = await ScryfallDebugger.searchCardsByName("Dragon")
  console.table(cards.slice(0, 10))
  ```

- **Filter results** for easier analysis:
  ```javascript
  const { cards } = await ScryfallDebugger.getAllCards({ limit: 100 })
  const commanders = cards.filter(card => card.can_be_commander)
  console.table(commanders)
  ```

- **Export subsets** for detailed analysis:
  ```javascript
  // Export only commanders for external analysis
  await ScryfallDebugger.exportCardsToJSON({
    canBeCommander: true
  }, "commanders-only.json")
  ```

- **Debug specific cards during import**:
  ```javascript
  // Set watch card before starting import
  ScryfallDebugger.setWatchCard("Teferi")

  // Run your import process
  // ... import happens here ...

  // Clear when done to avoid future spam
  ScryfallDebugger.clearWatchCard()
  ```

- **Use partial names for watch cards**:
  ```javascript
  // This will match "Lightning Bolt", "Lightning Strike", etc.
  ScryfallDebugger.setWatchCard("Lightning")

  // This will match only cards containing "Teferi"
  ScryfallDebugger.setWatchCard("Teferi")
  ```

## Error Handling

All methods return error information when something goes wrong:

```javascript
const { cards, error } = await ScryfallDebugger.searchCardsByName("test")
if (error) {
  console.error("Search failed:", error)
} else {
  console.log("Found cards:", cards.length)
}
```

## Performance Notes

- **Large queries**: Use pagination for large datasets
- **Export limits**: Export functions have a 10,000 card limit
- **Database queries**: All methods query the local Supabase database, not Scryfall directly
