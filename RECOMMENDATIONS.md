# FinEthio Planner - Recommendations & Roadmap

## 1. Amharic Language - i18n Approach Recommendation

To fully support Amharic and the Ethiopian context, we recommend a robust internationalization (i18n) strategy.

### Recommended Stack
*   **Library:** `react-i18next` (standard for React/Vite apps).
*   **Font:** `Noto Sans Ethiopic` (via Google Fonts) for consistent rendering of Ge'ez characters.
*   **Date Handling:** Replace custom heuristics in `dateUtils.ts` with a dedicated library like `ethiopic-calendar` or `abushakir` (JS library for Ethiopian calendar) to handle leap years and 13th month correctly.

### Implementation Steps
1.  **Install Dependencies:** `npm install i18next react-i18next i18next-browser-languagedetector`.
2.  **Configuration:** Create `src/i18n.ts` to initialize i18next.
3.  **Translation Files:** Store translations in `public/locales/am/translation.json` and `en/translation.json`.
4.  **Component Updates:** Replace hardcoded text with `t('key')` hooks.
5.  **Right-to-Left (RTL):** Amharic is LTR, so no complex layout mirroring is needed, but ensure fonts load correctly.

## 2. Security Hardening - Checklist for Production

Before going live, ensure these security measures are in place.

### Checklist
- [ ] **Environment Variables:** Ensure no secrets (API keys, DB credentials) are hardcoded. Use `.env` files and do not commit them.
- [ ] **Input Validation:** Use `zod` for all form inputs (Phone numbers, amounts) to prevent injection and data corruption.
- [ ] **Dependency Audit:** Run `npm audit` to identify and fix vulnerable packages.
- [ ] **Headers:** Configure HTTP headers (Helmet equivalent for Vite) to set Content Security Policy (CSP), X-Frame-Options, etc.
- [ ] **Error Handling:** Ensure production builds do not expose stack traces to the user.
- [ ] **Authentication:** Verify JWT handling (storage in HttpOnly cookies preferred over localStorage).

## 3. Refactoring - Code Organization Suggestions

As the application grows, the current flat structure may become unmanageable.

### Proposed Structure (Feature-Based)
Move from "Technical Type" folders to "Domain Feature" folders.

```text
src/
  features/
    auth/           # Login, OTP, Phone validation
    budget/         # Expense tracking, Categories
    community/      # Iqub, Iddir logic
    dashboard/      # Main view
  shared/
    components/     # Reusable UI (Buttons, Inputs)
    hooks/          # Common hooks
    utils/          # Date, Currency formatters
  App.tsx
```

### Immediate Refactors
-   **Extract Domain Logic:** Move hardcoded Ethiopian logic (e.g., Iqub rules, Inflation advice) out of UI components into `features/community/logic.ts` or similar.
-   **Centralize Constants:** Move magic strings/numbers (like tax rates, calendar offsets) to a config file.

## 4. Roadmap - Phased Improvement Plan

### Phase 1: Foundation (Weeks 1-2)
-   [ ] Set up `react-i18next` and basic English/Amharic toggle.
-   [ ] Implement `zod` validation for all forms.
-   [ ] Refactor folder structure to Feature-based.

### Phase 2: Core Ethiopian Features (Weeks 3-4)
-   [ ] Integrate `ethiopic-calendar` library for accurate dates.
-   [ ] Implement full Iqub (ROSCA) logic and state management.
-   [ ] Finalize "Third Pillar" (Community) UI.

### Phase 3: Intelligence & Polish (Weeks 5-6)
-   [ ] Refine AI prompts for inflation advice (Amharic support).
-   [ ] Add micro-animations and "Premium" UI polish.
-   [ ] Comprehensive Security Audit.

### Phase 4: Launch Preparation
-   [ ] User Acceptance Testing (UAT).
-   [ ] Production Build & Optimization.
