/**
 * SweetAlert2 Utilities
 * Consistent alert and confirmation dialogs for all apps
 */

import Swal from 'sweetalert2';

const BRAND_COLOR = '#00994C';
const DANGER_COLOR = '#d33';
const CANCEL_COLOR = '#6c757d';

/**
 * Show a success alert
 */
export const showSuccess = (title, text = '') => {
    return Swal.fire({
        icon: 'success',
        title,
        text,
        confirmButtonColor: BRAND_COLOR,
        confirmButtonText: 'OK',
    });
};

/**
 * Show an error alert
 */
export const showError = (title, text = '') => {
    return Swal.fire({
        icon: 'error',
        title,
        text,
        confirmButtonColor: BRAND_COLOR,
        confirmButtonText: 'OK',
    });
};

/**
 * Show an info alert
 */
export const showInfo = (title, text = '') => {
    return Swal.fire({
        icon: 'info',
        title,
        text,
        confirmButtonColor: BRAND_COLOR,
        confirmButtonText: 'OK',
    });
};

/**
 * Show a warning alert
 */
export const showWarning = (title, text = '') => {
    return Swal.fire({
        icon: 'warning',
        title,
        text,
        confirmButtonColor: BRAND_COLOR,
        confirmButtonText: 'OK',
    });
};

/**
 * Show a confirmation dialog
 * @returns {Promise<boolean>} - true if confirmed, false if cancelled
 */
export const showConfirm = async (title, text = '', confirmButtonText = 'Yes, proceed') => {
    const result = await Swal.fire({
        icon: 'question',
        title,
        text,
        showCancelButton: true,
        confirmButtonColor: BRAND_COLOR,
        cancelButtonColor: DANGER_COLOR,
        confirmButtonText,
        cancelButtonText: 'Cancel',
    });
    return result.isConfirmed;
};

/**
 * Show a delete confirmation dialog
 * @returns {Promise<boolean>} - true if confirmed, false if cancelled
 */
export const showDeleteConfirm = async (
    title = 'Are you sure?',
    text = 'This action cannot be undone'
) => {
    const result = await Swal.fire({
        icon: 'warning',
        title,
        text,
        showCancelButton: true,
        confirmButtonColor: DANGER_COLOR,
        cancelButtonColor: CANCEL_COLOR,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
    });
    return result.isConfirmed;
};

export default {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showConfirm,
    showDeleteConfirm,
};
