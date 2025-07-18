# OI vs AI Book Platform

A bilingual (Arabic/English) ebook platform for "Original Intelligence vs Artificial Intelligence" by Dr. Mohammed Al-Fadil.

## User Flow

1. **Landing Page** (`index.html`)
   - Book introduction
   - Author information
   - Pricing details
   - Payment options

2. **Payment Process**
   - Select payment method (Credit Card, Apple Pay, PayPal)
   - Complete purchase (Demo mode - free for testing)
   - Receive access token

3. **Book Access** (`book.html`)
   - Automatic redirect after successful payment
   - Token-based access control
   - Full book content in both languages
   - Reading controls and navigation

## File Structure

```
/
├── index.html          # Landing page with payment flow
├── book.html           # Protected book reader page
├── raw-arabic.html     # Arabic book content
├── raw-english.html    # English book content
├── book-access-control.js   # Access control logic
├── payment-integration.js   # Payment processing
├── _headers           # Security headers
├── _redirects         # URL routing rules
└── archive/           # Old versions and unused files
```

## Access Control

The platform uses token-based authentication:
- Tokens are generated after successful payment
- Stored in both sessionStorage and localStorage
- 30-day expiry (extended in demo mode)
- Book page checks token validity on load

## Demo Mode Features

- Free payment processing for testing
- Extended token expiry
- Test payment methods available
- Banner indicating demo mode

## URLs

- Landing: https://read.thefadil.site/
- Book: https://read.thefadil.site/book.html
- Alternative routes: /reader, /read → redirect to book.html

## Security

- Content protection (no right-click, no text selection)
- Print protection
- Token-based access control
- Direct book URL access blocked without valid token