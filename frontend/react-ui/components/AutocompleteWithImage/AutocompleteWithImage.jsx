/**
 * Autocomplete With Image Component
 * 
 * An autocomplete component with image/icon support for options.
 * Useful for brands, products, users, etc. with avatars/logos.
 * 
 * @module components/AutocompleteWithImage
 */

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { useDebounce } from '../../hooks/useDebounce.js';

/**
 * Autocomplete component with image support
 * 
 * @param {Object} props
 * @param {Array} props.options - Options array
 * @param {string} [props.value] - Selected value
 * @param {Function} props.onChange - Change callback (value, label, option)
 * @param {Function} [props.onSearch] - Async search callback
 * @param {string} [props.selectedLabel] - Display label for selected value
 * @param {string} [props.placeholder] - Input placeholder
 * @param {Function} [props.getOptionLabel] - Get option display label
 * @param {Function} [props.getOptionValue] - Get option value
 * @param {Function} [props.getOptionImage] - Get option image URL
 * @param {Function} [props.getOptionSecondary] - Get option secondary text
 * @param {number} [props.debounceMs=300] - Debounce delay for async search
 * @param {boolean} [props.loading] - Loading state
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled] - Disable the input
 * @param {boolean} [props.error] - Error state
 * @param {string} [props.noResultsText] - No results message
 * @param {string} [props.name] - Input name attribute
 * @param {string} [props.id] - Input id attribute
 * 
 * @example
 * // Brand autocomplete with logos
 * <AutocompleteWithImage
 *   value={brandId}
 *   selectedLabel={brandName}
 *   onChange={(val, label) => {
 *     setBrandId(val);
 *     setBrandName(label);
 *   }}
 *   onSearch={fetchBrands}
 *   options={brandOptions}
 *   getOptionImage={(option) => option.logo_url}
 *   getOptionSecondary={(option) => `${option.products_count} products`}
 *   placeholder=\"Search brands...\"
 * />
 */
export const AutocompleteWithImage = memo(function AutocompleteWithImage({
  options = [],
  value = '',
  onChange,
  onSearch,
  selectedLabel,
  placeholder = 'Search...',
  getOptionLabel = (option) => option.label || option.name || '',
  getOptionValue = (option) => option.value || option.id || '',
  getOptionImage = (option) => option.image || option.image_url || option.icon_url || null,
  getOptionSecondary = () => null,
  debounceMs = 300,
  loading: externalLoading = false,
  className = '',
  disabled = false,
  error = false,
  noResultsText = 'No results found',
  name,
  id,
}) {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [internalLoading, setInternalLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const lastSearchQuery = useRef('');
  
  const debouncedInputValue = useDebounce(inputValue, debounceMs);
  const loading = externalLoading || internalLoading;
  
  // Determine what to show in the input
  const displayValue = isFocused ? inputValue : (selectedLabel || inputValue);
  
  /**
   * Load options
   */
  const loadOptions = useCallback(async (query) => {
    // Prevent duplicate API calls for same query
    if (lastSearchQuery.current === query) {
      return;
    }
    lastSearchQuery.current = query;
    
    if (onSearch) {
      try {
        setInternalLoading(true);
        await onSearch(query);
      } catch (error) {
        console.error('Autocomplete search error:', error);
      } finally {
        setInternalLoading(false);
      }
    }
  }, [onSearch]);
  
  /**
   * Effect: Load options when debounced input changes
   */
  useEffect(() => {
    if (isFocused) {
      loadOptions(debouncedInputValue);
    }
  }, [debouncedInputValue, isFocused, loadOptions]);
  
  /**
   * Effect: Update filtered options when options prop changes
   */
  useEffect(() => {
    if (onSearch) {
      // For async search, use options from parent state
      setFilteredOptions(options || []);
    } else {
      // For static options, filter locally
      const filtered = options.filter(option => {
        const label = getOptionLabel(option).toLowerCase();
        return label.includes(debouncedInputValue.toLowerCase());
      });
      setFilteredOptions(filtered);
    }
  }, [onSearch, options, debouncedInputValue, getOptionLabel]);
  
  /**
   * Effect: Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
    
    if (!newValue) {
      onChange('', '', null);
    }
  };
  
  /**
   * Handle input focus
   */
  const handleFocus = () => {
    setIsFocused(true);
    setIsOpen(true);
    if (selectedLabel && !inputValue) {
      setInputValue('');
    }
  };
  
  /**
   * Handle input blur
   */
  const handleBlur = () => {
    setIsFocused(false);
  };
  
  /**
   * Handle option selection
   */
  const handleSelectOption = (option) => {
    const label = getOptionLabel(option);
    const val = getOptionValue(option);
    
    setInputValue('');
    onChange(val, label, option);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setIsFocused(false);
  };
  
  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e) => {
    if (!isOpen || filteredOptions.length === 0) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        }
        break;
        
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
        
      default:
        break;
    }
  };
  
  /**
   * Scroll highlighted option into view
   */
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex]);
  
  return (
    <div 
      ref={wrapperRef}
      className={`relative ${className}`}
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs transition-colors focus:outline-none focus:ring-3 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:text-white/90 ${
            error
              ? 'border-red-500 focus:border-red-300 focus:ring-red-500/20 dark:border-red-500'
              : 'border-gray-300 focus:border-blue-300 focus:ring-blue-500/20 dark:border-gray-700 dark:focus:border-blue-800'
          }`}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          aria-activedescendant={
            highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined
          }
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
          </div>
        )}
      </div>
      
      {isOpen && (
          <ul
            ref={listRef}
            id={`${id}-listbox`}
            className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto overflow-x-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
            }}
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {loading ? 'Searching...' : noResultsText}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const label = getOptionLabel(option);
                const val = getOptionValue(option);
                const imageUrl = getOptionImage(option);
                const secondaryText = getOptionSecondary(option);
                const isSelected = val === value;
                const isHighlighted = highlightedIndex === index;
                
                return (
                  <li
                    key={val || index}
                    id={`${id}-option-${index}`}
                    className={`cursor-pointer px-3 py-2 transition-colors ${
                      isHighlighted
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700'
                    }`}
                    onMouseDown={(e) => {
                      console.log('[AutocompleteWithImage] List item mouseDown:', option.label);
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectOption(option);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-3">
                      {/* Image/Icon */}
                      {imageUrl && !failedImages.has(imageUrl) ? (
                        <img
                          src={imageUrl}
                          alt={label}
                          className="h-10 w-10 flex-shrink-0 rounded-md object-cover"
                          onError={() => {
                            setFailedImages(prev => new Set(prev).add(imageUrl));
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-300">
                            {label.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm truncate ${isSelected ? 'font-medium' : ''}`}>
                          {label}
                        </div>
                        {secondaryText && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {secondaryText}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>

      )}
    </div>
  );
});

AutocompleteWithImage.propTypes = {
  /** Options array */
  options: PropTypes.arrayOf(PropTypes.any),
  /** Selected value */
  value: PropTypes.any,
  /** Change handler (value, label, option) */
  onChange: PropTypes.func.isRequired,
  /** Async search callback */
  onSearch: PropTypes.func,
  /** Display label for selected value */
  selectedLabel: PropTypes.string,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Function to extract label from option */
  getOptionLabel: PropTypes.func,
  /** Function to extract value from option */
  getOptionValue: PropTypes.func,
  /** Function to extract image URL from option */
  getOptionImage: PropTypes.func,
  /** Function to extract secondary text from option */
  getOptionSecondary: PropTypes.func,
  /** Debounce delay in milliseconds */
  debounceMs: PropTypes.number,
  /** Show loading state */
  loading: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Disable the input */
  disabled: PropTypes.bool,
  /** Show error state */
  error: PropTypes.bool,
  /** No results message */
  noResultsText: PropTypes.string,
  /** Input name attribute */
  name: PropTypes.string,
  /** Input ID attribute */
  id: PropTypes.string,
};

export default AutocompleteWithImage;
