import { getSupabaseClient } from "@/lib/supabase/client"
import { validateAIProcessingConsent, validateVoiceProcessingConsent, validateReceiptAnalysisConsent } from "@/lib/supabase/data-service"

export async function parseVoiceAudio(audioBase64: string, mimeType: string, userId?: string) {
    try {
        // Check consent for voice processing if userId is provided
        if (userId) {
            const hasConsent = await validateVoiceProcessingConsent(userId)
            if (!hasConsent) {
                return {
                    success: false,
                    error: "Voice processing consent not granted",
                    consentRequired: true
                }
            }
        }

        const supabase = getSupabaseClient()
        if (!supabase) {
            throw new Error("Supabase client not initialized")
        }

        const prompt = `
      You are a financial assistant for an Ethiopian user. 
      Analyze the following audio which may be in Amharic or English.
      Extract the transaction details:
      1. Type: "income" or "expense"
      2. Amount: Number (in ETB)
      3. Category: Best fit from [Food, Transport, Utilities, Rent, Salary, Business, Gift, Other]
      4. Title: Short description
      5. Date: YYYY-MM-DD (assume today ${new Date().toISOString().split("T")[0]} if not specified)
      
      Return ONLY a JSON object with these keys: type, amount, category, title, date, confidence (0-1).
      If you cannot understand, return { "error": "Could not understand" }.
    `

        const { data, error } = await supabase.functions.invoke("gemini-proxy", {
            body: {
                action: "parse-voice",
                data: {
                    prompt,
                    audioBase64,
                },
                mimeType: mimeType || "audio/webm",
            },
        })

        if (error) throw error

        // Gemini response is in data.candidates[0].content.parts[0].text
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim()
        const parsedData = JSON.parse(jsonStr)

        return {
            success: !parsedData.error,
            data: parsedData.error ? null : parsedData,
            error: parsedData.error || null,
            transcript: "Processed via Gemini Proxy",
        }
    } catch (error) {
        console.error("Gemini Proxy Voice Error:", error)
        return { success: false, error: "Failed to process voice input" }
    }
}

export async function analyzeReceiptImage(imageBase64: string, userId?: string) {
    try {
        // Check consent for receipt analysis if userId is provided
        if (userId) {
            const hasConsent = await validateReceiptAnalysisConsent(userId)
            if (!hasConsent) {
                return {
                    success: false,
                    error: "Receipt analysis consent not granted",
                    consentRequired: true
                }
            }
        }

        const supabase = getSupabaseClient()
        if (!supabase) {
            throw new Error("Supabase client not initialized")
        }

        const prompt = `
      Analyze this receipt image. Extract the following details:
      1. Merchant Name (Title)
      2. Total Amount (Number only)
      3. Date (YYYY-MM-DD format, use today ${new Date().toISOString().split("T")[0]} if not found)
      4. Category (Food, Transport, Utilities, Shopping, Health, Other)

      Return ONLY a JSON object with keys: title, amount, date, category.
      If unclear, make a best guess.
    `

        const { data, error } = await supabase.functions.invoke("gemini-proxy", {
            body: {
                action: "analyze-receipt",
                data: {
                    prompt,
                    imageBase64,
                },
            },
        })

        if (error) throw error

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim()
        const parsedData = JSON.parse(jsonStr)

        return {
            success: true,
            data: parsedData,
        }
    } catch (error) {
        console.error("Gemini Proxy Receipt Error:", error)
        return { success: false, error: "Failed to analyze receipt" }
    }
}
