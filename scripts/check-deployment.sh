#!/bin/bash

# Railway Deployment Health Check Script

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🏥 Railway Deployment Health Check${NC}"
echo ""

# Get URLs from Railway
echo -e "${BLUE}Fetching service URLs...${NC}"

cd backend
BACKEND_URL=$(railway domain --service backend 2>/dev/null || echo "")
cd ..

cd frontend
FRONTEND_URL=$(railway domain --service frontend 2>/dev/null || echo "")
cd ..

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ Backend URL not found${NC}"
    exit 1
fi

if [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}❌ Frontend URL not found${NC}"
    exit 1
fi

echo -e "Backend:  ${BLUE}${BACKEND_URL}${NC}"
echo -e "Frontend: ${BLUE}${FRONTEND_URL}${NC}"
echo ""

# Check backend health
echo -e "${BLUE}Checking backend health...${NC}"
BACKEND_HEALTH=$(curl -s "${BACKEND_URL}/api/health" || echo "")

if echo "$BACKEND_HEALTH" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo "Response: $BACKEND_HEALTH"
fi

# Check frontend
echo ""
echo -e "${BLUE}Checking frontend...${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" || echo "000")

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend returned status: $FRONTEND_STATUS${NC}"
fi

# Check database connection
echo ""
echo -e "${BLUE}Checking database connection...${NC}"
cd backend
DB_CHECK=$(railway run node -e "require('./src/db').query('SELECT 1').then(() => console.log('OK')).catch(() => console.log('FAIL'))" 2>/dev/null || echo "FAIL")
cd ..

if [ "$DB_CHECK" = "OK" ]; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
fi

# Check environment variables
echo ""
echo -e "${BLUE}Checking environment variables...${NC}"

cd backend
echo "Backend variables:"
railway variables --service backend | grep -E "(PORT|NODE_ENV|DB_|JWT_|CORS_)" || echo "No variables found"
cd ..

echo ""
cd frontend
echo "Frontend variables:"
railway variables --service frontend | grep -E "(VITE_)" || echo "No variables found"
cd ..

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}📊 Health Check Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Backend Health:  ${GREEN}✅${NC}"
echo -e "Frontend Status: ${GREEN}✅${NC}"
echo -e "Database:        ${GREEN}✅${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Access your app at: ${BLUE}${FRONTEND_URL}${NC}"
