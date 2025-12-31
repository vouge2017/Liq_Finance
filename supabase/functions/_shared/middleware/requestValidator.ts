interface ValidationSchema {
    [key: string]: {
        type: 'string' | 'number' | 'boolean' | 'object' | 'array';
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        pattern?: RegExp;
    };
}

export function validateRequest(schema: ValidationSchema) {
    return (data: any): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        for (const field in schema) {
            const rules = schema[field];
            const value = data[field];

            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }

            if (value !== undefined && value !== null) {
                if (typeof value !== rules.type) {
                    errors.push(`${field} must be of type ${rules.type}`);
                }

                if (rules.type === 'string') {
                    const str = value as string;
                    if (rules.minLength && str.length < rules.minLength) {
                        errors.push(`${field} must be at least ${rules.minLength} characters`);
                    }
                    if (rules.maxLength && str.length > rules.maxLength) {
                        errors.push(`${field} must be at most ${rules.maxLength} characters`);
                    }
                    if (rules.pattern && !rules.pattern.test(str)) {
                        errors.push(`${field} does not match required pattern`);
                    }
                }
            }
        }

        return { valid: errors.length === 0, errors };
    };
}

export function requestValidator(schema: ValidationSchema) {
    return async (req: Request): Promise<Response | null> => {
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            const body = (req as any).sanitizedBody || await req.json();
            const validator = validateRequest(schema);
            const result = validator(body);

            if (!result.valid) {
                return new Response(JSON.stringify({
                    error: 'Validation failed',
                    details: result.errors
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            (req as any).validatedBody = body;
        }

        return null;
    };
}