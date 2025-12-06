/**
 * FormGroup Component
 * 
 * Groups related form fields together with optional title.
 * 
 * @module components/Forms/FormGroup
 */

import PropTypes from 'prop-types';

/**
 * Form group for organizing fields
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Form fields
 * @param {string} [props.title] - Group title
 * @param {string} [props.description] - Group description
 * @param {string} [props.className] - Additional CSS classes
 */
export function FormGroup({ 
  children, 
  title, 
  description, 
  className = '' 
}) {
  return (
    <div className={`vasuzex-form-group ${className}`}>
      {title && (
        <div className="vasuzex-form-group-header">
          <h3 className="vasuzex-form-group-title">{title}</h3>
          {description && (
            <p className="vasuzex-form-group-description">{description}</p>
          )}
        </div>
      )}
      <div className="vasuzex-form-group-content">
        {children}
      </div>
    </div>
  );
}

FormGroup.propTypes = {
  /** Form fields to group */
  children: PropTypes.node.isRequired,
  /** Group title */
  title: PropTypes.string,
  /** Group description */
  description: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
};

FormGroup.defaultProps = {
  title: null,
  description: null,
  className: '',
};
