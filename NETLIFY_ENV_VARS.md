# Netlify Environment Variables - Quick Copy/Paste

## Instructions
1. Go to https://app.netlify.com
2. Select your WK2026 site
3. Go to: Site settings → Environment variables
4. Click "Add a variable" for each one below
5. Copy the KEY and VALUE exactly as shown

---

## Variables to Add (17 total)

### 1. DATABASE_URL
```
postgresql://neondb_owner:npg_QUjzs52YKeaT@ep-late-night-a9956b4q-pooler.gwc.azure.neon.tech/neondb?sslmode=require
```

### 2. JWT_SECRET
```
wk2026-super-secret-jwt-key-change-in-production-abc123xyz
```

### 3. JWT_REFRESH_SECRET
```
wk2026-refresh-token-secret-xyz789
```

### 4. JWT_EXPIRES_IN
```
7d
```

### 5. JWT_REFRESH_EXPIRES_IN
```
30d
```

### 6. NODE_ENV
```
production
```

### 7. NETLIFY
```
true
```

### 8. PORT
```
3001
```

### 9. CORS_ORIGIN ⚠️ UPDATE THIS
```
https://YOUR-SITE-NAME.netlify.app
```

### 10. CLIENT_URL ⚠️ UPDATE THIS
```
https://YOUR-SITE-NAME.netlify.app
```

### 11. PREDICTION_DEADLINE
```
2026-06-11T23:00:00Z
```

### 12. TOURNAMENT_START
```
2026-06-11T00:00:00Z
```

### 13. TOURNAMENT_END
```
2026-07-19T23:59:59Z
```

### 14. FOOTBALL_API_KEY
```
ab748fd405ce9bdccfc1afda30f80e4c
```

### 15. FOOTBALL_API_BASE_URL
```
https://v3.football.api-sports.io
```

### 16. FOOTBALL_LEAGUE_ID
```
1
```

### 17. FOOTBALL_SEASON
```
2026
```

---

## ⚠️ CRITICAL: Update These Two Variables

After you know your Netlify URL (e.g., `https://wk2026-predictions.netlify.app`):

1. Go back to environment variables
2. Edit **CORS_ORIGIN** - replace `YOUR-SITE-NAME` with your actual subdomain
3. Edit **CLIENT_URL** - replace `YOUR-SITE-NAME` with your actual subdomain
4. Trigger a new deploy

---

## After Adding All Variables

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for build to complete (5-10 minutes)
4. Visit: `https://YOUR-SITE-NAME.netlify.app/api/setup` to initialize database
5. Visit: `https://YOUR-SITE-NAME.netlify.app` to test your app

---

## Test Credentials

**Admin:**
- Email: `admin@wk2026.com`
- Password: `password123`

**Regular Users:**
- Email: `john.doe@wk2026.com`
- Password: `password123`
- Email: `jane.smith@wk2026.com`
- Password: `password123`
