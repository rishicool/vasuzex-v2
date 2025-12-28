/**
 * Autocomplete Component
 * 
 * An accessible autocomplete/typeahead component with async search support,
 * keyboard navigation, and customizable rendering.
 * 
 * @module components/Autocomplete
 */

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { useDebounce } from '../../hooks/useDebounce.js';

/**
 * Autocomplete component with async search
 * 
 * @param {Object} props
 * @param {Array|Function} props.options - Static options array or async function
 * @param {string} [props.value] - Selected value
 * @param {Function} props.onChange - Change callback (value, label, option)
 * @param {Function} [props.onSearch] - Async search callback
 * @param {string} [props.selectedLabel] - Display label for selected value
 * @param {string} [props.placeholder] - Input placeholder
 * @param {Function} [props.renderOption] - Custom option renderer
 * @param {Function} [props.getOptionLabel] - Get option display label
 * @param {Function} [props.getOptionValue] - Get option value
 * @param {number} [props.debounceMs=300] - Debounce delay for async search
 * @param {number} [props.minChars=0] - Minimum characters to trigger search
 * @param {boolean} [props.loading] - Loading state
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled] - Disable the input
 * @param {boolean} [props.error] - Error state
 * @param {string} [props.noResultsText] - No results message
 * @param {string} [props.name] - Input name attribute
 * @param {string} [props.id] - Input id attribute
 * 
 * @example
 * // With selectedLabel and onSearch
 * <Autocomplete
 *   value={brandId}
 *   selectedLabel={brandName}
 *   onChange={(val, label) => {
 *     setBrandId(val);
 *     setBrandName(label);
 *   }}
 *   onSearch={async (query) => {
 *     const brands = await brandService.search(query);
 *     return brands;
 *   }}
 *   options={brandOptions}
 *   placeholder="Search brands..."
 * />
 */
export const Autocomplete = memo(function Autocomplete({
  options = [],
  value = null,
  onChange,
  onSearch,
  selectedLabel,
  placeholder = 'Search...',
  renderOption,
  getOptionLabel = (option) => (typeof option === 'string' ? option : option.label || ''),
  getOptionValue = (option) => (typeof option === 'string' ? option : option.value || option.id || ''),
  debounceMs = 300,
  minChars = 0,
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [internalLoading, setInternalLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const lastSearchQuery = useRef(null);
  
  const debouncedInputValue = useDebounce(inputValue, debounceMs);
  const hasOnSearch = typeof onSearch === 'function';
  const isAsync = typeof options === 'function';
  const loading = externalLoading || internalLoading;
  
  // Determine what to show in the input
  const displayValue = isFocused ? inputValue : (selectedLabel || inputValue);
  
  /**
   * Load options (static or async)
   */
  const loadOptions = useCallback(async (query) => {
    // Always allow dropdown to open on focus
    if (query.length < minChars && minChars > 0) {
      setFilteredOptions([]);
      return;
    }
    
    // If onSearch is provided, use it
    if (hasOnSearch) {
      try {
        setInternalLoading(true);
        await onSearch(query);
        // Options will be updated via props and handled in separate useEffect
      } catch (error) {
        console.error('Autocomplete search error:', error);
        setFilteredOptions([]);
      } finally {
        setInternalLoading(false);
      }
      return;
    }
    
    if (isAsync) {
      try {
        setInternalLoading(true);
        const results = await options(query);
        setFilteredOptions(results || []);
      } catch (error) {
        console.error('Autocomplete search error:', error);
        setFilteredOptions([]);
      } finally {
        setInternalLoading(false);
      }
    } else {
      // Filter static options
      const filtered = options.filter(option => {
        const label = getOptionLabel(option).toLowerCase();
        return label.includes(query.toLowerCase());
      });
      setFilteredOptions(filtered);
    }
  }, [hasOnSearch, onSearch, isAsync, minChars, getOptionLabel]);
  
  /**
   * Effect: Load options when debounced input changes
   */
  useEffect(() => {
    if (isFocused && !hasOnSearch) {
      // Only auto-load for async functions or static filtering
      loadOptions(debouncedInputValue);
    }
  }, [debouncedInputValue, isFocused, loadOptions, hasOnSearch]);
  
  /**
   * Effect: For onSearch pattern, call it manually and update filtered options from props
   */
  useEffect(() => {
    if (hasOnSearch && isFocused) {
      // Prevent duplicate calls for the same query
      if (lastSearchQuery.current === debouncedInputValue) {
        return;
      }
      
      const callOnSearch = async () => {
        if (debouncedInputValue.length < minChars && minChars > 0) {
          setFilteredOptions([]);
          lastSearchQuery.current = debouncedInputValue;
          return;
        }
        
        try {
          setInternalLoading(true);
          lastSearchQuery.current = debouncedInputValue;
          await onSearch(debouncedInputValue);
        } catch (error) {
          console.error('Autocomplete search error:', error);
          setFilteredOptions([]);
        } finally {
          setInternalLoading(false);
        }
      };
      
      callOnSearch();
    }
  }, [debouncedInputValue, isFocused, hasOnSearch, onSearch, minChars]);
  
  /**
   * Effect: Update filtered options when options prop changes (for onSearch pattern)
   */
  useEffect(() => {
    if (hasOnSearch && options && Array.isArray(options)) {
      setFilteredOptions(options);
    }
  }, [hasOnSearch, options]);
  
  /**
   * Effect: Initialize input value from selected value
   */
  useEffect(() => {
    if (value) {
      const selectedOption = isAsync ? null : options.find(opt => getOptionValue(opt) === value);
      if (selectedOption) {
        setInputValue(getOptionLabel(selectedOption));
      }
    }
  }, [value, options, isAsync, getOptionLabel, getOptionValue]);
  
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
    // Clear input to allow searching when focused
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
              : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800'
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
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500"></div>
          </div>
        )}
      </div>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false);
              setInputValue('');
            }}
          />
          
          {/* Dropdown */}
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
                {loading ? 'Searching...' : minChars > 0 && inputValue.length < minChars ? `Type at least ${minChars} characters...` : noResultsText}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const label = getOptionLabel(option);
                const val = getOptionValue(option);
                const isSelected = val === value;
                const isHighlighted = highlightedIndex === index;
                
                return (
                  <li
                    key={val || index}
                    id={`${id}-option-${index}`}
                    className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                      isHighlighted
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                        : 'text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700'
                    } ${
                      isSelected ? 'font-medium' : ''
                    }`}
                    onClick={() => handleSelectOption(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {renderOption ? renderOption(option, isSelected) : label}
                  </li>
                );
              })
            )}
          </ul>
        </>
      )}
    </div>
  );
});

Autocomplete.propTypes = {
  /** Static options array or async fetch function */
  options: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.any),
    PropTypes.func,
  ]),
  /** Selected value */
  value: PropTypes.any,
  /** Change handler when option is selected (value, label, option) */
  onChange: PropTypes.func.isRequired,
  /** Async search callback */
  onSearch: PropTypes.func,
  /** Display label for selected value */
  selectedLabel: PropTypes.string,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Custom option renderer */
  renderOption: PropTypes.func,
  /** Function to extract label from option */
  getOptionLabel: PropTypes.func,
  /** Function to extract value from option */
  getOptionValue: PropTypes.func,
  /** Debounce delay in milliseconds */
  debounceMs: PropTypes.number,
  /** Minimum characters before search */
  minChars: PropTypes.number,
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

export default Autocomplete;
