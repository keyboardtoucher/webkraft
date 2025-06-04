/**
 * Mobile Viewport Height Fix
 * Compensates for mobile browser address bar height issues
 */
(function() {
  'use strict';
  
  function setAppHeight() {
    const height = window.innerHeight;
    document.documentElement.style.setProperty('--app-height', `${height}px`);
    
    // Дополнительно для отладки
    console.log('Viewport height updated:', height);
  }
  
  // Debounce function для оптимизации
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  const debouncedSetAppHeight = debounce(setAppHeight, 100);
  
  // Event listeners
  window.addEventListener('resize', debouncedSetAppHeight);
  window.addEventListener('orientationchange', setAppHeight);
  window.addEventListener('load', setAppHeight);
  
  // Immediate execution
  setAppHeight();
  
  // Повторный вызов через небольшую задержку для iOS
  setTimeout(setAppHeight, 100);
})();