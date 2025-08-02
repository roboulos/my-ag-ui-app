"use client"

import * as React from "react"

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onCheckedChange, id, className = "", disabled = false }, ref) => {
    return (
      <button
        id={id}
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={`
          inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent 
          transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 
          focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
          ${checked 
            ? 'bg-purple-600 dark:bg-purple-500' 
            : 'bg-gray-200 dark:bg-gray-700'
          }
          ${className}
        `}
      >
        <span
          className={`
            pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch }