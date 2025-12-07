/**
 * Bank SMS Parser for Ethiopian Banks
 * Parses transaction SMS from CBE, Telebirr, Dashen, and Awash banks
 */

export interface ParsedSMS {
    bank: 'CBE' | 'Telebirr' | 'Dashen' | 'Awash' | 'Unknown'
    type: 'expense' | 'income'
    amount: number
    balance?: number
    merchant?: string
    reference?: string
    date?: string
}

/**
 * Parse a bank SMS message and extract transaction details
 */
export function parseBankSMS(sms: string): ParsedSMS | null {
    const text = sms.trim()

    // CBE (Commercial Bank of Ethiopia)
    // Format: "Debit: ETB 1,500.00 from A/C ****1234. Ref: TXN123. Bal: ETB 45,000.00"
    // Format: "Credit: ETB 15,000.00 to A/C ****1234. Ref: SAL123. Bal: ETB 60,000.00"
    const cbeDebitMatch = text.match(/Debit:\s*ETB\s*([\d,]+\.?\d*)/i)
    const cbeCreditMatch = text.match(/Credit:\s*ETB\s*([\d,]+\.?\d*)/i)
    const cbeBalanceMatch = text.match(/Bal:\s*ETB\s*([\d,]+\.?\d*)/i)
    const cbeRefMatch = text.match(/Ref:\s*(\w+)/i)

    if (cbeDebitMatch) {
        return {
            bank: 'CBE',
            type: 'expense',
            amount: parseAmount(cbeDebitMatch[1]),
            balance: cbeBalanceMatch ? parseAmount(cbeBalanceMatch[1]) : undefined,
            reference: cbeRefMatch ? cbeRefMatch[1] : undefined,
        }
    }

    if (cbeCreditMatch) {
        return {
            bank: 'CBE',
            type: 'income',
            amount: parseAmount(cbeCreditMatch[1]),
            balance: cbeBalanceMatch ? parseAmount(cbeBalanceMatch[1]) : undefined,
            reference: cbeRefMatch ? cbeRefMatch[1] : undefined,
        }
    }

    // Telebirr
    // Format: "You have paid ETB 500 to MERCHANT_NAME. Ref: ABC123. Balance: ETB 2,500"
    // Format: "You have received ETB 1,000 from SENDER. Ref: XYZ789. Balance: ETB 3,500"
    const telebirrPaidMatch = text.match(/paid\s*ETB\s*([\d,]+\.?\d*)\s*to\s*([^.]+)/i)
    const telebirrReceivedMatch = text.match(/received\s*ETB\s*([\d,]+\.?\d*)\s*from\s*([^.]+)/i)
    const telebirrBalanceMatch = text.match(/Balance:\s*ETB\s*([\d,]+\.?\d*)/i)
    const telebirrRefMatch = text.match(/Ref:\s*(\w+)/i)

    if (telebirrPaidMatch) {
        return {
            bank: 'Telebirr',
            type: 'expense',
            amount: parseAmount(telebirrPaidMatch[1]),
            merchant: telebirrPaidMatch[2].trim(),
            balance: telebirrBalanceMatch ? parseAmount(telebirrBalanceMatch[1]) : undefined,
            reference: telebirrRefMatch ? telebirrRefMatch[1] : undefined,
        }
    }

    if (telebirrReceivedMatch) {
        return {
            bank: 'Telebirr',
            type: 'income',
            amount: parseAmount(telebirrReceivedMatch[1]),
            merchant: telebirrReceivedMatch[2].trim(),
            balance: telebirrBalanceMatch ? parseAmount(telebirrBalanceMatch[1]) : undefined,
            reference: telebirrRefMatch ? telebirrRefMatch[1] : undefined,
        }
    }

    // Dashen Bank
    // Format: "Dashen Bank: Withdrawal of ETB 2,000 from ATM. Balance: 18,000"
    // Format: "Dashen Bank: Deposit of ETB 5,000. Balance: 23,000"
    const dashenWithdrawMatch = text.match(/Dashen.*Withdrawal\s*(?:of)?\s*ETB\s*([\d,]+\.?\d*)/i)
    const dashenDepositMatch = text.match(/Dashen.*Deposit\s*(?:of)?\s*ETB\s*([\d,]+\.?\d*)/i)
    const dashenBalanceMatch = text.match(/Balance:\s*([\d,]+\.?\d*)/i)

    if (dashenWithdrawMatch) {
        return {
            bank: 'Dashen',
            type: 'expense',
            amount: parseAmount(dashenWithdrawMatch[1]),
            balance: dashenBalanceMatch ? parseAmount(dashenBalanceMatch[1]) : undefined,
            merchant: 'ATM Withdrawal',
        }
    }

    if (dashenDepositMatch) {
        return {
            bank: 'Dashen',
            type: 'income',
            amount: parseAmount(dashenDepositMatch[1]),
            balance: dashenBalanceMatch ? parseAmount(dashenBalanceMatch[1]) : undefined,
        }
    }

    // Awash Bank
    // Format: "Awash Bank: Debit ETB 1,500.00 TXN: ATM. Avl Bal: ETB 25,000.00"
    // Format: "Awash Bank: Credit ETB 10,000.00 TXN: Transfer. Avl Bal: ETB 35,000.00"
    const awashDebitMatch = text.match(/Awash.*Debit\s*ETB\s*([\d,]+\.?\d*)/i)
    const awashCreditMatch = text.match(/Awash.*Credit\s*ETB\s*([\d,]+\.?\d*)/i)
    const awashBalanceMatch = text.match(/Avl Bal:\s*ETB\s*([\d,]+\.?\d*)/i)
    const awashTxnMatch = text.match(/TXN:\s*([^.]+)/i)

    if (awashDebitMatch) {
        return {
            bank: 'Awash',
            type: 'expense',
            amount: parseAmount(awashDebitMatch[1]),
            balance: awashBalanceMatch ? parseAmount(awashBalanceMatch[1]) : undefined,
            merchant: awashTxnMatch ? awashTxnMatch[1].trim() : undefined,
        }
    }

    if (awashCreditMatch) {
        return {
            bank: 'Awash',
            type: 'income',
            amount: parseAmount(awashCreditMatch[1]),
            balance: awashBalanceMatch ? parseAmount(awashBalanceMatch[1]) : undefined,
            merchant: awashTxnMatch ? awashTxnMatch[1].trim() : undefined,
        }
    }

    // Generic ETB amount detection (fallback)
    const genericMatch = text.match(/ETB\s*([\d,]+\.?\d*)/i)
    if (genericMatch) {
        const isExpense = /paid|debit|withdraw|sent|transfer/i.test(text)
        const isIncome = /received|credit|deposit/i.test(text)

        return {
            bank: 'Unknown',
            type: isIncome ? 'income' : (isExpense ? 'expense' : 'expense'),
            amount: parseAmount(genericMatch[1]),
        }
    }

    return null
}

/**
 * Parse amount string to number
 */
function parseAmount(amountStr: string): number {
    return parseFloat(amountStr.replace(/,/g, ''))
}

/**
 * Get suggested category based on merchant name
 */
export function getCategoryFromMerchant(merchant: string): string {
    const lowerMerchant = merchant.toLowerCase()

    // Transport
    if (/taxi|ride|uber|feres|zay/i.test(lowerMerchant)) return 'Transport'
    if (/total|noc|oil|petrol|fuel/i.test(lowerMerchant)) return 'Transport'

    // Food & Groceries
    if (/shoa|friendship|queen|fantu|safeway/i.test(lowerMerchant)) return 'Groceries'
    if (/restaurant|hotel|cafe|coffee|tomoca|kaldi/i.test(lowerMerchant)) return 'Food'

    // Bills & Utilities
    if (/ethio\s*telecom|safaricom|electric|water|eelpa/i.test(lowerMerchant)) return 'Bills'

    // Entertainment
    if (/netflix|dstv|canal|cinema|movie/i.test(lowerMerchant)) return 'Entertainment'

    // Health
    if (/pharmacy|hospital|clinic|medical/i.test(lowerMerchant)) return 'Health'

    // ATM
    if (/atm|withdrawal/i.test(lowerMerchant)) return 'Cash'

    return 'Other'
}
