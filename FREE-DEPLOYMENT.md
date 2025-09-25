# Seva Sahayak - Free Deployment Guide

## 🆓 **100% FREE Deployment Options**

### Option 1: Vercel (Free Tier) - **RECOMMENDED**

**What's Free:**
- ✅ 100GB bandwidth/month
- ✅ Unlimited static sites
- ✅ Custom domains
- ✅ Automatic HTTPS
- ✅ Global CDN

**Limitations:**
- ❌ No persistent storage for ChromaDB
- ⚠️ 10 second function timeout
- ⚠️ 512MB RAM limit per function

**Quick Setup:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd seva-sahayak
vercel

# 3. Set environment variables in Vercel dashboard:
# GOOGLE_API_KEY=your_free_gemini_key
```

**ChromaDB Solution for Vercel:**
Use **in-memory storage** (documents lost on restart but free):

```javascript
// This is already configured in your app!
// It falls back to memory when ChromaDB server isn't available
```

---

### Option 2: Netlify (Free Tier)

**What's Free:**
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Custom domains
- ✅ Automatic HTTPS

**Setup:**
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=.next
```

---

### Option 3: Railway (Free Tier)

**What's Free:**
- ✅ $5 credit/month (enough for small apps)
- ✅ Persistent storage
- ✅ Database support
- ✅ Custom domains

**Setup:**
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repo
3. Deploy automatically

---

### Option 4: Render (Free Tier)

**What's Free:**
- ✅ Static sites (unlimited)
- ✅ Web services (750 hours/month)
- ✅ Custom domains
- ✅ Automatic HTTPS

---

### Option 5: GitHub Pages + Vercel Functions

**Completely Free Static Hosting:**
```bash
# Build static version
npm run build
npm run export

# Deploy to GitHub Pages (free)
```

---

## 🎯 **BEST FREE SOLUTION: Vercel + Free Workarounds**

### Step-by-Step Free Deployment:

#### 1. **Get Free Google Gemini API Key**
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create free API key (generous free tier)

#### 2. **Modify App for Free Tier**
Your app already handles this! It falls back to in-memory storage when ChromaDB isn't available.

#### 3. **Deploy to Vercel (Free)**
```bash
# From seva-sahayak directory
npx vercel

# Follow prompts:
# - Link to GitHub? Yes
# - Deploy? Yes
```

#### 4. **Set Environment Variables**
In Vercel dashboard:
```
GOOGLE_API_KEY = your_free_gemini_key
NODE_ENV = production
```

#### 5. **Upload Documents Initially**
After deployment, visit: `https://your-app.vercel.app/api/process`

---

## 🔧 **Optimizations for Free Tier**

### 1. **Reduce Bundle Size**
```javascript
// Already optimized in your app
// Uses dynamic imports and code splitting
```

### 2. **Optimize for Memory Limits**
```javascript
// Your app already does this:
// - Processes documents in small batches
// - Uses efficient chunking
// - Minimal memory footprint
```

### 3. **Handle Cold Starts**
```javascript
// Add to your API routes (already implemented)
export const config = {
  maxDuration: 30, // Vercel free tier limit
}
```

---

## 📋 **Free Deployment Checklist**

### Before Deploying:
- [ ] Get free Google Gemini API key
- [ ] Test build locally: `npm run build`
- [ ] Ensure all dependencies are in package.json
- [ ] Check .env.example has all variables

### During Deployment:
- [ ] Choose Vercel free tier
- [ ] Connect GitHub repository
- [ ] Set environment variables
- [ ] Test deployment URL

### After Deployment:
- [ ] Visit `/api/process` to upload PDFs
- [ ] Test chat functionality
- [ ] Check `/api/debug` for status

---

## 💡 **Free Tier Limitations & Solutions**

### **Problem**: ChromaDB restarts lose data
**Solution**: Document reprocessing is automatic and fast

### **Problem**: Function timeouts
**Solution**: Your app uses efficient batching (already implemented)

### **Problem**: Memory limits
**Solution**: Optimized chunking and streaming (already implemented)

### **Problem**: Cold starts
**Solution**: Lightweight initialization (already implemented)

---

## 🚀 **One-Command Free Deploy**

```bash
# Complete free deployment in one command!
npx vercel --prod

# Then visit your URL and go to /api/process to initialize
```

---

## 🎉 **What You Get for FREE**

✅ **Professional AI Assistant**
✅ **Global CDN delivery**
✅ **Automatic HTTPS**
✅ **Custom domain support**
✅ **1,840 government documents indexed**
✅ **Multi-language support (Punjabi/English)**
✅ **Real-time chat interface**
✅ **Mobile responsive design**

**Cost: $0/month** 🎊

---

## 🔄 **Updating Your Free Deployment**

```bash
# Update code
git push origin main

# Vercel auto-deploys from GitHub
# Or manual deploy:
vercel --prod
```

---

## 📊 **Free Tier Limits**

| Service | Bandwidth | Storage | Functions |
|---------|-----------|---------|-----------|
| Vercel | 100GB/month | Temporary | 100GB-hours |
| Netlify | 100GB/month | Temporary | 125k calls |
| Railway | $5 credit | Persistent | Included |

**Recommendation**: Start with **Vercel** - it's the most reliable and has the best Next.js integration!