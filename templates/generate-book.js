#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class BookGenerator {
    constructor() {
        this.config = {};
        this.templates = {
            book: '',
            landing: ''
        };
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }

    loadTemplates() {
        try {
            this.templates.book = fs.readFileSync(path.join(__dirname, 'book-template.html'), 'utf8');
            this.templates.landing = fs.readFileSync(path.join(__dirname, 'landing-template.html'), 'utf8');
            console.log('✅ Templates loaded successfully');
        } catch (error) {
            console.error('❌ Error loading templates:', error.message);
            process.exit(1);
        }
    }

    loadConfig(configPath) {
        try {
            const configFile = configPath || path.join(__dirname, 'config.json');
            this.config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
            console.log('✅ Configuration loaded successfully');
        } catch (error) {
            console.error('❌ Error loading config:', error.message);
            console.log('Using interactive mode...');
        }
    }

    async interactiveConfig() {
        console.log('\n🚀 Welcome to the Elegant Book Generator!');
        console.log('Let\\'s create your digital book step by step.\n');

        // Book Information
        console.log('📚 BOOK INFORMATION');
        this.config.book = {
            title: await this.question('Book title: '),
            subtitle: await this.question('Book subtitle: '),
            description: await this.question('Book description: '),
            icon: await this.question('Book icon (emoji): ') || '📚',
            filename: await this.question('Book filename (without .html): ') + '.html'
        };

        // Author Information
        console.log('\n👤 AUTHOR INFORMATION');
        this.config.author = {
            name: await this.question('Author name: '),
            title: await this.question('Author professional title: '),
            credentials: await this.question('Author credentials: '),
            avatar: await this.question('Author avatar (emoji): ') || '👤',
            bio: await this.question('Author bio (brief): '),
            description: await this.question('Author description (detailed): ')
        };

        // Branding
        console.log('\n🎨 BRANDING');
        this.config.branding = {
            companyName: await this.question('Company/Organization name: '),
            brandName: await this.question('Brand name: ') || this.config.book.title,
            colors: {
                primary: await this.question('Primary color (hex): ') || '#00d4ff',
                secondary: await this.question('Secondary color (hex): ') || '#7c3aed',
                accent: await this.question('Accent color (hex): ') || '#fbbf24'
            }
        };

        // Pricing
        console.log('\n💰 PRICING');
        this.config.pricing = {
            originalPrice: await this.question('Original price: '),
            currentPrice: await this.question('Current price: '),
            currency: await this.question('Currency: ') || 'USD',
            amount: await this.question('Price amount (numbers only): '),
            savings: await this.question('Savings text: ') || 'Limited time offer!'
        };

        // Meta Information
        console.log('\n🔍 SEO & META');
        this.config.meta = {
            description: await this.question('Meta description: ') || this.config.book.description,
            keywords: await this.question('Keywords (comma separated): '),
            url: await this.question('Book URL: '),
            faviconEmoji: this.config.book.icon
        };

        // Set defaults
        this.setDefaults();
    }

    setDefaults() {
        // Publication defaults
        this.config.publication = this.config.publication || {
            date: new Date().getFullYear().toString(),
            pages: '100+',
            publisher: this.config.branding.companyName || 'Independent',
            year: new Date().getFullYear().toString()
        };

        // Content defaults
        this.config.content = this.config.content || {
            hero: {
                title: `Discover ${this.config.book.title}`,
                subtitle: this.config.book.subtitle,
                ctaText: 'Get Instant Access',
                disclaimer: 'Digital book with instant access'
            },
            features: {
                title: 'What You\\'ll Discover',
                subtitle: 'A comprehensive exploration of the topic',
                cards: [
                    {
                        icon: '📖',
                        title: 'Comprehensive Content',
                        description: 'Deep dive into the subject matter with expert insights and practical applications.'
                    },
                    {
                        icon: '💡',
                        title: 'Actionable Insights',
                        description: 'Practical knowledge you can apply immediately to your work and life.'
                    },
                    {
                        icon: '🎯',
                        title: 'Expert Guidance',
                        description: 'Learn from experienced professionals and industry leaders.'
                    }
                ]
            }
        };

        // Messages defaults
        this.config.messages = this.config.messages || {
            successMessage: '✅ Payment successful! Redirecting to your book...',
            paymentDisclaimer: 'Secure payment • Instant access • No recurring charges',
            footerDisclaimer: 'All rights reserved.'
        };
    }

    replaceTemplate(template, replacements) {
        let result = template;
        
        for (const [key, value] of Object.entries(replacements)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, value || '');
        }
        
        return result;
    }

    generateFeatureCards() {
        if (!this.config.content.features.cards) return '';
        
        return this.config.content.features.cards.map(card => `
            <div class="feature-card">
                <div class="feature-icon">${card.icon}</div>
                <h3>${card.title}</h3>
                <p>${card.description}</p>
            </div>
        `).join('');
    }

    generateBenefitsList() {
        if (!this.config.content.benefits || !this.config.content.benefits.list) {
            return `
                <div class="benefit-item">
                    <div class="benefit-icon">📚</div>
                    <div class="benefit-text">
                        <h4>Comprehensive Learning</h4>
                        <p>Gain deep insights into the subject matter</p>
                    </div>
                </div>
            `;
        }
        
        return this.config.content.benefits.list.map(benefit => `
            <div class="benefit-item">
                <div class="benefit-icon">${benefit.icon}</div>
                <div class="benefit-text">
                    <h4>${benefit.title}</h4>
                    <p>${benefit.description}</p>
                </div>
            </div>
        `).join('');
    }

    generateAuthorLinks() {
        if (!this.config.author.links) return '';
        
        return this.config.author.links.map(link => 
            `<a href="${link.url}">${link.text}</a>`
        ).join('\\n                ');
    }

    generateTableOfContents() {
        // This would be customized based on actual book content
        return `
            <div class="toc-item part-divider">
                <span class="title"><strong>PART I: Introduction</strong></span>
                <span class="page">1</span>
            </div>
            <div class="toc-item">
                <span class="title">Chapter 1: Getting Started</span>
                <span class="dots">..............................</span>
                <span class="page">3</span>
            </div>
            <!-- Add more chapters as needed -->
        `;
    }

    generateBookContent() {
        // This would include the actual book chapters
        return `
            <!-- Part I -->
            <div class="part-divider page-break">
                <h2>PART I</h2>
                <div class="part-title">Introduction</div>
            </div>
            
            <!-- Chapter 1 -->
            <div class="chapter page-break">
                <div class="chapter-header">
                    <div class="chapter-number">CHAPTER 1</div>
                    <h1 class="chapter-title">Getting Started</h1>
                </div>
                
                <div class="quote">
                    "Every journey begins with a single step." — Unknown
                </div>
                
                <h3>Introduction</h3>
                <p>Welcome to your book content. This is where your chapters will go.</p>
                
                <div class="summary-box">
                    <h4>Chapter Summary</h4>
                    <p>This chapter introduced the main concepts that will be explored throughout the book.</p>
                </div>
            </div>
        `;
    }

    generateLandingPage() {
        const replacements = {
            // Book info
            BOOK_TITLE: this.config.book.title,
            BOOK_SUBTITLE: this.config.book.subtitle,
            BOOK_ICON: this.config.book.icon,
            BOOK_FILENAME: this.config.book.filename,
            
            // Author info
            AUTHOR_NAME: this.config.author.name,
            AUTHOR_FIRST_NAME: this.config.author.name.split(' ')[0],
            AUTHOR_TITLE: this.config.author.title,
            AUTHOR_CREDENTIALS: this.config.author.credentials,
            AUTHOR_AVATAR: this.config.author.avatar,
            AUTHOR_DESCRIPTION: this.config.author.description,
            
            // Branding
            BRAND_NAME: this.config.branding.brandName,
            COMPANY_NAME: this.config.branding.companyName,
            PRIMARY_COLOR: this.config.branding.colors.primary,
            SECONDARY_COLOR: this.config.branding.colors.secondary,
            ACCENT_COLOR: this.config.branding.colors.accent,
            
            // Pricing
            ORIGINAL_PRICE: this.config.pricing.originalPrice,
            CURRENT_PRICE: this.config.pricing.currentPrice,
            PRICE_CURRENCY: this.config.pricing.currency,
            PRICE_AMOUNT: this.config.pricing.amount,
            SAVINGS_TEXT: this.config.pricing.savings,
            
            // Meta
            META_DESCRIPTION: this.config.meta.description,
            META_KEYWORDS: this.config.meta.keywords,
            OG_DESCRIPTION: this.config.meta.description,
            BOOK_URL: this.config.meta.url,
            FAVICON_EMOJI: this.config.meta.faviconEmoji,
            
            // Content
            HERO_TITLE: this.config.content.hero.title,
            HERO_SUBTITLE: this.config.content.hero.subtitle,
            CTA_TEXT: this.config.content.hero.ctaText,
            HERO_DISCLAIMER: this.config.content.hero.disclaimer,
            
            FEATURES_TITLE: this.config.content.features.title,
            FEATURES_SUBTITLE: this.config.content.features.subtitle,
            FEATURES_CARDS: this.generateFeatureCards(),
            
            BENEFITS_TITLE: this.config.content.benefits?.title || 'Why This Book',
            BENEFITS_SUBTITLE: this.config.content.benefits?.subtitle || 'Transform your understanding',
            BENEFITS_LIST: this.generateBenefitsList(),
            
            PRICING_TITLE: 'Get Your Copy Today',
            PRICING_SUBTITLE: 'Instant digital access',
            PRICING_NOTE: this.config.pricing.note || 'Digital download',
            PRICING_FEATURES: '<li>Instant digital access</li><li>Mobile-responsive design</li><li>Lifetime access</li>',
            
            PAYMENT_BUTTON_TEXT: `Get Access - ${this.config.pricing.currentPrice}`,
            PAYMENT_METHODS: '<div class="payment-method">💳 Card</div><div class="payment-method">💰 PayPal</div>',
            
            // Messages
            SUCCESS_MESSAGE: this.config.messages.successMessage,
            PAYMENT_DISCLAIMER: this.config.messages.paymentDisclaimer,
            FOOTER_DISCLAIMER: this.config.messages.footerDisclaimer,
            
            // Publication
            YEAR: this.config.publication.year,
            
            // Footer
            FOOTER_LINKS: '<a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="#contact">Contact</a>'
        };

        return this.replaceTemplate(this.templates.landing, replacements);
    }

    generateBookPage() {
        const replacements = {
            // Book info
            BOOK_TITLE: this.config.book.title,
            BOOK_SUBTITLE: this.config.book.subtitle,
            BOOK_DESCRIPTION: this.config.book.description,
            BOOK_ICON: this.config.book.icon,
            
            // Author info
            AUTHOR_NAME: this.config.author.name,
            AUTHOR_FIRST_NAME: this.config.author.name.split(' ')[0],
            AUTHOR_TITLE: this.config.author.title,
            AUTHOR_BIO: this.config.author.bio,
            AUTHOR_LINKS: this.generateAuthorLinks(),
            
            // Branding
            COMPANY_NAME: this.config.branding.companyName,
            PRIMARY_COLOR: this.config.branding.colors.primary,
            SECONDARY_COLOR: this.config.branding.colors.secondary,
            ACCENT_COLOR: this.config.branding.colors.accent,
            
            // Publication
            PUBLICATION_DATE: this.config.publication.date,
            PAGE_COUNT: this.config.publication.pages,
            PUBLISHER: this.config.publication.publisher,
            YEAR: this.config.publication.year,
            
            // Content
            TABLE_OF_CONTENTS: this.generateTableOfContents(),
            BOOK_CONTENT: this.generateBookContent()
        };

        return this.replaceTemplate(this.templates.book, replacements);
    }

    async generate() {
        console.log('\\n🎨 Generating your book...');
        
        // Generate landing page
        const landingPage = this.generateLandingPage();
        fs.writeFileSync('index.html', landingPage);
        console.log('✅ Landing page generated: index.html');
        
        // Generate book page
        const bookPage = this.generateBookPage();
        fs.writeFileSync(this.config.book.filename, bookPage);
        console.log(`✅ Book page generated: ${this.config.book.filename}`);
        
        // Copy access control script
        try {
            const accessScript = fs.readFileSync(path.join(__dirname, '../book-access.js'), 'utf8');
            fs.writeFileSync('book-access.js', accessScript);
            console.log('✅ Access control script copied');
        } catch (error) {
            console.log('⚠️  Access control script not found, you may need to create it manually');
        }
        
        // Save configuration for future use
        fs.writeFileSync('book-config.json', JSON.stringify(this.config, null, 2));
        console.log('✅ Configuration saved: book-config.json');
        
        console.log('\\n🎉 Book generation complete!');
        console.log(`\\n📁 Files created:
   - index.html (Landing page)
   - ${this.config.book.filename} (Book)
   - book-access.js (Access control)
   - book-config.json (Configuration)
        `);
        
        console.log(`\\n🚀 Next steps:
   1. Customize the book content in ${this.config.book.filename}
   2. Set up payment processing in index.html
   3. Deploy to your web server
   4. Test the complete flow
        `);
    }

    async run() {
        const args = process.argv.slice(2);
        const configPath = args.includes('--config') ? args[args.indexOf('--config') + 1] : null;
        
        this.loadTemplates();
        this.loadConfig(configPath);
        
        if (!this.config.book) {
            await this.interactiveConfig();
        } else {
            this.setDefaults();
        }
        
        await this.generate();
        this.rl.close();
    }
}

// Run the generator
if (require.main === module) {
    const generator = new BookGenerator();
    generator.run().catch(console.error);
}

module.exports = BookGenerator;