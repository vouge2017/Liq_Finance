import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { runMiddleware, rateLimiter, inputSanitizer, csrfProtection, requestValidator } from "../_shared/middleware/index.ts"

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")

// Define validation schema for requests
const requestSchema = {
    action: { type: 'string' as const, required: true, pattern: /^(parse-voice|analyze-receipt)$/ },
    data: { type: 'object' as const, required: true },
    mimeType: { type: 'string' as const, required: false }
};

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

    // Apply security middleware
    const middlewareResponse = await runMiddleware(req, [
        rateLimiter(50, 15 * 60 * 1000), // 50 requests per 15 minutes
        csrfProtection(),
        inputSanitizer(),
        requestValidator(requestSchema)
    ]);

    if (middlewareResponse) {
        return middlewareResponse;
    }

    try {
        const { action, data, mimeType } = (req as any).validatedBody || await req.json()

        // Additional validation based on action
        if (action === 'parse-voice') {
            if (!data.prompt || !data.audioBase64) {
                return new Response(JSON.stringify({ error: 'Missing required fields for parse-voice: prompt and audioBase64' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } else if (action === 'analyze-receipt') {
            if (!data.prompt || !data.imageBase64) {
                return new Response(JSON.stringify({ error: 'Missing required fields for analyze-receipt: prompt and imageBase64' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

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
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            status: 400,
        })
    }
})
