# OI vs AI - Book Website

This repository contains the complete book "OI vs AI: Original Intelligence and the Rise of the Machine Mind" by Dr. Mohamed El Fadil, along with its landing page and payment system.

## 🚀 Deployment to Cloudflare Pages

### Prerequisites
- A Cloudflare account
- Git installed on your computer
- This repository pushed to GitHub/GitLab

### Deployment Steps

1. **Push to GitHub/GitLab:**
   ```bash
   git add .
   git commit -m "Initial book website commit"
   git push origin main
   ```

2. **Connect to Cloudflare Pages:**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com)
   - Click "Create a project"
   - Connect your GitHub/GitLab account
   - Select this repository
   - Configure build settings:
     - Build command: (leave empty)
     - Build output directory: `/`
     - Root directory: `/`

3. **Deploy:**
   - Click "Save and Deploy"
   - Wait for deployment to complete
   - Your site will be available at `https://[your-project].pages.dev`

4. **Custom Domain (Optional):**
   - Go to your project settings
   - Add custom domain
   - Update DNS records as instructed

## 📁 File Structure

```
/
├── index.html                          # Landing page with payment
├── oi-vs-ai-complete-unified-book.html # Complete book (access controlled)
├── book-access.js                      # Access control script
├── _redirects                          # Cloudflare Pages redirects
├── package.json                        # Project metadata
└── README.md                          # This file
```

## 🔒 Security Features

- **Access Control:** Book is only accessible after payment
- **No Download:** Download functionality is disabled
- **No Print:** Print functionality is disabled
- **No Copy:** Text selection and copying is disabled
- **Session-Based:** Access expires after 24 hours
- **Watermarked:** Licensed copy indicator

## 💳 Payment Integration

The landing page includes support for Saudi payment methods:
- Mada
- Visa/Mastercard
- STC Pay
- Apple Pay
- Tamara

**Note:** You'll need to integrate with a real payment gateway (like Moyasar, PayTabs, or Checkout.com) for production use.

## 🔧 Local Development

To run locally:
```bash
npm install
npm start
```

Then visit `http://localhost:8080`

## 📱 Features

- Fully responsive design
- Beautiful gradient animations
- Smooth scrolling
- Interactive payment selection
- Countdown timer for offers
- Author section with social links
- Book preview with excerpts
- Benefits section
- SEO optimized

## 🎨 Customization

### Changing Prices
Edit the price values in `index.html`:
- Original price: Line ~896
- Offer price: Line ~897
- Payment button: Line ~1151

### Changing Colors
Main color variables are in the CSS `:root` section:
- `--primary`: Main purple color
- `--secondary`: Secondary purple
- `--accent`: Blue accent color

### Adding Payment Gateway
Replace the `processPayment()` function in `index.html` with your actual payment gateway integration.

## 📄 License

© 2025 Dr. Mohamed El Fadil. All rights reserved.

This book and website are proprietary content. Unauthorized reproduction or distribution is prohibited.

## 🤝 Support

For technical support or questions about the book, please contact:
- Website: https://thefadil.site
- LinkedIn: https://linkedin.com/in/fadil369
- GitHub: https://github.com/fadil369

---

**BrainSAIT** - Where Original Intelligence Meets Innovation