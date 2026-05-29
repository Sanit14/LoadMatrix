import { Badge } from '@mantine/core';

interface RoleBadgeProps {
  role: 'clerk' | 'supervisor' | string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const isSupervisor = role === 'supervisor';
  return (
    <Badge color={isSupervisor ? 'violet' : 'teal'} variant="light" size="xs">
      {isSupervisor ? 'Supervisor' : 'Clerk'}
    </Badge>
  );
}
