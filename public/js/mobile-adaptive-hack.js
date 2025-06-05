/**
 * Framer Contacts Spacer Script
 * Automatically adds space below contacts block if it doesn't fit completely on screen
 */

class FramerContactsSpacer {
    constructor(options = {}) {
        this.options = {
            contactsSelector: '[data-framer-name="contacts"]',
            spacerClass: 'framer-adaptive-spacer',
            spacerHeight: 'auto', // 'auto', number in px, or function
            minSpacerHeight: 50,
            maxSpacerHeight: 300,
            threshold: 0.95, // 95% of element should be visible
            debounceDelay: 100,
            animationDuration: 300,
            debug: false,
            ...options
        };
        
        this.contactsElement = null;
        this.spacerElement = null;
        this.isElementCut = false;
        this.lastViewportSize = { width: 0, height: 0 };
        
        this.init();
    }
    
    init() {
        this.findContactsElement();
        this.createSpacer();
        this.setupObservers();
        this.checkAndUpdate();
        
        if (this.options.debug) {
            console.log('🎯 Framer Contacts Spacer initialized');
        }
    }
    
    findContactsElement() {
        this.contactsElement = document.querySelector(this.options.contactsSelector);
        
        if (!this.contactsElement) {
            if (this.options.debug) {
                console.warn('⚠️ Contacts element not found:', this.options.contactsSelector);
            }
            
            // Попробуем найти позже
            setTimeout(() => this.findContactsElement(), 1000);
            return false;
        }
        
        if (this.options.debug) {
            console.log('✅ Contacts element found:', this.contactsElement);
        }
        
        return true;
    }
    
    createSpacer() {
        if (!this.contactsElement) return;
        
        // Удаляем существующий spacer если есть
        const existingSpacer = document.querySelector(`.${this.options.spacerClass}`);
        if (existingSpacer) {
            existingSpacer.remove();
        }
        
        // Создаем новый spacer
        this.spacerElement = document.createElement('div');
        this.spacerElement.className = this.options.spacerClass;
        this.spacerElement.style.cssText = `
            height: 0px;
            transition: height ${this.options.animationDuration}ms ease-out;
            background: transparent;
            pointer-events: none;
            position: relative;
            z-index: 1;
        `;
        
        // Вставляем spacer сразу после contacts
        const parent = this.contactsElement.parentNode;
        const nextSibling = this.contactsElement.nextSibling;
        
        if (nextSibling) {
            parent.insertBefore(this.spacerElement, nextSibling);
        } else {
            parent.appendChild(this.spacerElement);
        }
        
        if (this.options.debug) {
            this.spacerElement.style.background = 'linear-gradient(45deg, rgba(255,0,0,0.1), rgba(0,255,0,0.1))';
            this.spacerElement.setAttribute('title', 'Adaptive Spacer (Debug Mode)');
        }
    }
    
    isElementFullyVisible() {
        if (!this.contactsElement) return true;
        
        const rect = this.contactsElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        
        // Проверяем, что элемент виден и не обрезается
        const isVisible = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= viewportHeight &&
            rect.right <= viewportWidth
        );
        
        // Альтернативная проверка - процент видимости
        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const visibleWidth = Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0);
        const visibleArea = Math.max(0, visibleHeight) * Math.max(0, visibleWidth);
        const totalArea = rect.height * rect.width;
        const visibilityRatio = totalArea > 0 ? visibleArea / totalArea : 0;
        
        const isFullyVisible = isVisible && visibilityRatio >= this.options.threshold;
        
        if (this.options.debug) {
            console.log('📏 Visibility check:', {
                rect: { ...rect },
                viewport: { width: viewportWidth, height: viewportHeight },
                visibilityRatio: (visibilityRatio * 100).toFixed(1) + '%',
                isFullyVisible,
                threshold: (this.options.threshold * 100) + '%'
            });
        }
        
        return isFullyVisible;
    }
    
    calculateSpacerHeight() {
        if (!this.contactsElement) return 0;
        
        const rect = this.contactsElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Если элемент полностью виден, spacer не нужен
        if (this.isElementFullyVisible()) {
            return 0;
        }
        
        // Вычисляем, насколько элемент выходит за границы
        const overflowBottom = Math.max(0, rect.bottom - viewportHeight);
        const overflowTop = Math.max(0, -rect.top);
        const totalOverflow = overflowBottom + overflowTop;
        
        let spacerHeight = 0;
        
        if (typeof this.options.spacerHeight === 'function') {
            spacerHeight = this.options.spacerHeight(totalOverflow, rect, viewportHeight);
        } else if (this.options.spacerHeight === 'auto') {
            // Автоматический расчет
            spacerHeight = Math.min(
                totalOverflow + 50, // overflow + немного запаса
                Math.max(viewportHeight * 0.3, this.options.maxSpacerHeight) // не больше 30% экрана
            );
        } else {
            spacerHeight = Number(this.options.spacerHeight);
        }
        
        // Применяем ограничения
        spacerHeight = Math.max(this.options.minSpacerHeight, spacerHeight);
        spacerHeight = Math.min(this.options.maxSpacerHeight, spacerHeight);
        
        return Math.round(spacerHeight);
    }
    
    updateSpacer() {
        if (!this.spacerElement) return;
        
        const wasElementCut = this.isElementCut;
        this.isElementCut = !this.isElementFullyVisible();
        
        const spacerHeight = this.isElementCut ? this.calculateSpacerHeight() : 0;
        
        // Обновляем высоту spacer'а
        this.spacerElement.style.height = spacerHeight + 'px';
        
        // Логирование изменений
        if (this.options.debug && wasElementCut !== this.isElementCut) {
            console.log(`🔄 Spacer ${this.isElementCut ? 'activated' : 'deactivated'}:`, {
                height: spacerHeight + 'px',
                reason: this.isElementCut ? 'Element is cut off' : 'Element fully visible'
            });
        }
        
        // Кастомное событие для уведомления
        this.dispatchUpdateEvent(spacerHeight);
    }
    
    dispatchUpdateEvent(spacerHeight) {
        const event = new CustomEvent('framer-spacer-update', {
            detail: {
                isElementCut: this.isElementCut,
                spacerHeight,
                contactsElement: this.contactsElement,
                spacerElement: this.spacerElement
            }
        });
        
        document.dispatchEvent(event);
    }
    
    checkAndUpdate() {
        if (!this.contactsElement) {
            // Пытаемся найти элемент еще раз
            if (this.findContactsElement()) {
                this.createSpacer();
            }
            return;
        }
        
        this.updateSpacer();
    }
    
    // Дебаунс функция для оптимизации
    debounce(func, wait) {
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
    
    setupObservers() {
        // Дебаунсированная функция обновления
        const debouncedUpdate = this.debounce(() => this.checkAndUpdate(), this.options.debounceDelay);
        
        // Отслеживание изменения размера окна
        window.addEventListener('resize', debouncedUpdate);
        
        // Отслеживание скролла
        window.addEventListener('scroll', debouncedUpdate, { passive: true });
        
        // Отслеживание изменений в DOM
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach((mutation) => {
                // Проверяем появление contacts элемента
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            if (node.matches && node.matches(this.options.contactsSelector)) {
                                shouldUpdate = true;
                            } else if (node.querySelector && node.querySelector(this.options.contactsSelector)) {
                                shouldUpdate = true;
                            }
                        }
                    });
                }
                
                // Проверяем изменения в contacts элементе
                if (mutation.target === this.contactsElement || 
                    (this.contactsElement && this.contactsElement.contains(mutation.target))) {
                    shouldUpdate = true;
                }
            });
            
            if (shouldUpdate) {
                debouncedUpdate();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'data-framer-name']
        });
        
        // Отслеживание изменений размера элемента
        if (this.contactsElement && window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(debouncedUpdate);
            resizeObserver.observe(this.contactsElement);
        }
        
        // Отслеживание ориентации устройства
        if (window.screen && window.screen.orientation) {
            window.screen.orientation.addEventListener('change', debouncedUpdate);
        } else {
            window.addEventListener('orientationchange', debouncedUpdate);
        }
    }
    
    // Публичные методы
    destroy() {
        if (this.spacerElement) {
            this.spacerElement.remove();
        }
        
        // Здесь можно добавить удаление всех event listeners
        // если хранить ссылки на них
        
        if (this.options.debug) {
            console.log('🗑️ Framer Contacts Spacer destroyed');
        }
    }
    
    refresh() {
        this.checkAndUpdate();
    }
    
    setOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.checkAndUpdate();
    }
}

// Script initialization
function initFramerContactsSpacer(options = {}) {
    // Wait for DOM loading
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new FramerContactsSpacer(options);
        });
    } else {
        new FramerContactsSpacer(options);
    }
}

// Simple version for quick use
function quickContactsSpacer() {
    return new FramerContactsSpacer({
        debug: true,
        spacerHeight: 'auto',
        animationDuration: 400
    });
}

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FramerContactsSpacer, initFramerContactsSpacer, quickContactsSpacer };
} else if (typeof window !== 'undefined') {
    window.FramerContactsSpacer = FramerContactsSpacer;
    window.initFramerContactsSpacer = initFramerContactsSpacer;
    window.quickContactsSpacer = quickContactsSpacer;
}

// Automatic initialization if no other settings
if (typeof window !== 'undefined' && !window.FRAMER_SPACER_MANUAL_INIT) {
    initFramerContactsSpacer();
}

/*
USAGE:

1. Basic usage (automatic initialization):
   Just add this script to the page

2. With settings:
   initFramerContactsSpacer({
       spacerHeight: 200,
       debug: true,
       threshold: 0.9
   });

3. Programmatic control:
   const spacer = new FramerContactsSpacer({
       spacerHeight: (overflow, rect, viewport) => overflow * 1.5,
       onUpdate: (data) => console.log('Spacer updated:', data)
   });

4. Events:
   document.addEventListener('framer-spacer-update', (e) => {
       console.log('Spacer event:', e.detail);
   });

SETTINGS:
- contactsSelector: selector for finding element (default '[data-framer-name="contacts"]')
- spacerHeight: spacer height ('auto', number, or function)
- minSpacerHeight: minimum spacer height (default 50px)
- maxSpacerHeight: maximum spacer height (default 300px)
- threshold: visibility threshold (default 0.95 = 95%)
- debounceDelay: delay for optimization (default 100ms)
- animationDuration: animation duration (default 300ms)
- debug: debug mode (default false)
*/