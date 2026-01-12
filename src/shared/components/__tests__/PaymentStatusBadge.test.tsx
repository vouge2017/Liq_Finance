import { render, screen } from '@testing-library/react';
import { PaymentStatusBadge } from '../PaymentStatusBadge';
import { describe, it, expect } from 'vitest';

describe('PaymentStatusBadge', () => {
    it('renders paid status correctly', () => {
        render(<PaymentStatusBadge status="paid" />);
        expect(screen.getByText(/PAID/i)).toBeDefined();
    });

    it('renders due-soon status with days', () => {
        render(<PaymentStatusBadge status="due-soon" daysUntilDue={5} />);
        expect(screen.getByText(/DUE IN 5D/i)).toBeDefined();
    });

    it('renders overdue status', () => {
        render(<PaymentStatusBadge status="overdue" />);
        expect(screen.getByText(/OVERDUE/i)).toBeDefined();
    });

    it('renders pending status', () => {
        render(<PaymentStatusBadge status="pending" />);
        expect(screen.getByText(/PENDING/i)).toBeDefined();
    });
});
