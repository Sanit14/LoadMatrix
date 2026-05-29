import { useEffect, useState } from 'react';
import { Title, Text, SimpleGrid, Paper, Card, Table, Group, Box, Anchor } from '@mantine/core';
import { IconTruck, IconListCheck, IconHistory, IconShieldLock } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { fetchTodayTrips } from '../services/tripQueryService';
import type { TripWithBiltis } from '../services/tripQueryService';
import { StatusBadge } from '../components/common/StatusBadge';

export default function HomePage() {
  const navigate = useNavigate();
  const { profile, user } = useAuthStore();
  const [tripsToday, setTripsToday] = useState<TripWithBiltis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (user) {
        const data = await fetchTodayTrips(user.id, profile?.role === 'supervisor');
        setTripsToday(data);
      }
      setLoading(false);
    }
    loadStats();
  }, [user, profile]);

  const getGreeting = (name: string) => {
    const hr = new Date().getHours();
    if (hr < 12) return `Good morning, ${name} 👋`;
    if (hr < 17) return `Good afternoon, ${name} 👋`;
    return `Good evening, ${name} 👋`;
  };

  const formattedDate = new Date().toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate statistics
  const totalTrips = tripsToday.length;
  const totalBiltis = tripsToday.reduce((sum, t) => sum + (Number(t.total_biltis) || 0), 0);
  const totalWeight = tripsToday.reduce((sum, t) => sum + (Number(t.total_weight) || 0), 0);

  // Quick Action configuration
  const quickActions = [
    {
      title: 'New Trip Entry',
      icon: <IconTruck size={32} stroke={1.5} />,
      route: '/entry',
      description: 'Open the manifest loading terminal',
      visible: true,
    },
    {
      title: "Today's Trips",
      icon: <IconListCheck size={32} stroke={1.5} />,
      route: '/trips/today',
      description: 'Check active challans for today',
      visible: true,
    },
    {
      title: 'Trip History',
      icon: <IconHistory size={32} stroke={1.5} />,
      route: '/history',
      description: 'Search past logs & download reports',
      visible: true,
    },
    {
      title: 'Admin Panel',
      icon: <IconShieldLock size={32} stroke={1.5} />,
      route: '/admin',
      description: 'Manage clerks, rules & masters',
      visible: profile?.role === 'supervisor',
    },
  ].filter((action) => action.visible);

  // Last 5 trips
  const recentTrips = tripsToday.slice(0, 5);

  return (
    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
      {/* Greeting strip */}
      <Group justify="space-between" align="center">
        <div>
          <Title order={2} style={{ fontFamily: 'JetBrains Mono', color: '#ffffff', letterSpacing: '-0.021px' }}>
            {getGreeting(profile?.full_name || 'Operator')}
          </Title>
          <Text size="xs" style={{ color: '#a7a7a7' }}>
            Transit Dispatch Console Initialized
          </Text>
        </div>
        <Text size="sm" fw={600} style={{ fontFamily: 'JetBrains Mono', color: '#a7a7a7' }}>
          {formattedDate}
        </Text>
      </Group>

      {/* Stats strip */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: '#141414',
            border: '1px solid #313131',
          }}
        >
          <Text size="xs" fw={700} style={{ color: '#a7a7a7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Today's Trips
          </Text>
          <Text size="2xl" fw={700} style={{ fontFamily: 'JetBrains Mono', color: '#6798ff', marginTop: '4px' }}>
            {loading ? '...' : totalTrips}
          </Text>
        </Paper>

        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: '#141414',
            border: '1px solid #313131',
          }}
        >
          <Text size="xs" fw={700} style={{ color: '#a7a7a7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Biltis Today
          </Text>
          <Text size="2xl" fw={700} style={{ fontFamily: 'JetBrains Mono', color: '#6798ff', marginTop: '4px' }}>
            {loading ? '...' : totalBiltis}
          </Text>
        </Paper>

        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: '#141414',
            border: '1px solid #313131',
          }}
        >
          <Text size="xs" fw={700} style={{ color: '#a7a7a7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Weight Today
          </Text>
          <Text size="2xl" fw={700} style={{ fontFamily: 'JetBrains Mono', color: '#6798ff', marginTop: '4px' }}>
            {loading ? '...' : `${totalWeight.toLocaleString()} kg`}
          </Text>
        </Paper>
      </SimpleGrid>

      {/* Quick Actions Grid */}
      <div>
        <Text size="xs" fw={700} style={{ color: '#a7a7a7', textTransform: 'uppercase', letterSpacing: '0.05em' }} mb="xs">
          Quick Console Launchers
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          {quickActions.map((action, idx) => (
            <Card
              key={idx}
              component={Link}
              to={action.route}
              p="md"
              radius="md"
              style={{
                backgroundColor: '#141414',
                border: '1px solid #313131',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="hover:border-data-blue/50 hover:bg-terminal-active"
            >
              <Box style={{ color: '#6798ff', marginBottom: '12px' }}>{action.icon}</Box>
              <Text size="sm" fw={700} style={{ color: '#ffffff' }}>
                {action.title}
              </Text>
              <Text size="xs" style={{ color: '#a7a7a7', marginTop: '4px' }}>
                {action.description}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </div>

      {/* Recent Trips list */}
      <Paper
        p="md"
        radius="md"
        style={{
          backgroundColor: '#141414',
          border: '1px solid #313131',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '250px',
        }}
      >
        <Text size="xs" fw={700} style={{ color: '#a7a7a7', textTransform: 'uppercase', letterSpacing: '0.05em' }} mb="md">
          Recent Activity (Last 5 Trips)
        </Text>

        <Box style={{ flex: 1, overflowX: 'auto' }}>
          <Table striped highlightOnHover verticalSpacing="xs">
            <Table.Thead style={{ backgroundColor: '#0a0a0a' }}>
              <Table.Tr style={{ borderColor: '#313131' }}>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>CHALLAN NO</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>TRUCK NO</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>ROUTE</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>BILTIS</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>WEIGHT (KG)</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>STATUS</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>CREATED AT</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={7} style={{ textAlign: 'center', color: '#a7a7a7', fontSize: '12px' }}>
                    Loading recent dispatches...
                  </Table.Td>
                </Table.Tr>
              ) : recentTrips.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7} style={{ textAlign: 'center', color: '#a7a7a7', fontSize: '12px' }}>
                    No trips loaded today yet. Click 'New Trip Entry' above.
                  </Table.Td>
                </Table.Tr>
              ) : (
                recentTrips.map((t) => (
                  <Table.Tr
                    key={t.id}
                    onClick={() => navigate(`/trips/${t.id}`)}
                    style={{ cursor: 'pointer', borderColor: '#1e1e1e' }}
                  >
                    <Table.Td style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'JetBrains Mono', color: '#6798ff' }}>
                      <Anchor component={Link} to={`/trips/${t.id}`} style={{ color: 'inherit' }}>
                        {t.challan_no}
                      </Anchor>
                    </Table.Td>
                    <Table.Td style={{ fontSize: '12px', fontWeight: 500, color: '#ffffff' }}>{t.truck_no}</Table.Td>
                    <Table.Td style={{ fontSize: '12px', color: '#ffffff' }}>
                      {t.origin || 'N/A'} ➔ {t.destination || 'N/A'}
                    </Table.Td>
                    <Table.Td style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#ffffff' }}>{t.total_biltis || 0}</Table.Td>
                    <Table.Td style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#ffffff' }}>
                      {(t.total_weight || 0).toLocaleString()}
                    </Table.Td>
                    <Table.Td>
                      <StatusBadge status={t.status || 'saved'} />
                    </Table.Td>
                    <Table.Td style={{ fontSize: '11px', color: '#a7a7a7' }}>
                      {t.created_at ? new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}
