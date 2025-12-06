/**
 * useKeyboardNavigation Hook
 * 
 * Handle keyboard navigation in lists and menus
 * @module hooks/useKeyboardNavigation
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for keyboard navigation
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.itemCount - Total number of items
 * @param {Function} options.onSelect - Callback when item selected
 * @param {boolean} options.loop - Whether to loop at start/end
 * @returns {Object} Navigation state and handlers
 * 
 * @example
 * function Dropdown({ items }) {
 *   const { activeIndex, handleKeyDown } = useKeyboardNavigation({
 *     itemCount: items.length,
 *     onSelect: (index) => selectItem(items[index]),
 *     loop: true
 *   });
 *   
 *   return (
 *     <div onKeyDown={handleKeyDown}>
 *       {items.map((item, i) => (
 *         <div key={i} className={i === activeIndex ? 'active' : ''}>
 *           {item}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 */
export function useKeyboardNavigation({ itemCount, onSelect, loop = false, initialIndex = -1 } = {}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  
  const navigateNext = useCallback(() => {
    setActiveIndex(prev => {
      const next = prev + 1;
      if (next >= itemCount) {
        return loop ? 0 : prev;
      }
      return next;
    });
  }, [itemCount, loop]);
  
  const navigatePrevious = useCallback(() => {
    setActiveIndex(prev => {
      const next = prev - 1;
      if (next < 0) {
        return loop ? itemCount - 1 : 0;
      }
      return next;
    });
  }, [itemCount, loop]);
  
  const navigateToFirst = useCallback(() => {
    setActiveIndex(0);
  }, []);
  
  const navigateToLast = useCallback(() => {
    setActiveIndex(itemCount - 1);
  }, [itemCount]);
  
  const selectCurrent = useCallback(() => {
    if (activeIndex >= 0 && activeIndex < itemCount && onSelect) {
      onSelect(activeIndex);
    }
  }, [activeIndex, itemCount, onSelect]);
  
  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        navigateNext();
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        navigatePrevious();
        break;
      
      case 'Home':
        event.preventDefault();
        navigateToFirst();
        break;
      
      case 'End':
        event.preventDefault();
        navigateToLast();
        break;
      
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectCurrent();
        break;
      
      case 'Escape':
        event.preventDefault();
        setActiveIndex(-1);
        break;
      
      default:
        break;
    }
  }, [navigateNext, navigatePrevious, navigateToFirst, navigateToLast, selectCurrent]);
  
  const reset = useCallback(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);
  
  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    reset,
    navigateNext,
    navigatePrevious,
    navigateToFirst,
    navigateToLast,
    selectCurrent,
  };
}
