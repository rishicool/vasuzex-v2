import React from "react";
import { Link } from "react-router-dom";

/**
 * BreadCrumb Component - Production Ready
 * 
 * Page header with title, breadcrumb navigation, and optional action button
 * 
 * @module components/BreadCrumb
 */

const ChevronRightIcon = (props) => (
  <svg
    width="17"
    height="16"
    viewBox="0 0 17 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M6.5 12L10.5 8L6.5 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const BreadCrumb = ({ title, addLink, addLabel, addIcon, items }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
      <nav className="mt-1">
        <ol className="flex items-center gap-1.5">
          {items.map((item, idx) => (
            <li key={idx} className="inline-flex items-center gap-1.5">
              {item.to ? (
                <Link 
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" 
                  to={item.to}
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-sm text-gray-900 dark:text-white">{item.label}</span>
              )}
              {idx < items.length - 1 && (
                <ChevronRightIcon className="stroke-current text-gray-400" />
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
    {addLink && (
      <Link
        to={addLink}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm text-white shadow-theme-xs hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 transition-colors"
      >
        {addIcon && <span className="flex items-center text-white">{addIcon}</span>}
        {addLabel}
      </Link>
    )}
  </div>
);

export default BreadCrumb;
