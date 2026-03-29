# Design Guidelines

**Project:** Crypto Opportunities Database
**Design System:** Notion-like, data-dense, professional
**Last Updated:** 2026-03-29

---

## Design Philosophy

- **Data-first:** Optimize for information density without sacrificing readability
- **Notion-like:** Familiar UX for crypto builders (spreadsheet meets database)
- **Professional but modern:** Not corporate; respects crypto audience
- **Type badges as primary differentiator:** Color-coded for instant recognition
- **Functional minimalism:** Every element serves a purpose

---

## Colour Palette

### Opportunity Type Badges (Primary Visual System)

The type badge is the **single most important visual element** — it must be instantly recognizable.

#### Light Mode

| Type | Hex | Bg Class | Text Class | Label |
|------|-----|----------|-----------|-------|
| **Hackathon** | Blue | `bg-blue-100` | `text-blue-800` | Hackathon |
| **Grant** | Green | `bg-green-100` | `text-green-800` | Grant |
| **Fellowship** | Purple | `bg-purple-100` | `text-purple-800` | Fellowship |
| **Bounty** | Orange | `bg-orange-100` | `text-orange-800` | Bounty |

#### Dark Mode

| Type | Bg Class | Text Class |
|------|----------|-----------|
| **Hackathon** | `bg-blue-900` | `text-blue-200` |
| **Grant** | `bg-green-900` | `text-green-200` |
| **Fellowship** | `bg-purple-900` | `text-purple-200` |
| **Bounty** | `bg-orange-900` | `text-orange-200` |

**Implementation:**
```typescript
// src/lib/type-colors.ts
export function getTypeColor(type: OpportunityType): string {
  const colors = {
    hackathon: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    grant: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    fellowship: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    bounty: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };
  return colors[type];
}
```

### Status Badges (Secondary Visual System)

Use neutral/muted tones — status is secondary to type:

| Status | Color | Purpose |
|--------|-------|---------|
| **Active** (in_progress, applying) | Blue-200/600 | Ongoing work |
| **Success** (accepted, completed) | Green-200/600 | Positive outcome |
| **Neutral** (discovered, evaluating, submitted) | Gray-200/600 | Information |
| **Negative** (rejected, cancelled) | Red-200/600 | Failure or stop |

### General Palette

Follow shadcn/ui defaults (Slate-based):
- **Background:** `bg-white` (light), `bg-slate-950` (dark)
- **Text:** `text-slate-900` (light), `text-slate-50` (dark)
- **Borders:** `border-slate-200` (light), `border-slate-800` (dark)
- **Hover:** `hover:bg-slate-100` (light), `hover:bg-slate-900` (dark)

---

## Typography

### Font Stack
Use shadcn/ui defaults (Inter or system font stack):
```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Type Sizes & Weights

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| **Page title** | 2xl (24px) | bold (700) | `/hack`, `/calendar` |
| **Section heading** | lg (18px) | semibold (600) | Column groups, panels |
| **Opportunity name** | base (16px) | medium (500) | Primary identifier in table |
| **Table cells** | sm (14px) | normal (400) | Data density |
| **Column headers** | xs (12px) | semibold (600) | Uppercase, tracking-wider |
| **Badge label** | xs (12px) | medium (500) | Type & status badges |
| **Helper text** | xs (12px) | normal (400) | Form hints, descriptions |

### Line Height
- **Body text:** 1.5 (loose for readability)
- **Table cells:** 1.4 (compact)
- **Headings:** 1.2 (tight)

---

## Spacing & Layout

### Spacing System (Tailwind)
```
2px (0.5)   - hairline borders
4px (1)     - micro spacing
8px (2)     - compact spacing
12px (3)    - small spacing
16px (4)    - base spacing (most common)
24px (6)    - medium spacing
32px (8)    - large spacing
48px (12)   - section spacing
```

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| **Mobile** | <768px | Single column, card view, hamburger nav |
| **Tablet** | 768-1024px | 2-3 columns, reduced table cols, horizontal scroll |
| **Desktop** | >1024px | Full table, sticky first column, side panels |

### Desktop Layout
```
┌─────────────────────────────────────────────┐
│  Header (Navigation, breadcrumbs)           │
├─────────────────────────────────────────────┤
│  Filters (Type, Status, Org, Search)        │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │      Main Content Area              │   │
│  │   (Table, Calendar, Charts)         │   │
│  │                                     │   │
│  │  Generous padding: 24px sides,      │   │
│  │  12px columns (table cells tight)   │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  Pagination (if needed)                     │
└─────────────────────────────────────────────┘
```

### Mobile Layout
```
┌──────────────────────────┐
│  Header (logo, menu)     │
├──────────────────────────┤
│  Filters (type toggle)   │
├──────────────────────────┤
│  Card 1 (opportunity)    │
│  Card 2 (opportunity)    │
│  Card 3 (opportunity)    │
│  ...                     │
└──────────────────────────┘
```

---

## Component Patterns

### Buttons

| Type | Style | Usage |
|------|-------|-------|
| **Primary** | `bg-blue-600 text-white` | Main action (Create, Submit) |
| **Secondary** | `bg-slate-100 text-slate-900` | Alternative action (Cancel, Edit) |
| **Danger** | `bg-red-600 text-white` | Destructive action (Delete) |
| **Ghost** | `text-slate-900 hover:bg-slate-100` | Tertiary action (More options) |

### Input Fields
- **Border:** `border-slate-200 dark:border-slate-800`
- **Focus:** `focus:ring-2 focus:ring-blue-500`
- **Placeholder:** `placeholder-slate-400`
- **Disabled:** `bg-slate-50 text-slate-400 cursor-not-allowed`

### Tables
- **Cell padding:** `px-4 py-2` (base cells), `px-3 py-1.5` (dense)
- **Border:** `border-b border-slate-200`
- **Hover:** `hover:bg-slate-50 dark:hover:bg-slate-900`
- **Sticky header:** `sticky top-0 bg-white dark:bg-slate-950`

### Dialogs
- **Background overlay:** `bg-black/50 dark:bg-black/80`
- **Modal max-width:** `max-w-lg` (500px) for forms, `max-w-xl` (600px) for details
- **Close button:** Top-right, icon-only

### Badges
- **Padding:** `px-2.5 py-0.5` (compact)
- **Border radius:** `rounded-full` (pill shape)
- **Font size:** `text-xs`

---

## Interaction Design

### Hovering
```
Table row:         hover:bg-slate-50
Button:            hover:opacity-90, shadow on hover
Link:              underline on hover
Badge:             cursor-pointer, opacity-80 on hover
```

### Focus States
```
All interactive elements MUST have visible focus (Tailwind ring):
input:focus        → focus:ring-2 focus:ring-blue-500
button:focus       → focus:outline-none focus:ring-2 focus:ring-blue-500
link:focus         → focus:outline-none focus:ring-2 focus:ring-blue-500
```

### Loading States
```
Skeleton:          bg-slate-200 dark:bg-slate-800, animated pulse
Button:            disabled state, spinner icon, "Loading..." text
Table:             Skeleton rows instead of empty state
```

### Empty States
```
No opportunities:
  ├─ Icon (briefcase or similar)
  ├─ Heading "No opportunities found"
  ├─ Subtext "Create one to get started"
  └─ Primary button "Create opportunity"
```

### Error States
```
Field error:       text-red-600, help text below input
Toast error:       bg-red-100 dark:bg-red-900, text-red-800, 5s timeout
API error:         Toast + retry button
```

---

## Accessibility Standards

### WCAG 2.1 Level AA Target

| Criterion | Implementation |
|-----------|-----------------|
| **Color contrast** | 4.5:1 for text, 3:1 for graphics |
| **Keyboard navigation** | All interactive elements keyboard-accessible |
| **Focus indicators** | Visible (outline or ring) |
| **Alt text** | Provided for all images |
| **Semantic HTML** | `<button>`, `<input>`, `<label>` used correctly |
| **ARIA labels** | `aria-label` for icon buttons |
| **Form labels** | Associated `<label>` tags |

### Dark Mode Support
- All colors must pass contrast in both light and dark modes
- Use `dark:` Tailwind prefix for dark mode specifics
- Test with `prefers-color-scheme: dark` in browser DevTools

---

## Icon Usage

### Icon Library
- **Source:** Lucide React (lightweight, crypto-friendly icons)
- **Size:** 16px (xs), 20px (sm), 24px (base)
- **Color:** Inherit from parent text color by default

### Common Icons
| Use Case | Icon |
|----------|------|
| Search | Search |
| Filter | Filter |
| Type/Category | List, Grid, Layers |
| Calendar | Calendar |
| Chart | BarChart3, LineChart |
| External link | ExternalLink |
| Edit | Edit, Pencil |
| Delete | Trash2, X |
| More options | MoreHorizontal, MoreVertical |
| Close | X, ChevronUp |
| Arrow | ChevronDown, ChevronRight |

### Icon Pairs
- Always pair icons with text (unless obvious context)
- Icon on left for buttons: `<Icon /> Text`
- Icon on right for external links: `Text <ExternalLink />`

---

## Chart Design

### Chart Colors
Use **opportunity type colors** as chart data colors:
```typescript
const chartColors = {
  hackathon: '#2563eb',    // blue-600
  grant: '#16a34a',        // green-600
  fellowship: '#9333ea',   // purple-600
  bounty: '#ea580c',       // orange-600
};
```

### Chart Style
- **Background:** Transparent
- **Grid:** Light gray (slate-200), hidden in dark mode
- **Text:** Slate-900 (light), slate-50 (dark)
- **Tooltip:** Dark overlay with white text

### Chart Types Supported
1. **Area Chart** — Trends over time (reward amounts)
2. **Bar Chart** — Distribution (opportunities per type)
3. **Line Chart** — Progress (status changes over time)
4. **Funnel Chart** — Pipeline (discovered → accepted → completed)

---

## Mobile Design Considerations

### Viewport
- **Min width:** 375px (iPhone SE)
- **Max width:** 768px (tablet boundary)
- **Safe area:** 16px padding on sides

### Touch Targets
- **Minimum:** 44px × 44px (iOS standard)
- **Buttons:** `py-2 px-4` minimum
- **Icon buttons:** `p-2` minimum

### Mobile Card Layout
```
Card (w-full, rounded-lg, shadow-sm):
  ├─ Type badge (top-left)
  ├─ Opportunity name (bold)
  ├─ Organization (gray text)
  ├─ Reward amount (green text)
  ├─ Status badge (bottom)
  └─ Tap to expand (slide-out panel)
```

### Mobile Gestures
- **Swipe left:** Reveal delete/edit buttons (optional, v1.1)
- **Tap:** Open detail panel
- **Long-press:** Open context menu (optional, v1.1)

---

## Dark Mode

### Implementation
```typescript
// Use Tailwind dark mode (class strategy)
<html className={isDark ? 'dark' : ''}>

// Apply dark: prefix in CSS
<div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
```

### Dark Mode Palette
| Element | Light | Dark |
|---------|-------|------|
| Background | `bg-white` | `bg-slate-950` |
| Text | `text-slate-900` | `text-slate-50` |
| Border | `border-slate-200` | `border-slate-800` |
| Hover bg | `hover:bg-slate-50` | `hover:bg-slate-900` |
| Input | `bg-white border-slate-200` | `bg-slate-900 border-slate-800` |

### Dark Mode Testing
- Test all type badges in dark mode
- Ensure status badges readable in dark
- Check charts have sufficient contrast
- Test links/focus indicators in dark

---

## Animation & Motion

### Transition Defaults
```css
transition: all 150ms ease-in-out;  /* Standard */
transition: all 300ms ease-in-out;  /* Slower for complex animations */
```

### Specific Animations
| Element | Animation | Duration |
|---------|-----------|----------|
| Button press | scale 98%, 100ms | 100ms |
| Modal open | fade + scale-up | 200ms |
| Row expand | height transition | 200ms |
| Page load | fade-in | 150ms |
| Loading spinner | continuous rotate | 1s |

### Framer Motion (Card Stack Example)
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3, ease: 'easeInOut' }}
>
  {/* Card content */}
</motion.div>
```

---

## Figma Reference

**Design File:** https://www.figma.com/design/6XUmigbtgLSSnTrKVsh6JY/weminal?node-id=250-1070

Components in Figma:
- TypeBadge (all 4 types)
- StatusBadge (all 9 statuses)
- Button (primary, secondary, danger, ghost)
- Input (text, email, number)
- Table (header, row, cell)
- Dialog (form, confirm)
- Card (opportunity, calendar block)
- Empty state
- Loading skeleton

---

## Design System Checklist

Before shipping any UI:

- [ ] All type badges use correct colors (blue/green/purple/orange)
- [ ] Status badges use neutral colors (not type colors)
- [ ] All buttons have hover states
- [ ] All interactive elements have focus rings
- [ ] Dark mode styles applied and tested
- [ ] Mobile layout responsive (375px+)
- [ ] Touch targets 44px minimum
- [ ] Color contrast 4.5:1 for text (WCAG AA)
- [ ] Semantic HTML used (`<button>`, `<label>`, etc)
- [ ] Icons paired with text (or have aria-label)
- [ ] Empty states designed
- [ ] Error states designed
- [ ] Loading states designed
- [ ] Animations under 300ms
- [ ] No animations that flash (accessibility)

---

## Design Evolution

### v1 (Current)
- Notion-like table aesthetic
- 4 opportunity type colors
- Basic animations (opacity, slides)
- Dark mode support

### v1.1 (Upcoming)
- Enhanced interactions (keyboard nav)
- Improved mobile UX
- Refined animations (Framer Motion)
- Accessibility audit + fixes

### v2 (Planned)
- User auth flows (login, signup)
- Team/workspace UI
- Permission-based UI changes
- Settings/preferences panel

### v3+ (Future)
- Custom branding (white-label)
- Organization theming
- Advanced analytics visualizations
- Mobile app native design
