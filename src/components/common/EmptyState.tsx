import { Center, Paper, Text, Button, Box } from '@mantine/core';
import { IconTruck } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  description: string;
  actionLabel?: string;
  actionRoute?: string;
}

export function EmptyState({ title = 'No Data Found', description, actionLabel, actionRoute }: EmptyStateProps) {
  return (
    <Center style={{ flex: 1, padding: '40px' }}>
      <Paper
        p="xl"
        radius="md"
        style={{
          backgroundColor: '#141414',
          border: '1px solid #313131',
          textAlign: 'center',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box style={{ color: '#6798ff', display: 'inline-flex', marginBottom: '16px' }}>
          <IconTruck size={48} stroke={1.5} />
        </Box>
        <Text size="md" fw={700} style={{ fontFamily: 'JetBrains Mono', color: '#ffffff', marginBottom: '8px' }}>
          {title}
        </Text>
        <Text size="xs" style={{ color: '#a7a7a7', marginBottom: '16px' }}>
          {description}
        </Text>
        {actionLabel && actionRoute && (
          <Button component={Link} to={actionRoute} style={{ backgroundColor: '#ffffff', color: '#0a0a0a', fontWeight: 600 }} size="xs">
            {actionLabel}
          </Button>
        )}
      </Paper>
    </Center>
  );
}
