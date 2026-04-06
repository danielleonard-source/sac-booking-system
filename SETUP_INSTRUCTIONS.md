# 📦 DOWNLOAD & SETUP INSTRUCTIONS

## 🎯 YOU HAVE 25 FILES TO DOWNLOAD

All files are available above. Here's what to do with them!

---

## 📥 STEP 1: DOWNLOAD ALL FILES

Click each file link above and download them. You'll get 25 files total.

---

## 📁 STEP 2: CREATE FOLDER STRUCTURE

Create a new folder called `sac-booking-react` on your computer, then create this exact structure:

```
sac-booking-react/
│
├── package.json                    ⬅️ Download this
├── vite.config.js                  ⬅️ Download this
├── tailwind.config.js              ⬅️ Download this
├── postcss.config.js               ⬅️ Download this
├── .eslintrc.cjs                   ⬅️ Download this
├── .gitignore                      ⬅️ Download this
├── index.html                      ⬅️ Download this
├── README.md                       ⬅️ Download this
├── QUICKSTART.md                   ⬅️ Download this
├── PROJECT_COMPLETE.md             ⬅️ Download this
│
└── src/
    ├── main.jsx                    ⬅️ Download this
    ├── App.jsx                     ⬅️ Download this
    ├── config.js                   ⬅️ Download this
    ├── index.css                   ⬅️ Download this
    │
    ├── api/
    │   └── client.js               ⬅️ Download this
    │
    ├── store/
    │   ├── authStore.js            ⬅️ Download this
    │   ├── dataStore.js            ⬅️ Download this
    │   └── uiStore.js              ⬅️ Download this
    │
    ├── utils/
    │   └── helpers.js              ⬅️ Download this
    │
    └── components/
        ├── Login.jsx               ⬅️ Download this
        ├── Calendar.jsx            ⬅️ Download this
        ├── BookingFormModal.jsx    ⬅️ Download this
        ├── AdminPanel.jsx          ⬅️ Download this
        ├── LoadingOverlay.jsx      ⬅️ Download this
        └── NotificationToast.jsx   ⬅️ Download this
```

---

## 📋 STEP 3: ORGANIZE THE FILES

### **Root Folder** (sac-booking-react/)
Put these 10 files directly in the root:
1. `package.json`
2. `vite.config.js`
3. `tailwind.config.js`
4. `postcss.config.js`
5. `.eslintrc.cjs`
6. `.gitignore`
7. `index.html`
8. `README.md`
9. `QUICKSTART.md`
10. `PROJECT_COMPLETE.md`

### **src/ folder**
Create a folder called `src` and put these 4 files in it:
1. `main.jsx`
2. `App.jsx`
3. `config.js`
4. `index.css`

### **src/api/ folder**
Inside `src`, create a folder called `api` and put this file in it:
1. `client.js`

### **src/store/ folder**
Inside `src`, create a folder called `store` and put these 3 files in it:
1. `authStore.js`
2. `dataStore.js`
3. `uiStore.js`

### **src/utils/ folder**
Inside `src`, create a folder called `utils` and put this file in it:
1. `helpers.js`

### **src/components/ folder**
Inside `src`, create a folder called `components` and put these 6 files in it:
1. `Login.jsx`
2. `Calendar.jsx`
3. `BookingFormModal.jsx`
4. `AdminPanel.jsx`
5. `LoadingOverlay.jsx`
6. `NotificationToast.jsx`

---

## ⚙️ STEP 4: INSTALL NODE.JS

**Download Node.js:** https://nodejs.org/

1. Click the **green "LTS" button** (Long Term Support)
2. Run the installer
3. Click "Next" through all the prompts
4. Restart your computer (important!)

**Verify installation:**
Open Terminal/Command Prompt and type:
```bash
node --version
```
You should see: `v18.17.0` or similar

---

## 🔧 STEP 5: CONFIGURE YOUR BACKEND URL

**IMPORTANT!** You must do this before running the app.

1. Open `src/config.js`
2. Find line 8:
   ```javascript
   SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
   ```
3. Replace `YOUR_DEPLOYMENT_ID` with your actual Google Apps Script URL
4. Save the file

**Example:**
```javascript
SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxFLONgR6xFJoE1ASr68JLAVi1HzXwFd1utefr3uJDC5r2RkKEWG0DJw6mtd_Mft3xN_w/exec',
```

---

## 🚀 STEP 6: INSTALL DEPENDENCIES

1. **Open Terminal/Command Prompt** in the `sac-booking-react` folder

   **Windows:**
   - Right-click the folder
   - Click "Open in Terminal" or "Open PowerShell window here"

   **Mac:**
   - Right-click the folder
   - Hold Option key → Click "Open Terminal at folder"

2. **Run this command:**
   ```bash
   npm install
   ```

3. **Wait ~2 minutes** while it downloads all packages

4. **You should see:**
   ```
   added 312 packages in 1m
   ```

---

## ▶️ STEP 7: RUN THE APP

**In the same terminal, run:**
```bash
npm run dev
```

**What happens:**
- Server starts in ~2 seconds
- Browser opens automatically at `http://localhost:3000`
- You see the login screen!

---

## 🎉 STEP 8: TEST IT!

**Login with:**
- Email: `daniel.leonard@beth.school.nz`
- Code: `ADMIN` (or any code - admins bypass code check)

**You should see:**
- ✅ Login works
- ✅ Calendar displays
- ✅ Click a slot → Booking form opens
- ✅ Admin Panel tab appears (for admins)
- ✅ Everything works!

---

## 🔥 HOT RELOAD TEST

Want to see the magic of Vite?

1. **Keep the browser open**
2. **Open `src/App.jsx` in a text editor**
3. **Change any text** (like "SAC Booking System")
4. **Save the file**
5. **Watch the browser** - it updates INSTANTLY! ⚡

No refresh needed! This is why React + Vite is amazing!

---

## 🛑 TO STOP THE SERVER

**In the terminal, press:** `Ctrl+C`

**To start again:** `npm run dev`

---

## 📦 TROUBLESHOOTING

### ❌ "npm: command not found"
**Fix:** Install Node.js (Step 4)

### ❌ "Cannot find module 'react'"
**Fix:** Run `npm install` again

### ❌ "Port 3000 is already in use"
**Fix:** 
1. Kill the process on port 3000
2. Or change port in `vite.config.js` to 3001

### ❌ "Failed to load data"
**Fix:** 
1. Check `src/config.js` - is SCRIPT_URL correct?
2. Is your Google Apps Script deployed?
3. Open browser console (F12) - what error do you see?

### ❌ Files in wrong folders
**Fix:** 
Double-check the folder structure in Step 2. Every file must be in the exact right place.

---

## 🎯 DAILY WORKFLOW

**Every time you want to work on the app:**

1. Open Terminal in the `sac-booking-react` folder
2. Run: `npm run dev`
3. Browser opens automatically
4. Make changes to any file
5. Save → Browser updates instantly!
6. When done, press `Ctrl+C` to stop

---

## 📖 WHAT TO READ NEXT

1. **QUICKSTART.md** - 10-minute detailed setup guide
2. **README.md** - Full documentation
3. **PROJECT_COMPLETE.md** - Features & overview

---

## 🌐 DEPLOYING TO PRODUCTION

**When you're ready to deploy:**

```bash
# Build for production
npm run build

# Creates a 'dist' folder with optimized files
# Upload the 'dist' folder to:
# - GitHub Pages (free)
# - Netlify (free)
# - Vercel (free)
```

---

## ✅ CHECKLIST

Before you start, make sure you have:

- [ ] Downloaded all 25 files
- [ ] Created correct folder structure
- [ ] Files in correct locations
- [ ] Node.js installed
- [ ] Updated `src/config.js` with your SCRIPT_URL
- [ ] Ran `npm install`
- [ ] Ran `npm run dev`
- [ ] App opens in browser
- [ ] Login works

If all checked ✅ - **YOU'RE READY!** 🎉

---

## 💡 QUICK REFERENCE

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Start dev server | `npm run dev` |
| Stop server | `Ctrl+C` |
| Build for production | `npm run build` |
| Preview production build | `npm run preview` |

---

## 🆘 NEED HELP?

1. Check the error message in terminal
2. Check browser console (F12)
3. Read README.md for detailed help
4. Make sure folder structure is EXACT
5. Make sure you ran `npm install`

---

## 🎊 SUCCESS!

Once you see the login screen, you have successfully:

✅ Set up a modern React application  
✅ Installed all dependencies  
✅ Connected to your backend  
✅ Got instant hot reload working  
✅ Ready to use and customize!

**Welcome to React development!** 🚀

The hard part is done. Now you have a professional, maintainable codebase that's a joy to work with!

---

**Total Setup Time:** 15-20 minutes  
**Total Cost:** $0  
**Result:** Production-ready React app! 🎉
