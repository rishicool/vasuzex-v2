import { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook to preserve list page URL parameters when navigating to/from forms
 * 
 * For LIST pages: Automatically stores the current URL (with query params) whenever it changes
 * For FORM pages: Provides functions to navigate back to the stored URL
 * 
 * @param {string} listPath - Base path of the list page (e.g., '/brands')
 * @param {boolean} isListPage - Whether this is the list page (true) or form page (false)
 * @returns {Object} - { navigateToList, getListUrl, storeCurrentUrl }
 * 
 * @example
 * // In a list component
 * useListNavigation('/brands', true); // Auto-stores URL on changes
 * 
 * // In a form component
 * const { navigateToList, getListUrl } = useListNavigation('/brands', false);
 * 
 * // On save success or cancel
 * navigateToList();
 * 
 * // In breadcrumb
 * <BreadCrumb items={[
 *   { label: 'Brands', to: getListUrl() }
 * ]} />
 */
export function useListNavigation(listPath, isListPage = false) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Storage key for this list path
  const storageKey = `listReturn_${listPath}`;
  
  /**
   * Store current URL (called automatically on list pages)
   */
  const storeCurrentUrl = useCallback(() => {
    const searchParams = location.search || '';
    sessionStorage.setItem(storageKey, searchParams);
  }, [location.search, storageKey]);
  
  /**
   * Get the stored list URL with query params
   * @returns {string} - Full URL with query params, or base path if none stored
   */
  const getListUrl = useCallback(() => {
    const storedSearch = sessionStorage.getItem(storageKey);
    return storedSearch ? `${listPath}${storedSearch}` : listPath;
  }, [listPath, storageKey]);
  
  /**
   * Navigate back to list page with preserved query params
   */
  const navigateToList = useCallback(() => {
    const fullUrl = getListUrl();
    navigate(fullUrl);
    // Clear after navigation to prevent stale data
    sessionStorage.removeItem(storageKey);
  }, [navigate, getListUrl, storageKey]);
  
  // Auto-store URL on list pages whenever location changes
  useEffect(() => {
    if (isListPage && location.pathname === listPath) {
      storeCurrentUrl();
    }
  }, [isListPage, location.pathname, location.search, listPath, storeCurrentUrl]);
  
  return {
    navigateToList,
    getListUrl,
    storeCurrentUrl,
  };
}
