# BinaryBonds Deployment Guide

Complete guide for deploying BinaryBonds to production.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Web Deployment](#frontend-web-deployment)
4. [Mobile App Deployment](#mobile-app-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Post-Deployment](#post-deployment)

---

## Prerequisites

### Required Accounts
- [ ] GitHub account (for code hosting)
- [ ] MongoDB Atlas account (for database)
- [ ] Railway/Render account (for backend API)
- [ ] Netlify account (for frontend web)
- [ ] (Optional) Apple Developer & Google Play (for mobile apps)

### Required Tools
- [ ] Git
- [ ] Node.js 18+
- [ ] Python 3.10+
- [ ] Yarn 1.22+

---

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Create Railway Account**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login
   ```

2. **Create New Project**
   ```bash
   cd backend
   railway init
   ```

3. **Add MongoDB Plugin**
   - Go to Railway dashboard
   - Click "New" → "Database" → "MongoDB"
   - Copy connection string

4. **Set Environment Variables**
   ```bash
   railway variables set SECRET_KEY="your-secure-32-char-secret"
   railway variables set MONGO_URL="mongodb+srv://..."
   railway variables set DB_NAME="binarybonds_production"
   railway variables set CORS_ORIGINS='["https://yourdomain.com"]'
   railway variables set DEBUG="false"
   ```

5. **Deploy**
   ```bash
   railway up
   ```

### Option 2: Render

1. **Create Account** at https://render.com

2. **Create New Web Service**
   - Connect your GitHub repository
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn backend.app:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables** (in Render dashboard)
   ```
   SECRET_KEY=your-secure-32-char-secret
   MONGO_URL=mongodb+srv://...
   DB_NAME=binarybonds_production
   CORS_ORIGINS=["https://yourdomain.com"]
   DEBUG=false
   HOST=0.0.0.0
   ```

4. **Add MongoDB**
   - Use MongoDB Atlas (free tier)
   - Or add Render MongoDB add-on

### Option 3: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM python:3.10-slim

   WORKDIR /app

   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   COPY . .

   EXPOSE 8001

   CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8001"]
   ```

2. **Build and Run**
   ```bash
   docker build -t binarybonds-api .
   docker run -p 8001:8001 --env-file .env binarybonds-api
   ```

---

## Frontend Web Deployment

### Deploy to Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build for Web**
   ```bash
   cd frontend
   yarn web:build
   ```

3. **Deploy**

   **Option A: Using Netlify CLI**
   ```bash
   netlify login
   netlify init
   netlify deploy --prod
   ```

   **Option B: Using Git Integration**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub repository
   - Configure build settings:
     - Base directory: `frontend`
     - Build command: `yarn web:build`
     - Publish directory: `frontend/dist`

4. **Configure Environment Variables** (in Netlify dashboard)
   ```
   EXPO_PUBLIC_BACKEND_URL=https://your-api-domain.railway.app
   ```

5. **Custom Domain** (Optional)
   - Go to Site settings → Domain management
   - Add custom domain
   - Update DNS records

### Deploy to Vercel (Alternative)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   yarn web:build
   vercel --prod
   ```

3. **Configure**
   - Set environment variables in Vercel dashboard
   - Configure custom domain

---

## Mobile App Deployment

### iOS (App Store)

1. **Prerequisites**
   - Apple Developer account ($99/year)
   - macOS with Xcode

2. **Build with EAS**
   ```bash
   npm install -g eas-cli
   eas login
   eas build --platform ios
   ```

3. **Submit to App Store**
   ```bash
   eas submit --platform ios
   ```

4. **Configure in App Store Connect**
   - Add app description, screenshots
   - Set pricing and availability
   - Submit for review

### Android (Play Store)

1. **Prerequisites**
   - Google Play Developer account ($25 one-time)

2. **Build with EAS**
   ```bash
   eas build --platform android
   ```

3. **Submit to Play Store**
   ```bash
   eas submit --platform android
   ```

4. **Configure in Play Console**
   - Create store listing
   - Add screenshots, description
   - Submit for review

---

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Account** at https://cloud.mongodb.com

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region closest to your backend
   - Create cluster

3. **Configure Security**
   - Database Access: Create user with read/write permissions
   - Network Access: Add your IP (or 0.0.0.0/0 for all IPs)
   - **Security Note**: Use IP whitelist for production

4. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password

5. **Create Database**
   - Database name: `binarybonds_production`
   - Indexes are created automatically on first run

---

## Environment Configuration

### Backend (.env)

**Production Configuration:**
```bash
# Generate secure secret key:
# python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=your-super-secure-random-32-character-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7
REFRESH_TOKEN_EXPIRE_DAYS=30

# MongoDB Atlas connection
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=binarybonds_production

# CORS - Set to your frontend domain
CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]

# Server settings
HOST=0.0.0.0
PORT=8001
DEBUG=false

# Rate limiting
RATE_LIMIT_ENABLED=true
LOGIN_RATE_LIMIT=5/minute
API_RATE_LIMIT=100/minute
```

### Frontend

**Production .env:**
```bash
EXPO_PUBLIC_BACKEND_URL=https://your-api.railway.app
```

---

## Post-Deployment

### 1. Verify Backend

```bash
# Health check
curl https://your-api-domain.com/health

# API docs
open https://your-api-domain.com/docs
```

### 2. Verify Frontend

- Open https://your-frontend-domain.com
- Test login/register
- Test all features
- Check browser console for errors

### 3. Update CORS

Update backend CORS_ORIGINS with actual frontend domain:
```bash
CORS_ORIGINS=["https://yourdomain.netlify.app"]
```

### 4. Monitor Application

**Backend Monitoring:**
- Set up error tracking (Sentry)
- Monitor API response times
- Check database connections
- Review logs regularly

**Frontend Monitoring:**
- Set up analytics (Google Analytics, Mixpanel)
- Monitor bundle size
- Check performance metrics
- Track user flows

### 5. Security Checklist

- [ ] HTTPS enabled on all domains
- [ ] SECRET_KEY is secure and unique
- [ ] CORS configured to specific domains
- [ ] MongoDB IP whitelist configured
- [ ] Rate limiting enabled
- [ ] DEBUG=false in production
- [ ] No secrets in Git repository
- [ ] Regular dependency updates

### 6. Backups

**Database Backups:**
- MongoDB Atlas: Automatic backups in M10+ clusters
- Manual: Use `mongodump` regularly
- Schedule: Daily backups recommended

**Code Backups:**
- Git repository (already backed up)
- Tag releases: `git tag v1.0.0`

---

## Deployment Checklist

### Pre-Deployment

- [ ] Run all tests: `cd backend && pytest`
- [ ] Update version numbers
- [ ] Review and update documentation
- [ ] Test locally with production-like settings
- [ ] Review security settings

### Deployment

- [ ] Deploy database (MongoDB Atlas)
- [ ] Deploy backend API (Railway/Render)
- [ ] Configure environment variables
- [ ] Test API endpoints
- [ ] Deploy frontend web (Netlify)
- [ ] Update CORS origins
- [ ] Test frontend application

### Post-Deployment

- [ ] Verify health endpoints
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Set up monitoring/alerts
- [ ] Document deployment process
- [ ] Create rollback plan

---

## Troubleshooting

### Backend Issues

**API not starting:**
- Check environment variables are set
- Verify MongoDB connection string
- Check logs for errors
- Ensure PORT is correct

**Database connection failed:**
- Verify MongoDB Atlas whitelist
- Check connection string format
- Ensure database user has permissions
- Test connection locally

### Frontend Issues

**Build fails:**
- Clear Metro cache: `rm -rf .metro-cache`
- Clear Expo cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && yarn install`

**API calls fail:**
- Verify EXPO_PUBLIC_BACKEND_URL is correct
- Check CORS configuration
- Test API directly with curl
- Check browser console for errors

---

## Costs Estimate

### Free Tier (Development)
- **MongoDB Atlas**: Free M0 cluster
- **Railway/Render**: $0 (with limitations)
- **Netlify**: Free for personal projects
- **Total**: $0/month

### Production (Small Scale)
- **MongoDB Atlas**: $0 (M0) or $9/month (M2)
- **Railway/Render**: $5-20/month
- **Netlify**: Free or $19/month (Pro)
- **Total**: ~$15-50/month

### Mobile Apps
- **Apple Developer**: $99/year
- **Google Play**: $25 one-time
- **EAS Build**: Free tier or $29/month

---

## Support

- **Documentation**: See [README.md](README.md) and [ARCHITECTURE.md](ARCHITECTURE.md)
- **Backend API Docs**: https://your-api.com/docs
- **Issues**: Create GitHub issue

---

## Quick Deploy Commands

**Backend (Railway):**
```bash
cd backend
railway login
railway init
railway up
```

**Frontend (Netlify):**
```bash
cd frontend
yarn web:build
netlify deploy --prod
```

**Full Stack:**
```bash
# 1. Deploy backend
cd backend && railway up

# 2. Update frontend .env with backend URL
echo "EXPO_PUBLIC_BACKEND_URL=https://your-api.railway.app" > frontend/.env

# 3. Deploy frontend
cd frontend && yarn web:build && netlify deploy --prod
```

---

**Last Updated:** 2025-01-17
**Version:** 1.0.0
