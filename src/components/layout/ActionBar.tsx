import { Group, Button } from '@mantine/core';
import { IconPlus, IconRefresh, IconPrinter } from '@tabler/icons-react';

interface ActionBarProps {
  onAddRow: () => void;
  onReset: () => void;
  onSavePrint: () => void;
  isSubmitting?: boolean;
}

export function ActionBar({ onAddRow, onReset, onSavePrint, isSubmitting = false }: ActionBarProps) {
  return (
    <div className="bg-terminal-panel border-t border-terminal-default p-4 select-none flex items-center justify-between">
      <Group gap="sm">
        {/* Reset Canvas Button */}
        <Button
          leftSection={<IconRefresh className="w-4 h-4" />}
          variant="outline"
          color="red"
          onClick={onReset}
          className="font-mono text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
        >
          Reset Session
        </Button>
      </Group>

      <Group gap="sm">
        {/* Add Row Button */}
        <Button
          leftSection={<IconPlus className="w-4 h-4" />}
          variant="outline"
          color="gray"
          onClick={onAddRow}
          className="font-mono text-xs border-terminal-default text-gray-300 hover:border-data-blue/50 hover:bg-terminal-base transition"
        >
          Add Row <span className="text-[10px] text-gray-500 ml-1.5 font-bold">[Tab]</span>
        </Button>

        {/* Save & Print Manifest Button */}
        <Button
          leftSection={<IconPrinter className="w-4 h-4" />}
          onClick={onSavePrint}
          loading={isSubmitting}
          style={{ backgroundColor: '#ffffff', color: '#0a0a0a', border: 0 }}
          className="font-mono text-xs font-bold hover:bg-silver-dust transition"
        >
          Save & Print Manifest <span className="text-[10px] text-black/70 ml-1.5 font-extrabold">[F9]</span>
        </Button>
      </Group>
    </div>
  );
}
