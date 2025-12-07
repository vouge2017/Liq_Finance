import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: Request) {
    try {
        const { audio, mimeType, language } = await req.json()

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { success: false, error: "Server configuration error: Missing API Key" },
                { status: 500 }
            )
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" })

        const prompt = `
      You are a financial assistant for an Ethiopian user. 
      Analyze the following audio which may be in Amharic or English.
      Extract the transaction details:
      1. Type: "income" or "expense"
      2. Amount: Number (in ETB)
      3. Category: Best fit from [Food, Transport, Utilities, Rent, Salary, Business, Gift, Other]
      4. Title: Short description
      5. Date: YYYY-MM-DD (assume today ${new Date().toISOString().split('T')[0]} if not specified)
      
      Return ONLY a JSON object with these keys: type, amount, category, title, date, confidence (0-1).
      If you cannot understand, return { "error": "Could not understand" }.
    `

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: mimeType || "audio/webm",
                    data: audio
                }
            }
        ])

        const response = await result.response
        const text = response.text()

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim()
        const data = JSON.parse(jsonStr)

        if (data.error) {
            return NextResponse.json({ success: false, error: data.error })
        }

        return NextResponse.json({
            success: true,
            data: data,
            transcript: "Processed via Gemini Voice" // Gemini doesn't always return transcript with this method, simplified for now
        })

    } catch (error) {
        console.error("Gemini Voice Error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to process voice input" },
            { status: 500 }
        )
    }
}
