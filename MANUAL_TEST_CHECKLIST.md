# Manual Testing Checklist - WK2026 Prediction Game

**Date**: January 22, 2026  
**Tester**: _____________  
**Browser**: _____________  
**Status**: 🟡 Pending Browser Testing

---

## ✅ Backend API Tests (COMPLETED - All Passing)

### Authentication Endpoints
- [x] **POST /api/auth/login** - Valid credentials ✅
  - Test: `john.doe@wk2026.com` / `password123`
  - Result: Returns JWT tokens and user object
  
- [x] **POST /api/auth/login** - Invalid credentials ✅
  - Test: `john.doe@wk2026.com` / `wrongpassword`
  - Result: Returns 401 error "Invalid email or password"

### Data Endpoints
- [x] **GET /health** - Health check ✅
- [x] **GET /api/teams** - Get teams ✅
- [x] **GET /api/matches** - Get matches ✅
- [x] **GET /api/standings/individual** - Individual standings ✅
- [x] **GET /api/standings/departments** - Department standings ✅

---

## 🟡 Frontend Tests (REQUIRES BROWSER)

### Test Credentials
```
Admin:
  Email: admin@wk2026.com
  Password: password123

Regular Users:
  john.doe@wk2026.com / password123
  jane.smith@wk2026.com / password123
```

### Priority 1: Authentication Flow (HIGH)

#### Feature #3: User can login with valid credentials
**URL**: http://localhost:5173/login

**Test Steps**:
1. [ ] Navigate to http://localhost:5173/login
2. [ ] Verify login form is displayed
3. [ ] Enter email: `john.doe@wk2026.com`
4. [ ] Enter password: `password123`
5. [ ] Click "Sign In" button
6. [ ] Verify redirect to home page (/)
7. [ ] Verify user menu shows "John Doe" name
8. [ ] Take screenshot of successful login

**Expected Result**:
- ✅ Form submits without errors
- ✅ Redirects to home page
- ✅ User name displayed in navigation
- ✅ No console errors

**Actual Result**: _______________  
**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

#### Feature #4: User cannot login with invalid credentials
**URL**: http://localhost:5173/login

**Test Steps**:
1. [ ] Navigate to http://localhost:5173/login
2. [ ] Enter email: `john.doe@wk2026.com`
3. [ ] Enter password: `wrongpassword`
4. [ ] Click "Sign In" button
5. [ ] Verify error message displayed
6. [ ] Verify still on login page
7. [ ] Take screenshot of error

**Expected Result**:
- ✅ Error alert shows "Invalid email or password"
- ✅ User stays on login page
- ✅ No redirect occurs

**Actual Result**: _______________  
**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

#### Feature #5: User can logout successfully
**URL**: http://localhost:5173/

**Test Steps**:
1. [ ] Login as `john.doe@wk2026.com`
2. [ ] Verify logged in (name in header)
3. [ ] Click logout button in navigation
4. [ ] Verify redirect to /login
5. [ ] Verify user is logged out
6. [ ] Try to navigate to /my-prediction
7. [ ] Verify redirect to /login (protected route)

**Expected Result**:
- ✅ Logout successful
- ✅ Redirects to login page
- ✅ Protected routes inaccessible
- ✅ localStorage cleared

**Actual Result**: _______________  
**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Priority 2: Home Page Display (HIGH)

#### Feature #21: Home page displays correctly
**URL**: http://localhost:5173/

**Test Steps**:
1. [ ] Navigate to home page (logged in)
2. [ ] Verify "Next Match" card displays
3. [ ] Verify "Top Players" leaderboard displays
4. [ ] Verify "Top Departments" leaderboard displays
5. [ ] Verify "Prediction Deadline" countdown displays
6. [ ] Verify "Prizes to Win!" card displays
7. [ ] Check all gradients use Kramp Red (#9B1915)
8. [ ] Take screenshot

**Expected Result**:
- ✅ All cards load with real data
- ✅ Loading spinners show while fetching
- ✅ Kramp brand colors (Red #9B1915, Blue #194461)
- ✅ No white-on-white text issues
- ✅ No console errors
- ✅ Responsive on mobile/tablet/desktop

**Visual Checklist**:
- [ ] Text is readable (good contrast)
- [ ] Red gradient on "Next Match" card
- [ ] Blue gradient on "Deadline" card
- [ ] Red gradient on "Prizes" card
- [ ] No layout issues
- [ ] Data loads from API (not mock data)

**Actual Result**: _______________  
**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

#### Feature #22: Next match displays correct information
**Test Steps**:
1. [ ] Verify match displays team names
2. [ ] Verify match displays team flags (emojis or images)
3. [ ] Verify match displays date/time
4. [ ] Verify match displays venue
5. [ ] Verify match status shown (Scheduled/Live/Finished)

**Expected Result**:
- ✅ All match information displayed correctly
- ✅ Teams loaded from backend API
- ✅ Formatting is clean and readable

**Actual Result**: _______________  
**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Priority 3: Navigation & Layout

#### Feature #41: Navigation menu works correctly
**Test Steps**:
1. [ ] Click "Standings" → verify navigates to /standings/individual
2. [ ] Click "Matches" → verify navigates to /matches
3. [ ] Click "Groups" → verify navigates to /groups
4. [ ] Click "My Prediction" → verify navigates to /my-prediction
5. [ ] Click "Rules" → verify navigates to /rules
6. [ ] Click "Prizes" → verify navigates to /prizes
7. [ ] Click logo → verify navigates to /

**Expected Result**:
- ✅ All navigation links work
- ✅ Active route highlighted
- ✅ Mobile hamburger menu works

**Actual Result**: _______________  
**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### Priority 4: Brand Colors Verification (CRITICAL)

#### Visual Brand Check
**Test Steps**:
1. [ ] Open browser DevTools
2. [ ] Inspect primary buttons
3. [ ] Verify color is #9B1915 (Kramp Red), not #FF6600 (Orange)
4. [ ] Inspect secondary elements
5. [ ] Verify color is #194461 (Kramp Blue), not #003D6D
6. [ ] Check h1/h2 heading colors
7. [ ] Take screenshots of color picker

**Expected Colors**:
- Primary: `#9B1915` (Kramp Red) ✅
- Secondary: `#194461` (Kramp Blue) ✅
- Background: `#FFFFFF` (White), `#F5F5F5` (Light Grey) ✅
- Text: `#212121` (Dark Grey), `#666666` (Medium Grey) ✅

**Actual Result**: _______________  
**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

## 🔍 Console Error Check

Open browser console (F12) and check for errors:

**JavaScript Errors**: [ ] None [ ] Some [ ] Many  
**Network Errors**: [ ] None [ ] Some [ ] Many  
**React Warnings**: [ ] None [ ] Some [ ] Many

**Screenshot console**: _______________

---

## 📱 Responsive Design Check

Test on multiple screen sizes:

### Desktop (>1024px)
- [ ] Layout looks good
- [ ] All content visible
- [ ] No horizontal scroll

### Tablet (768-1024px)
- [ ] Layout adapts correctly
- [ ] Navigation still usable
- [ ] Cards stack appropriately

### Mobile (<768px)
- [ ] Hamburger menu appears
- [ ] Content readable
- [ ] Touch targets large enough
- [ ] No text overflow

---

## 🎨 Accessibility Check

- [ ] Tab navigation works (keyboard only)
- [ ] Focus indicators visible
- [ ] Alt text on images (if any)
- [ ] Contrast ratios acceptable (WCAG AA)
- [ ] Screen reader friendly (if tool available)

---

## ⚡ Performance Check

- [ ] Initial page load < 3 seconds
- [ ] No layout shift (CLS)
- [ ] Smooth interactions
- [ ] API responses cached (check Network tab)

---

## 📝 Notes & Issues Found

### Issues:
1. _______________
2. _______________
3. _______________

### Observations:
1. _______________
2. _______________
3. _______________

---

## ✅ Test Summary

**Total Tests Planned**: 10  
**Tests Passed**: ___  
**Tests Failed**: ___  
**Tests Blocked**: ___  

**Ready for Next Steps**: [ ] Yes [ ] No

**Next Priority**: _______________

---

## 🚀 Ready to Mark as Passing in feature_list.json

Once tests pass, update:
- Feature #3 → `"passes": true`
- Feature #4 → `"passes": true`
- Feature #5 → `"passes": true`
- Feature #21 → `"passes": true` (if exists)

**Remember**: ONLY change the "passes" field, never edit test descriptions!
