# 🚀 Quick Start - View Your Liq Finance App

## ✅ Everything is Ready!

The app is fully set up and ready to run. Follow these simple steps:

## Step 1: Start the Development Server

Open your terminal and run:

```bash
cd /home/engine/project
pnpm dev
```

You should see output like:
```
VITE v5.4.21  ready in 267 ms

➜  Local:   http://localhost:3000/
➜  Network: http://10.16.22.115:3000/
```

## Step 2: Open in Your Browser

Click or copy one of these URLs:

- **Local**: http://localhost:3000/
- **Network**: http://10.16.22.115:3000/

## 🎯 What You'll See

When you open the app, you'll experience:

1. **Onboarding Flow** (First time)
   - Welcome screen
   - Enter your name
   - Set up first profile
   
2. **Main Dashboard**
   - Balance cards
   - Quick action buttons
   - Transaction feed
   - Bottom navigation

3. **5 Main Sections** (Bottom Nav)
   - 🏠 Dashboard - Overview
   - 💳 Accounts - Account management  
   - 📊 Budget - Spending tracking
   - 🎯 Goals - Savings goals
   - 🤝 Community - Iqub/Iddir tracking

## 📱 Features to Try

### Add a Transaction
1. Click the "+" button
2. Choose Income or Expense
3. Enter amount, category, description
4. Save

### Create a Budget
1. Go to Budget tab
2. Click "Set Budget"
3. Choose category and amount
4. Track your spending

### Set a Savings Goal
1. Go to Goals tab
2. Click "New Goal"
3. Name your goal and set target
4. Track progress

### Track Iqub (Community Finance)
1. Go to Community tab
2. Click "Add Iqub"
3. Enter details (members, amount, cycle)
4. Track payments and winnings

## 🎨 Customize Your Experience

### Switch Profiles
- Tap your avatar (top left)
- Choose: Personal, Family, or Business

### Toggle Calendar
- Click the calendar pill (top area)
- Switch between Gregorian (GC) and Ethiopian (EC)

### Change Theme
- Look for theme toggle in settings
- Switch between Light and Dark mode

### Language
- Settings → Language
- Choose English or Amharic (አማርኛ)

## ⚡ Pro Tips

1. **Works Offline**: All data saved locally in your browser
2. **No Login Required**: Get started immediately in demo mode
3. **PWA Install**: Add to home screen for app-like experience
4. **Safe to Test**: Your data is private and local only

## 🛠️ Troubleshooting

### Port 3000 Already in Use?
Vite will automatically use the next available port (3001, 3002, etc.)

### Can't See the App?
1. Make sure the dev server is running (check terminal)
2. Try refreshing the browser (Ctrl+R or Cmd+R)
3. Clear browser cache if needed (Ctrl+Shift+R)

### Want to Stop the Server?
Press `Ctrl+C` in the terminal

### Want to Run in Background?
```bash
pnpm dev > dev-server.log 2>&1 &
```

Then check logs:
```bash
tail -f dev-server.log
```

## 📚 More Information

- Full app overview: `APP_OVERVIEW.md`
- Detailed guide: `HOW_TO_VIEW_APP.md`
- Setup instructions: `SETUP.md`
- README: `README.md`

---

## 🎉 You're All Set!

Now run `pnpm dev` and start exploring your Ethiopian financial planning app!

**Note**: The app works perfectly without backend services. Everything is stored locally in your browser's localStorage. You can add Supabase and Gemini API keys later for cloud sync and AI features.

Happy budgeting! 🇪🇹💰
