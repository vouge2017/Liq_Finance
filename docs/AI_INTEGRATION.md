# AI Service & OCR Integration

We leverage **Google Gemini** (via `@google/genai`) to power the "Brain" of the application.

## 1. The "Advisor" Persona
The AI is not a generic chatbot. It is prompted with a specific system instruction in `geminiService.ts`:

> "You are FinEthio, a Ruthless High-End Financial Strategist for an Ethiopian professional... Your goal is financial survival first, then wealth accumulation."

### Context Injection
Before every chat request, we inject a snapshot of the user's `AppState`:
*   Total Balance
*   Burn Rate (Variable Spending)
*   High-Risk Categories (Where `spent > allocated`)
*   Iqub Status

This allows the AI to give specific advice like: *"You spent 3,000 ETB on Cafe but haven't paid your Iddir. Fix this."*

## 2. OCR (Optical Character Recognition)
We use the Multimodal capabilities of Gemini (`gemini-3-pro-preview` or `flash`) to analyze images.

### Supported Document Types:
1.  **Paper Receipts:** Standard thermal print receipts (Shoa, Queens, etc.).
2.  **Telebirr Screenshots:** The app parses the SMS confirmation text from screenshots to extract `Receiver` and `Amount`.
3.  **CBE Transaction Slips:** Extracts transaction references.

### The Parsing Logic
We do not use Regex for OCR. We prompt the model to return a **JSON Object** strictly:
\`\`\`json
{
  "title": "Merchant Name",
  "amount": 120.50,
  "date": "YYYY-MM-DD",
  "category": "Inferred Category"
}
\`\`\`
The AI infers the category based on the merchant name (e.g., "Total" -> Transport, "Canal+" -> Entertainment).

## 3. Smart Text Import
We also support "Paste SMS". Users can paste the raw text of a banking SMS. The AI parses this text using natural language processing to extract the transaction details, handling the variability in SMS formats from different banks (CBE, BOA, Dashen).
