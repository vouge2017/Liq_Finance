-- FinEthio Database Schema for Ethiopian Finance App
-- Designed for 100 Beta Users with RLS Security

-- 1. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  full_name TEXT NOT NULL,
  financial_goal TEXT,
  preferred_language TEXT DEFAULT 'en', -- 'en' or 'am' for Amharic
  calendar_mode TEXT DEFAULT 'gregorian', -- 'gregorian' or 'ethiopian'
  theme TEXT DEFAULT 'dark',
  privacy_mode BOOLEAN DEFAULT false,
  ai_consent BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACCOUNTS TABLE (Banks, Mobile Money, Cash)
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT NOT NULL, -- 'CBE', 'Dashen', 'Telebirr', 'Cash'
  type TEXT NOT NULL, -- 'Bank', 'Mobile Money', 'Cash'
  balance DECIMAL(15,2) DEFAULT 0,
  account_number TEXT,
  color TEXT,
  profile TEXT DEFAULT 'Personal', -- 'Personal', 'Family', 'Business'
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL, -- 'income', 'expense', 'transfer'
  category TEXT NOT NULL,
  icon TEXT,
  profile TEXT DEFAULT 'Personal',
  goal_id UUID,
  iqub_id UUID,
  iddir_id UUID,
  transaction_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BUDGET CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'fixed', 'variable'
  allocated DECIMAL(15,2) DEFAULT 0,
  icon TEXT,
  color TEXT,
  rollover_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 5. SAVINGS GOALS TABLE
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  icon TEXT,
  color TEXT,
  round_up_enabled BOOLEAN DEFAULT false,
  profile TEXT DEFAULT 'Personal',
  deadline DATE,
  default_account_id UUID REFERENCES public.accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. IQUBS TABLE (Ethiopian Rotating Savings)
CREATE TABLE IF NOT EXISTS public.iqubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  purpose TEXT,
  amount DECIMAL(15,2) NOT NULL,
  cycle TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  members INTEGER NOT NULL,
  current_round INTEGER DEFAULT 1,
  paid_rounds INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  my_turn_date DATE,
  payout_amount DECIMAL(15,2),
  status TEXT DEFAULT 'active', -- 'active', 'completed'
  next_payment_date DATE,
  has_won BOOLEAN DEFAULT false,
  winning_round INTEGER,
  profile TEXT DEFAULT 'Personal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. IDDIRS TABLE (Ethiopian Social Insurance)
CREATE TABLE IF NOT EXISTS public.iddirs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  monthly_contribution DECIMAL(15,2) NOT NULL,
  payment_date INTEGER, -- Day of month (1-31)
  last_paid_date DATE,
  status TEXT DEFAULT 'active',
  profile TEXT DEFAULT 'Family',
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_days_before INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RECURRING TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'ETB',
  category TEXT NOT NULL,
  recurrence TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'annual'
  next_due_date DATE NOT NULL,
  last_paid_date DATE,
  payment_method TEXT,
  is_active BOOLEAN DEFAULT true,
  profile TEXT DEFAULT 'Personal',
  icon TEXT,
  notes TEXT,
  reminder_days INTEGER[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INCOME SOURCES TABLE
CREATE TABLE IF NOT EXISTS public.income_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Salary', 'Business', 'Freelance', 'Rent', 'Iqub', 'Side Hustle', 'Other'
  amount DECIMAL(15,2),
  frequency TEXT, -- 'Monthly', 'Weekly', 'Bi-Weekly', 'Irregular'
  payday INTEGER, -- Day of month
  stability TEXT, -- 'Stable', 'Variable'
  remind_payday BOOLEAN DEFAULT false,
  linked_account_id UUID REFERENCES public.accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. FEEDBACK & BUG REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'bug', 'feature', 'general'
  title TEXT NOT NULL,
  description TEXT,
  screenshot_url TEXT,
  device_info JSONB,
  status TEXT DEFAULT 'new', -- 'new', 'in-progress', 'resolved'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AI CHAT HISTORY (Optional - for context)
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_user ON public.budget_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_iqubs_user ON public.iqubs(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
