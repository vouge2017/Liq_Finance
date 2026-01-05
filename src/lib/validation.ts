import { z } from 'zod';

// ============================================================================
// CORE VALIDATION SCHEMAS
// ============================================================================

// Phone number validation for Ethiopian numbers
const ethiopianPhoneSchema = z.string().regex(
    /^(\+251|251|0)?[97]\d{8}$/,
    'Please enter a valid Ethiopian phone number (e.g., +251911234567 or 0911234567)'
);

// Amount validation - positive numbers with reasonable limits
const amountSchema = z.number()
    .positive('Amount must be greater than 0')
    .max(100000000, 'Amount cannot exceed 100,000,000 ETB')
    .refine((val) => !isNaN(val), 'Please enter a valid number');

// Date validation - ISO format or future/past dates
const dateSchema = z.string().refine(
    (dateStr) => !isNaN(Date.parse(dateStr)),
    'Please enter a valid date'
);

// ============================================================================
// USER & AUTHENTICATION SCHEMAS
// ============================================================================

export const userProfileSchema = z.object({
    fullName: z.string()
        .min(2, 'Full name must be at least 2 characters')
        .max(50, 'Full name cannot exceed 50 characters')
        .optional(),
    phone: ethiopianPhoneSchema.optional(),
    financialGoal: z.string()
        .max(200, 'Financial goal cannot exceed 200 characters')
        .optional(),
    budgetStartDate: z.number()
        .min(1, 'Budget start date must be between 1-31')
        .max(31, 'Budget start date must be between 1-31')
        .optional(),
});

// ============================================================================
// ACCOUNT SCHEMAS
// ============================================================================

export const accountSchema = z.object({
    name: z.string()
        .min(1, 'Account name is required')
        .max(50, 'Account name cannot exceed 50 characters'),
    institution: z.enum(['CBE', 'Dashen', 'Telebirr', 'Cash', 'Other']),
    type: z.enum(['Bank', 'Mobile Money', 'Cash', 'Loan']),
    balance: z.number()
        .min(-1000000, 'Balance cannot be less than -1,000,000 ETB')
        .max(100000000, 'Balance cannot exceed 100,000,000 ETB'),
    color: z.string().regex(/^bg-/, 'Color must be a valid CSS class'),
});

export const createAccountSchema = accountSchema.extend({
    // Additional validation for creation
    name: z.string()
        .min(1, 'Account name is required')
        .max(50, 'Account name cannot exceed 50 characters')
        .refine(
            (name) => !['cash', 'default'].includes(name.toLowerCase()),
            'Please choose a more specific account name'
        ),
});

// ============================================================================
// TRANSACTION SCHEMAS
// ============================================================================

export const transactionSchema = z.object({
    title: z.string()
        .min(1, 'Transaction title is required')
        .max(100, 'Title cannot exceed 100 characters'),
    amount: amountSchema,
    type: z.enum(['income', 'expense', 'transfer']),
    category: z.string()
        .min(1, 'Category is required')
        .max(50, 'Category cannot exceed 50 characters'),
    date: dateSchema,
    accountId: z.string().optional(),
    profile: z.enum(['Personal', 'Family', 'Business']).default('Personal'),
});

export const createTransactionSchema = transactionSchema.extend({
    // Enhanced validation for transaction creation
    title: z.string()
        .min(1, 'Transaction title is required')
        .max(100, 'Title cannot exceed 100 characters')
        .refine(
            (title) => !title.match(/[<>]/g),
            'Title cannot contain HTML tags'
        ),
    amount: amountSchema,
    category: z.string()
        .min(1, 'Category is required')
        .max(50, 'Category cannot exceed 50 characters')
        .refine(
            (category) => !category.match(/[<>]/g),
            'Category cannot contain HTML tags'
        ),
});

// ============================================================================
// BUDGET SCHEMAS
// ============================================================================

export const budgetCategorySchema = z.object({
    name: z.string()
        .min(1, 'Category name is required')
        .max(50, 'Category name cannot exceed 50 characters'),
    type: z.enum(['fixed', 'variable']),
    allocated: amountSchema,
    icon: z.string().max(20, 'Icon identifier too long').optional(),
    color: z.string().regex(/^bg-/, 'Color must be a valid CSS class').optional(),
    rolloverEnabled: z.boolean().optional(),
});

export const createBudgetCategorySchema = budgetCategorySchema.extend({
    name: z.string()
        .min(1, 'Category name is required')
        .max(50, 'Category name cannot exceed 50 characters')
        .refine(
            (name) => !['other', 'uncategorized'].includes(name.toLowerCase()),
            'Please choose a more specific category name'
        ),
});

// ============================================================================
// SAVINGS GOAL SCHEMAS
// ============================================================================

export const savingsGoalSchema = z.object({
    title: z.string()
        .min(1, 'Goal title is required')
        .max(100, 'Title cannot exceed 100 characters'),
    targetAmount: amountSchema,
    currentAmount: z.number()
        .min(0, 'Current amount cannot be negative')
        .max(100000000, 'Current amount cannot exceed 100,000,000 ETB'),
    icon: z.string().max(20, 'Icon identifier too long').optional(),
    color: z.string().regex(/^bg-/, 'Color must be a valid CSS class').optional(),
    deadline: dateSchema.optional(),
    profile: z.enum(['Personal', 'Family', 'Business']).default('Personal'),
});

export const contributeToGoalSchema = z.object({
    goalId: z.string().min(1, 'Goal ID is required'),
    amount: amountSchema,
    fromAccountId: z.string().min(1, 'Account selection is required'),
});

// ============================================================================
// FORM-SPECIFIC SCHEMAS
// ============================================================================

// Transaction Form Schema (with all form fields)
export const transactionFormSchema = z.object({
    amount: z.string()
        .min(1, 'Amount is required')
        .refine(
            (val) => !isNaN(parseFloat(val.replace(/,/g, ''))),
            'Please enter a valid amount'
        ),
    title: z.string()
        .min(1, 'Title is required')
        .max(100, 'Title cannot exceed 100 characters'),
    type: z.enum(['income', 'expense']),
    category: z.string().min(1, 'Category is required'),
    accountId: z.string().min(1, 'Account selection is required'),
    date: z.string().min(1, 'Date is required'),
});

// Account Form Schema
export const accountFormSchema = z.object({
    name: z.string()
        .min(1, 'Account name is required')
        .max(50, 'Account name cannot exceed 50 characters'),
    institution: z.enum(['CBE', 'Dashen', 'Telebirr', 'Cash', 'Other']),
    type: z.enum(['Bank', 'Mobile Money', 'Cash', 'Loan']),
    balance: z.string()
        .min(1, 'Balance is required')
        .refine(
            (val) => !isNaN(parseFloat(val.replace(/,/g, ''))),
            'Please enter a valid balance'
        ),
    color: z.string().regex(/^bg-/, 'Please select a valid color'),
});

// Budget Category Form Schema
export const budgetCategoryFormSchema = z.object({
    name: z.string()
        .min(1, 'Category name is required')
        .max(50, 'Category name cannot exceed 50 characters'),
    allocated: z.string()
        .min(1, 'Allocated amount is required')
        .refine(
            (val) => !isNaN(parseFloat(val.replace(/,/g, ''))),
            'Please enter a valid amount'
        ),
    type: z.enum(['fixed', 'variable']),
    icon: z.string().optional(),
    color: z.string().regex(/^bg-/, 'Please select a valid color').optional(),
    rolloverEnabled: z.boolean().optional(),
});

// Savings Goal Form Schema
export const savingsGoalFormSchema = z.object({
    title: z.string()
        .min(1, 'Goal title is required')
        .max(100, 'Title cannot exceed 100 characters'),
    targetAmount: z.string()
        .min(1, 'Target amount is required')
        .refine(
            (val) => !isNaN(parseFloat(val.replace(/,/g, ''))),
            'Please enter a valid amount'
        ),
    deadline: z.string().optional(),
    color: z.string().regex(/^bg-/, 'Please select a valid color').optional(),
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: Record<string, string[]>;
}

export function validateFormData<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): ValidationResult<T> {
    try {
        const validatedData = schema.parse(data);
        return {
            success: true,
            data: validatedData,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: Record<string, string[]> = {};
            (error as z.ZodError).issues.forEach((err) => {
                const path = err.path.join('.');
                if (!errors[path]) {
                    errors[path] = [];
                }
                errors[path].push(err.message);
            });
            return {
                success: false,
                errors,
            };
        }
        return {
            success: false,
            errors: { general: ['Validation failed'] },
        };
    }
}

// Format validation errors for display
export function formatValidationErrors(errors: Record<string, string[]>): Record<string, string> {
    const formatted: Record<string, string> = {};
    Object.entries(errors).forEach(([field, messages]) => {
        formatted[field] = messages[0]; // Take first error message
    });
    return formatted;
}

// ============================================================================
// COMPLEX VALIDATION SCENARIOS
// ============================================================================

// Transfer validation - ensure from and to accounts are different
export const transferSchema = z.object({
    fromAccountId: z.string().min(1, 'Source account is required'),
    toAccountId: z.string().min(1, 'Destination account is required'),
    amount: amountSchema,
}).refine(
    (data) => data.fromAccountId !== data.toAccountId,
    {
        message: 'Source and destination accounts must be different',
        path: ['toAccountId'],
    }
);

// Goal contribution validation - ensure sufficient balance
export const goalContributionSchema = contributeToGoalSchema.extend({
    // This would need account context to validate sufficient balance
    // For now, just basic validation
});

// ============================================================================
// EXPORT ALL SCHEMAS
// ============================================================================

export const schemas = {
    userProfile: userProfileSchema,
    account: accountSchema,
    createAccount: createAccountSchema,
    transaction: transactionSchema,
    createTransaction: createTransactionSchema,
    budgetCategory: budgetCategorySchema,
    createBudgetCategory: createBudgetCategorySchema,
    savingsGoal: savingsGoalSchema,
    contributeToGoal: contributeToGoalSchema,
    transfer: transferSchema,

    // Form schemas
    transactionForm: transactionFormSchema,
    accountForm: accountFormSchema,
    budgetCategoryForm: budgetCategoryFormSchema,
    savingsGoalForm: savingsGoalFormSchema,
} as const;
