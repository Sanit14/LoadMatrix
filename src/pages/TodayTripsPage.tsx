import { useEffect, useState } from 'react';
import { Table, Title, Text, ActionIcon, Group, Badge, Paper, Center, Loader, Box } from '@mantine/core';
import { IconEye, IconPrinter } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { fetchTodayTrips, reprintTrip } from '../services/tripQueryService';
import type { TripWithBiltis } from '../services/tripQueryService';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { supabase, isMockSupabase } from '../services/supabase';
import { notifications } from '@mantine/notifications';

export default function TodayTripsPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuthStore();
  const [trips, setTrips] = useState<TripWithBiltis[]>([]);
  const [loading, setLoading] = useState(true);

  const supervisor = profile?.role === 'supervisor';

  const loadTrips = async () => {
    if (user) {
      const data = await fetchTodayTrips(user.id, supervisor);
      setTrips(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTrips();
  }, [user, supervisor]);

  // Realtime subscription setup
  useEffect(() => {
    if (isMockSupabase) return;

    const channel = supabase
      .channel('today_trips_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trip_challans' },
        async (payload) => {
          const newTrip = payload.new as any;
          const todayStr = new Date().toISOString().split('T')[0];
          
          if (newTrip.trip_date === todayStr) {
            if (supervisor || newTrip.clerk_id === user?.id) {
              notifications.show({
                title: 'Realtime update',
                message: `New challan ${newTrip.challan_no} has been dispatched.`,
                color: 'blue',
              });
              loadTrips();
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'trip_challans' },
        () => {
          loadTrips();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supervisor]);

  const handleReprint = async (id: string, challanNo: string) => {
    notifications.show({
      title: 'Reprinting Manifest',
      message: `Generating print file for ${challanNo}...`,
      color: 'dataBlue',
      autoClose: 2000,
    });
    
    const success = await reprintTrip(id);
    if (success) {
      notifications.show({
        title: 'Reprint Successful',
        message: `Challan ${challanNo} printed and status updated.`,
        color: 'green',
      });
      loadTrips(); // reload to show updated printed status
    } else {
      notifications.show({
        title: 'Print Error',
        message: `Could not print manifest for ${challanNo}.`,
        color: 'red',
      });
    }
  };

  const formattedDate = new Date().toLocaleDateString([], {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (loading) {
    return (
      <Center style={{ flex: 1 }}>
        <Loader color="dataBlue" size="md" />
      </Center>
    );
  }

  return (
    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
      {/* Title block */}
      <Group justify="space-between" align="center" style={{ flexShrink: 0 }}>
        <div>
          <Title order={3} style={{ fontFamily: 'JetBrains Mono', color: '#ffffff', letterSpacing: '-0.021px' }}>
            TODAY'S DISPATCHES
          </Title>
          <Text size="xs" style={{ color: '#a7a7a7' }}>
            Active transit manifests for {formattedDate}
          </Text>
        </div>
        {supervisor && (
          <Badge color="dataBlue" radius="sm" variant="outline" size="sm">
            Supervisor Admin View
          </Badge>
        )}
      </Group>

      {/* Main Content Table */}
      {trips.length === 0 ? (
        <EmptyState
          description="No dispatch trips have been saved today yet. Initiate a new load matrix consignment sheet."
          actionLabel="Load Matrix Entry"
          actionRoute="/entry"
        />
      ) : (
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: '#141414',
            border: '1px solid #313131',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box style={{ flex: 1, overflowY: 'auto' }}>
            <Table striped highlightOnHover verticalSpacing="xs">
              <Table.Thead style={{ backgroundColor: '#0a0a0a', position: 'sticky', top: 0, zIndex: 10 }}>
                <Table.Tr style={{ borderColor: '#313131' }}>
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', width: '4%' }}>#</Table.Th>
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>CHALLAN NO</Table.Th>
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>TRUCK NO</Table.Th>
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>DRIVER NAME</Table.Th>
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>ROUTE</Table.Th>
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', textAlign: 'center' }}>BILTIS</Table.Th>
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', textAlign: 'right' }}>WEIGHT (KG)</Table.Th>
                  {supervisor && (
                    <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>CLERK</Table.Th>
                  )}
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>STATUS</Table.Th>
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', textAlign: 'right' }}>TIME</Table.Th>
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', textAlign: 'center', width: '10%' }}>ACTIONS</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {trips.map((t, idx) => (
                  <Table.Tr key={t.id} style={{ borderColor: '#1e1e1e' }}>
                    <Table.Td style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#a7a7a7' }}>{idx + 1}</Table.Td>
                    <Table.Td style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'JetBrains Mono', color: '#6798ff' }}>
                      {t.challan_no}
                    </Table.Td>
                    <Table.Td style={{ fontSize: '12px', fontWeight: 500, color: '#ffffff' }}>{t.truck_no}</Table.Td>
                    <Table.Td style={{ fontSize: '12px', color: '#ffffff' }}>{t.driver_name}</Table.Td>
                    <Table.Td style={{ fontSize: '12px', color: '#ffffff' }}>
                      {t.origin || 'N/A'} ➔ {t.destination || 'N/A'}
                    </Table.Td>
                    <Table.Td style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', textAlign: 'center', color: '#ffffff' }}>
                      {t.total_biltis || 0}
                    </Table.Td>
                    <Table.Td style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', textAlign: 'right', color: '#ffffff' }}>
                      {(t.total_weight || 0).toLocaleString()}
                    </Table.Td>
                    {supervisor && (
                      <Table.Td style={{ fontSize: '12px', color: '#ffffff' }}>
                        {t.clerk?.full_name || 'N/A'}
                      </Table.Td>
                    )}
                    <Table.Td>
                      <StatusBadge status={t.status || 'saved'} />
                    </Table.Td>
                    <Table.Td style={{ fontSize: '11px', color: '#a7a7a7', textAlign: 'right' }}>
                      {t.created_at ? new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="center" wrap="nowrap">
                        <Tooltip label="View Details">
                          <ActionIcon variant="subtle" color="dataBlue" onClick={() => navigate(`/trips/${t.id}`)}>
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Reprint Manifest">
                          <ActionIcon variant="subtle" color="dataBlue" onClick={() => handleReprint(t.id!, t.challan_no)}>
                            <IconPrinter size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

// Wrapper interface to prevent error with missing Tooltip component in manual imports
import { Tooltip } from '@mantine/core';
