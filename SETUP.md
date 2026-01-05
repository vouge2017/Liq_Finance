# FinEthio Planner - Setup Guide

Complete setup guide for deploying and sharing your FinEthio Planner app.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Set Up Supabase Backend (Free Tier)

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings** → **API** and copy:
   - Project URL
   - Anon/Public Key

4. Run the database migrations:
   - Go to **SQL Editor** in Supabase dashboard
   - Run `scripts/001_create_tables.sql`
   - Run `scripts/002_enable_rls.sql`
   - Run `scripts/003_create_profile_trigger.sql`

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Alternative for Vite (if needed)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services (Optional - for receipt scanning and AI advisor)
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

The app will be available at `http://localhost:3000`

## 📱 PWA Setup (For Easy Sharing)

The app is now configured as a Progressive Web App (PWA). This means:

### For Users:
- **Install on Phone**: Open the app in a browser, tap the browser menu, and select "Add to Home Screen"
- **Works Offline**: Basic functionality works without internet
- **No App Store Needed**: Share the link directly with friends

### For Deployment:
1. Deploy to Vercel, Netlify, or any static host
2. Ensure HTTPS is enabled (required for PWA)
3. Share the URL with your friends/colleagues

## 🔐 Authentication Setup

The app uses Supabase Auth. Currently supports:
- Email/Password authentication
- Phone authentication (Ethiopian format)

To enable phone auth:
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Phone provider
3. Configure SMS settings (may require paid plan for production)

## 📦 Building for Production

```bash
npm run build
# or
pnpm build
```

The built files will be in the `dist` folder.

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Free)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Option 2: Netlify (Free)
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables

### Option 3: Self-Hosted
- Use any static file server (nginx, Apache, etc.)
- Ensure HTTPS is enabled for PWA features

## 📲 Sharing Without Google Play Store

### Method 1: PWA (Easiest)
1. Deploy to a public URL (Vercel/Netlify)
2. Share the link
3. Users can install from browser

### Method 2: Direct APK (Advanced)
1. Use Capacitor or React Native to build APK
2. Share APK file directly
3. Users enable "Install from unknown sources"

### Method 3: Alternative Stores
- **F-Droid**: Free, open-source app store
- **APKPure**: Popular alternative
- **Amazon Appstore**: Another option

## 🛠️ Troubleshooting

### Supabase Connection Issues
- Check environment variables are set correctly
- Verify Supabase project is active
- Check browser console for errors

### PWA Not Installing
- Ensure site is served over HTTPS
- Check manifest.json is accessible
- Verify service worker is registered

### Build Errors
- Clear `node_modules` and reinstall
- Check Node.js version (18+ recommended)
- Verify all environment variables are set

## 📚 Features

✅ **Expense Tracking**: Track income and expenses
✅ **Budget Management**: Set budgets by category
✅ **Savings Goals**: Set and track financial goals
✅ **Iqub & Iddir**: Ethiopian community finance tracking
✅ **AI Advisor**: Get personalized financial advice
✅ **Receipt Scanning**: OCR for automatic transaction entry
✅ **Multi-Profile**: Personal, Family, Business views
✅ **Ethiopian Calendar**: Support for Ge'ez calendar
✅ **Offline Support**: Works without internet

## 🔒 Privacy & Security

- All data is encrypted in transit (HTTPS)
- Supabase RLS (Row Level Security) ensures data isolation
- No data is shared with third parties
- Local-first architecture for privacy

## 📞 Support

For issues or questions:
1. Check the documentation in `/docs` folder
2. Review error messages in browser console
3. Check Supabase dashboard for database issues

## 🎉 You're Ready!

Your FinEthio Planner is now set up and ready to share. Users can:
- Install it as a PWA on their phones
- Use it offline
- Sync data across devices (with Supabase)
- Get AI-powered financial advice

Happy planning! 💰

