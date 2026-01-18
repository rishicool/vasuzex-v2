/**
 * RowActionsCell Component
 * 
 * Reusable actions cell with primary icons + overflow menu pattern
 * Follows modern admin dashboard design (Amazon Seller/Stripe/Blinkit)
 * 
 * @module components/DataTable/CellComponents
 */

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Eye, Edit2, MoreVertical, CheckCircle, XCircle, History, Power, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * RowActionsCell - Professional actions menu for data tables
 * 
 * @param {Object} props
 * @param {Object} props.row - Row data object
 * @param {Function} props.onView - View action handler
 * @param {Function} props.onEdit - Edit action handler (optional if editPath provided)
 * @param {string} props.editPath - Edit page path (will be passed to Link)
 * @param {Function} props.onToggle - Toggle status handler
 * @param {Function} props.onDelete - Delete action handler
 * @param {Function} props.onApprove - Approve action handler (approval workflows)
 * @param {Function} props.onReject - Reject action handler (approval workflows)
 * @param {Function} props.onViewHistory - View approval history handler
 * @param {boolean} props.hasApproval - Whether to show approval actions (default: false)
 * @returns {JSX.Element}
 */
export function RowActionsCell({
  row,
  onView,
  onEdit,
  editPath,
  onToggle,
  onDelete,
  onApprove,
  onReject,
  onViewHistory,
  hasApproval = false,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isPending = hasApproval && row.approval_status === 'pending';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  return (
    <div className="flex items-center gap-2">
      {/* Primary Actions - Always Visible */}
      <button
        onClick={() => onView(row)}
        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/30"
        title="View Details"
        aria-label="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>

      {editPath ? (
        <Link
          to={editPath}
          className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/30"
          title="Edit"
          aria-label="Edit"
        >
          <Edit2 className="h-4 w-4" />
        </Link>
      ) : (
        onEdit && (
          <button
            onClick={() => onEdit(row)}
            className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/30"
            title="Edit"
            aria-label="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        )
      )}

      {/* Overflow Menu - Secondary & Destructive Actions */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700"
          title="More Actions"
          aria-label="More Actions"
          aria-expanded={isMenuOpen}
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
            {/* Approval Actions - Only show when pending */}
            {hasApproval && isPending && (
              <>
                {onApprove && (
                  <button
                    onClick={() => {
                      onApprove(row);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                )}
                {onReject && (
                  <button
                    onClick={() => {
                      onReject(row);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                )}
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              </>
            )}

            {/* View History */}
            {hasApproval && onViewHistory && (
              <>
                <button
                  onClick={() => {
                    onViewHistory(row);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <History className="h-4 w-4" />
                  <span>View History</span>
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              </>
            )}

            {/* Toggle Status */}
            {onToggle && (
              <button
                onClick={() => {
                  onToggle(row);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Power className="h-4 w-4" />
                <div className="flex flex-col items-start">
                  <span>Toggle Status</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {row.is_active ? 'Deactivate' : 'Activate'}
                  </span>
                </div>
              </button>
            )}

            {/* Delete - Always last, always red */}
            {onDelete && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                <button
                  onClick={() => {
                    onDelete(row);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

RowActionsCell.propTypes = {
  row: PropTypes.object.isRequired,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  editPath: PropTypes.string,
  onToggle: PropTypes.func,
  onDelete: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  onViewHistory: PropTypes.func,
  hasApproval: PropTypes.bool,
};

export default RowActionsCell;
