import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { useAppContext } from '@/context/AppContext';
import { SUBSCRIPTION_ICONS } from '../constants';
import { RecurringTransaction } from '@/types';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
    const { state, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction, showNotification, activeProfile } = useAppContext();
    const { recurringTransactions } = state;

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingSub, setEditingSub] = useState<RecurringTransaction | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [icon, setIcon] = useState(SUBSCRIPTION_ICONS[0].id);
    const [recurrence, setRecurrence] = useState<'weekly' | 'monthly' | 'quarterly' | 'annual'>('monthly');
    const [notes, setNotes] = useState('');
    const [reminders, setReminders] = useState<number[]>([1]);

    useEffect(() => {
        if (editingSub) {
            setName(editingSub.name);
            setAmount(editingSub.amount.toString());
            setDate(editingSub.next_due_date);
            setIcon(editingSub.icon);
            setRecurrence(editingSub.recurrence);
            setNotes(editingSub.notes || '');
            setReminders(editingSub.reminderDays || [1]);
            setShowAddForm(true);
        } else {
            resetForm();
        }
    }, [editingSub]);

    const resetForm = () => {
        setName('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setIcon(SUBSCRIPTION_ICONS[0].id);
        setRecurrence('monthly');
        setNotes('');
        setReminders([1]);
        setEditingSub(null);
    };

    const handleSave = () => {
        if (!name || !amount) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        const subData: RecurringTransaction = {
            id: editingSub?.id || Date.now().toString(),
            name,
            amount: parseFloat(amount),
            currency: 'ETB',
            category: 'Bills',
            recurrence,
            next_due_date: date,
            is_active: true,
            profile: activeProfile === 'All' ? 'Personal' : activeProfile,
            icon,
            notes,
            reminderDays: reminders,
            payment_method: 'Manual'
        };

        if (editingSub) {
            updateRecurringTransaction(subData);
        } else {
            addRecurringTransaction(subData);
        }

        setShowAddForm(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this subscription?')) {
            deleteRecurringTransaction(id);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                className="relative w-full max-w-lg bg-theme-card rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden animate-slide-up flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-theme-card/50 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black text-theme-primary tracking-tight">
                            {showAddForm ? (editingSub ? 'Edit Subscription' : 'New Subscription') : 'My Subscriptions'}
                        </h2>
                        <p className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest opacity-60">
                            {showAddForm ? 'Enter service details' : `${recurringTransactions.length} active services`}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            if (showAddForm) {
                                setShowAddForm(false);
                                setEditingSub(null);
                            } else {
                                onClose();
                            }
                        }}
                        className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-theme-secondary hover:bg-white/10 transition-colors"
                    >
                        <Icons.Close size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {!showAddForm ? (
                        <div className="space-y-4">
                            {recurringTransactions.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-4 text-theme-secondary opacity-20">
                                        <Icons.Recurring size={32} />
                                    </div>
                                    <p className="text-sm text-theme-secondary font-medium">No subscriptions recorded yet.</p>
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="mt-4 px-6 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl text-xs font-bold border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                                    >
                                        Add Your First
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 gap-3">
                                        {recurringTransactions.map(sub => {
                                            const iconObj = SUBSCRIPTION_ICONS.find(i => i.id === sub.icon) || SUBSCRIPTION_ICONS[0];
                                            return (
                                                <div
                                                    key={sub.id}
                                                    className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/[0.08] transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${iconObj.color} flex items-center justify-center text-white shadow-lg`}>
                                                            <iconObj.icon size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-theme-primary">{sub.name}</h4>
                                                            <p className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider">
                                                                {sub.amount.toLocaleString()} ETB • {sub.recurrence}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setEditingSub(sub)}
                                                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-theme-secondary hover:text-cyan-400 transition-colors"
                                                        >
                                                            <Icons.Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(sub.id)}
                                                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-theme-secondary hover:text-rose-400 transition-colors"
                                                        >
                                                            <Icons.Delete size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="w-full py-4 rounded-3xl border-2 border-dashed border-white/10 text-theme-secondary hover:border-cyan-500/30 hover:text-cyan-400 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                                    >
                                        <Icons.Plus size={18} /> Add New Subscription
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">Service Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="e.g. Netflix, Spotify, Gym"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-theme-primary outline-none focus:border-cyan-500/50 transition-colors"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">Amount (ETB)</label>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-theme-primary outline-none focus:border-cyan-500/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">Frequency</label>
                                        <select
                                            value={recurrence}
                                            onChange={e => setRecurrence(e.target.value as any)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-theme-primary outline-none focus:border-cyan-500/50 transition-colors appearance-none"
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="quarterly">Quarterly</option>
                                            <option value="annual">Annual</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">Next Due Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-theme-primary outline-none focus:border-cyan-500/50 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">Category Icon</label>
                                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                        {SUBSCRIPTION_ICONS.map(i => (
                                            <button
                                                key={i.id}
                                                onClick={() => setIcon(i.id)}
                                                className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${icon === i.id ? `bg-gradient-to-br ${i.color} text-white shadow-lg scale-110` : 'bg-white/5 text-theme-secondary hover:bg-white/10'}`}
                                            >
                                                <i.icon size={24} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">Notes (Optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Contract ID, specific plan, etc."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-theme-primary outline-none focus:border-cyan-500/50 transition-colors h-24 resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all"
                            >
                                {editingSub ? 'Update Subscription' : 'Save Subscription'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
