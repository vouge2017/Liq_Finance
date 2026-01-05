# GDPR-Compliant Consent Management System

## Overview

This document outlines the comprehensive GDPR-compliant consent management system implemented for the Liq_Finance application. The system ensures full compliance with European data protection regulations while providing granular control over data processing activities.

## System Architecture

### Core Components

1. **Database Schema** (`scripts/006_consent_management.sql`)
   - `consent_types` table: Defines available consent types
   - `user_consents` table: Stores user consent records
   - `consent_history` table: Audit trail for all consent changes

2. **Consent Service** (`src/services/consent-service.ts`)
   - Centralized consent management
   - Validation mechanisms
   - Integration with existing services

3. **UI Components**
   - `ConsentManagementModal.tsx`: Full-featured consent management interface
   - `ConsentBanner.tsx`: Initial consent collection banner
   - `ConsentTestDemo.tsx`: Testing and demonstration component

4. **Integration Layer**
   - SMS parsing service integration
   - AI services integration
   - Data service validation hooks

## Consent Types

### Data Processing Consents

1. **SMS Parsing** (`sms_parsing`)
   - Purpose: Automatic transaction import from bank SMS messages
   - Legal Basis: Consent
   - Required: No
   - Category: data_processing

2. **AI Advisor** (`ai_advisor`)
   - Purpose: AI-powered financial insights and recommendations
   - Legal Basis: Consent
   - Required: No
   - Category: ai_processing

3. **Voice Processing** (`voice_processing`)
   - Purpose: Voice-to-text conversion for transaction entry
   - Legal Basis: Consent
   - Required: No
   - Category: ai_processing

4. **Receipt Analysis** (`receipt_analysis`)
   - Purpose: Image recognition for receipt processing
   - Legal Basis: Consent
   - Required: No
   - Category: ai_processing

5. **Data Sharing** (`data_sharing`)
   - Purpose: Sharing anonymized data with trusted partners
   - Legal Basis: Consent
   - Required: No
   - Category: data_processing

6. **Profiling** (`profiling`)
   - Purpose: Creating detailed financial profiles
   - Legal Basis: Consent
   - Required: No
   - Category: data_processing

### Marketing & Communication Consents

7. **Marketing Communications** (`marketing`)
   - Purpose: Promotional emails and notifications
   - Legal Basis: Consent
   - Required: No
   - Category: marketing

8. **Analytics** (`analytics`)
   - Purpose: Anonymous usage analytics for app improvement
   - Legal Basis: Legitimate Interest
   - Required: No
   - Category: analytics

9. **Community Features** (`community`)
   - Purpose: Participation in community features
   - Legal Basis: Consent
   - Required: No
   - Category: community

## Implementation Details

### Database Schema

```sql
-- Consent Types Table
CREATE TABLE consent_types (
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

-- User Consents Table
CREATE TABLE user_consents (
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
    
    CONSTRAINT unique_active_user_consent UNIQUE(user_id, consent_type_id)
);

-- Consent History Table
CREATE TABLE consent_history (
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
```

### Row Level Security (RLS)

All tables implement RLS policies to ensure users can only access their own consent data:

```sql
-- Users can only access their own consents
CREATE POLICY "Users can view their own consents" ON user_consents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents" ON user_consents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consents" ON user_consents
    FOR UPDATE USING (auth.uid() = user_id);
```

### Audit Logging

Automatic audit logging is implemented through database triggers:

```sql
CREATE OR REPLACE FUNCTION log_consent_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO consent_history (...)
        VALUES (...);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.granted != NEW.granted THEN
            INSERT INTO consent_history (...)
            VALUES (...);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Integration Points

### 1. SMS Parsing Service

```typescript
// Before processing SMS
const result = await parseSMSWithConsent(smsText, userId)
if (result.consentRequired) {
  // Show consent request
  return
}
// Process SMS normally
```

### 2. AI Services

```typescript
// Voice processing
const voiceResult = await parseVoiceAudio(audioData, mimeType, userId)
if (voiceResult.consentRequired) {
  throw new Error('Voice processing consent required')
}

// Receipt analysis
const receiptResult = await analyzeReceiptImage(imageData, userId)
if (receiptResult.consentRequired) {
  throw new Error('Receipt analysis consent required')
}
```

### 3. Data Services

```typescript
// Validate consent before sensitive operations
const isValid = await validateSMSParsingConsent(userId)
if (!isValid) {
  throw new Error('SMS parsing consent required')
}
```

## User Interface Components

### 1. Consent Management Modal

A comprehensive interface for managing consent preferences:

- **Current Consents Tab**: View and modify current consent status
- **Consent History Tab**: Review all consent changes with timestamps
- **Detailed Information**: Expandable details for each consent type
- **Easy Withdrawal**: Simple toggle switches for consent management

### 2. Consent Banner

Initial consent collection banner that appears for new users:

- **Progressive Disclosure**: Essential vs. full consent options
- **Clear Information**: Detailed explanations of what data is processed
- **Easy Acceptance**: Quick accept buttons for different consent levels

### 3. Test Demo Component

Comprehensive testing interface:

- **Consent Status Display**: Real-time view of all consent states
- **Validation Tests**: Automated testing of consent integration
- **Integration Examples**: Code samples showing proper implementation

## GDPR Compliance Features

### 1. Lawful Basis for Processing

- **Consent**: Freely given, specific, informed, and unambiguous
- **Legitimate Interest**: For analytics (with opt-out)
- **Contract**: For essential app functionality

### 2. Individual Rights

- **Right to be Informed**: Clear explanations of data processing
- **Right of Access**: Export consent data functionality
- **Right to Rectification**: Update consent preferences anytime
- **Right to Erasure**: Delete all consent data
- **Right to Withdraw Consent**: Easy withdrawal mechanisms
- **Right to Data Portability**: Export consent records

### 3. Consent Requirements

- **Freely Given**: No dark patterns or bundled consents
- **Specific**: Granular consent for different processing activities
- **Informed**: Clear explanations of what data is processed
- **Unambiguous**: Clear affirmative action required
- **Easy to Withdraw**: Simple toggle switches, no barriers

### 4. Accountability

- **Audit Trail**: Complete history of all consent changes
- **Documentation**: Version tracking and consent method logging
- **Data Minimization**: Only processing collect consent for necessary
- **Regular Review**: Consent expiration and renewal mechanisms

## Usage Examples

### Basic Consent Management

```typescript
import { consentService } from '@/services/consent-service'

// Check if user has consent
const hasConsent = await consentService.hasConsent(userId, 'sms_parsing')

// Grant consent
await consentService.grantConsent(userId, 'sms_parsing', 'explicit')

// Withdraw consent
await consentService.withdrawConsent(userId, 'sms_parsing', 'User requested withdrawal')

// Validate consent before operation
const validation = await consentService.validateConsent(userId, 'sms_parsing')
if (!validation.isValid) {
  throw new Error(`Consent validation failed: ${validation.reason}`)
}
```

### Using the Consent Hook

```typescript
import { useConsent } from '@/hooks/useConsent'

const { 
  hasConsent, 
  updateConsent, 
  consents,
  loading 
} = useConsent()

// Check consent
if (hasConsent('sms_parsing')) {
  // Process SMS
}

// Update consent
await updateConsent('sms_parsing', false)
```

### Integration with Existing Services

```typescript
// SMS parsing with consent validation
export const parseSMSWithConsent = async (text: string, userId?: string) => {
  if (userId) {
    const hasConsent = await validateSMSParsingConsent(userId)
    if (!hasConsent) {
      return {
        success: false,
        consentRequired: true,
        error: 'SMS parsing consent not granted'
      }
    }
  }
  // Process SMS normally
  return parseSMS(text)
}
```

## Testing

The system includes comprehensive testing components:

### 1. Automated Tests

```typescript
// Test consent validation
const result = await parseSMSWithConsent(testSMS, userId)
expect(result.consentRequired).toBeDefined()

// Test consent withdrawal
await consentService.withdrawConsent(userId, 'sms_parsing')
const hasConsent = await consentService.hasConsent(userId, 'sms_parsing')
expect(hasConsent).toBe(false)
```

### 2. Manual Testing

Use the `ConsentTestDemo` component to:

- View current consent status
- Run validation tests
- Test consent withdrawal
- Verify audit logging
- Test data export/deletion

## Deployment

### Database Migration

1. Run the SQL script to create consent tables:
   ```bash
   psql -f scripts/006_consent_management.sql
   ```

2. Verify RLS policies are active:
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename LIKE '%consent%';
   ```

### Application Integration

1. Import consent service in relevant components
2. Add consent validation to sensitive operations
3. Implement consent management UI
4. Test all integration points

## Security Considerations

### Data Protection

- **Encryption**: All consent data encrypted at rest
- **Access Control**: RLS ensures user data isolation
- **Audit Logging**: Complete trail of all consent changes
- **Secure Transmission**: HTTPS for all consent-related API calls

### Privacy by Design

- **Data Minimization**: Only necessary consent data collected
- **Purpose Limitation**: Consent only used for stated purposes
- **Storage Limitation**: Automatic data retention policies
- **Accuracy**: Regular validation of consent records

## Maintenance

### Regular Tasks

1. **Consent Review**: Annual review of consent types and descriptions
2. **Data Retention**: Automated cleanup of expired consent records
3. **Audit Analysis**: Regular review of consent change patterns
4. **Compliance Monitoring**: Ongoing GDPR compliance verification

### Updates

- **Consent Types**: Add new consent types as features evolve
- **UI Improvements**: Enhance user experience based on feedback
- **Integration**: Add consent validation to new services
- **Testing**: Expand test coverage for new functionality

## Conclusion

This GDPR-compliant consent management system provides:

✅ **Complete Compliance**: Meets all GDPR requirements for consent
✅ **User Control**: Granular consent management with easy withdrawal
✅ **Audit Trail**: Full transparency of consent changes
✅ **Integration Ready**: Seamless integration with existing services
✅ **Privacy by Design**: Built-in privacy protection mechanisms
✅ **Scalable Architecture**: Supports future feature expansion

The system ensures that Liq_Finance users have full control over their data while maintaining compliance with international data protection regulations.