#!/bin/bash

# Script to push WK2026 to GitHub
# This will prompt for your GitHub credentials

echo "🚀 Pushing WK2026 to GitHub..."
echo ""
echo "You will be prompted for:"
echo "  Username: noaengelkramp"
echo "  Password: Your Personal Access Token (NOT your GitHub password)"
echo ""
echo "Don't have a token? Create one at: https://github.com/settings/tokens"
echo "  - Click 'Generate new token (classic)'"
echo "  - Select 'repo' scope"
echo "  - Copy the token"
echo ""
read -p "Press Enter to continue..."

# Ensure we're in the right directory
cd /Users/noa/OpenCode/WK2026

# Check git status
echo ""
echo "📊 Current git status:"
git status

echo ""
echo "📝 Commits to push:"
git log --oneline -5

echo ""
echo "🔄 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 View your repository: https://github.com/noaengelkramp/WK2026"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://app.netlify.com"
    echo "2. Click 'Add new site' → 'Import from GitHub'"
    echo "3. Select 'noaengelkramp/WK2026'"
    echo "4. Add environment variables (see NETLIFY_DEPLOYMENT.md)"
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "Common issues:"
    echo "1. Wrong credentials - Make sure you're using a Personal Access Token, not your password"
    echo "2. Token doesn't have 'repo' scope - Create a new token with full repo access"
    echo "3. Repository doesn't exist - Make sure https://github.com/noaengelkramp/WK2026 exists"
    echo ""
    echo "Try again or contact support."
fi
