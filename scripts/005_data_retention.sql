-- Data Retention Policies for GDPR Compliance
-- Retention periods:
-- - Financial transactions: 7 years
-- - User profiles and non-essential data: 2 years
-- - Temporary data (feedback, ai_conversations): 30 days

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to delete old transactions (7 years)
CREATE OR REPLACE FUNCTION delete_old_transactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.transactions
  WHERE transaction_date < NOW() - INTERVAL '7 years';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Log the deletion
  INSERT INTO public.audit_logs (action, resource, details, status)
  VALUES ('data_retention_delete', 'transactions', jsonb_build_object('deleted_count', deleted_count, 'retention_period', '7 years'), 'success');
END;
$$;

-- Function to delete old user data (2 years)
CREATE OR REPLACE FUNCTION delete_old_user_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_profiles INTEGER;
  deleted_accounts INTEGER;
  deleted_budget INTEGER;
  deleted_goals INTEGER;
  deleted_iqubs INTEGER;
  deleted_iddirs INTEGER;
  deleted_recurring INTEGER;
  deleted_income INTEGER;
BEGIN
  -- Delete old profiles
  DELETE FROM public.profiles
  WHERE created_at < NOW() - INTERVAL '2 years';
  GET DIAGNOSTICS deleted_profiles = ROW_COUNT;

  -- Delete old accounts
  DELETE FROM public.accounts
  WHERE created_at < NOW() - INTERVAL '2 years';
  GET DIAGNOSTICS deleted_accounts = ROW_COUNT;

  -- Delete old budget categories
  DELETE FROM public.budget_categories
  WHERE created_at < NOW() - INTERVAL '2 years';
  GET DIAGNOSTICS deleted_budget = ROW_COUNT;

  -- Delete old savings goals
  DELETE FROM public.savings_goals
  WHERE created_at < NOW() - INTERVAL '2 years';
  GET DIAGNOSTICS deleted_goals = ROW_COUNT;

  -- Delete old iqubs
  DELETE FROM public.iqubs
  WHERE created_at < NOW() - INTERVAL '2 years';
  GET DIAGNOSTICS deleted_iqubs = ROW_COUNT;

  -- Delete old iddirs
  DELETE FROM public.iddirs
  WHERE created_at < NOW() - INTERVAL '2 years';
  GET DIAGNOSTICS deleted_iddirs = ROW_COUNT;

  -- Delete old recurring transactions
  DELETE FROM public.recurring_transactions
  WHERE created_at < NOW() - INTERVAL '2 years';
  GET DIAGNOSTICS deleted_recurring = ROW_COUNT;

  -- Delete old income sources
  DELETE FROM public.income_sources
  WHERE created_at < NOW() - INTERVAL '2 years';
  GET DIAGNOSTICS deleted_income = ROW_COUNT;

  -- Log the deletions
  INSERT INTO public.audit_logs (action, resource, details, status)
  VALUES ('data_retention_delete', 'user_data', jsonb_build_object(
    'deleted_profiles', deleted_profiles,
    'deleted_accounts', deleted_accounts,
    'deleted_budget', deleted_budget,
    'deleted_goals', deleted_goals,
    'deleted_iqubs', deleted_iqubs,
    'deleted_iddirs', deleted_iddirs,
    'deleted_recurring', deleted_recurring,
    'deleted_income', deleted_income,
    'retention_period', '2 years'
  ), 'success');
END;
$$;

-- Function to delete temporary data (30 days)
CREATE OR REPLACE FUNCTION delete_temporary_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_feedback INTEGER;
  deleted_ai INTEGER;
BEGIN
  -- Delete old feedback
  DELETE FROM public.feedback
  WHERE created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_feedback = ROW_COUNT;

  -- Delete old ai conversations
  DELETE FROM public.ai_conversations
  WHERE created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_ai = ROW_COUNT;

  -- Log the deletions
  INSERT INTO public.audit_logs (action, resource, details, status)
  VALUES ('data_retention_delete', 'temporary_data', jsonb_build_object(
    'deleted_feedback', deleted_feedback,
    'deleted_ai_conversations', deleted_ai,
    'retention_period', '30 days'
  ), 'success');
END;
$$;

-- Schedule the cron jobs (run daily at 2 AM)
SELECT cron.schedule('delete_old_transactions', '0 2 * * *', 'SELECT delete_old_transactions();');
SELECT cron.schedule('delete_old_user_data', '0 2 * * *', 'SELECT delete_old_user_data();');
SELECT cron.schedule('delete_temporary_data', '0 2 * * *', 'SELECT delete_temporary_data();');

-- Function for user-initiated data deletion
CREATE OR REPLACE FUNCTION delete_user_data(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Only allow deletion of own data
  IF auth.uid() != user_uuid THEN
    RAISE EXCEPTION 'Unauthorized: Can only delete own data';
  END IF;

  -- Delete transactions
  DELETE FROM public.transactions WHERE user_id = user_uuid;
  deleted_count := deleted_count + ROW_COUNT;

  -- Delete accounts
  DELETE FROM public.accounts WHERE user_id = user_uuid;
  deleted_count := deleted_count + ROW_COUNT;

  -- Delete budget categories
  DELETE FROM public.budget_categories WHERE user_id = user_uuid;
  deleted_count := deleted_count + ROW_COUNT;

  -- Delete savings goals
  DELETE FROM public.savings_goals WHERE user_id = user_uuid;
  deleted_count := deleted_count + ROW_COUNT;

  -- Delete iqubs
  DELETE FROM public.iqubs WHERE user_id = user_uuid;
  deleted_count := deleted_count + ROW_COUNT;

  -- Delete iddirs
  DELETE FROM public.iddirs WHERE user_id = user_uuid;
  deleted_count := deleted_count + ROW_COUNT;

  -- Delete recurring transactions
  DELETE FROM public.recurring_transactions WHERE user_id = user_uuid;
  deleted_count := deleted_count + ROW_COUNT;

  -- Delete income sources
  DELETE FROM public.income_sources WHERE user_id = user_uuid;
  deleted_count := deleted_count + ROW_COUNT;

  -- Delete feedback
  DELETE FROM public.feedback WHERE user_id = user_uuid;
  deleted_count := deleted_count + ROW_COUNT;

  -- Delete ai conversations
  DELETE FROM public.ai_conversations WHERE user_id = user_uuid;
  deleted_count := deleted_count + ROW_COUNT;

  -- Delete profile last
  DELETE FROM public.profiles WHERE id = user_uuid;
  deleted_count := deleted_count + 1;

  -- Log the user-initiated deletion
  INSERT INTO public.audit_logs (user_id, action, resource, details, status)
  VALUES (user_uuid, 'user_data_deletion', 'all_user_data', jsonb_build_object('total_deleted_records', deleted_count), 'success');
END;
$$;