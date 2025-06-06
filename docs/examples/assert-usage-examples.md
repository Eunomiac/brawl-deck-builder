# Assert Function Usage Examples

The `assert()` function is a powerful TypeScript utility that provides both runtime validation and compile-time type narrowing. Here are practical examples of how to use it in the MTG Brawl Deck Builder project.

## Basic Usage

### Runtime Validation with Type Narrowing

```typescript
// Example: Validating API responses
function processCardData(data: unknown) {
  // Assert that data is an object
  assert(typeof data === "object" && data !== null, "Card data must be an object");
  
  // TypeScript now knows data is object (not unknown)
  const cardObj = data as Record<string, unknown>;
  
  // Assert required properties exist
  assert("name" in cardObj, "Card must have a name property");
  assert("mana_cost" in cardObj, "Card must have a mana_cost property");
  
  // Type-safe access to properties
  assertType<string>(cardObj.name, "string", "card name");
  assertType<string>(cardObj.mana_cost, "string", "mana cost");
  
  // TypeScript now knows these are strings
  return {
    name: cardObj.name.trim(),
    manaCost: cardObj.mana_cost.toUpperCase()
  };
}
```

### DOM Element Validation

```typescript
// Example: Safe DOM manipulation
function setupCardElement(cardId: string) {
  const element = document.getElementById(cardId);
  
  // Assert element exists and is the right type
  assertDefined(element, `card element with id "${cardId}"`);
  assertInstanceOf(element, HTMLElement, "card element");
  
  // TypeScript now knows element is HTMLElement (not null)
  element.addEventListener("click", handleCardClick);
  element.classList.add("interactive-card");
  
  return element;
}
```

## Advanced Type Narrowing

### Union Type Narrowing

```typescript
type CardType = "creature" | "instant" | "sorcery" | "artifact" | "enchantment";

function validateCardType(input: unknown): CardType {
  assertType<string>(input, "string", "card type");
  
  const validTypes: CardType[] = ["creature", "instant", "sorcery", "artifact", "enchantment"];
  assert(
    validTypes.includes(input as CardType), 
    `Invalid card type: ${input}. Must be one of: ${validTypes.join(", ")}`
  );
  
  // TypeScript now knows input is a valid CardType
  return input as CardType;
}
```

### Array Validation

```typescript
function processDeckList(cards: unknown[]): string[] {
  assert(Array.isArray(cards), "Deck list must be an array");
  assert(cards.length > 0, "Deck list cannot be empty");
  assert(cards.length <= 100, "Deck list cannot exceed 100 cards");
  
  // Validate each card is a string
  cards.forEach((card, index) => {
    assertType<string>(card, "string", `card at index ${index}`);
  });
  
  // TypeScript now knows cards is string[]
  return cards.map(card => card.trim()).filter(card => card.length > 0);
}
```

## Error Handling Patterns

### Graceful Degradation

```typescript
function safelyGetCardImage(card: unknown): string {
  try {
    assert(typeof card === "object" && card !== null, "Card must be an object");
    const cardObj = card as Record<string, unknown>;
    
    assert("image_url" in cardObj, "Card must have image_url");
    assertType<string>(cardObj.image_url, "string", "image URL");
    
    return cardObj.image_url;
  } catch (error) {
    if (error instanceof AssertionError) {
      console.warn("Invalid card data:", error.message);
      return "/images/card-back.jpg"; // fallback image
    }
    throw error; // re-throw non-assertion errors
  }
}
```

### Validation with Custom Messages

```typescript
function validateDeckConfiguration(config: unknown) {
  assert(
    typeof config === "object" && config !== null,
    "Deck configuration must be a valid object"
  );
  
  const cfg = config as Record<string, unknown>;
  
  // Commander validation
  assert("commander" in cfg, "Deck must have a commander");
  assertType<string>(cfg.commander, "string", "commander name");
  assert(
    cfg.commander.trim().length > 0,
    "Commander name cannot be empty"
  );
  
  // Deck size validation
  assert("cards" in cfg, "Deck must have a cards array");
  assert(Array.isArray(cfg.cards), "Cards must be an array");
  assert(
    cfg.cards.length >= 99 && cfg.cards.length <= 100,
    `Brawl deck must have 99-100 cards, got ${cfg.cards.length}`
  );
  
  return cfg as { commander: string; cards: unknown[] };
}
```

## Integration with Existing Code

### Replacing Manual Type Guards

```typescript
// Before: Manual type checking
function oldWay(value: string | null) {
  if (value === null) {
    throw new Error("Value cannot be null");
  }
  // TypeScript still thinks value might be null here
  return value.toUpperCase(); // Potential runtime error
}

// After: Using assert
function newWay(value: string | null) {
  assert(value !== null, "Value cannot be null");
  // TypeScript knows value is string here
  return value.toUpperCase(); // Type-safe
}
```

### API Response Validation

```typescript
async function fetchCardData(cardName: string) {
  const response = await fetch(`/api/cards/${encodeURIComponent(cardName)}`);
  const data = await response.json();
  
  // Validate response structure
  assert(typeof data === "object" && data !== null, "Invalid API response");
  assert("success" in data, "API response missing success field");
  
  if (!data.success) {
    assert("error" in data, "Failed response missing error field");
    assertType<string>(data.error, "string", "error message");
    throw new Error(`API Error: ${data.error}`);
  }
  
  assert("card" in data, "Successful response missing card data");
  return data.card;
}
```

## Best Practices

1. **Use descriptive error messages** - Include context about what went wrong
2. **Prefer specific assert functions** - Use `assertDefined`, `assertType`, etc. when appropriate
3. **Handle AssertionError separately** - Distinguish between assertion failures and other errors
4. **Don't overuse** - Only assert conditions that should never fail in correct code
5. **Combine with TypeScript strict mode** - Assertions work best with strict type checking enabled

## Global Availability

All assert functions are available globally in this project:

```typescript
// No imports needed - available everywhere
assert(condition, "message");
assertDefined(value, "name");
assertType<string>(value, "string", "name");
assertInstanceOf(value, HTMLElement, "name");
```

Or import explicitly if preferred:

```typescript
import { assert, assertDefined, assertType, assertInstanceOf } from "@/shared/utils/assert";
```
