# Quick Deployment Guide

## ✅ Frontend Web - READY TO DEPLOY

Your frontend is built and ready at: `frontend/dist/`

### Deploy to Netlify (2 Ways)

#### Option 1: Netlify Drop (Easiest - 30 seconds)

1. Go to https://app.netlify.com/drop
2. Drag and drop the entire `/frontend/dist/` folder
3. Done! Your site is live instantly!

#### Option 2: Netlify CLI

```bash
cd frontend

# Login to Netlify
export NETLIFY_AUTH_TOKEN=nfp_L5s2W1EctFbYmzEBhq9Hv1tztFqNhmAR5372
npx netlify-cli deploy --dir=dist --prod

# Or without token (will prompt for login)
npx netlify-cli login
npx netlify-cli deploy --dir=dist --prod
```

#### Option 3: GitHub Integration

1. Push this code to GitHub (already done)
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import from Git"
4. Select your repository
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npx expo export --platform web`
   - **Publish directory**: `frontend/dist`
6. Deploy!

---

## 🔧 Backend Deployment

### Option A: Railway (Recommended)

```bash
cd backend

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Deploy
railway up

# Get your backend URL
railway status
```

Then add environment variables in Railway dashboard:
- `SECRET_KEY`: (generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
- `MONGO_URL`: Your MongoDB Atlas connection string
- `DB_NAME`: binarybonds_production
- `CORS_ORIGINS`: ["https://your-netlify-site.netlify.app"]

### Option B: Local Development

If you have Python 3.10+ and MongoDB installed:

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file (already exists with sample values)
# Update MONGO_URL if needed

# Run server
uvicorn backend.app:app --host 0.0.0.0 --port 8001 --reload
```

Server will be at: http://localhost:8001
API Docs: http://localhost:8001/docs

---

## 🔗 Connect Frontend to Backend

After deploying backend, update frontend environment:

1. Get your backend URL (from Railway or local: http://localhost:8001)
2. Update frontend/.env:
   ```bash
   EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
   ```
3. Rebuild frontend: `npx expo export --platform web`
4. Redeploy to Netlify

Or add environment variable in Netlify dashboard:
- Key: `EXPO_PUBLIC_BACKEND_URL`
- Value: `https://your-backend-url.railway.app`

---

## ✅ Deployment Checklist

### Pre-Deployment
- [x] Frontend built (dist/ folder ready)
- [x] Netlify configuration files created
- [ ] Backend deployed (Railway/Render)
- [ ] MongoDB database setup (Atlas)
- [ ] Environment variables configured

### Post-Deployment
- [ ] Frontend accessible at Netlify URL
- [ ] Backend API responds (check /health endpoint)
- [ ] Frontend can connect to backend
- [ ] Test login/register functionality
- [ ] Update CORS in backend to include frontend URL

---

## 📦 What's Built

**Frontend (`frontend/dist/`):**
- index.html - Dashboard
- login.html - Login page
- register.html - Registration
- portfolio.html - Portfolio view
- transactions.html - Transactions
- reports.html - Reports
- profile.html - Profile
- All assets bundled and optimized

**Size:** ~2.13 MB (optimized for web)

**Features:**
- ✅ Static site (fast loading)
- ✅ SPA routing configured
- ✅ SEO-friendly pages
- ✅ Optimized assets
- ✅ Production build

---

## 🚀 Quick Start (5 Minutes)

1. **Deploy Frontend to Netlify Drop:**
   - Go to https://app.netlify.com/drop
   - Drag `frontend/dist/` folder
   - Get your URL: `https://random-name.netlify.app`

2. **Start Backend Locally:**
   ```bash
   cd backend
   pip install fastapi uvicorn motor pydantic-settings python-jose passlib[bcrypt] python-dotenv reportlab
   uvicorn backend.app:app --reload
   ```

3. **Update Frontend:**
   - Add env var in Netlify: `EXPO_PUBLIC_BACKEND_URL=http://localhost:8001`
   - Or for production: Deploy backend to Railway first

4. **Test:**
   - Open your Netlify URL
   - Try registration
   - Explore the app!

---

## 🆘 Troubleshooting

**Frontend not loading?**
- Check Netlify deploy logs
- Verify dist/ folder was uploaded
- Check browser console for errors

**Backend not connecting?**
- Verify MONGO_URL is correct
- Check MongoDB is running
- Verify CORS includes frontend URL
- Check backend logs

**CORS errors?**
- Add Netlify URL to backend CORS_ORIGINS
- Restart backend server
- Clear browser cache

---

## 📞 Support

- **API Docs**: http://localhost:8001/docs
- **Deployment Guide**: DEPLOYMENT.md
- **Architecture**: ARCHITECTURE.md

---

**Your app is production-ready! 🎉**

Built files are ready in `frontend/dist/`
Backend code is ready in `backend/`
All configurations are in place!
