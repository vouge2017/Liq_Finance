import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: Request) {
    try {
        const { imageBase64 } = await req.json()

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { success: false, error: "Server configuration error: Missing API Key" },
                { status: 500 }
            )
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" })

        const prompt = `
      Analyze this receipt image. Extract the following details:
      1. Merchant Name (Title)
      2. Total Amount (Number only)
      3. Date (YYYY-MM-DD format, use today ${new Date().toISOString().split('T')[0]} if not found)
      4. Category (Food, Transport, Utilities, Shopping, Health, Other)

      Return ONLY a JSON object with keys: title, amount, date, category.
      If unclear, make a best guess.
    `

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: "image/jpeg"
                }
            }
        ])

        const response = await result.response
        const text = response.text()

        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim()
        const data = JSON.parse(jsonStr)

        return NextResponse.json({
            success: true,
            data: data
        })

    } catch (error) {
        console.error("Gemini Receipt Error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to analyze receipt" },
            { status: 500 }
        )
    }
}
