/**
 * Tests for DataTable component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { DataTable } from '../../components/DataTable/DataTable.jsx';

describe('DataTable', () => {
  const mockColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'email', label: 'Email', filterable: true },
    { key: 'status', label: 'Status' },
  ];

  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' },
  ];

  it('should render table with data', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should render column headers', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('should sort data when clicking sortable column', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1]; // Skip header row
    
    expect(within(firstDataRow).getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should toggle sort direction', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    const nameHeader = screen.getByText('Name');
    
    // First click - ascending
    fireEvent.click(nameHeader);
    let rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByText('Bob Johnson')).toBeInTheDocument();

    // Second click - descending
    fireEvent.click(nameHeader);
    rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByText('John Doe')).toBeInTheDocument();
  });

  it('should filter data', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    const nameFilter = screen.getByPlaceholderText('Filter Name...');
    fireEvent.change(nameFilter, { target: { value: 'Jane' } });

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('should paginate data', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      status: 'Active',
    }));

    render(<DataTable columns={mockColumns} data={largeData} pageSize={10} />);

    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.queryByText('User 15')).not.toBeInTheDocument();

    const nextButton = screen.getByLabelText('Next page');
    fireEvent.click(nextButton);

    expect(screen.queryByText('User 1')).not.toBeInTheDocument();
    expect(screen.getByText('User 15')).toBeInTheDocument();
  });

  it('should select rows', () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        selectable
        onSelectionChange={onSelectionChange}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // First data row

    expect(onSelectionChange).toHaveBeenCalledWith([mockData[0]]);
  });

  it('should select all rows', () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        selectable
        onSelectionChange={onSelectionChange}
      />
    );

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);

    expect(onSelectionChange).toHaveBeenCalledWith(mockData);
  });

  it('should call onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        actions={{ edit: true, delete: false }}
        onEdit={onEdit}
      />
    );

    const editButtons = screen.getAllByLabelText(/Edit/);
    fireEvent.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledWith(mockData[0]);
  });

  it('should call onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        actions={{ edit: false, delete: true }}
        onDelete={onDelete}
      />
    );

    const deleteButtons = screen.getAllByLabelText(/Delete/);
    fireEvent.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith(mockData[0]);
  });

  it('should show loading state', () => {
    render(<DataTable columns={mockColumns} data={[]} loading />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show empty state', () => {
    render(<DataTable columns={mockColumns} data={[]} />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should render custom cell content', () => {
    const customColumns = [
      {
        key: 'status',
        label: 'Status',
        render: (row) => (
          <span className={`status-${row.status.toLowerCase()}`}>
            {row.status}
          </span>
        ),
      },
    ];

    render(<DataTable columns={customColumns} data={mockData} />);

    expect(screen.getByText('Active')).toHaveClass('status-active');
  });

  it('should change page size', () => {
    const largeData = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      status: 'Active',
    }));

    render(<DataTable columns={mockColumns} data={largeData} pageSize={10} />);

    const pageSizeSelect = screen.getByLabelText('Rows per page:');
    fireEvent.change(pageSizeSelect, { target: { value: '20' } });

    expect(screen.getByText('User 15')).toBeInTheDocument();
  });

  it('should handle server-side mode', () => {
    const onPageChange = vi.fn();
    const onSortChange = vi.fn();
    const onFilterChange = vi.fn();

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        serverSide
        totalRows={100}
        onPageChange={onPageChange}
        onSortChange={onSortChange}
        onFilterChange={onFilterChange}
      />
    );

    // Test pagination callback
    const nextButton = screen.getByLabelText('Next page');
    fireEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(2, 10);

    // Test sort callback
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    expect(onSortChange).toHaveBeenCalledWith('name', 'asc');

    // Test filter callback
    const nameFilter = screen.getByPlaceholderText('Filter Name...');
    fireEvent.change(nameFilter, { target: { value: 'test' } });
    
    // Filter is debounced, so we need to wait
    setTimeout(() => {
      expect(onFilterChange).toHaveBeenCalled();
    }, 300);
  });
});
