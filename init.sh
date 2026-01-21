#!/bin/bash

echo "========================================="
echo "  World Cup 2026 Prediction Game Setup  "
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher (current: $(node -v))${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠ PostgreSQL not found in PATH${NC}"
    echo "PostgreSQL is required. Install from:"
    echo "  - macOS: brew install postgresql"
    echo "  - Ubuntu: sudo apt install postgresql"
    echo "  - Windows: https://www.postgresql.org/download/windows/"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ PostgreSQL detected${NC}"
fi

echo ""
echo "========================================="
echo "  Setting up environment variables      "
echo "========================================="

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}⚠ Please edit .env file with your actual configuration${NC}"
    echo ""
    
    # Prompt for basic configuration
    read -p "Database name [wk2026]: " DB_NAME
    DB_NAME=${DB_NAME:-wk2026}
    
    read -p "Database user [postgres]: " DB_USER
    DB_USER=${DB_USER:-postgres}
    
    read -sp "Database password: " DB_PASSWORD
    echo ""
    
    read -p "JWT Secret (press Enter to generate random): " JWT_SECRET
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-this-secret-key-$(date +%s)")
    fi
    
    # Update .env file
    sed -i.bak "s/DATABASE_NAME=wk2026/DATABASE_NAME=$DB_NAME/" .env
    sed -i.bak "s/DATABASE_USER=postgres/DATABASE_USER=$DB_USER/" .env
    sed -i.bak "s/DATABASE_PASSWORD=postgres/DATABASE_PASSWORD=$DB_PASSWORD/" .env
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    rm .env.bak 2>/dev/null
    
    echo -e "${GREEN}✓ Basic configuration saved to .env${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo ""
echo "========================================="
echo "  Installing dependencies               "
echo "========================================="

# Install root dependencies (if package.json exists)
if [ -f "package.json" ]; then
    echo "Installing root dependencies..."
    npm install
    echo -e "${GREEN}✓ Root dependencies installed${NC}"
fi

# Install client dependencies
if [ -d "client" ]; then
    echo ""
    echo "Installing client dependencies..."
    cd client
    if [ ! -f "package.json" ]; then
        echo "Initializing React client..."
        npm create vite@latest . -- --template react-ts
    fi
    npm install
    cd ..
    echo -e "${GREEN}✓ Client dependencies installed${NC}"
fi

# Install server dependencies
if [ -d "server" ]; then
    echo ""
    echo "Installing server dependencies..."
    cd server
    if [ ! -f "package.json" ]; then
        echo "Initializing Express server..."
        npm init -y
        npm install express cors dotenv pg sequelize bcrypt jsonwebtoken express-validator
        npm install -D typescript @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken ts-node nodemon
    else
        npm install
    fi
    cd ..
    echo -e "${GREEN}✓ Server dependencies installed${NC}"
fi

echo ""
echo "========================================="
echo "  Database setup                        "
echo "========================================="

# Source .env file
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "Checking PostgreSQL connection..."
if command -v psql &> /dev/null; then
    # Try to create database
    PGPASSWORD=$DATABASE_PASSWORD psql -h $DATABASE_HOST -U $DATABASE_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DATABASE_NAME'" | grep -q 1 || \
    PGPASSWORD=$DATABASE_PASSWORD psql -h $DATABASE_HOST -U $DATABASE_USER -c "CREATE DATABASE $DATABASE_NAME" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database '$DATABASE_NAME' is ready${NC}"
    else
        echo -e "${YELLOW}⚠ Could not create database automatically${NC}"
        echo "Please create it manually: CREATE DATABASE $DATABASE_NAME;"
    fi
else
    echo -e "${YELLOW}⚠ Skipping database setup (PostgreSQL not in PATH)${NC}"
fi

echo ""
echo "========================================="
echo "  Setup complete!                       "
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Review and update .env file with your API keys"
echo "  2. Start the development servers:"
echo ""
echo "     Terminal 1 (Backend):"
echo "     $ cd server && npm run dev"
echo ""
echo "     Terminal 2 (Frontend):"
echo "     $ cd client && npm run dev"
echo ""
echo "  3. Open http://localhost:3000 in your browser"
echo ""
echo "Documentation:"
echo "  - Full spec: app_spec.txt"
echo "  - Features: feature_list.json (255 test cases)"
echo "  - Database: docs/DATABASE.md (coming soon)"
echo ""
echo -e "${GREEN}Happy coding! 🎉⚽🏆${NC}"
echo ""
