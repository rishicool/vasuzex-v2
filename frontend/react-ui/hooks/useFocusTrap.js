/**
 * useFocusTrap Hook
 * 
 * Trap focus within a container for modals and dialogs
 * @module hooks/useFocusTrap
 */

import { useEffect, useRef } from 'react';

/**
 * Hook to trap focus within a container
 * 
 * @param {boolean} isActive - Whether focus trap is active
 * @returns {Object} Ref to attach to container
 * 
 * @example
 * function Modal({ isOpen }) {
 *   const trapRef = useFocusTrap(isOpen);
 *   
 *   return (
 *     <div ref={trapRef} role="dialog">
 *       <button>Close</button>
 *       <input type="text" />
 *     </div>
 *   );
 * }
 */
export function useFocusTrap(isActive = true) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const previousActiveElement = document.activeElement;
    
    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    };
    
    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      
      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    // Focus first element on mount
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // Restore focus on unmount
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    };
  }, [isActive]);
  
  return containerRef;
}
