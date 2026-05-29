import type React from 'react';
import { useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import type { Control, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { notifications } from '@mantine/notifications';
import { BiltiRow } from './BiltiRow';
import { focusCell } from '../../hooks/useKeyboardNav';
import { createEmptyBiltiRow, useBiltiStore } from '../../stores/biltiStore';
import { IconArrowBackUp } from '@tabler/icons-react';
import { Button } from '@mantine/core';

interface BiltiGridProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors?: any;
}

export function BiltiGrid({ control, register, setValue, errors }: BiltiGridProps) {
  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: 'biltis',
  });

  const { setBiltiRows } = useBiltiStore();

  // Sync rows count and weights to Zustand on change
  useEffect(() => {
    setBiltiRows(fields as any);
  }, [fields, setBiltiRows]);

  const handleDeleteRow = (index: number) => {
    const deletedRow = fields[index];
    
    // Perform deletion
    remove(index);

    // Show undo toast notification
    notifications.show({
      id: `delete-row-${index}-${Date.now()}`,
      title: 'Row Soft-Deleted',
      message: (
        <div className="flex flex-col gap-2 mt-1">
          <div>Bilti row #{index + 1} removed.</div>
          <Button
            size="xs"
            variant="outline"
            color="white"
            leftSection={<IconArrowBackUp className="w-3.5 h-3.5" />}
            onClick={() => {
              insert(index, deletedRow);
              notifications.clean();
            }}
            className="hover:bg-white/10 text-white border-white/20 font-mono text-[10px] w-fit mt-1"
          >
            UNDO
          </Button>
        </div>
      ),
      color: 'red',
      autoClose: 5000,
    });
  };

  const handleKeyDownCell = (
    rowIndex: number,
    fieldName: string,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // 1. Enter on Weight field -> append new row & focus its bilti_no
    if (e.key === 'Enter' && fieldName === 'weight_numeric') {
      e.preventDefault();
      append(createEmptyBiltiRow());
      focusCell(rowIndex + 1, 'bilti_no');
      return;
    }

    // 2. Tab on last cell (Weight) of last row -> append new row & focus its bilti_no
    if (
      e.key === 'Tab' &&
      !e.shiftKey &&
      fieldName === 'weight_numeric' &&
      rowIndex === fields.length - 1
    ) {
      e.preventDefault();
      append(createEmptyBiltiRow());
      focusCell(rowIndex + 1, 'bilti_no');
      return;
    }

    // 3. Ctrl + Delete -> Soft delete row
    if (e.key === 'Delete' && e.ctrlKey) {
      e.preventDefault();
      handleDeleteRow(rowIndex);
      // Focus previous row or next row if available
      const nextFocusRow = rowIndex > 0 ? rowIndex - 1 : 0;
      focusCell(nextFocusRow, 'bilti_no');
      return;
    }

    // 4. Delete key on empty field -> Soft delete row
    if (e.key === 'Delete' && (e.target as HTMLInputElement).value === '') {
      e.preventDefault();
      handleDeleteRow(rowIndex);
      const nextFocusRow = rowIndex > 0 ? rowIndex - 1 : 0;
      focusCell(nextFocusRow, 'bilti_no');
      return;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-terminal-base select-none">
      <table className="w-full border-collapse border-0 text-left">
        {/* Table Headers */}
        <thead className="bg-terminal-panel sticky top-0 z-10 shadow border-b border-terminal-default">
          <tr className="font-mono text-silver-dust text-[11px] uppercase tracking-wider select-none">
            <th className="py-3 px-3 text-center w-12 border-l-[3px] border-transparent">#</th>
            <th className="py-3 px-4 w-32">Bilti No</th>
            <th className="py-3 px-4">Customer Name</th>
            <th className="py-3 px-4">Receiver Name</th>
            <th className="py-3 px-4 w-44">Goods Type</th>
            <th className="py-3 px-4 w-28 text-right">Items</th>
            <th className="py-3 px-4 w-36 text-right">Weight (kg)</th>
            <th className="py-3 px-2 w-12"></th>
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody>
          {fields.map((field, idx) => (
            <BiltiRow
              key={field.id}
              index={idx}
              control={control}
              register={register}
              setValue={setValue}
              onDeleteRow={handleDeleteRow}
              onKeyDownCell={handleKeyDownCell}
              errors={errors?.biltis?.[idx]}
            />
          ))}
        </tbody>
      </table>
      
      {/* Visual Empty State */}
      {fields.length === 0 && (
        <div className="p-8 text-center text-gray-500 font-mono text-xs">
          No Bilti entries yet. Press <span className="text-data-blue font-bold">[Tab]</span> or click "Add Row" to begin.
        </div>
      )}
    </div>
  );
}
