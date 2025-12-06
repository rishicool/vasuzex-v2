/**
 * useAnnouncer Hook
 * 
 * Announce messages to screen readers
 * @module hooks/useAnnouncer
 */

import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook to announce messages to screen readers
 * 
 * @returns {Function} announce function
 * 
 * @example
 * function DataTable() {
 *   const announce = useAnnouncer();
 *   
 *   const handleSort = (column) => {
 *     // Sort logic...
 *     announce(`Table sorted by ${column}`);
 *   };
 * }
 */
export function useAnnouncer() {
  const announcerRef = useRef(null);
  
  useEffect(() => {
    // Create announcer element
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    
    document.body.appendChild(announcer);
    announcerRef.current = announcer;
    
    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current);
      }
    };
  }, []);
  
  const announce = useCallback((message, priority = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);
  
  return announce;
}
