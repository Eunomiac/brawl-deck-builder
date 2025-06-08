# Set Date Usage Examples

This document shows how to use the new set date functionality for sorting sets by release date and dating decklists.

## Overview

The system now automatically extracts set release dates during card import and saves them to a dedicated `sets` table. This enables efficient set sorting and deck dating functionality.

## Basic Usage

### 1. Getting Set Release Dates from Database

```typescript
import { SetsDatabaseService } from "@/shared/services/sets";

// Get all set release dates as a lookup map
const setReleaseDates = await SetsDatabaseService.getSetReleaseDates();
// Result: { "neo": "2022-02-18", "snc": "2022-04-29", "dmu": "2022-09-09", ... }
```

### 2. Sorting Set Codes by Release Date

```typescript
import { ScryfallUtils } from "@/shared/services/scryfall";

// Sort some set codes by release date (most recent first)
const deckSets = ["neo", "snc", "dmu", "bro"];
const sorted = ScryfallUtils.sortSetsByReleaseDate(deckSets, setReleaseDates);
// Result: ["bro", "dmu", "snc", "neo"]

// Sort oldest first
const sortedOldest = ScryfallUtils.sortSetsByReleaseDate(deckSets, setReleaseDates, true);
// Result: ["neo", "snc", "dmu", "bro"]
```

### 3. Dating a Decklist

```typescript
import { ScryfallUtils } from "@/shared/services/scryfall";

// Find the most recent set in a deck to estimate when it was created
const deckSets = ["neo", "snc", "dmu", "bro"];
const deckDate = ScryfallUtils.getMostRecentSet(deckSets, setReleaseDates);
// Result: { setCode: "bro", releaseDate: "2022-11-18" }

console.log(`This deck was likely created after ${deckDate.releaseDate} (${deckDate.setCode})`);
```

### 4. Advanced Usage with Utility Functions

```typescript
import { dateDeckByMostRecentSet, getArenaSetsSortedByDate } from "@/shared/utils/setDateUtils";

// Get comprehensive deck dating information
const deckAnalysis = dateDeckByMostRecentSet(deckSets, setReleaseDates);
if (deckAnalysis) {
  console.log(`Most recent set: ${deckAnalysis.mostRecentSet} (${deckAnalysis.releaseDate})`);
  console.log("All sets in chronological order:", deckAnalysis.allSetsSorted);
}

// Get all Arena sets sorted by date
const processedCards = await CardProcessor.processCardData(rawCards);
const arenaSets = getArenaSetsSortedByDate(processedCards, setReleaseDates);
console.log("Arena sets from oldest to newest:", arenaSets);
```

## Database Queries

### 1. Sets in Date Range

```typescript
import { SetsDatabaseService } from "@/shared/services/sets";

// Find sets released in 2022
const sets2022 = await SetsDatabaseService.getSetsInDateRange("2022-01-01", "2022-12-31");
console.log("Sets released in 2022:", sets2022);
```

### 2. Most Recent Set

```typescript
// Get the most recently released set
const mostRecent = await SetsDatabaseService.getMostRecentSet();
if (mostRecent) {
  console.log(`Latest set: ${mostRecent.setCode} (${mostRecent.releaseDate})`);
}
```

## Integration with Card Import

The set data is automatically extracted and saved during the card import process:

```typescript
import { CardImportService } from "@/shared/services/scryfall";

// Import cards (this will also save set data)
const result = await CardImportService.importCards((progress) => {
  console.log(`${progress.status}: ${progress.message}`);
});

// Set data is now available in the database
const setReleaseDates = await SetsDatabaseService.getSetReleaseDates();
```

## Use Cases

### 1. Deck Analysis
- Determine when a deck was likely created based on its newest cards
- Analyze the "age" of cards in a deck
- Track meta evolution over time

### 2. Collection Management
- Sort your collection by set release date
- Find cards from specific time periods
- Organize sets chronologically

### 3. Deck Building
- Ensure deck legality for specific time periods
- Build "historical" decks using only cards available at a certain date
- Analyze power creep over time

## Database Schema

The `sets` table stores:
- `set_code`: Three-letter set code (e.g., "neo", "snc")
- `name`: Full set name
- `released_at`: Release date for sorting
- `set_type`: Type of set (expansion, core, etc.)
- `digital`: Whether it's a digital-only set

## Performance Notes

- Set data is cached in the database for fast lookups
- The `setReleaseDates` object should be cached in your application
- Database queries are indexed on `set_code` and `released_at` for performance
