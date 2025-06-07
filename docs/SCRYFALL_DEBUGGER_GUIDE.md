# Scryfall Data Debugger Guide

This guide explains how to use the Scryfall debugging utilities to inspect and analyze imported card data.

## Overview

The `ScryfallDebugger` provides tools to:
- Access imported card data from the database
- Search and filter cards by various criteria
- Generate import statistics and summaries
- Export card data for external analysis
- Compare imported data with Scryfall's standard search

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
