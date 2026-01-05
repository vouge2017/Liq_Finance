-- =============================================
-- GDPR-Compliant Consent Management System
-- Database Schema and Setup
-- =============================================

-- Create consent types table
CREATE TABLE IF NOT EXISTS consent_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    legal_basis VARCHAR(100) NOT NULL,
    required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user consents table
CREATE TABLE IF NOT EXISTS user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    consent_type_id UUID REFERENCES consent_types(id) ON DELETE CASCADE NOT NULL,
    granted BOOLEAN NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE,
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    method VARCHAR(50) NOT NULL, -- 'explicit', 'implied', 'system'
    ip_address INET,
    user_agent TEXT,
    consent_version VARCHAR(20) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one active consent per user per type
    CONSTRAINT unique_active_user_consent UNIQUE(user_id, consent_type_id) DEFERRABLE INITIALLY DEFERRED
);

-- Create consent history table for audit trail
CREATE TABLE IF NOT EXISTS consent_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_consent_id UUID REFERENCES user_consents(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    consent_type_id UUID REFERENCES consent_types(id) ON DELETE CASCADE NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'granted', 'withdrawn', 'updated'
    old_value BOOLEAN,
    new_value BOOLEAN,
    method VARCHAR(50) NOT NULL,
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default consent types
INSERT INTO consent_types (code, name, description, category, legal_basis, required) VALUES
('sms_parsing', 'SMS Transaction Parsing', 'Allow processing of SMS messages to automatically import transaction data', 'data_processing', 'consent', false),
('ai_advisor', 'AI Financial Advisor', 'Enable AI-powered financial insights and recommendations', 'ai_processing', 'consent', false),
('data_sharing', 'Third-Party Data Sharing', 'Allow sharing anonymized data with trusted partners for improved services', 'data_processing', 'consent', false),
('marketing', 'Marketing Communications', 'Receive promotional emails and notifications about new features', 'marketing', 'consent', false),
('analytics', 'Analytics and Usage Tracking', 'Help improve the app by sharing anonymous usage analytics', 'analytics', 'legitimate_interest', false),
('community', 'Community Features', 'Participate in community features and share financial insights with other users', 'community', 'consent', false),
('profiling', 'Financial Profiling', 'Create detailed financial profiles for personalized recommendations', 'data_processing', 'consent', false),
('voice_processing', 'Voice Command Processing', 'Process voice commands for hands-free transaction entry', 'ai_processing', 'consent', false),
('receipt_analysis', 'Receipt Image Analysis', 'Analyze receipt images to extract transaction details', 'ai_processing', 'consent', false);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON user_consents(consent_type_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_active ON user_consents(is_active, granted) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_consent_history_user ON consent_history(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_history_type ON consent_history(consent_type_id);
CREATE INDEX IF NOT EXISTS idx_consent_history_date ON consent_history(created_at);

-- Enable Row Level Security
ALTER TABLE consent_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consent_types (public read access)
CREATE POLICY "Consent types are viewable by everyone" ON consent_types
    FOR SELECT USING (is_active = true);

-- RLS Policies for user_consents (users can only access their own consents)
CREATE POLICY "Users can view their own consents" ON user_consents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents" ON user_consents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consents" ON user_consents
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for consent_history (users can only access their own history)
CREATE POLICY "Users can view their own consent history" ON consent_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert consent history" ON consent_history
    FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_consent_types_updated_at BEFORE UPDATE ON consent_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_consents_updated_at BEFORE UPDATE ON user_consents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to log consent changes
CREATE OR REPLACE FUNCTION log_consent_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log to consent_history when user_consents changes
    IF TG_OP = 'INSERT' THEN
        INSERT INTO consent_history (
            user_consent_id, user_id, consent_type_id, action, 
            new_value, method, ip_address, user_agent
        ) VALUES (
            NEW.id, NEW.user_id, NEW.consent_type_id, 'granted',
            NEW.granted, NEW.method, NEW.ip_address, NEW.user_agent
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.granted != NEW.granted THEN
            INSERT INTO consent_history (
                user_consent_id, user_id, consent_type_id, action,
                old_value, new_value, method, ip_address, user_agent
            ) VALUES (
                NEW.id, NEW.user_id, NEW.consent_type_id,
                CASE WHEN NEW.granted THEN 'granted' ELSE 'withdrawn' END,
                OLD.granted, NEW.granted, NEW.method, NEW.ip_address, NEW.user_agent
            );
        ELSE
            INSERT INTO consent_history (
                user_consent_id, user_id, consent_type_id, action,
                new_value, method, ip_address, user_agent
            ) VALUES (
                NEW.id, NEW.user_id, NEW.consent_type_id, 'updated',
                NEW.granted, NEW.method, NEW.ip_address, NEW.user_agent
            );
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for consent change logging
CREATE TRIGGER log_user_consent_changes 
    AFTER INSERT OR UPDATE ON user_consents
    FOR EACH ROW EXECUTE FUNCTION log_consent_change();

-- Create function to automatically grant/revoke consents
CREATE OR REPLACE FUNCTION update_user_consent(
    p_user_id UUID,
    p_consent_type_code VARCHAR(50),
    p_granted BOOLEAN,
    p_method VARCHAR(50) DEFAULT 'system',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_consent_type_id UUID;
    v_existing_consent_id UUID;
BEGIN
    -- Get consent type ID
    SELECT id INTO v_consent_type_id 
    FROM consent_types 
    WHERE code = p_consent_type_code AND is_active = true;
    
    IF v_consent_type_id IS NULL THEN
        RAISE EXCEPTION 'Invalid consent type: %', p_consent_type_code;
    END IF;
    
    -- Check if consent already exists
    SELECT id INTO v_existing_consent_id
    FROM user_consents
    WHERE user_id = p_user_id 
      AND consent_type_id = v_consent_type_id 
      AND is_active = true;
    
    IF v_existing_consent_id IS NOT NULL THEN
        -- Update existing consent
        UPDATE user_consents
        SET 
            granted = p_granted,
            granted_at = CASE WHEN p_granted THEN NOW() ELSE granted_at END,
            withdrawn_at = CASE WHEN NOT p_granted THEN NOW() ELSE withdrawn_at END,
            method = p_method,
            ip_address = p_ip_address,
            user_agent = p_user_agent,
            updated_at = NOW()
        WHERE id = v_existing_consent_id;
    ELSE
        -- Create new consent
        INSERT INTO user_consents (
            user_id, consent_type_id, granted, granted_at, withdrawn_at,
            method, ip_address, user_agent
        ) VALUES (
            p_user_id, v_consent_type_id, p_granted,
            CASE WHEN p_granted THEN NOW() ELSE NULL END,
            CASE WHEN NOT p_granted THEN NOW() ELSE NULL END,
            p_method, p_ip_address, p_user_agent
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON TABLE consent_types IS 'Defines available consent types for GDPR compliance';
COMMENT ON TABLE user_consents IS 'Stores user consent records with audit trail';
COMMENT ON TABLE consent_history IS 'Complete audit history of all consent changes';
COMMENT ON FUNCTION update_user_consent(UUID, VARCHAR, BOOLEAN, VARCHAR, INET, TEXT) IS 
'Function to programmatically update user consents with proper logging';