import React from "react";


export function Switch({ checked, onChange, disabled = false, id, className = "" }) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`switch ${checked ? "switch--checked" : ""} ${
        disabled ? "switch--disabled" : ""
      } ${className}`}
    >
      <span className="switch__handle" />
    </button>
  );
}
