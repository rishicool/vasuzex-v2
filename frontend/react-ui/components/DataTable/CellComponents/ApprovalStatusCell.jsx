/**
 * ApprovalStatusCell Component
 * 
 * Reusable read-only status pill for approval workflows
 * Displays status with icon and soft background colors
 * 
 * @module components/DataTable/CellComponents
 */

import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: 'Pending',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
  approved: {
    icon: CheckCircle,
    label: 'Approved',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    bgClass: 'bg-rose-50 dark:bg-rose-950/30',
    textClass: 'text-rose-700 dark:text-rose-400',
  },
};

/**
 * ApprovalStatusCell - Professional status indicator
 * 
 * @param {Object} props
 * @param {string} props.status - Approval status: 'pending'|'approved'|'rejected'
 * @returns {JSX.Element}
 */
export function ApprovalStatusCell({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.bgClass} ${config.textClass}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

ApprovalStatusCell.propTypes = {
  status: PropTypes.oneOf(['pending', 'approved', 'rejected']).isRequired,
};

export default ApprovalStatusCell;
