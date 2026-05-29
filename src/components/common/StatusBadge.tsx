import { Badge } from '@mantine/core';

interface StatusBadgeProps {
  status: 'saved' | 'printed' | 'pending' | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = (status || 'saved').toLowerCase();
  let color = 'green';
  if (s === 'printed') color = 'blue';
  if (s === 'pending') color = 'yellow';

  return (
    <Badge color={color} variant="light" size="xs" style={{ textTransform: 'uppercase' }}>
      {s}
    </Badge>
  );
}
