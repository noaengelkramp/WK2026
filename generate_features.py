#!/usr/bin/env python3
import json

features = []
feature_id = 1

# A. Authentication & User Management (20 tests)
auth_features = [
    ("User can register with email, password, first name, last name, and department", "high", ["Navigate to /register", "Fill in email, password, name, department", "Click Register", "Verify redirect to login page", "Verify success message"]),
    ("User cannot register with duplicate email", "high", ["Navigate to /register", "Enter already registered email", "Verify error message appears"]),
    ("User can login with valid credentials", "high", ["Navigate to /login", "Enter valid email and password", "Click Login", "Verify redirect to home page", "Verify user menu shows name"]),
    ("User cannot login with invalid credentials", "high", ["Navigate to /login", "Enter invalid password", "Verify error message displayed"]),
    ("User can logout successfully", "medium", ["Login as user", "Click logout button", "Verify redirect to login page", "Verify cannot access protected routes"]),
    ("User can view their profile", "medium", ["Login as user", "Navigate to /profile", "Verify name, email, department displayed"]),
    ("User can edit their profile information", "medium", ["Navigate to /profile", "Change first name", "Click Save", "Verify success message", "Verify change persisted"]),
    ("User can change their password", "medium", ["Navigate to /profile", "Enter current password and new password", "Click Change Password", "Verify can login with new password"]),
    ("User can request password reset", "medium", ["Navigate to /forgot-password", "Enter email", "Verify email sent message", "Check email for reset link"]),
    ("User can reset password with valid token", "medium", ["Click password reset link from email", "Enter new password", "Submit", "Verify can login with new password"]),
    ("User cannot access admin panel without admin role", "high", ["Login as regular user", "Navigate to /admin", "Verify access denied message"]),
    ("Admin can access admin panel", "high", ["Login as admin", "Navigate to /admin", "Verify admin dashboard loads"]),
    ("Password must meet strength requirements", "medium", ["Navigate to /register", "Enter weak password (e.g., '123')", "Verify validation error"]),
    ("Email validation works correctly", "medium", ["Navigate to /register", "Enter invalid email format", "Verify validation error"]),
    ("User session persists on page reload", "medium", ["Login as user", "Reload page", "Verify still logged in"]),
    ("User session expires after JWT expiry", "low", ["Login as user", "Wait for token expiry or manipulate token", "Verify forced to login again"]),
    ("User can select language preference (EN/NL)", "medium", ["Login as user", "Navigate to /profile", "Change language to Dutch", "Verify UI updates to Dutch"]),
    ("Registration form validates required fields", "medium", ["Navigate to /register", "Submit empty form", "Verify all required field errors shown"]),
    ("User cannot register with password shorter than 8 characters", "medium", ["Navigate to /register", "Enter 6-character password", "Verify error message"]),
    ("User can export their personal data (GDPR)", "low", ["Login as user", "Navigate to /profile/data", "Click Export Data", "Verify JSON file downloads with user predictions"]),
]

for desc, priority, steps in auth_features:
    features.append({
        "id": feature_id,
        "category": "Authentication",
        "description": desc,
        "priority": priority,
        "test_steps": steps,
        "passes": False
    })
    feature_id += 1

# B. Home Page & Navigation (15 tests)
home_features = [
    ("Home page displays next scheduled match", "high", ["Navigate to /", "Verify next match card shows teams, date, time, venue"]),
    ("Home page shows mini individual leaderboard (top 5)", "high", ["Navigate to /", "Verify top 5 users displayed with names, points, ranks"]),
    ("Home page shows mini department leaderboard (top 5)", "high", ["Navigate to /", "Verify top 5 departments with names, total points"]),
    ("Home page displays countdown to prediction deadline", "high", ["Navigate to /", "Verify countdown timer shows days, hours, minutes, seconds"]),
    ("Home page shows sponsor logos", "medium", ["Navigate to /", "Verify sponsor logo section displays images"]),
    ("Home page has working navigation to all major pages", "high", ["Navigate to /", "Click each nav link (Standings, Matches, Groups, etc.)", "Verify correct page loads"]),
    ("Home page is responsive on mobile", "medium", ["Navigate to / on mobile viewport (375px width)", "Verify layout stacks vertically", "Verify no horizontal scroll"]),
    ("Home page is responsive on tablet", "medium", ["Navigate to / on tablet viewport (768px width)", "Verify layout adjusts properly"]),
    ("Home page is responsive on desktop", "medium", ["Navigate to / on desktop viewport (1920px width)", "Verify layout uses full width appropriately"]),
    ("Navigation menu works on mobile (hamburger)", "medium", ["Navigate to / on mobile", "Click hamburger menu", "Verify menu opens", "Click menu item", "Verify navigation works"]),
    ("User menu shows correct user name when logged in", "medium", ["Login as user", "Navigate to /", "Click user menu", "Verify name displayed correctly"]),
    ("Language switcher changes UI language", "medium", ["Navigate to /", "Click language switcher to NL", "Verify text changes to Dutch", "Switch to EN", "Verify text changes to English"]),
    ("Home page loads within 3 seconds", "low", ["Navigate to /", "Measure load time", "Verify complete page load < 3 seconds"]),
    ("Home page displays prize promotion banner", "medium", ["Navigate to /", "Verify prize banner visible", "Click banner", "Verify navigates to /prizes"]),
    ("Footer contains links to Rules, Privacy Policy, Terms", "low", ["Navigate to /", "Scroll to footer", "Verify links present", "Click Rules link", "Verify navigates to /rules"]),
]

for desc, priority, steps in home_features:
    features.append({
        "id": feature_id,
        "category": "Home Page",
        "description": desc,
        "priority": priority,
        "test_steps": steps,
        "passes": False
    })
    feature_id += 1

# C. Prediction System (40 tests)
prediction_features = [
    ("My Prediction page requires authentication", "high", ["Navigate to /my-prediction without login", "Verify redirect to /login"]),
    ("My Prediction page displays deadline notice prominently", "high", ["Login and navigate to /my-prediction", "Verify deadline banner with date/time visible"]),
    ("My Prediction page shows completion progress", "high", ["Navigate to /my-prediction", "Verify progress bar shows X/104 matches and Y/5 bonus questions"]),
    ("User can predict score for group stage match", "high", ["Navigate to /my-prediction", "Find match in Group A", "Select home score (e.g., 2) and away score (e.g., 1)", "Verify selection saved"]),
    ("Predictions auto-save on change", "high", ["Navigate to /my-prediction", "Change a score", "Verify save indicator shows", "Reload page", "Verify change persisted"]),
    ("User can see all 48 group stage matches", "high", ["Navigate to /my-prediction", "Scroll through groups A-L", "Verify 48 matches listed"]),
    ("Group stage matches are organized by groups", "medium", ["Navigate to /my-prediction", "Verify matches grouped under Group A, B, C...L headings"]),
    ("Each match shows team flags", "medium", ["Navigate to /my-prediction", "Verify each team has flag icon displayed"]),
    ("Score dropdowns offer 0-10+ options", "medium", ["Navigate to /my-prediction", "Click score dropdown", "Verify options 0,1,2...9,10+"]),
    ("Completed matches are greyed out and locked", "high", ["Navigate to /my-prediction after a match finishes", "Verify completed match shows actual score", "Verify cannot edit prediction"]),
    ("Knockout bracket auto-populates based on group predictions", "high", ["Navigate to /my-prediction", "Complete group stage predictions", "View knockout bracket", "Verify Round of 32 matchups populated with predicted group winners"]),
    ("User can manually override knockout qualifiers", "medium", ["Navigate to /my-prediction knockout section", "Click Edit Qualifiers", "Change a team", "Verify bracket updates"]),
    ("User can predict knockout match scores", "high", ["Navigate to knockout bracket", "Select a Round of 32 match", "Predict score", "Verify saved"]),
    ("Knockout bracket displays as visual tree", "medium", ["Navigate to knockout bracket", "Verify visual representation of Round 32 -> Round 16 -> Quarter -> Semi -> Final"]),
    ("User can select World Cup champion from dropdown", "high", ["Navigate to /my-prediction", "Scroll to Champion selection", "Select team from dropdown", "Verify saved"]),
    ("Champion dropdown lists all 48 teams", "medium", ["Click champion dropdown", "Verify all teams listed with flags"]),
    ("User can answer bonus question: Top Scorer", "high", ["Navigate to /my-prediction bonus questions", "Select player from top scorer dropdown", "Verify saved"]),
    ("User can answer bonus question: Highest scoring team", "medium", ["Navigate to bonus questions", "Select team", "Verify saved"]),
    ("User can answer bonus question: Total goals in tournament", "medium", ["Navigate to bonus questions", "Enter number (e.g., 150)", "Verify saved"]),
    ("User can answer bonus question: Most yellow cards team", "medium", ["Navigate to bonus questions", "Select team", "Verify saved"]),
    ("Save Draft button saves all predictions", "medium", ["Make several predictions", "Click Save Draft", "Verify success message", "Reload", "Verify all predictions persisted"]),
    ("Submit Final button locks all predictions", "high", ["Complete predictions", "Click Submit Final", "Confirm in modal", "Verify predictions locked", "Verify cannot edit"]),
    ("Submit Final shows confirmation modal", "medium", ["Click Submit Final", "Verify modal appears asking for confirmation", "Click Cancel", "Verify can still edit"]),
    ("Incomplete predictions warning on submit", "medium", ["Leave some predictions empty", "Click Submit Final", "Verify warning message about incomplete predictions"]),
    ("Predictions cannot be submitted after deadline", "high", ["Navigate to /my-prediction after deadline", "Verify all fields disabled", "Verify submit button disabled"]),
    ("Deadline countdown shows on My Prediction page", "medium", ["Navigate to /my-prediction before deadline", "Verify countdown timer visible"]),
    ("After deadline, page shows 'Locked' status", "high", ["Navigate to /my-prediction after deadline", "Verify banner says 'Predictions are now locked'"]),
    ("User can view their previous predictions", "medium", ["Login as user who submitted predictions", "Navigate to /my-prediction", "Verify all previous predictions displayed"]),
    ("Predictions show points earned after matches complete", "high", ["Navigate to /my-prediction after match completes", "Verify points displayed next to prediction"]),
    ("Round of 16 bracket updates after Round of 32", "medium", ["After Round of 32 completes", "Navigate to knockout bracket", "Verify Round of 16 shows actual qualifiers"]),
    ("Quarter-finals bracket updates correctly", "medium", ["After Round of 16 completes", "Verify quarter-final matchups show actual teams"]),
    ("Semi-finals bracket updates correctly", "medium", ["After quarter-finals complete", "Verify semi-finals show correct teams"]),
    ("Final match shows in bracket", "high", ["After semi-finals", "Verify final match displayed with correct teams"]),
    ("Third-place match is shown separately", "medium", ["Navigate to knockout bracket", "Verify third-place playoff match displayed"]),
    ("User can filter predictions by status (pending/completed)", "low", ["Navigate to /my-prediction", "Click filter: Show Only Completed", "Verify only completed matches shown"]),
    ("Mobile view of predictions is usable", "high", ["Navigate to /my-prediction on mobile", "Verify dropdowns easy to tap", "Verify layout readable"]),
    ("Validation prevents selecting same team twice in bracket", "low", ["In knockout bracket", "Try to select same team for both sides", "Verify validation error"]),
    ("Progress percentage calculates correctly", "medium", ["Make 52 predictions (50% of 104)", "Verify progress shows 50%"]),
    ("Bonus questions have deadlines displayed", "low", ["Navigate to bonus questions", "Verify each question shows deadline"]),
    ("Can save partial predictions and return later", "high", ["Make 10 predictions", "Logout", "Login again", "Navigate to /my-prediction", "Verify 10 predictions saved"]),
]

for desc, priority, steps in prediction_features:
    features.append({
        "id": feature_id,
        "category": "Prediction System",
        "description": desc,
        "priority": priority,
        "test_steps": steps,
        "passes": False
    })
    feature_id += 1

# D. Standings & Leaderboards (20 tests)
standings_features = [
    ("Individual standings page displays all users", "high", ["Navigate to /standings/individual", "Verify table shows all registered users"]),
    ("Individual standings show rank, name, department, points", "high", ["Navigate to /standings/individual", "Verify columns: Rank, Name, Department, Total Points"]),
    ("Individual standings include correct scores count", "medium", ["Navigate to /standings/individual", "Verify 'Correct Scores' column displays"]),
    ("Individual standings include correct winners count", "medium", ["Navigate to /standings/individual", "Verify 'Correct Winners' column displays"]),
    ("Individual standings include predictions made count", "low", ["Navigate to /standings/individual", "Verify 'Predictions Made' column"]),
    ("Individual standings have search functionality", "high", ["Navigate to /standings/individual", "Enter name in search box", "Verify filtered results"]),
    ("Search works case-insensitive", "medium", ["Search for 'john'", "Verify finds 'John', 'JOHN', 'john'"]),
    ("Individual standings are paginated (50 per page)", "medium", ["Navigate to /standings/individual", "Verify pagination controls", "Click page 2", "Verify shows next 50 users"]),
    ("Current user's position is highlighted", "medium", ["Login as user", "Navigate to /standings/individual", "Verify own row highlighted in different color"]),
    ("Individual standings update in real-time after match", "high", ["After match completes and scoring runs", "Navigate to /standings/individual", "Verify points updated"]),
    ("Can filter standings by department", "medium", ["Navigate to /standings/individual", "Select department filter", "Verify only users from that department shown"]),
    ("Can sort standings by any column", "medium", ["Click 'Correct Scores' header", "Verify sorted by that column", "Click again", "Verify reverse sort"]),
    ("Department standings page displays all departments", "high", ["Navigate to /standings/departments", "Verify all departments listed"]),
    ("Department standings show rank, name, total points, avg points", "high", ["Navigate to /standings/departments", "Verify columns correct"]),
    ("Department standings show member count", "medium", ["Navigate to /standings/departments", "Verify member count column"]),
    ("Department total points calculated correctly", "high", ["Navigate to /standings/departments", "Take department A total", "Click department", "Verify sum of member points equals total"]),
    ("Department average points calculated correctly", "high", ["Navigate to /standings/departments", "Verify avg = total / member count"]),
    ("Can click department to see members", "medium", ["Navigate to /standings/departments", "Click department row", "Verify modal/page shows all members with individual points"]),
    ("Tie-breaking works correctly in individual standings", "medium", ["Create scenario with tied users", "Verify user with more exact scores ranks higher"]),
    ("Export standings to CSV works", "low", ["Navigate to /standings/individual", "Click Export CSV", "Verify CSV file downloads with correct data"]),
]

for desc, priority, steps in standings_features:
    features.append({
        "id": feature_id,
        "category": "Standings",
        "description": desc,
        "priority": priority,
        "test_steps": steps,
        "passes": False
    })
    feature_id += 1

# E. Matches & Groups (25 tests)
matches_features = [
    ("Matches page displays all 104 matches", "high", ["Navigate to /matches", "Scroll through all matches", "Verify count is 104"]),
    ("Matches page has tabs for different stages", "high", ["Navigate to /matches", "Verify tabs: All, Group Stage, Round of 32, Round of 16, Quarter, Semi, Final"]),
    ("All tab shows all matches", "medium", ["Click All tab", "Verify 104 matches shown"]),
    ("Group Stage tab shows 48 matches", "high", ["Click Group Stage tab", "Verify 48 matches shown"]),
    ("Round of 32 tab shows 16 matches", "medium", ["Click Round of 32 tab", "Verify 16 matches"]),
    ("Each match shows match number, date, time", "high", ["Navigate to /matches", "Verify each match card shows match #, date, time"]),
    ("Each match shows venue and city", "medium", ["Navigate to /matches", "Verify venue name and city displayed"]),
    ("Each match shows team flags", "medium", ["Navigate to /matches", "Verify home and away team flags displayed"]),
    ("Match status shows Scheduled/Live/Finished", "high", ["Navigate to /matches", "Verify status badge on each match"]),
    ("Finished matches display final score", "high", ["Navigate to /matches", "Find finished match", "Verify score displayed (e.g., 2-1)"]),
    ("Live matches show live indicator", "medium", ["During live match", "Navigate to /matches", "Verify live badge/animation"]),
    ("Can filter matches by date range", "medium", ["Navigate to /matches", "Select date range filter", "Verify only matches in range shown"]),
    ("Can filter matches by team", "medium", ["Navigate to /matches", "Search for 'Brazil'", "Verify only Brazil matches shown"]),
    ("Link to knockout bracket view works", "medium", ["Navigate to /matches", "Click 'View Bracket'", "Verify bracket visualization loads"]),
    ("Groups page displays all 12 groups", "high", ["Navigate to /groups", "Verify groups A through L displayed"]),
    ("Groups page has tabs for each group", "high", ["Navigate to /groups", "Verify tabs A, B, C...L"]),
    ("Each group shows standings table", "high", ["Navigate to /groups", "Select Group A", "Verify standings table with 4 teams"]),
    ("Group standings show W/D/L columns", "high", ["Navigate to /groups Group A", "Verify columns: Played, Won, Drawn, Lost"]),
    ("Group standings show goals for/against/difference", "high", ["Navigate to /groups Group A", "Verify GF, GA, GD columns"]),
    ("Group standings show points", "high", ["Navigate to /groups Group A", "Verify Points column"]),
    ("Group standings show form (last 5 matches)", "medium", ["Navigate to /groups Group A", "Verify Form column with W/D/L indicators"]),
    ("Group standings update after each match", "high", ["After group match completes", "Navigate to /groups", "Verify standings updated"]),
    ("Groups page shows group fixtures", "medium", ["Navigate to /groups Group A", "Verify list of group matches below standings"]),
    ("Click team in group standings shows team details", "low", ["Navigate to /groups", "Click team name", "Verify team info modal/page"]),
    ("Qualification rules displayed on Groups page", "low", ["Navigate to /groups", "Verify text explaining 'Top 2 + best 3rd place teams qualify'"]),
]

for desc, priority, steps in matches_features:
    features.append({
        "id": feature_id,
        "category": "Matches & Groups",
        "description": desc,
        "priority": priority,
        "test_steps": steps,
        "passes": False
    })
    feature_id += 1

# F. Statistics Page (20 tests)
statistics_features = [
    ("Statistics page displays tournament summary", "high", ["Navigate to /statistics", "Verify total goals, cards, avg goals per match displayed"]),
    ("Statistics show total goals scored in tournament", "high", ["Navigate to /statistics", "Verify 'Total Goals' stat"]),
    ("Statistics show total yellow cards", "medium", ["Navigate to /statistics", "Verify yellow cards count"]),
    ("Statistics show total red cards", "medium", ["Navigate to /statistics", "Verify red cards count"]),
    ("Statistics show average goals per match", "medium", ["Navigate to /statistics", "Verify calculated avg"]),
    ("Statistics show highest-scoring match", "low", ["Navigate to /statistics", "Verify match with most goals highlighted"]),
    ("Statistics show highest-scoring team", "low", ["Navigate to /statistics", "Verify team with most goals"]),
    ("Prediction accuracy chart displays", "high", ["Navigate to /statistics", "Verify bar chart showing predicted vs actual outcomes"]),
    ("Exact scores chart shows percentage", "medium", ["Navigate to /statistics", "Verify pie chart with exact scores / correct winners / incorrect"]),
    ("Top predicted teams vs actual qualifiers chart", "medium", ["Navigate to /statistics", "Verify comparison chart"]),
    ("Statistics has tabs for different stages", "high", ["Navigate to /statistics", "Verify tabs: Group Stage, Knockout, Champion, Bonus Questions"]),
    ("Group Stage Stats tab shows group-by-group analysis", "medium", ["Click Group Stage Stats tab", "Verify stats for each group"]),
    ("Knockout Stats tab shows round-by-round analysis", "medium", ["Click Knockout Stats tab", "Verify stats for each knockout round"]),
    ("Champion Predictions tab shows breakdown of user predictions", "high", ["Click Champion tab", "Verify bar chart showing how many users predicted each team"]),
    ("Bonus Questions tab shows results", "medium", ["Click Bonus Questions tab", "Verify stats for each bonus question"]),
    ("Charts use Chart.js library", "low", ["Navigate to /statistics", "Verify charts are interactive (hover shows tooltips)"]),
    ("Statistics update after each match", "high", ["After match completes", "Navigate to /statistics", "Verify stats updated"]),
    ("Can export statistics to PDF", "low", ["Navigate to /statistics", "Click Export PDF", "Verify PDF downloads"]),
    ("Mobile view of statistics is readable", "medium", ["Navigate to /statistics on mobile", "Verify charts scale appropriately"]),
    ("Statistics page loads within 3 seconds", "low", ["Navigate to /statistics", "Measure load time", "Verify < 3 seconds"]),
]

for desc, priority, steps in statistics_features:
    features.append({
        "id": feature_id,
        "category": "Statistics",
        "description": desc,
        "priority": priority,
        "test_steps": steps,
        "passes": False
    })
    feature_id += 1

# G. Admin Panel (30 tests)
admin_features = [
    ("Admin panel requires admin authentication", "high", ["Navigate to /admin without admin login", "Verify access denied"]),
    ("Admin dashboard shows overview statistics", "high", ["Login as admin", "Navigate to /admin", "Verify stats: total users, total predictions, pending tasks"]),
    ("Admin can view all users in table", "high", ["Navigate to /admin/users", "Verify table lists all users"]),
    ("Admin can search users", "medium", ["Navigate to /admin/users", "Search for user", "Verify filtered results"]),
    ("Admin can create new user", "high", ["Navigate to /admin/users", "Click Create User", "Fill form", "Submit", "Verify user created"]),
    ("Admin can edit user details", "high", ["Navigate to /admin/users", "Click Edit on user", "Change name", "Save", "Verify updated"]),
    ("Admin can delete user", "high", ["Navigate to /admin/users", "Click Delete", "Confirm", "Verify user removed"]),
    ("Admin can reset user password", "medium", ["Navigate to /admin/users", "Click Reset Password", "Verify new password sent/displayed"]),
    ("Admin can change user role (user/admin)", "high", ["Navigate to /admin/users", "Edit user", "Change role to admin", "Save", "Verify user has admin access"]),
    ("Admin can bulk import users from CSV", "medium", ["Navigate to /admin/users", "Click Import CSV", "Upload file", "Verify users created"]),
    ("Admin can view all departments", "high", ["Navigate to /admin/departments", "Verify all departments listed"]),
    ("Admin can create new department", "high", ["Navigate to /admin/departments", "Click Create", "Enter name, upload logo", "Save", "Verify created"]),
    ("Admin can edit department", "medium", ["Navigate to /admin/departments", "Click Edit", "Change name", "Save", "Verify updated"]),
    ("Admin can delete department", "medium", ["Navigate to /admin/departments", "Click Delete", "Confirm", "Verify deleted"]),
    ("Admin can assign users to departments", "medium", ["Navigate to /admin/users", "Edit user", "Change department", "Save", "Verify updated"]),
    ("Admin can view all matches", "high", ["Navigate to /admin/matches", "Verify all 104 matches listed"]),
    ("Admin can edit match details", "medium", ["Navigate to /admin/matches", "Click Edit on match", "Change venue", "Save", "Verify updated"]),
    ("Admin can manually enter match result", "high", ["Navigate to /admin/matches", "Find match", "Enter home score 2, away score 1", "Set status Finished", "Save", "Verify result saved"]),
    ("Entering match result triggers scoring calculation", "high", ["Admin enters match result", "Verify scoring calculation runs", "Check user points updated"]),
    ("Admin can trigger manual scoring recalculation", "medium", ["Navigate to /admin/matches", "Click 'Recalculate All Scores'", "Verify confirmation", "Verify points updated"]),
    ("Admin can import fixtures from API", "high", ["Navigate to /admin/matches", "Click 'Import from API'", "Verify fixtures imported/updated"]),
    ("Admin can view all teams", "medium", ["Navigate to /admin/teams", "Verify all 48 teams listed"]),
    ("Admin can edit team details", "low", ["Navigate to /admin/teams", "Click Edit on team", "Change FIFA rank", "Save"]),
    ("Admin can configure scoring rules", "high", ["Navigate to /admin/scoring-rules", "Change 'Group exact score' from 5 to 6 points", "Save", "Verify rule updated"]),
    ("Admin can add prizes", "high", ["Navigate to /admin/prizes", "Click Add Prize", "Enter rank 1, name, description, upload image", "Save", "Verify prize created"]),
    ("Admin can edit prizes", "medium", ["Navigate to /admin/prizes", "Click Edit", "Change description", "Save"]),
    ("Admin can delete prizes", "medium", ["Navigate to /admin/prizes", "Click Delete", "Confirm"]),
    ("Admin can create bonus questions", "high", ["Navigate to /admin/bonus-questions", "Click Create", "Enter question, set options, deadline", "Save", "Verify created"]),
    ("Admin can set correct answers for bonus questions", "high", ["After tournament", "Navigate to /admin/bonus-questions", "Click Set Answer", "Select correct answer", "Save", "Verify points calculated"]),
    ("Admin can configure app settings", "medium", ["Navigate to /admin/settings", "Change prediction deadline", "Save", "Verify deadline updated throughout app"]),
]

for desc, priority, steps in admin_features:
    features.append({
        "id": feature_id,
        "category": "Admin Panel",
        "description": desc,
        "priority": priority,
        "test_steps": steps,
        "passes": False
    })
    feature_id += 1

# H. External API Integration (15 tests)
api_features = [
    ("System can fetch teams from Live-Score API", "high", ["Trigger API sync", "Verify 48 teams imported with names, flags"]),
    ("System can fetch fixtures from Live-Score API", "high", ["Trigger API sync", "Verify 104 matches imported with dates, venues"]),
    ("System can fetch live scores from API", "high", ["During live match", "Trigger sync", "Verify score updated"]),
    ("System can fetch group standings from API", "high", ["Trigger sync", "Verify group tables updated for all 12 groups"]),
    ("API sync handles rate limiting gracefully", "medium", ["Trigger multiple rapid API calls", "Verify rate limit errors handled", "Verify retries with backoff"]),
    ("API sync logs all requests", "medium", ["Trigger API sync", "Navigate to /admin/api-logs", "Verify request logged with status, response time"]),
    ("API sync caches responses", "medium", ["Trigger API call", "Check cache", "Make same call within TTL", "Verify cached data used"]),
    ("Scheduled job updates fixtures daily", "medium", ["Wait for scheduled job or trigger manually", "Verify fixtures updated"]),
    ("Scheduled job updates scores every 5 min during matches", "high", ["During match day", "Verify scores update every 5 minutes"]),
    ("When match finishes, scoring calculation triggered", "high", ["When API returns finished match", "Verify scoring calculation runs automatically"]),
    ("After scoring, leaderboards update automatically", "high", ["After scoring runs", "Navigate to /standings", "Verify points updated"]),
    ("API errors are logged and don't crash app", "high", ["Simulate API failure", "Verify error logged", "Verify app uses cached data", "Verify app remains functional"]),
    ("Admin can manually trigger API sync", "high", ["Navigate to /admin/api", "Click 'Sync Now'", "Verify sync runs", "Verify data updated"]),
    ("API authentication works with key and secret", "high", ["Configure API keys in .env", "Trigger sync", "Verify authenticated requests succeed"]),
    ("System handles API timeout gracefully", "medium", ["Simulate slow API", "Verify timeout after 30 seconds", "Verify error handling"]),
]

for desc, priority, steps in api_features:
    features.append({
        "id": feature_id,
        "category": "API Integration",
        "description": desc,
        "priority": priority,
        "test_steps": steps,
        "passes": False
    })
    feature_id += 1

# I. Security & Privacy (10 tests)
security_features = [
    ("All passwords are hashed with bcrypt", "high", ["Create user", "Check database", "Verify password_hash is bcrypt format, not plaintext"]),
    ("JWT tokens expire after configured time", "medium", ["Login", "Wait for expiry", "Try to access protected route", "Verify forced to re-login"]),
    ("API endpoints validate all inputs", "high", ["Send invalid data to API endpoint", "Verify 400 error with validation message"]),
    ("SQL injection is prevented", "high", ["Try SQL injection in login form", "Verify sanitized, no injection"]),
    ("XSS attacks are prevented", "high", ["Try to inject <script> tag in user input", "Verify sanitized"]),
    ("HTTPS enforced in production", "medium", ["Access app via HTTP in production", "Verify redirected to HTTPS"]),
    ("Rate limiting prevents abuse", "medium", ["Make 150 requests in 1 minute", "Verify rate limit error after 100"]),
    ("User can export their data (GDPR)", "high", ["Navigate to /profile/data", "Click Export", "Verify JSON with all user data downloads"]),
    ("User can delete their account (GDPR)", "medium", ["Navigate to /profile", "Click Delete Account", "Confirm", "Verify account deleted"]),
    ("CORS configured correctly", "medium", ["Make API call from different origin", "Verify CORS headers allow/deny correctly based on config"]),
]

for desc, priority, steps in security_features:
    features.append({
        "id": feature_id,
        "category": "Security",
        "description": desc,
        "priority": priority,
        "test_steps": steps,
        "passes": False
    })
    feature_id += 1

# J. Responsive Design & UX (15 tests)
responsive_features = [
    ("App is fully responsive on iPhone SE (375px)", "high", ["Open app on iPhone SE", "Navigate all pages", "Verify no horizontal scroll", "Verify all content readable"]),
    ("App is fully responsive on iPad (768px)", "high", ["Open app on iPad", "Navigate all pages", "Verify layout uses tablet optimizations"]),
    ("App is fully responsive on desktop (1920px)", "high", ["Open app on desktop", "Navigate all pages", "Verify layout uses full width appropriately"]),
    ("Touch targets are at least 44x44px on mobile", "medium", ["Open app on mobile", "Verify all buttons, links, dropdowns easy to tap"]),
    ("Forms are easy to use on mobile", "high", ["Open /my-prediction on mobile", "Fill predictions", "Verify dropdowns, inputs work well"]),
    ("Loading spinners display during async operations", "medium", ["Navigate to page that loads data", "Verify spinner shows while loading"]),
    ("Error messages are user-friendly", "high", ["Trigger validation error", "Verify error message is clear and helpful"]),
    ("Success messages display after actions", "medium", ["Save predictions", "Verify success toast/message appears"]),
    ("Keyboard navigation works throughout app", "medium", ["Use only keyboard (Tab, Enter, Escape)", "Navigate app", "Verify all functionality accessible"]),
    ("Screen reader support for accessibility", "low", ["Use screen reader", "Navigate app", "Verify alt text, labels, ARIA tags present"]),
    ("Dark mode support (optional)", "low", ["Toggle dark mode", "Verify all pages use dark theme", "Verify readable contrast"]),
    ("App works offline for viewed pages (PWA)", "low", ["Load page", "Disable network", "Reload", "Verify cached version loads"]),
    ("Images have alt text", "medium", ["Inspect all images", "Verify alt attributes present"]),
    ("App works in Chrome, Firefox, Safari, Edge", "high", ["Test app in each browser", "Verify full functionality"]),
    ("No console errors in production", "medium", ["Open app in production", "Open console", "Verify no errors"]),
]

for desc, priority, steps in responsive_features:
    features.append({
        "id": feature_id,
        "category": "Responsive Design",
        "description": desc,
        "priority": priority,
        "test_steps": steps,
        "passes": False
    })
    feature_id += 1

# K. Internationalization (5 tests)
i18n_features = [
    ("App supports English language", "high", ["Set language to EN", "Navigate all pages", "Verify all text in English"]),
    ("App supports Dutch language", "high", ["Set language to NL", "Navigate all pages", "Verify all text in Dutch"]),
    ("Language preference persists", "medium", ["Set language to NL", "Reload page", "Verify still in Dutch"]),
    ("Date/time formatted per locale", "medium", ["Switch to NL", "Verify dates show as DD-MM-YYYY", "Switch to EN", "Verify MM/DD/YYYY"]),
    ("Numbers formatted per locale", "low", ["Switch to NL", "Verify large numbers use . as thousands separator", "Switch to EN", "Verify comma separator"]),
]

for desc, priority, steps in i18n_features:
    features.append({
        "id": feature_id,
        "category": "Internationalization",
        "description": desc,
        "priority": priority,
        "test_steps": steps,
        "passes": False
    })
    feature_id += 1

output = {
    "project": "World Cup 2026 Prediction Game",
    "version": "1.0.0",
    "total_features": len(features),
    "last_updated": "2026-01-21",
    "categories": {
        "Authentication": 20,
        "Home Page": 15,
        "Prediction System": 40,
        "Standings": 20,
        "Matches & Groups": 25,
        "Statistics": 20,
        "Admin Panel": 30,
        "API Integration": 15,
        "Security": 10,
        "Responsive Design": 15,
        "Internationalization": 5
    },
    "features": features
}

with open('feature_list.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"✅ Generated feature_list.json with {len(features)} test cases")

# L. Email & Notifications (15 tests)
notification_features = [
    ("System sends welcome email after registration", "high", ["Register new user", "Check email inbox", "Verify welcome email received with login instructions"]),
    ("System sends prediction deadline reminder 24h before", "high", ["Wait until 24h before deadline", "Check email", "Verify reminder email received"]),
    ("System sends prediction deadline reminder 1h before", "high", ["Wait until 1h before deadline", "Check email", "Verify final reminder received"]),
    ("System sends match start notification", "medium", ["Enable notifications", "Wait for match to start", "Verify notification received"]),
    ("System sends notification when match result is available", "medium", ["After match completes", "Check email", "Verify result notification with points earned"]),
    ("System sends weekly standings update email", "medium", ["Wait for weekly email", "Check inbox", "Verify standings summary received"]),
    ("System sends prize winner notification", "high", ["After tournament ends", "Winners receive email", "Verify email congratulates and explains prize claim"]),
    ("System sends tournament conclusion email to all participants", "medium", ["After tournament ends", "Check email", "Verify final standings and thank you message"]),
    ("User can opt-in/opt-out of email notifications", "high", ["Navigate to /profile/notifications", "Toggle email preferences", "Save", "Verify preferences respected"]),
    ("User can opt-in/opt-out of push notifications", "medium", ["Navigate to /profile/notifications", "Toggle push notifications", "Verify preferences saved"]),
    ("Emails support English language", "high", ["Set user language to EN", "Trigger notification", "Verify email in English"]),
    ("Emails support Dutch language", "high", ["Set user language to NL", "Trigger notification", "Verify email in Dutch"]),
    ("Password reset email sent successfully", "high", ["Request password reset", "Check email", "Verify reset link received and works"]),
    ("Email templates are professionally designed", "low", ["Receive any email", "Check design", "Verify branded, well-formatted, mobile-responsive"]),
    ("Notification system logs all sent emails", "low", ["Send email", "Navigate to /admin/notifications", "Verify email logged with status"]),
]

for desc, priority, steps in notification_features:
    features.append({
        "id": feature_id,
        "category": "Email & Notifications",
        "description": desc,
        "priority": priority,
        "test_steps": steps,
        "passes": False
    })
    feature_id += 1

# M. Flexible Participation (10 tests)
flexible_features = [
    ("User can skip predicting any match", "high", ["Navigate to /my-prediction", "Leave some matches blank", "Click Save Draft", "Verify saved without errors"]),
    ("User can submit predictions for only group stage", "high", ["Predict only group matches", "Leave knockout blank", "Submit", "Verify accepted"]),
    ("User can submit predictions for only knockout stage", "medium", ["Skip group predictions", "Only fill knockout", "Submit", "Verify accepted"]),
    ("User can predict only matches of their favorite team", "high", ["Fill predictions for Brazil matches only", "Submit", "Verify accepted"]),
    ("Scoring system only counts predictions that were made", "high", ["User predicts 20 out of 104 matches", "After matches complete", "Verify points only calculated for those 20"]),
    ("Leaderboard shows 'Predictions Made' count", "high", ["Navigate to /standings/individual", "Verify column shows how many predictions each user made"]),
    ("User with fewer predictions can still rank high", "medium", ["User A predicts 10 matches with 100% accuracy", "User B predicts 50 matches with 60% accuracy", "Verify both can rank competitively"]),
    ("User can add predictions for later matches even after earlier matches finished", "high", ["After group stage starts", "User adds knockout predictions", "Verify accepted for future matches"]),
    ("System doesn't force predictions for all matches", "high", ["Try to submit with only 10 predictions", "Verify no error about incomplete predictions"]),
    ("User can still participate after their favorite team eliminated", "high", ["After team eliminated", "User can still predict remaining matches", "Verify full functionality"]),
]

for desc, priority, steps in flexible_features:
    features.append({
        "id": feature_id,
        "category": "Flexible Participation",
        "description": desc,
        "priority": priority,
        "test_steps": steps,
        "passes": False
    })
    feature_id += 1

# N. Admin Insights & Reporting (15 tests)
admin_reporting_features = [
    ("Admin can view list of all registered customers", "high", ["Login as admin", "Navigate to /admin/customers", "Verify complete list with names, emails, departments, registration dates"]),
    ("Admin can view customer's full prediction set", "high", ["Navigate to /admin/customers", "Click on customer", "View Predictions", "Verify all predictions displayed"]),
    ("Admin can filter customers by department", "medium", ["Navigate to /admin/customers", "Filter by department", "Verify filtered list"]),
    ("Admin can filter customers by prediction status", "medium", ["Navigate to /admin/customers", "Filter by 'Has Submitted Predictions'", "Verify only users with predictions shown"]),
    ("Admin can export customer list to CSV", "high", ["Navigate to /admin/customers", "Click Export CSV", "Verify file contains all customer data"]),
    ("Admin can see participation statistics", "high", ["Navigate to /admin/dashboard", "Verify stats: Total registered, Total with predictions, Participation rate %"]),
    ("Admin can view winners after tournament", "high", ["After tournament ends", "Navigate to /admin/winners", "Verify top 3 individual winners and department winner displayed"]),
    ("Admin can generate tournament report", "medium", ["Navigate to /admin/reports", "Click Generate Report", "Verify PDF with all statistics, winners, participation"]),
    ("Admin can view most/least predicted outcomes", "medium", ["Navigate to /admin/insights", "Verify chart showing most popular predictions"]),
    ("Admin can see which customers haven't submitted predictions", "high", ["Navigate to /admin/customers", "Filter by 'No Predictions'", "Verify list of inactive users"]),
    ("Admin can send manual email to specific users", "medium", ["Navigate to /admin/customers", "Select users", "Click Send Email", "Compose message", "Send", "Verify received"]),
    ("Admin can see email delivery statistics", "low", ["Navigate to /admin/notifications", "Verify dashboard shows emails sent, delivered, opened, bounced"]),
    ("Admin can view prediction trends over time", "low", ["Navigate to /admin/insights", "Verify chart showing predictions submitted per day"]),
    ("Admin dashboard shows upcoming deadline warnings", "medium", ["Navigate to /admin", "Verify warning if deadline approaching and many users haven't predicted"]),
    ("Admin can view audit log of all admin actions", "low", ["Navigate to /admin/audit-log", "Verify log shows who changed what and when"]),
]

for desc, priority, steps in admin_reporting_features:
    features.append({
        "id": feature_id,
        "category": "Admin Insights",
        "description": desc,
        "priority": priority,
        "test_steps": steps,
        "passes": False
    })
    feature_id += 1

# Update totals
output["total_features"] = len(features)
output["categories"]["Email & Notifications"] = 15
output["categories"]["Flexible Participation"] = 10
output["categories"]["Admin Insights"] = 15
output["features"] = features

with open('feature_list.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"✅ Updated feature_list.json with {len(features)} test cases (added Email, Flexible Participation, and Admin Insights)")
