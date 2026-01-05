/**
 * Tests for the local voice processing service
 */

import { parseTranscript } from '../local-voice-service'

describe('Local Voice Service', () => {
    describe('parseTranscript', () => {
        it('should parse English expense transaction', () => {
            const result = parseTranscript('Paid 150 birr for lunch')

            expect(result.type).toBe('expense')
            expect(result.amount).toBe(150)
            expect(result.category).toBe('Food')
            expect(result.title).toBe('For lunch')
            expect(result.confidence).toBeGreaterThan(0.5)
        })

        it('should parse Amharic expense transaction', () => {
            const result = parseTranscript('ከፈልኩ 150 ብር ለምግብ')

            expect(result.type).toBe('expense')
            expect(result.amount).toBe(150)
            expect(result.category).toBe('Food')
            expect(result.confidence).toBeGreaterThan(0.5)
        })

        it('should parse English income transaction', () => {
            const result = parseTranscript('Received 5000 birr from salary')

            expect(result.type).toBe('income')
            expect(result.amount).toBe(5000)
            expect(result.category).toBe('Salary')
            expect(result.confidence).toBeGreaterThan(0.5)
        })

        it('should parse Amharic income transaction', () => {
            const result = parseTranscript('ቀንሰኩ 5000 ብር ከמשכורת')

            expect(result.type).toBe('income')
            expect(result.amount).toBe(5000)
            expect(result.category).toBe('Salary')
            expect(result.confidence).toBeGreaterThan(0.5)
        })

        it('should handle mixed language input', () => {
            const result = parseTranscript('ከፈልኩ 200 birr for taxi')

            expect(result.type).toBe('expense')
            expect(result.amount).toBe(200)
            expect(result.category).toBe('Transport')
            expect(result.confidence).toBeGreaterThan(0.5)
        })

        it('should handle today date', () => {
            const today = new Date().toISOString().split('T')[0]
            const result = parseTranscript('Paid 100 birr today')

            expect(result.date).toBe(today)
        })

        it('should handle yesterday date', () => {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split('T')[0]

            const result = parseTranscript('Paid 100 birr yesterday')

            expect(result.date).toBe(yesterdayStr)
        })

        it('should default to expense when unclear', () => {
            const result = parseTranscript('Something happened')

            expect(result.type).toBe('expense')
            expect(result.confidence).toBe(0.5)
        })

        it('should handle amount extraction with commas', () => {
            const result = parseTranscript('Paid 1,500 birr for rent')

            expect(result.amount).toBe(1500)
            expect(result.category).toBe('Rent')
        })

        it('should handle decimal amounts', () => {
            const result = parseTranscript('Paid 150.50 birr for coffee')

            expect(result.amount).toBe(150.5)
            expect(result.category).toBe('Food')
        })

        it('should categorize transport correctly', () => {
            const result = parseTranscript('Taxi to Bole 120 birr')

            expect(result.category).toBe('Transport')
            expect(result.amount).toBe(120)
        })

        it('should categorize utilities correctly', () => {
            const result = parseTranscript('Paid electricity bill 300 birr')

            expect(result.category).toBe('Utilities')
            expect(result.amount).toBe(300)
        })

        it('should generate title from description', () => {
            const result = parseTranscript('Paid 150 birr for lunch at restaurant')

            expect(result.title).toBe('For lunch at restaurant')
        })

        it('should handle empty description', () => {
            const result = parseTranscript('150')

            expect(result.amount).toBe(150)
            expect(result.title).toBe('Transaction (150 ETB)')
        })
    })
})