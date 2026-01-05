# Architecture & State Management

This document outlines the technical decisions driving FinEthio Planner.

## 1. State Management Strategy

We utilize a **Monolithic Context Pattern (`AppContext`)** combined with **LocalStorage Persistence**.

### Why this approach?
1.  **Simplicity:** Redux or Zustands were deemed overkill for the current complexity.
2.  **Offline-First:** By syncing the entire `AppState` to `localStorage` on every change, we ensure the user never loses data if the page refreshes or connection is lost.
3.  **Zero-Backend (Current Phase):** All data lives on the client device, enhancing privacy and trust for financial data.

### The `AppState` Interface
The state is normalized into specific domains:
*   `transactions`: Linear log of all movements.
*   `accounts`: Current balances and metadata.
*   `budgetCategories`: Allocation vs. Spent logic.
*   `iqubs` & `iddirs`: Specialized data structures for community finance.

## 2. Data Flow

1.  **Action Trigger:** User performs an action (e.g., `addTransaction`).
2.  **Context Update:** The `AppContext` reducer/function updates the `transactions` array.
3.  **Side Effects:**
    *   The specific `Account` balance is recalculated immediately.
    *   The `BudgetCategory` spent amount is updated if applicable.
    *   The `FinancialContext` (for AI) is dirtied/updated.
4.  **Persistence:** The `useEffect` hook detects the state change and writes to `localStorage`.

## 3. UI/UX Design System

### Theming
We use a CSS Variable abstraction layer in `index.html` that maps to Tailwind classes.
*   `--bg-main`: Handles the deep black/slate backgrounds.
*   `--text-primary`: High contrast white/off-white.
*   `--modal-overlay`: Handles the glassmorphism effects.

### Modal System
We use a **Bottom Sheet / Dialog Hybrid** pattern:
*   **Mobile:** Modals slide up from the bottom (thumb-reachable).
*   **Desktop:** Modals center as traditional dialogs.
*   **Animations:** All transitions use CSS `@keyframes` (push, slide-up, hero-expand) for native-like feel (60fps).

## 4. Performance Considerations

*   **Memoization:** Heavy calculations (like `safeToSpend` in `BudgetPage.tsx`) are memoized using `useMemo` to prevent recalculation on every render.
*   **Lazy AI:** The Gemini API is only called on demand. We do not preload heavy AI models.
*   **No Scrollbars:** We use `no-scrollbar` classes to maintain a sleek, native app look while keeping functionality.
