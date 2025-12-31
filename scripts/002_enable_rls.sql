-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iqubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iddirs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- ACCOUNTS POLICIES
CREATE POLICY "accounts_select_own" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "accounts_insert_own" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "accounts_update_own" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "accounts_delete_own" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- TRANSACTIONS POLICIES
CREATE POLICY "transactions_select_own" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert_own" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions_update_own" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "transactions_delete_own" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- BUDGET CATEGORIES POLICIES
CREATE POLICY "budget_select_own" ON public.budget_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "budget_insert_own" ON public.budget_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budget_update_own" ON public.budget_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "budget_delete_own" ON public.budget_categories FOR DELETE USING (auth.uid() = user_id);

-- SAVINGS GOALS POLICIES
CREATE POLICY "goals_select_own" ON public.savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "goals_insert_own" ON public.savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_update_own" ON public.savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "goals_delete_own" ON public.savings_goals FOR DELETE USING (auth.uid() = user_id);

-- IQUBS POLICIES
CREATE POLICY "iqubs_select_own" ON public.iqubs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "iqubs_insert_own" ON public.iqubs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "iqubs_update_own" ON public.iqubs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "iqubs_delete_own" ON public.iqubs FOR DELETE USING (auth.uid() = user_id);

-- IDDIRS POLICIES
CREATE POLICY "iddirs_select_own" ON public.iddirs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "iddirs_insert_own" ON public.iddirs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "iddirs_update_own" ON public.iddirs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "iddirs_delete_own" ON public.iddirs FOR DELETE USING (auth.uid() = user_id);

-- RECURRING TRANSACTIONS POLICIES
CREATE POLICY "recurring_select_own" ON public.recurring_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "recurring_insert_own" ON public.recurring_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recurring_update_own" ON public.recurring_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "recurring_delete_own" ON public.recurring_transactions FOR DELETE USING (auth.uid() = user_id);

-- INCOME SOURCES POLICIES
CREATE POLICY "income_select_own" ON public.income_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "income_insert_own" ON public.income_sources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "income_update_own" ON public.income_sources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "income_delete_own" ON public.income_sources FOR DELETE USING (auth.uid() = user_id);

-- FEEDBACK POLICIES (users can insert and view their own, admins can view all)
CREATE POLICY "feedback_insert_any" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "feedback_select_own" ON public.feedback FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- AI CONVERSATIONS POLICIES
CREATE POLICY "ai_select_own" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_insert_own" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_update_own" ON public.ai_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ai_delete_own" ON public.ai_conversations FOR DELETE USING (auth.uid() = user_id);

-- AUDIT LOGS POLICIES
CREATE POLICY "audit_logs_select_own" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "audit_logs_insert_own" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
