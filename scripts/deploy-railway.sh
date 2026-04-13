#!/bin/bash

# Railway Deployment Script
# Usage: ./scripts/deploy-railway.sh [backend|frontend|all]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Railway Deployment Script${NC}"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Install it with: npm i -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Railway${NC}"
    echo "Logging in..."
    railway login
fi

deploy_backend() {
    echo -e "${GREEN}📦 Deploying Backend...${NC}"
    cd backend
    
    # Check if variables are set
    echo "Checking environment variables..."
    railway variables --service backend || echo "No variables set yet"
    
    # Deploy
    railway up --service backend
    
    echo -e "${GREEN}✅ Backend deployed${NC}"
    cd ..
}

deploy_frontend() {
    echo -e "${GREEN}🎨 Deploying Frontend...${NC}"
    cd frontend
    
    # Install serve if not exists
    if ! grep -q '"serve"' package.json; then
        echo "Adding serve package..."
        npm install --save-dev serve
    fi
    
    # Check if variables are set
    echo "Checking environment variables..."
    railway variables --service frontend || echo "No variables set yet"
    
    # Deploy
    railway up --service frontend
    
    echo -e "${GREEN}✅ Frontend deployed${NC}"
    cd ..
}

case "$1" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all|"")
        deploy_backend
        echo ""
        deploy_frontend
        ;;
    *)
        echo -e "${RED}❌ Invalid argument: $1${NC}"
        echo "Usage: $0 [backend|frontend|all]"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Check deployment status: railway status"
echo "2. View logs: railway logs"
echo "3. Open dashboard: railway open"
