// Inactivity Overlay Script
// This script loads a Framer page as an overlay after 3:33 minutes of inactivity
// Only works on screens wider than 1200px

(function() {
    // Configuration
    const INACTIVITY_TIMEOUT = 213000; // 3:33 minutes in milliseconds
    const FRAMER_PAGE_URL = 'https://webkraft.dev/screensaver'; // Replace with your Framer page URL
    const MIN_WIDTH = 1200; // Minimum screen width to activate screensaver
    
    let inactivityTimer;
    let overlayActive = false;
    let scriptActive = false;
    
    // Check if screen width meets minimum requirement
    function isScreenWideEnough() {
        return window.innerWidth > MIN_WIDTH;
    }
    
    // Create overlay elements (hidden initially)
    function createOverlay() {
        // Create main container
        const overlay = document.createElement('div');
        overlay.id = 'inactivity-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999999;
            display: none;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        
        // Create iframe to load Framer page
        const frame = document.createElement('iframe');
        frame.id = 'screensaver-frame';
        frame.src = FRAMER_PAGE_URL;
        frame.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
        `;
        
        // Create a transparent overlay for capturing events
        const eventCatcher = document.createElement('div');
        eventCatcher.id = 'event-catcher';
        eventCatcher.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000000;
            background: transparent;
            cursor: default;
        `;
        
        // Add event listener directly to the event catcher
        eventCatcher.addEventListener('click', hideOverlay);
        eventCatcher.addEventListener('touchstart', hideOverlay);
        eventCatcher.addEventListener('mousemove', hideOverlay);
        
        // Assemble elements
        overlay.appendChild(frame);
        overlay.appendChild(eventCatcher); // Event catcher on top
        document.body.appendChild(overlay);
        
        return overlay;
    }
    
    // Show the overlay
    function showOverlay() {
        if (overlayActive || !isScreenWideEnough()) return;
        
        let overlay = document.getElementById('inactivity-overlay');
        if (!overlay) {
            overlay = createOverlay();
        }
        
        overlay.style.display = 'block';
        
        // Use a timeout to trigger the opacity transition
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
        
        overlayActive = true;
        
        // Stop monitoring general document events when overlay is shown
        // but keep keyboard events active
        removeActivityListeners();
        
        // Add specific keyboard handler when overlay is active
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keypress', handleKeyDown);
    }
    
    // Handle keyboard events specifically
    function handleKeyDown(e) {
        if (overlayActive) {
            hideOverlay();
        }
    }
    
    // Hide the overlay
    function hideOverlay() {
        const overlay = document.getElementById('inactivity-overlay');
        if (!overlay) return;
        
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500); // Wait for the fade out transition
        
        overlayActive = false;
        
        // Remove keyboard specific handlers
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keypress', handleKeyDown);
        
        // Restart monitoring document events only if screen is wide enough
        if (isScreenWideEnough()) {
            addActivityListeners();
            resetInactivityTimer();
        }
    }
    
    // Reset the inactivity timer
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        if (isScreenWideEnough()) {
            inactivityTimer = setTimeout(() => {
                showOverlay();
            }, INACTIVITY_TIMEOUT);
        }
    }
    
    // Document-level event listeners for inactivity detection
    function handleUserActivity() {
        if (!overlayActive && isScreenWideEnough()) {
            resetInactivityTimer();
        }
    }
    
    // Add activity listeners to document
    function addActivityListeners() {
        if (!isScreenWideEnough()) return;
        
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'keydown'];
        events.forEach(eventType => {
            document.addEventListener(eventType, handleUserActivity, { passive: true });
        });
    }
    
    // Remove activity listeners from document
    function removeActivityListeners() {
        const events = ['mousedown', 'mousemove', 'scroll', 'touchstart'];
        events.forEach(eventType => {
            document.removeEventListener(eventType, handleUserActivity);
        });
        // Note: we keep key events attached to close overlay on keypresses
    }
    
    // Handle window resize
    function handleResize() {
        if (isScreenWideEnough()) {
            // Screen became wide enough - activate script
            if (!scriptActive) {
                activateScript();
            }
        } else {
            // Screen became too narrow - deactivate script
            if (scriptActive) {
                deactivateScript();
            }
        }
    }
    
    // Activate the script
    function activateScript() {
        if (scriptActive) return;
        
        scriptActive = true;
        addActivityListeners();
        resetInactivityTimer();
        console.log('Inactivity overlay activated for screen width > 1200px');
    }
    
    // Deactivate the script
    function deactivateScript() {
        if (!scriptActive) return;
        
        scriptActive = false;
        clearTimeout(inactivityTimer);
        removeActivityListeners();
        
        // Hide overlay if it's currently shown
        if (overlayActive) {
            hideOverlay();
        }
        
        console.log('Inactivity overlay deactivated for narrow screen');
    }
    
    // Initialize
    function init() {
        // Add resize listener
        window.addEventListener('resize', handleResize);
        
        // Check initial screen size and activate if appropriate
        if (isScreenWideEnough()) {
            activateScript();
        } else {
            console.log('Screen too narrow for inactivity overlay (< 1200px)');
        }
    }
    
    // Start the whole process
    init();
})();