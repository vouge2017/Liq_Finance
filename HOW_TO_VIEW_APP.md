# How to View the Liq Finance App 🚀

## ✅ App is Currently Running!

The development server is now active and ready to use.

## 🌐 Access the App

### Local Access (Same Machine)
Open your browser and navigate to:
```
http://localhost:3000/
```

### Network Access (Other Devices on Same Network)
From other devices on your network, use:
```
http://10.16.22.115:3000/
```

## 📱 View on Mobile Device

1. Make sure your phone/tablet is on the **same WiFi network**
2. Open browser on your mobile device
3. Navigate to: `http://10.16.22.115:3000/`
4. Tap "Add to Home Screen" to install as PWA

## 🔄 Server Management

### Check if Server is Running
```bash
cd /home/engine/project
ps aux | grep vite
```

### View Server Logs
```bash
tail -f /home/engine/project/dev-server.log
```

### Stop the Server
```bash
# Find the process
ps aux | grep vite

# Kill the process (replace PID with actual process ID)
kill <PID>
```

### Restart the Server
```bash
cd /home/engine/project
pnpm dev
```

## 🎯 Quick Start Commands

### Start Development Server (Foreground)
```bash
cd /home/engine/project
pnpm dev
```
Press `Ctrl+C` to stop

### Start Development Server (Background)
```bash
cd /home/engine/project
pnpm dev > dev-server.log 2>&1 &
```

### Build for Production
```bash
pnpm build
```

### Preview Production Build
```bash
pnpm preview
```

## 🧪 Testing the App

### What You Can Do Without Backend:
- ✅ View the dashboard
- ✅ Add transactions (stored locally)
- ✅ Create budgets
- ✅ Set savings goals
- ✅ Track Iqub/Iddir
- ✅ Switch profiles (Personal/Family/Business)
- ✅ Toggle Ethiopian calendar
- ✅ Test offline functionality
- ✅ Install as PWA

### What Requires Backend Services:
- ❌ User authentication (Supabase)
- ❌ Multi-device sync (Supabase)
- ❌ AI Advisor chat (Gemini API)
- ❌ Receipt OCR scanning (Gemini API)

**Don't worry!** The app works perfectly in demo/offline mode. All your data is saved in your browser's localStorage.

## 🔧 Troubleshooting

### Port Already in Use
If port 3000 is busy, Vite will automatically use the next available port (3001, 3002, etc.)

### Cannot Access from Mobile
1. Check both devices are on the same network
2. Disable firewall temporarily to test
3. Try the localhost URL if testing on the same machine

### App Not Loading
1. Check dev server is running: `ps aux | grep vite`
2. View logs: `cat dev-server.log`
3. Restart server: `kill <PID>` then `pnpm dev`

### White Screen / Errors
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check browser console (F12) for errors
3. View server logs for build errors

## 🎨 Features to Try

1. **Dashboard**
   - View balance cards
   - Add quick transaction
   - See transaction feed

2. **Accounts**
   - Create multiple accounts
   - Track balances
   - Transfer between accounts

3. **Budget**
   - Set category budgets
   - View spending vs. allocation
   - Get overspending warnings

4. **Goals**
   - Create savings goals
   - Track progress
   - Celebrate achievements

5. **Community**
   - Set up Iqub (rotating savings)
   - Track Iddir contributions
   - Manage members and cycles

6. **Settings**
   - Switch profiles (Personal/Family/Business)
   - Toggle dark/light theme
   - Switch calendar (Gregorian ⟷ Ethiopian)
   - Change language (English/Amharic)

## 📸 Install as PWA

### On Chrome/Edge (Desktop)
1. Click the install icon in the address bar (⊕)
2. Click "Install"
3. App opens in its own window

### On Mobile (Android)
1. Open the app in Chrome
2. Tap the menu (⋮)
3. Tap "Add to Home screen"
4. Tap "Add"
5. App appears on your home screen like a native app!

### On Mobile (iOS/Safari)
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. App icon appears on your home screen

## 🆘 Need Help?

Check the logs:
```bash
cat /home/engine/project/dev-server.log
```

Check for TypeScript errors:
```bash
cd /home/engine/project
pnpm tsc --noEmit
```

Run tests:
```bash
pnpm test
```

---

**Happy testing!** 🎉

The app should now be visible at http://localhost:3000/

Enjoy exploring your Ethiopian financial planning app! 🇪🇹💰
