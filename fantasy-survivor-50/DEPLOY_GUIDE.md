# Fantasy Survivor 50 — Deployment Guide

## What You Need
- A computer with a web browser
- A Google account (for Firebase — free)
- A GitHub account (for Vercel deployment — free)
- Optionally: a domain name (~$10-15/year from Namecheap, Google Domains, etc.)

## Total cost: $0 if you use the free Vercel URL, ~$12/year if you want a custom domain

---

## Step 1: Set Up Firebase (your database)

1. Go to https://console.firebase.google.com
2. Click "Create a project" (or "Add project")
3. Name it something like `fantasy-survivor-50`
4. Disable Google Analytics (you don't need it)
5. Click "Create project"

### Enable Firestore Database:
1. In the left sidebar, click "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in **test mode**" (we'll lock this down later)
4. Pick the closest server location to you (us-east1 is fine)
5. Click "Enable"

### Get your Firebase config:
1. In the Firebase console, click the ⚙️ gear icon → "Project settings"
2. Scroll down to "Your apps" → click the web icon `</>`
3. Name the app "Fantasy Survivor"
4. DON'T check "Firebase Hosting"
5. Click "Register app"
6. You'll see a code block with `firebaseConfig`. Copy these values:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId

### Paste them into your code:
Open `src/firebase.js` and replace the placeholder values with your real ones.

---

## Step 2: Push to GitHub

1. Go to https://github.com and sign in (or create an account)
2. Click the `+` in the top right → "New repository"
3. Name it `fantasy-survivor-50`
4. Make it **private** (your Firebase config is in here)
5. Click "Create repository"

### Upload the project files:
The easiest way (no command line needed):
1. On your new repo page, click "uploading an existing file"
2. Drag and drop ALL the files from the project folder
3. Make sure the folder structure is preserved:
   ```
   package.json
   vite.config.js
   index.html
   src/
     main.jsx
     App.jsx
     firebase.js
     gameData.js
   ```
4. Click "Commit changes"

**OR if you're comfortable with command line:**
```bash
cd fantasy-survivor-50
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fantasy-survivor-50.git
git push -u origin main
```

---

## Step 3: Deploy on Vercel

1. Go to https://vercel.com and sign up with your GitHub account
2. Click "Add New..." → "Project"
3. Find and import your `fantasy-survivor-50` repo
4. Vercel auto-detects it's a Vite project — settings should be fine as-is
5. Click "Deploy"
6. Wait ~60 seconds. Done!

You'll get a URL like: `fantasy-survivor-50.vercel.app`

### Custom domain (optional):
1. In Vercel, go to your project → "Settings" → "Domains"
2. Add your custom domain
3. Follow Vercel's instructions to update your DNS records

---

## Step 4: Lock Down Firebase

Once everything is working, update your Firestore security rules:

1. In Firebase console → Firestore → "Rules" tab
2. Replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leagues/{leagueId} {
      allow read, write: if true;
    }
  }
}
```

This allows anyone to read/write league data (which is what you want — your friends need access). The passwords in the app handle user-level access.

**Note:** This is simple security for a friend group app. The passwords are stored in Firestore as plain text. This is fine for a casual fantasy league but would not be appropriate for anything with sensitive data.

---

## Step 5: Test It

1. Visit your Vercel URL
2. Add `?dev=torchsnuffer` to the URL to activate dev mode
3. Register as the first user (you'll auto-become commissioner)
4. Set up teams, test scoring, etc.
5. Share the URL with your league!

---

## Dev Mode

Access: `yoursite.com?dev=torchsnuffer`

What it gives you:
- **Impersonate any user** — click their name to see their view
- **Seed test users** — quickly add fake users for testing
- **View raw state** — see the entire database as JSON
- **Full reset** — nuclear option to wipe everything
- **All commissioner powers** — regardless of who you're logged in as

Your friends will never see this unless they know the password.

**To change the dev password:** Edit `src/App.jsx` and change the `DEV_PASSWORD` constant.

---

## How Scoring Works Each Week

After each episode, Vito (or whoever is commissioner):
1. Logs in → goes to "Scores" tab
2. Sets the episode number
3. For each event that happened:
   - Select the contestant
   - Select the event type
   - Click "Add Event"
4. Optionally write an episode recap
5. Mark eliminated contestants in Commissioner → Elimination Tracker

All scores update in **real-time** for everyone. Firebase syncs automatically.

---

## Troubleshooting

**"Firebase error" on load:**
- Double-check your firebase.js config values
- Make sure Firestore is enabled in your Firebase console

**Blank screen:**
- Open browser dev tools (F12) → Console tab → look for red errors
- Usually a missing Firebase config or typo

**Friends can't access:**
- Make sure your Vercel deployment is live
- Share the exact URL (not localhost)

**Need to start over:**
- Use dev mode's "Full Reset" button, OR
- In Firebase console → Firestore → delete the `leagues` collection
