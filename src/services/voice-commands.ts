/**
 * Voice Command Recognition System
 * Handles voice commands for controlling the voice interface
 */

export interface VoiceCommand {
    command: string
    aliases: string[]
    action: string
    description: string
    requiresConfirmation?: boolean
    parameters?: string[]
}

export interface CommandResult {
    success: boolean
    action: string
    parameters?: any
    message: string
    requiresConfirmation?: boolean
}

export class VoiceCommandRecognition {
    private commands: VoiceCommand[] = []
    private isListening: boolean = false
    private recognition: any = null

    constructor() {
        this.initializeCommands()
    }

    private initializeCommands() {
        this.commands = [
            // Recording Control Commands
            {
                command: 'start recording',
                aliases: ['begin recording', 'start', 'record', 'begin'],
                action: 'start_recording',
                description: 'Start voice recording'
            },
            {
                command: 'stop recording',
                aliases: ['stop', 'end recording', 'finish', 'cancel'],
                action: 'stop_recording',
                description: 'Stop voice recording'
            },
            {
                command: 'pause recording',
                aliases: ['pause', 'hold on', 'wait'],
                action: 'pause_recording',
                description: 'Pause voice recording'
            },

            // Transaction Commands
            {
                command: 'cancel transaction',
                aliases: ['cancel', 'discard', 'delete transaction'],
                action: 'cancel_transaction',
                description: 'Cancel current transaction'
            },
            {
                command: 'confirm transaction',
                aliases: ['confirm', 'save transaction', 'accept'],
                action: 'confirm_transaction',
                description: 'Confirm and save transaction'
            },
            {
                command: 'edit transaction',
                aliases: ['edit', 'modify', 'change'],
                action: 'edit_transaction',
                description: 'Edit transaction details'
            },

            // Navigation Commands
            {
                command: 'help',
                aliases: ['what can I say', 'commands', 'instructions'],
                action: 'show_help',
                description: 'Show available voice commands'
            },
            {
                command: 'close',
                aliases: ['exit', 'quit', 'close modal'],
                action: 'close_modal',
                description: 'Close voice recording modal'
            },

            // Transaction Type Commands
            {
                command: 'income transaction',
                aliases: ['income', 'received money', 'got paid'],
                action: 'set_transaction_type',
                description: 'Set transaction type to income',
                parameters: ['income']
            },
            {
                command: 'expense transaction',
                aliases: ['expense', 'paid money', 'spent'],
                action: 'set_transaction_type',
                description: 'Set transaction type to expense',
                parameters: ['expense']
            },
            {
                command: 'transfer transaction',
                aliases: ['transfer', 'moved money'],
                action: 'set_transaction_type',
                description: 'Set transaction type to transfer',
                parameters: ['transfer']
            },

            // Amount Commands
            {
                command: 'amount',
                aliases: ['set amount', 'change amount'],
                action: 'set_amount',
                description: 'Set transaction amount',
                parameters: ['number']
            },

            // Category Commands
            {
                command: 'category',
                aliases: ['set category', 'change category'],
                action: 'set_category',
                description: 'Set transaction category',
                parameters: ['category_name']
            }
        ]
    }

    async processVoiceCommand(transcript: string): Promise<CommandResult> {
        const normalizedTranscript = transcript.toLowerCase().trim()

        // Check for exact matches first
        for (const command of this.commands) {
            if (this.matchesCommand(normalizedTranscript, command)) {
                return this.executeCommand(command, normalizedTranscript)
            }
        }

        // Check for partial matches
        for (const command of this.commands) {
            if (this.matchesPartial(normalizedTranscript, command)) {
                return this.executeCommand(command, normalizedTranscript)
            }
        }

        return {
            success: false,
            action: 'unknown_command',
            message: 'Sorry, I didn\'t understand that command. Say "help" for available commands.'
        }
    }

    private matchesCommand(transcript: string, command: VoiceCommand): boolean {
        // Check main command
        if (transcript.includes(command.command)) {
            return true
        }

        // Check aliases
        for (const alias of command.aliases) {
            if (transcript.includes(alias)) {
                return true
            }
        }

        return false
    }

    private matchesPartial(transcript: string, command: VoiceCommand): boolean {
        // Simple partial matching for common phrases
        const commonPhrases = [
            'start', 'stop', 'pause', 'cancel', 'confirm', 'edit', 'help', 'close',
            'income', 'expense', 'transfer', 'amount', 'category'
        ]

        for (const phrase of commonPhrases) {
            if (transcript.includes(phrase)) {
                return this.matchesCommand(transcript, command)
            }
        }

        return false
    }

    private executeCommand(command: VoiceCommand, transcript: string): CommandResult {
        switch (command.action) {
            case 'start_recording':
                return {
                    success: true,
                    action: 'start_recording',
                    message: 'Starting voice recording...'
                }

            case 'stop_recording':
                return {
                    success: true,
                    action: 'stop_recording',
                    message: 'Stopping voice recording...'
                }

            case 'pause_recording':
                return {
                    success: true,
                    action: 'pause_recording',
                    message: 'Pausing voice recording...'
                }

            case 'cancel_transaction':
                return {
                    success: true,
                    action: 'cancel_transaction',
                    message: 'Cancelling current transaction...'
                }

            case 'confirm_transaction':
                return {
                    success: true,
                    action: 'confirm_transaction',
                    message: 'Confirming transaction...'
                }

            case 'edit_transaction':
                return {
                    success: true,
                    action: 'edit_transaction',
                    message: 'Opening transaction editor...'
                }

            case 'show_help':
                return {
                    success: true,
                    action: 'show_help',
                    message: this.getHelpText()
                }

            case 'close_modal':
                return {
                    success: true,
                    action: 'close_modal',
                    message: 'Closing voice recording...'
                }

            case 'set_transaction_type':
                const type = this.extractTransactionType(transcript)
                return {
                    success: true,
                    action: 'set_transaction_type',
                    parameters: { type },
                    message: `Setting transaction type to ${type}...`
                }

            case 'set_amount':
                const amount = this.extractAmount(transcript)
                return {
                    success: true,
                    action: 'set_amount',
                    parameters: { amount },
                    message: amount ? `Setting amount to ${amount}...` : 'Please specify an amount.'
                }

            case 'set_category':
                const category = this.extractCategory(transcript)
                return {
                    success: true,
                    action: 'set_category',
                    parameters: { category },
                    message: category ? `Setting category to ${category}...` : 'Please specify a category.'
                }

            default:
                return {
                    success: false,
                    action: 'unknown_action',
                    message: 'Command not recognized.'
                }
        }
    }

    private extractTransactionType(transcript: string): string | null {
        if (transcript.includes('income') || transcript.includes('received') || transcript.includes('got paid')) {
            return 'income'
        } else if (transcript.includes('expense') || transcript.includes('paid') || transcript.includes('spent')) {
            return 'expense'
        } else if (transcript.includes('transfer') || transcript.includes('moved')) {
            return 'transfer'
        }
        return null
    }

    private extractAmount(transcript: string): number | null {
        const amountPattern = /(\d+(?:\.\d+)?)/
        const match = transcript.match(amountPattern)
        if (match) {
            return parseFloat(match[1])
        }
        return null
    }

    private extractCategory(transcript: string): string | null {
        const categories = [
            'food', 'groceries', 'transport', 'utilities', 'rent', 'salary',
            'entertainment', 'healthcare', 'education', 'shopping', 'other'
        ]

        for (const category of categories) {
            if (transcript.includes(category)) {
                return category
            }
        }
        return null
    }

    private getHelpText(): string {
        const commands = this.commands.map(c => `- ${c.command} (${c.aliases.join(', ')})`).join('\n')
        return `Available commands:\n${commands}\n\nYou can also say transaction descriptions like "I spent 150 birr on lunch".`
    }

    // Voice command recognition with Speech Recognition API
    startCommandRecognition(onCommand: (result: CommandResult) => void) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

        if (!SpeechRecognition) {
            onCommand({
                success: false,
                action: 'speech_unsupported',
                message: 'Speech recognition not supported in this browser.'
            })
            return
        }

        this.recognition = new SpeechRecognition()
        this.recognition.continuous = false
        this.recognition.interimResults = false
        this.recognition.lang = 'en-US'

        this.recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript
            const result = await this.processVoiceCommand(transcript)
            onCommand(result)
        }

        this.recognition.onerror = (event: any) => {
            onCommand({
                success: false,
                action: 'recognition_error',
                message: `Speech recognition error: ${event.error}`
            })
        }

        this.recognition.start()
        this.isListening = true
    }

    stopCommandRecognition() {
        if (this.recognition && this.isListening) {
            this.recognition.stop()
            this.isListening = false
        }
    }

    // Get available commands for display
    getAvailableCommands(): VoiceCommand[] {
        return this.commands
    }

    // Check if transcript contains a command
    containsCommand(transcript: string): boolean {
        const normalized = transcript.toLowerCase()
        return this.commands.some(command => this.matchesCommand(normalized, command))
    }
}

/**
 * Voice Command Manager
 * Manages voice command recognition and integration with the voice interface
 */
export class VoiceCommandManager {
    private commandRecognizer: VoiceCommandRecognition
    private onCommandCallback?: (result: CommandResult) => void

    constructor() {
        this.commandRecognizer = new VoiceCommandRecognition()
    }

    setCommandCallback(callback: (result: CommandResult) => void) {
        this.onCommandCallback = callback
    }

    async processTranscript(transcript: string): Promise<boolean> {
        // Check if transcript contains a command
        if (this.commandRecognizer.containsCommand(transcript)) {
            const result = await this.commandRecognizer.processVoiceCommand(transcript)

            if (this.onCommandCallback) {
                this.onCommandCallback(result)
            }

            return true // Command was processed
        }

        return false // Not a command, process as regular transaction
    }

    startListening(onCommand: (result: CommandResult) => void) {
        this.setCommandCallback(onCommand)
        this.commandRecognizer.startCommandRecognition(onCommand)
    }

    stopListening() {
        this.commandRecognizer.stopCommandRecognition()
    }

    getHelpText(): string {
        return this.commandRecognizer['getHelpText']()
    }
}