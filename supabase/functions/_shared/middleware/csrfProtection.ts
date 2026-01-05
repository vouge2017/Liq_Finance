const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://yourdomain.com', // Replace with actual domain
    'https://liq-finance.vercel.app' // Example
];

export function csrfProtection() {
    return async (req: Request): Promise<Response | null> => {
        const origin = req.headers.get('origin');
        const referer = req.headers.get('referer');

        // For state-changing methods, check origin/referer
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            if (origin && !ALLOWED_ORIGINS.includes(origin)) {
                return new Response(JSON.stringify({ error: 'Invalid origin' }), {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            if (referer) {
                const refererOrigin = new URL(referer).origin;
                if (!ALLOWED_ORIGINS.includes(refererOrigin)) {
                    return new Response(JSON.stringify({ error: 'Invalid referer' }), {
                        status: 403,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }
        }

        return null;
    };
}