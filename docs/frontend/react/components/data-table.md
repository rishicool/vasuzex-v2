# DataTable Component

A comprehensive, accessible data table component with sorting, filtering, pagination, and CRUD operations.

## Features

- ✅ Sortable columns
- ✅ Filterable columns  
- ✅ Pagination with configurable page sizes
- ✅ Row selection (single or multiple)
- ✅ Built-in CRUD actions (Edit, Delete, View)
- ✅ Custom cell rendering
- ✅ Server-side mode support
- ✅ Loading and empty states
- ✅ Fully accessible (WCAG 2.1 AA)
- ✅ Keyboard navigation

## Installation

```bash
npm install @vasuzex/react
```

## Basic Usage

```jsx
import { DataTable } from '@vasuzex/react/components/DataTable';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'email', label: 'Email', filterable: true },
  { key: 'status', label: 'Status' },
];

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
];

function MyComponent() {
  return (
    <DataTable
      columns={columns}
      data={data}
    />
  );
}
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `columns` | `Array<Column>` | Column definitions |
| `data` | `Array<Object>` | Data rows to display |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sortable` | `boolean` | `true` | Enable sorting |
| `filterable` | `boolean` | `false` | Enable filtering |
| `paginated` | `boolean` | `true` | Enable pagination |
| `selectable` | `boolean` | `false` | Enable row selection |
| `pageSize` | `number` | `10` | Rows per page |
| `pageSizeOptions` | `number[]` | `[5,10,20,50,100]` | Page size options |
| `actions` | `Object` | `{}` | Enable CRUD actions |
| `loading` | `boolean` | `false` | Show loading state |
| `emptyMessage` | `string` | `'No data available'` | Empty state message |
| `serverSide` | `boolean` | `false` | Server-side mode |
| `totalRows` | `number` | - | Total rows (server-side) |
| `className` | `string` | `''` | Additional CSS classes |

### Column Definition

```typescript
interface Column {
  key: string;           // Data key
  label: string;         // Column header
  sortable?: boolean;    // Enable sorting
  filterable?: boolean;  // Enable filtering
  width?: string;        // Column width (CSS)
  render?: (row: Object, value: any) => React.ReactNode; // Custom renderer
}
```

### Actions Configuration

```typescript
interface Actions {
  edit?: boolean;        // Show edit button
  delete?: boolean;      // Show delete button
  view?: boolean;        // Show view button
  custom?: Array<{       // Custom actions
    label: string;
    icon?: string;
    onClick: (row: Object) => void;
  }>;
}
```

## Examples

### With Sorting and Filtering

```jsx
<DataTable
  columns={[
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'email', label: 'Email', filterable: true },
  ]}
  data={users}
  sortable
  filterable
/>
```

### With Row Selection

```jsx
function MyComponent() {
  const [selected, setSelected] = useState([]);

  return (
    <DataTable
      columns={columns}
      data={data}
      selectable
      selectedRows={selected}
      onSelectionChange={setSelected}
    />
  );
}
```

### With CRUD Actions

```jsx
<DataTable
  columns={columns}
  data={data}
  actions={{
    edit: true,
    delete: true,
    view: true,
  }}
  onEdit={(row) => console.log('Edit:', row)}
  onDelete={(row) => console.log('Delete:', row)}
  onView={(row) => console.log('View:', row)}
/>
```

### With Custom Cell Rendering

```jsx
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  {
    key: 'status',
    label: 'Status',
    render: (row, value) => (
      <span className={`badge badge-${value.toLowerCase()}`}>
        {value}
      </span>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    render: (row) => (
      <button onClick={() => handleCustomAction(row)}>
        Custom Action
      </button>
    ),
  },
];

<DataTable columns={columns} data={data} />
```

### Server-Side Mode

```jsx
function ServerSideTable() {
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async (page, pageSize, sortKey, sortDir, filters) => {
    setLoading(true);
    const params = new URLSearchParams({
      page,
      pageSize,
      sortKey,
      sortDir,
      ...filters,
    });
    
    const res = await fetch(`/api/users?${params}`);
    const result = await res.json();
    
    setData(result.data);
    setTotalRows(result.total);
    setLoading(false);
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      serverSide
      totalRows={totalRows}
      loading={loading}
      onPageChange={(page, pageSize) => fetchData(page, pageSize)}
      onSortChange={(key, direction) => fetchData(1, 10, key, direction)}
      onFilterChange={(filters) => fetchData(1, 10, null, null, filters)}
    />
  );
}
```

### With Custom Actions

```jsx
<DataTable
  columns={columns}
  data={data}
  actions={{
    custom: [
      {
        label: 'Approve',
        icon: '✓',
        onClick: (row) => approveUser(row),
      },
      {
        label: 'Reject',
        icon: '✗',
        onClick: (row) => rejectUser(row),
      },
    ],
  }}
/>
```

## Event Handlers

| Event | Parameters | Description |
|-------|-----------|-------------|
| `onSelectionChange` | `(selected: Array)` | Row selection changes |
| `onEdit` | `(row: Object)` | Edit button clicked |
| `onDelete` | `(row: Object)` | Delete button clicked |
| `onView` | `(row: Object)` | View button clicked |
| `onPageChange` | `(page: number, pageSize: number)` | Page changed |
| `onSortChange` | `(key: string, direction: 'asc'\|'desc')` | Sort changed |
| `onFilterChange` | `(filters: Object)` | Filters changed |

## Keyboard Navigation

- `Tab` - Navigate to/from table
- `Arrow Keys` - Navigate between cells (when focused)
- `Enter/Space` - Toggle row selection
- `Click` - Sort columns (on headers)

## Accessibility

The DataTable component is fully accessible:

- `role="table"` semantic HTML
- `aria-sort` on sortable columns
- `aria-label` on action buttons
- Keyboard navigation support
- Screen reader announcements
- High contrast mode support

## Styling

### CSS Classes

```css
/* Table container */
.vasuzex-datatable { }

/* Table header */
.vasuzex-datatable-header { }
.vasuzex-datatable-header-cell { }
.vasuzex-datatable-header-cell.sortable { }
.vasuzex-datatable-header-cell.sorted { }

/* Table body */
.vasuzex-datatable-body { }
.vasuzex-datatable-row { }
.vasuzex-datatable-row:hover { }
.vasuzex-datatable-row.selected { }
.vasuzex-datatable-cell { }

/* Actions */
.vasuzex-datatable-actions { }
.vasuzex-datatable-action-button { }

/* Pagination */
.vasuzex-datatable-pagination { }
.vasuzex-datatable-page-button { }
.vasuzex-datatable-page-size-select { }

/* States */
.vasuzex-datatable-loading { }
.vasuzex-datatable-empty { }
```

### Custom Styling

```jsx
<DataTable
  columns={columns}
  data={data}
  className="my-custom-table"
  style={{
    '--table-border-color': '#e0e0e0',
    '--table-header-bg': '#f5f5f5',
    '--table-row-hover': '#f9f9f9',
  }}
/>
```

## Performance Tips

1. **Use `memo`** - Wrap in React.memo for large datasets
2. **Server-side mode** - For datasets > 1000 rows
3. **Custom rendering** - Keep render functions simple
4. **Pagination** - Reduce page size for faster rendering
5. **Filtering** - Debounce filter inputs

## TypeScript

```typescript
import { DataTable, DataTableProps, Column } from '@vasuzex/react/components/DataTable';

const columns: Column[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
];

interface User {
  id: number;
  name: string;
  email: string;
}

const data: User[] = [...];

<DataTable<User>
  columns={columns}
  data={data}
/>
```

## See Also

- [Pagination Component](../Pagination)
- [Filters Component](../Filters)
- [TableActions Component](../TableActions)
