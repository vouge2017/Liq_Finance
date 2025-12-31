export function sanitizeInput(input: any): any {
    if (typeof input === 'string') {
        // Remove potentially dangerous characters and trim
        return input.replace(/[<>\"'&]/g, '').trim();
    } else if (Array.isArray(input)) {
        return input.map(sanitizeInput);
    } else if (input && typeof input === 'object') {
        const sanitized: any = {};
        for (const key in input) {
            if (input.hasOwnProperty(key)) {
                sanitized[sanitizeInput(key)] = sanitizeInput(input[key]);
            }
        }
        return sanitized;
    }
    return input;
}

export function inputSanitizer() {
    return async (req: Request): Promise<Response | null> => {
        try {
            if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
                const contentType = req.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const body = await req.json();
                    const sanitizedBody = sanitizeInput(body);
                    (req as any).sanitizedBody = sanitizedBody;
                }
            }
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Invalid JSON input' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return null;
    };
}