# Liq Finance App - Complete Overview 🇪🇹💰

**FinEthio Planner** - A culturally-aware, AI-powered Progressive Web App for Ethiopian financial management.

---

## Table of Contents
1. [What Is Liq Finance?](#what-is-liq-finance)
2. [Core Philosophy](#core-philosophy)
3. [Feature Overview](#feature-overview)
4. [Technical Architecture](#technical-architecture)
5. [Ethiopian Cultural Integration](#ethiopian-cultural-integration)
6. [Security & Privacy](#security--privacy)
7. [Design System](#design-system)
8. [Deployment Strategy](#deployment-strategy)
9. [Key Innovations](#key-innovations)
10. [User Personas](#user-personas)

---

## What Is Liq Finance?

Liq Finance (FinEthio Planner) is a **mobile-first Progressive Web App** that provides comprehensive financial planning tools specifically designed for Ethiopian professionals. Unlike generic budgeting apps, it deeply integrates Ethiopian financial culture, including community finance practices (Iqub/Iddir), the Ethiopian calendar, and local banking ecosystems.

### Why It Exists
- **Cultural Fit**: Most financial apps don't understand Ethiopian financial practices
- **Privacy-First**: Works offline, data stays on device by default
- **No App Store**: Distributed as PWA - no Google Play fees
- **AI-Powered**: Contextually aware financial advisor powered by Google Gemini
- **Accessibility**: Mobile-optimized for Ethiopian market conditions

---

## Core Philosophy

### 1. Ethiopian-First Design
Not just localized - **built around** Ethiopian financial culture:
- **Currency**: Ethiopian Birr (ETB) with inflation awareness
- **Calendar**: Ge'ez calendar support (13 months, Amharic month names)
- **Community Finance**: First-class Iqub and Iddir tracking
- **Authentication**: Phone-first (matching Telebirr patterns)
- **Merchants**: Recognizes Ethiopian banks, stores, telecom providers
- **Language**: Bilingual English/Amharic

### 2. Privacy & Offline-First
- **LocalStorage Persistence**: All data stored locally by default
- **Offline Capability**: Full functionality without internet
- **Optional Cloud Sync**: Supabase integration for multi-device (opt-in)
- **Encrypted Storage**: Financial values encrypted with crypto-js
- **GDPR-Style Consent**: Granular control over data usage
- **Demo Mode**: Try without creating account

### 3. AI-Powered Intelligence
- **"Liq" AI Advisor**: Ruthless financial strategist persona
- **Context-Aware**: Knows your balance, spending patterns, obligations
- **Proactive Insights**: Warns before overspending, suggests optimizations
- **Cultural Understanding**: Prioritizes Iddir, understands Iqub cycles
- **Receipt OCR**: Gemini-powered receipt scanning
- **Smart Parsing**: Extracts transactions from SMS, voice, clipboard

---

## Feature Overview

### 1. Dashboard & Quick Actions
**The Command Center**
- **Balance Overview**: Real-time available balance across all accounts
- **Profile Switching**: Personal, Family, Business profiles
- **Quick Transaction Entry**: Fast add income/expense
- **Transaction Feed**: Recent activity with smart categorization
- **AI Notifications**: Proactive insights and warnings
- **Subscription Widget**: Premium tier upsell (Free/Pro/Premium)

### 2. Accounts Management
**Multi-Account Tracking**
- Multiple account support (Bank, Cash, Mobile Money)
- Account balances with visual indicators
- Transaction history per account
- Account transfer tracking
- Account-specific insights

### 3. Transaction Management
**Intelligent Input Methods**
- ✍️ **Manual Entry**: Traditional form input
- 📱 **SMS Parsing**: Auto-extract from bank SMS (CBE, BOA, Dashen)
- 🎤 **Voice Dictation**: "Spent 500 birr on coffee"
- 📸 **Receipt OCR**: Photo → AI extracts amount/merchant/category
- 📋 **Clipboard Parsing**: Paste transaction text
- 🔄 **Recurring Detection**: Identifies subscription patterns

**Smart Features**
- Swipe to edit/delete
- Category auto-suggestion
- Merchant normalization
- Duplicate detection
- Batch operations

### 4. Budget Management
**Category-Based Budgeting**
- Visual budget allocation
- Spent vs. Allocated tracking
- "Safe to Spend" calculations
- Overspending warnings
- Burn rate analytics
- Ethiopian category templates:
  - Food (Teff, Injera, Coffee)
  - Transport (Taxi, Bajaj, Bus)
  - Utilities (Electricity, Water, Internet)
  - Social (Iqub, Iddir)

### 5. Savings Goals
**Goal Setting & Tracking**
- Create financial targets
- Progress visualization
- Goal prioritization
- Timeline estimation
- Milestone celebrations
- Gamified achievements

### 6. Community Finance (Unique Feature)
**The "Third Pillar"**

#### **Iqub (Equb) - Rotating Savings**
- Track cycle (Weekly/Monthly/Quarterly)
- Member management
- Round tracking (paid vs. remaining)
- Winning round notifications
- Payout calculations
- Historical record

#### **Iddir (Edir) - Social Insurance**
- Monthly contribution tracking
- Member roster
- Payment history
- High-priority status (social stigma for missing payments)
- Emergency fund calculations

### 7. AI Financial Advisor ("Liq")
**Your Personal Financial Strategist**

**Capabilities**:
- Conversational chat interface
- Context injection (knows your full financial state)
- Proactive notifications
- Spending pattern analysis
- Budget optimization suggestions
- Goal achievement strategies

**Cultural Intelligence**:
- Prioritizes Iddir payments (social obligation)
- Understands Iqub cycles and payout timing
- Inflation-aware advice (suggest bulk buying Teff/Oil)
- Ethiopian market insights

**Privacy Controls**:
- Consent-gated
- Configurable data sharing
- Export conversation history
- Clear all data option

### 8. Voice Commands
**Hands-Free Financial Management**
- Voice transaction entry
- Balance queries
- Budget checks
- Goal progress updates
- Works offline (local processing)

### 9. Localization & Calendar
**Ethiopian Context**
- **i18next Integration**: English ⟷ Amharic
- **Calendar Toggle**: Gregorian (GC) ⟷ Ethiopian (EC)
- **Amharic Months**: Meskerem, Tikimt, Hidar, Tahsas, etc.
- **Date Display**: Context-aware formatting
- **RTL Support**: Right-to-left text for Amharic

### 10. Gamification & Engagement
**Achievement System**
- Financial milestones
- Streak tracking
- Budget adherence rewards
- Goal completion celebrations
- Confetti animations
- Progress badges

---

## Technical Architecture

### Tech Stack
```
Frontend:        React 19.2 + TypeScript + Vite
UI Framework:    Radix UI + Tailwind CSS 4
Backend:         Supabase (PostgreSQL + Auth)
AI:              Google Gemini (@google/generative-ai + ai-sdk)
State:           React Context + localStorage
I18n:            i18next + react-i18next
PWA:             Service Worker + Web Manifest
Charts:          Recharts
Icons:           Lucide React
Animations:      Tailwind + Canvas Confetti
Validation:      Zod 4.1
Security:        crypto-js, Sentry
Testing:         Vitest + Testing Library
```

### Architecture Pattern: Monolithic Context

**AppContext** - Central state management:
```typescript
interface AppState {
  // Core data
  transactions: Transaction[]
  accounts: Account[]
  budgetCategories: BudgetCategory[]
  goals: Goal[]
  iqubs: Iqub[]
  iddirs: Iddir[]
  
  // User preferences
  activeProfile: "Personal" | "Family" | "Business"
  theme: "light" | "dark"
  language: "en" | "am"
  calendarSystem: "gregorian" | "ethiopian"
  
  // Settings
  currency: "ETB"
  userName: string
  consentSettings: ConsentSettings
  subscriptionTier: "free" | "pro" | "premium"
  
  // Notifications
  aiNotifications: AINotification[]
  notification: GlobalNotification | null
}
```

**Data Flow**:
1. User action → Context function
2. State update → Derived calculations
3. Side effects → LocalStorage persist
4. Optional → Supabase sync

### Project Structure
```
src/
├── features/                # Feature modules (vertical slices)
│   ├── accounts/            # Account management
│   │   ├── AccountsPage.tsx
│   │   ├── BalanceCard.tsx
│   │   └── AccountModal.tsx
│   ├── advisor/             # AI advisor chat
│   │   └── AIAdvisor.tsx
│   ├── auth/                # Onboarding & profiles
│   │   ├── Onboarding.tsx
│   │   └── FinancialProfileModal.tsx
│   ├── budget/              # Budget & transactions
│   │   ├── BudgetPage.tsx
│   │   ├── TransactionList.tsx
│   │   └── TransactionModal.tsx
│   ├── community/           # Iqub/Iddir tracking
│   │   └── CommunityPage.tsx
│   ├── dashboard/           # Main dashboard
│   │   ├── QuickActions.tsx
│   │   └── SubscriptionWidget.tsx
│   ├── gamification/        # Achievements
│   ├── goals/               # Savings goals
│   │   └── GoalsPage.tsx
│   ├── social/              # Community features
│   └── voice/               # Voice commands
│
├── lib/                     # Core utilities & services
│   ├── supabase/            # Backend integration
│   │   ├── client.ts
│   │   └── data-service.ts  # CRUD operations
│   ├── security/            # Encryption & consent
│   │   ├── encryption.ts
│   │   └── consent.ts
│   ├── config/              # Configuration
│   ├── ai-service.ts        # Gemini integration
│   ├── cultural-advisor.ts  # Ethiopian context
│   ├── sms-parser.ts        # Bank SMS parsing
│   ├── multi-language-sms-parser.ts
│   ├── offline-sync.ts      # Sync manager
│   ├── clipboard-parser.ts  # Paste handling
│   ├── recurring-pattern-detector.ts
│   └── validation.ts        # Zod schemas
│
├── services/                # Background services
│   ├── gemini.ts            # OCR & AI processing
│   ├── voice-commands.ts    # Voice processing
│   ├── voice-processing-orchestrator.ts
│   ├── consent-service.ts   # Privacy management
│   ├── proactive-ai.ts      # AI notifications
│   ├── automated-transaction-service.ts
│   ├── data-retention-service.ts
│   ├── pwa-optimization.ts
│   └── error-monitoring.ts  # Sentry integration
│
├── shared/                  # Shared UI components
│   └── components/
│       ├── BottomNav.tsx
│       ├── Icons.tsx
│       ├── OfflineBanner.tsx
│       ├── GlobalConsentBanner.tsx
│       ├── SubscriptionModal.tsx
│       ├── FeedbackModal.tsx
│       ├── DataManagementModal.tsx
│       └── ui/              # Design system primitives
│
├── context/                 # React Context providers
│   ├── AppContext.tsx       # Main state
│   └── AuthContext.tsx      # Authentication
│
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript definitions
├── utils/                   # Helper functions
├── locales/                 # i18next translations
│   ├── en/
│   └── am/
├── test/                    # Test utilities
├── App.tsx                  # Root component
├── index.tsx                # Entry point
├── i18n.ts                  # i18next config
└── index.css                # Global styles
```

### Key Technical Decisions

#### 1. Why Monolithic Context vs. Redux?
- **Simplicity**: Current complexity doesn't justify Redux overhead
- **Offline-First**: Easy to serialize entire state to localStorage
- **Zero-Backend**: Can work completely client-side
- **Performance**: Memoization prevents unnecessary re-renders

#### 2. LocalStorage Persistence
```typescript
// Auto-save on every state change
useEffect(() => {
  localStorage.setItem('finethio_state', JSON.stringify(state))
}, [state])

// Hydrate on mount
useEffect(() => {
  const saved = localStorage.getItem('finethio_state')
  if (saved) setState(JSON.parse(saved))
}, [])
```

#### 3. Supabase Integration
**Optional Backend Layer**:
- User authentication (phone/email)
- Multi-device sync
- Data backup
- Social features

**Data Service Layer** (`lib/supabase/data-service.ts`):
- Encrypts financial values before storage
- Enforces consent settings
- Supports demo mode
- Conflict resolution for offline changes

#### 4. AI Integration Strategy
**Lazy Loading**: Gemini only called on demand
**Context Injection**: Full financial snapshot passed to AI
**Rate Limiting**: Redis-backed limits prevent abuse
**Fallback**: Local processing when API unavailable

---

## Ethiopian Cultural Integration

### 1. Language & Localization
**i18next Implementation**:
- English (default)
- Amharic (አማርኛ)
- Browser language detection
- Persistent user preference
- RTL support for Amharic

**Translation Files**: `src/locales/{en,am}/translation.json`

### 2. Ethiopian Calendar (Ge'ez)
**Calendar Characteristics**:
- 13 months (12 × 30 days + 5/6 day month)
- 7-8 years behind Gregorian
- Amharic month names: Meskerem, Tikimt, Hidar, Tahsas, Tir, Yekatit, Megabit, Miazia, Ginbot, Sene, Hamle, Nehase, Pagume

**Implementation**:
- Stored as ISO-8601 Gregorian (for calculations)
- Converted to Ethiopian for display
- Toggle button in UI (GC ⟷ EC)
- Context-aware date formatting

### 3. Community Finance

#### **Iqub (Equb) - ROSCA**
**What It Is**: Rotating Savings and Credit Association
- Members contribute fixed amount per cycle
- One member receives the total pot each round
- Continues until all members have won

**App Logic**:
```typescript
interface Iqub {
  name: string
  cycle: "weekly" | "monthly" | "quarterly"
  contributionAmount: number
  members: string[]
  paidRounds: number
  totalRounds: number
  winningRound: number
  nextPaymentDate: string
}
```

**Behavior**:
- Iqub contribution is an **asset accumulation**, not expense
- Winning payout treated as income
- Continues paying after winning (social obligation)
- AI prioritizes Iqub payments

#### **Iddir (Edir) - Social Insurance**
**What It Is**: Community-based social safety net
- Monthly contributions
- Covers funeral costs, emergencies
- Indefinite membership

**App Logic**:
```typescript
interface Iddir {
  name: string
  monthlyContribution: number
  members: string[]
  paymentHistory: Payment[]
  nextPaymentDate: string
}
```

**Behavior**:
- Treated as **fixed obligation** (highest priority)
- Missing payment = high social stigma
- AI warns aggressively if payment at risk
- Never suggest cutting Iddir in budget optimization

### 4. Ethiopian Banking & SMS Formats
**Supported Banks**:
- Commercial Bank of Ethiopia (CBE)
- Bank of Abyssinia (BOA)
- Dashen Bank
- Awash Bank
- Telebirr (mobile money)

**SMS Parsing Examples**:
```
"You have received ETB 5,000.00 from Abebe Kebede. Ref: CBE123456"
→ Income transaction auto-created

"You paid ETB 250.00 to Ethio Telecom. Balance: 1,200.00"
→ Expense transaction auto-created
```

### 5. Ethiopian Merchants & Categories
**Recognized Patterns**:
- **Food**: Teff, Injera, Shiro, Coffee, Tej
- **Transport**: Bajaj, Taxi, Bus, Ride
- **Telecom**: Ethio Telecom, Safaricom Ethiopia
- **Utilities**: EEPCO, Water Authority
- **Retail**: Shoa Supermarket, Queens Supermarket

### 6. Cultural Financial Wisdom
**AI Advisor Understands**:
- **Inflation Hedging**: Birr loses value → buy Teff/Oil in bulk (quintal)
- **Social Obligations**: Iddir > Entertainment spending
- **Iqub Strategy**: Winning early vs. late in cycle
- **Emergency Fund**: Medical costs often catastrophic
- **Family Support**: Remittances to relatives common

---

## Security & Privacy

### 1. Consent Management
**GDPR-Inspired System**:
```typescript
interface ConsentSettings {
  analytics: boolean        // Usage analytics
  aiProcessing: boolean     // AI advisor access
  cloudSync: boolean        # Supabase backup
  crashReporting: boolean   // Sentry error reports
  marketingEmails: boolean  // Promotional emails
}
```

**Features**:
- Consent banner on first visit
- Granular opt-in/opt-out
- "Manage Consent" in settings
- Export all data
- Delete all data

### 2. Data Encryption
**Encryption Strategy**:
```typescript
import CryptoJS from 'crypto-js'

// Encrypt financial values before storage
const encryptValue = (value: number, key: string): string => {
  return CryptoJS.AES.encrypt(value.toString(), key).toString()
}

// Decrypt on retrieval
const decryptValue = (encrypted: string, key: string): number => {
  const bytes = CryptoJS.AES.decrypt(encrypted, key)
  return parseFloat(bytes.toString(CryptoJS.enc.Utf8))
}
```

**What's Encrypted**:
- Transaction amounts
- Account balances
- Goal targets
- Iqub/Iddir contribution amounts

### 3. Rate Limiting
**API Protection**:
- Redis-backed rate limits
- Per-user quotas
- AI request throttling
- OCR processing limits

### 4. Offline Security
**LocalStorage Protection**:
- Encrypted sensitive values
- Session timeout
- Device fingerprinting
- No PII in plaintext

### 5. Supabase Security
**Row-Level Security (RLS)**:
- Users can only access own data
- Profile-specific permissions
- Audit logs for sensitive operations

### 6. Error Monitoring
**Sentry Integration**:
- Client-side error tracking
- Performance monitoring
- User consent required
- PII scrubbing

---

## Design System

### Design Philosophy
1. **Mobile-First**: 375px base, thumb-reachable
2. **Ethiopian Colors**: Green (#10B981), Yellow (#F59E0B), Red (#EF4444)
3. **High Contrast**: Accessibility-focused
4. **Native Feel**: Smooth animations, haptic feedback
5. **Dark Mode**: Full theme support

### Key Design Tokens
```typescript
// Touch Targets
BUTTON_HEIGHTS = {
  sm: '40px',   // Inline actions
  md: '48px',   // Secondary actions
  lg: '56px',   // Primary CTAs
}

// Border Radius
RADIUS = {
  sm: '8px',    // Small elements
  md: '12px',   // Cards
  lg: '16px',   // Hero cards
  xl: '20px',   // Modals
}

// Shadows
ELEVATIONS = {
  1: '0 1px 2px rgba(0,0,0,0.05)',
  2: '0 2px 8px rgba(0,0,0,0.08)',
  3: '0 4px 12px rgba(0,0,0,0.12)',
  4: '0 8px 24px rgba(0,0,0,0.16)',
  5: '0 16px 48px rgba(0,0,0,0.24)',
}
```

### Component Library
**Radix UI Primitives**:
- Dialog/Modal
- Dropdown Menu
- Accordion
- Tabs
- Select
- Switch
- Toast/Sonner
- Progress
- Avatar
- Tooltip

**Custom Components**:
- HeroCard (balance/goal displays)
- SwipeableListItem (transaction swipe actions)
- BottomNav (mobile navigation)
- AINotificationStack (proactive alerts)
- OfflineBanner (connectivity status)
- GlobalConsentBanner (privacy)

### Animation System
```css
/* Entrance Animations */
.animate-slide-up   /* Bottom sheet entrance */
.animate-scale-in   /* Modal entrance */
.animate-fade-in    /* Content load */
.animate-bounce-in  /* Success celebrations */

/* Interactive */
.active:scale-95    /* Button press feedback */
.animate-pulse      /* Loading states */
```

### Haptic Feedback
```typescript
const haptics = {
  light: () => navigator.vibrate(10),
  buttonPress: () => navigator.vibrate(20),
  success: () => navigator.vibrate([50, 30, 50]),
  error: () => navigator.vibrate([100, 50, 100]),
  goalAchieved: () => navigator.vibrate([50, 30, 50, 30, 100]),
}
```

---

## Deployment Strategy

### PWA Distribution (Recommended)
**Advantages**:
- ✅ No Google Play fee ($25)
- ✅ Instant updates (no app store review)
- ✅ Cross-platform (Android, iOS, Desktop)
- ✅ Shareable via URL
- ✅ Installable from browser

**Steps**:
1. Deploy to Vercel/Netlify (free tier)
2. Share URL (e.g., `finethio.app`)
3. Users visit URL
4. Click "Add to Home Screen"
5. Works like native app

**PWA Configuration**:
- `public/manifest.json`: App metadata
- `public/sw.js`: Service Worker for offline
- Icons: 192×192, 512×512 PNG
- Theme color: Ethiopian green (#10B981)

### Alternative Distributions
1. **Direct APK**: Capacitor build → Share APK file
2. **F-Droid**: Open source app store
3. **APKPure**: Alternative Android store
4. **Amazon Appstore**: Reach Fire tablet users

### Deployment Platforms
**Vercel** (Recommended):
```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**Netlify**:
```toml
# netlify.toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Key Innovations

### 1. Receipt OCR
**How It Works**:
1. User takes photo of receipt
2. Image sent to Gemini API
3. AI extracts: merchant, amount, date, category
4. Transaction auto-populated
5. User reviews & confirms

**Supported Receipts**:
- Thermal print receipts
- Telebirr screenshots
- Bank transaction slips
- Handwritten notes (best effort)

### 2. SMS Auto-Import
**How It Works**:
1. User receives bank SMS
2. Paste SMS text or share to app
3. AI parses: amount, type, merchant, balance
4. Transaction auto-created
5. Account balance updated

**Supported Formats**:
```
"CBE: You have received 5,000.00 ETB from Abebe K."
"Telebirr: You paid 250 Birr to Ethio Telecom. Bal: 1,200"
"BOA Withdrawal: 1,000.00 ETB. Available: 8,500.00"
```

### 3. Voice Dictation
**How It Works**:
1. User taps microphone
2. Says: "Spent 500 birr on coffee at Kaldi's"
3. Local speech-to-text
4. AI parses natural language
5. Transaction created

**Offline Capable**: Uses Web Speech API (local processing)

### 4. Cultural AI Advisor
**Unique Features**:
- Understands Iqub/Iddir
- Prioritizes social obligations
- Inflation-aware advice
- Ethiopian market insights
- Culturally appropriate tone

**Example Insights**:
- "Your Iddir payment is due tomorrow. Move 500 ETB from entertainment budget."
- "Teff prices rising. Consider buying a quintal now to save 15% over 6 months."
- "You're winning Iqub next cycle. Plan for the 20,000 ETB injection."

### 5. Offline-First Sync
**Conflict Resolution**:
```typescript
// Last-write-wins with merge
if (localTimestamp > serverTimestamp) {
  uploadLocalChanges()
} else if (serverTimestamp > localTimestamp) {
  mergeServerChanges()
} else {
  // Conflict: present to user
  showConflictResolutionUI()
}
```

### 6. Multi-Profile Architecture
**Use Cases**:
- **Personal**: Individual finances
- **Family**: Shared household budget
- **Business**: Small business accounting

**Profile Switching**:
- Instant context switch
- Separate transactions/budgets/goals
- Aggregated reporting across profiles

---

## User Personas

### 1. Dawit - Young Professional
**Profile**:
- 28, software engineer in Addis Ababa
- Earns 35,000 ETB/month
- Participates in 2 Iqubs, 1 Iddir
- Sends remittances to family
- Wants to save for apartment down payment

**Uses**:
- SMS parsing for salary deposits
- Iqub tracking for savings strategy
- AI advisor for budget optimization
- Goal tracking for apartment fund

### 2. Sara - Small Business Owner
**Profile**:
- 35, runs coffee export business
- Variable income (seasonal)
- Multiple bank accounts
- Tracks business vs. personal expenses
- Needs tax documentation

**Uses**:
- Multi-profile (Business + Personal)
- Receipt OCR for expense tracking
- Account management for cash flow
- Export transactions for accounting

### 3. Yohannes - Diaspora Professional
**Profile**:
- 42, lives in US, stays connected to Ethiopia
- Sends regular remittances
- Participates in virtual Iqub
- Plans retirement in Ethiopia
- Tracks Ethiopian investments

**Uses**:
- Ethiopian calendar for cultural connection
- Iqub tracking for community savings
- Currency conversion (USD ⟷ ETB)
- Long-term goal planning

### 4. Tigist - Family Budget Manager
**Profile**:
- 31, manages household finances
- Coordinates with spouse
- 3 children's education savings
- Active in neighborhood Iddir
- Budget-conscious shopper

**Uses**:
- Family profile for shared budget
- Voice input (hands-free while busy)
- Budget alerts for overspending
- Goal tracking for education fund
- Bulk buying reminders (AI advice)

---

## Development Workflow

### Setup
```bash
# Install dependencies
pnpm install

# Environment variables
cp .env.example .env
# Fill in Supabase & Gemini keys

# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Key Commands
```bash
# Type checking
pnpm tsc

# Linting
pnpm lint

# Security linting
pnpm lint:security

# Test coverage
pnpm test:coverage

# Test UI
pnpm test:ui
```

### Environment Variables
```env
# Supabase (Backend)
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Google Gemini (AI)
VITE_GEMINI_API_KEY=your_gemini_key

# Sentry (Monitoring)
VITE_SENTRY_DSN=your_sentry_dsn

# Feature Flags
VITE_ENABLE_AI=true
VITE_ENABLE_VOICE=true
VITE_ENABLE_OCR=true
```

---

## Roadmap

### ✅ Completed (v1.0)
- Core financial tracking
- Budget management
- Savings goals
- Iqub/Iddir tracking
- AI advisor integration
- Receipt OCR
- SMS parsing
- Voice commands
- Ethiopian calendar
- Multi-profile support
- PWA deployment
- Offline-first architecture

### 🚧 In Progress
- Amharic localization (full coverage)
- Bank integration APIs
- Advanced analytics dashboard
- Social features (share goals)
- Investment tracking

### 🔮 Future Plans
- **Bank Integration**: Direct sync with CBE, BOA, Dashen
- **Investment Tracking**: Stocks, bonds, real estate
- **Tax Calculator**: Ethiopian tax law compliance
- **Business Features**: Invoicing, inventory, payroll
- **Family Sharing**: Collaborative budgets
- **Marketplace**: Connect with financial services
- **Education Hub**: Financial literacy content
- **Community Forum**: User discussions
- **API Platform**: Third-party integrations

---

## Technical Debt & Known Limitations

### Current Limitations
1. **LocalStorage Size**: Limited to ~10MB (mitigated by Supabase sync)
2. **Ethiopian Calendar**: Heuristic converter (not astronomically precise)
3. **SMS Parsing**: Bank format changes break parsers
4. **OCR Accuracy**: Depends on image quality
5. **Voice Recognition**: English/Amharic mixed language challenges

### Performance Considerations
- **Large Transaction Lists**: Virtualization needed >1000 items
- **AI Requests**: Rate limiting prevents spam
- **Image Processing**: File size limits (max 5MB)
- **Offline Queue**: Limited to 100 pending operations

### Security Considerations
- **LocalStorage Encryption**: Not secure against determined attacker with device access
- **API Keys**: Should use backend proxy for production
- **Rate Limiting**: Client-side only (needs backend enforcement)

---

## Documentation Resources

### Internal Docs
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Technical architecture
- [ETHIOPIAN_CONTEXT.md](./docs/ETHIOPIAN_CONTEXT.md) - Cultural features
- [AI_INTEGRATION.md](./docs/AI_INTEGRATION.md) - AI implementation
- [SETUP.md](./SETUP.md) - Development setup
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Design system guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment instructions
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - UI/UX guidelines

### External Resources
- [Supabase Docs](https://supabase.com/docs)
- [Gemini API](https://ai.google.dev/docs)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [PWA Guide](https://web.dev/progressive-web-apps/)

---

## Contributing

### Code Style
- TypeScript strict mode
- Functional components with hooks
- Meaningful variable names
- Comments for complex logic only
- Follow existing patterns

### Git Workflow
- Feature branches from `main`
- Descriptive commit messages
- PR reviews required
- Squash merge to main

### Testing Strategy
- Unit tests for utilities
- Integration tests for features
- E2E tests for critical flows
- Manual testing on real devices

---

## Support & Contact

### For Developers
- Check existing documentation first
- Review closed issues on GitHub
- Test locally before reporting bugs

### For Users
- In-app feedback form
- Email: support@finethio.app (example)
- Ethiopian time zone business hours

---

## License

Private project - All rights reserved

---

## Acknowledgments

Built with:
- ❤️ for Ethiopian professionals
- 🙏 Thanks to the open source community
- 🇪🇹 Inspired by Ethiopian financial culture
- ☕ Powered by Ethiopian coffee

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready

---

*FinEthio Planner - Making financial planning accessible, culturally relevant, and intelligent for Ethiopians everywhere.* 🇪🇹✨
