#!/bin/bash

# WK2026 - Netlify Environment Variables
# Copy these values into Netlify Dashboard: Site Settings → Environment Variables

echo "================================================"
echo "🌐 NETLIFY ENVIRONMENT VARIABLES FOR WK2026"
echo "================================================"
echo ""
echo "Go to: https://app.netlify.com"
echo "Navigate to: Site Settings → Environment Variables → Add a variable"
echo ""
echo "Copy each variable below (name and value):"
echo ""
echo "================================================"
echo ""

cat << 'EOF'
DATABASE_URL
postgresql://neondb_owner:npg_QUjzs52YKeaT@ep-late-night-a9956b4q-pooler.gwc.azure.neon.tech/neondb?sslmode=require

JWT_SECRET
wk2026-super-secret-jwt-key-change-in-production-abc123xyz

JWT_REFRESH_SECRET
wk2026-refresh-token-secret-xyz789

JWT_EXPIRES_IN
7d

JWT_REFRESH_EXPIRES_IN
30d

NODE_ENV
production

NETLIFY
true

PREDICTION_DEADLINE
2026-06-11T23:00:00Z

TOURNAMENT_START
2026-06-11T00:00:00Z

TOURNAMENT_END
2026-07-19T23:59:59Z

FOOTBALL_API_KEY
ab748fd405ce9bdccfc1afda30f80e4c

FOOTBALL_API_BASE_URL
https://v3.football.api-sports.io

FOOTBALL_LEAGUE_ID
1

FOOTBALL_SEASON
2026

PORT
3001

CORS_ORIGIN
https://YOUR-SITE-NAME.netlify.app

CLIENT_URL
https://YOUR-SITE-NAME.netlify.app
EOF

echo ""
echo "================================================"
echo "⚠️  IMPORTANT NOTES:"
echo "================================================"
echo ""
echo "1. Replace 'YOUR-SITE-NAME' in CORS_ORIGIN and CLIENT_URL"
echo "   with your actual Netlify site URL"
echo ""
echo "2. After adding all variables, trigger a new deploy:"
echo "   Deploys → Trigger deploy → Deploy site"
echo ""
echo "3. After successful deploy, initialize the database:"
echo "   Visit: https://YOUR-SITE-NAME.netlify.app/api/setup"
echo ""
echo "4. Test your site:"
echo "   Visit: https://YOUR-SITE-NAME.netlify.app"
echo ""
echo "================================================"
