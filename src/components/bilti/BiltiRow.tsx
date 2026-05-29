import type React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import type { Control, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconTrash, IconSparkles } from '@tabler/icons-react';
import { CellInput } from './CellInput';
import { AutocompleteCell } from './AutocompleteCell';
import { useCementRule } from '../../hooks/useCementRule';
import { useBiltiStore } from '../../stores/biltiStore';
import clsx from 'clsx';

interface BiltiRowProps {
  index: number;
  control: Control<any>;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  onDeleteRow: (index: number) => void;
  onKeyDownCell: (rowIndex: number, fieldName: string, e: React.KeyboardEvent<HTMLInputElement>) => void;
  errors?: any;
}

export function BiltiRow({
  index,
  control,
  register,
  setValue,
  onDeleteRow,
  onKeyDownCell,
  errors,
}: BiltiRowProps) {
  // Watch values for styling
  const isAutoCalculated = useWatch({
    control,
    name: `biltis.${index}.weight_auto_calculated` as const,
  });

  const { customersMaster, receiversMaster } = useBiltiStore();
  const customerNames = customersMaster;
  const receiverNames = receiversMaster.map((r) => r.name);

  // Hook for smart auto-filling of weights (e.g. cement = 50 * items)
  useCementRule({ control, index, setValue });

  return (
    <tr
      data-row-id={index}
      className={clsx(
        "border-b border-terminal-default transition group relative",
        index % 2 === 0 ? "bg-terminal-rowEven" : "bg-terminal-rowOdd",
        "hover:bg-terminal-active focus-within:bg-terminal-active"
      )}
    >
      {/* Row Number Column with styling hooks */}
      <td
        className={clsx(
          "px-3 py-2 text-center text-xs font-mono select-none font-bold text-gray-500",
          "group-focus-within:text-data-blue group-hover:text-data-blue",
          "border-l-[3px] transition-all duration-150",
          isAutoCalculated 
             ? "border-[#2d54bf]" 
             : "border-transparent",
          "group-focus-within:border-data-blue"
        )}
      >
        {index + 1}
      </td>

      {/* Bilti No */}
      <td className="p-0">
        <CellInput
          {...register(`biltis.${index}.bilti_no` as const)}
          placeholder="e.g. B-0041"
          monospace
          field="bilti_no"
          onKeyDown={(e) => onKeyDownCell(index, 'bilti_no', e)}
          error={!!errors?.bilti_no}
        />
      </td>

      {/* Customer Name */}
      <td className="p-0">
        <Controller
          control={control}
          name={`biltis.${index}.customer_name` as const}
          render={({ field: { value, onChange } }) => (
            <AutocompleteCell
              value={value}
              onChange={onChange}
              suggestions={customerNames}
              placeholder="Start typing customer..."
              field="customer_name"
              onKeyDownCell={(e) => onKeyDownCell(index, 'customer_name', e)}
              error={!!errors?.customer_name}
            />
          )}
        />
      </td>

      {/* Receiver Name */}
      <td className="p-0">
        <Controller
          control={control}
          name={`biltis.${index}.receiver_name` as const}
          render={({ field: { value, onChange } }) => (
            <AutocompleteCell
              value={value}
              onChange={onChange}
              suggestions={receiverNames}
              placeholder="Start typing receiver..."
              field="receiver_name"
              onKeyDownCell={(e) => onKeyDownCell(index, 'receiver_name', e)}
              error={!!errors?.receiver_name}
            />
          )}
        />
      </td>

      {/* Goods Type */}
      <td className="p-0">
        <CellInput
          {...register(`biltis.${index}.goods_type` as const)}
          placeholder="e.g. Cement, Sugar..."
          field="goods_type"
          onKeyDown={(e) => onKeyDownCell(index, 'goods_type', e)}
          error={!!errors?.goods_type}
        />
      </td>

      {/* Items Count */}
      <td className="p-0">
        <CellInput
          {...register(`biltis.${index}.items_count` as const)}
          type="number"
          placeholder="0"
          monospace
          field="items_count"
          onKeyDown={(e) => onKeyDownCell(index, 'items_count', e)}
          error={!!errors?.items_count}
        />
      </td>

      {/* Weight Numeric */}
      <td className="p-0 relative">
        <CellInput
          {...register(`biltis.${index}.weight_numeric` as const)}
          type="number"
          step="0.01"
          placeholder="0.00"
          monospace
          field="weight_numeric"
          onChange={(e) => {
            setValue(`biltis.${index}.weight_numeric`, e.target.value, { shouldValidate: true, shouldDirty: true });
            // Manual edit breaks the auto-calculation tag
            setValue(`biltis.${index}.weight_auto_calculated`, false);
          }}
          onKeyDown={(e) => onKeyDownCell(index, 'weight_numeric', e)}
          className={clsx(
            isAutoCalculated && "text-data-blue font-bold"
          )}
          error={!!errors?.weight_numeric}
        />
        {isAutoCalculated && (
          <div className="absolute right-2 top-[30%] pointer-events-none select-none flex items-center gap-0.5 text-[9px] text-data-blue/80 font-mono italic">
            <IconSparkles className="w-2.5 h-2.5" />
            <span>(auto)</span>
          </div>
        )}
      </td>

      {/* Delete Row Hover Button */}
      <td className="px-2 py-0 w-10 text-center">
        <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <Tooltip label="Delete Row" position="left" withArrow color="red">
            <ActionIcon
              size="sm"
              color="red"
              variant="subtle"
              onClick={() => onDeleteRow(index)}
              className="hover:bg-red-500/20 text-red-400"
            >
              <IconTrash className="w-3.5 h-3.5" />
            </ActionIcon>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
}
