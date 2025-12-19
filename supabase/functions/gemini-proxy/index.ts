import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
            },
        })
    }

    try {
        const { action, data, mimeType } = await req.json()

        if (!GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY")
        }

        let url = ""
        let body = {}

        if (action === "parse-voice") {
            url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
            body = {
                contents: [
                    {
                        parts: [
                            { text: data.prompt },
                            {
                                inline_data: {
                                    mime_type: mimeType || "audio/webm",
                                    data: data.audioBase64,
                                },
                            },
                        ],
                    },
                ],
            }
        } else if (action === "analyze-receipt") {
            url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
            body = {
                contents: [
                    {
                        parts: [
                            { text: data.prompt },
                            {
                                inline_data: {
                                    mime_type: "image/jpeg",
                                    data: data.imageBase64,
                                },
                            },
                        ],
                    },
                ],
            }
        } else {
            throw new Error("Invalid action")
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })

        const result = await response.json()

        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            status: response.status,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            status: 400,
        })
    }
})
