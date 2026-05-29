import { useEffect, useState } from 'react';
import { Group, Badge, Text, ActionIcon, Tooltip } from '@mantine/core';
import { IconLogout, IconTerminal, IconWifi, IconWifiOff } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { signOut } from '../../services/authService';
import { RoleBadge } from '../common/RoleBadge';
import { supabase, isMockSupabase } from '../../services/supabase';

export function TopBar() {
  const navigate = useNavigate();
  const { profile, reset } = useAuthStore();
  const [time, setTime] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // 1. Live clock
    const timer = setInterval(() => setTime(new Date()), 1000);

    // 2. Connection status check
    const checkConnection = async () => {
      if (isMockSupabase) {
        setIsConnected(true);
        return;
      }
      try {
        const { error } = await supabase.from('trip_challans').select('id').limit(1);
        setIsConnected(!error);
      } catch {
        setIsConnected(false);
      }
    };
    checkConnection();
    const connTimer = setInterval(checkConnection, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(connTimer);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    reset();
    navigate('/login');
  };

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <Group justify="space-between" style={{ width: '100%' }} wrap="nowrap">
      {/* Brand logo & title */}
      <Group gap="xs" wrap="nowrap">
        <Badge color="dataBlue" radius="sm" variant="filled" size="lg" style={{ fontFamily: 'JetBrains Mono' }} leftSection={<IconTerminal size={14} />}>
          ATME
        </Badge>
        <Text size="xs" fw={700} style={{ fontFamily: 'JetBrains Mono', color: '#ffffff', letterSpacing: '0.05em' }} visibleFrom="sm">
          TRANSIT MANIFEST ENGINE
        </Text>
      </Group>

      {/* Info items */}
      <Group gap="md" wrap="nowrap">
        {/* Connection status */}
        <Tooltip label={isConnected ? 'Connected to Database' : 'Disconnected from Database'}>
          <Group gap="xs" wrap="nowrap">
            {isConnected ? (
              <IconWifi size={16} color="#22c55e" />
            ) : (
              <IconWifiOff size={16} color="#ef4444" />
            )}
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isConnected ? '#22c55e' : '#ef4444',
                boxShadow: isConnected ? '0 0 8px #22c55e' : '0 0 8px #ef4444',
              }}
            />
          </Group>
        </Tooltip>

        {/* Live Clock */}
        <Text size="xs" style={{ fontFamily: 'JetBrains Mono', color: '#a7a7a7' }} visibleFrom="md">
          {formattedDate} • {formattedTime}
        </Text>

        {/* User profile */}
        {profile && (
          <Group gap="xs" wrap="nowrap">
            <Text size="xs" fw={600} style={{ color: '#ffffff' }}>
              {profile.full_name}
            </Text>
            <RoleBadge role={profile.role} />
          </Group>
        )}

        {/* Logout */}
        <Tooltip label="Logout Session">
          <ActionIcon variant="subtle" color="red" onClick={handleLogout} size="sm">
            <IconLogout size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
}
