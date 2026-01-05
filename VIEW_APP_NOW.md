# 🎯 VIEW YOUR LIQ FINANCE APP - SIMPLE STEPS

## ⚡ FASTEST WAY (Copy & Paste This)

```bash
cd /home/engine/project && pnpm dev
```

**Then open your browser to:** http://localhost:3000/

---

## 📋 What Just Happened?

I've set up everything you need to view your Liq Finance app:

### ✅ Created Files:
1. **`.env`** - Environment configuration (app works without backend)
2. **`START_SERVER.md`** - Detailed instructions
3. **`HOW_TO_VIEW_APP.md`** - Complete guide with troubleshooting
4. **`start-app.sh`** - Quick start script
5. **`APP_OVERVIEW.md`** - Full app documentation

### ✅ App is Ready:
- All dependencies installed ✓
- Configuration set up ✓
- No backend needed for demo ✓
- Works completely offline ✓

---

## 🚀 THREE WAYS TO START

### Option 1: Direct Command (Recommended)
```bash
cd /home/engine/project
pnpm dev
```

### Option 2: Use the Script
```bash
./start-app.sh
```

### Option 3: Background Mode
```bash
cd /home/engine/project
pnpm dev > server.log 2>&1 &
```

---

## 🌐 Access URLs

Once the server starts, open:

- **Local Machine**: http://localhost:3000/
- **Network Devices**: http://10.16.22.115:3000/

---

## 📱 What You Can Do (No Backend Needed!)

### Immediate Features:
- ✅ Add transactions (income/expense)
- ✅ Track multiple accounts
- ✅ Set and monitor budgets
- ✅ Create savings goals
- ✅ Track Iqub & Iddir (Ethiopian community finance)
- ✅ Switch between profiles (Personal/Family/Business)
- ✅ Toggle Ethiopian calendar
- ✅ Dark/Light theme
- ✅ Works offline
- ✅ Install as PWA

### Optional (Requires API Keys):
- ⚠️ AI Advisor chat (needs Gemini API)
- ⚠️ Receipt OCR scanning (needs Gemini API)
- ⚠️ Cloud sync (needs Supabase)
- ⚠️ Multi-device sync (needs Supabase)

**Don't worry about these!** The app is fully functional without them.

---

## 🎨 App Features Overview

### Dashboard
- Real-time balance overview
- Quick transaction entry
- Recent transaction feed
- Profile switcher

### Accounts
- Multiple account support
- Balance tracking
- Account transfers
- Transaction history

### Budget
- Category-based budgets
- Spending vs. allocation
- Overspending alerts
- "Safe to spend" calculator

### Goals
- Savings goal tracking
- Progress visualization
- Goal prioritization
- Achievement celebrations

### Community (Unique!)
- **Iqub**: Track rotating savings groups
- **Iddir**: Track social insurance contributions
- Member management
- Payment history

---

## 🛠️ Quick Commands

### Start Server
```bash
pnpm dev
```

### Stop Server
Press `Ctrl+C`

### View in Browser
http://localhost:3000/

### Check if Running
```bash
ps aux | grep vite
```

### View Logs (if running in background)
```bash
tail -f server.log
```

---

## 📸 Install as Mobile App

### Android (Chrome)
1. Open http://localhost:3000/
2. Menu → "Add to Home screen"
3. Works like native app!

### iOS (Safari)
1. Open http://localhost:3000/
2. Share → "Add to Home Screen"
3. App icon on home screen!

---

## 🎯 First Steps in the App

1. **Complete Onboarding**
   - Enter your name
   - Choose profile type

2. **Add Your First Transaction**
   - Click the "+" button
   - Choose Income or Expense
   - Fill in details

3. **Set a Budget**
   - Go to Budget tab
   - Add category budgets
   - Track spending

4. **Create a Goal**
   - Go to Goals tab
   - Set savings target
   - Watch progress grow

5. **Try Ethiopian Features**
   - Community tab → Add Iqub
   - Toggle Ethiopian calendar
   - Try Amharic language

---

## 🧪 Test Data

The app starts empty. Add some test data:

### Sample Transactions:
- Income: Salary 35,000 ETB
- Expense: Coffee 45 ETB
- Expense: Transport 120 ETB
- Expense: Groceries 850 ETB

### Sample Budget:
- Food: 5,000 ETB/month
- Transport: 2,000 ETB/month
- Entertainment: 1,500 ETB/month

### Sample Goal:
- Emergency Fund: 50,000 ETB
- Laptop: 85,000 ETB

---

## 💡 Pro Tips

1. **Data is Local**: Everything stored in browser localStorage
2. **Private & Secure**: No data sent anywhere without backend
3. **Works Offline**: Full functionality without internet
4. **No Login**: Start using immediately
5. **Safe to Experiment**: Clear data anytime from settings

---

## 🆘 Troubleshooting

### Server Won't Start?
```bash
# Kill existing process
pkill -f vite

# Try again
pnpm dev
```

### Port 3000 Busy?
Vite will auto-use next port (3001, 3002, etc.)

### App Not Loading?
1. Check terminal for errors
2. Try different browser
3. Clear cache (Ctrl+Shift+R)

### Want to Reset Everything?
```bash
# Clear node modules and reinstall
rm -rf node_modules
pnpm install
pnpm dev
```

---

## 📚 Documentation

- **This File**: Quick start guide
- **APP_OVERVIEW.md**: Complete app documentation
- **START_SERVER.md**: Detailed server instructions
- **HOW_TO_VIEW_APP.md**: Comprehensive guide
- **README.md**: Project overview
- **SETUP.md**: Development setup

---

## 🎉 YOU'RE READY!

### Just run this command:

```bash
cd /home/engine/project && pnpm dev
```

### Then open:

http://localhost:3000/

---

## 🇪🇹 About the App

**Liq Finance (FinEthio Planner)** is a culturally-aware financial planning app built specifically for Ethiopian professionals. It understands:

- Ethiopian Birr (ETB) currency
- Ge'ez calendar system
- Iqub & Iddir community finance
- Ethiopian banking (CBE, BOA, Dashen)
- Amharic language
- Ethiopian cultural financial practices

Built with React 19, TypeScript, Tailwind CSS, and modern PWA technology.

---

**Questions?** Check the documentation files or explore the app - it's intuitive and user-friendly!

**Happy Budgeting!** 💰🇪🇹✨
