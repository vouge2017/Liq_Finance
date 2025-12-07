# FinEthio Planner 💰

**A comprehensive financial planning app for Ethiopian professionals**

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-4285F4?style=for-the-badge&logo=progressive-web-apps)](https://web.dev/progressive-web-apps/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

> **No Google Play Store fee needed!** Share as a PWA directly with friends and colleagues.

## ✨ Features

- 📊 **Expense Tracking** - Track income and expenses with categories
- 💵 **Budget Management** - Set and monitor budgets by category
- 🎯 **Savings Goals** - Set financial goals and track progress
- 🤝 **Iqub & Iddir** - Ethiopian community finance tracking
- 🤖 **AI Financial Advisor** - Get personalized financial advice powered by AI
- 📸 **Receipt Scanning** - OCR for automatic transaction entry
- 👥 **Multi-Profile** - Personal, Family, and Business views
- 📅 **Ethiopian Calendar** - Support for Ge'ez calendar
- 📱 **PWA Ready** - Install on phone without app store
- 🔒 **Privacy First** - Offline support and secure data

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up Supabase (Free)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run SQL migrations from `scripts/` folder
4. Copy API keys to `.env` file

### 3. Run Development Server
```bash
pnpm dev
```

## 📱 Sharing Without Google Play Store

### Option 1: PWA (Recommended) ⭐
- Deploy to Vercel/Netlify (free)
- Share the URL
- Users install from browser (no app store needed!)

### Option 2: Direct APK
- Build APK using Capacitor
- Share APK file directly
- Users enable "Install from unknown sources"

### Option 3: Alternative Stores
- F-Droid (free, open source)
- APKPure
- Amazon Appstore

## 🏗️ Tech Stack

- **Frontend**: React 19.2 + TypeScript
- **Build Tool**: Vite 6.2
- **Backend**: Supabase (PostgreSQL + Auth)
- **UI**: Radix UI + Tailwind CSS
- **AI**: Google Gemini API (optional)
- **PWA**: Service Worker + Web Manifest

## 📁 Project Structure

```
├── app/              # Next.js app directory (API routes)
├── components/       # React components
├── context/          # React Context (state management)
├── lib/              # Utilities and services
│   ├── supabase/     # Supabase client and data service
│   └── ai-service.ts # AI integration
├── hooks/            # Custom React hooks
├── public/           # Static assets
├── scripts/          # Database migration scripts
└── docs/             # Documentation

```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_key  # Optional
```

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Complete setup instructions
- [Architecture](./docs/ARCHITECTURE.md) - Technical architecture
- [Ethiopian Context](./docs/ETHIOPIAN_CONTEXT.md) - Domain-specific features
- [AI Integration](./docs/AI_INTEGRATION.md) - AI features documentation

## 🎯 Roadmap

- [x] PWA support
- [x] Supabase backend integration
- [x] Mobile-optimized UI
- [x] Error handling & loading states
- [ ] Multi-language support (Amharic)
- [ ] Bank account integration
- [ ] Export to PDF/Excel
- [ ] Dark/Light theme improvements

## 🤝 Contributing

This project was built with [v0.app](https://v0.app). Contributions welcome!

## 📄 License

Private project - All rights reserved

## 🔗 Links

- **Live Demo**: [Deployed on Vercel](https://vercel.com/boatests-projects/v0-finethioplanner)
- **Original Build**: [v0.app Chat](https://v0.app/chat/SAK5wYCfB7F)

---

Made with ❤️ for Ethiopian professionals