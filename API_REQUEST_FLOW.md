# API Request Flow & Optimization Strategy

## 🔄 Current Request Flow

```
┌─────────────────────────────────────────────────────────┐
│                    USER REQUEST                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  Your Server API   │
         │  (Node.js/Express) │
         └─────────┬──────────┘
                   │
                   ▼
         ┌────────────────────┐      ┌──────────────────┐
         │  Check Cache?      │──NO──▶│ Call External   │
         │  (PostgreSQL)      │      │ API-Football     │
         └─────────┬──────────┘      └─────────┬────────┘
                   │                            │
                  YES                           │
                   │                            │
                   ▼                            ▼
         ┌────────────────────┐      ┌──────────────────┐
         │  Return Cached     │◀─────│ Store in Cache   │
         │  Data              │      │ & Return         │
         └─────────┬──────────┘      └──────────────────┘
                   │
                   ▼
         ┌────────────────────┐
         │  Response to User  │
         └────────────────────┘

Request Count: 0 if cached, 1 if API called
```

---

## ⚡ Optimized Caching Strategy

### Cache Durations by Data Type:

```
┌─────────────────────┬──────────────────┬────────────────┐
│ Data Type           │ Cache Duration   │ Why?           │
├─────────────────────┼──────────────────┼────────────────┤
│ Teams               │ ∞ (Forever)      │ Never change   │
│ Fixtures Schedule   │ 24 hours         │ Rarely change  │
│ Match Results       │ 15 minutes       │ During matches │
│ Standings           │ 1 hour           │ After matches  │
│ Top Scorers         │ 24 hours         │ Slow updates   │
│ Live Scores         │ 5 minutes        │ Real-time need │
└─────────────────────┴──────────────────┴────────────────┘
```

---

## 📅 Request Timeline (Development)

### Month 1-3 (Feb-April 2026): DEVELOPMENT
```
Week 1: Initial import
  └─ 4 requests (teams, fixtures, standings, scorers)
  └─ Cache ∞ - no more requests needed!

Week 2-12: Development & Testing
  └─ 0-2 requests/week for fresh data testing
  └─ 2 req/week × 11 weeks = 22 requests total

TOTAL: 26 requests over 3 months
DAILY AVERAGE: 0.3 requests/day
```

**Verdict:** 💚 You'll barely touch your quota!

---

## 📅 Request Timeline (Tournament)

### June 11 - July 19, 2026: LIVE TOURNAMENT (39 days)

```
╔══════════════════════════════════════════════════════╗
║           DAILY REQUEST BREAKDOWN                     ║
╠══════════════════════════════════════════════════════╣
║                                                       ║
║  00:00 ┬─────────────────────────────────┬ 24:00    ║
║        │                                   │          ║
║        │  MATCH TIME: 14:00 - 22:00       │          ║
║        │  ████████████████████████         │          ║
║        │                                   │          ║
║        │  Poll every 15 min: 32 requests  │          ║
║        │  ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼  │          ║
║        │                                   │          ║
║  QUIET │         ACTIVE POLLING           │ QUIET    ║
║        └───────────────────────────────────┘          ║
║                                                       ║
║  Morning:   Standings update (1 req)                 ║
║  14:00:     Start live polling                       ║
║  14:15:     Poll live fixtures (1 req)               ║
║  14:30:     Poll live fixtures (1 req)               ║
║  ...        Every 15 min...                          ║
║  22:00:     Last poll of day                         ║
║  23:00:     Final standings update (1 req)           ║
║                                                       ║
║  TOTAL:     34 requests/day                          ║
║  BUFFER:    66 requests remaining                    ║
╚══════════════════════════════════════════════════════╝
```

**Verdict:** 💚 Comfortable 66-request buffer for emergencies!

---

## 🎯 Smart Polling Schedule

### Option A: Fixed Interval (SIMPLE)
```
Every 15 minutes, 8am-10pm = 56 polls
  ✅ Simple to implement
  ❌ Wastes requests when no matches
  
Usage: 56 requests/day
```

### Option B: Match-Aware (SMART)
```
Only poll during scheduled match times + 30 min buffer

Example June 11, 2026:
  Match 1: 19:00 (Mexico vs Canada)
    └─ Poll 18:30 - 21:00 = 10 polls
  Match 2: 22:00 (Morocco vs Croatia)  
    └─ Poll 21:30 - 00:00 = 10 polls

Total: 20 polls on Day 1

Usage: 20-40 requests/day (varies by schedule)
```

### Option C: Webhook-Triggered (ADVANCED)
```
Use manual trigger button in admin panel

Admin clicks "Update Scores" when needed
  └─ Makes API call on demand
  └─ Shows "Last updated: 2 min ago"

Usage: 10-20 requests/day (admin controlled)
```

---

## 💾 Database Caching Implementation

### Schema Addition:
```sql
CREATE TABLE api_cache (
  id UUID PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE,
  data JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cache_key ON api_cache(cache_key);
CREATE INDEX idx_expires_at ON api_cache(expires_at);
```

### Service Code:
```javascript
async function getFixturesWithCache() {
  // Check cache first
  const cached = await ApiCache.findOne({
    where: {
      cache_key: 'fixtures_2026',
      expires_at: { [Op.gt]: new Date() }
    }
  });
  
  if (cached) {
    console.log('✅ Serving from cache');
    return cached.data;
  }
  
  // Cache miss - call API
  console.log('📡 Calling API-Football');
  const data = await footballApiService.getFixtures('2026');
  
  // Store in cache
  await ApiCache.upsert({
    cache_key: 'fixtures_2026',
    data: data,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  });
  
  return data;
}
```

---

## 📊 Request Monitoring

### Add to Admin Dashboard:

```javascript
// Get today's request count
const today = new Date().toISOString().split('T')[0];
const requestCount = await ApiLog.count({
  where: {
    endpoint: { [Op.like]: '%api-football%' },
    createdAt: { [Op.gte]: today }
  }
});

// Show in UI:
{
  requests_today: requestCount,
  requests_remaining: 100 - requestCount,
  quota_percentage: (requestCount / 100) * 100,
  status: requestCount < 70 ? 'healthy' : 
          requestCount < 90 ? 'warning' : 'critical'
}
```

---

## 🚦 Rate Limit Protection

### Implement Circuit Breaker:

```javascript
class ApiFootballService {
  private requestCount = 0;
  private dailyLimit = 100;
  
  async callApi(endpoint: string) {
    // Check limit
    if (this.requestCount >= this.dailyLimit) {
      console.warn('⚠️ Daily limit reached, serving from cache');
      throw new Error('QUOTA_EXCEEDED');
    }
    
    // Make request
    this.requestCount++;
    return await this.client.get(endpoint);
  }
  
  resetDailyCount() {
    this.requestCount = 0;
    // Schedule to run at midnight UTC
  }
}
```

---

## 🎯 Real-World Example: Match Day

**Scenario:** June 11, 2026 - Opening Day  
**Matches:** 2 matches (19:00 and 22:00)  
**Users:** 100 employees checking scores

```
Timeline of API Calls:
─────────────────────────────────────────────────────────

08:00  Admin logs in
       └─ 0 API calls (serve from cache)

10:00  Employee checks predictions
       └─ 0 API calls (all cached)

18:45  First match starting soon
       └─ 1 API call: Get live fixtures
       └─ Cache for 5 minutes

19:00  Match kicks off (Mexico vs Canada)
       └─ 20 employees refresh
       └─ 0 API calls (served from cache)

19:15  Half-time updates
       └─ 1 API call: Get live fixtures
       └─ Update scores in database

19:30  50 employees check at half-time
       └─ 0 API calls (all from database)

21:00  Match ends
       └─ 1 API call: Final score update
       └─ Trigger scoring calculation

21:45  Second match starting
       └─ 1 API call: Get live fixtures

22:00  Everyone refreshing
       └─ 0 API calls (cached)

...continues every 15 min...

23:30  All matches done
       └─ 1 API call: Final standings

─────────────────────────────────────────────────────────
TOTAL API CALLS: 10-12 requests
USERS SERVED: 100+ employees
CACHE HIT RATE: 99.9%
```

**Result:** Serve 1000+ page views with only 10 API requests! 🎉

---

## ✅ Summary: The Magic Formula

```
┌─────────────────────────────────────────────────────┐
│         100 API REQUESTS PER DAY                    │
│                                                      │
│  = Cache everything                                  │
│  + Poll every 15-30 min during matches              │
│  + Store in PostgreSQL                              │
│  + Serve 1000s of users from cache                  │
│  = Sustainable free plan usage! 🎉                  │
└─────────────────────────────────────────────────────┘
```

**Key Insight:** The API limit is on YOUR requests to API-Football,  
NOT on how many times your users access your application!

Cache = ∞ users with finite API calls
