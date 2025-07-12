/**
 * Enhanced Payment Integration for OI vs AI Book
 * 
 * This script handles:
 * 1. Stripe payment integration
 * 2. PayPal payment integration
 * 3. Apple Pay integration
 * 4. Secure access token generation
 * 5. Multi-language support
 * 6. Mobile-optimized payment flows
 */

// Configuration
const config = {
  stripe: {
    publicKey: 'pk_test_your_stripe_public_key',
    products: {
      book: {
        en: 'price_english_book_id',
        ar: 'price_arabic_book_id',
        both: 'price_bilingual_book_id'
      }
    }
  },
  paypal: {
    clientId: 'your_paypal_client_id',
    currency: 'SAR'
  },
  prices: {
    SAR: {
      original: 230,
      current: 130,
      currency: 'SAR'
    },
    USD: {
      original: 61,
      current: 35,
      currency: 'USD'
    }
  }
};

// Global state
let selectedPayment = null;
let selectedLanguage = document.documentElement.classList.contains('ar') ? 'ar' : 'en';
let selectedCurrency = 'SAR';

/**
 * Set currency preference
 */
function setCurrency(currency) {
  if (currency === 'SAR' || currency === 'USD') {
    selectedCurrency = currency;
    
    // Update PayPal configuration
    config.paypal.currency = currency;
    
    // Re-initialize PayPal if needed
    if (window.paypal) {
      initializePayPalButtons();
    }
  }
}

/**
 * Initialize payment methods
 */
function initializePayments() {
  // Load Stripe.js
  loadScript('https://js.stripe.com/v3/', () => {
    window.stripe = Stripe(config.stripe.publicKey);
  });

  // Load PayPal SDK
  loadScript('https://www.paypal.com/sdk/js?client-id=' + config.paypal.clientId + '&currency=' + config.paypal.currency, () => {
    initializePayPalButtons();
  });

  // Setup payment option selection
  document.querySelectorAll('.payment-option').forEach(option => {
    option.addEventListener('click', () => {
      selectPayment(option.dataset.method);
    });
  });

  // Setup checkout button
  const checkoutButton = document.getElementById('checkout-button');
  if (checkoutButton) {
    checkoutButton.addEventListener('click', processPayment);
  }
}

/**
 * Helper function to load external scripts
 */
function loadScript(src, callback) {
  const script = document.createElement('script');
  script.src = src;
  script.onload = callback;
  document.head.appendChild(script);
}

/**
 * Select payment method
 */
function selectPayment(method) {
  selectedPayment = method;
  
  // Update UI
  document.querySelectorAll('.payment-option').forEach(option => {
    option.classList.remove('selected');
    if (option.dataset.method === method) {
      option.classList.add('selected');
    }
  });
  
  // Show payment-specific fields if needed
  togglePaymentFields(method);
}

/**
 * Toggle visibility of payment-specific form fields
 */
function togglePaymentFields(method) {
  document.querySelectorAll('.payment-specific-fields').forEach(field => {
    field.style.display = 'none';
  });
  
  const specificField = document.getElementById(`${method}-fields`);
  if (specificField) {
    specificField.style.display = 'block';
  }
}

/**
 * Initialize PayPal buttons
 */
function initializePayPalButtons() {
  if (!window.paypal) return;
  
  const paypalButtonContainer = document.getElementById('paypal-button-container');
  if (!paypalButtonContainer) return;
  
  paypal.Buttons({
    // Order creation
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: config.prices[selectedCurrency].current.toString(),
            currency_code: config.prices[selectedCurrency].currency
          },
          description: selectedLanguage === 'ar' ? 'كتاب الذكاء الأصلي مقابل الذكاء الاصطناعي' : 'OI vs AI Book'
        }]
      });
    },
    
    // Payment approval
    onApprove: function(data, actions) {
      // Show loading state
      showProcessingUI();
      
      return actions.order.capture().then(function(orderData) {
        // Handle successful payment
        const paymentResult = orderData.purchase_units[0];
        const transactionId = paymentResult.payments.captures[0].id;
        
        // Generate access token using the transaction data
        const accessToken = generateAccessToken({
          method: 'paypal',
          transactionId: transactionId,
          amount: paymentResult.amount.value,
          currency: paymentResult.amount.currency_code,
          timestamp: Date.now()
        });
        
        // Store the access token
        storeAccessToken(accessToken);
        
        // Show success UI
        showSuccessUI();
        
        // Redirect to the book
        setTimeout(() => {
          redirectToBook();
        }, 1500);
      });
    },
    
    // Error handling
    onError: function(err) {
      console.error('PayPal Error:', err);
      showErrorUI('payment_failed');
    }
  }).render('#paypal-button-container');
}

/**
 * Process payment based on selected method
 */
function processPayment() {
  if (!selectedPayment) {
    showErrorUI('no_payment_method');
    return;
  }
  
  // Show processing UI
  showProcessingUI();
  
  switch(selectedPayment) {
    case 'credit_card':
      processStripePayment();
      break;
    case 'apple_pay':
      processApplePayment();
      break;
    case 'paypal':
      // PayPal is handled by its own button
      // Just show the PayPal button if not already visible
      document.getElementById('paypal-button-container').style.display = 'block';
      hideProcessingUI();
      break;
    default:
      // For demo or testing, simulate a successful payment
      simulatePayment();
  }
}

/**
 * Process payment with Stripe
 */
function processStripePayment() {
  // Get the price ID based on selected language
  const priceId = config.stripe.products.book[selectedLanguage] || config.stripe.products.book.both;
  
  // Create a Checkout Session
  fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId: priceId,
      successUrl: window.location.origin + '/payment-success',
      cancelUrl: window.location.origin + '/payment-cancel',
    }),
  })
  .then(response => response.json())
  .then(session => {
    // Redirect to Stripe Checkout
    return stripe.redirectToCheckout({ sessionId: session.id });
  })
  .then(result => {
    if (result.error) {
      showErrorUI('payment_failed', result.error.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showErrorUI('payment_failed');
  });
}

/**
 * Process Apple Pay payment
 */
function processApplePayment() {
  if (!window.ApplePaySession || !stripe) {
    showErrorUI('apple_pay_not_supported');
    return;
  }
  
  // Check if Apple Pay is available
  const paymentRequest = stripe.paymentRequest({
    country: selectedCurrency === 'SAR' ? 'SA' : 'US',
    currency: selectedCurrency.toLowerCase(),
    total: {
      label: 'OI vs AI Book',
      amount: config.prices[selectedCurrency].current * 100, // Amount in cents
    },
    requestPayerName: true,
    requestPayerEmail: true,
  });
  
  paymentRequest.canMakePayment().then(result => {
    if (result && result.applePay) {
      // Apple Pay is available, proceed with payment
      paymentRequest.on('paymentmethod', async (ev) => {
        // Confirm the PaymentIntent with the payment method
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: config.prices[selectedCurrency].current * 100,
            currency: selectedCurrency.toLowerCase(),
          }),
        });
        
        const paymentIntent = await response.json();
        
        // Confirm the payment
        const { error, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(
          paymentIntent.client_secret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );
        
        if (error) {
          ev.complete('fail');
          showErrorUI('payment_failed', error.message);
        } else {
          ev.complete('success');
          if (confirmedIntent.status === 'requires_action') {
            // Use stripe.confirmCardPayment to handle 3D Secure authentication
            const { error } = await stripe.confirmCardPayment(paymentIntent.client_secret);
            if (error) {
              showErrorUI('payment_failed', error.message);
            } else {
              handleSuccessfulPayment('apple_pay', confirmedIntent.id);
            }
          } else {
            handleSuccessfulPayment('apple_pay', confirmedIntent.id);
          }
        }
      });
      
      // Start the payment
      paymentRequest.show();
    } else {
      showErrorUI('apple_pay_not_supported');
    }
  });
}

/**
 * Simulate payment (for development/testing)
 */
function simulatePayment() {
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 10;
    updateProgressUI(progress);
    
    if (progress >= 100) {
      clearInterval(progressInterval);
      
      // Generate a fake transaction ID
      const fakeTransactionId = 'sim_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      
      // Handle successful payment
      handleSuccessfulPayment('simulation', fakeTransactionId);
    }
  }, 200);
}

/**
 * Handle successful payment across all methods
 */
function handleSuccessfulPayment(method, transactionId) {
  // Generate access token
  const accessToken = generateAccessToken({
    method: method,
    transactionId: transactionId,
    timestamp: Date.now()
  });
  
  // Store the access token
  storeAccessToken(accessToken);
  
  // Show success UI
  showSuccessUI();
  
  // Redirect to the book
  setTimeout(() => {
    redirectToBook();
  }, 1500);
}

/**
 * Generate secure access token
 */
function generateAccessToken(paymentData) {
  // In a real implementation, this would use more secure methods
  // and potentially involve server-side validation
  const tokenData = {
    ...paymentData,
    language: selectedLanguage,
    currency: selectedCurrency,
    amount: config.prices[selectedCurrency].current,
    expiry: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
  };
  
  // For additional security, we'd use a server-side generated token
  // This is a simplified client-side implementation
  return btoa(JSON.stringify(tokenData));
}

/**
 * Store access token securely
 */
function storeAccessToken(token) {
  // Store in sessionStorage for immediate use
  sessionStorage.setItem('bookAccess', token);
  
  // For longer-term storage, use localStorage with expiry check
  localStorage.setItem('bookAccessToken', token);
}

/**
 * Redirect to appropriate book version
 */
function redirectToBook() {
  const bookUrls = {
    en: 'oi-vs-ai-english-ebook.html',
    ar: 'oi-vs-ai-arabic-ebook.html',
    both: 'oi-vs-ai-complete-unified-book.html'
  };
  
  // Redirect to the appropriate version
  window.location.href = bookUrls[selectedLanguage] || bookUrls.both;
}

/**
 * UI Helper Functions
 */

function showProcessingUI() {
  const btn = document.getElementById('checkout-button');
  if (!btn) return;
  
  const originalText = btn.innerHTML;
  btn.dataset.originalText = originalText;
  
  const loadingText = selectedLanguage === 'ar' ? 
    '<i class="fas fa-spinner fa-spin"></i> جاري معالجة الدفع...' :
    '<i class="fas fa-spinner fa-spin"></i> Processing Payment...';
  
  btn.innerHTML = loadingText;
  btn.disabled = true;
  btn.style.cursor = 'not-allowed';
}

function hideProcessingUI() {
  const btn = document.getElementById('checkout-button');
  if (!btn || !btn.dataset.originalText) return;
  
  btn.innerHTML = btn.dataset.originalText;
  btn.disabled = false;
  btn.style.cursor = 'pointer';
}

function updateProgressUI(progress) {
  const btn = document.getElementById('checkout-button');
  if (!btn) return;
  
  const progressText = selectedLanguage === 'ar' ? 
    `<i class="fas fa-spinner fa-spin"></i> جاري المعالجة... ${progress}%` :
    `<i class="fas fa-spinner fa-spin"></i> Processing... ${progress}%`;
  
  btn.innerHTML = progressText;
}

function showSuccessUI() {
  const btn = document.getElementById('checkout-button');
  if (!btn) return;
  
  const successText = selectedLanguage === 'ar' ? 
    '<i class="fas fa-check"></i> تم الدفع بنجاح!' :
    '<i class="fas fa-check"></i> Payment Successful!';
  
  btn.innerHTML = successText;
  btn.style.background = 'linear-gradient(135deg, #27ae60, #229954)';
}

function showErrorUI(errorCode, errorMessage) {
  const btn = document.getElementById('checkout-button');
  if (!btn || !btn.dataset.originalText) return;
  
  let errorText;
  
  switch(errorCode) {
    case 'no_payment_method':
      errorText = selectedLanguage === 'ar' ? 
        '<i class="fas fa-exclamation-triangle"></i> الرجاء اختيار طريقة الدفع' :
        '<i class="fas fa-exclamation-triangle"></i> Please select a payment method';
      break;
    case 'payment_failed':
      errorText = selectedLanguage === 'ar' ? 
        '<i class="fas fa-exclamation-triangle"></i> فشلت عملية الدفع' :
        '<i class="fas fa-exclamation-triangle"></i> Payment failed';
      break;
    case 'apple_pay_not_supported':
      errorText = selectedLanguage === 'ar' ? 
        '<i class="fas fa-exclamation-triangle"></i> خدمة آبل باي غير متوفرة' :
        '<i class="fas fa-exclamation-triangle"></i> Apple Pay not supported';
      break;
    default:
      errorText = selectedLanguage === 'ar' ? 
        '<i class="fas fa-exclamation-triangle"></i> حدث خطأ ما' :
        '<i class="fas fa-exclamation-triangle"></i> An error occurred';
  }
  
  if (errorMessage) {
    console.error('Payment Error:', errorMessage);
  }
  
  btn.innerHTML = errorText;
  btn.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
  
  setTimeout(() => {
    btn.innerHTML = btn.dataset.originalText;
    btn.style.background = '';
    btn.disabled = false;
    btn.style.cursor = 'pointer';
  }, 3000);
}

// Initialize payment methods when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializePayments);

// Export functions for external use
window.bookPayment = {
  selectPayment,
  processPayment,
  simulatePayment,
  setCurrency
};
