# 🏆 World Cup 2026 Prediction Game

An interactive web application for company employees to predict FIFA World Cup 2026 match outcomes, compete on leaderboards, and win prizes.

![Status](https://img.shields.io/badge/status-in_development-yellow)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Test Cases](https://img.shields.io/badge/test_cases-255-green)

## 📋 Overview

The World Cup 2026 Prediction Game allows employees to:
- 🎯 Predict scores for all 104 World Cup matches (48 group + 56 knockout)
- 🏅 Compete on individual and department leaderboards
- ⭐ Answer bonus questions (top scorer, champion, etc.)
- 🎁 Win exciting prizes based on prediction accuracy
- 📊 View real-time statistics and tournament analytics
- 🌍 Access the platform in English or Dutch

## ✨ Key Features

### For Users
- **Secure Authentication**: Personal accounts with department assignment
- **Flexible Predictions**: Predict any number of matches (not required to predict all)
- **Live Updates**: Leaderboards update automatically when match results arrive
- **Smart Bracket**: Knockout bracket auto-populates based on group predictions
- **Bonus Challenges**: Extra points for top scorer, champion, and custom questions
- **Progress Tracking**: See completion status and points breakdown
- **Multi-language**: Full support for English and Dutch
- **Email Notifications**: Reminders, results, and prize announcements

### For Administrators
- **User Management**: View, create, edit, and delete users
- **Complete Insights**: See who registered, their predictions, and winners
- **Result Entry**: Manually enter scores or sync from external APIs
- **Communication Tools**: Send targeted emails to participants
- **Prize Management**: Configure prizes and scoring rules
- **Real-time Dashboard**: Monitor participation and engagement
- **Flexible Configuration**: Set deadlines, scoring points, and settings

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn**

### Installation

```bash
# Clone or navigate to project directory
cd /Users/noa/OpenCode/WK2026

# Run setup script (installs dependencies, creates .env, sets up database)
./init.sh

# Start backend server (Terminal 1)
cd server
npm run dev

# Start frontend dev server (Terminal 2)
cd client
npm run dev

# Open browser to http://localhost:3000
```

### Manual Setup

If `init.sh` doesn't work on your system:

```bash
# 1. Create environment file
cp .env.example .env
# Edit .env with your database credentials and API keys

# 2. Create PostgreSQL database
createdb wk2026

# 3. Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# 4. Run database migrations (once implemented)
cd server
npm run migrate

# 5. Seed initial data (teams, matches, scoring rules)
npm run seed

# 6. Start servers (2 terminals)
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev
```

## 📁 Project Structure

```
WK2026/
├── client/                    # React frontend (TypeScript)
│   ├── public/
│   │   └── locales/          # i18n translations (en, nl)
│   └── src/
│       ├── components/       # Reusable React components
│       ├── pages/           # Page components
│       ├── services/        # API client services
│       ├── hooks/           # Custom React hooks
│       ├── types/           # TypeScript type definitions
│       └── utils/           # Utility functions
│
├── server/                   # Express backend (TypeScript)
│   └── src/
│       ├── config/          # Configuration files
│       ├── models/          # Sequelize database models
│       ├── routes/          # API route definitions
│       ├── controllers/     # Request handlers
│       ├── middleware/      # Express middleware
│       ├── services/        # Business logic layer
│       ├── jobs/            # Scheduled tasks (cron)
│       └── utils/           # Utility functions
│
├── database/
│   ├── migrations/          # Database migrations
│   └── seeders/             # Seed data (teams, matches)
│
├── docs/                    # Documentation
│   ├── API.md              # API documentation
│   ├── DATABASE.md         # Database schema
│   └── DEPLOYMENT.md       # Deployment guide
│
├── app_spec.txt            # Full application specification
├── feature_list.json       # 255 test cases
├── agent-progress.txt      # Development progress log
├── init.sh                 # Setup automation script
├── .env.example            # Environment variables template
└── README.md               # This file
```

## 🗄️ Database Schema

Core tables:
- **users**: User accounts with authentication
- **departments**: Company departments for group competition
- **teams**: 48 World Cup teams
- **matches**: 104 tournament matches
- **predictions**: User score predictions
- **bonus_questions**: Extra challenges
- **bonus_answers**: User answers to bonus questions
- **prizes**: Prize catalog
- **scoring_rules**: Configurable point values
- **user_statistics**: Cached leaderboard data
- **department_statistics**: Department rankings

See `docs/DATABASE.md` for full schema details.

## 🎮 How to Play

1. **Register**: Create an account with your company email and department
2. **Predict**: Submit score predictions for upcoming matches before the deadline
3. **Watch**: Follow the tournament and see your points update after each match
4. **Compete**: Climb the individual and department leaderboards
5. **Win**: Top predictors receive prizes!

### Scoring System

**Group Stage Matches:**
- Exact score: **5 points**
- Correct winner (wrong score): **3 points**
- Correct draw: **3 points**

**Knockout Rounds** (progressive points):
- Round of 32: 7 / 5 / 3 points
- Round of 16: 9 / 6 / 4 points
- Quarter-finals: 11 / 7 / 5 points
- Semi-finals: 13 / 9 / 6 points
- Final: 20 / 15 / 10 points

**Bonus Points:**
- Correct champion: **30 points**
- Correct top scorer: **15 points**
- Other bonus questions: **10 points** each

**Flexible Participation:**
- You can predict as many or as few matches as you want
- Skip matches if your team is eliminated
- Points only calculated for predictions you actually make

## 🔌 External API Integration

The platform integrates with football data APIs for real-time results:

**Primary:** [Live-Score API](https://live-score-api.com)
- Fetch fixtures, live scores, standings
- Updates every 5 minutes during matches
- Automatic point calculation after matches

**Alternatives:**
- [Statorium World Cup API](https://statorium.com/fifa-world-cup-2026-api)
- [Sportmonks Football API](https://www.sportmonks.com/football-api)

Configuration in `.env`:
```env
LIVESCORE_API_KEY=your-api-key
LIVESCORE_API_SECRET=your-api-secret
LIVESCORE_COMPETITION_ID=362
LIVESCORE_SEASON=2026
```

## 📧 Email Notifications

Automated emails for:
- ✉️ Welcome message after registration
- ⏰ Prediction deadline reminders (24h and 1h before)
- ⚽ Match start notifications
- 📊 Weekly standings updates
- 🎁 Prize winner announcements
- 🏁 Tournament conclusion summary

Configure SMTP in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🌐 Internationalization

Full support for:
- 🇬🇧 English
- 🇳🇱 Dutch (Nederlands)

Translation files: `client/public/locales/{en,nl}/translation.json`

Users can switch languages in their profile settings. All UI text, emails, and notifications respect language preference.

## 🔒 Security Features

- 🔐 **Password Hashing**: bcrypt with 12 rounds
- 🎫 **JWT Authentication**: Secure token-based auth
- 🛡️ **Input Validation**: All inputs sanitized and validated
- 🚫 **SQL Injection Protection**: Parameterized queries via ORM
- 🔒 **HTTPS Only**: Enforced in production
- ⏱️ **Rate Limiting**: Prevent abuse (100 req/15min)
- 🇪🇺 **GDPR Compliant**: Data export and deletion

## 📊 Development Progress

**Total Features**: 255 test cases across 14 categories

Progress tracking in `feature_list.json`:

| Category | Test Cases | Status |
|----------|-----------|--------|
| Authentication | 20 | 🔴 Pending |
| Home Page | 15 | 🔴 Pending |
| Prediction System | 40 | 🔴 Pending |
| Standings | 20 | 🔴 Pending |
| Matches & Groups | 25 | 🔴 Pending |
| Statistics | 20 | 🔴 Pending |
| Admin Panel | 30 | 🔴 Pending |
| API Integration | 15 | 🔴 Pending |
| Security | 10 | 🔴 Pending |
| Responsive Design | 15 | 🔴 Pending |
| Internationalization | 5 | 🔴 Pending |
| Email & Notifications | 15 | 🔴 Pending |
| Flexible Participation | 10 | 🔴 Pending |
| Admin Insights | 15 | 🔴 Pending |

See `agent-progress.txt` for session-by-session development log.

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test

# Run E2E tests (once implemented)
npm run test:e2e

# Check code coverage
npm run test:coverage
```

## 🚢 Deployment

### Environment Setup

Production environment variables:
- `NODE_ENV=production`
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong random secret
- `LIVESCORE_API_KEY`: API credentials
- `CLIENT_URL`: Frontend URL

### Recommended Hosting

**Frontend**: Vercel, Netlify, AWS S3 + CloudFront  
**Backend**: AWS EC2, Heroku, Railway, DigitalOcean  
**Database**: AWS RDS PostgreSQL, Heroku Postgres, Supabase  
**Redis**: Redis Cloud, AWS ElastiCache (for caching)

See `docs/DEPLOYMENT.md` for detailed deployment instructions.

## 📖 Documentation

- **Full Specification**: `app_spec.txt`
- **Feature Tests**: `feature_list.json`
- **API Endpoints**: `docs/API.md` (coming soon)
- **Database Schema**: `docs/DATABASE.md` (coming soon)
- **Deployment Guide**: `docs/DEPLOYMENT.md` (coming soon)
- **Development Log**: `agent-progress.txt`

## 🤝 Contributing

This is an internal company project developed with AI assistance. Development follows an autonomous agent workflow documented in `agent-progress.txt`.

### Development Workflow

1. Each session starts by reading:
   - `app_spec.txt` (requirements)
   - `feature_list.json` (test cases)
   - `agent-progress.txt` (previous progress)

2. Implement one feature at a time
3. Test thoroughly with browser automation
4. Update `feature_list.json`: mark `"passes": true`
5. Commit with descriptive message
6. Update `agent-progress.txt`

## 📅 Timeline

- **Development**: January - May 2026
- **Registration Opens**: May 1, 2026
- **Prediction Deadline**: June 11, 2026 23:00
- **Tournament**: June 11 - July 19, 2026
- **Winner Announcement**: July 20, 2026

## 🎁 Prizes

1st Place: Professional Foosball Table 🎯  
2nd Place: Smart TV 📺  
3rd Place: Tablet 📱  
Top Department: Team Dinner Voucher 🍽️

## 📄 License

Proprietary - Internal company use only

## 💬 Support

For questions or issues:
- Check documentation in `docs/`
- Review `app_spec.txt` for requirements
- See `feature_list.json` for expected functionality
- Contact project administrator

---

**Built with**: React · TypeScript · Node.js · Express · PostgreSQL · Material-UI · Chart.js

**Powered by**: Live-Score API · Sequelize · JWT · bcrypt · i18next

🚀 **Version 1.0.0** - Ready for FIFA World Cup 2026! ⚽🏆
