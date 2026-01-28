# 🚀 Netlify Deployment Guide - WK2026

Complete step-by-step guide to deploy the World Cup 2026 Prediction Game to Netlify.

---

## 📋 **Prerequisites**

- ✅ Netlify account (paid plan)
- ✅ GitHub account (username: `noaengelkramp`)
- ✅ Node.js 18+ installed locally
- ✅ Git installed and configured

---

## 🎯 **Overview**

**Architecture:**
- **Frontend**: React app (static) served by Netlify CDN
- **Backend**: Express API wrapped as Netlify Function
- **Database**: Neon PostgreSQL (free tier)
- **Cache**: Redis skipped initially (can add later)

**Total Cost**: $0 additional (Netlify paid plan you already have)

---

## 📝 **Step 1: Initialize Neon Database**

### 1.1 Run Neon CLI

```bash
cd /Users/noa/OpenCode/WK2026
npx neonctl@latest init --project-name wk2026
```

### 1.2 Follow the Prompts

The CLI will ask:
- **Which editor to configure?** Select your preference or skip
- **Create database?** Yes
- **Project name?** `wk2026` (already specified)

### 1.3 Verify DATABASE_URL

After completion, check your `.env` file:
```bash
cat .env | grep DATABASE_URL
```

You should see something like:
```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/wk2026?sslmode=require
```

**✅ Keep this DATABASE_URL - you'll need it for Netlify environment variables!**

---

## 🔐 **Step 2: Update Environment Variables**

### 2.1 Add JWT Secrets to .env

Your generated secrets (already created):

```bash
# Add these to your .env file:
JWT_SECRET=44c69dfa260076d1e7ebb78da43b546d6e7a81544d237527c1b03d664eac55669651da8cd0ae2d26bc153a0cc934f26eed1e71010d19ef77b945f0ae5a2667cf
JWT_REFRESH_SECRET=a9ce5080f94eb70e45b6926ce824cd50f3b1a48e3adea978d7222942a89917e208717582547bf9a3cea39320e48d526f24c35fa77a7773f196c4d1efa7760fc9
```

### 2.2 Your Complete .env File Should Look Like:

```env
# Database (from Neon)
DATABASE_URL=postgresql://...your-neon-connection-string...

# JWT Secrets (generated above)
JWT_SECRET=44c69dfa260076d1e7ebb78da43b546d6e7a81544d237527c1b03d664eac55669651da8cd0ae2d26bc153a0cc934f26eed1e71010d19ef77b945f0ae5a2667cf
JWT_REFRESH_SECRET=a9ce5080f94eb70e45b6926ce824cd50f3b1a48e3adea978d7222942a89917e208717582547bf9a3cea39320e48d526f24c35fa77a7773f196c4d1efa7760fc9
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Application
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Tournament
PREDICTION_DEADLINE=2026-06-11T23:00:00Z
TOURNAMENT_START=2026-06-11T00:00:00Z
TOURNAMENT_END=2026-07-19T23:59:59Z
```

---

## 📦 **Step 3: Create GitHub Repository**

### 3.1 Via GitHub Website

1. Go to https://github.com/new
2. **Repository name**: `WK2026`
3. **Description**: "World Cup 2026 Prediction Game"
4. **Visibility**: Public
5. **DO NOT** initialize with README (you already have one)
6. Click **"Create repository"**

### 3.2 Push Your Code

```bash
cd /Users/noa/OpenCode/WK2026

# Verify .env is NOT tracked
git status | grep .env
# Should show nothing (file is gitignored)

# Add all changes
git add .

# Commit
git commit -m "Configure for Netlify deployment

- Add Netlify Functions wrapper for Express API
- Configure database with SSL for Neon PostgreSQL
- Add database setup route for initialization
- Update client to use relative API URLs
- Add netlify.toml configuration
- Optimize for serverless deployment"

# Add GitHub remote
git remote add origin git@github.com:noaengelkramp/WK2026.git

# Push to GitHub
git push -u origin main
```

**✅ Your code is now on GitHub!**

---

## 🌐 **Step 4: Deploy to Netlify**

### 4.1 Create Netlify Site

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify (if first time)
5. Select repository: **`noaengelkramp/WK2026`**

### 4.2 Configure Build Settings

Netlify should auto-detect from `netlify.toml`:

- **Build command**: `npm run build:netlify`
- **Publish directory**: `client/dist`
- **Functions directory**: `netlify/functions`

**Click "Deploy" but don't worry if it fails** - we need to add environment variables first.

### 4.3 Note Your Netlify URL

After the deploy attempt, you'll see your site URL:
```
https://[random-name].netlify.app
```

Or you can customize it:
- Site settings → Site details → Change site name
- Suggestion: `wk2026-predictions` → `https://wk2026-predictions.netlify.app`

**✅ Remember this URL - you'll need it for environment variables!**

---

## ⚙️ **Step 5: Configure Netlify Environment Variables**

### 5.1 Navigate to Environment Variables

In Netlify Dashboard:
1. Go to your site
2. Click **"Site configuration"** → **"Environment variables"**
3. Click **"Add a variable"**

### 5.2 Add All Required Variables

**Copy-paste these one by one:**

```bash
# Database (use YOUR Neon connection string from .env)
DATABASE_URL=postgresql://...your-actual-neon-connection-string...

# JWT Secrets (from Step 2)
JWT_SECRET=44c69dfa260076d1e7ebb78da43b546d6e7a81544d237527c1b03d664eac55669651da8cd0ae2d26bc153a0cc934f26eed1e71010d19ef77b945f0ae5a2667cf

JWT_REFRESH_SECRET=a9ce5080f94eb70e45b6926ce824cd50f3b1a48e3adea978d7222942a89917e208717582547bf9a3cea39320e48d526f24c35fa77a7773f196c4d1efa7760fc9

JWT_EXPIRES_IN=7d

JWT_REFRESH_EXPIRES_IN=30d

# Application Settings (update with YOUR Netlify URL)
NODE_ENV=production

NETLIFY=true

CLIENT_URL=https://your-site-name.netlify.app

CORS_ORIGIN=https://your-site-name.netlify.app

# Tournament Settings
PREDICTION_DEADLINE=2026-06-11T23:00:00Z

TOURNAMENT_START=2026-06-11T00:00:00Z

TOURNAMENT_END=2026-07-19T23:59:59Z
```

**Important:** Replace `your-site-name` with your actual Netlify subdomain!

### 5.3 Optional Variables (Add Later if Needed)

```bash
# Football API (get free key from api-football.com)
FOOTBALL_API_KEY=your-api-key-here
FOOTBALL_API_BASE_URL=https://v3.football.api-sports.io

# Email (configure with Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@wk2026.com
```

---

## 🔄 **Step 6: Redeploy**

After adding environment variables:

1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for build to complete (5-10 minutes)
4. Check build logs for any errors

**✅ If successful, you'll see "Published" status!**

---

## 🗄️ **Step 7: Initialize Database**

### 7.1 Visit Setup Endpoint

In your browser, go to:
```
https://your-site-name.netlify.app/api/setup
```

### 7.2 Verify Success

You should see JSON response:
```json
{
  "success": true,
  "message": "Database initialized successfully! 🎉",
  "details": {
    "teams_seeded": 45,
    "scoring_rules_seeded": 6,
    "bonus_questions_seeded": 3
  }
}
```

**✅ Your database is now ready!**

### 7.3 If You See Error

Check:
- DATABASE_URL is correct in Netlify environment variables
- Neon database is accessible (check Neon dashboard)
- View Netlify Function logs: Site → Functions → api → View logs

---

## ✅ **Step 8: Test Your Deployment**

### 8.1 Frontend Test
Visit: `https://your-site-name.netlify.app`
- ✅ React app loads
- ✅ No console errors
- ✅ Navigation works

### 8.2 API Health Check
Visit: `https://your-site-name.netlify.app/api/health`
- ✅ Returns: `{"status":"ok","timestamp":"...","redis":"disconnected"}`

### 8.3 User Registration
1. Click "Register" or "Sign Up"
2. Create test account
3. Verify registration works
4. Check database in Neon console

### 8.4 Full Workflow Test
- ✅ Register user
- ✅ Login
- ✅ View teams
- ✅ View matches
- ✅ Create prediction
- ✅ View leaderboard

---

## 🎉 **You're Live!**

Your application is now deployed and accessible at:
```
https://your-site-name.netlify.app
```

---

## 📊 **Monitoring & Logs**

### Function Logs
**Netlify Dashboard** → Site → **Functions** → **api** → **View logs**

Check for:
- Request count
- Response times
- Errors
- Database connection issues

### Database Monitoring
**Neon Console** (https://console.neon.tech)
- View connection count
- Query performance
- Storage usage

### Build Logs
**Netlify Dashboard** → Site → **Deploys** → Click deploy → **Deploy log**

---

## 🔄 **Continuous Deployment**

Now that everything is set up, deploying updates is automatic:

```bash
# Make changes to your code
# ...

# Commit and push
git add .
git commit -m "Your update description"
git push origin main

# Netlify automatically builds and deploys!
```

---

## 🐛 **Troubleshooting**

### Issue: Build Fails

**Check:**
- Build logs in Netlify
- All dependencies in package.json
- TypeScript compilation errors

**Solution:**
```bash
# Test build locally
npm run build:netlify
```

### Issue: Function Returns 500 Error

**Check:**
- Netlify Function logs
- DATABASE_URL environment variable
- Database connection

**Solution:**
- Verify environment variables are set
- Check Neon database is active
- Review function logs for specific error

### Issue: CORS Errors

**Check:**
- CORS_ORIGIN environment variable matches site URL
- CLIENT_URL matches site URL

**Solution:**
```bash
# In Netlify environment variables:
CORS_ORIGIN=https://your-exact-site-url.netlify.app
CLIENT_URL=https://your-exact-site-url.netlify.app

# Then redeploy
```

### Issue: Database Tables Not Created

**Solution:**
Visit `/api/setup` endpoint in browser - this creates all tables

### Issue: Function Timeout

**Check:**
- Function execution time in logs
- Database query performance

**Note:** Netlify paid plan allows 26 seconds per function

---

## 🚀 **Next Steps**

### 1. Custom Domain (Optional)
Netlify Dashboard → Domain management → Add custom domain

### 2. Add Football API
Get free API key: https://www.api-football.com
Add to environment variables

### 3. Configure Email
Setup Gmail app password for notifications

### 4. Add Redis (Optional)
Sign up for Upstash: https://upstash.com
Add REDIS_URL to environment variables

### 5. Add Admin User
Use `/api/auth/register` to create admin account
Manually set `is_admin=true` in database

### 6. Add Matches
Via admin panel or database seeder

---

## 📚 **Useful Links**

- **Your Site**: `https://your-site-name.netlify.app`
- **Netlify Dashboard**: https://app.netlify.com
- **Neon Console**: https://console.neon.tech
- **GitHub Repo**: https://github.com/noaengelkramp/WK2026
- **API Health**: `https://your-site-name.netlify.app/api/health`
- **Setup Endpoint**: `https://your-site-name.netlify.app/api/setup`

---

## 💡 **Tips**

1. **Monitor Function Usage**: Check Netlify dashboard for function executions
2. **Database Backups**: Neon provides automatic backups
3. **Error Tracking**: Consider adding Sentry or similar
4. **Performance**: Monitor function response times
5. **Security**: Rotate JWT secrets periodically

---

## ✅ **Deployment Checklist**

- [x] Install dependencies
- [x] Configure netlify.toml
- [x] Create Netlify Function wrapper
- [x] Update database config for SSL
- [x] Update client API URLs
- [ ] Initialize Neon database (`npx neonctl init`)
- [ ] Add JWT secrets to .env
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Create Netlify site
- [ ] Add environment variables to Netlify
- [ ] Deploy to Netlify
- [ ] Initialize database via `/api/setup`
- [ ] Test full application workflow
- [ ] Monitor logs and performance

---

**🎉 Congratulations! Your World Cup 2026 Prediction Game is live!**

For questions or issues, check:
- Netlify Function logs
- Neon database console
- GitHub repository issues
