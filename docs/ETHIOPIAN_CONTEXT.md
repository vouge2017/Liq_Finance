# Ethiopian Domain Logic

FinEthio Planner is not a generic budget app. It is hard-coded with logic specific to the Ethiopian financial ecosystem.

## 1. Identity & Onboarding
*   **Phone-First:** Unlike western apps (Email/Password), we use **Mobile Number** as the primary identity key. This aligns with Telebirr and local banking habits.
*   **Validation:** Regex enforces Ethiopian formats: `+251`, `09`, or `07` prefixes.

## 2. Community Finance (The "Third Pillar")

Western apps usually only have "Income" and "Expense". We introduce a third pillar: **Community**.

### Iqub (Equb) - ROSCA
*   **Logic:** Rotating Savings and Credit Association.
*   **State:** We track `cycle` (Weekly/Monthly), `members`, `paidRounds`, and `winningRound`.
*   **Payout Logic:** Unlike a regular expense, an Iqub payment is an asset accumulation. Winning an Iqub is treated as a massive cash injection (Income) but requires logic to ensure the user continues paying subsequent rounds.

### Iddir (Edir) - Social Insurance
*   **Logic:** Indefinite monthly payments for social security (funerals/emergencies).
*   **Behavior:** These are treated as **Fixed Obligations**. Missing an Iddir payment carries high social stigma, so the AI advisor prioritizes this above "Lifestyle" expenses.

## 3. Calendar System
Ethiopia uses the **Ge'ez Calendar**, which lags 7-8 years behind the Gregorian calendar and has 13 months.

*   **Implementation:** `utils/dateUtils.ts` contains a heuristic converter.
*   **Display:** The UI allows toggling between `GC` (Gregorian) and `EC` (Ethiopian).
*   **Note:** The codebase stores dates in ISO-8601 (Gregorian) for math consistency, but converts to Amharic months (Meskerem, Tikimt, etc.) for display when the toggle is active.

## 4. Currency & Inflation
*   **Default Currency:** ETB (Ethiopian Birr).
*   **Inflation Logic:** The AI Prompt is engineered to understand that holding cash (Birr) loses value. It aggressively suggests purchasing non-perishable staples (Teff, Oil) in bulk ("Quintal") rather than saving small cash amounts.
