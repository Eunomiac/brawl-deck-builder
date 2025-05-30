# MTG Brawl Deck Builder - Project Charter

> **📋 Note for AI Assistant:** This is the foundational project document created during initial planning. For active project management, task tracking, and ongoing decisions, refer to **Linear** as the central organizing hub. This charter serves as historical reference and should not be updated regularly.

## Project Overview
This application will be a private web application for MTG Arena Brawl format deck building. It will maintain a current listing of legal cards for the Brawl format playable on MTG Arena, allow one user to upload and manage their personal collection, and provide a comprehensive deck-building interface. User will be able to build and save multiple decks; compare their decks against similar decks uploaded from popular deck-hosting websites; add speculative "wishlist" cards; perform various analyses such as how often certain cards are used in other decks, ratios of card types, and more; and export their deck in a format suitable for importing directly into MTG Arena.

## Technical Architecture

### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (fast development server, optimized builds)
- **Styling**: SCSS (component-scoped + global styles)
- **UI Approach**: Desktop-only, drag & drop interface
- **Component Organization**: Feature-based folder structure

### Backend Strategy
- **Approach**: Client-side only (no separate backend server)
- **Database**: Supabase PostgreSQL
- **Authentication**: None (private deployment with obscure URL)
- **API Integration**: Direct calls to Scryfall bulk data API

### Data Management
- **Card Data Source**: Scryfall bulk data (Oracle Cards file, ~154MB daily)
- **Filtering**: `legalities.brawl === "legal" && games.includes("arena")`
- **Commander Identification**: Cards with `type_line` containing "Legendary" + ("Creature" OR "Planeswalker")
- **Deduplication**: Process on import, discard irrelevant printings/variants
- **Search Strategy**: Separate search terms table for complex card name variations
- **Update Frequency**: Manual updates via "Update Cards" button

### Deployment & Hosting
- **Platform**: Vercel (excellent Vite support, generous free tier)
- **Deployment**: Automatic from GitHub main branch
- **Security**: Private deployment with obscure URL
- **Backup**: Supabase automatic backups + export functionality

### Performance Considerations
- **Scale**: ~13,000 cards, 100+ personal decks, 2,000+ reference decks
- **Optimization**: Pagination, lazy loading, React.memo, database indexing
- **Component Architecture**: Modular, reusable components following best practices

## Development Phases

### Phase 1: Foundation (MVP)
**Goal**: Basic working deck builder with core functionality
- Set up React + TypeScript + Vite project structure
- Implement Supabase database connection
- Create card data import from Scryfall bulk data
- Build basic card search functionality
- Implement simple deck creation and editing
- Basic drag & drop interface for adding cards to decks
- Commander validation (ensure selected commander can legally be a Brawl commander)
- Companion support (optional companion slot with restriction validation)
- Singleton format validation (no duplicates except basic lands, no overlap between commander/companion/deck)

### Phase 2: Collection & Validation
**Goal**: Personal collection management and deck validation
- CSV collection import functionality
- Deck validation against personal collection
- Card availability indicators in deck builder
- Collection statistics and overview
- Improved search with collection filtering

### Phase 3: Analysis & External Data
**Goal**: Deck analysis and external deck imports
- External deck import functionality
- Deck popularity analysis (cards used in similar decks)
- "Popular cards you're not using" recommendations
- "Unpopular cards you are using" analysis
- Basic deck statistics and visualizations

### Phase 4: Advanced Features
**Goal**: Complete feature set with advanced analysis
- Wishlist, back-burner, and exclusion lists per deck
- Advanced deck analysis (mana curve, card type ratios)
- Land recommendation system
- MTG Arena export functionality
- Deck comparison tools

## Database Schema Design

### Core Tables
```sql
-- Main card data (deduplicated)
cards (
  id UUID PRIMARY KEY,
  oracle_id UUID UNIQUE,
  name TEXT NOT NULL,
  mana_cost TEXT,
  cmc INTEGER,
  type_line TEXT,
  oracle_text TEXT,
  colors TEXT[],
  color_identity TEXT[],
  rarity TEXT,
  set_code TEXT,
  can_be_commander BOOLEAN DEFAULT FALSE,
  can_be_companion BOOLEAN DEFAULT FALSE,
  companion_restriction TEXT, -- JSON string describing companion deckbuilding restriction
  image_uris JSONB,
  scryfall_uri TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Search terms for complex card name variations
card_search_terms (
  id UUID PRIMARY KEY,
  card_id UUID REFERENCES cards(id),
  search_term TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User's personal collection
collection (
  id UUID PRIMARY KEY,
  card_id UUID REFERENCES cards(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User's personal decks
decks (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  commander_card_id UUID REFERENCES cards(id),
  companion_card_id UUID REFERENCES cards(id),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cards in each deck
deck_cards (
  id UUID PRIMARY KEY,
  deck_id UUID REFERENCES decks(id),
  card_id UUID REFERENCES cards(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  is_commander BOOLEAN DEFAULT FALSE
);

-- External reference decks for analysis
reference_decks (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  commander_card_id UUID REFERENCES cards(id),
  source_url TEXT,
  video_url TEXT,
  estimated_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cards in reference decks
reference_deck_cards (
  id UUID PRIMARY KEY,
  reference_deck_id UUID REFERENCES reference_decks(id),
  card_id UUID REFERENCES cards(id),
  quantity INTEGER NOT NULL DEFAULT 1
);
```

### Maintaining Current Card Listings
The application will download Scryfall bulk data (Oracle Cards) for cards legal in the Brawl format on Arena.
  - [Scryfall Bulk Data API](https://scryfall.com/docs/api/bulk-data)
  - Data updated manually via "Update Cards" button
  - Filter criteria: `legalities.brawl === "legal" && games.includes("arena")`
  - Commander identification: `type_line` contains "Legendary" + ("Creature" OR "Planeswalker")
  - Companion identification: Cards with "Companion" keyword in oracle text
  - Multiple printings collapsed into single entries during import
  - [Scryfall Tagger](https://tagger.scryfall.com/) tags included if available via API

### Companion Validation System
Manual companion restriction database with validation logic:
- **Lurrus of the Dream-Den**: All permanent cards have mana value ≤ 2
- **Yorion, Sky Nomad**: Deck contains exactly 80 cards (instead of 60)
- **Kaheera, the Orphanguard**: All creature cards are Cats, Elementals, Nightmares, Dinosaurs, or Beasts
- **Jegantha, the Wellspring**: No cards with {C}, {W}{W}, {U}{U}, {B}{B}, {R}{R}, or {G}{G} in mana costs
- **Gyruda, Doom of Depths**: All cards have even mana values
- **Umori, the Collector**: All non-land cards share a card type
- **Lutri, the Spellchaser**: Deck contains no more than one of each instant and sorcery (singleton already enforced)
- **Zirda, the Dawnwaker**: All permanent cards have activated abilities
- **Keruga, the Macrosage**: All non-land cards have mana value ≥ 3
- **Obosh, the Preypiercer**: All cards have odd mana values

#### Features & Complications
The data returned from a Scryfall API query will need to be processed and parsed to arrive at a format that can be easily queried and searched. This will include:
- Some types of cards will need to be queriable in a variety of ways, since Arena can be inconsistent in how it identifies certain cards.
  - E.g. "Double-faced" cards will need to be queriable by (a) the name on the front face, (b) the name on the back face, and (c) the combined name separated by double slashes (e.g. "Gnottvold Hermit", "Chrome Host Hulk" _and_ "Gnottvold Hermit // Chrome Host Hulk")
- Several digital-only versions of cards exist, which have been edited from their paper counterparts. These will need to be queriable by both their paper name, and their paper name prefixed with "A-" (e.g. "Alrund's Epiphany" _and_ "A-Alrund's Epiphany")
- Split cards, i.e. cards containing two different cards on the same face, will need to be queriable by both card names as well as their combined card names, separated by _either_ two _or_ three slashes (e.g. "Fire", "Ice", "Fire // Ice", _and_ "Fire /// Ice")
  - There are many other examples of cards that effectively contain two "spells" on the front face, including Adventure cards, Omen cards, and more. These will all need to be queriable in a similar fashion.
- Combining the above, some cards will need to be queriable in up to _eight_ different ways, such as split cards that _also_ have a digital variant (e.g. "Fire", "A-Fire", "Ice", "A-Ice", "Fire // Ice", "A-Fire // Ice", "Fire /// Ice", _and_ "A-Fire /// Ice").

### Maintaining User Collection
The user will be able to upload their collection from a CSV file exported from a third-party website. Piecemeal modification of the user's collection is unnecessary: A full collection upload will be performed whenever the user needs to update their collection.

### Deck Management
User will be able to create a new deck or upload an existing deck, exported from MTG Arena.
  - Decks can be stored and updated simply, as a simple list of card names and quantities that the user can edit directly
    - If the user enters a card name that doesn't appear in the master database, it should be immediately flagged
    - Cards the user enters into a deck that don't appear in the user's collection should likewise be flagged as such
  - Decks should be sorted/categorized by their Brawl Commander (though the application should allow for multiple different decks with the same commander)
  - Querying the Scryfall database for specific tags (of which there are many) should be
Several manually-maintained lists should be associated with each deck, including:
  - a "Wishlist" of cards to potentially add in the future
  - a "Back-Burner" list of cards that aren't currently in the deck, but that the user has considered and as such need not appear in searches for potential new cards to add
  - an "Excluded" list of cards that the user has decided will not be included in the deck
  - ... and potentially more
User will be able to upload additional decks in a way that associates them with a commander, for the purpose of analyzing, e.g., how popular certain cards are in decks with that commander.
  - These decks should have a URL link to the original source of the deck, as well as potentially a YouTube link to a Let's Play video that showcased the deck
  - These uploaded decks should automatically date themselves by analyzing the most recently-printed card that appears in the deck

### Deck Analysis
The interface for working on a single deck should include tabs for in-depth analysis of a variety of characteristics:
  - the aforementioned "popularity" of certain cards among other decks that were uploaded and associated with the same commander
  - a listing of "popular cards you are not using" and a listing of "unpopular cards you are using"
  - a list of lands that the user might consider adding to their deck
    - this will likely require a separate listing of land cards as a reference, which would include such things as the colors the land can generate, and a user-supplied rating of how effective the land is

### Exporting Decks
The user should be able to export their deck in a format suitable for importing directly into MTG Arena.
