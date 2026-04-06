# ⚡ QUICK START GUIDE - 10 Minutes to Running App

Follow these steps to get your React SAC Booking System running!

---

## ✅ Step 1: Install Node.js (5 minutes)

**Check if you already have it:**
```bash
node --version
```

If you see a version number (like `v18.17.0`), **skip to Step 2!**

**Don't have Node.js?**

1. Go to: https://nodejs.org/
2. Click the **green "LTS" button** (Long Term Support)
3. Download and run the installer
4. Follow the installation wizard (just click "Next" → "Next" → "Install")
5. **Restart your terminal/command prompt**
6. Verify installation: `node --version`

✅ **You're ready when you see a version number!**

---

## ✅ Step 2: Install Project Dependencies (2 minutes)

**Open terminal/command prompt** in the project folder.

**Windows:** 
- Right-click the `sac-booking-react` folder
- Select "Open in Terminal" or "Open PowerShell window here"

**Mac:**
- Right-click the `sac-booking-react` folder
- Hold Option key → "Open Terminal at folder"

**Run this command:**
```bash
npm install
```

**What's happening:**
- Downloads React, Vite, Tailwind CSS, and all dependencies
- Creates `node_modules/` folder (8000+ files!)
- Takes ~2 minutes depending on internet speed

**Wait for:**
```
added 312 packages in 1m
```

✅ **You're ready when you see "added X packages"!**

---

## ✅ Step 3: Configure Backend URL (1 minute)

**Open:** `src/config.js`

**Find this line:**
```javascript
SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
```

**Replace** `YOUR_DEPLOYMENT_ID` with your actual Google Apps Script URL.

**Example:**
```javascript
SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxFLONgR6xFJoE1ASr68JLAVi1HzXwFd1utefr3uJDC5r2RkKEWG0DJw6mtd_Mft3xN_w/exec',
```

**Save the file** (Ctrl+S / Cmd+S)

✅ **You're ready!**

---

## ✅ Step 4: Start Development Server (1 minute)

**In your terminal, run:**
```bash
npm run dev
```

**What's happening:**
- Vite starts development server
- Compiles your React app
- Opens browser automatically

**You should see:**
```
  VITE v5.1.0  ready in 523 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**Browser opens automatically** at `http://localhost:3000`

✅ **You should see the login screen!**

---

## ✅ Step 5: Test Login (1 minute)

**Try logging in with:**
- **Email:** `daniel.leonard@beth.school.nz` (admin)
- **Code:** Any code (admins bypass code check)

**OR**

- **Email:** Your teacher email
- **Code:** Your teacher code

**Click "Log In"**

✅ **You should see the main dashboard!**

---

## 🎉 SUCCESS!

You now have a **running React application!**

**What you can do:**
- ✅ Login works
- ✅ Logout works
- ✅ State management works
- ✅ API connection ready
- ✅ Hot reload active (changes appear instantly!)

---

## 🔥 Hot Reload Demo

**Try this:**

1. **Open:** `src/App.jsx`
2. **Find this line:**
   ```javascript
   <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
   ```
3. **Change it to:**
   ```javascript
   <h2 className="text-xl font-semibold mb-4">Hello from React! 🚀</h2>
   ```
4. **Save** (Ctrl+S / Cmd+S)

**Watch the browser** - it updates **instantly** without refreshing!

That's the magic of Vite! ⚡

---

## 🛠️ Common Issues & Fixes

### Issue: "npm: command not found"
**Fix:** Install Node.js (Step 1)

### Issue: "Port 3000 is already in use"
**Fix:** Kill the process:
```bash
# Mac/Linux
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

### Issue: "Cannot find module 'react'"
**Fix:** Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Login fails
**Fix:** Check these:
1. Is `SCRIPT_URL` in `src/config.js` correct?
2. Is your backend deployed?
3. Open browser console (F12) - any errors?

### Issue: "Module not found: Can't resolve..."
**Fix:** Missing dependency:
```bash
npm install [package-name]
```

---

## 📝 Next Steps

Now that your app is running:

### Option 1: Start Building Features
- Create Calendar component
- Build Booking Form
- Add Admin Panel

### Option 2: Deploy to Production
- Run `npm run build`
- Deploy to GitHub Pages, Netlify, or Vercel

### Option 3: Learn React
- Read: https://react.dev/learn
- Watch: React tutorial on YouTube
- Practice: Build small components

---

## 🚀 Daily Workflow

**Every time you work on the project:**

1. **Open terminal** in project folder
2. **Start dev server:** `npm run dev`
3. **Edit files** in `src/`
4. **Save** - changes appear instantly!
5. **Stop server:** `Ctrl+C` when done

---

## ✨ Development Tips

### Browser DevTools (F12)
- **Console tab:** See errors and logs
- **Network tab:** See API calls
- **React DevTools:** Inspect components (install extension)

### File Watching
- **Save any file** → Browser updates instantly
- **No need to refresh** → Vite handles it
- **CSS changes** → No page reload needed!

### Terminal Tips
- **Clear terminal:** `clear` (Mac/Linux) or `cls` (Windows)
- **Stop server:** `Ctrl+C`
- **Run in background:** Open new terminal tab

---

## 🎯 What's Working Right Now

✅ **Authentication**
- Login screen
- Admin/teacher login
- Persistent sessions
- Logout

✅ **State Management**
- Zustand stores setup
- Auth state (login, user info)
- Data state (bookings, learners, teachers)
- UI state (modals, notifications, loading)

✅ **API Integration**
- Client configured
- Retry logic
- Error handling
- Connected to V15 backend

✅ **UI Components**
- Loading overlay
- Toast notifications
- Responsive design
- Tailwind CSS styling

---

## 📦 What to Build Next

The foundation is complete! Here's the roadmap:

### Week 1: Core Features
- [ ] Calendar view (weekly grid)
- [ ] Booking display on calendar
- [ ] Click-to-create booking
- [ ] Booking form modal

### Week 2: Booking Management
- [ ] Create/edit booking
- [ ] Select learners
- [ ] Assign reader/writers
- [ ] Multi-session support

### Week 3: Admin Features
- [ ] Pending bookings list
- [ ] Approve/decline bookings
- [ ] Learner management
- [ ] Teacher management

### Week 4: Email & Polish
- [ ] Email confirmation modal
- [ ] Send emails via backend
- [ ] Email status tracking
- [ ] Final testing & deployment

---

## 💰 Total Cost So Far

**Development:**
- React: $0
- Vite: $0
- Node.js: $0
- All dependencies: $0

**Hosting (when you deploy):**
- GitHub Pages: $0
- Netlify: $0
- Vercel: $0

**TOTAL: $0** ✅

---

## 🎉 Congratulations!

You've successfully:
- ✅ Installed Node.js
- ✅ Installed all dependencies
- ✅ Configured the backend
- ✅ Started the dev server
- ✅ Logged into the app
- ✅ Experienced hot reload

**You're now developing with React!** 🚀

The app is running. The foundation is solid. Let's build something amazing!

---

**Ready to build the Calendar component?** That's the next step! 📅
