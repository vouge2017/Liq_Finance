/**
 * Consent Service Tests
 * Tests for consent validation, granting/revoking, and history tracking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase client
const mockSupabase = {
    from: vi.fn(() => ({
        select: vi.fn(() => ({
            eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
                    order: vi.fn(() => Promise.resolve({ data: [], error: null })),
                })),
                order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
        update: vi.fn(() => Promise.resolve({ data: null, error: null })),
        delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
};

vi.mock('../lib/supabase/client', () => ({
    createClient: vi.fn(() => mockSupabase),
}));

// Mock navigator for user agent
Object.defineProperty(global, 'navigator', {
    value: { userAgent: 'Mozilla/5.0 Test' },
    writable: true,
});

// Import after mocking
const { ConsentService, consentService } = await import('../consent-service');

describe('ConsentService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('getConsentTypes', () => {
        it('should return list of active consent types', async () => {
            const mockConsentTypes = [
                {
                    id: '1',
                    code: 'sms_parsing',
                    name: 'SMS Parsing',
                    description: 'Allow parsing of SMS messages',
                    category: 'data_processing',
                    legal_basis: 'consent',
                    required: true,
                    is_active: true,
                },
            ];

            mockSupabase.from.mockReturnValue({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        order: vi.fn(() => Promise.resolve({ data: mockConsentTypes, error: null })),
                    })),
                })),
            });

            const result = await consentService.getConsentTypes();

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(1);
            expect(result[0].code).toBe('sms_parsing');
        });

        it('should return empty array on error', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        order: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Error' } })),
                    })),
                })),
            });

            const result = await consentService.getConsentTypes();

            expect(result).toEqual([]);
        });
    });

    describe('validateConsent', () => {
        it('should return valid when consent is granted', async () => {
            const grantedAt = new Date().toISOString();

            // Mock consent_types query
            mockSupabase.from.mockImplementationOnce(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn(() => Promise.resolve({
                                data: {
                                    id: '1',
                                    code: 'sms_parsing',
                                    name: 'SMS Parsing',
                                    description: 'Allow parsing',
                                    category: 'data_processing',
                                    legal_basis: 'consent',
                                    required: true,
                                    is_active: true,
                                },
                                error: null,
                            })),
                        })),
                    })),
                })),
            }));

            // Mock user_consents query
            mockSupabase.from.mockImplementationOnce(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn(() => Promise.resolve({
                                    data: {
                                        granted: true,
                                        granted_at: grantedAt,
                                        consent_types: { code: 'sms_parsing' },
                                    },
                                    error: null,
                                })),
                            })),
                        })),
                    })),
                })),
            }));

            const result = await consentService.validateConsent('user-123', 'sms_parsing');

            expect(result.isValid).toBe(true);
            expect(result.granted).toBe(true);
        });

        it('should return invalid when consent type not found', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } })),
                        })),
                    })),
                })),
            });

            const result = await consentService.validateConsent('user-123', 'nonexistent');

            expect(result.isValid).toBe(false);
            expect(result.reason).toBe('Invalid consent type');
        });
    });

    describe('grantConsent', () => {
        it('should grant consent successfully', async () => {
            mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

            const result = await consentService.grantConsent('user-123', 'sms_parsing');

            expect(result).toBe(true);
            expect(mockSupabase.rpc).toHaveBeenCalled();
        });

        it('should return false when RPC fails', async () => {
            mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: 'RPC error' } });

            const result = await consentService.grantConsent('user-123', 'sms_parsing');

            expect(result).toBe(false);
        });
    });

    describe('withdrawConsent', () => {
        it('should withdraw consent successfully', async () => {
            mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

            const result = await consentService.withdrawConsent('user-123', 'sms_parsing', 'User requested');

            expect(result).toBe(true);
        });
    });

    describe('hasConsent', () => {
        it('should return true when user has granted consent', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn(() => Promise.resolve({
                                    data: {
                                        granted: true,
                                        consent_types: { code: 'sms_parsing' },
                                    },
                                    error: null,
                                })),
                            })),
                        })),
                    })),
                })),
            });

            const result = await consentService.hasConsent('user-123', 'sms_parsing');

            expect(result).toBe(true);
        });

        it('should return false when consent not granted', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn(() => Promise.resolve({
                                    data: { granted: false },
                                    error: null,
                                })),
                            })),
                        })),
                    })),
                })),
            });

            const result = await consentService.hasConsent('user-123', 'marketing');

            expect(result).toBe(false);
        });
    });

    describe('getConsentHistory', () => {
        it('should return consent history entries', async () => {
            const mockHistory = [
                {
                    id: 'h1',
                    user_consent_id: 'uc1',
                    user_id: 'user-123',
                    consent_type_id: 'ct-1',
                    consent_type: {
                        id: 'ct-1',
                        code: 'sms_parsing',
                        name: 'SMS Parsing',
                        description: 'Allow parsing',
                        category: 'data_processing',
                        legal_basis: 'consent',
                        required: true,
                        is_active: true,
                    },
                    action: 'granted',
                    old_value: null,
                    new_value: true,
                    method: 'explicit',
                    reason: null,
                    ip_address: null,
                    user_agent: null,
                    session_id: null,
                    created_at: '2024-01-01T00:00:00Z',
                },
            ];

            mockSupabase.from.mockReturnValue({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        order: vi.fn(() => ({
                            limit: vi.fn(() => Promise.resolve({ data: mockHistory, error: null })),
                        })),
                    })),
                })),
            });

            const result = await consentService.getConsentHistory('user-123');

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(1);
            expect(result[0].action).toBe('granted');
        });
    });

    describe('exportUserConsentData', () => {
        it('should export user consent data', async () => {
            mockSupabase.from.mockImplementation((table: string) => {
                if (table === 'user_consents') {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                order: vi.fn(() => Promise.resolve({ data: [], error: null })),
                            })),
                        })),
                    };
                }
                if (table === 'consent_history') {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                order: vi.fn(() => ({
                                    limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
                                })),
                            })),
                        })),
                    };
                }
                return mockSupabase.from(table);
            });

            const result = await consentService.exportUserConsentData('user-123');

            expect(result).toHaveProperty('consents');
            expect(result).toHaveProperty('history');
            expect(result).toHaveProperty('exportDate');
            expect(result.exportDate).toBeDefined();
        });
    });

    describe('deleteAllUserConsentData', () => {
        it('should delete all user consent data', async () => {
            mockSupabase.from.mockImplementation((table: string) => {
                if (table === 'consent_history') {
                    return {
                        delete: vi.fn(() => ({
                            eq: vi.fn(() => Promise.resolve({ error: null })),
                        })),
                    };
                }
                if (table === 'user_consents') {
                    return {
                        delete: vi.fn(() => ({
                            eq: vi.fn(() => Promise.resolve({ error: null })),
                        })),
                    };
                }
                return mockSupabase.from(table);
            });

            const result = await consentService.deleteAllUserConsentData('user-123');

            expect(result).toBe(true);
        });
    });
});