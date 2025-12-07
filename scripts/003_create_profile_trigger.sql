-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE(new.raw_user_meta_data ->> 'phone', null)
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create default Cash account for new user
  INSERT INTO public.accounts (user_id, name, institution, type, balance, color, is_default)
  VALUES (
    new.id,
    'Petty Cash',
    'Cash',
    'Cash',
    0,
    'from-gray-700 to-gray-800',
    true
  );

  -- Create default Ethiopian budget categories
  INSERT INTO public.budget_categories (user_id, name, type, allocated, icon, color, rollover_enabled) VALUES
    (new.id, 'Rent / Housing', 'fixed', 0, 'Home', 'bg-indigo-500', false),
    (new.id, 'Iddir & Social', 'fixed', 0, 'Iddir', 'bg-rose-600', true),
    (new.id, 'Bills (Utility)', 'fixed', 0, 'Zap', 'bg-blue-500', true),
    (new.id, 'Groceries (Teff/Cereals)', 'variable', 0, 'Teff', 'bg-emerald-500', false),
    (new.id, 'Transport (Bajaji/Taxi)', 'variable', 0, 'Bajaji', 'bg-yellow-500', false),
    (new.id, 'Airtime & Data', 'variable', 0, 'Phone', 'bg-green-500', false),
    (new.id, 'Lifestyle & Cafe', 'variable', 0, 'Coffee', 'bg-purple-400', true);

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
