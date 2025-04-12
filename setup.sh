#!/bin/bash

# AgroBuizz Platform Setup Script
# This script helps set up the AgroBuizz platform for local development

# Colors for better readability
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo -e "${BLUE}┌───────────────────────────────────────┐${NC}"
echo -e "${BLUE}│       AgroBuizz Platform Setup        │${NC}"
echo -e "${BLUE}└───────────────────────────────────────┘${NC}"
echo

# Check if Node.js is installed
echo -e "${YELLOW}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js is not installed.${NC}"
  echo -e "Please install Node.js (v18+) from https://nodejs.org/ and try again."
  exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js is installed:${NC} $NODE_VERSION"

# Check if npm is installed
echo -e "${YELLOW}Checking npm installation...${NC}"
if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm is not installed.${NC}"
  echo -e "Please install npm (comes with Node.js) and try again."
  exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm is installed:${NC} $NPM_VERSION"

# Check for .env file
echo -e "${YELLOW}Checking environment configuration...${NC}"
if [ ! -f .env ]; then
  echo -e "${YELLOW}⚠️ No .env file found, creating from .env.example${NC}"
  
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file from template${NC}"
    echo -e "${YELLOW}⚠️ Please update the DATABASE_URL in .env with your PostgreSQL credentials${NC}"
  else
    echo -e "${RED}❌ No .env.example file found.${NC}"
    echo -e "Please create a .env file manually with the required environment variables."
    exit 1
  fi
else
  echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to install dependencies.${NC}"
  echo -e "Please check the error messages above and try again."
  exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"

# Database setup
echo -e "${YELLOW}Setting up the database...${NC}"
echo -e "${BLUE}The script will check your database connection and run migrations${NC}"

chmod +x setup-database.sh
./setup-database.sh

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Database setup failed.${NC}"
  echo -e "Please check the error messages above and ensure your PostgreSQL server is running."
  exit 1
fi

echo -e "${GREEN}✅ Database setup completed successfully!${NC}"

# Final setup complete message
echo
echo -e "${BLUE}┌───────────────────────────────────────┐${NC}"
echo -e "${BLUE}│       Setup Completed Successfully    │${NC}"
echo -e "${BLUE}└───────────────────────────────────────┘${NC}"
echo
echo -e "${GREEN}You can now start the application with:${NC}"
echo -e "  npm run dev"
echo
echo -e "${YELLOW}Application will be available at:${NC} http://localhost:5000"
echo
echo -e "${BLUE}Thank you for using AgroBuizz Platform!${NC}"