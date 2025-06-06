// MTG Brawl Deck Builder - Global Assert Implementation
// Makes assert functions available globally

import {
  assert as assertImpl,
  assertDefined as assertDefinedImpl,
  assertType as assertTypeImpl,
  assertInstanceOf as assertInstanceOfImpl
} from "./assert";

// Make functions available globally
// The type declarations are already in global.d.ts
globalThis.assert = assertImpl;
globalThis.assertDefined = assertDefinedImpl;
globalThis.assertType = assertTypeImpl;
globalThis.assertInstanceOf = assertInstanceOfImpl;

// Export for explicit imports if preferred
export {
  assertImpl as assert,
  assertDefinedImpl as assertDefined,
  assertTypeImpl as assertType,
  assertInstanceOfImpl as assertInstanceOf
};
