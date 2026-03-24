# Design System

> Notion-like aesthetic. Clean, functional, data-dense.

## Direction & Tone

- **Clean and functional** — data-first, Notion-like feel
- **Professional but not corporate** — crypto/web3 audience expects modern, slightly edgy
- **Dense but readable** — table UI with lots of data, but well-organized with clear hierarchy
- **Type badges are the primary visual differentiator** — color-coded for instant recognition

## Colour Palette

### Type Badge Colors (Primary Visual System)

| Type | Background | Text | Dark Background | Dark Text |
|------|-----------|------|-----------------|-----------|
| hackathon | `bg-blue-100` | `text-blue-800` | `bg-blue-900` | `text-blue-200` |
| grant | `bg-green-100` | `text-green-800` | `bg-green-900` | `text-green-200` |
| fellowship | `bg-purple-100` | `text-purple-800` | `bg-purple-900` | `text-purple-200` |
| bounty | `bg-orange-100` | `text-orange-800` | `bg-orange-900` | `text-orange-200` |

### Status Badge Colors

Use neutral/muted tones — status is secondary to type:
- Active statuses (in_progress, applying): subtle blue
- Positive outcomes (accepted, completed): subtle green
- Negative outcomes (rejected, cancelled): subtle red
- Neutral (discovered, evaluating, submitted): subtle gray

### General Palette

Follow shadcn/ui defaults. Extend only for type badges.

## Typography

- Use shadcn/ui defaults (Inter or system font stack)
- Table cells: text-sm for density
- Column headers: text-xs uppercase tracking-wider
- Opportunity name: font-medium (the primary identifier)

## Spacing & Layout

- **Desktop (>1024px):** Full table with horizontal scroll, sticky first column
- **Tablet (768-1024px):** Reduced columns, horizontal scroll
- **Mobile (<768px):** Card layout with type badge, name, status, reward
- Generous padding in filter bar, tight spacing in table cells for density
- shadcn/ui spacing defaults

## Iconography

- shadcn/ui icons (Lucide)
- External link icon for website_url
- Sort arrows on column headers
- Filter icon in filter bar

## References

- **Figma:** https://www.figma.com/design/6XUmigbtgLSSnTrKVsh6JY/weminal?node-id=250-1070
- **Inspiration:** Notion database views, Linear issue tracker, Airtable
