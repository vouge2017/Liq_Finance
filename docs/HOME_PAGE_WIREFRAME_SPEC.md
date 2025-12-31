# Home Page Wireframe Specification

## Overview
This document provides detailed wireframe specifications for the Liq Finance home page, including component placement, sizing, and interaction patterns.

## Mobile First Wireframe (375px width)

### Section 1: Header (64px height)
```
┌─────────────────────────────────────┐
│ [Back]  Hello, [Name]!     [Search] │
│ Good morning!               [Bell]  │
└─────────────────────────────────────┘
```

**Components**:
- **Back Button**: 44x44px, left-aligned
- **Greeting**: 24px font, center-aligned
- **Time Greeting**: 14px font, below name
- **Search**: 44x44px, right-aligned
- **Notifications**: 44x44px, right-aligned

### Section 2: Financial Overview (200px height)
```
┌─────────────────────────────────────┐
│  Safe to Spend                        │
│  1,250 ETB / DAY                      │
│  ┌─────────────────────────────────┐ │
│  │ 0 ETB / 500 ETB                 │ │
│  │ ████████░░░░░░░░░░░░░░░░░░░░░░  │ │
│  │ Try to spend under 500 ETB      │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Components**:
- **Section Title**: "Safe to Spend", 18px
- **Daily Limit**: "1,250 ETB / DAY", 32px bold
- **Progress Card**: 160px height, gradient background
- **Progress Bar**: 8px height, rounded ends
- **Hint Text**: 14px, actionable text

### Section 3: Quick Actions (120px height)
```
┌─────────────────────────────────────┐
│ ┌─────────────┐ ┌─────────────┐     │
│ │   Transfer  │ │  Add Money  │     │
│ │     🏦      │ │     ➕      │     │
│ │             │ │             │     │
│ └─────────────┘ └─────────────┘     │
│ ┌─────────────┐ ┌─────────────┐     │
│ │ Scan Receipt│ │ Voice Input │     │
│ │     📸      │ │     🎤      │     │
│ │             │ │             │     │
│ └─────────────┘ └─────────────┘     │
└─────────────────────────────────────┘
```

**Grid Layout**: 2x2 grid, 16px gap
**Card Size**: 160x140px each
**Icon Size**: 48px, centered
**Label**: 14px, below icon

### Section 4: Account Summary (180px height)
```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ CBE - Personal Account          │ │
│ │ 12,500.00 ETB                   │ │
│ │                                 │ │
│ │ ┌─────────────┐ ┌─────────────┐ │ │
│ │ │   Transfer  │ │  Add Money  │ │ │
│ │ └─────────────┘ └─────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Components**:
- **Account Name**: 18px, bold
- **Balance**: 28px, bold
- **Action Buttons**: 2 buttons, 44px height
- **Background**: Gradient based on institution

### Section 5: Recent Transactions (200px height)
```
┌─────────────────────────────────────┐
│ Recent Transactions                 │
│ ┌─────────────────────────────────┐ │
│ │ 🏪  Grocery Store    -250 ETB   │ │
│ │ 🏥  Pharmacy         -150 ETB   │ │
│ │ 💵  Salary          +8,500 ETB  │ │
│ │ 🏪  Restaurant       -300 ETB   │ │
│ │ ➕  Transfer In     +1,200 ETB  │ │
│ │ View All Transactions →         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Components**:
- **Section Header**: "Recent Transactions", 18px
- **Transaction Items**: 56px height each
- **Icon**: 24px, left-aligned
- **Amount**: Right-aligned, color-coded
- **View All**: Link at bottom

### Section 6: Goals Progress (160px height)
```
┌─────────────────────────────────────┐
│ Savings Goals                       │
│ ┌─────────────────────────────────┐ │
│ │ Emergency Fund                  │ │
│ │ ████████████░░░░░░░░░░░░ 60%    │ │
│ │ 6,000 / 10,000 ETB              │ │
│ │                                 │ │
│ │ ┌─────────────┐ ┌─────────────┐ │ │
│ │ │ Contribute  │ │   View      │ │ │
│ │ └─────────────┘ └─────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Components**:
- **Section Header**: "Savings Goals", 18px
- **Goal Name**: 16px, bold
- **Progress Bar**: 12px height, full width
- **Amounts**: 14px, current vs target
- **Action Buttons**: Contribute + View

### Section 7: Upcoming Bills (140px height)
```
┌─────────────────────────────────────┐
│ Upcoming Bills                      │
│ ┌─────────────────────────────────┐ │
│ │ ⚡  Electric Bill    Due: Dec 28 │ │
│ │    850 ETB                       │ │
│ │                                 │ │
│ │ 📺  Internet       Due: Jan 5   │ │
│ │    600 ETB                       │ │
│ │ View All Bills →                │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Components**:
- **Section Header**: "Upcoming Bills", 18px
- **Bill Items**: 56px height each
- **Due Date**: Right-aligned
- **Amount**: Below bill name
- **View All**: Link at bottom

### Section 8: Insights & Tips (120px height)
```
┌─────────────────────────────────────┐
│ 💡 Financial Tip                    │
│ You spent 15% more on food this     │
│ week. Try cooking at home to save   │
│ 300 ETB!                            │
│                                     │
│ [Get More Tips]                     │
└─────────────────────────────────────┘
```

**Components**:
- **Tip Icon**: 24px, left-aligned
- **Tip Text**: 14px, multi-line
- **Action Button**: Secondary style
- **Background**: Subtle gradient

### Section 9: Bottom Navigation (72px height)
```
┌─────────────────────────────────────┐
│ [🏠 Home] [📊 Budget] [➕ Add] [🎯 Goals] [👤 Profile] │
└─────────────────────────────────────┘
```

**Components**:
- **Navigation Items**: 5 items, equal width
- **Active State**: Brand color + indicator
- **Labels**: Always visible, 12px
- **FAB**: Center, 56px diameter

## Tablet Layout (768px width)

### Two-Column Layout
```
┌─────────────────────────────────────────┐
│ Header (same as mobile)                 │
├─────────────────┬───────────────────────┤
│ Financial       │ Quick Actions         │
│ Overview        │ (2x2 grid)            │
│ (40%)           │ (60%)                 │
├─────────────────┼───────────────────────┤
│ Account Summary │ Recent Transactions   │
│ (50%)           │ (50%)                 │
├─────────────────┼───────────────────────┤
│ Goals Progress  │ Upcoming Bills        │
│ (50%)           │ (50%)                 │
├─────────────────┼───────────────────────┤
│ Insights & Tips │ (Empty space)         │
│ (100%)          │                       │
└─────────────────┴───────────────────────┘
```

## Desktop Layout (1200px width)

### Three-Column Layout
```
┌─────────────────────────────────────────────────┐
│ Header                                          │
├─────────────┬─────────────────┬─────────────────┤
│             │ Financial       │ Account         │
│             │ Overview        │ Summary         │
│             │ (60%)           │ (40%)           │
│             ├─────────────────┼─────────────────┤
│             │ Quick Actions   │ Recent          │
│             │ (60%)           │ Transactions    │
│             │                 │ (40%)           │
│             ├─────────────────┼─────────────────┤
│ Navigation  │ Goals Progress  │ Upcoming Bills  │
│ (20%)       │ (60%)           │ (40%)           │
│             ├─────────────────┼─────────────────┤
│             │ Insights & Tips │ (Empty space)   │
│             │ (60%)           │                 │
└─────────────┴─────────────────┴─────────────────┘
```

## Component Specifications

### 1. **Card Components**
- **Border Radius**: 16px
- **Shadow**: 0 4px 20px rgba(0,0,0,0.15)
- **Padding**: 16px
- **Margin**: 16px between cards
- **Background**: Gradient or solid based on type

### 2. **Button Components**
- **Primary**: 44px height, 16px padding
- **Secondary**: 40px height, 12px padding
- **Icon Buttons**: 44x44px minimum
- **FAB**: 56px diameter, floating

### 3. **Typography Scale**
- **Headers**: 18-24px, 600-700 weight
- **Body**: 14-16px, 400-500 weight
- **Labels**: 12px, 500 weight
- **Numbers**: 24-32px, 700 weight

### 4. **Spacing System**
- **Card Padding**: 16px
- **Section Spacing**: 24px
- **Element Spacing**: 12px
- **Grid Gap**: 16px

## Interaction Patterns

### 1. **Scroll Behavior**
- **Parallax**: Header background movement
- **Sticky**: Navigation on desktop
- **Infinite Scroll**: Transaction list
- **Pull to Refresh**: Dashboard refresh

### 2. **Hover States** (Tablet/Desktop)
- **Cards**: Scale 1.02, shadow increase
- **Buttons**: Background color change
- **Links**: Underline animation
- **Icons**: Color change

### 3. **Tap States** (Mobile)
- **Cards**: Scale 0.98, haptic feedback
- **Buttons**: Background opacity change
- **List Items**: Background highlight
- **Icons**: Scale animation

## Responsive Breakpoints

### Mobile (0-640px)
- Single column layout
- Bottom navigation
- FAB center position
- Touch-friendly sizing

### Tablet (641-1024px)
- Two-column layout
- Side navigation option
- Larger touch targets
- Enhanced hover states

### Desktop (1025px+)
- Three-column layout
- Side navigation fixed
- Mouse interactions
- Keyboard shortcuts

This wireframe specification provides a comprehensive foundation for designing the Liq Finance home page with proper component placement, sizing, and interaction patterns across all device sizes.