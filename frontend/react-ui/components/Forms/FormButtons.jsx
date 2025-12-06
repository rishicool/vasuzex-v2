/**
 * FormButtons Component
 * 
 * Submit and cancel buttons for forms.
 * 
 * @module components/Forms/FormButtons
 */

import PropTypes from 'prop-types';

/**
 * Form action buttons
 * 
 * @param {Object} props
 * @param {Function} [props.onSubmit] - Submit callback
 * @param {Function} [props.onCancel] - Cancel callback
 * @param {string} [props.submitText='Submit'] - Submit button text
 * @param {string} [props.cancelText='Cancel'] - Cancel button text
 * @param {boolean} [props.loading=false] - Loading state
 * @param {boolean} [props.disabled=false] - Disable buttons
 * @param {string} [props.className] - Additional CSS classes
 */
export function FormButtons({
  onSubmit,
  onCancel,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  disabled = false,
  className = '',
}) {
  return (
    <div className={`vasuzex-form-buttons ${className}`}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled || loading}
          className="vasuzex-form-button vasuzex-form-button-cancel"
        >
          {cancelText}
        </button>
      )}
      
      {onSubmit && (
        <button
          type="submit"
          onClick={onSubmit}
          disabled={disabled || loading}
          className="vasuzex-form-button vasuzex-form-button-submit"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Loading...
            </>
          ) : (
            submitText
          )}
        </button>
      )}
    </div>
  );
}

FormButtons.propTypes = {
  /** Submit button click handler */
  onSubmit: PropTypes.func,
  /** Cancel button click handler */
  onCancel: PropTypes.func,
  /** Submit button text */
  submitText: PropTypes.string,
  /** Cancel button text */
  cancelText: PropTypes.string,
  /** Loading text during submission */
  loadingText: PropTypes.string,
  /** Show loading state */
  loading: PropTypes.bool,
  /** Disable both buttons */
  disabled: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

FormButtons.defaultProps = {
  onSubmit: null,
  onCancel: null,
  submitText: 'Submit',
  cancelText: 'Cancel',
  loadingText: 'Submitting...',
  loading: false,
  disabled: false,
  className: '',
};
