import { Transaction } from "@/types";

interface ParsedSMS {
    amount: number;
    merchant: string;
    date: string;
    type: 'income' | 'expense';
    currency: string;
}

export const parseSMS = (text: string): ParsedSMS | null => {
    if (!text) return null;
    const cleanText = text.trim();

    // --- 1. CBE (Commercial Bank of Ethiopia) ---
    // "Dear Customer, your account 1000****123 has been debited with ETB 500.00 on 12-Dec-2025. Reason: PAYMENT TO ABEBE."
    // "Dear Customer, your account 1000****123 has been credited with ETB 1000.00 on 12-Dec-2025. Reason: SALARY."
    const cbeDebitRegex = /debited\s+with\s+([A-Z]{3})\s+([\d,]+(?:\.\d{2})?)\s+on\s+([\d]{2}-[A-Za-z]{3}-[\d]{4}).*?Reason:\s*(.*)/i;
    const cbeCreditRegex = /credited\s+with\s+([A-Z]{3})\s+([\d,]+(?:\.\d{2})?)\s+on\s+([\d]{2}-[A-Za-z]{3}-[\d]{4}).*?Reason:\s*(.*)/i;

    const cbeDebitMatch = cleanText.match(cbeDebitRegex);
    if (cbeDebitMatch) {
        return {
            currency: cbeDebitMatch[1],
            amount: parseFloat(cbeDebitMatch[2].replace(/,/g, '')),
            date: parseDate(cbeDebitMatch[3]),
            merchant: cbeDebitMatch[4].trim(),
            type: 'expense'
        };
    }

    const cbeCreditMatch = cleanText.match(cbeCreditRegex);
    if (cbeCreditMatch) {
        return {
            currency: cbeCreditMatch[1],
            amount: parseFloat(cbeCreditMatch[2].replace(/,/g, '')),
            date: parseDate(cbeCreditMatch[3]),
            merchant: cbeCreditMatch[4].trim(),
            type: 'income'
        };
    }

    // --- 2. Telebirr ---
    // "You have transferred ETB 200 to 251911234567 (ABEBE KEBEDE) on 2025-12-12 10:30:00. Txn ID: ..."
    // "You have received ETB 500 from 251911234567 (ALMAZ) on ..."
    const telebirrSentRegex = /transferred\s+([A-Z]{3})\s+([\d,]+(?:\.\d{2})?)\s+to\s+.*?\((.*?)\)\s+on\s+([\d]{4}-[\d]{2}-[\d]{2})/i;
    const telebirrReceivedRegex = /received\s+([A-Z]{3})\s+([\d,]+(?:\.\d{2})?)\s+from\s+.*?\((.*?)\)\s+on\s+([\d]{4}-[\d]{2}-[\d]{2})/i;

    const teleSentMatch = cleanText.match(telebirrSentRegex);
    if (teleSentMatch) {
        return {
            currency: teleSentMatch[1],
            amount: parseFloat(teleSentMatch[2].replace(/,/g, '')),
            merchant: teleSentMatch[3].trim(),
            date: teleSentMatch[4], // Already ISO-ish
            type: 'expense'
        };
    }

    const teleRecMatch = cleanText.match(telebirrReceivedRegex);
    if (teleRecMatch) {
        return {
            currency: teleRecMatch[1],
            amount: parseFloat(teleRecMatch[2].replace(/,/g, '')),
            merchant: teleRecMatch[3].trim(),
            date: teleRecMatch[4],
            type: 'income'
        };
    }

    // --- 3. Generic / Fallback ---
    // Look for "ETB 500" or "500 ETB"
    const genericAmountRegex = /(?:ETB|Birr)\s*([\d,]+(?:\.\d{2})?)|([\d,]+(?:\.\d{2})?)\s*(?:ETB|Birr)/i;
    const amountMatch = cleanText.match(genericAmountRegex);

    if (amountMatch) {
        const amountStr = amountMatch[1] || amountMatch[2];
        return {
            amount: parseFloat(amountStr.replace(/,/g, '')),
            currency: 'ETB',
            date: new Date().toISOString().split('T')[0], // Default to today
            merchant: 'Unknown SMS',
            type: 'expense' // Default assumption
        };
    }

    return null;
};

// Helper to convert "12-Dec-2025" to "2025-12-12"
const parseDate = (dateStr: string): string => {
    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) {
        // ignore
    }
    return new Date().toISOString().split('T')[0];
};
