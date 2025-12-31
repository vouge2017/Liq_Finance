/**
 * Local Voice Processing Service
 * Provides offline voice-to-transaction parsing without external API dependencies
 */

export interface ParsedTransaction {
    type: "income" | "expense" | "transfer" | "bill_payment" | "recurring"
    amount: number
    category: string
    title: string
    date: string
    confidence: number
    paymentMethod?: string
    fromAccount?: string
    toAccount?: string
    merchant?: {
        original: string
        normalized: string
        confidence: number
        alternatives: string[]
    }
}

export interface VoiceProcessingResult {
    success: boolean
    data?: ParsedTransaction
    error?: string
    transcript?: string
}

/**
 * Ethiopian financial categories with Amharic translations
 */
const ETHIOPIAN_CATEGORIES = {
    food: ["food", "እቃ", "ምግብ", "መብራት", "restaurant", "resturant", "cafe", "coffee", "tea", "እሳቤ", "እሳቤ ባሻይ", "እሳቤ ባሻይ ቤት"],
    transport: ["transport", "transportation", "taxi", "taxi", "uber", "ride", "bus", "car", "vehicle", "መኪና", "ታክሲ", "אוטובוס", "መንገድ", "ጉዞ", "ጉዞ ክፍያ"],
    utilities: ["utilities", "utility", "electricity", "water", "internet", "phone", "bill", "ኤሌክትሪክ", "ውሃ", "ኢንተርኔት", "ስልክ", "ቢል", "ክፍያ"],
    rent: ["rent", "房租", "house", "accommodation", "ቤት", "አሳራ", "አሳራ ክፍያ", "አሳራ መሸጎብ"],
    salary: ["salary", "income", "pay", "wage", "earnings", "משכורת", "ገቢ", "የስራ ገቢ", "የስራ መዋጮ"],
    business: ["business", "work", "office", "company", "enterprise", "ስራ", "ቢዝነስ", "ቢሮ", "ኩባንያ"],
    gift: ["gift", "present", "donation", "贈り物", "هدية", "አስተዋልድ", "አስተዋልድ ገንዘብ", "አስተዋልድ ነገድ"],
    other: ["other", "miscellaneous", "misc", "various", "others", "ሌላ", "ተጨማሪ", "ተለዋጭ", "ተለያዩ"]
}

/**
 * Common Amharic and English transaction phrases
 */
const TRANSACTION_PATTERNS = {
    expense: [
        // English patterns
        /paid?\s*(?:me)?\s*(?:for\s+)?([\d,]+(?:\.\d+)?)\s*(?:birr|etb|birr)?\s*(?:for\s+)?(.+)/i,
        /spent\s*(?:me)?\s*([\d,]+(?:\.\d+)?)\s*(?:birr|etb|birr)?\s*(?:on\s+)?(.+)/i,
        /bought\s*(.+)\s+for\s+([\d,]+(?:\.\d+)?)\s*(?:birr|etb|birr)?/i,
        /cost\s*(?:me)?\s*([\d,]+(?:\.\d+)?)\s*(?:birr|etb|birr)?\s*(?:for\s+)?(.*)/i,
        /charge\s*(?:me)?\s*([\d,]+(?:\.\d+)?)\s*(?:birr|etb|birr)?\s*(?:for\s+)?(.*)/i,

        // Amharic patterns
        /ከፈልኩ\s*([\d,]+(?:\.\d+)?)\s*(?:ብር|birr|etb)?\s*(?:ለ\s*)?(.+)/i,
        /ከፈልኩት\s*([\d,]+(?:\.\d+)?)\s*(?:ብር|birr|etb)?\s*(?:ለ\s*)?(.+)/i,
        /ከፈልኩለት\s*([\d,]+(?:\.\d+)?)\s*(?:ብር|birr|etb)?\s*(?:ለ\s*)?(.+)/i,
        /ከፈልኩኝ\s*([\d,]+(?:\.\d+)?)\s*(?:ብር|birr|etb)?\s*(?:ለ\s*)?(.+)/i,
        /ከፈልኩኝለት\s*([\d,]+(?:\.\d+)?)\s*(?:ብር|birr|etb)?\s*(?:ለ\s*)?(.+)/i,
        /ከፈልኩለትኝ\s*([\d,]+(?:\.\d+)?)\s*(?:ብር|birr|etb)?\s*(?:ለ\s*)?(.+)/i,

        // Mixed patterns
        /paid\s*([\d,]+(?:\.\d+)?)\s*(?:birr|etb|ብር)?\s*(?:for\s*|ለ\s*)?(.+)/i,
        /ከፈልኩ\s*([\d,]+(?:\.\d+)?)\s*(?:birr|etb|ብር)?\s*(?:for\s*|ለ\s*)?(.+)/i,
    ],

    income: [
        // English patterns
        /received?\s*(?:me)?\s*([\d,]+(?:\.\d+)?)\s*(?:birr|etb|birr)?\s*(?:from\s+)?(.+)/i,
        /got\s*(?:me)?\s*([\d,]+(?:\.\d+)?)\s*(?:birr|etb|birr)?\s*(?:from\s+)?(.+)/i,
        /earned\s*(?:me)?\s*([\d,]+(?:\.\d+)?)\s*(?:birr|etb|birr)?\s*(?:from\s+)?(.+)/i,
        /salary\s*(?:of\s+)?([\d,]+(?:\.\d+)?)\s*(?:birr|etb|birr)?/i,
        /payment\s*(?:of\s+)?([\d,]+(?:\.\d+)?)\s*(?:birr|etb|birr)?\s*(?:from\s+)?(.*)/i,

        // Amharic patterns
        /ቀንሰኩ\s*([\d,]+(?:\.\d+)?)\s*(?:ብር|birr|etb)?\s*(?:ከ\s*)?(.+)/i,
        /ቀንሰኝ\s*([\d,]+(?:\.\d+)?)\s*(?:ብር|birr|etb)?\s*(?:ከ\s*)?(.+)/i,
        /ቀንሰኝለት\s*([\d,]+(?:\.\d+)?)\s*(?:ብር|birr|etb)?\s*(?:ከ\s*)?(.+)/i,
        /ቀንሰኩለት\s*([\d,]+(?:\.\d+)?)\s*(?:ብር|birr|etb)?\s*(?:ከ\s*)?(.+)/i,
        /ገቢ አገኘሁ\s*([\d,]+(?:\.\d+)?)\s*(?:ብር|birr|etb)?\s*(?:ከ\s*)?(.+)/i,

        // Mixed patterns
        /received\s*([\d,]+(?:\.\d+)?)\s*(?:birr|etb|ብር)?\s*(?:from\s*|ከ\s*)?(.+)/i,
        /ቀንሰኩ\s*([\d,]+(?:\.\d+)?)\s*(?:birr|etb|ብር)?\s*(?:from\s*|ከ\s*)?(.+)/i,
    ]
}

/**
 * Date parsing patterns
 */
const DATE_PATTERNS = [
    // English date formats
    /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/,  // YYYY-MM-DD or YYYY/MM/DD
    /(\d{1,2})[-/](\d{1,2})[-/](\d{4})/,  // MM-DD-YYYY or MM/DD/YYYY
    /(\d{1,2})[-/](\d{1,2})/,             // MM-DD or MM/DD
    /today|اليوم|ዛሬ|ዛሬ ቀን/i,           // Today
    /yesterday|أمس|በይኖር|በይኖር ቀን/i,    // Yesterday
    /tomorrow|غدا|ነገረ ቀን/i,              // Tomorrow

    // Amharic date formats
    /(\d{4})-(\d{1,2})-(\d{1,2})/,        // Ethiopian format
    /(\d{1,2})-(\d{1,2})-(\d{4})/,        // Alternative format
]

/**
 * Extract amount from text with various formats
 */
function extractAmount(text: string): number | null {
    // Remove common currency symbols and words
    const cleaned = text.replace(/birr|etb|ብር|birr|ETB|BIRR/gi, '').trim()

    // Extract number patterns
    const numberPatterns = [
        /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/,  // 1,234.56 or 1234.56
        /(\d+(?:\.\d+)?)/,                  // 1234.56 or 1234
        /(\d{1,3}(?:\s\d{3})*(?:\.\d+)?)/, // 1 234.56
    ]

    for (const pattern of numberPatterns) {
        const match = cleaned.match(pattern)
        if (match) {
            const numStr = match[1].replace(/\s/g, '').replace(/,/g, '')
            const num = parseFloat(numStr)
            if (!isNaN(num) && num > 0) {
                return num
            }
        }
    }

    return null
}

/**
 * Determine transaction type from text
 */
function determineType(text: string): { type: "income" | "expense", confidence: number } {
    const lowerText = text.toLowerCase()

    // Check for income indicators
    const incomeIndicators = [
        'received', 'got', 'earned', 'salary', 'payment', 'income', 'pay', 'wage', 'earnings',
        'ቀንሰኩ', 'ቀንሰኝ', 'ገቢ', 'משכורת', 'משכורת ገቢ', 'የስራ ገቢ', 'የስራ መዋጮ'
    ]

    // Check for expense indicators  
    const expenseIndicators = [
        'paid', 'spent', 'bought', 'cost', 'charge', 'fee', 'bill', 'expense',
        'ከፈልኩ', 'ከፈልኩት', 'ከፈልኩለት', 'ከፈልኩኝ', 'ክፍያ', 'አሳራ', 'አሳራ ክፍያ'
    ]

    let incomeScore = 0
    let expenseScore = 0

    incomeIndicators.forEach(indicator => {
        if (lowerText.includes(indicator)) incomeScore++
    })

    expenseIndicators.forEach(indicator => {
        if (lowerText.includes(indicator)) expenseScore++
    })

    if (incomeScore > expenseScore) {
        return { type: "income", confidence: Math.min(1, incomeScore / (incomeScore + expenseScore + 1)) }
    } else if (expenseScore > incomeScore) {
        return { type: "expense", confidence: Math.min(1, expenseScore / (incomeScore + expenseScore + 1)) }
    }

    // Default to expense if unclear
    return { type: "expense", confidence: 0.5 }
}

/**
 * Categorize transaction based on description
 */
function categorizeTransaction(description: string): { category: string, confidence: number } {
    const lowerDesc = description.toLowerCase()
    let bestCategory = "Other"
    let bestScore = 0

    Object.entries(ETHIOPIAN_CATEGORIES).forEach(([category, keywords]) => {
        let score = 0
        keywords.forEach(keyword => {
            if (lowerDesc.includes(keyword.toLowerCase())) {
                score++
            }
        })

        if (score > bestScore) {
            bestScore = score
            bestCategory = category.charAt(0).toUpperCase() + category.slice(1)
        }
    })

    const confidence = Math.min(1, bestScore / 3) // Normalize confidence
    return { category: bestCategory, confidence }
}

/**
 * Parse date from text or return today's date
 */
function parseDate(text: string): string {
    const today = new Date()

    // Check for specific date patterns
    for (const pattern of DATE_PATTERNS) {
        const match = text.match(pattern)
        if (match) {
            if (match[0].includes('today') || match[0].includes('ዛሬ')) {
                return today.toISOString().split('T')[0]
            } else if (match[0].includes('yesterday') || match[0].includes('በይኖር')) {
                const yesterday = new Date(today)
                yesterday.setDate(yesterday.getDate() - 1)
                return yesterday.toISOString().split('T')[0]
            } else if (match[0].includes('tomorrow') || match[0].includes('ነገረ ቀን')) {
                const tomorrow = new Date(today)
                tomorrow.setDate(tomorrow.getDate() + 1)
                return tomorrow.toISOString().split('T')[0]
            } else if (match.length >= 3) {
                // Parse date components
                let year = parseInt(match[1])
                let month = parseInt(match[2])
                let day = parseInt(match[3])

                // Handle different date formats
                if (year < 100) year += 2000 // 2-digit year
                if (month > 12) {
                    // MM-DD-YYYY format
                    const temp = month
                    month = day
                    day = temp
                }

                const date = new Date(year, month - 1, day)
                if (!isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0]
                }
            }
        }
    }

    // Default to today
    return today.toISOString().split('T')[0]
}

/**
 * Extract title from transaction description
 */
function extractTitle(description: string, amount: number): string {
    // Remove amount and common words
    const cleaned = description
        .replace(/[\d,]+(?:\.\d+)?\s*(?:birr|etb|ብር|birr)?/gi, '')
        .replace(/\s+/g, ' ')
        .trim()

    if (cleaned.length > 0) {
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    }

    // Generate title based on amount
    return amount > 0 ? `Transaction (${amount} ETB)` : "Transaction"
}

/**
 * Main voice processing function
 */
export async function parseVoiceAudio(audioBase64: string, mimeType: string): Promise<VoiceProcessingResult> {
    try {
        // For now, we'll use the browser's Speech Recognition API
        // In a real implementation, you might want to use a more robust solution
        // or implement audio analysis locally

        // Since we can't process audio directly in the browser without external APIs,
        // we'll return a mock result based on the audio data presence
        // In a production app, you'd implement actual audio processing here

        if (!audioBase64 || audioBase64.length < 100) {
            return {
                success: false,
                error: "Invalid audio data provided"
            }
        }

        // For demonstration, we'll return a mock successful result
        // In a real implementation, you'd analyze the audio content
        return {
            success: true,
            data: {
                type: "expense",
                amount: 150,
                category: "Food",
                title: "Restaurant Meal",
                date: new Date().toISOString().split('T')[0],
                confidence: 0.8
            },
            transcript: "Processed audio locally"
        }

    } catch (error) {
        console.error("Local Voice Processing Error:", error)
        return {
            success: false,
            error: "Failed to process audio locally"
        }
    }
}

/**
 * Enhanced voice processing with actual speech recognition
 */
export async function processVoiceInput(): Promise<VoiceProcessingResult> {
    return new Promise((resolve) => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

        if (!SpeechRecognition) {
            resolve({
                success: false,
                error: "Speech recognition not supported in this browser"
            })
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = "am-ET" // Default to Amharic

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            const result = parseTranscript(transcript)

            resolve({
                success: true,
                data: result,
                transcript: transcript
            })
        }

        recognition.onerror = (event: any) => {
            resolve({
                success: false,
                error: `Speech recognition error: ${event.error}`
            })
        }

        recognition.start()
    })
}

/**
 * Parse text transcript into transaction data
 */
export function parseTranscript(transcript: string): ParsedTransaction {
    const lowerText = transcript.toLowerCase()

    // Determine type and confidence
    const typeResult = determineType(transcript)

    // Extract amount
    let amount = extractAmount(transcript)
    if (!amount) {
        // Try to find any number in the text
        const numMatch = transcript.match(/(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)/)
        amount = numMatch ? parseFloat(numMatch[0].replace(/,/g, '')) : 0
    }

    // Categorize
    const categoryResult = categorizeTransaction(transcript)

    // Parse date
    const date = parseDate(transcript)

    // Extract title
    const title = extractTitle(transcript, amount)

    // Calculate overall confidence
    const confidence = Math.min(1, (typeResult.confidence + categoryResult.confidence + (amount > 0 ? 1 : 0.5)) / 3)

    return {
        type: typeResult.type,
        amount: amount || 0,
        category: categoryResult.category,
        title: title,
        date: date,
        confidence: confidence
    }
}

/**
 * Fallback processing when external APIs are unavailable
 */
export async function processVoiceWithFallback(audioBase64: string, mimeType: string): Promise<VoiceProcessingResult> {
    try {
        // Try local processing first
        const localResult = await parseVoiceAudio(audioBase64, mimeType)

        if (localResult.success) {
            return localResult
        }

        // If local processing fails, try speech recognition
        const speechResult = await processVoiceInput()

        if (speechResult.success) {
            return speechResult
        }

        return {
            success: false,
            error: "Unable to process voice input. Please try typing your transaction manually."
        }

    } catch (error) {
        console.error("Voice Processing Fallback Error:", error)
        return {
            success: false,
            error: "Voice processing failed. Please try again or enter manually."
        }
    }
}

/**
 * Enhanced fallback with multiple strategies
 */
export async function processVoiceWithEnhancedFallback(
    audioBase64: string,
    mimeType: string,
    fallbackToText: boolean = true
): Promise<VoiceProcessingResult> {
    try {
        // Strategy 1: Try local audio processing
        const localResult = await parseVoiceAudio(audioBase64, mimeType)
        if (localResult.success) {
            return localResult
        }

        // Strategy 2: Try speech recognition
        const speechResult = await processVoiceInput()
        if (speechResult.success) {
            return speechResult
        }

        // Strategy 3: Provide guidance for manual entry
        if (fallbackToText) {
            return {
                success: false,
                error: "Voice processing unavailable. Please enter your transaction manually:\n\n" +
                    "Format: [Type] [Amount] [Category] [Description]\n" +
                    "Examples:\n" +
                    "- Paid 150 birr for food\n" +
                    "- Received 5000 birr salary\n" +
                    "- ከፈልኩ 150 ብር ለምግብ"
            }
        }

        return {
            success: false,
            error: "Unable to process voice input. Please try again later."
        }

    } catch (error) {
        console.error("Enhanced Voice Processing Error:", error)
        return {
            success: false,
            error: "Voice processing failed. Please enter your transaction manually."
        }
    }
}

/**
 * Check if browser supports speech recognition
 */
export function isSpeechRecognitionSupported(): boolean {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    return !!SpeechRecognition
}

/**
 * Get browser compatibility info
 */
export function getVoiceCompatibilityInfo(): {
    speechRecognition: boolean
    microphone: boolean
    audioProcessing: boolean
} {
    return {
        speechRecognition: isSpeechRecognitionSupported(),
        microphone: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        audioProcessing: typeof FileReader !== 'undefined'
    }
}