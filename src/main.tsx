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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
