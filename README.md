# MTG Brawl Deck Builder

A private web application for MTG Arena Brawl format deck building with collection management, deck analysis, and MTG Arena export functionality.

## Features

- **Deck Building**: Intuitive drag & drop interface for building Brawl decks
- **Collection Management**: Import and track your MTG Arena collection
- **Format Validation**: Automatic validation for Brawl format rules and companion restrictions
- **Card Search**: Advanced search with support for complex card name variations
- **Deck Analysis**: Mana curve visualization and deck statistics
- **MTG Arena Export**: Export decks in MTG Arena-compatible format

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: SCSS with modern @use syntax
- **Backend**: Supabase (PostgreSQL + Auth + API)
- **Deployment**: Vercel with automatic GitHub integration

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # React components organized by feature
│   ├── common/         # Shared/reusable components
│   ├── deck/           # Deck building components
│   └── search/         # Card search components
├── hooks/              # Custom React hooks
├── services/           # API and external service integrations
├── styles/             # SCSS stylesheets
│   ├── components/     # Component-specific styles
│   ├── _variables.scss # SCSS variables
│   ├── _globals.scss   # Global styles
│   └── main.scss       # Main stylesheet entry point
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## License

MIT License - This is a private project for personal use.
