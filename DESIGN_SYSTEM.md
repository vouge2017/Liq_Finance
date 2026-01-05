# Liq Finance Design System

A comprehensive design system for an Ethiopian-market financial app with accessibility and cultural authenticity.

## Typography Scale

### Hierarchy
- **Hero**: 48px / 56px line height (bold) - Main numbers, key information
- **Primary Heading**: 24px / 32px line height (semibold) - Screen titles
- **Secondary Heading**: 18px / 24px line height (semibold) - Card titles
- **Body**: 16px / 24px line height (regular) - Main content (never below 16px for Amharic clarity)
- **Label**: 14px / 20px line height (medium) - Form labels, metadata
- **Caption**: 12px / 16px line height (regular) - Helper text, timestamps

### Mobile Responsive
- Hero scales to 42px/48px on mobile
- Heading scales to 22px/28px on mobile

## Button System

### Sizes
- **Default (Primary)**: 56px height (h-14) - Main CTAs
- **Secondary**: 48px height (h-button-secondary) - Alternative actions
- **Tertiary**: 40px height (h-button-tertiary) - Less important actions
- **Small**: 40px height (h-10) - Inline actions
- **Icon Sizes**: 56px (h-14), 40px (h-10), 64px (h-16)

### Touch Targets
- All interactive elements: minimum 44x44px (touch-min)
- Recommended: 56px for primary actions

### Variants
- **Default**: Solid background (primary color)
- **Secondary**: Outlined with border
- **Ghost**: Transparent with hover state
- **Destructive**: Red background for dangerous actions
- **Link**: Text-only for secondary navigation

## Color System (Ethiopian Semantics)

### Primary Actions (Ethiopian Blue)
- Base: `#00b4d8`
- Hover: `#0096c7`
- Background: `rgba(0, 180, 216, 0.1)`

### Success/Income (Ethiopian Green)
- Base: `#10b981`
- Hover: `#059669`
- Background: `rgba(16, 185, 129, 0.1)`

### Warning/Deficit (Ethiopian Yellow)
- Base: `#f59e0b`
- Hover: `#d97706`
- Background: `rgba(245, 158, 11, 0.1)`

### Danger/Expense (Ethiopian Red)
- Base: `#ef4444`
- Hover: `#dc2626`
- Background: `rgba(239, 68, 68, 0.1)`

### Neutral/Surface Colors

#### Dark Mode (Default)
- Background (Level 0): `#0f0f0f`
- Card (Level 1): `#1a1a1a`
- Elevated (Level 2): `#232323`
- Dropdown (Level 3): `#2d2d2d`
- Border: `#2a2a2a`
- Text Primary: `#ffffff`
- Text Secondary: `#9ca3af`

#### Light Mode
- Background: `#f9fafb`
- Card: `#ffffff`
- Elevated: `#f3f4f6`
- Dropdown: `#ffffff`
- Text Primary: `#111827`
- Text Secondary: `#6b7280`
- Border: `#e5e7eb`

## Spacing (8px Base Scale)

| Size | Value | Use Case |
|------|-------|----------|
| xs   | 4px   | Tight elements, small gaps |
| sm   | 8px   | Related items, icon spacing |
| md   | 16px  | Card padding, element gaps |
| lg   | 24px  | Section gaps, large elements |
| xl   | 32px  | Major sections |
| 2xl  | 48px  | Screen padding |

### Screen Layout
- Top padding: 16px
- Bottom padding: 88px (accounts for bottom nav)
- Horizontal padding: 20px

### Card Internal Spacing
- Padding: 20px
- Element gap: 12px
- Header gap: 16px

## Border Radius (16px Consistency)

- **xs**: 4px - Small inputs, badges
- **sm**: 8px - Medium elements
- **md**: 12px - Buttons, inputs
- **lg/xl/2xl**: 16px - **Standard for cards, containers**
- **3xl**: 20px - Large containers, hero cards
- **full**: 9999px - Circular elements

> All cards must use rounded-2xl (16px) or rounded-3xl (20px) minimum.

## Shadow System (Elevation)

### Elevation Shadows
- **Level 1**: `0 1px 2px rgba(0, 0, 0, 0.05)` - Subtle depth
- **Level 2**: `0 2px 4px rgba(0, 0, 0, 0.1)` - Small elevation
- **Level 3**: `0 4px 8px rgba(0, 0, 0, 0.15)` - Medium elevation
- **Level 4**: `0 8px 16px rgba(0, 0, 0, 0.2)` - Large elevation
- **Level 5**: `0 12px 24px rgba(0, 0, 0, 0.25)` - Maximum elevation

### Glow Effects
- **Primary**: `0 0 15px rgba(6, 182, 212, 0.5)`
- **Success**: `0 0 15px rgba(16, 185, 129, 0.5)`

## Card System

### Card Base (Rounded-2xl)
- Padding: 20px (via CSS variable)
- Border: 1px solid (border-color variable)
- Border Radius: 16px (rounded-2xl)
- Transition: all 0.3s ease

### Card Variants

#### Standard Card
- Background: Card surface level
- Shadow: elevation-2
- Hover: elevation-3 + translate up 2px

#### Hero Card
- Background: Gradient (primary/success/warning/danger)
- Shadow: elevation-4
- Overlay: 20% black gradient from top
- Text: White with drop shadow

#### Elevated Card (Iqub/Iddir)
- Cultural gradient backgrounds
- Enhanced shadows for prominence
- Special hover states

## Hero Elements

### Purpose
Every screen must have ONE hero element to guide the eye and create visual hierarchy.

### Components
- Large bold number (48px) showing key metric
- Supporting text (16px) providing context
- Gradient background with cultural color
- Shadow elevation for depth

### Examples
- Dashboard: Total balance hero
- Budget: Spending breakdown hero
- Goals: Progress hero card
- Transactions: Category totals hero

## Animations & Micro-interactions

### Timing
- Quick interactions: 100-200ms
- Standard transitions: 200-300ms
- Entrance animations: 300-400ms
- Slow background: 2-4 seconds

### Button Interactions
- Hover: +1px translateY + shadow increase
- Active: scale(0.96) + shadow decrease
- Duration: 100ms ease-out

### Card Interactions
- Hover: -2px translateY + shadow increase
- Duration: 200ms ease-out

### Animations
- Count-up numbers: 0.3s ease
- Slide-up entrance: 0.35s cubic-bezier(0.16, 1, 0.3, 1)
- Fade-in: 0.2s ease-out
- Button press: 100ms ease-out scale(0.96)

### 60fps Target
- All animations use GPU-accelerated properties
- Use transform/opacity only
- Avoid animating layout properties

## Loading States

### Skeleton Screens
- Gradient pulse animation (1.5s loop)
- Match content layout exactly
- Use elevation-1 shadow

### Pulse Loading
- Opacity animation 0.5-1.0 (2s loop)
- For small components only

### Loading Indicators
- Center-aligned spinner
- Show after 200ms delay to prevent flashing

## Empty States

### Components Required
- Illustrative icon or emoji
- Clear headline ("No transactions yet")
- Descriptive message (16px text)
- Call-to-action button (56px height)
- Optional: Contextual suggestions

### Styling
- Centered layout with gap-6
- Text-balance for readability
- Neutral colors with accent highlights

## Offline Experience

### Visual Indicators
- Offline banner at top (sticky)
- Reduced opacity or grayscale for unavailable actions
- "Offline" label on affected content
- Sync status indicator

## Accessibility

### Touch Targets
- Minimum 44x44px (preferably 56px)
- Adequate spacing to prevent misclicks
- High contrast text (WCAG AA minimum)

### Keyboard Navigation
- All interactive elements focusable
- Focus outline: 2px solid cyan
- Focus visible on all form inputs

### Amharic Typography
- Font: Noto Sans Ethiopic
- Minimum 16px size for readability
- Proper line-height (1.6) for Fidel characters
- Color contrast verified

## Component Examples

### Primary Button
```tsx
<Button size="lg" className="w-full">
  Send Money
</Button>
```
→ 56px height, full width, primary colors

### Hero Card
```tsx
<HeroCard variant="primary">
  <HeroText>10,500 ETB</HeroText>
  <HeroSubtext>Your Balance</HeroSubtext>
</HeroCard>
```
→ Cyan gradient, white text, shadow elevation-4

### Standard Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Recent Transactions</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```
→ 16px border radius, elevation-2, 20px padding

## Cultural Elements

### Ethiopian Colors
- Green: Growth and landscape
- Yellow: Sunshine and optimism
- Red: Strength and heritage
- Blue: Hope and sky

### Typography
- Noto Sans Ethiopic for Amharic
- Proper character spacing for Fidel
- Minimum 16px for readability

### Icons
- Custom Ethiopian-designed icons
- Cultural symbols where appropriate
- Consistent 24px or larger

### Spending Categories
- Coffee (ቡና) - Ethiopian coffee ceremony
- Food (ምግብ)
- Transport (ትራንስፖርት)
- Savings/Iqub (ኢቁብ)
- Iddir (እድር) - Community mutual aid

## Implementation Checklist

- [ ] All buttons use h-14 (56px) minimum for primary actions
- [ ] All cards use rounded-2xl (16px) or rounded-3xl (20px)
- [ ] All spacing uses 8px scale multiples
- [ ] All shadows use elevation system
- [ ] All interactive elements 44x44px+ touch targets
- [ ] All hero elements present and prominent
- [ ] All animations 60fps with GPU acceleration
- [ ] All loading states use skeleton/pulse patterns
- [ ] All empty states have CTA + illustration
- [ ] All text readable at arm's length on mobile
- [ ] Amharic text verified for rendering
- [ ] Offline indicators visible and functional
- [ ] Dark mode tested and polished
- [ ] Light mode tested and polished
