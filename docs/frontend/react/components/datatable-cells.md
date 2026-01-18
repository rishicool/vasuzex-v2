# DataTable Cell Components

Reusable cell renderers for common patterns in DataTable columns.

## Overview

Vasuzex provides pre-built cell components that follow modern admin dashboard design patterns (Amazon Seller, Stripe, Blinkit). These components are designed to be used in DataTable column render functions.

## Components

### ApprovalStatusCell

A read-only status pill for approval workflows. Displays status with an icon and soft background colors.

#### Features

- Three built-in states: `pending`, `approved`, `rejected`
- Icon + label design
- Soft background colors (not harsh badges)
- Dark mode support
- Professional, operations-friendly appearance

#### Usage

```jsx
import { DataTable, ApprovalStatusCell } from 'vasuzex/react';

const columns = [
  {
    label: 'Approval Status',
    field: 'approval_status',
    render: (row) => <ApprovalStatusCell status={row.approval_status} />
  }
];
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `status` | `'pending'\|'approved'\|'rejected'` | Yes | Current approval status |

#### Status Configurations

**Pending**
- Icon: Clock (⏰)
- Color: Amber (yellow/orange)
- Label: "Pending"

**Approved**
- Icon: CheckCircle (✓)
- Color: Emerald (green)
- Label: "Approved"

**Rejected**
- Icon: XCircle (✗)
- Color: Rose (red)
- Label: "Rejected"

---

### RowActionsCell

A professional actions menu with primary icons and overflow menu pattern. Follows modern admin dashboard design with clear visual hierarchy.

#### Features

- **Primary Actions**: Always visible (View, Edit)
- **Overflow Menu**: Secondary and destructive actions (⋮)
- **Conditional Actions**: Approve/Reject only show when `status = 'pending'`
- **Clear Hierarchy**: Destructive actions (delete) are visually separated
- **Dark Mode**: Full dark mode support
- **Click Outside**: Menu closes when clicking outside
- **Accessible**: Proper ARIA labels and keyboard navigation

#### Design Pattern

```
[👁 View] [✏️ Edit] [⋮ More]
                      └─ Overflow Menu
                         ├─ ✓ Approve (if pending)
                         ├─ ✗ Reject (if pending)
                         ├─ ─────────────
                         ├─ 🕒 View History
                         ├─ ─────────────
                         ├─ ⚡ Toggle Status
                         ├─ ─────────────
                         └─ 🗑️ Delete (red)
```

#### Usage

```jsx
import { DataTable, RowActionsCell } from 'vasuzex/react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

function StoresList() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleViewStore = (row) => {
    // Show details modal
    window.dispatchEvent(new CustomEvent('showStoreDetailsModal', { detail: row }));
  };

  const handleToggleStatus = async (row) => {
    await api.patch(endpoints.stores.toggleStatus(row.id));
    setRefreshKey(prev => prev + 1);
    toast.success('Status updated');
  };

  const handleDeleteStore = async (row) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete "${row.name}"?`,
      icon: 'warning',
      showCancelButton: true,
    });
    if (isConfirmed) {
      await api.delete(endpoints.stores.delete(row.id));
      setRefreshKey(prev => prev + 1);
      toast.success('Deleted');
    }
  };

  const handleApprove = async (row) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Approve?',
      input: 'textarea',
      inputLabel: 'Reason (optional)',
      showCancelButton: true,
    });
    if (isConfirmed) {
      await api.patch(endpoints.stores.approve(row.id), { reason });
      setRefreshKey(prev => prev + 1);
      toast.success('Approved');
    }
  };

  const handleReject = async (row) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Reject?',
      input: 'textarea',
      inputLabel: 'Reason (required)',
      showCancelButton: true,
      inputValidator: (value) => !value.trim() && 'Reason is required',
    });
    if (isConfirmed && reason) {
      await api.patch(endpoints.stores.reject(row.id), { reason });
      setRefreshKey(prev => prev + 1);
      toast.success('Rejected');
    }
  };

  const handleViewHistory = async (row) => {
    const response = await api.get(endpoints.stores.getApprovalHistory(row.id));
    // Show history modal
    setApprovalHistory(response.data);
    setShowHistoryModal(true);
  };

  const columns = [
    // ... other columns
    {
      label: 'Actions',
      field: 'actions',
      render: (row) => (
        <RowActionsCell
          row={row}
          onView={handleViewStore}
          editPath={`/stores/edit/${row.id}`}
          onToggle={handleToggleStatus}
          onDelete={handleDeleteStore}
          onApprove={handleApprove}
          onReject={handleReject}
          onViewHistory={handleViewHistory}
          hasApproval={true}
        />
      )
    }
  ];

  return <DataTable api={api} refreshSignal={refreshKey} columns={columns} />;
}
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `row` | `object` | Yes | Row data object |
| `onView` | `function` | No | View details handler |
| `onEdit` | `function` | No* | Edit handler (if no editPath) |
| `editPath` | `string` | No* | Edit page path (uses React Router Link) |
| `onToggle` | `function` | No | Toggle active status handler |
| `onDelete` | `function` | No | Delete handler |
| `onApprove` | `function` | No** | Approve handler (approval workflows) |
| `onReject` | `function` | No** | Reject handler (approval workflows) |
| `onViewHistory` | `function` | No** | View approval history handler |
| `hasApproval` | `boolean` | No | Show approval actions (default: false) |

\* Provide either `onEdit` or `editPath`, not both  
\*\* Only shown when `hasApproval={true}`

#### Action Groups

**Primary Actions (Always Visible)**
- **View** (Eye icon): Show details modal/page
- **Edit** (Edit2 icon): Navigate to edit page or trigger edit handler

**Approval Actions (Pending Only)**
- **Approve** (CheckCircle, emerald): Only visible when `row.approval_status === 'pending'`
- **Reject** (XCircle, rose): Only visible when `row.approval_status === 'pending'`

**Secondary Actions**
- **View History** (History icon): Show approval history modal
- **Toggle Status** (Power icon): Activate/deactivate with clear label

**Destructive Actions**
- **Delete** (Trash2, red): Always last, visually separated, requires confirmation

## Design Philosophy

### Professional & Calm

- Soft colors, not harsh badges
- Clear visual hierarchy
- No visual noise
- Operations-friendly (not marketing-flashy)

### Single Responsibility

- **Status column**: Read-only information
- **Actions column**: Interactive operations
- Never mix status and actions in one column

### Action Hierarchy

1. **Primary**: Always visible, most common (view, edit)
2. **Secondary**: In overflow menu, less frequent (history, toggle)
3. **Approval**: In overflow menu, only when pending
4. **Destructive**: Last, red, separated (delete)

### Conditional Display

- Approve/Reject: Only show when `status === 'pending'`
- Don't show actions user doesn't have permission for (pass undefined handler)
- No action? Don't render that button

## Examples

### Minimal Setup (View + Edit Only)

```jsx
<RowActionsCell
  row={row}
  onView={handleView}
  editPath={`/items/edit/${row.id}`}
/>
```

### With Toggle & Delete

```jsx
<RowActionsCell
  row={row}
  onView={handleView}
  editPath={`/items/edit/${row.id}`}
  onToggle={handleToggle}
  onDelete={handleDelete}
/>
```

### Full Approval Workflow

```jsx
<RowActionsCell
  row={row}
  onView={handleView}
  editPath={`/stores/edit/${row.id}`}
  onToggle={handleToggle}
  onDelete={handleDelete}
  onApprove={handleApprove}
  onReject={handleReject}
  onViewHistory={handleViewHistory}
  hasApproval={true}
/>
```

### Custom Edit Handler (No React Router)

```jsx
<RowActionsCell
  row={row}
  onView={handleView}
  onEdit={(row) => openEditModal(row)}
  onDelete={handleDelete}
/>
```

## Integration with DataTable

These cell components are designed to work seamlessly with the DataTable component:

```jsx
import { DataTable, ApprovalStatusCell, RowActionsCell } from 'vasuzex/react';

const columns = [
  {
    label: 'Name',
    field: 'name',
    sortable: true,
  },
  {
    label: 'Approval Status',
    field: 'approval_status',
    sortable: true,
    render: (row) => <ApprovalStatusCell status={row.approval_status} />
  },
  {
    label: 'Actions',
    field: 'actions',
    searchable: false,
    sortable: false,
    render: (row) => (
      <RowActionsCell
        row={row}
        onView={handleView}
        editPath={`/items/edit/${row.id}`}
        onToggle={handleToggle}
        onDelete={handleDelete}
        hasApproval={true}
        onApprove={handleApprove}
        onReject={handleReject}
        onViewHistory={handleViewHistory}
      />
    )
  }
];

<DataTable
  api={api}
  refreshSignal={refreshKey}
  columns={columns}
  apiUrl="/api/items"
/>
```

## Styling

Both components use Tailwind CSS classes and support dark mode out of the box. No custom CSS required.

### Customizing Colors

If you need different colors, extend the components:

```jsx
// CustomStatusCell.jsx
import { ApprovalStatusCell } from 'vasuzex/react';

const CUSTOM_STATUS_CONFIG = {
  draft: {
    icon: FileText,
    label: 'Draft',
    bgClass: 'bg-gray-50 dark:bg-gray-950/30',
    textClass: 'text-gray-700 dark:text-gray-400',
  },
  // ... more statuses
};

export function CustomStatusCell({ status }) {
  // Your custom implementation
}
```

## Dependencies

- `lucide-react` - Icons (installed in vasuzex)
- `react-router-dom` - For Link component (if using editPath)
- Tailwind CSS - For styling

## See Also

- [DataTable Component](./data-table.md)
- [Approval Workflows Guide](../../guides/approval-workflows.md)
- [Action Patterns Guide](../../guides/action-patterns.md)
