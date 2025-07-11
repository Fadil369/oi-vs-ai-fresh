// Book Access Control Script
// This script ensures users can only access the book after payment

(function() {
    'use strict';
    
    // Check if user has valid access
    function checkAccess() {
        const accessToken = sessionStorage.getItem('bookAccess');
        
        if (!accessToken) {
            // No access token found, redirect to landing page
            window.location.href = '/';
            return false;
        }
        
        // Decode and validate token (basic validation)
        try {
            const decoded = atob(accessToken);
            const [timestamp, random] = decoded.split('_');
            
            // Check if token is less than 24 hours old
            const tokenAge = Date.now() - parseInt(timestamp);
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            
            if (tokenAge > maxAge) {
                sessionStorage.removeItem('bookAccess');
                window.location.href = '/';
                return false;
            }
            
            return true;
        } catch (e) {
            // Invalid token format
            sessionStorage.removeItem('bookAccess');
            window.location.href = '/';
            return false;
        }
    }
    
    // Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable text selection
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable copying
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable keyboard shortcuts for copying
    document.addEventListener('keydown', function(e) {
        // Disable Ctrl+A (Select All)
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+C (Copy)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+X (Cut)
        if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+S (Save)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+P (Print)
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            return false;
        }
        
        // Disable F12 (Developer Tools)
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+Shift+I (Developer Tools)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+Shift+J (Console)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+Shift+C (Inspect Element)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            return false;
        }
    });
    
    // Disable print
    window.addEventListener('beforeprint', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });
    
    // Add CSS to disable selection and printing
    const style = document.createElement('style');
    style.textContent = `
        body {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        @media print {
            body {
                display: none !important;
            }
        }
        
        /* Disable highlighting */
        ::selection {
            background: transparent !important;
        }
        
        ::-moz-selection {
            background: transparent !important;
        }
    `;
    document.head.appendChild(style);
    
    // Check access on page load
    window.addEventListener('DOMContentLoaded', function() {
        if (!checkAccess()) {
            document.body.innerHTML = '<h1>Redirecting...</h1>';
        }
    });
    
    // Periodically check access (every 5 minutes)
    setInterval(function() {
        checkAccess();
    }, 5 * 60 * 1000);
    
    // Add watermark with user info
    function addWatermark() {
        const watermark = document.createElement('div');
        watermark.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(52, 152, 219, 0.1);
            color: rgba(52, 152, 219, 0.3);
            padding: 10px 20px;
            border-radius: 10px;
            font-family: 'Inter', sans-serif;
            font-size: 12px;
            pointer-events: none;
            z-index: 9999;
        `;
        watermark.textContent = 'Licensed Copy - ' + new Date().toLocaleDateString();
        document.body.appendChild(watermark);
    }
    
    // Add watermark after DOM loads
    window.addEventListener('DOMContentLoaded', addWatermark);
    
})();