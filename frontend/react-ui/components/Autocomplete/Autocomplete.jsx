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
 * @param {Function} props.onChange - Change callback
 * @param {string} [props.placeholder] - Input placeholder
 * @param {Function} [props.renderOption] - Custom option renderer
 * @param {Function} [props.getOptionLabel] - Get option display label
 * @param {Function} [props.getOptionValue] - Get option value
 * @param {number} [props.debounceMs=300] - Debounce delay for async search
 * @param {number} [props.minChars=2] - Minimum characters to trigger search
 * @param {boolean} [props.loading] - Loading state
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled] - Disable the input
 * @param {string} [props.name] - Input name attribute
 * @param {string} [props.id] - Input id attribute
 * 
 * @example
 * // Static options
 * <Autocomplete
 *   options={['Apple', 'Banana', 'Cherry']}
 *   value={selectedFruit}
 *   onChange={setSelectedFruit}
 *   placeholder="Select a fruit..."
 * />
 * 
 * @example
 * // Async options
 * <Autocomplete
 *   options={async (query) => {
 *     const res = await fetch(`/api/search?q=${query}`);
 *     return res.json();
 *   }}
 *   getOptionLabel={(option) => option.name}
 *   getOptionValue={(option) => option.id}
 *   value={selected}
 *   onChange={setSelected}
 * />
 */
export const Autocomplete = memo(function Autocomplete({
  options,
  value = '',
  onChange,
  placeholder = 'Search...',
  renderOption,
  getOptionLabel = (option) => typeof option === 'string' ? option : option.label,
  getOptionValue = (option) => typeof option === 'string' ? option : option.value,
  debounceMs = 300,
  minChars = 2,
  loading: externalLoading = false,
  className = '',
  disabled = false,
  name,
  id,
}) {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [internalLoading, setInternalLoading] = useState(false);
  
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  
  const debouncedInputValue = useDebounce(inputValue, debounceMs);
  const isAsync = typeof options === 'function';
  const loading = externalLoading || internalLoading;
  
  /**
   * Load options (static or async)
   */
  const loadOptions = useCallback(async (query) => {
    if (isAsync) {
      if (query.length < minChars) {
        setFilteredOptions([]);
        return;
      }
      
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
      if (query.length < minChars) {
        setFilteredOptions([]);
        return;
      }
      
      const filtered = options.filter(option => {
        const label = getOptionLabel(option).toLowerCase();
        return label.includes(query.toLowerCase());
      });
      setFilteredOptions(filtered);
    }
  }, [isAsync, options, minChars, getOptionLabel]);
  
  /**
   * Effect: Load options when debounced input changes
   */
  useEffect(() => {
    if (debouncedInputValue) {
      loadOptions(debouncedInputValue);
    } else {
      setFilteredOptions([]);
    }
  }, [debouncedInputValue, loadOptions]);
  
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
      onChange('');
    }
  };
  
  /**
   * Handle option selection
   */
  const handleSelectOption = (option) => {
    const label = getOptionLabel(option);
    const val = getOptionValue(option);
    
    setInputValue(label);
    onChange(val, option);
    setIsOpen(false);
    setHighlightedIndex(-1);
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
      className={`vasuzex-autocomplete ${className} ${disabled ? 'disabled' : ''}`}
    >
      <div className="vasuzex-autocomplete-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="vasuzex-autocomplete-input"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          aria-activedescendant={
            highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined
          }
        />
        {loading && (
          <div className="vasuzex-autocomplete-spinner">
            <div className="spinner"></div>
          </div>
        )}
      </div>
      
      {isOpen && (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          className="vasuzex-autocomplete-dropdown"
          role="listbox"
        >
          {filteredOptions.length === 0 ? (
            <li className="vasuzex-autocomplete-no-results">
              {inputValue.length < minChars
                ? `Type at least ${minChars} characters...`
                : loading
                ? 'Searching...'
                : 'No results found'}
            </li>
          ) : (
            filteredOptions.map((option, index) => {
              const label = getOptionLabel(option);
              const val = getOptionValue(option);
              
              return (
                <li
                  key={val || index}
                  id={`${id}-option-${index}`}
                  className={`vasuzex-autocomplete-option ${
                    highlightedIndex === index ? 'highlighted' : ''
                  }`}
                  onClick={() => handleSelectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  role="option"
                  aria-selected={highlightedIndex === index}
                >
                  {renderOption ? renderOption(option, label) : label}
                </li>
              );
            })
          )}
        </ul>
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
  /** Change handler when option is selected */
  onChange: PropTypes.func.isRequired,
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
  /** Input name attribute */
  name: PropTypes.string,
  /** Input ID attribute */
  id: PropTypes.string,
  /** Show clear button */
  clearable: PropTypes.bool,
  /** Async fetch function for options */
  fetchOptions: PropTypes.func,
};

Autocomplete.defaultProps = {
  options: [],
  value: null,
  placeholder: 'Search...',
  debounceMs: 300,
  minChars: 1,
  loading: false,
  disabled: false,
  className: '',
  clearable: false,
  getOptionLabel: (option) => (typeof option === 'string' ? option : option.label || ''),
  getOptionValue: (option) => (typeof option === 'string' ? option : option.value || option.id || ''),
};

export default Autocomplete;
