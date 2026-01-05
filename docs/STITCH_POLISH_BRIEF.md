# Stitch Polish & Consistency Brief

This document outlines the specific design improvements needed to align the **Onboarding**, **Profile**, and **Interaction Design** with the new "Cyber-Organic" aesthetic of the Liq Finance app.

## 1. Onboarding & Registration Flow
**Goal**: Keep the 4-step process but **reorder** the steps and upgrade visual quality.

### Flow Changes:
1.  **Step 1: Purpose/Goal** (MOVED UP):
    *   This should be the **first** interactive step after the welcome screen.
    *   **Requirement**: Add an **"Other"** field (text input) so users can define a custom goal if the presets don't fit.
2.  **Step 2: Phone Number**: Standard verification.
3.  **Step 3: Name**: Personalization.
4.  **No Email**: Confirming that email collection is **NOT** required at this stage.

### Design Directives for Stitch:
*   **Theme Support**:
    *   **Current**: Hardcoded Dark/Cosmic theme.
    *   **Requirement**: Design a **Light Mode** version. Use soft, pearlescent backgrounds (white/gray with subtle aurora gradients) for Light Mode, while keeping the deep glassmorphism for Dark Mode.
*   **Typography**:
    *   Update all fonts to **Outfit** (or the primary app font).
    *   Use **bold, tracking-tight** headers for a modern feel.
    *   Ensure high contrast for accessibility (WCAG AA).
*   **Visuals**:
    *   Replace the "Cosmic/Space" icons with the **"Stitch" 3D/Glass icons** used in the Dashboard.
    *   **Step Indicators**: Make them more organic (e.g., fluid lines or glowing pills) rather than simple dots.
    *   **Cards**: Use the standard `rounded-[2.5rem]` border radius and glassmorphic borders (`border-white/20`).
*   **Note**: Some deep profile pages are not mandatory at this initial stage; focus on the core flow.

## 2. Profile & Settings (Financial Profile)
**Goal**: The current `FinancialProfileModal` is functional but visually outdated. It needs a full redesign.

### Design Directives for Stitch:
*   **Concept**: "Identity Hub".
*   **Layout**:
    *   Move away from a simple modal to a **Full-Screen Sheet** or **Page**.
    *   **Hero Section**: Large user avatar with a "Completion Ring" showing profile strength.
    *   **Income Sources**: Display as **Bento Grid cards** (matching the Budget page) instead of a simple list.
    *   **Settings**: Integrate app settings (Theme, Language, Notifications) into this view so it becomes a central "Me" page.
*   **Interactions**:
    *   Add "Edit" modes that feel tactile (e.g., long-press to reorder sources).

## 3. Responsiveness & "Click Feel"
**Goal**: Ensure the app feels alive and responsive to every touch.

### Design Directives for Stitch:
*   **Active States**:
    *   Every clickable element (buttons, cards, list items) MUST have an `active:scale-95` or `active:scale-98` animation.
    *   **Haptic Feedback**: Visual cues should match haptic patterns (e.g., a subtle flash or glow on tap).
*   **Transitions**:
    *   **Page Transitions**: Smooth fade-in/slide-up effects when navigating between tabs.
    *   **Modals**: Elastic "spring" animations when opening/closing sheets.
*   **Touch Targets**:
    *   Ensure all buttons have a minimum touch area of **44x44px**.

## 4. Remaining Polish Items
*   **Transaction Modal**:
    *   **Issue**: Currently has hardcoded light backgrounds.
    *   **Fix**: Needs a **Dark Mode** variant that uses `bg-[#101622]` and dark inputs.
*   **Empty States**:
    *   Design custom, beautiful illustrations for "No Transactions", "No Goals", etc., consistent with the Stitch style.
