# MTG Fonts Integration Guide

This guide covers the integration and usage of MTG-themed fonts in the Brawl Deck Builder application.

## 🎨 **Available Fonts**

### **Mana Font** - Icon Font for MTG Symbols
- **Purpose**: Mana symbols, set symbols, card type icons, and MTG-specific iconography
- **Usage**: `font-family: var(--font-mana)` or `.ms` class
- **Source**: [Mana Font by Andrew Gioia](https://mana.andrewgioia.com/)

### **Beleren Font** - MTG Title Font
- **Purpose**: Card titles, headers, and prominent text
- **Usage**: `font-family: var(--font-beleren)` or `.font-heading` class
- **Characteristics**: Bold, fantasy-style font used on MTG cards

### **MPlantin Font** - MTG Body Font  
- **Purpose**: Body text, descriptions, and flavor text
- **Usage**: `font-family: var(--font-mplantin)` or `.font-body` class
- **Characteristics**: Serif font used for MTG card text

## 🔧 **CSS Variables**

```css
:root {
  --font-mana: 'Mana', monospace;
  --font-beleren: 'Beleren', 'Cinzel', 'Trajan Pro', serif;
  --font-mplantin: 'MPlantin', 'Minion Pro', 'Adobe Garamond Pro', Georgia, serif;
  --font-system: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
```

## 🎯 **Utility Classes**

### **Font Family Classes**
- `.font-system` - System default font
- `.font-heading` - Beleren font for titles
- `.font-body` - MPlantin font for body text  
- `.font-mana` - Mana font for symbols

### **MTG-Specific Classes**
- `.card-title` - Styled card titles using Beleren
- `.flavor-text` - Italicized flavor text using MPlantin
- `.mana-symbol` - Base styling for mana symbols
- `.mana-cost` - Container for mana cost display

## ⚡ **Mana Symbol Usage**

### **Basic Mana Symbols**
```html
<i class="ms ms-w"></i>  <!-- White mana -->
<i class="ms ms-u"></i>  <!-- Blue mana -->
<i class="ms ms-b"></i>  <!-- Black mana -->
<i class="ms ms-r"></i>  <!-- Red mana -->
<i class="ms ms-g"></i>  <!-- Green mana -->
<i class="ms ms-c"></i>  <!-- Colorless mana -->
```

### **Numbered Mana Costs**
```html
<i class="ms ms-0"></i>  <!-- 0 mana -->
<i class="ms ms-1"></i>  <!-- 1 mana -->
<i class="ms ms-2"></i>  <!-- 2 mana -->
<i class="ms ms-x"></i>  <!-- X mana -->
```

### **Hybrid Mana**
```html
<i class="ms ms-wu"></i>  <!-- White/Blue -->
<i class="ms ms-ub"></i>  <!-- Blue/Black -->
<i class="ms ms-br"></i>  <!-- Black/Red -->
<i class="ms ms-rg"></i>  <!-- Red/Green -->
<i class="ms ms-gw"></i>  <!-- Green/White -->
```

### **Special Symbols**
```html
<i class="ms ms-tap"></i>        <!-- Tap symbol -->
<i class="ms ms-untap"></i>      <!-- Untap symbol -->
<i class="ms ms-loyalty-up"></i> <!-- Loyalty up -->
<i class="ms ms-loyalty-down"></i> <!-- Loyalty down -->
```

### **Card Types**
```html
<i class="ms ms-artifact"></i>    <!-- Artifact -->
<i class="ms ms-creature"></i>    <!-- Creature -->
<i class="ms ms-enchantment"></i> <!-- Enchantment -->
<i class="ms ms-instant"></i>     <!-- Instant -->
<i class="ms ms-land"></i>        <!-- Land -->
<i class="ms ms-planeswalker"></i> <!-- Planeswalker -->
<i class="ms ms-sorcery"></i>     <!-- Sorcery -->
```

## 🎨 **Mana Cost Display Example**

```html
<div class="mana-cost">
  <i class="ms ms-2"></i>
  <i class="ms ms-w"></i>
  <i class="ms ms-u"></i>
</div>
```

## 🎭 **Typography Examples**

### **Card Title**
```html
<h3 class="card-title">Lightning Bolt</h3>
```

### **Flavor Text**
```html
<p class="flavor-text">
  "The sparkmage shrieked, calling on the rage of the storms of his youth."
</p>
```

### **Mixed Typography**
```html
<div class="card">
  <h4 class="card-title">Counterspell</h4>
  <div class="mana-cost">
    <i class="ms ms-u"></i>
    <i class="ms ms-u"></i>
  </div>
  <p class="font-body">Counter target spell.</p>
  <p class="flavor-text">
    "I don't think so."
  </p>
</div>
```

## 🎨 **Color Theming**

The mana symbols include CSS custom properties for colors:
- `--ms-mana-w: #fffbd5` (White)
- `--ms-mana-u: #bcdaf7` (Blue)  
- `--ms-mana-b: #a7999e` (Black)
- `--ms-mana-r: #f19b79` (Red)
- `--ms-mana-g: #9fcba6` (Green)
- `--ms-mana-c: #d0c6bb` (Colorless)

## 📁 **File Structure**

```
public/assets/fonts/
├── mana.woff2, mana.woff, mana.ttf, mana.eot, mana.svg
├── beleren.otf, beleren.ttf, beleren.woff, beleren.eot, beleren.svg
└── mplantin.ttf, mplantin.woff, mplantin.eot, mplantin.svg

src/styles/
├── _fonts.scss              # Font declarations
├── vendor/mana/              # Complete mana font library
│   ├── _variables.scss       # Font configuration
│   ├── _core.scss           # Base .ms class
│   ├── _icons.scss          # All mana symbols
│   ├── _colors.scss         # Color styling
│   ├── _sizes.scss          # Size variants
│   ├── _cost.scss           # Mana cost styling
│   ├── _loyalty.scss        # Planeswalker loyalty
│   ├── _dfc.scss            # Double-faced cards
│   ├── _duo.scss            # Dual symbols
│   ├── _extras.scss         # Additional symbols
│   ├── _aliases.scss        # Alternative names
│   └── mana.scss            # Main entry point
```

## 🚀 **Performance Notes**

- Fonts use `font-display: swap` for optimal loading
- WOFF2 format prioritized for modern browsers
- Complete mana library adds ~62KB to CSS bundle
- All fonts are self-hosted for reliability

## 📚 **References**

- [Mana Font Documentation](https://mana.andrewgioia.com/)
- [Icon Reference](https://mana.andrewgioia.com/icons.html)
- [MTG Typography Guidelines](https://magic.wizards.com/en/articles/archive/making-magic/nuts-bolts-card-frames-2015-11-16)
