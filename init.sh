#!/bin/bash
set -e

echo "🚀 Initializing World Cup 2026 Prediction Game development environment..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Install dependencies for both client and server if they exist
if [ -d "server" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ -d "client" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

echo "✅ Environment initialized!"
echo "💡 To start the development servers, run 'npm run dev' in both client and server directories."
