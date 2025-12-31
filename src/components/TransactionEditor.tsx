/**
 * Transaction Editor Component
 * Allows users to edit, update, and complete missing transaction information
 * with smart suggestions and validation
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../shared/components/ui/card'
import { Button } from '../shared/components/ui/button'
import { Input } from '../shared/components/ui/input'
import { Label } from '../shared/components/ui/label'
import { Textarea } from '../shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../shared/components/ui/select'
import { Badge } from '../shared/components/ui/badge'
import { Alert, AlertDescription } from '../shared/components/ui/alert'
import {
    createTransactionFromSMS,
    startEditSession,
    applyTransactionChange,
    completeTransaction,
    TransactionEdit,
    ProcessedTransaction,
    TransactionSuggestion,
    ValidationError
} from '../lib/transaction-editor'
import { useToast } from '../hooks/use-toast'

interface TransactionEditorProps {
    smsText?: string
    transaction?: ProcessedTransaction
    onSave?: (transaction: ProcessedTransaction) => void
    onCancel?: () => void
    userId: string
}

export function TransactionEditor({
    smsText,
    transaction,
    onSave,
    onCancel,
    userId
}: TransactionEditorProps) {
    const [edit, setEdit] = useState<TransactionEdit | null>(null)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [editedTransaction, setEditedTransaction] = useState<ProcessedTransaction | null>(null)
    const [activeField, setActiveField] = useState<keyof ProcessedTransaction | null>(null)
    const [customSuggestions, setCustomSuggestions] = useState<Record<string, string>>({})
    const { toast } = useToast()

    useEffect(() => {
        if (smsText) {
            const newEdit = createTransactionFromSMS(smsText)
            if (newEdit) {
                setEdit(newEdit)
                setEditedTransaction(newEdit.originalTransaction)
                const session = startEditSession(newEdit.originalTransaction.id, userId)
                setSessionId(session.id)
            }
        } else if (transaction) {
            setEditedTransaction(transaction)
        }
    }, [smsText, transaction, userId])

    const handleFieldChange = (
        field: keyof ProcessedTransaction,
        value: any,
        reason: string = 'User edit'
    ) => {
        if (!sessionId || !editedTransaction) return

        const updatedTransaction = {
            ...editedTransaction,
            [field]: value
        }

        setEditedTransaction(updatedTransaction)

        // Apply change to edit session
        const updatedEdit = applyTransactionChange(sessionId, field, value, reason)
        if (updatedEdit) {
            setEdit(updatedEdit)
        }
    }

    const applySuggestion = (suggestion: TransactionSuggestion) => {
        if (!editedTransaction) return

        handleFieldChange(suggestion.field, suggestion.suggestedValue, `Applied ${suggestion.type} suggestion`)

        toast({
            title: "Suggestion Applied",
            description: `${suggestion.field} updated with: ${suggestion.suggestedValue}`,
        })
    }

    const handleComplete = () => {
        if (!edit || !editedTransaction) return

        const completionData: Partial<ProcessedTransaction> = {
            ...customSuggestions
        }

        const completedEdit = completeTransaction(edit, completionData)

        if (completedEdit.validationErrors.length === 0) {
            onSave?.(completedEdit.originalTransaction)
            toast({
                title: "Transaction Saved",
                description: "Transaction has been successfully saved with all information completed.",
            })
        } else {
            toast({
                title: "Validation Issues",
                description: "Please resolve validation errors before saving.",
                variant: "destructive"
            })
        }
    }

    const getFieldError = (field: keyof ProcessedTransaction): ValidationError | undefined => {
        return edit?.validationErrors.find(error => error.field === field)
    }

    const getSuggestionForField = (field: keyof ProcessedTransaction): TransactionSuggestion | undefined => {
        return edit?.suggestions.find(suggestion => suggestion.field === field)
    }

    const renderField = (
        field: keyof ProcessedTransaction,
        label: string,
        type: 'text' | 'number' | 'textarea' | 'select' = 'text',
        options?: string[]
    ) => {
        const value = editedTransaction?.[field] || ''
        const error = getFieldError(field)
        const suggestion = getSuggestionForField(field)
        const isActive = activeField === field

        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor={field} className="text-sm font-medium">
                        {label}
                        {error && (
                            <Badge variant="destructive" className="ml-2">
                                {error.severity}
                            </Badge>
                        )}
                    </Label>
                    {suggestion && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applySuggestion(suggestion)}
                            className="text-xs"
                        >
                            Use: {suggestion.suggestedValue}
                        </Button>
                    )}
                </div>

                {type === 'textarea' ? (
                    <Textarea
                        id={field}
                        value={value}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        onFocus={() => setActiveField(field)}
                        onBlur={() => setActiveField(null)}
                        className={error ? 'border-red-500' : ''}
                        placeholder={`Enter ${label.toLowerCase()}`}
                    />
                ) : type === 'select' && options ? (
                    <Select
                        value={value}
                        onValueChange={(value) => handleFieldChange(field, value)}
                    >
                        <SelectTrigger className={error ? 'border-red-500' : ''}>
                            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                        id={field}
                        type={type}
                        value={value}
                        onChange={(e) => handleFieldChange(
                            field,
                            type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                        )}
                        onFocus={() => setActiveField(field)}
                        onBlur={() => setActiveField(null)}
                        className={error ? 'border-red-500' : ''}
                        placeholder={`Enter ${label.toLowerCase()}`}
                    />
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                )}

                {suggestion && (
                    <Alert>
                        <AlertDescription>
                            💡 {suggestion.description}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        )
    }

    if (!editedTransaction) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">
                        <p className="text-muted-foreground">No transaction data available</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Transaction Editor</span>
                        <div className="flex items-center space-x-2">
                            <Badge variant={editedTransaction.confidence > 0.8 ? 'default' : 'secondary'}>
                                {Math.round(editedTransaction.confidence * 100)}% confidence
                            </Badge>
                            {editedTransaction.language && (
                                <Badge variant="outline">
                                    {editedTransaction.language.toUpperCase()}
                                </Badge>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>
            </Card>

            {/* Main Transaction Form */}
            <Card>
                <CardContent className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderField('amount', 'Amount', 'number')}
                        {renderField('bank', 'Bank', 'select', [
                            'CBE', 'Telebirr', 'Dashen', 'Awash',
                            'NIB', 'Lion', 'Zemen', 'Cooperative'
                        ])}
                        {renderField('type', 'Type', 'select', [
                            'expense', 'income', 'transfer'
                        ])}
                        {renderField('date', 'Date', 'text')}
                        {renderField('reference', 'Reference/ID')}
                        {renderField('balance', 'Balance', 'number')}
                    </div>

                    {/* Merchant and Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderField('merchant', 'Merchant/Store')}
                        {renderField('location', 'Location')}
                    </div>

                    {/* Category and Reason */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderField('category', 'Category', 'select', [
                            'Food', 'Transport', 'Bills', 'Shopping',
                            'Entertainment', 'Health', 'Education',
                            'Cash', 'Transfer', 'Other'
                        ])}
                        {renderField('transactionReason', 'Reason/Purpose')}
                    </div>

                    {/* Notes */}
                    {renderField('notes', 'Additional Notes', 'textarea')}

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2">
                            {editedTransaction.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Smart Suggestions Panel */}
            {edit?.suggestions && edit.suggestions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Smart Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {edit.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="space-y-1">
                                    <div className="font-medium">{suggestion.field}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {suggestion.description}
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {suggestion.confidence}% confident
                                    </Badge>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => applySuggestion(suggestion)}
                                >
                                    Apply
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Validation Summary */}
            {edit?.validationErrors && edit.validationErrors.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-destructive">Validation Issues</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {edit.validationErrors.map((error, index) => (
                            <Alert key={index} variant={error.severity === 'error' ? 'destructive' : 'default'}>
                                <AlertDescription>
                                    <strong>{error.field}:</strong> {error.message}
                                </AlertDescription>
                            </Alert>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3">
                {onCancel && (
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button
                    onClick={handleComplete}
                    disabled={edit?.validationErrors.some(e => e.severity === 'error')}
                >
                    Save Transaction
                </Button>
            </div>

            {/* Raw SMS Text (for debugging) */}
            {editedTransaction.rawText && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Original SMS</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="text-xs bg-muted p-3 rounded-md whitespace-pre-wrap">
                            {editedTransaction.rawText}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default TransactionEditor