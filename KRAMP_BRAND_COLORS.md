# Kramp Brand Colors - Correct Usage Guide

**Date**: January 22, 2026  
**Status**: ✅ Implemented Correctly

---

## 🎨 Official Kramp Brand Colors

### Primary Colors
- **Kramp Red**: `#9B1915`
- **White**: `#FFFFFF`
- **Grey Tones**: `#F5F5F5` (light), `#E0E0E0` (medium), `#666666` (dark), `#212121` (very dark)

### Accent Colors (Text Only)
- **Kramp Blue**: `#194461` - Can be used for TEXT, never for background blocks

---

## ✅ Correct Usage

### Colored Blocks/Cards/Buttons
**Use RED or GREY/WHITE - NEVER BLUE backgrounds**

#### ✅ Cards with Color
```tsx
// RED gradient cards (for emphasis)
<Card sx={{ background: 'linear-gradient(135deg, #9B1915 0%, #C42420 100%)', color: 'white' }}>
  Next Match
</Card>

<Card sx={{ background: 'linear-gradient(135deg, #9B1915 0%, #7A1411 100%)', color: 'white' }}>
  Prizes
</Card>

// GREY gradient cards (for secondary content)
<Card sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)' }}>
  Deadline Countdown (with red text)
</Card>

// WHITE cards (default)
<Card>
  Standard content card
</Card>
```

#### ✅ Buttons
```tsx
// Primary button - RED
<Button variant="contained" color="primary">Login</Button>
// Background: #9B1915

// Secondary button - GREY (not blue!)
<Button variant="contained" color="secondary">Cancel</Button>
// Background: #666666

// Outlined button
<Button variant="outlined" color="primary">View More</Button>
// Border: #9B1915, Text: #9B1915
```

#### ✅ Chips
```tsx
// Primary chip - RED
<Chip label="Active" color="primary" />
// Background: #9B1915

// Secondary chip - LIGHT GREY (not blue!)
<Chip label="Pending" color="secondary" />
// Background: #E0E0E0, Text: #212121
```

---

## ✅ Blue Color Usage (TEXT ONLY)

Blue (`#194461`) can ONLY be used for:

### ✅ Text Elements
```tsx
// Headings
<Typography variant="h3" sx={{ color: '#194461' }}>
  Section Title
</Typography>

// Icons (as accents)
<SomeIcon sx={{ color: '#194461' }} />

// Links (hover state)
<Link sx={{ '&:hover': { color: '#194461' } }}>
  Click here
</Link>
```

### ❌ NEVER for Backgrounds
```tsx
// ❌ WRONG - Blue background block
<Card sx={{ backgroundColor: '#194461' }}>...</Card>

// ❌ WRONG - Blue button
<Button sx={{ backgroundColor: '#194461' }}>...</Button>

// ❌ WRONG - Blue sidebar
<Drawer sx={{ backgroundColor: '#194461' }}>...</Drawer>
```

---

## 🎨 Current Implementation

### HomePage Cards
1. **Next Match Card** - Red gradient (`#9B1915` → `#C42420`)
2. **Deadline Countdown** - Grey gradient (`#F5F5F5` → `#E0E0E0`) with red text
3. **Prizes Card** - Dark red gradient (`#9B1915` → `#7A1411`)

### Navigation
- **AppBar** - White background (`#FFFFFF`) with red text (`#9B1915`)
- **Drawer/Sidebar** - White background (`#FFFFFF`) with grey icons
- **Selected Menu Item** - Light red tint (`#F5E5E4`)

### Buttons
- **Primary** - Red background (`#9B1915`)
- **Secondary** - Grey background (`#666666`)
- **Hover states** - Lighter/darker shades of the same color

### Typography
- **H1/H2** - Kramp Red (`#9B1915`)
- **H3** - Kramp Blue (`#194461`) - TEXT ONLY ✅
- **Body Text** - Dark Grey (`#212121`)
- **Secondary Text** - Medium Grey (`#666666`)

---

## 📋 Color Palette Summary

| Element Type | Primary Color | Secondary Color | Hover State |
|--------------|---------------|-----------------|-------------|
| Cards (emphasis) | Red `#9B1915` | White `#FFFFFF` | - |
| Cards (secondary) | Light Grey `#F5F5F5` | White `#FFFFFF` | - |
| Buttons (primary) | Red `#9B1915` | - | Light Red `#C42420` |
| Buttons (secondary) | Grey `#666666` | - | Grey `#808080` |
| Chips (primary) | Red `#9B1915` | - | - |
| Chips (secondary) | Light Grey `#E0E0E0` | - | - |
| Headings (H1/H2) | Red `#9B1915` | - | - |
| Headings (H3) | Blue `#194461` | - | - |
| Body Text | Dark Grey `#212121` | - | - |
| Links | Red `#9B1915` | Blue `#194461` (hover) | - |
| Backgrounds | White `#FFFFFF` | Light Grey `#F5F5F5` | - |

---

## ✅ Implementation Checklist

- [x] Primary color set to Kramp Red (`#9B1915`)
- [x] Secondary color set to Grey (`#666666` for buttons)
- [x] Blue removed from all background elements
- [x] Blue only used for text (H3 headings)
- [x] Cards use red or grey gradients
- [x] Buttons use red (primary) or grey (secondary)
- [x] Chips use red or light grey backgrounds
- [x] Drawer/sidebar uses white background (not blue)
- [x] AppBar uses white background with red text

---

## 🚫 Common Mistakes to Avoid

1. ❌ Using blue (`#194461`) for card backgrounds
2. ❌ Using blue for button backgrounds
3. ❌ Using blue for sidebar/drawer backgrounds
4. ❌ Using blue for chip backgrounds
5. ❌ Using blue for any block-level coloring

**Remember**: Blue is for TEXT ONLY (headings, icons, links) - never for blocks! 🎯

---

## 📁 Files Modified

- `client/src/utils/theme.ts` - Theme color definitions
- `client/src/pages/HomePage.tsx` - Card gradients
- `client/src/components/layout/Layout.tsx` - Sidebar styling

---

## ✅ Verification

To verify correct colors in browser:
1. Open DevTools (F12)
2. Inspect any card/button/block element
3. Check `background-color` property
4. Should be: Red (`#9B1915`), Grey (`#666666`, `#E0E0E0`, `#F5F5F5`), or White (`#FFFFFF`)
5. Should NEVER be: Blue (`#194461`)

**Blue should only appear in `color` property (text), never in `background-color`!**
