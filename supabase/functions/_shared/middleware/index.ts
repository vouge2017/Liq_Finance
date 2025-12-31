export { rateLimiter } from './rateLimiter.ts';
export { inputSanitizer } from './inputSanitizer.ts';
export { csrfProtection } from './csrfProtection.ts';
export { requestValidator } from './requestValidator.ts';

export async function runMiddleware(
    req: Request,
    middlewares: ((req: Request) => Promise<Response | null>)[]
): Promise<Response | null> {
    for (const middleware of middlewares) {
        const response = await middleware(req);
        if (response) {
            return response;
        }
    }
    return null;
}