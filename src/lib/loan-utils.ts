export interface AmortizationScheduleItem {
    period: number;
    payment: number;
    principal: number;
    interest: number;
    remainingBalance: number;
    date: string;
}

/**
 * Calculates simple interest for a given period.
 * Formula: I = P * r * t
 */
export const calculateSimpleInterest = (principal: number, annualRate: number, months: number): number => {
    return (principal * (annualRate / 100) * (months / 12));
};

/**
 * Generates an amortization schedule based on reducing balance (standard).
 * Even if the user asked for "simple interest", a breakdown usually implies 
 * monthly interest on the remaining principal.
 */
export const calculateLoanAmortization = (
    principal: number,
    annualRate: number,
    termMonths: number,
    startDate: string = new Date().toISOString()
): AmortizationScheduleItem[] => {
    if (termMonths <= 0) return [];

    const monthlyRate = annualRate / 12 / 100;

    // If interest rate is 0, it's just principal divided by months
    if (monthlyRate === 0) {
        const monthlyPayment = principal / termMonths;
        const schedule: AmortizationScheduleItem[] = [];
        const start = new Date(startDate);

        for (let i = 1; i <= termMonths; i++) {
            const paymentDate = new Date(start);
            paymentDate.setMonth(start.getMonth() + i);

            schedule.push({
                period: i,
                payment: monthlyPayment,
                principal: monthlyPayment,
                interest: 0,
                remainingBalance: principal - (monthlyPayment * i),
                date: paymentDate.toISOString()
            });
        }
        return schedule;
    }

    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);

    let remainingBalance = principal;
    const schedule: AmortizationScheduleItem[] = [];
    const start = new Date(startDate);

    for (let i = 1; i <= termMonths; i++) {
        const interest = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interest;
        remainingBalance -= principalPayment;

        const paymentDate = new Date(start);
        paymentDate.setMonth(start.getMonth() + i);

        schedule.push({
            period: i,
            payment: monthlyPayment,
            principal: principalPayment,
            interest: interest,
            remainingBalance: Math.max(0, remainingBalance),
            date: paymentDate.toISOString()
        });
    }

    return schedule;
};

/**
 * Calculates the total cost of the loan (Principal + Total Interest)
 */
export const calculateTotalLoanCost = (principal: number, annualRate: number, termMonths: number): number => {
    const schedule = calculateLoanAmortization(principal, annualRate, termMonths);
    return schedule.reduce((sum, item) => sum + item.payment, 0);
};
