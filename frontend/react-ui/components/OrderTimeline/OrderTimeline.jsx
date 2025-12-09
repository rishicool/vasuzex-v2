import {
    FiPackage,
    FiCheckCircle,
    FiClock,
    FiTruck,
    FiHome,
    FiXCircle,
    FiUser,
    FiShield,
    FiShoppingBag
} from 'react-icons/fi';

/**
 * Format date and time for display
 */
const formatDateTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };

    return date.toLocaleDateString('en-IN', options);
};

/**
 * OrderTimeline Component
 * Displays order status history in a vertical timeline format
 * Shows who made the change, when, and any notes
 */
export const OrderTimeline = ({ statusHistory = [], compact = false }) => {
    if (!statusHistory || statusHistory.length === 0) {
        return (
            <div className="text-sm text-gray-500 text-center py-4">
                No status history available
            </div>
        );
    }

    // Sort by timestamp descending (newest first)
    const sortedHistory = [...statusHistory].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    return (
        <div className="space-y-4">
            {sortedHistory.map((entry, index) => (
                <TimelineEntry
                    key={entry._id || index}
                    entry={entry}
                    isFirst={index === 0}
                    isLast={index === sortedHistory.length - 1}
                    compact={compact}
                />
            ))}
        </div>
    );
};

/**
 * Individual timeline entry
 */
const TimelineEntry = ({ entry, isFirst, isLast, compact }) => {
    const { status, updatedBy, updatedByType, notes, timestamp } = entry;

    // Get status icon and color
    const statusConfig = getStatusConfig(status);
    const Icon = statusConfig.icon;

    // Get user icon based on type
    const UserIcon = getUserIcon(updatedByType);

    return (
        <div className="flex gap-3">
            {/* Timeline line and icon */}
            <div className="flex flex-col items-center">
                {/* Icon */}
                <div
                    className={`
            flex items-center justify-center
            w-8 h-8 rounded-full
            ${statusConfig.bgColor} ${statusConfig.iconColor}
            flex-shrink-0
          `}
                >
                    <Icon className="w-4 h-4" />
                </div>

                {/* Vertical line */}
                {!isLast && (
                    <div className="w-0.5 h-full min-h-[32px] bg-gray-200 mt-1" />
                )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${!isLast ? 'pb-4' : ''}`}>
                {/* Status and time */}
                <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                        <span className={`font-medium ${statusConfig.textColor}`}>
                            {formatStatusLabel(status)}
                        </span>
                        {isFirst && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                Current
                            </span>
                        )}
                    </div>
                    {!compact && timestamp && (
                        <span className="text-xs text-gray-500">
                            {formatDateTime(timestamp)}
                        </span>
                    )}
                </div>

                {/* Timestamp for compact mode */}
                {compact && timestamp && (
                    <div className="text-xs text-gray-500 mb-1">
                        {formatDateTime(timestamp)}
                    </div>
                )}                {/* User info */}
                {updatedBy && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>
                            {updatedBy.name || updatedBy.email || 'Unknown'}
                        </span>
                        {updatedByType && (
                            <span className="text-xs text-gray-400">
                                ({formatUserType(updatedByType)})
                            </span>
                        )}
                    </div>
                )}

                {/* System update (no user) */}
                {!updatedBy && updatedByType === 'system' && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                        <FiClock className="w-3.5 h-3.5" />
                        <span className="text-xs text-gray-500">System</span>
                    </div>
                )}

                {/* Notes */}
                {notes && (
                    <div className="text-sm text-gray-600 bg-gray-50 rounded px-2 py-1 mt-1">
                        {notes}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Get status configuration (icon, colors)
 */
const getStatusConfig = (status) => {
    const configs = {
        placed: {
            icon: FiPackage,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-700',
        },
        confirmed: {
            icon: FiCheckCircle,
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
            textColor: 'text-green-700',
        },
        preparing: {
            icon: FiClock,
            bgColor: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            textColor: 'text-yellow-700',
        },
        ready: {
            icon: FiCheckCircle,
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600',
            textColor: 'text-purple-700',
        },
        out_for_delivery: {
            icon: FiTruck,
            bgColor: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
            textColor: 'text-indigo-700',
        },
        picked: {
            icon: FiTruck,
            bgColor: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
            textColor: 'text-indigo-700',
        },
        delivered: {
            icon: FiHome,
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
            textColor: 'text-green-700',
        },
        cancelled: {
            icon: FiXCircle,
            bgColor: 'bg-red-100',
            iconColor: 'text-red-600',
            textColor: 'text-red-700',
        },
    };

    return configs[status] || {
        icon: FiPackage,
        bgColor: 'bg-gray-100',
        iconColor: 'text-gray-600',
        textColor: 'text-gray-700',
    };
};

/**
 * Get user icon based on type
 */
const getUserIcon = (userType) => {
    const icons = {
        customer: FiUser,
        admin: FiShield,
        store: FiShoppingBag,
        delivery_partner: FiTruck,
        system: FiClock,
    };

    return icons[userType] || FiUser;
};

/**
 * Format status for display
 */
const formatStatusLabel = (status) => {
    const labels = {
        placed: 'Order Placed',
        confirmed: 'Confirmed',
        preparing: 'Preparing',
        ready: 'Ready for Pickup',
        out_for_delivery: 'Out for Delivery',
        picked: 'Out for Delivery',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
    };

    return labels[status] || status;
};

/**
 * Format user type for display
 */
const formatUserType = (userType) => {
    const labels = {
        customer: 'Customer',
        admin: 'Admin',
        store: 'Store',
        delivery_partner: 'Delivery Partner',
        system: 'System',
    };

    return labels[userType] || userType;
};
