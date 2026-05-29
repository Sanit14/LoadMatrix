import React, { forwardRef } from 'react';
import clsx from 'clsx';

interface CellInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  monospace?: boolean;
  field?: string;
}

export const CellInput = forwardRef<HTMLInputElement, CellInputProps>(
  ({ error, monospace = false, className, field, ...props }, ref) => {
    return (
      <input
        ref={ref}
        data-cell-field={field}
        className={clsx(
          "w-full bg-transparent border-0 px-2 py-2 text-xs text-white focus:outline-none focus:bg-terminal-active focus:ring-1 focus:ring-data-blue/50 transition",
          monospace ? "font-mono" : "font-sans",
          error && "bg-red-500/10 text-red-200 border-l-2 border-red-500",
          className
        )}
        {...props}
      />
    );
  }
);

CellInput.displayName = 'CellInput';
