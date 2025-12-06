/**
 * ValidationMessage Component
 * 
 * Displays validation error messages.
 * 
 * @module components/Forms/ValidationMessage
 */

import PropTypes from 'prop-types';

/**
 * Validation error message
 * 
 * @param {Object} props
 * @param {string} props.message - Error message
 * @param {string} [props.id] - Element ID for aria-describedby
 * @param {string} [props.className] - Additional CSS classes
 */
export function ValidationMessage({ message, id, className = '' }) {
  if (!message) return null;
  
  return (
    <p 
      id={id}
      className={`vasuzex-form-error ${className}`}
      role="alert"
      aria-live="polite"
    >
      <span className="vasuzex-form-error-icon">⚠</span>
      {message}
    </p>
  );
}

ValidationMessage.propTypes = {
  /** Error message to display */
  message: PropTypes.string,
  /** ID for aria-describedby linking */
  id: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Error alias (alternative to message) */
  error: PropTypes.string,
};

ValidationMessage.defaultProps = {
  message: null,
  error: null,
  id: null,
  className: '',
};
