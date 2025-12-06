/**
 * FormField Component
 * 
 * A reusable form field with label, input, and validation message.
 * 
 * @module components/Forms/FormField
 */

import PropTypes from 'prop-types';
import { ValidationMessage } from './ValidationMessage.jsx';

/**
 * Form field with label and validation
 * 
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.name - Field name
 * @param {string} [props.type='text'] - Input type
 * @param {string|number} props.value - Field value
 * @param {Function} props.onChange - Change callback
 * @param {string} [props.error] - Validation error message
 * @param {boolean} [props.required] - Required field
 * @param {string} [props.placeholder] - Input placeholder
 * @param {boolean} [props.disabled] - Disable the field
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.helpText] - Help text below input
 * @param {Object} [props.inputProps] - Additional input props
 */
export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  className = '',
  helpText,
  inputProps = {},
}) {
  const id = inputProps.id || `field-${name}`;
  const hasError = !!error;
  
  return (
    <div className={`vasuzex-form-field ${className} ${hasError ? 'has-error' : ''}`}>
      <label htmlFor={id} className="vasuzex-form-label">
        {label}
        {required && <span className="vasuzex-form-required">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="vasuzex-form-textarea"
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : helpText ? `${id}-help` : undefined}
          {...inputProps}
        />
      ) : (
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="vasuzex-form-input"
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : helpText ? `${id}-help` : undefined}
          {...inputProps}
        />
      )}
      
      {helpText && !hasError && (
        <p id={`${id}-help`} className="vasuzex-form-help">
          {helpText}
        </p>
      )}
      
      {hasError && (
        <ValidationMessage id={`${id}-error`} message={error} />
      )}
    </div>
  );
}

FormField.propTypes = {
  /** Field label text */
  label: PropTypes.string.isRequired,
  /** Field name attribute */
  name: PropTypes.string.isRequired,
  /** Input type (text, email, password, number, textarea, etc.) */
  type: PropTypes.string,
  /** Field value */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Change handler */
  onChange: PropTypes.func.isRequired,
  /** Validation error message */
  error: PropTypes.string,
  /** Mark field as required */
  required: PropTypes.bool,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Disable the field */
  disabled: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Help text displayed below field */
  helpText: PropTypes.node,
  /** Additional props passed to input element */
  inputProps: PropTypes.object,
  /** Rows for textarea */
  rows: PropTypes.number,
};

FormField.defaultProps = {
  type: 'text',
  value: '',
  error: null,
  required: false,
  disabled: false,
  className: '',
  inputProps: {},
  rows: 4,
};
