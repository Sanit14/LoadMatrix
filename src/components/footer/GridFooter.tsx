import { Group, Text, Badge } from '@mantine/core';
import { IconFileInvoice, IconHash, IconScale } from '@tabler/icons-react';
import { formatWeight } from '../../utils/formatters';

interface GridFooterProps {
  biltiCount: number;
  totalItems: number;
  totalWeight: number;
}

export function GridFooter({ biltiCount, totalItems, totalWeight }: GridFooterProps) {
  return (
    <div className="bg-terminal-panel border-t border-terminal-default py-2 px-6 select-none sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-mono text-gray-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-data-blue animate-pulse" />
          Live Calculations
        </div>
        
        <Group gap="xl">
          {/* Bilti Count (Green) */}
          <Group gap="xs">
            <IconFileInvoice className="w-4 h-4 text-success" />
            <Text size="xs" className="font-sans font-medium text-gray-400">
              Bilti Count:
            </Text>
            <Badge
              color="green"
              variant="filled"
              radius="sm"
              className="font-mono text-xs px-2.5 py-1 text-white bg-success font-semibold"
            >
              {biltiCount}
            </Badge>
          </Group>

          {/* Total Items (Blue/Info) */}
          <Group gap="xs">
            <IconHash className="w-4 h-4 text-info" />
            <Text size="xs" className="font-sans font-medium text-gray-400">
              Total Items:
            </Text>
            <Badge
              color="blue"
              variant="filled"
              radius="sm"
              className="font-mono text-xs px-2.5 py-1 text-white bg-info font-semibold"
            >
              {totalItems}
            </Badge>
          </Group>

          {/* Total Weight (Data Blue) */}
          <Group gap="xs">
            <IconScale className="w-4 h-4 text-data-blue" />
            <Text size="xs" className="font-sans font-medium text-gray-400">
              Total Weight:
            </Text>
            <Badge
              color="dataBlue"
              variant="filled"
              radius="sm"
              className="font-mono text-xs px-2.5 py-1 text-black bg-data-blue font-bold"
            >
              {formatWeight(totalWeight)}
            </Badge>
          </Group>
        </Group>
      </div>
    </div>
  );
}
