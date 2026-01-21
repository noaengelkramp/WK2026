# 🔑 Getting Your FREE API-Football Key

## Quick Start (5 minutes)

### Step 1: Sign Up
1. Go to **https://www.api-football.com/**
2. Click **"Get Your Free API Key"** button
3. Fill in:
   - Email address
   - Choose a password
   - **No credit card required!**

### Step 2: Get Your API Key
1. After signup, you'll see your dashboard
2. Your **API Key** will be displayed prominently
3. Copy it (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Step 3: Add to Your .env File
```bash
# In /Users/noa/OpenCode/WK2026/.env
FOOTBALL_API_KEY=your-api-key-here
```

### Step 4: Test It!
```bash
cd server
npm run dev
```

The backend will automatically connect to API-Football.

---

## 🆓 Free Tier Benefits

**✅ What You Get FREE:**
- **100 requests per day**
- All fixtures and live scores
- Team information
- League standings
- Player statistics
- Top scorers
- **No credit card required**
- **No time limit**

**📊 Request Management:**
Our backend is optimized for free tier:
- Caching to reduce API calls
- Smart scheduling (updates every 15 minutes during matches)
- Request counter and warnings
- Automatic fallback to cached data

**💡 100 Requests/Day is Plenty For:**
- Development and testing
- Small to medium deployments
- Internal company use (50-100 employees)

---

## 🌐 API-Football vs Other Options

| Feature | API-Football | Football-Data | TheSportsDB |
|---------|-------------|---------------|-------------|
| **Free Tier** | 100 req/day | 10 req/min | Unlimited |
| **World Cup** | ✅ Full coverage | ✅ Yes | ✅ Yes |
| **Live Scores** | ✅ Real-time | ✅ Real-time | ⏱️ Delayed |
| **Documentation** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good | ⭐⭐⭐ Basic |
| **Reliability** | ⭐⭐⭐⭐⭐ Very High | ⭐⭐⭐⭐ High | ⭐⭐⭐ Medium |
| **Data Quality** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good | ⭐⭐⭐ Good |
| **No Credit Card** | ✅ Yes | ✅ Yes | ✅ Yes |

**Recommendation:** API-Football is the best free option for this project.

---

## 📖 API Documentation

**Base URL:** `https://v3.football.api-sports.io`

**Key Endpoints We Use:**

1. **Get Fixtures**
   ```
   GET /fixtures?league=1&season=2026
   ```
   Returns all World Cup matches

2. **Get Live Scores**
   ```
   GET /fixtures?league=1&season=2026&live=all
   ```
   Returns matches currently playing

3. **Get Standings**
   ```
   GET /standings?league=1&season=2026
   ```
   Returns group tables

4. **Get Teams**
   ```
   GET /teams?league=1&season=2026
   ```
   Returns all 48 participating teams

5. **Get Top Scorers**
   ```
   GET /players/topscorers?league=1&season=2026
   ```
   Returns tournament top scorers

**Authentication:**
```
Headers:
  x-apisports-key: your-api-key-here
```

**Full Documentation:** https://www.api-football.com/documentation-v3

---

## 🔄 How Our Backend Uses It

### Scheduled Updates (Optimized for Free Tier)

**During Tournament:**
- **Every 6 hours:** Fetch all fixtures (1 request)
- **Every 15 minutes (during matches):** Check live scores (1 request)
- **After each match:** Update standings (1 request)

**Daily Request Budget:**
- Fixture updates: 4 requests
- Live score checks: ~60 requests (during active match days)
- Standings updates: ~10 requests
- **Total: ~74 requests/day** ✅ Well within 100 limit

**Caching Strategy:**
- Cache fixtures: 6 hours
- Cache live scores: 1 minute
- Cache standings: 15 minutes
- Cache team data: 24 hours

---

## ⚡ Testing Without API Key

For **development/testing without an API key**, the backend includes:
- ✅ Mock data fallback
- ✅ Graceful error handling
- ✅ Warning messages (not errors)

This allows stakeholder demos to work even without an API key!

---

## 🚀 Production Deployment

**When you're ready to scale:**

API-Football offers paid plans:
- **Basic:** $9/month - 1,000 requests/day
- **Pro:** $19/month - 3,000 requests/day
- **Ultra:** $49/month - 10,000 requests/day

For 100-500 employees, **free tier is sufficient**.  
For 500+ employees, upgrade to Basic plan.

---

## 🆘 Troubleshooting

**❌ "API key not found"**
- Check .env file has `FOOTBALL_API_KEY=your-key`
- Restart server after adding key
- Verify key is copied correctly (no spaces)

**❌ "Rate limit exceeded"**
- You've used 100 requests today
- Wait until midnight UTC for reset
- Or temporarily use mock data fallback

**❌ "Invalid API key"**
- Key might be expired
- Generate new key from dashboard
- Check for typos in .env

**✅ "API working but no data for 2026"**
- World Cup 2026 data will be available ~6 months before tournament
- For now, use 2022 or 2018 World Cup data for testing:
  ```
  FOOTBALL_SEASON=2022
  ```

---

## 📧 Support

**API-Football Support:**
- Email: contact@api-football.com
- Dashboard: https://dashboard.api-football.com/
- Status Page: https://status.api-football.com/

**Our Backend Support:**
- Check logs: `npm run dev` shows API call count
- Monitoring: Backend tracks requests automatically
- Documentation: See `docs/API.md`

---

## 🎉 Summary

1. ✅ **Free** - No credit card needed
2. ✅ **100 requests/day** - Plenty for this project
3. ✅ **5 minutes setup** - Just sign up and copy key
4. ✅ **Production-ready** - Used by thousands of developers
5. ✅ **World Cup 2026 ready** - Full tournament coverage

**Get started now:** https://www.api-football.com/ 🚀
