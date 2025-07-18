#!/bin/bash

# OI vs AI Fresh Build - Deployment Script
# Deploy to oi-book.thefadil.site via Cloudflare Pages

echo "🧠 Starting fresh deployment for OI vs AI Book Platform..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Build info
BUILD_VERSION="v2.1-fresh"
BUILD_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DOMAIN="oi-book.thefadil.site"
REPO_NAME="oi-vs-ai-fresh"

echo -e "${BLUE}Fresh Build Information:${NC}"
echo -e "Version: ${BUILD_VERSION}"
echo -e "Timestamp: ${BUILD_TIMESTAMP}"
echo -e "Domain: ${DOMAIN}"
echo -e "Repository: ${REPO_NAME}"
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo -e "${RED}Error: index.html not found!${NC}"
    echo "Please run this script from the oi-vs-ai-fresh directory."
    exit 1
fi

# Step 1: Verify required files
echo -e "${YELLOW}Step 1: Verifying fresh build files...${NC}"
required_files=(
    "index.html"
    "raw-arabic.html"
    "raw-english.html"
    "_redirects"
    "_headers"
    "cloudflare-config.json"
    "README.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file exists${NC}"
    else
        echo -e "${RED}✗ $file missing!${NC}"
        exit 1
    fi
done

# Step 2: Initialize Git repository
echo -e "${YELLOW}Step 2: Initializing Git repository...${NC}"
if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✓ Git repository initialized${NC}"
else
    echo -e "${GREEN}✓ Git repository already exists${NC}"
fi

# Step 3: Create .gitignore if needed
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*

# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.production

# Cache files
.cache/
dist/
build/

# Temporary files
*.tmp
*.temp
EOF
    echo -e "${GREEN}✓ .gitignore created${NC}"
fi

# Step 4: Stage all files
echo -e "${YELLOW}Step 3: Staging files for commit...${NC}"
git add .
echo -e "${GREEN}✓ All files staged${NC}"

# Step 5: Create initial commit
echo -e "${YELLOW}Step 4: Creating initial commit...${NC}"
git commit -m "🚀 Fresh OI vs AI bilingual ebook platform - ${BUILD_VERSION}

✨ Features:
- Bilingual Arabic/English platform with instant switching
- Pricing: 130 SAR (43% discount from 230 SAR)
- Author: Dr. Mohammed Al-Fadil, Founder of BrainSAIT
- Modern dark theme with glass morphism effects
- Integrated payment system (Stripe, PayPal, Apple Pay)
- Mobile-optimized responsive design
- Token-based security and content protection
- SEO optimized with proper meta tags

🎯 Technical:
- Single-file application architecture
- Production-ready performance optimization
- Comprehensive security headers
- Cache-busting for immediate updates
- Cloudflare Pages deployment ready

🎉 Fresh Build Benefits:
- No caching issues
- Immediate deployment
- Clean codebase
- Enhanced performance
- Better security

Build: ${BUILD_VERSION}
Timestamp: ${BUILD_TIMESTAMP}
Domain: ${DOMAIN}"

echo -e "${GREEN}✓ Initial commit created${NC}"

# Step 6: Show next steps
echo -e "\n${GREEN}🎉 Fresh build preparation complete!${NC}"
echo -e "\n${YELLOW}Next steps to deploy:${NC}"
echo ""
echo -e "1. ${BLUE}Create GitHub Repository:${NC}"
echo "   - Go to https://github.com/new"
echo "   - Repository name: ${REPO_NAME}"
echo "   - Make it public"
echo "   - Do not initialize with README (we already have one)"
echo ""
echo -e "2. ${BLUE}Push to GitHub:${NC}"
echo "   git remote add origin git@github.com:Fadil369/${REPO_NAME}.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo -e "3. ${BLUE}Configure Cloudflare Pages:${NC}"
echo "   - Go to https://dash.cloudflare.com/pages"
echo "   - Click 'Create a project'"
echo "   - Connect to Git → Select ${REPO_NAME}"
echo "   - Build settings:"
echo "     * Build command: (leave empty)"
echo "     * Build output directory: /"
echo "     * Root directory: (leave empty)"
echo ""
echo -e "4. ${BLUE}Set Environment Variables:${NC}"
echo "   NODE_VERSION=18"
echo "   PRODUCTION=true"
echo "   FRESH_BUILD=${BUILD_VERSION}"
echo "   BUILD_TIMESTAMP=${BUILD_TIMESTAMP}"
echo ""
echo -e "5. ${BLUE}Configure Custom Domain:${NC}"
echo "   - In Pages project settings → Custom domains"
echo "   - Add custom domain: ${DOMAIN}"
echo "   - Cloudflare will handle SSL automatically"
echo ""
echo -e "6. ${BLUE}DNS Configuration:${NC}"
echo "   - In Cloudflare DNS settings"
echo "   - Add CNAME record:"
echo "     Name: oi-book"
echo "     Target: ${REPO_NAME}.pages.dev"
echo "     Proxy: ON (orange cloud)"
echo ""
echo -e "${GREEN}🚀 Ready for fresh deployment without cache issues!${NC}"
echo ""
echo -e "${YELLOW}Production Features to Test:${NC}"
echo "✅ Arabic/English language switching"
echo "✅ 130 SAR pricing (43% discount)"
echo "✅ Dr. Mohammed Al-Fadil author section"
echo "✅ Modern dark theme with glass morphism"
echo "✅ BrainSAIT branding"
echo "✅ Payment integration (all methods)"
echo "✅ Mobile responsive design"
echo "✅ Security and content protection"
echo ""
echo -e "${BLUE}Support: support@brainsait.com${NC}"