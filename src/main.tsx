import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.scss'
import App from './app/App.tsx'

// Create a throwing assert function using browser's console.assert
const assert = (condition: unknown, message?: string): asserts condition => {
  if (!condition) {
    const errorMessage = message ?? 'Assertion failed';
    // Use browser's console.assert for logging
    console.assert(condition, errorMessage);
    // Throw error for type narrowing and runtime failure
    throw new Error(errorMessage);
  }
};

globalThis.assert = assert;

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
