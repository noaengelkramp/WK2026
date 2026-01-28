# 🚀 Netlify Deployment Checklist - WK2026

## ✅ Step 1: Import Repository to Netlify

1. Go to **https://app.netlify.com**
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub (if first time)
5. Select repository: **`noaengelkramp/WK2026`**

---

## ✅ Step 2: Configure Build Settings

Netlify should auto-detect from `netlify.toml`:

- ✅ **Build command**: `npm run build:netlify`
- ✅ **Publish directory**: `client/dist`
- ✅ **Functions directory**: `netlify/functions`

**Click "Deploy site"** (it will likely fail - that's expected, we need environment variables)

---

## ✅ Step 3: Note Your Site URL

After the initial deploy attempt, you'll see your site URL:

Example: `https://wonderful-cupcake-123abc.netlify.app`

**Optional**: Customize your site name:
- Go to **Site settings** → **Site details** → **Change site name**
- Suggestion: `wk2026-predictions`
- New URL: `https://wk2026-predictions.netlify.app`

**📝 Write down your URL**: _______________________________

---

## ✅ Step 4: Add Environment Variables

Go to: **Site settings** → **Environment variables** → **Add a variable**

Add these variables **one by one** (copy the KEY and VALUE):

### Database Configuration

```
Key: DATABASE_URL
Value: postgresql://neondb_owner:npg_QUjzs52YKeaT@ep-late-night-a9956b4q-pooler.gwc.azure.neon.tech/neondb?sslmode=require
```

### JWT Authentication

```
Key: JWT_SECRET
Value: wk2026-super-secret-jwt-key-change-in-production-abc123xyz
```

```
Key: JWT_REFRESH_SECRET
Value: wk2026-refresh-token-secret-xyz789
```

```
Key: JWT_EXPIRES_IN
Value: 7d
```

```
Key: JWT_REFRESH_EXPIRES_IN
Value: 30d
```

### Application Settings

```
Key: NODE_ENV
Value: production
```

```
Key: NETLIFY
Value: true
```

```
Key: PORT
Value: 3001
```

### CORS Settings (⚠️ UPDATE WITH YOUR ACTUAL URL)

```
Key: CORS_ORIGIN
Value: https://YOUR-SITE-NAME.netlify.app
```

```
Key: CLIENT_URL
Value: https://YOUR-SITE-NAME.netlify.app
```

**⚠️ IMPORTANT**: Replace `YOUR-SITE-NAME` with your actual Netlify subdomain!

### Tournament Settings

```
Key: PREDICTION_DEADLINE
Value: 2026-06-11T23:00:00Z
```

```
Key: TOURNAMENT_START
Value: 2026-06-11T00:00:00Z
```

```
Key: TOURNAMENT_END
Value: 2026-07-19T23:59:59Z
```

### Football API (Optional)

```
Key: FOOTBALL_API_KEY
Value: ab748fd405ce9bdccfc1afda30f80e4c
```

```
Key: FOOTBALL_API_BASE_URL
Value: https://v3.football.api-sports.io
```

```
Key: FOOTBALL_LEAGUE_ID
Value: 1
```

```
Key: FOOTBALL_SEASON
Value: 2026
```

---

## ✅ Step 5: Trigger Redeploy

After adding all environment variables:

1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait 5-10 minutes for build to complete
4. Watch the build logs for any errors

**Expected result**: Build succeeds and shows "Published"

---

## ✅ Step 6: Initialize Database

Once deployed successfully:

1. Open your browser
2. Visit: `https://YOUR-SITE-NAME.netlify.app/api/setup`
3. You should see JSON response:

```json
{
  "success": true,
  "message": "Database initialized successfully! 🎉",
  "details": {
    "teams_seeded": 48,
    "scoring_rules_seeded": 7,
    "bonus_questions_seeded": 5
  }
}
```

**⚠️ If you see an error**: Check Netlify Function logs (Site → Functions → api → View logs)

---

## ✅ Step 7: Test Your Application

### 7.1 Frontend Test

Visit: `https://YOUR-SITE-NAME.netlify.app`

- [ ] React app loads
- [ ] No console errors (press F12 → Console)
- [ ] Navigation works
- [ ] Styling looks correct

### 7.2 API Health Check

Visit: `https://YOUR-SITE-NAME.netlify.app/api/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-28T...",
  "redis": "disconnected"
}
```

### 7.3 Test User Registration

1. Click **"Register"** or **"Sign Up"**
2. Fill in the form:
   - Email: `test@example.com`
   - Password: `password123`
   - First Name: `Test`
   - Last Name: `User`
   - Customer Number: `C1234_0000001`
3. Submit
4. Should see success message

### 7.4 Test Login

1. Click **"Login"**
2. Use credentials from registration
3. Should be logged in and see dashboard

### 7.5 Test Admin Access

1. Login as admin:
   - Email: `admin@wk2026.com`
   - Password: `password123`
2. Navigate to Admin Panel
3. Check all tabs work

---

## ✅ Step 8: Monitor and Verify

### Check Function Logs

**Netlify Dashboard** → Site → **Functions** → **api** → **View logs**

Look for:
- ✅ Successful requests
- ✅ Database connections
- ❌ Any errors

### Check Database

**Neon Console** (https://console.neon.tech)
- View your `wk2026` project
- Check connection count
- Verify tables exist

---

## 🎉 Deployment Complete!

Your application is now live at:
```
https://YOUR-SITE-NAME.netlify.app
```

### Test Credentials

**Admin Account:**
- Email: `admin@wk2026.com`
- Password: `password123`

**Regular Users:**
- Email: `john.doe@wk2026.com` / Password: `password123`
- Email: `jane.smith@wk2026.com` / Password: `password123`

---

## 🔄 Continuous Deployment

From now on, any push to GitHub will automatically deploy:

```bash
git add .
git commit -m "Your changes"
git push origin main
# Netlify automatically builds and deploys!
```

---

## 🐛 Troubleshooting

### Build Fails

**Check:**
- Build logs in Netlify
- All dependencies in package.json
- TypeScript compilation errors

**Solution:**
```bash
# Test build locally
npm run build:netlify
```

### Function Returns 500 Error

**Check:**
- Netlify Function logs
- DATABASE_URL environment variable
- Database connection in Neon

**Solution:**
- Verify all environment variables are set
- Check Neon database is active
- Review function logs for specific error

### CORS Errors

**Check:**
- CORS_ORIGIN matches your Netlify URL exactly
- CLIENT_URL matches your Netlify URL exactly
- No trailing slashes

**Solution:**
```bash
# In Netlify environment variables:
CORS_ORIGIN=https://your-exact-site-url.netlify.app
CLIENT_URL=https://your-exact-site-url.netlify.app

# Then redeploy
```

### Database Not Initialized

**Solution:**
Visit `/api/setup` endpoint in browser to create all tables

---

## 📊 Monitoring

### Daily Checks

- [ ] Site is accessible
- [ ] API health endpoint responds
- [ ] No errors in Function logs
- [ ] Database connections are normal

### Weekly Checks

- [ ] Review Netlify bandwidth usage
- [ ] Check Neon database storage
- [ ] Review error logs
- [ ] Test critical user flows

---

## 🚀 Next Steps

1. **Custom Domain** (Optional)
   - Netlify Dashboard → Domain management → Add custom domain

2. **Email Notifications** (Optional)
   - Configure Gmail app password
   - Add SMTP environment variables

3. **Redis Caching** (Optional)
   - Sign up for Upstash: https://upstash.com
   - Add REDIS_URL to environment variables

4. **Monitoring** (Optional)
   - Add Sentry for error tracking
   - Set up uptime monitoring

5. **Seed All Matches**
   - Run match seeder to add all 104 World Cup matches
   - Test prediction system with full data

---

## 📞 Support

If you encounter issues:

1. Check Netlify Function logs
2. Check Neon database console
3. Review this checklist
4. Check NETLIFY_DEPLOYMENT.md for detailed troubleshooting

---

**Good luck with your deployment! 🎉⚽**
