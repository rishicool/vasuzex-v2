/**
 * SweetAlert2 Utilities
 * Consistent alert and confirmation dialogs for all apps
 * 
 * @module @vasuzex/react/utils/swal
 */

import Swal from 'sweetalert2';

const BRAND_COLOR = '#00994C';
const DANGER_COLOR = '#d33';
const CANCEL_COLOR = '#6c757d';

/**
 * Show a success alert
 * @param {string} title - Alert title
 * @param {string} [text=''] - Alert message
 * @returns {Promise} SweetAlert2 promise
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
 * @param {string} title - Alert title
 * @param {string} [text=''] - Alert message
 * @returns {Promise} SweetAlert2 promise
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
 * @param {string} title - Alert title
 * @param {string} [text=''] - Alert message
 * @returns {Promise} SweetAlert2 promise
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
 * @param {string} title - Alert title
 * @param {string} [text=''] - Alert message
 * @returns {Promise} SweetAlert2 promise
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
 * @param {string} title - Confirmation title
 * @param {string} [text=''] - Confirmation message
 * @param {string} [confirmButtonText='Yes, proceed'] - Confirm button text
 * @returns {Promise<boolean>} true if confirmed, false if cancelled
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
 * @param {string} [title='Are you sure?'] - Confirmation title
 * @param {string} [text='This action cannot be undone'] - Confirmation message
 * @returns {Promise<boolean>} true if confirmed, false if cancelled
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

/**
 * Convenience object with all SweetAlert2 utilities
 */
const swal = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showConfirm,
    showDeleteConfirm,
};

export default swal;
