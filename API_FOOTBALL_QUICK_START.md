# API-Football Quick Start Guide

## 🎯 Summary

**Status:** ✅ API Working  
**Your API Key:** Configured and valid  
**Requests Today:** 4/100 (96 remaining)  
**Plan:** Free (expires Jan 21, 2027)

## ⚠️ Important: 2026 Data Not Available

The free plan only supports seasons **2022-2024**. World Cup 2026 data requires a paid plan.

**Solution:** Use 2022 World Cup data for development and testing.

---

## 🚀 Quick Commands

### Test the API Connection
```bash
cd server
npx ts-node src/scripts/test-api-football.ts
```

### Sync 2022 Data into Database
```bash
cd server
npx ts-node src/scripts/sync-2022-data.ts
```

This will:
- ✅ Import 32 teams from 2022 World Cup
- ✅ Import 64 fixtures (48 group + 16 knockout)
- ✅ Clear existing data first
- ✅ Map API IDs to your database

### Manual API Calls (curl)

**Check API Status:**
```bash
curl "https://v3.football.api-sports.io/status" \
  -H "x-apisports-key: ab748fd405ce9bdccfc1afda30f80e4c"
```

**Get Teams:**
```bash
curl "https://v3.football.api-sports.io/teams?league=1&season=2022" \
  -H "x-apisports-key: ab748fd405ce9bdccfc1afda30f80e4c"
```

**Get Fixtures:**
```bash
curl "https://v3.football.api-sports.io/fixtures?league=1&season=2022" \
  -H "x-apisports-key: ab748fd405ce9bdccfc1afda30f80e4c"
```

---

## 📊 What Data is Available (2022)

### Teams (32)
- Belgium, France, Croatia, Brazil, Uruguay, Spain, England, Japan
- Senegal, Serbia, Germany, Denmark, Netherlands, USA, Argentina, Iran
- Poland, Saudi Arabia, Mexico, Tunisia, Morocco, Ecuador, Cameroon, Canada
- Switzerland, South Korea, Portugal, Uruguay, Ghana, Australia, Costa Rica, Wales, Qatar

### Matches (64)
- **Group Stage:** 48 matches across 8 groups
- **Round of 16:** 8 matches
- **Quarter-finals:** 4 matches
- **Semi-finals:** 2 matches
- **Third Place:** 1 match
- **Final:** 1 match

### Standings
- Complete group tables (8 groups)
- Points, wins, draws, losses, goal difference
- Form indicators (W/D/L)

### Top Scorers
- Player name, team, goals scored
- Top 20 scorers from 2022

---

## 🎯 Development Strategy

### Option 1: Use 2022 Data (RECOMMENDED)
✅ **Pros:**
- Free, available now
- Complete dataset
- Test all features immediately
- Switch to 2026 later (one line change)

❌ **Cons:**
- Only 32 teams (2026 has 48)
- Historical data, not current

**How to switch later:**
```javascript
// In .env file, change:
FOOTBALL_SEASON=2026  // When 2026 data becomes available
```

### Option 2: Upgrade to Paid Plan
- Check pricing: https://www.api-football.com/pricing
- Get access to 2026 data (if available)
- More API requests per day

### Option 3: Manual Data Entry
- Continue with current seed script
- 48 teams, 104 matches manually entered
- Admin updates scores during tournament

---

## 📝 Next Steps

1. **Run the test script** to verify everything works:
   ```bash
   cd server
   npx ts-node src/scripts/test-api-football.ts
   ```

2. **Decide:** Use 2022 data or wait for 2026?

3. **If using 2022:** Run sync script to import data:
   ```bash
   cd server
   npx ts-node src/scripts/sync-2022-data.ts
   ```

4. **Test prediction flow** with real API data

5. **When 2026 data available:** Update .env and re-sync

---

## 🔗 Resources

- **Full Report:** `API_FOOTBALL_INTEGRATION_REPORT.md`
- **API Docs:** https://www.api-football.com/documentation-v3
- **Test Script:** `server/src/scripts/test-api-football.ts`
- **Sync Script:** `server/src/scripts/sync-2022-data.ts`
- **Service:** `server/src/services/footballApiService.ts`

---

## ✅ Recommendation

**Use 2022 data NOW** to:
- ✅ Build and test prediction features
- ✅ Implement scoring logic
- ✅ Test leaderboards
- ✅ Complete the application

**Then switch to 2026** when available (likely April-May 2026).
