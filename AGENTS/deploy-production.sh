#!/bin/bash

# OI vs AI Book - Production Deployment Script
# Deploy to oi.thefadil.site via Cloudflare Pages

echo "🚀 Starting production deployment for OI vs AI Book..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "oi-vs-ai-production.html" ]; then
    echo -e "${RED}Error: oi-vs-ai-production.html not found!${NC}"
    echo "Please run this script from the AGENTS directory."
    exit 1
fi

# Step 1: Clean up unnecessary files
echo -e "${YELLOW}Step 1: Cleaning up temporary files...${NC}"
rm -f raw-arabic-broken.html raw-arabic-fixed.html raw-arabic-backup.html fixed-arabic.html
rm -f enhanced-landing-page.html arabic-ebook.html arabic-ebook-enhanced.html
rm -f SUBMODULE_FIX.txt FORCE_DEPLOY.txt
echo -e "${GREEN}✓ Cleanup complete${NC}"

# Step 2: Verify required files
echo -e "${YELLOW}Step 2: Verifying required files...${NC}"
required_files=(
    "oi-vs-ai-production.html"
    "raw-arabic.html"
    "raw-english.html"
    "_redirects"
    "cloudflare-pages-config.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file exists${NC}"
    else
        echo -e "${RED}✗ $file missing!${NC}"
        exit 1
    fi
done

# Step 3: Update git
echo -e "${YELLOW}Step 3: Committing changes...${NC}"
git add .
git commit -m "🚀 Production deployment: Unified OI vs AI bilingual ebook platform

- Consolidated all components into oi-vs-ai-production.html
- Integrated payment system (Stripe, PayPal, Apple Pay)
- Bilingual support (Arabic/English) with instant switching
- Enhanced security and access control
- Mobile-optimized responsive design
- Configured for oi.thefadil.site deployment"

# Step 4: Push to GitHub
echo -e "${YELLOW}Step 4: Pushing to GitHub...${NC}"
git push origin main

# Step 5: Trigger Cloudflare Pages deployment
echo -e "${YELLOW}Step 5: Triggering Cloudflare Pages deployment...${NC}"
if [ -f "DEPLOY_HOOK.txt" ]; then
    echo "Deploy hook found. You can manually trigger deployment if needed."
    echo "Visit: https://dash.cloudflare.com/pages"
else
    echo "No deploy hook found. Cloudflare Pages will auto-deploy from GitHub push."
fi

# Step 6: Create deployment summary
echo -e "${YELLOW}Step 6: Creating deployment summary...${NC}"
cat > DEPLOYMENT_SUMMARY.md << EOF
# 🚀 OI vs AI Book - Production Deployment Summary

**Date:** $(date)
**Domain:** https://oi.thefadil.site
**Repository:** git@github.com:Fadil369/oi-vs-ai-book.git

## Deployed Files
- Main Application: \`oi-vs-ai-production.html\`
- Arabic Content: \`raw-arabic.html\`
- English Content: \`raw-english.html\`
- Routing: \`_redirects\`
- Configuration: \`cloudflare-pages-config.json\`

## Features
✅ Bilingual ebook platform (Arabic/English)
✅ Integrated payment system (130 SAR / $35 USD)
✅ Secure access control (30-day tokens)
✅ Mobile-optimized responsive design
✅ Content protection (no copy/print/download)
✅ Professional dark theme with glass morphism
✅ SEO optimized with meta tags

## Post-Deployment Checklist
- [ ] Verify site loads at https://oi.thefadil.site
- [ ] Test language switching (Arabic ↔ English)
- [ ] Test payment flow (all methods)
- [ ] Verify book content loads correctly
- [ ] Check mobile responsiveness
- [ ] Test access control and token generation
- [ ] Verify SSL certificate is active

## Payment Configuration
Remember to update these in production:
- Stripe public key in \`oi-vs-ai-production.html\`
- PayPal client ID in \`oi-vs-ai-production.html\`
- Apple Pay merchant ID configuration

## Support
For issues or updates, contact: support@brainsait.com
EOF

echo -e "${GREEN}✓ Deployment summary created${NC}"

# Final status
echo -e "\n${GREEN}🎉 Production deployment complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Wait 2-3 minutes for Cloudflare Pages to build"
echo "2. Visit https://oi.thefadil.site to verify deployment"
echo "3. Test all features according to the checklist"
echo -e "\n${GREEN}Happy reading! 📚${NC}"