import React, { useState, useRef, useEffect } from 'react';
import { useAutocomplete } from '../../hooks/useAutocomplete';
import clsx from 'clsx';

interface AutocompleteCellProps {
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  placeholder?: string;
  field?: string;
  onKeyDownCell?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  error?: boolean;
}

export function AutocompleteCell({
  value,
  onChange,
  suggestions,
  placeholder = '',
  field = '',
  onKeyDownCell,
  error = false,
}: AutocompleteCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search using the custom Hook
  const results = useAutocomplete(suggestions, value, 6);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isOpen && results.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % results.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          handleSelect(results[activeIndex].original);
        } else {
          // Select first if query not empty or close
          if (results[0]) {
            handleSelect(results[0].original);
          } else {
            setIsOpen(false);
          }
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        return;
      }
      if (e.key === 'Tab') {
        // If dropdown is open and there's a selection or match, select it, then proceed with Tab
        if (activeIndex >= 0 && activeIndex < results.length) {
          handleSelect(results[activeIndex].original);
        } else if (results.length > 0 && value.trim()) {
          // Auto select first match on Tab
          handleSelect(results[0].original);
        } else {
          setIsOpen(false);
        }
      }
    }

    // Call parent keydown handler for cell nav
    if (onKeyDownCell) {
      onKeyDownCell(e);
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full h-full">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        data-cell-field={field}
        onFocus={() => {
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        className={clsx(
          "w-full bg-transparent border-0 px-2 py-2 text-xs text-white focus:outline-none focus:bg-terminal-active focus:ring-1 focus:ring-data-blue/50 transition font-sans",
          error && "bg-red-500/10 text-red-200 border-l-2 border-red-500"
        )}
      />

      {/* Headless combobox dropdown list */}
      {isOpen && results.length > 0 && (
        <ul className="absolute left-0 top-[100%] w-full max-h-48 overflow-y-auto bg-terminal-panel border border-terminal-default rounded shadow-2xl z-50 py-1 select-none">
          {results.map((res, index) => (
            <li
              key={res.original + '-' + index}
              onClick={() => handleSelect(res.original)}
              onMouseEnter={() => setActiveIndex(index)}
              className={clsx(
                "px-3 py-1.5 text-xs font-mono cursor-pointer flex items-center justify-between transition",
                index === activeIndex
                  ? "bg-data-blue text-black font-semibold"
                  : "text-gray-300 hover:bg-terminal-active hover:text-white"
              )}
            >
              <span
                dangerouslySetInnerHTML={{ __html: res.highlightedHtml }}
                className="truncate"
              />
              <span className={clsx(
                "text-[9px] font-sans px-1 rounded uppercase tracking-wider",
                index === activeIndex ? "text-black bg-white/20 font-bold" : "text-data-blue bg-data-blue/10"
              )}>
                Match
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
