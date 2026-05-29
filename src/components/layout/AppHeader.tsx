import { Group, Text, Badge, Tooltip } from '@mantine/core';
import { IconTerminal2, IconDatabase, IconDatabaseOff } from '@tabler/icons-react';
import { isMockSupabase } from '../../services/supabase';

export function AppHeader() {
  return (
    <header className="bg-terminal-panel border-b border-terminal-default py-3 px-6 select-none flex items-center justify-between">
      {/* Brand Logo & Version */}
      <Group gap="xs">
        <IconTerminal2 className="text-data-blue w-5 h-5 animate-pulse" />
        <Text className="font-mono text-base font-bold tracking-wider text-white">
          AI-TRANSIT <span className="text-data-blue font-sans font-light">ATME</span>
        </Text>
        <Badge size="xs" color="gray" variant="outline" className="font-mono text-[9px] border-terminal-default text-gray-400">
          v1.0.0
        </Badge>
      </Group>

      {/* Shortcuts & Quick Help Bar */}
      <Group gap="md">
        <Tooltip label="F9 / Ctrl + S" position="bottom" withArrow>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-terminal-base border border-terminal-default rounded cursor-help transition hover:border-data-blue/50">
            <span className="font-mono text-[10px] text-data-blue font-bold bg-data-blue/10 px-1.5 py-0.5 rounded border border-data-blue/20">F9</span>
            <Text size="xs" className="font-mono text-[11px] text-gray-400">Save & Print</Text>
          </div>
        </Tooltip>

        <Tooltip label="Press Enter on Weight Field or Tab on last cell" position="bottom" withArrow>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-terminal-base border border-terminal-default rounded cursor-help transition hover:border-data-blue/50">
            <span className="font-mono text-[10px] text-data-blue font-bold bg-data-blue/10 px-1.5 py-0.5 rounded border border-data-blue/20">Enter</span>
            <Text size="xs" className="font-mono text-[11px] text-gray-400">New Row</Text>
          </div>
        </Tooltip>

        <Tooltip label="Delete key on any row input" position="bottom" withArrow>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-terminal-base border border-terminal-default rounded cursor-help transition hover:border-data-blue/50">
            <span className="font-mono text-[10px] text-red-500 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">Delete</span>
            <Text size="xs" className="font-mono text-[11px] text-gray-400">Remove Row</Text>
          </div>
        </Tooltip>
      </Group>

      {/* Database Connection Status Indicator */}
      <Group gap="sm">
        {isMockSupabase ? (
          <Tooltip label="Using localStorage mock database because environment variables are not set" position="bottom">
            <Badge
              leftSection={<IconDatabaseOff className="w-3.5 h-3.5" />}
              color="yellow"
              variant="filled"
              size="sm"
              className="font-mono text-[10px] text-black"
            >
              MOCK MODE
            </Badge>
          </Tooltip>
        ) : (
          <Tooltip label="Connected directly to Supabase cloud database" position="bottom">
            <Badge
              leftSection={<IconDatabase className="w-3.5 h-3.5 animate-pulse" />}
              color="green"
              variant="filled"
              size="sm"
              className="font-mono text-[10px]"
            >
              SUPABASE CONNECTED
            </Badge>
          </Tooltip>
        )}
      </Group>
    </header>
  );
}
