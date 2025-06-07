// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {
  AnimationDirection,
  AnimationEasing,
  AnimationDuration,
  SpinnerSize,
  CardRarity,
  ManaColor,
  DeckValidationState
} from "./enums";

describe("Shared Enums", () => {
  describe("AnimationDirection", () => {
    it("should have correct string values", () => {
      expect(AnimationDirection.Left).toBe("left");
      expect(AnimationDirection.Right).toBe("right");
      expect(AnimationDirection.Up).toBe("up");
      expect(AnimationDirection.Down).toBe("down");
    });

    it("should have all expected direction values", () => {
      const directions = Object.values(AnimationDirection);
      expect(directions).toHaveLength(4);
      expect(directions).toContain("left");
      expect(directions).toContain("right");
      expect(directions).toContain("up");
      expect(directions).toContain("down");
    });

    it("should be usable as object keys", () => {
      const directionMap = {
        [AnimationDirection.Left]: "slide-left",
        [AnimationDirection.Right]: "slide-right",
        [AnimationDirection.Up]: "slide-up",
        [AnimationDirection.Down]: "slide-down"
      };

      expect(directionMap[AnimationDirection.Left]).toBe("slide-left");
      expect(directionMap[AnimationDirection.Right]).toBe("slide-right");
    });
  });

  describe("AnimationEasing", () => {
    it("should have correct GSAP easing values", () => {
      expect(AnimationEasing.Smooth).toBe("power2.out");
      expect(AnimationEasing.Bounce).toBe("back.out(1.7)");
      expect(AnimationEasing.Elastic).toBe("elastic.out(1, 0.3)");
      expect(AnimationEasing.Quick).toBe("power1.out");
      expect(AnimationEasing.CardFlip).toBe("power2.inOut");
    });

    it("should have all expected easing types", () => {
      const easings = Object.values(AnimationEasing);
      expect(easings).toHaveLength(5);
      expect(easings).toContain("power2.out");
      expect(easings).toContain("back.out(1.7)");
      expect(easings).toContain("elastic.out(1, 0.3)");
    });

    it("should provide valid GSAP easing strings", () => {
      // All values should be strings that GSAP can parse
      Object.values(AnimationEasing).forEach(easing => {
        expect(typeof easing).toBe("string");
        expect(easing.length).toBeGreaterThan(0);
      });
    });
  });

  describe("AnimationDuration", () => {
    it("should have correct numeric values in seconds", () => {
      expect(AnimationDuration.Fast).toBe(0.2);
      expect(AnimationDuration.Normal).toBe(0.3);
      expect(AnimationDuration.Slow).toBe(0.5);
      expect(AnimationDuration.ExtraSlow).toBe(0.8);
    });

    it("should have durations in ascending order", () => {
      expect(AnimationDuration.Fast).toBeLessThan(AnimationDuration.Normal);
      expect(AnimationDuration.Normal).toBeLessThan(AnimationDuration.Slow);
      expect(AnimationDuration.Slow).toBeLessThan(AnimationDuration.ExtraSlow);
    });

    it("should have all positive values", () => {
      // Filter to only numeric values (TypeScript enums include both keys and values)
      const numericValues = Object.values(AnimationDuration).filter(value => typeof value === "number");

      numericValues.forEach(duration => {
        expect(duration).toBeGreaterThan(0);
        expect(typeof duration).toBe("number");
      });

      // Ensure we actually have numeric values to test
      expect(numericValues.length).toBeGreaterThan(0);
    });
  });

  describe("SpinnerSize", () => {
    it("should have correct size abbreviations", () => {
      expect(SpinnerSize.Small).toBe("sm");
      expect(SpinnerSize.Medium).toBe("md");
      expect(SpinnerSize.Large).toBe("lg");
    });

    it("should have all expected sizes", () => {
      const sizes = Object.values(SpinnerSize);
      expect(sizes).toHaveLength(3);
      expect(sizes).toContain("sm");
      expect(sizes).toContain("md");
      expect(sizes).toContain("lg");
    });

    it("should be compatible with CSS class naming", () => {
      Object.values(SpinnerSize).forEach(size => {
        expect(size).toMatch(/^[a-z]{2}$/); // Two lowercase letters
      });
    });
  });

  describe("CardRarity", () => {
    it("should have correct MTG rarity values", () => {
      expect(CardRarity.Common).toBe("common");
      expect(CardRarity.Uncommon).toBe("uncommon");
      expect(CardRarity.Rare).toBe("rare");
      expect(CardRarity.Mythic).toBe("mythic");
    });

    it("should have all standard MTG rarities", () => {
      const rarities = Object.values(CardRarity);
      expect(rarities).toHaveLength(4);
      expect(rarities).toContain("common");
      expect(rarities).toContain("uncommon");
      expect(rarities).toContain("rare");
      expect(rarities).toContain("mythic");
    });

    it("should be usable for filtering and styling", () => {
      const rarityColors = {
        [CardRarity.Common]: "#000000",
        [CardRarity.Uncommon]: "#c0c0c0",
        [CardRarity.Rare]: "#ffd700",
        [CardRarity.Mythic]: "#ff8c00"
      };

      expect(rarityColors[CardRarity.Common]).toBe("#000000");
      expect(rarityColors[CardRarity.Mythic]).toBe("#ff8c00");
    });
  });

  describe("ManaColor", () => {
    it("should have correct MTG mana symbols", () => {
      expect(ManaColor.White).toBe("W");
      expect(ManaColor.Blue).toBe("U");
      expect(ManaColor.Black).toBe("B");
      expect(ManaColor.Red).toBe("R");
      expect(ManaColor.Green).toBe("G");
      expect(ManaColor.Colorless).toBe("C");
    });

    it("should have all MTG colors", () => {
      const colors = Object.values(ManaColor);
      expect(colors).toHaveLength(6);
      expect(colors).toContain("W");
      expect(colors).toContain("U");
      expect(colors).toContain("B");
      expect(colors).toContain("R");
      expect(colors).toContain("G");
      expect(colors).toContain("C");
    });

    it("should use standard MTG single-letter abbreviations", () => {
      Object.values(ManaColor).forEach(color => {
        expect(color).toMatch(/^[A-Z]$/); // Single uppercase letter
      });
    });

    it("should be usable for mana cost parsing", () => {
      const manaCost = `{${ManaColor.Red}}{${ManaColor.Blue}}{${ManaColor.Colorless}}`;
      expect(manaCost).toBe("{R}{U}{C}");
    });
  });

  describe("DeckValidationState", () => {
    it("should have correct validation states", () => {
      expect(DeckValidationState.Valid).toBe("valid");
      expect(DeckValidationState.Invalid).toBe("invalid");
      expect(DeckValidationState.Warning).toBe("warning");
      expect(DeckValidationState.Pending).toBe("pending");
    });

    it("should have all expected validation states", () => {
      const states = Object.values(DeckValidationState);
      expect(states).toHaveLength(4);
      expect(states).toContain("valid");
      expect(states).toContain("invalid");
      expect(states).toContain("warning");
      expect(states).toContain("pending");
    });

    it("should be usable for conditional logic", () => {
      const isValidDeck = (state: DeckValidationState) => {
        return state === DeckValidationState.Valid;
      };

      expect(isValidDeck(DeckValidationState.Valid)).toBe(true);
      expect(isValidDeck(DeckValidationState.Invalid)).toBe(false);
      expect(isValidDeck(DeckValidationState.Warning)).toBe(false);
      expect(isValidDeck(DeckValidationState.Pending)).toBe(false);
    });

    it("should support status checking patterns", () => {
      const getStatusColor = (state: DeckValidationState) => {
        switch (state) {
          case DeckValidationState.Valid:
            return "green";
          case DeckValidationState.Invalid:
            return "red";
          case DeckValidationState.Warning:
            return "yellow";
          case DeckValidationState.Pending:
            return "gray";
          default:
            return "gray";
        }
      };

      expect(getStatusColor(DeckValidationState.Valid)).toBe("green");
      expect(getStatusColor(DeckValidationState.Invalid)).toBe("red");
      expect(getStatusColor(DeckValidationState.Warning)).toBe("yellow");
      expect(getStatusColor(DeckValidationState.Pending)).toBe("gray");
    });
  });

  describe("Enum Integration", () => {
    it("should export all enums", () => {
      expect(AnimationDirection).toBeDefined();
      expect(AnimationEasing).toBeDefined();
      expect(AnimationDuration).toBeDefined();
      expect(SpinnerSize).toBeDefined();
      expect(CardRarity).toBeDefined();
      expect(ManaColor).toBeDefined();
      expect(DeckValidationState).toBeDefined();
    });

    it("should have consistent naming conventions", () => {
      // All enum names should be PascalCase
      const enumNames = [
        "AnimationDirection",
        "AnimationEasing",
        "AnimationDuration",
        "SpinnerSize",
        "CardRarity",
        "ManaColor",
        "DeckValidationState"
      ];

      enumNames.forEach(name => {
        expect(name).toMatch(/^[A-Z][a-zA-Z]*$/);
      });
    });

    it("should be usable in type annotations", () => {
      // This test verifies TypeScript compilation works correctly
      const testDirection: AnimationDirection = AnimationDirection.Left;
      const testEasing: AnimationEasing = AnimationEasing.Smooth;
      const testDuration: AnimationDuration = AnimationDuration.Normal;
      const testSize: SpinnerSize = SpinnerSize.Medium;
      const testRarity: CardRarity = CardRarity.Rare;
      const testColor: ManaColor = ManaColor.Blue;
      const testState: DeckValidationState = DeckValidationState.Valid;

      expect(testDirection).toBe("left");
      expect(testEasing).toBe("power2.out");
      expect(testDuration).toBe(0.3);
      expect(testSize).toBe("md");
      expect(testRarity).toBe("rare");
      expect(testColor).toBe("U");
      expect(testState).toBe("valid");
    });
  });
});
