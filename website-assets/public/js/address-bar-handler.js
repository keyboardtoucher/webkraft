/**
 * Address Bar Position Detector & Bottom Offset Handler
 * Works only on devices with width < 1199px (tablets and mobile)
 */
class AddressBarHandler {
  constructor() {
    this.browser = null;
    this.position = 'unknown';
    this.addressBarHeight = 0;
    this.initialHeight = window.innerHeight;
    this.maxHeight = window.innerHeight;
    this.isDetecting = false;
    this.isActive = false; // Script activity flag
    this.maxWidth = 1199; // Maximum width for script operation
    
    // Prefixes for dynamic elements
    this.cssPrefix = 'wkd-addbar-handler';
    this.cssVarPrefix = '--wkd-addbar-handler';
    this.dataAttrPrefix = 'data-wkd-addbar-handler';
    this.styleSheetId = 'wkd-addbar-handler-offset-styles';
    
    this.init();
  }
  
  init() {
    // Check screen width before initialization
    if (!this.shouldBeActive()) {
      this.log('Screen width > 1199px, script disabled');
      return;
    }
    
    this.isActive = true;
    this.detectBrowser();
    this.detectPosition();
    this.setupEventListeners();
    this.log('Initialized', { 
      browser: this.browser, 
      position: this.position,
      screenWidth: window.innerWidth 
    });
  }
  
  shouldBeActive() {
    return window.innerWidth < this.maxWidth;
  }
  
  checkScreenWidth() {
    const shouldBeActive = this.shouldBeActive();
    
    if (shouldBeActive && !this.isActive) {
      // Activate script
      this.log('Screen width < 1199px, activating script');
      this.isActive = true;
      this.detectBrowser();
      this.detectPosition();
    } else if (!shouldBeActive && this.isActive) {
      // Deactivate script
      this.log('Screen width >= 1199px, deactivating script');
      this.isActive = false;
      this.clearStyles();
    }
  }
  
  detectBrowser() {
    if (!this.isActive) return;
    
    const ua = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad/.test(ua) && /safari/.test(ua) && !/chrome|firefox/.test(ua)) {
      this.browser = 'ios-safari';
      this.position = 'top'; // iOS Safari is always on top
    } else if (/android/.test(ua) && /chrome/.test(ua)) {
      this.browser = 'android-chrome';
      this.position = 'unknown'; // Can be top or bottom
    } else if (/android/.test(ua) && /firefox/.test(ua)) {
      this.browser = 'firefox-mobile';
      this.position = 'top'; // Firefox Mobile is always on top
    } else {
      this.browser = 'other';
      this.position = 'top'; // Default assumption is top
    }
  }
  
  detectPosition() {
    if (!this.isActive) return;
    
    if (this.browser === 'android-chrome') {
      this.detectChromePosition();
    } else {
      this.applyStyles();
    }
  }
  
  detectChromePosition() {
    if (!this.isActive) return;
    
    this.isDetecting = true;
    this.log('Detecting Chrome address bar position...');
    
    // Save initial height
    const initialHeight = window.innerHeight;
    
    // Create small scroll for testing
    const testScroll = () => {
      const originalScrollY = window.pageYOffset;
      
      // Scroll 1px to trigger address bar change
      window.scrollTo(0, 1);
      
      // Wait for viewport change
      setTimeout(() => {
        const heightAfterScroll = window.innerHeight;
        const heightDifference = heightAfterScroll - initialHeight;
        
        this.log('Height difference after scroll:', heightDifference);
        
        // Analyze height change
        if (heightDifference > 30) {
          // Height increased = address bar was on top and hid
          this.position = 'top';
          this.addressBarHeight = heightDifference;
        } else if (heightDifference < -30) {
          // Height decreased = address bar is on bottom and appeared
          this.position = 'bottom';
          this.addressBarHeight = Math.abs(heightDifference);
        } else {
          // Small change - try another method
          this.detectWithResize();
        }
        
        // Return original scroll position
        window.scrollTo(0, originalScrollY);
        
        this.isDetecting = false;
        if (this.isActive) {
          this.applyStyles();
        }
        
      }, 200);
    };
    
    // Execute test
    if (document.readyState === 'complete') {
      testScroll();
    } else {
      window.addEventListener('load', testScroll);
    }
  }
  
  detectWithResize() {
    if (!this.isActive) return;
    
    this.log('Using resize detection method...');
    
    let resizeCount = 0;
    const heights = [];
    
    const resizeHandler = () => {
      if (!this.isActive) {
        window.removeEventListener('resize', resizeHandler);
        return;
      }
      
      heights.push(window.innerHeight);
      resizeCount++;
      
      if (resizeCount >= 3) {
        window.removeEventListener('resize', resizeHandler);
        
        const maxHeight = Math.max(...heights);
        const minHeight = Math.min(...heights);
        const difference = maxHeight - minHeight;
        
        if (difference > 50) {
          // Significant height difference exists
          this.maxHeight = maxHeight;
          this.addressBarHeight = difference;
          
          // If current height is less than maximum, address bar might be on bottom
          if (window.innerHeight < maxHeight * 0.95) {
            this.position = 'bottom';
          } else {
            this.position = 'top';
          }
        } else {
          this.position = 'top'; // Default
        }
        
        this.log('Resize detection complete:', {
          position: this.position,
          addressBarHeight: this.addressBarHeight,
          maxHeight: this.maxHeight,
          currentHeight: window.innerHeight
        });
      }
    };
    
    window.addEventListener('resize', resizeHandler);
    
    // Force trigger resize
    window.dispatchEvent(new Event('resize'));
  }
  
  calculateBottomOffset() {
    if (!this.isActive || this.position !== 'bottom') return 0;
    
    // Calculate size in vh
    const currentHeight = window.innerHeight;
    const vhSize = currentHeight / 100;
    const offsetInVh = this.addressBarHeight / vhSize;
    
    this.log('Bottom offset calculation:', {
      addressBarHeight: this.addressBarHeight,
      currentHeight: currentHeight,
      vhSize: vhSize,
      offsetInVh: offsetInVh
    });
    
    // Limit to reasonable bounds (5-15vh)
    return Math.min(Math.max(offsetInVh, 5), 15);
  }
  
  applyStyles() {
    if (!this.isActive) return;
    
    const bottomOffset = this.calculateBottomOffset();
    
    // Set CSS variables with prefixes
    document.documentElement.style.setProperty(
      `${this.cssVarPrefix}-position`, 
      this.position
    );
    
    document.documentElement.style.setProperty(
      `${this.cssVarPrefix}-bottom-offset`, 
      `${bottomOffset}vh`
    );
    
    document.documentElement.style.setProperty(
      `${this.cssVarPrefix}-height`, 
      `${this.addressBarHeight}px`
    );
    
    // Add attributes for CSS selectors with prefixes
    document.documentElement.setAttribute(`${this.dataAttrPrefix}-position`, this.position);
    document.documentElement.setAttribute(`${this.dataAttrPrefix}-screen-width`, 'mobile');
    
    // Apply styles for elements with bottom address bar
    if (this.position === 'bottom' && bottomOffset > 0) {
      this.addBottomPadding(bottomOffset);
    }
    
    this.log('Styles applied:', {
      position: this.position,
      bottomOffset: `${bottomOffset}vh`,
      heightPx: `${this.addressBarHeight}px`,
      screenWidth: window.innerWidth
    });
  }
  
  addBottomPadding(offsetVh) {
    if (!this.isActive) return;
    
    // Create or update styles with prefixed ID
    let styleSheet = document.getElementById(this.styleSheetId);
    
    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = this.styleSheetId;
      document.head.appendChild(styleSheet);
    }
    
    const css = `
      /* WKD Address Bar Bottom Offset Styles - Only for screens < 1199px */
      @media screen and (max-width: 1198px) {
        .${this.cssPrefix}-body-padding {
          padding-bottom: ${offsetVh}vh !important;
        }
        
        body {
          padding-bottom: ${offsetVh}vh !important;
        }
        
        .fullscreen-element,
        .full-height-element,
        [data-framer-name*="responsive"] {
          margin-bottom: ${offsetVh}vh !important;
        }
        
        /* Specific selectors for Framer */
        .framer-full-height {
          padding-bottom: ${offsetVh}vh !important;
        }
        
        /* Only for bottom address bar using prefixed data attribute */
        [${this.dataAttrPrefix}-position="bottom"] .mobile-fullscreen {
          padding-bottom: ${offsetVh}vh !important;
        }
        
        [${this.dataAttrPrefix}-position="bottom"] .${this.cssPrefix}-fullscreen {
          padding-bottom: ${offsetVh}vh !important;
        }
        
        /* Additional selectors for mobile */
        @media screen and (max-width: 768px) {
          .mobile-fullscreen,
          .${this.cssPrefix}-mobile-fullscreen {
            padding-bottom: ${offsetVh}vh !important;
          }
        }
        
        /* Helper classes with prefixes */
        .${this.cssPrefix}-full-height {
          padding-bottom: var(${this.cssVarPrefix}-bottom-offset, 0) !important;
        }
        
        .${this.cssPrefix}-bottom-offset {
          margin-bottom: var(${this.cssVarPrefix}-bottom-offset, 0) !important;
        }
      }
    `;
    
    styleSheet.textContent = css;
  }
  
  clearStyles() {
    this.log('Clearing styles - desktop mode');
    
    // Remove CSS variables with prefixes
    document.documentElement.style.removeProperty(`${this.cssVarPrefix}-position`);
    document.documentElement.style.removeProperty(`${this.cssVarPrefix}-bottom-offset`);
    document.documentElement.style.removeProperty(`${this.cssVarPrefix}-height`);
    
    // Remove attributes with prefixes
    document.documentElement.removeAttribute(`${this.dataAttrPrefix}-position`);
    document.documentElement.setAttribute(`${this.dataAttrPrefix}-screen-width`, 'desktop');
    
    // Remove styles with prefixed ID
    const styleSheet = document.getElementById(this.styleSheetId);
    if (styleSheet) {
      styleSheet.remove();
    }
  }
  
  setupEventListeners() {
    // Update on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.checkScreenWidth(); // Check width after rotation
        if (this.isActive) {
          this.initialHeight = window.innerHeight;
          if (!this.isDetecting) {
            this.detectPosition();
          }
        }
      }, 500);
    });
    
    // Update on resize (with debounce)
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.checkScreenWidth(); // Check width on every resize
        if (this.isActive && !this.isDetecting) {
          this.applyStyles();
        }
      }, 200);
    });
  }
  
  log(message, data = null) {
    console.log(`[WKD-AddressBarHandler] ${message}`, data || '');
  }
  
  // Public methods
  getInfo() {
    return {
      isActive: this.isActive,
      screenWidth: window.innerWidth,
      maxWidth: this.maxWidth,
      browser: this.browser,
      position: this.position,
      addressBarHeight: this.addressBarHeight,
      bottomOffsetVh: this.calculateBottomOffset(),
      cssPrefix: this.cssPrefix,
      cssVarPrefix: this.cssVarPrefix,
      dataAttrPrefix: this.dataAttrPrefix
    };
  }
  
  forceRedetect() {
    if (!this.isActive) {
      this.log('Script is not active (screen width >= 1199px)');
      return;
    }
    
    this.log('Force redetecting...');
    this.detectPosition();
  }
  
  // Method to change maximum width
  setMaxWidth(width) {
    this.maxWidth = width;
    this.checkScreenWidth();
    this.log(`Max width changed to ${width}px`);
  }
  
  // Helper method to get CSS variable names
  getCSSVariables() {
    return {
      position: `${this.cssVarPrefix}-position`,
      bottomOffset: `${this.cssVarPrefix}-bottom-offset`,
      height: `${this.cssVarPrefix}-height`
    };
  }
  
  // Helper method to get data attribute names
  getDataAttributes() {
    return {
      position: `${this.dataAttrPrefix}-position`,
      screenWidth: `${this.dataAttrPrefix}-screen-width`
    };
  }
  
  // Helper method to get CSS class names
  getCSSClasses() {
    return {
      bodyPadding: `${this.cssPrefix}-body-padding`,
      fullHeight: `${this.cssPrefix}-full-height`,
      bottomOffset: `${this.cssPrefix}-bottom-offset`,
      fullscreen: `${this.cssPrefix}-fullscreen`,
      mobileFullscreen: `${this.cssPrefix}-mobile-fullscreen`
    };
  }
}

// Auto-start with prefixed global variable
document.addEventListener('DOMContentLoaded', () => {
  window.wkdAddressBarHandler = new AddressBarHandler();
  
  // Backward compatibility (optional)
  window.addressBarHandler = window.wkdAddressBarHandler;
});

// Export for usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AddressBarHandler;
}