/**
 * Book Access Control System for OI vs AI
 * 
 * This script provides:
 * 1. Access validation for book content
 * 2. Security features to prevent unauthorized access
 * 3. Content protection (anti-copy, anti-print)
 * 4. Reading position tracking
 * 5. Language preference management
 * 6. Mobile-optimized behavior
 */

(function() {
  // Configuration
  const config = {
    // Book access settings
    access: {
      tokenName: 'bookAccess',
      localTokenName: 'bookAccessToken',
      redirectUrl: 'index.html',
      validDuration: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      checkIntervalMs: 60000 // Check token validity every minute
    },
    
    // Content protection settings
    protection: {
      disableRightClick: true,
      disableCopy: true,
      disablePrint: true,
      disableSelection: false, // Allow text selection for accessibility
      disableDragDrop: true,
      hideFromDevTools: true
    },
    
    // Reading position tracking
    tracking: {
      saveInterval: 10000, // Save position every 10 seconds
      positionKey: 'bookReadingPosition',
      chaptersRead: 'bookChaptersRead'
    },
    
    // Debug mode (set to false in production)
    debug: false
  };
  
  // State
  let state = {
    accessToken: null,
    tokenData: null,
    currentPosition: null,
    chaptersRead: [],
    languagePreference: document.documentElement.lang || 'en',
    isTokenValid: false,
    isInitialized: false
  };
  
  /**
   * Initialize the access control system
   */
  function initialize() {
    if (state.isInitialized) return;
    
    // Load tokens and validate access
    loadAndValidateToken();
    
    // Apply content protection
    applyContentProtection();
    
    // Setup position tracking
    initializePositionTracking();
    
    // Setup interval checks
    setupIntervalChecks();
    
    // Mark as initialized
    state.isInitialized = true;
    
    // Log initialization if in debug mode
    debugLog('Access control system initialized');
  }
  
  /**
   * Load and validate access token
   */
  function loadAndValidateToken() {
    // Try to get token from sessionStorage first (current session)
    let token = sessionStorage.getItem(config.access.tokenName);
    
    // If not found, try localStorage (returning user)
    if (!token) {
      token = localStorage.getItem(config.access.localTokenName);
      if (token) {
        // If found in localStorage, also set in sessionStorage for current session
        sessionStorage.setItem(config.access.tokenName, token);
      }
    }
    
    // If no token found in either storage, redirect to purchase page
    if (!token) {
      redirectToPurchase('no_token');
      return;
    }
    
    // Store the token
    state.accessToken = token;
    
    // Parse and validate token
    try {
      const tokenData = JSON.parse(atob(token));
      state.tokenData = tokenData;
      
      // Check token expiry
      if (tokenData.expiry && tokenData.expiry < Date.now()) {
        redirectToPurchase('token_expired');
        return;
      }
      
      // Validate payment information
      if (!tokenData.method || !tokenData.transactionId) {
        redirectToPurchase('invalid_payment_data');
        return;
      }
      
      // Validate currency and amount (basic check)
      if (tokenData.currency && tokenData.amount) {
        const validCurrencies = ['SAR', 'USD'];
        const validAmounts = { SAR: 130, USD: 35 };
        
        if (!validCurrencies.includes(tokenData.currency) || 
            tokenData.amount !== validAmounts[tokenData.currency]) {
          debugLog('Invalid payment amount or currency', tokenData);
          redirectToPurchase('invalid_payment_amount');
          return;
        }
      }
      
      // Set language preference from token if available
      if (tokenData.language) {
        state.languagePreference = tokenData.language;
      }
      
      // Token is valid
      state.isTokenValid = true;
      debugLog('Valid access token found', tokenData);
      
    } catch (error) {
      debugLog('Token parsing error', error);
      redirectToPurchase('invalid_token');
      return;
    }
  }
  
  /**
   * Apply content protection measures
   */
  function applyContentProtection() {
    const protection = config.protection;
    
    // Disable right-click context menu
    if (protection.disableRightClick) {
      document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
      });
    }
    
    // Disable copy
    if (protection.disableCopy) {
      document.addEventListener('copy', function(e) {
        e.preventDefault();
        return false;
      });
    }
    
    // Disable selection
    if (protection.disableSelection) {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.mozUserSelect = 'none';
      document.body.style.msUserSelect = 'none';
    }
    
    // Disable print
    if (protection.disablePrint) {
      window.addEventListener('beforeprint', function(e) {
        e.preventDefault();
        return false;
      });
      
      // Add print-specific CSS
      const style = document.createElement('style');
      style.textContent = `
        @media print {
          body { display: none !important; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Disable drag and drop
    if (protection.disableDragDrop) {
      document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
      });
    }
    
    // Hide content from dev tools
    if (protection.hideFromDevTools) {
      // This is a basic implementation - more sophisticated methods exist
      // but they're in a constant cat-and-mouse game with browser updates
      const devToolsDetection = function() {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        
        if (widthThreshold || heightThreshold) {
          document.body.innerHTML = '<div style="text-align:center;padding:50px;">Please close developer tools to view the book content.</div>';
        }
      };
      
      window.addEventListener('resize', devToolsDetection);
      setInterval(devToolsDetection, 1000);
    }
  }
  
  /**
   * Initialize reading position tracking
   */
  function initializePositionTracking() {
    // Load previously saved position
    const savedPosition = localStorage.getItem(config.tracking.positionKey);
    if (savedPosition) {
      try {
        state.currentPosition = JSON.parse(savedPosition);
        debugLog('Loaded reading position', state.currentPosition);
      } catch (error) {
        debugLog('Error parsing saved position', error);
      }
    }
    
    // Load chapters read
    const chaptersRead = localStorage.getItem(config.tracking.chaptersRead);
    if (chaptersRead) {
      try {
        state.chaptersRead = JSON.parse(chaptersRead);
        debugLog('Loaded chapters read', state.chaptersRead);
      } catch (error) {
        debugLog('Error parsing chapters read', error);
      }
    }
    
    // Set up scroll event to track position
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(saveCurrentPosition, 200);
    });
    
    // Set up interval save
    setInterval(saveCurrentPosition, config.tracking.saveInterval);
    
    // Track chapter navigation
    document.querySelectorAll('[id^="chapter-"]').forEach(chapter => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              markChapterAsRead(chapter.id);
            }
          });
        },
        { threshold: 0.3 } // Consider chapter viewed when 30% visible
      );
      
      observer.observe(chapter);
    });
    
    // Restore position if available
    if (state.currentPosition) {
      setTimeout(() => {
        try {
          window.scrollTo({
            top: state.currentPosition.scrollY,
            behavior: 'smooth'
          });
        } catch (error) {
          debugLog('Error restoring position', error);
        }
      }, 500);
    }
  }
  
  /**
   * Save current reading position
   */
  function saveCurrentPosition() {
    const position = {
      scrollY: window.scrollY,
      timestamp: Date.now()
    };
    
    // Find current chapter
    document.querySelectorAll('[id^="chapter-"]').forEach(chapter => {
      const rect = chapter.getBoundingClientRect();
      if (rect.top < window.innerHeight/2 && rect.bottom > window.innerHeight/2) {
        position.currentChapter = chapter.id;
      }
    });
    
    state.currentPosition = position;
    localStorage.setItem(config.tracking.positionKey, JSON.stringify(position));
  }
  
  /**
   * Mark a chapter as read
   */
  function markChapterAsRead(chapterId) {
    if (!state.chaptersRead.includes(chapterId)) {
      state.chaptersRead.push(chapterId);
      localStorage.setItem(config.tracking.chaptersRead, JSON.stringify(state.chaptersRead));
      debugLog('Marked chapter as read', chapterId);
    }
  }
  
  /**
   * Setup interval checks for token validity
   */
  function setupIntervalChecks() {
    setInterval(() => {
      // Re-validate token
      if (state.tokenData && state.tokenData.expiry) {
        if (state.tokenData.expiry < Date.now()) {
          redirectToPurchase('token_expired_interval');
        }
      }
    }, config.access.checkIntervalMs);
  }
  
  /**
   * Redirect to purchase page with reason
   */
  function redirectToPurchase(reason) {
    debugLog('Redirecting to purchase page', reason);
    
    // Clear invalid tokens
    sessionStorage.removeItem(config.access.tokenName);
    localStorage.removeItem(config.access.localTokenName);
    
    // Add reason as query parameter
    let redirectUrl = config.access.redirectUrl;
    if (reason) {
      redirectUrl += (redirectUrl.includes('?') ? '&' : '?') + 'reason=' + encodeURIComponent(reason);
    }
    
    // Redirect
    window.location.href = redirectUrl;
  }
  
  /**
   * Debug logging
   */
  function debugLog(message, data) {
    if (config.debug) {
      console.log(`[Book Access] ${message}`, data || '');
    }
  }
  
  /**
   * Public API
   */
  window.bookAccess = {
    // Check if user has valid access
    hasAccess: function() {
      return state.isTokenValid;
    },
    
    // Get current reading position
    getPosition: function() {
      return state.currentPosition;
    },
    
    // Get chapters read
    getChaptersRead: function() {
      return state.chaptersRead;
    },
    
    // Get reading progress (0-100%)
    getProgress: function() {
      if (!state.chaptersRead.length) return 0;
      
      const totalChapters = document.querySelectorAll('[id^="chapter-"]').length;
      if (!totalChapters) return 0;
      
      return Math.round((state.chaptersRead.length / totalChapters) * 100);
    },
    
    // Jump to a specific chapter
    goToChapter: function(chapterId) {
      const chapter = document.getElementById(chapterId);
      if (chapter) {
        chapter.scrollIntoView({ behavior: 'smooth' });
        return true;
      }
      return false;
    },
    
    // Change language preference
    setLanguage: function(lang) {
      if (lang === 'en' || lang === 'ar') {
        state.languagePreference = lang;
        if (state.tokenData) {
          state.tokenData.language = lang;
          // Update stored token with new language preference
          const updatedToken = btoa(JSON.stringify(state.tokenData));
          state.accessToken = updatedToken;
          sessionStorage.setItem(config.access.tokenName, updatedToken);
          localStorage.setItem(config.access.localTokenName, updatedToken);
        }
        return true;
      }
      return false;
    },
    
    // For debugging
    debug: function(enable) {
      config.debug = enable;
      return "Debug mode " + (enable ? "enabled" : "disabled");
    }
  };
  
  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
