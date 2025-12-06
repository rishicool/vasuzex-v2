/**
 * Accessibility Utilities
 * 
 * Helper functions for improving component accessibility
 * @module utils/accessibility
 */

/**
 * Generate unique IDs for ARIA labels
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
let idCounter = 0;
export function generateId(prefix = 'vasuzex') {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

/**
 * Announce to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Handle keyboard navigation for lists
 * @param {KeyboardEvent} event - Keyboard event
 * @param {number} currentIndex - Current focused index
 * @param {number} maxIndex - Maximum index
 * @param {Function} onSelect - Callback when item selected
 * @returns {number} New index
 */
export function handleListNavigation(event, currentIndex, maxIndex, onSelect) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      return Math.min(currentIndex + 1, maxIndex);
    
    case 'ArrowUp':
      event.preventDefault();
      return Math.max(currentIndex - 1, 0);
    
    case 'Home':
      event.preventDefault();
      return 0;
    
    case 'End':
      event.preventDefault();
      return maxIndex;
    
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (onSelect) onSelect(currentIndex);
      return currentIndex;
    
    default:
      return currentIndex;
  }
}

/**
 * Trap focus within a container
 * @param {HTMLElement} container - Container element
 * @param {KeyboardEvent} event - Keyboard event
 */
export function trapFocus(container, event) {
  if (event.key !== 'Tab') return;
  
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

/**
 * Get accessible label for form field
 * @param {string} name - Field name
 * @param {string} label - Field label
 * @returns {Object} ARIA attributes
 */
export function getFieldAriaProps(name, label, error, help) {
  const describedBy = [];
  
  if (error) describedBy.push(`${name}-error`);
  if (help) describedBy.push(`${name}-help`);
  
  return {
    'aria-label': label,
    'aria-invalid': !!error,
    'aria-describedby': describedBy.length > 0 ? describedBy.join(' ') : undefined,
  };
}

/**
 * Check if element is visible to screen readers
 * @param {HTMLElement} element - Element to check
 * @returns {boolean}
 */
export function isVisibleToScreenReader(element) {
  return !(
    element.hasAttribute('aria-hidden') ||
    element.style.display === 'none' ||
    element.style.visibility === 'hidden' ||
    element.classList.contains('sr-only')
  );
}
