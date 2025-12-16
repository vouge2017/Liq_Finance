import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    // Get from localStorage or use initial value
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (!item || item === "undefined") return initialValue;
            const parsed = JSON.parse(item);
            return parsed !== null && parsed !== undefined ? parsed : initialValue;
        } catch (error) {
            console.error(`Error loading ${key} from localStorage:`, error);
            return initialValue;
        }
    });

    // Save to localStorage whenever value changes
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
        }
    };

    return [storedValue, setValue] as const;
}
