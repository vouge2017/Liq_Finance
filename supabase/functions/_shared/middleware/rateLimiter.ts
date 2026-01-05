interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const rateLimitStore: RateLimitStore = {};

export function rateLimiter(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    return async (req: Request): Promise<Response | null> => {
        const clientIP = req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            'unknown';

        const key = `${clientIP}:${req.url}`;
        const now = Date.now();

        if (!rateLimitStore[key]) {
            rateLimitStore[key] = { count: 1, resetTime: now + windowMs };
        } else {
            if (now > rateLimitStore[key].resetTime) {
                rateLimitStore[key] = { count: 1, resetTime: now + windowMs };
            } else {
                rateLimitStore[key].count++;
                if (rateLimitStore[key].count > maxRequests) {
                    return new Response(JSON.stringify({
                        error: 'Too many requests',
                        retryAfter: Math.ceil((rateLimitStore[key].resetTime - now) / 1000)
                    }), {
                        status: 429,
                        headers: {
                            'Content-Type': 'application/json',
                            'Retry-After': Math.ceil((rateLimitStore[key].resetTime - now) / 1000).toString()
                        }
                    });
                }
            }
        }

        return null; // Continue to next middleware
    };
}