-- Audit Logs Table for Monitoring User Actions and Security Events
-- Designed for comprehensive observability and compliance

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- e.g., 'login', 'create_transaction', 'update_profile', 'security_alert'
  resource TEXT, -- e.g., 'transaction', 'account', 'profile'
  resource_id UUID, -- ID of the affected resource
  details JSONB, -- Additional details about the action
  ip_address INET, -- Client IP address
  user_agent TEXT, -- Browser/client user agent
  session_id TEXT, -- Session identifier if available
  status TEXT DEFAULT 'success', -- 'success', 'failure', 'warning'
  error_message TEXT, -- Error details if applicable
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON public.audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource, resource_id);