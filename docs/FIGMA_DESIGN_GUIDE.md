# Figma Design Guide for Liq Finance Home Page

## Overview
This guide provides comprehensive instructions for creating a Figma design for the Liq Finance home page/dashboard, including component specifications, layout guidelines, and design system requirements.

## Design System Setup

### 1. **Color Palette**
Create color styles in Figma with these exact values:

#### Primary Colors (Ethiopian Flag Inspired)
- **Ethiopian Green**: #10b981 (Primary actions, success states)
- **Ethiopian Yellow**: #f59e0b (Warnings, highlights)
- **Ethiopian Red**: #ef4444 (Errors, expenses)
- **Ethiopian Blue**: #00b4d8 (Primary brand color)

#### Surface Colors
- **Background Level 0**: #0f0f0f (Main background)
- **Background Level 1**: #1a1a1a (Cards, primary surfaces)
- **Background Level 2**: #232323 (Modals, elevated elements)
- **Background Level 3**: #2d2d2d (Dropdowns, tooltips)

#### Accent Colors
- **Cyan**: #00b4d8 (TeleBirr, tech elements)
- **Emerald**: #10b981 (CBE, banking)
- **Rose**: #ef4444 (Debt, alerts)
- **Amber**: #f59e0b (Spending, tracking)
- **Purple**: #8b5cf6 (Investing, growth)
- **Blue**: #3b82f6 (Family, community)

#### Text Colors
- **Primary Text**: #ffffff (Main content)
- **Secondary Text**: #a1a1aa (Labels, descriptions)
- **Tertiary Text**: #71717a (Hints, disabled)
- **Muted Text**: #52525b (Secondary information)

### 2. **Typography**
Create text styles with these specifications:

#### Headings
- **H1 Hero**: 48px, 700 weight, 56px line height
- **H2 Primary**: 24px, 600 weight, 32px line height
- **H3 Secondary**: 18px, 600 weight, 24px line height

#### Body Text
- **Body Large**: 16px, 400 weight, 24px line height
- **Body Medium**: 14px, 500 weight, 20px line height
- **Body Small**: 12px, 400 weight, 16px line height

#### Numbers & Data
- **Numbers Large**: 48px, 700 weight (Balance displays)
- **Numbers Medium**: 32px, 700 weight (Card numbers)
- **Numbers Small**: 24px, 600 weight (Labels)

### 3. **Spacing System**
Create spacing tokens:
- **XS**: 4px (Small gaps)
- **SM**: 8px (Standard spacing)
- **MD**: 16px (Section spacing)
- **LG**: 24px (Major section breaks)
- **XL**: 32px (Page margins)
- **2XL**: 48px (Hero spacing)

### 4. **Border Radius**
- **Pill**: 9999px (Buttons, badges)
- **Small**: 8px (Cards, inputs)
- **Medium**: 12px (Primary cards)
- **Large**: 16px (Hero sections)
- **Rounded**: 24px (Main containers)

## Component Library

### 1. **Balance Card Component**
**Purpose**: Display primary financial metrics

**Structure**:
- Container: 100% width, 180px height
- Background: Gradient from #5855d6 to #7c3aed
- Content: Vertical stack with 24px padding

**Content Layout**:
1. **Header Row**: Institution name + action button
2. **Balance Display**: Large number with currency
3. **Progress Bar**: 8px height with rounded ends
4. **Quick Actions**: 2-3 action buttons

**States**:
- Default: Normal display
- Privacy Mode: Masked numbers (••••••)
- Loading: Skeleton animation

### 2. **Quick Actions Grid**
**Purpose**: Primary navigation and common tasks

**Layout**: 2x2 grid with 16px gap
**Card Size**: 160x160px minimum

**Action Cards**:
- **Transfer**: Bank icon, gradient background
- **Add Money**: Plus icon, green accent
- **Scan Receipt**: Camera icon, yellow accent
- **Voice Input**: Microphone icon, blue accent

**Interaction States**:
- Default: Normal opacity
- Hover: Scale 1.05, shadow increase
- Active: Scale 0.95, haptic feedback

### 3. **Transaction List Item**
**Purpose**: Display recent transactions

**Layout**: Horizontal layout with 16px padding
**Height**: 72px minimum

**Components**:
- **Icon**: 40x40px circular background
- **Content**: Vertical stack (title, description)
- **Amount**: Right-aligned, color-coded
- **Status**: Badge or indicator

**States**:
- Income: Green amount text
- Expense: Red amount text
- Pending: Gray amount text
- Failed: Red border, error icon

### 4. **Goal Progress Card**
**Purpose**: Display savings goal progress

**Layout**: Horizontal card, 180px height
**Background**: Gradient based on goal type

**Content**:
- **Header**: Goal name + progress percentage
- **Progress Bar**: 12px height, full width
- **Amounts**: Current vs target with currency
- **Action**: Contribution button

**Visual Indicators**:
- On Track: Green progress bar
- Behind: Yellow progress bar
- Critical: Red progress bar

### 5. **Bill Reminder Card**
**Purpose**: Upcoming bill notifications

**Layout**: Horizontal card with left accent border
**Height**: 80px minimum

**Components**:
- **Icon**: Bill type icon (utilities, subscription)
- **Content**: Bill name + due date
- **Amount**: Large, prominent display
- **Actions**: Pay now, snooze, settings

**Priority Indicators**:
- High Priority: Red accent border
- Medium: Yellow accent border
- Low: Blue accent border

## Layout Specifications

### 1. **Mobile First Design**
**Breakpoints**:
- **Mobile**: 0-640px (Primary focus)
- **Tablet**: 641-1024px
- **Desktop**: 1025px+ (Enhanced features)

**Mobile Layout**:
- **Header**: 64px height with app bar
- **Content**: Scrollable vertical stack
- **Footer**: 72px height with navigation
- **Safe Areas**: Account for notches and rounded corners

### 2. **Grid System**
**Mobile**: Single column with 16px side margins
**Tablet**: 12-column grid with 24px gutters
**Desktop**: 16-column grid with 32px gutters

**Card Spacing**:
- Between cards: 16px
- Section breaks: 24px
- Page margins: 16px (mobile), 24px (desktop)

### 3. **Navigation Patterns**
**Bottom Navigation**:
- **Height**: 72px with safe area padding
- **Items**: 5 primary navigation items
- **Active State**: Brand color + indicator
- **Labels**: Always visible, 12px font

**Floating Action Button**:
- **Size**: 56px diameter
- **Position**: Bottom center, 24px from edge
- **Shadow**: Medium elevation shadow
- **Animation**: Scale in/out on scroll

## Interaction Design

### 1. **Microinteractions**
**Button Presses**:
- **Scale**: 0.95 on press
- **Duration**: 150ms ease-out
- **Haptic**: Light feedback on tap

**Card Hover**:
- **Scale**: 1.02 on hover
- **Shadow**: Increase elevation
- **Duration**: 200ms ease-out

**Loading States**:
- **Skeleton**: 1.5s pulse animation
- **Progress**: Smooth bar animations
- **Spinners**: 1s rotation cycle

### 2. **Transitions**
**Page Transitions**:
- **Slide**: 300ms ease-in-out
- **Fade**: 200ms ease-in-out
- **Scale**: 250ms ease-out

**Modal Transitions**:
- **Background**: Fade 200ms
- **Content**: Scale 300ms ease-out
- **Backdrop**: 50% opacity overlay

### 3. **Gestures**
**Swipe Actions**:
- **Delete**: Swipe left on list items
- **Archive**: Swipe right on notifications
- **Quick Actions**: Swipe up on cards

**Pull to Refresh**:
- **Threshold**: 80px pull distance
- **Animation**: Smooth spring physics
- **Feedback**: Visual progress indicator

## Accessibility Guidelines

### 1. **Color & Contrast**
- **Minimum Contrast**: 4.5:1 for text
- **Large Text**: 3:1 minimum contrast
- **UI Elements**: 3:1 minimum contrast
- **Focus Indicators**: 2px outline, brand color

### 2. **Typography**
- **Minimum Font Size**: 14px for body text
- **Line Height**: 1.5x font size minimum
- **Letter Spacing**: 0.02em for readability
- **Font Weight**: 400 minimum for body text

### 3. **Interactive Elements**
- **Minimum Tap Target**: 44x44px
- **Focus Order**: Logical tab sequence
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels

## Prototyping Guidelines

### 1. **Interactive States**
Create component states for:
- Default, Hover, Active, Disabled
- Loading, Success, Error
- Focus, Selected, Expanded

### 2. **User Flows**
Prototype key flows:
- **Add Transaction**: Form completion
- **View Account**: Account details
- **Set Budget**: Budget creation
- **Track Goal**: Goal contribution

### 3. **Responsive Behavior**
Test interactions across:
- **Mobile**: Touch interactions
- **Tablet**: Touch + hover states
- **Desktop**: Mouse + keyboard

## Export Specifications

### 1. **Assets**
- **Icons**: SVG format, 24px baseline
- **Images**: WebP format, optimized
- **Logos**: SVG with transparent background
- **Illustrations**: SVG or optimized PNG

### 2. **Code Export**
- **CSS Variables**: Export design tokens
- **Component Code**: React component structure
- **Animation Code**: CSS/JS animation snippets
- **Responsive Code**: Media query breakpoints

### 3. **Documentation**
- **Component Specs**: Dimensions, colors, spacing
- **Interaction Specs**: Animation timing, easing
- **Accessibility Specs**: Contrast ratios, tap targets
- **Integration Specs**: API endpoints, data structures

This Figma design guide ensures consistency, usability, and technical feasibility while maintaining the Ethiopian cultural context and modern design standards.