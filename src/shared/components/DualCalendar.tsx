import React from 'react';

interface DualCalendarProps {
    gregorianDate: string;
    ethiopianDate: string;
    className?: string;
}

export const DualCalendar: React.FC<DualCalendarProps> = ({
    gregorianDate,
    ethiopianDate,
    className = ''
}) => {
    return (
        <div className={`dual-calendar ${className}`}>
            <div className="gregorian">
                {gregorianDate}
            </div>
            <div className="ethiopian">
                {ethiopianDate}
            </div>
        </div>
    );
};

// Ethiopian Calendar Helper Functions
export const getEthiopianDate = (date: Date): string => {
    // Simplified Ethiopian calendar conversion
    // In a real app, you'd use a proper Ethiopian calendar library
    const ethiopianMonths = [
        'መስከረም', 'ትንባላ', 'ሚያዚያ', 'ሚያዚያ', 'ግንቦት', 'ሰኔ',
        'ሐምሌ', 'ነሐሴ', 'ጳጉሜ', 'ጥቅምቲ', 'ኅዳር', 'ታህሳስ'
    ];

    const day = date.getDate();
    const month = ethiopianMonths[date.getMonth()];
    const year = date.getFullYear() - 8; // Approximate Ethiopian year

    return `${month} ${day}, ${year}`;
};

export const formatDualDate = (date: Date): { gregorian: string; ethiopian: string } => {
    const gregorian = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const ethiopian = getEthiopianDate(date);

    return { gregorian, ethiopian };
};

// Ethiopian Holidays
export const ETHIOPIAN_HOLIDAYS = {
    'ገና': 'Christmas',
    'ጥምቀት': 'Epiphany',
    'ፋሲካ': 'Easter',
    'ሰንበት': 'Sunday',
    'የእግዚአብሔር ማርያም': 'Good Friday'
};

export default DualCalendar;