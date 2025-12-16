import { Coffee, Sun, Car, Utensils, ShoppingCart, Film, Moon } from "lucide-react"

export interface SmartSuggestion {
    id: string
    label: string
    category: string
    amount?: string
    icon: any
}

export const getSmartSuggestions = (): SmartSuggestion[] => {
    const hour = new Date().getHours()

    // Morning (5 AM - 11 AM)
    if (hour >= 5 && hour < 11) {
        return [
            { id: "coffee", label: "Coffee", category: "Food", amount: "50", icon: Coffee },
            { id: "breakfast", label: "Breakfast", category: "Food", amount: "150", icon: Sun },
            { id: "transport", label: "Transport", category: "Transport", amount: "30", icon: Car },
        ]
    }

    // Lunch (11 AM - 2 PM)
    if (hour >= 11 && hour < 14) {
        return [
            { id: "lunch", label: "Lunch", category: "Food", amount: "200", icon: Utensils },
            { id: "transport", label: "Transport", category: "Transport", amount: "30", icon: Car },
            { id: "coffee", label: "Coffee", category: "Food", amount: "50", icon: Coffee },
        ]
    }

    // Afternoon (2 PM - 5 PM)
    if (hour >= 14 && hour < 17) {
        return [
            { id: "snack", label: "Snack", category: "Food", amount: "100", icon: Coffee },
            { id: "transport", label: "Transport", category: "Transport", amount: "30", icon: Car },
            { id: "groceries", label: "Groceries", category: "Groceries", amount: "500", icon: ShoppingCart },
        ]
    }

    // Evening (5 PM - 10 PM)
    if (hour >= 17 && hour < 22) {
        return [
            { id: "dinner", label: "Dinner", category: "Food", amount: "300", icon: Utensils },
            { id: "groceries", label: "Groceries", category: "Groceries", amount: "500", icon: ShoppingCart },
            { id: "transport", label: "Transport", category: "Transport", amount: "50", icon: Car },
        ]
    }

    // Night (10 PM - 5 AM)
    return [
        { id: "entertainment", label: "Fun", category: "Entertainment", amount: "500", icon: Film },
        { id: "taxi", label: "Taxi", category: "Transport", amount: "300", icon: Car },
        { id: "snack", label: "Late Snack", category: "Food", amount: "150", icon: Moon },
    ]
}
