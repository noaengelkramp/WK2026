# Manual Browser Testing Checklist
**World Cup 2026 Prediction Game**

## Prerequisites
- ✅ Backend running on http://localhost:3001
- ✅ Frontend running on http://localhost:5173
- ✅ Database seeded with 134 matches
- ✅ Test credentials available (see below)

## Test Credentials

```
Admin User:
  Email: admin@wk2026.com
  Password: password123

Regular User 1:
  Email: john.doe@wk2026.com
  Password: password123
  Department: Engineering

Regular User 2:
  Email: jane.smith@wk2026.com
  Password: password123
  Department: Marketing
```

---

## CRITICAL USER FLOWS (Test These First!)

### 🔐 Flow 1: User Registration
**Priority**: HIGH | **Feature IDs**: #1, #2, #5

**Steps**:
1. [ ] Navigate to http://localhost:5173/register
2. [ ] Verify registration form displays correctly
3. [ ] Fill in form:
   - Email: newtestuser@wk2026.com
   - Password: TestPassword123!
   - First Name: New
   - Last Name: User
   - Department: Select "Engineering"
4. [ ] Click "Register" button
5. [ ] **Expected**: Success message appears
6. [ ] **Expected**: Redirect to login page
7. [ ] **Take Screenshot**: Registration success

**Verification**:
- [ ] Form validation works (try submitting empty)
- [ ] Password strength indicator shows
- [ ] Department dropdown populated with 5 departments
- [ ] Error messages display for invalid inputs

**Marks as Passing**: Features #1, #5

---

### 🔑 Flow 2: User Login
**Priority**: HIGH | **Feature IDs**: #3, #4, #6

**Steps**:
1. [ ] Navigate to http://localhost:5173/login
2. [ ] Verify login form displays correctly
3. [ ] Try invalid login first:
   - Email: fake@test.com
   - Password: wrongpassword
4. [ ] Click "Login"
5. [ ] **Expected**: Error message "Invalid email or password"
6. [ ] Now try valid login:
   - Email: john.doe@wk2026.com
   - Password: password123
7. [ ] Click "Login"
8. [ ] **Expected**: Redirect to home page (/)
9. [ ] **Expected**: User menu shows "John Doe"
10. [ ] **Take Screenshot**: Successful login home page

**Verification**:
- [ ] Form validation works
- [ ] Error messages clear and helpful
- [ ] "Remember me" checkbox present
- [ ] "Forgot password" link present

**Marks as Passing**: Features #3, #4, #6

---

### 🏠 Flow 3: Home Page Display
**Priority**: HIGH | **Feature IDs**: #21-28

**Steps** (must be logged in):
1. [ ] Navigate to http://localhost:5173/
2. [ ] **Verify Next Match Section**:
   - [ ] Match date and time displayed
   - [ ] Team names and flags visible
   - [ ] Venue information shown
3. [ ] **Verify Countdown Timer**:
   - [ ] Timer displays "X days, Y hours, Z minutes to deadline"
   - [ ] Timer counts down in real-time
4. [ ] **Verify Individual Leaderboard (Top 5)**:
   - [ ] Table shows rank, name, points
   - [ ] At least 3 users displayed
5. [ ] **Verify Department Leaderboard (Top 5)**:
   - [ ] Table shows rank, department, points
   - [ ] At least 3 departments displayed
6. [ ] **Verify Navigation Links**:
   - [ ] "Make Predictions" button visible
   - [ ] "View Standings" link visible
   - [ ] "View Matches" link visible
7. [ ] **Take Screenshot**: Complete home page

**Verification**:
- [ ] Layout responsive (try resizing window)
- [ ] Colors match Kramp brand (blues/grays)
- [ ] All text readable (good contrast)
- [ ] Images/flags load correctly

**Marks as Passing**: Features #21-28

---

### ⚽ Flow 4: View Matches Page
**Priority**: HIGH | **Feature IDs**: #96-105

**Steps** (must be logged in):
1. [ ] Navigate to http://localhost:5173/matches
2. [ ] **Verify Match List**:
   - [ ] See multiple matches displayed
   - [ ] Each match shows: date, teams, venue, status
3. [ ] **Verify Stage Filter**:
   - [ ] Click "Group Stage" tab
   - [ ] Verify only group matches show (should be 72)
   - [ ] Click "Round of 32" tab
   - [ ] Verify knockout matches show (should be 32)
4. [ ] **Verify Search/Filter**:
   - [ ] Use search box to filter by team name (e.g., "Brazil")
   - [ ] Verify only relevant matches show
5. [ ] **Verify Match Details**:
   - [ ] Team flags display correctly
   - [ ] Match status shown (Scheduled/Live/Finished)
   - [ ] Venue and city visible
6. [ ] **Take Screenshot**: Matches page with filters

**Verification**:
- [ ] All 134 matches accessible
- [ ] Filters work correctly
- [ ] Pagination present (if applicable)
- [ ] Responsive on mobile view

**Marks as Passing**: Features #96-105

---

### 📊 Flow 5: View Groups Page
**Priority**: HIGH | **Feature IDs**: #106-115

**Steps** (must be logged in):
1. [ ] Navigate to http://localhost:5173/groups
2. [ ] **Verify Groups Display**:
   - [ ] See all 12 groups (A through L)
   - [ ] Can switch between groups (tabs or dropdown)
3. [ ] **Select Group A**:
   - [ ] See 4 teams in standings table
   - [ ] Columns: Position, Team, Played, Won, Drawn, Lost, GF, GA, GD, Points
   - [ ] See group's 6 matches listed below
4. [ ] **Select Group B**:
   - [ ] Different teams display
   - [ ] Different matches display
5. [ ] **Verify Team Details**:
   - [ ] Team flags show
   - [ ] Team names correct
   - [ ] FIFA rankings visible (if available)
6. [ ] **Take Screenshot**: Group standings view

**Verification**:
- [ ] All 12 groups accessible
- [ ] Standings calculate correctly (currently all 0-0-0)
- [ ] Match fixtures show correctly
- [ ] Responsive layout

**Marks as Passing**: Features #106-115

---

### 🎯 Flow 6: Make Predictions (MOST IMPORTANT!)
**Priority**: CRITICAL | **Feature IDs**: #36-75

**Steps** (must be logged in):
1. [ ] Navigate to http://localhost:5173/my-predictions
2. [ ] **Verify Predictions Interface**:
   - [ ] See group stage section
   - [ ] See list of matches (should be 72 group matches)
   - [ ] Each match has score input fields
3. [ ] **Make Some Predictions**:
   - [ ] Find Match #1 (opening match)
   - [ ] Enter home score: 2
   - [ ] Enter away score: 1
   - [ ] Find Match #2
   - [ ] Enter home score: 3
   - [ ] Enter away score: 0
   - [ ] Find Match #3
   - [ ] Enter home score: 1
   - [ ] Enter away score: 1
4. [ ] **Save Predictions**:
   - [ ] Click "Save" or "Submit Predictions" button
   - [ ] **Expected**: Success message appears
   - [ ] **Expected**: Predictions saved indicator
5. [ ] **Verify Predictions Persist**:
   - [ ] Refresh page
   - [ ] **Expected**: Entered scores still display
6. [ ] **Verify Knockout Section**:
   - [ ] See knockout bracket section (Round of 32, R16, etc.)
   - [ ] Note: Teams may be TBD initially
7. [ ] **Take Screenshot**: Predictions form with data entered
8. [ ] **Take Screenshot**: Success message after save

**Verification**:
- [ ] Can enter scores 0-99
- [ ] Validation prevents negative numbers
- [ ] Validation prevents non-numbers
- [ ] Can't predict past deadline (check if before June 11, 2026)
- [ ] Predictions load on page refresh
- [ ] Save button works consistently

**Marks as Passing**: Features #36-75 (group stage predictions)

---

### 🏆 Flow 7: View Individual Standings
**Priority**: HIGH | **Feature IDs**: #46-55

**Steps** (must be logged in):
1. [ ] Navigate to http://localhost:5173/standings/individual
2. [ ] **Verify Standings Table**:
   - [ ] Columns: Rank, Name, Department, Points, Correct Scores, Correct Winners
   - [ ] See at least 3-5 users listed
   - [ ] Rankings sorted by points (descending)
3. [ ] **Test Search**:
   - [ ] Use search box to find "John"
   - [ ] Verify John Doe appears
   - [ ] Clear search, all users reappear
4. [ ] **Test Filters**:
   - [ ] Filter by department (e.g., "Engineering")
   - [ ] Verify only Engineering users show
5. [ ] **Test Sorting**:
   - [ ] Click "Name" column header
   - [ ] Verify list sorts alphabetically
   - [ ] Click "Points" column header
   - [ ] Verify list sorts by points
6. [ ] **Verify Pagination** (if more than 50 users):
   - [ ] See page numbers at bottom
   - [ ] Click "Next" page
   - [ ] Different users display
7. [ ] **Take Screenshot**: Standings table

**Verification**:
- [ ] Current user highlighted (different background color)
- [ ] Export to CSV button present
- [ ] Responsive on mobile
- [ ] Real-time updates after matches (won't show yet since no matches finished)

**Marks as Passing**: Features #46-55

---

### 🏢 Flow 8: View Department Standings
**Priority**: HIGH | **Feature IDs**: #56-65

**Steps** (must be logged in):
1. [ ] Navigate to http://localhost:5173/standings/departments
2. [ ] **Verify Department Table**:
   - [ ] Columns: Rank, Department, Total Points, Avg Points, Members
   - [ ] See 5 departments listed
   - [ ] Rankings sorted by total points
3. [ ] **Click on a Department**:
   - [ ] Modal or expanded view shows department members
   - [ ] See list of users in that department
   - [ ] Each user shows their individual points
4. [ ] **Verify Department Details**:
   - [ ] Department logos display
   - [ ] Member count accurate
   - [ ] Average points calculated correctly (total / member count)
5. [ ] **Take Screenshot**: Department standings

**Verification**:
- [ ] All 5 departments present
- [ ] Sorting works
- [ ] Department names match database (Engineering, Marketing, Sales, HR, Finance)
- [ ] Responsive layout

**Marks as Passing**: Features #56-65

---

### 📜 Flow 9: View Rules Page
**Priority**: MEDIUM | **Feature IDs**: #131-135

**Steps**:
1. [ ] Navigate to http://localhost:5173/rules
2. [ ] **Verify Content Sections**:
   - [ ] "How to Play" section
   - [ ] "Prediction Rules" section
   - [ ] "Scoring System" section
   - [ ] "Deadlines" section
   - [ ] "Tiebreakers" section
3. [ ] **Verify Scoring Rules Display**:
   - [ ] Exact score prediction: X points
   - [ ] Correct winner: X points
   - [ ] Correct goal difference: X points
   - [ ] All scoring rules clearly explained
4. [ ] **Verify Deadline Info**:
   - [ ] Prediction deadline: June 11, 2026 23:00
   - [ ] Tournament dates: June 11 - July 19, 2026
5. [ ] **Take Screenshot**: Rules page

**Verification**:
- [ ] Text readable and well-formatted
- [ ] Sections organized logically
- [ ] No typos or grammar errors
- [ ] Scrolling works smoothly

**Marks as Passing**: Features #131-135

---

### 🎁 Flow 10: View Prizes Page
**Priority**: MEDIUM | **Feature IDs**: #136-140

**Steps**:
1. [ ] Navigate to http://localhost:5173/prizes
2. [ ] **Verify Prize Categories**:
   - [ ] 1st Place Prize displayed
   - [ ] 2nd Place Prize displayed
   - [ ] 3rd Place Prize displayed
   - [ ] Department Winner Prize displayed
   - [ ] Special awards (if any)
3. [ ] **Verify Prize Details**:
   - [ ] Prize descriptions clear
   - [ ] Prize values/items listed
   - [ ] Eligibility requirements stated
4. [ ] **Verify Visual Elements**:
   - [ ] Trophy/medal icons display
   - [ ] Layout attractive and engaging
5. [ ] **Take Screenshot**: Prizes page

**Verification**:
- [ ] Motivating and exciting presentation
- [ ] Clear what users can win
- [ ] Responsive layout

**Marks as Passing**: Features #136-140

---

### 📈 Flow 11: View Statistics Page
**Priority**: MEDIUM | **Feature IDs**: #116-125

**Steps** (must be logged in):
1. [ ] Navigate to http://localhost:5173/statistics
2. [ ] **Verify Statistics Display**:
   - [ ] Total participants count
   - [ ] Total predictions made
   - [ ] Total departments
   - [ ] Most predicted winner (team)
3. [ ] **Verify Charts**:
   - [ ] See Chart.js visualizations
   - [ ] Predictions by department (bar chart)
   - [ ] Predictions over time (line chart)
   - [ ] Most popular score predictions (pie chart)
   - [ ] Charts render without errors
4. [ ] **Verify Interactivity**:
   - [ ] Hover over chart shows tooltip
   - [ ] Legend clickable (toggles data series)
5. [ ] **Take Screenshot**: Statistics page with charts

**Verification**:
- [ ] All charts load correctly
- [ ] Data makes sense (no NaN or infinity)
- [ ] Responsive - charts resize with window
- [ ] Colors consistent with brand

**Marks as Passing**: Features #116-125

---

### 🔧 Flow 12: Admin Panel Access
**Priority**: HIGH | **Feature IDs**: #11, #12, #126-155

**Steps**:
1. [ ] **Test Regular User Access**:
   - [ ] Login as john.doe@wk2026.com
   - [ ] Navigate to http://localhost:5173/admin
   - [ ] **Expected**: Redirect to home or "Access Denied" message
   - [ ] **Take Screenshot**: Access denied
2. [ ] **Logout**:
   - [ ] Click user menu
   - [ ] Click "Logout"
3. [ ] **Test Admin Access**:
   - [ ] Login as admin@wk2026.com / password123
   - [ ] Navigate to http://localhost:5173/admin
   - [ ] **Expected**: Admin panel displays
   - [ ] **Take Screenshot**: Admin dashboard
4. [ ] **Verify Admin Sections**:
   - [ ] Dashboard with overview statistics
   - [ ] User management section
   - [ ] Match management section
   - [ ] Results entry section (CRITICAL)
   - [ ] Department management section
5. [ ] **Test User Management**:
   - [ ] See list of all users
   - [ ] Search for user by name/email
   - [ ] View user details
   - [ ] Edit user (if implemented)
6. [ ] **Test Match Result Entry** (CRITICAL):
   - [ ] See list of scheduled matches
   - [ ] Select a match
   - [ ] Enter result: Home 2 - Away 1
   - [ ] Submit
   - [ ] **Expected**: Match marked as finished
   - [ ] **Expected**: Scores calculate for all users (if scoring engine implemented)
   - [ ] **Take Screenshot**: Result entry form

**Verification**:
- [ ] Admin features hidden from regular users
- [ ] Admin can see all data
- [ ] CRUD operations work (if implemented)
- [ ] Result entry triggers scoring calculation (if implemented)

**Marks as Passing**: Features #11, #12, #126-155 (depending on what's implemented)

---

## RESPONSIVE DESIGN TESTING

### 📱 Mobile View (375px width)
**Priority**: HIGH | **Feature IDs**: #176-185

**Steps**:
1. [ ] Resize browser to mobile width (375px x 667px)
2. [ ] **Test All Pages on Mobile**:
   - [ ] Home page responsive
   - [ ] Login/Register forms usable
   - [ ] Matches page scrollable
   - [ ] Predictions page usable (score inputs accessible)
   - [ ] Standings tables readable
   - [ ] Navigation menu collapses to hamburger
3. [ ] **Take Screenshots**: Key pages in mobile view

**Verification**:
- [ ] No horizontal scrolling
- [ ] Text readable (not too small)
- [ ] Buttons tappable (large enough)
- [ ] Forms fill width properly
- [ ] Tables collapse or scroll horizontally

**Marks as Passing**: Features #176-185

---

### 💻 Tablet View (768px width)
**Priority**: MEDIUM | **Feature IDs**: #176-185

**Steps**:
1. [ ] Resize browser to tablet width (768px x 1024px)
2. [ ] Verify layout adapts correctly
3. [ ] Test navigation and key interactions

---

### 🖥️ Desktop View (1920px width)
**Priority**: LOW | **Feature IDs**: #176-185

**Steps**:
1. [ ] Expand to large desktop (1920px x 1080px)
2. [ ] Verify layout doesn't stretch awkwardly
3. [ ] Content centered or properly aligned

---

## VISUAL & UI TESTING

### 🎨 Brand Consistency
**Priority**: HIGH

**Check**:
- [ ] Primary color: Kramp blue (#0D47A1)
- [ ] Secondary color: Light blue (#1976D2)
- [ ] Accent color: Orange (#FF6F00)
- [ ] Background: Light gray (#F5F5F5)
- [ ] Text: Dark gray (#212121)
- [ ] No white-on-white text issues
- [ ] Good contrast ratios (WCAG AA compliant)

---

### ⚠️ Error Handling
**Priority**: HIGH

**Test**:
- [ ] Try submitting empty forms - see validation errors
- [ ] Enter invalid email format - see error
- [ ] Enter weak password - see error
- [ ] Try accessing page without login - redirect to login
- [ ] Network error simulation (offline) - see friendly error message

---

### ⏳ Loading States
**Priority**: MEDIUM

**Test**:
- [ ] See loading spinner when fetching matches
- [ ] See skeleton loaders for standings
- [ ] See "Loading..." text while data fetches
- [ ] No blank screens during load

---

### ✅ Success Messages
**Priority**: MEDIUM

**Test**:
- [ ] See success toast/banner after registration
- [ ] See success message after saving predictions
- [ ] See confirmation after logout
- [ ] Messages disappear after 3-5 seconds (auto-dismiss)

---

## FEATURE VERIFICATION TRACKING

Use this checklist to mark features in `feature_list.json`:

### Authentication (20 features)
- [ ] #1 - User registration
- [ ] #2 - Duplicate email rejection
- [ ] #3 - Login with valid credentials
- [ ] #4 - Login with invalid credentials
- [ ] #5 - Logout
- [ ] #6 - View profile
- [ ] #7 - Edit profile
- [ ] #8 - Change password
- [ ] #9 - Request password reset
- [ ] #10 - Reset password with token
- [ ] #11 - Non-admin cannot access admin panel
- [ ] #12 - Admin can access admin panel
- (Continue through #20...)

### Home Page (15 features)
- [ ] #21 - Display next match
- [ ] #22 - Mini individual leaderboard
- [ ] #23 - Mini department leaderboard
- [ ] #24 - Countdown timer
- (Continue through #35...)

### Prediction System (40 features)
- [ ] #36-75 - Group and knockout predictions
- (Test each prediction feature)

### Standings (20 features)
- [ ] #46-65 - Individual and department standings
- (Test each standings feature)

### ... (Continue for all 255 features)

---

## KNOWN ISSUES TO CHECK

Based on API testing, these features may not work:

1. **Scoring Rules Display** - Endpoint missing, may show empty
2. **Bonus Questions** - Endpoint missing, may show empty
3. **Admin Result Entry** - Endpoint missing, button may not work
4. **Scoring Calculation** - Service not implemented, points won't update after match results

---

## AFTER TESTING

### Update feature_list.json
For each passing feature, change:
```json
"passes": false
```
to:
```json
"passes": true
```

### Create BUGS.md
Document any bugs found:
```markdown
# Bug #1: White text on white background
**Severity**: HIGH
**Page**: /standings/individual
**Description**: User names appear in white text on white background, unreadable
**Steps to Reproduce**: 1. Login, 2. Navigate to standings
**Screenshot**: bug1-white-text.png

# Bug #2: Predictions not saving
**Severity**: CRITICAL
**Page**: /my-predictions
**Description**: Clicking "Save" shows success but predictions don't persist on refresh
**Steps to Reproduce**: 1. Enter scores, 2. Click Save, 3. Refresh page, 4. Scores gone
**Screenshot**: bug2-predictions.png
```

### Calculate Progress
```bash
cd /Users/noa/OpenCode/WK2026
jq '[.features[] | select(.passes == true)] | length' feature_list.json
# Output: X/255 passing

# Calculate percentage
echo "scale=2; (X / 255) * 100" | bc
# Output: Y.Z% complete
```

---

## SUCCESS CRITERIA

**MVP Ready** when:
- [ ] All authentication flows work (register, login, logout)
- [ ] Home page displays correctly
- [ ] Users can make predictions for all 134 matches
- [ ] Predictions save and persist
- [ ] Standings display correctly (even if all zeros initially)
- [ ] Matches page shows all 134 matches
- [ ] Admin can enter match results
- [ ] Scoring engine calculates points after results entered
- [ ] No critical visual bugs (readable text, good contrast)
- [ ] Responsive on mobile, tablet, desktop
- [ ] At least 200/255 features passing (78%)

---

## FINAL NOTES

**Estimated Time**: 3-4 hours for comprehensive testing
**Tools Needed**: Modern browser (Chrome/Firefox), screenshot tool
**Prerequisites**: Backend and frontend servers running, database seeded

**Priority Order**:
1. Critical user flows (registration → login → predictions → standings)
2. Admin functionality (result entry, user management)
3. Visual consistency and responsive design
4. Edge cases and error handling
5. Nice-to-have features (statistics charts, bonus questions)

**Remember**: Take screenshots at every step! These are required to mark features as passing per development guidelines.

Good luck with testing! 🎯
