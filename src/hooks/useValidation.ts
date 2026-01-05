import { useState, useCallback } from 'react';
import { z } from 'zod';
import { validateFormData, formatValidationErrors, ValidationResult } from '@/lib/validation';

export interface ValidationState {
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isValid: boolean;
    isSubmitting: boolean;
}

export interface UseValidationReturn<T> extends ValidationState {
    validateField: (field: string, value: unknown) => boolean;
    validateForm: (data: unknown) => boolean;
    setFieldValue: (field: string, value: unknown) => void;
    setFieldTouched: (field: string, touched?: boolean) => void;
    reset: () => void;
    submit: (data: unknown, onSubmit: (data: T) => void | Promise<void>) => Promise<boolean>;
    getFieldProps: (field: string) => {
        value: unknown;
        error: string | undefined;
        touched: boolean;
        onChange: (value: unknown) => void;
        onBlur: () => void;
    };
}

export function useValidation<T extends Record<string, any>>(
    schema: z.ZodSchema<T>,
    initialValues: Partial<T> = {}
): UseValidationReturn<T> {
    const [values, setValues] = useState<Partial<T>>(initialValues);

    const [state, setState] = useState<ValidationState>(() => ({
        errors: {},
        touched: {},
        isValid: true,
        isSubmitting: false,
    }));

    const validateField = useCallback((field: string, value: unknown): boolean => {
        try {
            // Basic field validation - for a production app you'd want more sophisticated validation
            if (!value && value !== 0) {
                setState(prev => ({
                    ...prev,
                    errors: { ...prev.errors, [field]: 'This field is required' },
                    isValid: false,
                }));
                return false;
            }

            // Remove error if field is now valid
            setState(prev => {
                const newErrors = { ...prev.errors };
                delete newErrors[field];

                return {
                    ...prev,
                    errors: newErrors,
                    isValid: Object.keys(newErrors).length === 0,
                };
            });

            return true;
        } catch (error) {
            console.error('Validation error:', error);
            return false;
        }
    }, []);

    const validateForm = useCallback((data: unknown): boolean => {
        const result = validateFormData(schema, data);

        setState(prev => {
            if (result.success) {
                return {
                    ...prev,
                    errors: {},
                    isValid: true,
                };
            } else {
                const formattedErrors = result.errors ? formatValidationErrors(result.errors) : {};
                return {
                    ...prev,
                    errors: formattedErrors,
                    isValid: false,
                };
            }
        });

        return result.success;
    }, [schema]);

    const setFieldValue = useCallback((field: string, value: unknown) => {
        setValues(prev => ({ ...prev, [field]: value }));
    }, []);

    const setFieldTouched = useCallback((field: string, touched: boolean = true) => {
        setState(prev => ({
            ...prev,
            touched: { ...prev.touched, [field]: touched },
        }));
    }, []);

    const reset = useCallback(() => {
        setValues(initialValues);
        setState({
            errors: {},
            touched: {},
            isValid: true,
            isSubmitting: false,
        });
    }, [initialValues]);

    const submit = useCallback(async (
        data: unknown,
        onSubmit: (data: T) => void | Promise<void>
    ): Promise<boolean> => {
        setState(prev => ({ ...prev, isSubmitting: true }));

        // Validate the form
        const isValid = validateForm(data);

        if (!isValid) {
            setState(prev => ({ ...prev, isSubmitting: false }));
            return false;
        }

        try {
            await onSubmit(data as T);
            setState(prev => ({ ...prev, isSubmitting: false }));
            return true;
        } catch (error) {
            console.error('Submit error:', error);
            setState(prev => ({
                ...prev,
                isSubmitting: false,
                errors: { ...prev.errors, general: 'An error occurred. Please try again.' }
            }));
            return false;
        }
    }, [validateForm]);

    const getFieldProps = useCallback((field: string) => {
        return {
            value: values[field] || '',
            error: state.errors[field],
            touched: state.touched[field] || false,
            onChange: (value: unknown) => setFieldValue(field, value),
            onBlur: () => setFieldTouched(field),
        };
    }, [values, state.errors, state.touched, setFieldValue, setFieldTouched]);

    return {
        ...state,
        validateField,
        validateForm,
        setFieldValue,
        setFieldTouched,
        reset,
        submit,
        getFieldProps,
    };
}

// ============================================================================
// SIMPLE FORM VALIDATION HELPERS
// ============================================================================

export function validateRequired(value: unknown, fieldName: string): string | null {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `${fieldName} is required`;
    }
    return null;
}

export function validateEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }
    return null;
}

export function validatePhone(phone: string): string | null {
    const phoneRegex = /^(\+251|251|0)?[97]\d{8}$/;
    if (!phoneRegex.test(phone)) {
        return 'Please enter a valid Ethiopian phone number';
    }
    return null;
}

export function validateAmount(amount: string): string | null {
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
        return 'Please enter a valid amount greater than 0';
    }
    if (numAmount > 100000000) {
        return 'Amount cannot exceed 100,000,000 ETB';
    }
    return null;
}

export function validateDate(date: string): string | null {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return 'Please enter a valid date';
    }
    return null;
}

// ============================================================================
// COMPOSABLE VALIDATION RULES
// ============================================================================

export interface ValidationRule {
    field: string;
    validator: (value: unknown) => string | null;
    message?: string;
}

export function createValidator(rules: ValidationRule[]) {
    return (data: Record<string, unknown>): Record<string, string> => {
        const errors: Record<string, string> = {};

        rules.forEach(rule => {
            const error = rule.validator(data[rule.field]);
            if (error) {
                errors[rule.field] = error;
            }
        });

        return errors;
    };
}

// Common validation rules
export const commonValidationRules = {
    required: (field: string) => ({
        field,
        validator: (value: unknown) => validateRequired(value, field),
    }),

    email: (field: string) => ({
        field,
        validator: (value: unknown) => validateEmail(value as string),
    }),

    phone: (field: string) => ({
        field,
        validator: (value: unknown) => validatePhone(value as string),
    }),

    amount: (field: string) => ({
        field,
        validator: (value: unknown) => validateAmount(value as string),
    }),

    date: (field: string) => ({
        field,
        validator: (value: unknown) => validateDate(value as string),
    }),
};