import { useEffect } from 'react';

interface GlobalShortcutProps {
  onSavePrint: () => void;
}

export function useGlobalKeyboardShortcuts({ onSavePrint }: GlobalShortcutProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F9
      if (e.key === 'F9') {
        e.preventDefault();
        onSavePrint();
      }
      
      // Ctrl + S (or Cmd + S)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSavePrint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSavePrint]);
}

/**
 * Focuses an input cell programmatically based on row index and field name.
 */
export function focusCell(rowIndex: number, fieldName: string) {
  setTimeout(() => {
    const selector = `[data-row-id="${rowIndex}"] [data-cell-field="${fieldName}"] input, [data-row-id="${rowIndex}"] [data-cell-field="${fieldName}"] select`;
    const element = document.querySelector(selector) as HTMLInputElement | HTMLSelectElement | null;
    if (element) {
      element.focus();
      if ('select' in element && typeof element.select === 'function') {
        element.select(); // Highlight content for fast overwrite
      }
    }
  }, 10);
}
