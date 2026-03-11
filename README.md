# 🧘 Pulse — Personal Stress Tracker

A minimal, elegant stress tracker built with React.

---

## 🚀 Deploy to Vercel (Recommended — Free)

### Option A: Via GitHub (easiest long-term)
1. Create a free account at [github.com](https://github.com)
2. Create a new repository (e.g. `pulse-stress-tracker`)
3. Upload all these files (drag & drop in GitHub's UI)
4. Go to [vercel.com](https://vercel.com) → Sign up free with GitHub
5. Click **"Add New Project"** → Import your GitHub repo
6. Leave all settings as default → Click **Deploy**
7. 🎉 You'll get a live URL like `https://pulse-stress-tracker.vercel.app`

### Option B: Via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🌐 Deploy to Netlify (Alternative — Also Free)

1. Go to [netlify.com](https://netlify.com) → Sign up free
2. Click **"Add new site" → "Deploy manually"**
3. Run `npm run build` locally first to generate a `build/` folder
4. Drag & drop the `build/` folder onto Netlify
5. 🎉 Live instantly with a `https://xxxx.netlify.app` URL

---

## 💻 Run Locally

```bash
npm install
npm start
```

Opens at `http://localhost:3000`

---

## 📱 Features
- Log stress level (1–5), time of day, source, and notes
- 7-day bar chart of daily stress patterns
- Source frequency tracker (Work, Health, Anxiety)
- Time-of-day heatmap
- Personalized coping tips based on your patterns
- Data saved to browser localStorage (persists between visits)

---

## 🔧 Tech Stack
- React 18
- Pure CSS-in-JS (no extra dependencies)
- localStorage for persistence
