import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.scss'
import App from './app/App.tsx'

// Initialize global utilities
import { initializeGlobals } from './shared/utils/setup';
initializeGlobals();

// Development debugging utilities
if (import.meta.env.DEV) {
  import('./shared/services/scryfall').then(({ ScryfallDebugger }) => {
    // Make debugger available in browser console
    Object.assign(globalThis, { ScryfallDebugger });
    console.log('🔧 ScryfallDebugger available in console as ScryfallDebugger');
    console.log('📖 Try: ScryfallDebugger.logImportSummary()');
    console.log('📖 For all cards: ScryfallDebugger.getAllCardsUnlimited()');
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
