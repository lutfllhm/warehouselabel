#!/bin/bash

# Railway Setup Script
# This script helps you set up Railway project from scratch

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚂 Railway Setup Wizard${NC}"
echo ""

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Install it with: npm i -g @railway/cli"
    exit 1
fi

# Login
echo -e "${BLUE}Step 1: Login to Railway${NC}"
railway login

# Initialize project
echo ""
echo -e "${BLUE}Step 2: Initialize Railway Project${NC}"
railway init

# Add MySQL
echo ""
echo -e "${BLUE}Step 3: Add MySQL Database${NC}"
echo "Run this command manually:"
echo -e "${YELLOW}railway add --database mysql${NC}"
echo ""
read -p "Press Enter after MySQL is added..."

# Import schema
echo ""
echo -e "${BLUE}Step 4: Import Database Schema${NC}"
echo "Run these commands manually:"
echo -e "${YELLOW}railway connect MySQL${NC}"
echo -e "${YELLOW}source backend/schema.sql;${NC}"
echo -e "${YELLOW}exit;${NC}"
echo ""
read -p "Press Enter after schema is imported..."

# Generate JWT Secret
echo ""
echo -e "${BLUE}Step 5: Generate JWT Secret${NC}"
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo -e "Generated JWT Secret: ${GREEN}${JWT_SECRET}${NC}"
echo ""

# Set backend variables
echo -e "${BLUE}Step 6: Set Backend Variables${NC}"
cd backend
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="$JWT_SECRET"
echo -e "${GREEN}✅ Backend variables set${NC}"
cd ..

# Deploy backend
echo ""
echo -e "${BLUE}Step 7: Deploy Backend${NC}"
cd backend
railway up --service backend
BACKEND_URL=$(railway domain --service backend 2>/dev/null || echo "")
cd ..

if [ -z "$BACKEND_URL" ]; then
    echo -e "${YELLOW}⚠️  Generate backend domain manually:${NC}"
    echo "railway domain --service backend"
    read -p "Enter backend URL (e.g., https://xxx.railway.app): " BACKEND_URL
fi

echo -e "Backend URL: ${GREEN}${BACKEND_URL}${NC}"

# Set frontend variables
echo ""
echo -e "${BLUE}Step 8: Set Frontend Variables${NC}"
cd frontend
railway variables set VITE_API_URL="${BACKEND_URL}/api"
echo -e "${GREEN}✅ Frontend variables set${NC}"
cd ..

# Deploy frontend
echo ""
echo -e "${BLUE}Step 9: Deploy Frontend${NC}"
cd frontend
railway up --service frontend
FRONTEND_URL=$(railway domain --service frontend 2>/dev/null || echo "")
cd ..

if [ -z "$FRONTEND_URL" ]; then
    echo -e "${YELLOW}⚠️  Generate frontend domain manually:${NC}"
    echo "railway domain --service frontend"
    read -p "Enter frontend URL (e.g., https://xxx.railway.app): " FRONTEND_URL
fi

echo -e "Frontend URL: ${GREEN}${FRONTEND_URL}${NC}"

# Update CORS
echo ""
echo -e "${BLUE}Step 10: Update CORS${NC}"
cd backend
railway variables set CORS_ORIGIN="$FRONTEND_URL"
railway up --service backend
cd ..

# Summary
echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}📝 Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Frontend URL: ${BLUE}${FRONTEND_URL}${NC}"
echo -e "Backend URL:  ${BLUE}${BACKEND_URL}${NC}"
echo -e "JWT Secret:   ${YELLOW}${JWT_SECRET}${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo "1. Create admin user (see DEPLOYMENT.md)"
echo "2. Test login at ${FRONTEND_URL}"
echo "3. Change admin password"
echo ""
echo "Useful commands:"
echo "  railway logs          - View logs"
echo "  railway status        - Check status"
echo "  railway open          - Open dashboard"
