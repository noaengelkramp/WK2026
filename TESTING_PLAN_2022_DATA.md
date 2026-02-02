# Testing Plan for 2022 World Cup Data

## Status: Data Sync Complete ✅

**What Changed:**
- Database now has 32 teams (was 48 simulated)
- Database now has 64 matches with final scores (was 12 simulated)
- All 2022 World Cup real data: Argentina, France, Brazil, England, etc.
- 59 finished matches with actual scores

## Ready to Test

### Priority 1: Prediction System End-to-End ⚠️ HIGH PRIORITY

**Feature #41-60**: Prediction submission and management

**Test Flow:**
1. Start servers (backend port 3001, frontend port 5173)
2. Login as test user (john.doe@wk2026.com / password123)
3. Navigate to `/my-prediction`
4. **Test the zero score fix** (Feature #47):
   - Find any match
   - Enter `0` for home score, `0` for away score
   - Blur the input (click away)
   - Verify it shows `0-0` (not empty)
   - Reload page
   - Verify `0-0` persists ✅

5. **Test prediction submission**:
   - Enter predictions for first 10 matches:
     * Qatar vs Ecuador: predict 0-2 (actual: 0-2) → should score 5 points
     * England vs Iran: predict 6-2 (actual: 6-2) → should score 5 points
     * Argentina vs Saudi Arabia: predict 2-1 (actual: 1-2) → should score 1 point (correct winner)
     * etc.
   - Click "Save All" or wait for auto-save
   - Verify success message

6. **Test predictions persist**:
   - Reload page
   - Verify all predictions still there

7. **Test completion percentage**:
   - Check progress bar
   - Should show `10/64 matches` (15.6%)
   - NOT `10/104 matches` (was fixed)

### Priority 2: Scoring Calculations ⚠️ HIGH PRIORITY

**Feature #181-190**: Automatic scoring after match completion

**Test Flow:**
1. Create test predictions matching known results
2. Trigger scoring calculation (manual or automatic)
3. Verify points:

**Exact Score Tests (5 points each):**
- Predict Argentina 3-3 France → 5 points ✅
- Predict Spain 7-0 Costa Rica → 5 points ✅
- Predict England 6-2 Iran → 5 points ✅
- Predict Qatar 0-2 Ecuador → 5 points ✅

**Correct Goal Difference Tests (3 points each):**
- Actual: Argentina 2-0 Mexico
- Predict: Argentina 3-1 Mexico → 3 points (diff: +2) ✅

**Correct Winner Tests (1 point each):**
- Actual: Argentina 1-2 Saudi Arabia (Saudi wins)
- Predict: Saudi Arabia 1-0 Argentina → 1 point (wrong score, right winner) ✅

**Wrong Prediction (0 points):**
- Actual: Denmark 0-0 Tunisia (draw)
- Predict: Denmark 2-1 Tunisia → 0 points ❌

4. Verify UserStatistics table updates:
   - totalPoints increases
   - exactScores count increases
   - correctWinners count increases
   - totalPredictions count

### Priority 3: Leaderboards with Real Data ⚠️ MEDIUM PRIORITY

**Feature #76-84**: Individual standings display

**Test Flow:**
1. Create 5 test users
2. Each submits different predictions for same 10 matches
3. Run scoring calculation
4. Check individual standings:
   - Verify sorting by points (highest first)
   - Verify columns display correctly:
     * Rank (1, 2, 3...)
     * Name
     * Department
     * Total Points
     * Exact Scores
     * Correct Winners
     * Predictions Made (should show 10/64)
   - Verify current user highlighted
   - Verify top 3 have gold/silver/bronze styling

### Priority 4: Home Page Updates ⚠️ MEDIUM PRIORITY

**Feature #21-26**: Home page display

**Verification:**
1. Navigate to home page (`/`)
2. **Next Match Card**:
   - Should show first scheduled match (if any) OR first match from 2022 data
   - Verify team names display (Argentina, France, etc., not simulated names)
   - Verify flags display correctly (flagcdn.com URLs)
   - Verify date/time display
   - Verify venue display

3. **Mini Leaderboard**:
   - Should show top 5 users (if any have predictions)
   - Verify names, departments, points display
   - If no users, should show empty state

4. **Prize Info**:
   - Verify displays correctly (no changes needed)

### Priority 5: Matches Page ⚠️ MEDIUM PRIORITY

**Feature #101-110**: Matches listing and filtering

**Verification:**
1. Navigate to `/matches`
2. Verify 64 matches display (not 12)
3. Verify match details:
   - Team names (Argentina, France, Brazil, etc.)
   - Flags display
   - Scores display for finished matches
   - Status shows "finished" or "live"

4. Test filtering:
   - Filter by stage (group, round16, quarter, semi, final)
   - Verify correct matches show

### Priority 6: Authentication Features ⚠️ LOW PRIORITY

**Currently Passing (14/255):**
- Feature #2: Duplicate email rejected ✅
- Feature #3: Login with valid credentials ✅
- Feature #4: Invalid credentials rejected ✅
- Feature #11: Non-admin blocked from admin panel ✅
- Feature #12: Admin can access admin panel ✅

**Currently Failing:**
- Feature #1: User registration
- Feature #5: User logout
- Feature #6-10: Password reset, profile editing

**Re-test passing features** to ensure still working after data change.

## Test Credentials

**Existing Users:**
- Admin: admin@wk2026.com / password123
- User 1: john.doe@wk2026.com / password123
- User 2: jane.smith@wk2026.com / password123

**Create Additional Test Users:**
- testuser1@wk2026.com / password123
- testuser2@wk2026.com / password123
- testuser3@wk2026.com / password123
- testuser4@wk2026.com / password123
- testuser5@wk2026.com / password123

## Known Issues to Watch

1. **Group Letters Empty**: Teams have empty `groupLetter` field
   - Normal for 2022 data (different group structure)
   - Shouldn't break functionality
   - Just visual on groups page

2. **Some Matches Show "live"**: Should be "finished"
   - API-Football status mapping issue
   - Doesn't block testing - scores are present
   - Can be fixed later if needed

3. **Hardcoded Text References**: Some UI text still says "104 matches" or "48 teams"
   - Doesn't break functionality
   - Can be updated to dynamic text later
   - Not a blocker for testing

## Success Criteria

After testing, these features should be marked as passing in `feature_list.json`:

**Prediction System (10+ features):**
- [x] Feature #47: Can enter 0 as score ✅ (already passing)
- [ ] Feature #41: Can access prediction page
- [ ] Feature #42: Can submit predictions
- [ ] Feature #43: Predictions persist
- [ ] Feature #44: Auto-save works
- [ ] Feature #45: Progress indicator shows correctly
- [ ] Feature #46: Can edit predictions before deadline

**Scoring (5+ features):**
- [ ] Feature #181: Points calculated correctly for exact scores
- [ ] Feature #182: Points calculated correctly for goal difference
- [ ] Feature #183: Points calculated correctly for winner
- [ ] Feature #184: Zero points for wrong predictions
- [ ] Feature #185: Statistics updated after scoring

**Leaderboards (5+ features):**
- [ ] Feature #76: Standings display ✅ (already passing)
- [ ] Feature #77: Columns correct ✅ (already passing)
- [ ] Feature #78: Exact scores count ✅ (already passing)
- [ ] Feature #79: Correct winners count ✅ (already passing)
- [ ] Feature #80: Predictions made count ✅ (already passing)

**Target: 35-40 tests passing (from current 14)**

## Commands to Run

```bash
# Start backend server
cd /Users/noa/OpenCode/WK2026/server
npm run dev
# Runs on http://localhost:3001

# Start frontend server (in new terminal)
cd /Users/noa/OpenCode/WK2026/client
npm run dev
# Runs on http://localhost:5173

# Open in browser
open http://localhost:5173
```

## Next Steps After Testing

1. **If tests pass**: Mark features as passing in feature_list.json
2. **If tests fail**: Debug and fix issues
3. **Document results**: Update agent-progress.txt with session summary
4. **Commit changes**: Git commit with descriptive message
5. **Continue to next priority features**: Registration, profile, etc.

---

**Status**: Ready to begin testing! 🚀
**Blocker**: Resolved ✅
**Data**: 2022 World Cup loaded ✅
**Fixes**: Zero score bug fixed ✅, completion percentage fixed ✅
