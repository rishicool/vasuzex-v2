# Accessibility Guide

## Overview

The Vasuzex React UI library is built with accessibility (a11y) as a core principle. All components follow WCAG 2.1 Level AA standards and include comprehensive ARIA attributes, keyboard navigation, and screen reader support.

## Key Features

### 1. Keyboard Navigation

All interactive components support full keyboard navigation:

- **Arrow Keys**: Navigate through lists, tables, and options
- **Enter/Space**: Activate buttons and select items
- **Tab**: Move between focusable elements
- **Escape**: Close modals, dropdowns, and clear selections
- **Home/End**: Jump to first/last item in lists

### 2. Screen Reader Support

- Semantic HTML elements used throughout
- Proper ARIA labels and descriptions
- Live regions for dynamic content announcements
- Meaningful alt text for images
- Descriptive button and link text

### 3. Focus Management

- Visible focus indicators on all interactive elements
- Focus trapping in modals and dialogs
- Focus restoration when closing overlays
- Skip links for navigation

### 4. Color and Contrast

- WCAG AA compliant color contrast ratios
- Multiple visual indicators (not just color)
- Support for high contrast mode
- Customizable theme colors

### 5. Motion and Animation

- Respects `prefers-reduced-motion` setting
- Optional animations that can be disabled
- No automatic scrolling or carousels

## Component-Specific Accessibility

### DataTable

**Keyboard Navigation:**
- `Tab`: Navigate to table
- `Arrow Keys`: Navigate between cells
- `Enter`: Activate sort on header cells
- `Space`: Toggle row selection

**Screen Reader:**
- `role="table"` for proper table semantics
- `aria-sort` on sortable columns
- `aria-label` on action buttons
- Row count announcements

**Example:**
```jsx
<DataTable
  columns={columns}
  data={data}
  ariaLabel="User list table"
  ariaDescribedBy="table-description"
/>
```

### Autocomplete

**Keyboard Navigation:**
- `Arrow Down/Up`: Navigate options
- `Enter`: Select highlighted option
- `Escape`: Close dropdown
- `Home/End`: Jump to first/last option

**Screen Reader:**
- `role="combobox"` with `aria-expanded`
- `role="listbox"` for options
- `aria-activedescendant` for highlighted option
- Result count announcements

**Example:**
```jsx
<Autocomplete
  options={options}
  ariaLabel="Search users"
  ariaDescribedBy="search-help"
  announceResults={(count) => `${count} results found`}
/>
```

### Forms

**Keyboard Navigation:**
- `Tab`: Move between fields
- Standard form controls (text, checkbox, radio, etc.)

**Screen Reader:**
- Proper `<label>` associations
- `aria-invalid` on validation errors
- `aria-describedby` for help text and errors
- `aria-required` for required fields

**Example:**
```jsx
<FormField
  name="email"
  label="Email Address"
  type="email"
  required
  error={errors.email}
  helpText="We'll never share your email"
  aria-describedby="email-help"
/>
```

### PhotoManager

**Keyboard Navigation:**
- `Tab`: Focus on upload button
- `Enter/Space`: Open file picker
- `Delete`: Remove selected photo

**Screen Reader:**
- Upload status announcements
- Photo count updates
- Error announcements
- Descriptive labels for all controls

**Example:**
```jsx
<PhotoManager
  photos={photos}
  onPhotosChange={setPhotos}
  ariaLabel="Upload product photos"
  announceUpload={(filename) => `${filename} uploaded successfully`}
/>
```

## Accessibility Hooks

### useFocusTrap

Trap focus within a container (for modals/dialogs):

```jsx
import { useFocusTrap } from '@vasuzex/react/hooks';

function Modal({ isOpen, onClose }) {
  const trapRef = useFocusTrap(isOpen);
  
  return (
    <div ref={trapRef} role="dialog" aria-modal="true">
      <h2>Modal Title</h2>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

### useAnnouncer

Announce messages to screen readers:

```jsx
import { useAnnouncer } from '@vasuzex/react/hooks';

function MyComponent() {
  const announce = useAnnouncer();
  
  const handleSave = () => {
    // Save logic...
    announce('Changes saved successfully');
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

### useKeyboardNavigation

Handle keyboard navigation in lists:

```jsx
import { useKeyboardNavigation } from '@vasuzex/react/hooks';

function Menu({ items }) {
  const { activeIndex, handleKeyDown } = useKeyboardNavigation({
    itemCount: items.length,
    onSelect: (index) => selectItem(items[index]),
    loop: true
  });
  
  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, i) => (
        <li
          key={i}
          role="menuitem"
          className={i === activeIndex ? 'active' : ''}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

## Accessibility Utilities

### Screen Reader Only Text

```jsx
<span className="sr-only">
  Additional context for screen readers
</span>
```

### Skip Links

```jsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

### Announce Function

```jsx
import { announceToScreenReader } from '@vasuzex/react/utils/accessibility';

announceToScreenReader('Table sorted by name', 'polite');
```

## Testing for Accessibility

### Manual Testing

1. **Keyboard Only**: Navigate entire app using only keyboard
2. **Screen Reader**: Test with NVDA, JAWS, or VoiceOver
3. **Zoom**: Test at 200% zoom level
4. **High Contrast**: Enable high contrast mode
5. **Color Blindness**: Use color blindness simulators

### Automated Testing

```bash
# Run accessibility tests
pnpm test:a11y

# Check WCAG compliance
pnpm lint:a11y
```

### Tools

- **axe DevTools**: Browser extension for accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Automated accessibility audits
- **Pa11y**: Command-line accessibility testing

## Common Patterns

### Modal Dialog

```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-description">Are you sure?</p>
  <button onClick={onConfirm}>Yes</button>
  <button onClick={onCancel}>No</button>
</div>
```

### Loading State

```jsx
<div aria-busy="true" aria-live="polite">
  <span className="sr-only">Loading data...</span>
  <LoadingSpinner />
</div>
```

### Error Messages

```jsx
<div role="alert" aria-live="assertive">
  <span className="sr-only">Error:</span>
  {errorMessage}
</div>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Resources](https://webaim.org/resources/)

## Support

For accessibility issues or questions:
- GitHub Issues: Report bugs or request features
- Documentation: Check component-specific docs
- Examples: See working examples in `/examples` directory
