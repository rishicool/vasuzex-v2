/**
 * Tests for Form components
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormField } from '../../components/Forms/FormField.jsx';
import { FormGroup } from '../../components/Forms/FormGroup.jsx';
import { ValidationMessage } from '../../components/Forms/ValidationMessage.jsx';
import { FormButtons } from '../../components/Forms/FormButtons.jsx';

describe('FormField', () => {
  it('should render input field with label', () => {
    render(<FormField name="email" label="Email Address" />);

    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  });

  it('should handle value changes', () => {
    const onChange = vi.fn();
    render(<FormField name="email" label="Email" onChange={onChange} />);

    const input = screen.getByLabelText('Email');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    expect(onChange).toHaveBeenCalled();
  });

  it('should show validation error', () => {
    render(<FormField name="email" label="Email" error="Invalid email" />);

    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveClass('error');
  });

  it('should show required indicator', () => {
    render(<FormField name="email" label="Email" required />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should render textarea when type is textarea', () => {
    render(<FormField name="bio" label="Bio" type="textarea" />);

    const textarea = screen.getByLabelText('Bio');
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('should show help text', () => {
    render(<FormField name="password" label="Password" help="Must be at least 8 characters" />);

    expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
  });

  it('should handle disabled state', () => {
    render(<FormField name="email" label="Email" disabled />);

    expect(screen.getByLabelText('Email')).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<FormField name="email" label="Email" className="custom-field" />);

    const field = screen.getByLabelText('Email').closest('.form-field');
    expect(field).toHaveClass('custom-field');
  });
});

describe('FormGroup', () => {
  it('should render children', () => {
    render(
      <FormGroup>
        <FormField name="firstName" label="First Name" />
        <FormField name="lastName" label="Last Name" />
      </FormGroup>
    );

    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(
      <FormGroup title="Personal Information">
        <FormField name="name" label="Name" />
      </FormGroup>
    );

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(
      <FormGroup 
        title="Contact" 
        description="How can we reach you?"
      >
        <FormField name="email" label="Email" />
      </FormGroup>
    );

    expect(screen.getByText('How can we reach you?')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <FormGroup className="custom-group">
        <FormField name="test" label="Test" />
      </FormGroup>
    );

    expect(container.querySelector('.custom-group')).toBeInTheDocument();
  });
});

describe('ValidationMessage', () => {
  it('should render error message', () => {
    render(<ValidationMessage error="This field is required" />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should have error role', () => {
    render(<ValidationMessage error="Error message" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should not render when no error', () => {
    const { container } = render(<ValidationMessage error={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render error icon', () => {
    const { container } = render(<ValidationMessage error="Error" />);

    expect(container.querySelector('.error-icon')).toBeInTheDocument();
  });
});

describe('FormButtons', () => {
  it('should render submit button', () => {
    render(<FormButtons />);

    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('should render cancel button when onCancel provided', () => {
    const onCancel = vi.fn();
    render(<FormButtons onCancel={onCancel} />);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should call onSubmit when submit clicked', () => {
    const onSubmit = vi.fn();
    render(<FormButtons onSubmit={onSubmit} />);

    fireEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalled();
  });

  it('should call onCancel when cancel clicked', () => {
    const onCancel = vi.fn();
    render(<FormButtons onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalled();
  });

  it('should show loading state', () => {
    render(<FormButtons loading />);

    const submitButton = screen.getByText('Submitting...');
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should disable buttons when disabled', () => {
    const onCancel = vi.fn();
    render(<FormButtons disabled onCancel={onCancel} />);

    expect(screen.getByText('Submit')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
  });

  it('should render custom button text', () => {
    render(
      <FormButtons
        submitText="Save Changes"
        cancelText="Discard"
        onCancel={() => {}}
      />
    );

    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Discard')).toBeInTheDocument();
  });

  it('should render loading text', () => {
    render(<FormButtons loading loadingText="Saving..." />);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<FormButtons className="custom-buttons" />);

    expect(container.querySelector('.custom-buttons')).toBeInTheDocument();
  });
});
