import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Group, Button, Title, Text, Paper, Table, Box, Center, Loader, Grid } from '@mantine/core';
import { IconPrinter, IconArrowLeft } from '@tabler/icons-react';
import { fetchTripDetails, reprintTrip } from '../services/tripQueryService';
import type { TripWithBiltis } from '../services/tripQueryService';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatWeight } from '../utils/formatters';
import { notifications } from '@mantine/notifications';

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripWithBiltis | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDetails = async () => {
    if (id) {
      const data = await fetchTripDetails(id);
      setTrip(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleReprint = async () => {
    if (!trip) return;
    notifications.show({
      title: 'Reprinting Manifest',
      message: `Generating print file for ${trip.challan_no}...`,
      color: 'dataBlue',
      autoClose: 2000,
    });
    
    const success = await reprintTrip(trip.id!);
    if (success) {
      notifications.show({
        title: 'Reprint Successful',
        message: `Challan ${trip.challan_no} printed successfully.`,
        color: 'green',
      });
      loadDetails(); // reload to reflect printed status
    } else {
      notifications.show({
        title: 'Print Error',
        message: 'Could not print manifest.',
        color: 'red',
      });
    }
  };

  if (loading) {
    return (
      <Center style={{ flex: 1 }}>
        <Loader color="dataBlue" size="md" />
      </Center>
    );
  }

  if (!trip) {
    return (
      <Center style={{ flex: 1, flexDirection: 'column', gap: '16px' }}>
        <Text size="md" c="red" fw={700} style={{ fontFamily: 'JetBrains Mono' }}>
          CHALLAN NOT FOUND [ERROR 404]
        </Text>
        <Button leftSection={<IconArrowLeft size={16} />} style={{ backgroundColor: '#1e1e1e', color: '#ffffff' }} onClick={() => navigate(-1)}>
          GO BACK
        </Button>
      </Center>
    );
  }

  const biltis = trip.bilti_entries || [];
  const totalBiltis = biltis.length;
  const totalItems = biltis.reduce((sum, b) => sum + (Number(b.items_count) || 0), 0);
  const totalWeight = biltis.reduce((sum, b) => sum + (Number(b.weight_numeric) || 0), 0);

  return (
    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
      {/* Title & Actions Bar */}
      <Group justify="space-between" align="center" style={{ flexShrink: 0 }}>
        <Group gap="sm">
          <Button leftSection={<IconArrowLeft size={14} />} variant="subtle" color="dataBlue" size="xs" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Title order={3} style={{ fontFamily: 'JetBrains Mono', color: '#ffffff', letterSpacing: '-0.021px' }}>
            MANIFEST DETAIL: {trip.challan_no}
          </Title>
        </Group>
        <Button leftSection={<IconPrinter size={16} />} style={{ backgroundColor: '#ffffff', color: '#0a0a0a', fontWeight: 600 }} onClick={handleReprint}>
          Reprint Manifest
        </Button>
      </Group>

      {/* Summary Card */}
      <Paper
        p="md"
        radius="md"
        style={{
          backgroundColor: '#141414',
          border: '1px solid #313131',
          flexShrink: 0,
        }}
      >
        <Grid gutter="md">
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Text size="xs" style={{ color: '#a7a7a7' }}>CHALLAN NO</Text>
            <Text size="lg" fw={700} style={{ fontFamily: 'JetBrains Mono', color: '#ffffff' }}>
              {trip.challan_no}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Text size="xs" style={{ color: '#a7a7a7' }}>TRUCK NUMBER</Text>
            <Text size="sm" fw={600} style={{ color: '#ffffff' }}>
              {trip.truck_no}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Text size="xs" style={{ color: '#a7a7a7' }}>DRIVER NAME</Text>
            <Text size="sm" fw={600} style={{ color: '#ffffff' }}>{trip.driver_name || 'N/A'}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Text size="xs" style={{ color: '#a7a7a7' }}>DISPATCH DATE</Text>
            <Text size="sm" fw={600} style={{ color: '#ffffff' }}>{trip.trip_date}</Text>
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Text size="xs" style={{ color: '#a7a7a7' }}>ORIGIN</Text>
            <Text size="sm" style={{ color: '#ffffff' }}>{trip.origin || 'N/A'}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Text size="xs" style={{ color: '#a7a7a7' }}>DESTINATION</Text>
            <Text size="sm" style={{ color: '#ffffff' }}>{trip.destination || 'N/A'}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Text size="xs" style={{ color: '#a7a7a7' }}>OPERATOR</Text>
            <Text size="sm" fw={600} style={{ color: '#ffffff' }}>{trip.clerk?.full_name || 'N/A'}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Text size="xs" style={{ color: '#a7a7a7' }}>STATUS</Text>
            <Group gap="xs" mt={4}>
              <StatusBadge status={trip.status || 'saved'} />
            </Group>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Biltis Table Paper */}
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
        <Text size="xs" fw={700} style={{ color: '#a7a7a7', textTransform: 'uppercase', letterSpacing: '0.05em' }} mb="md">
          CONSIGNMENT LINES
        </Text>

        <Box style={{ flex: 1, overflowY: 'auto' }}>
          <Table striped verticalSpacing="xs">
            <Table.Thead style={{ backgroundColor: '#0a0a0a', position: 'sticky', top: 0, zIndex: 1 }}>
              <Table.Tr style={{ borderColor: '#313131' }}>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', width: '5%', textAlign: 'center' }}>#</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', width: '15%' }}>BILTI NO</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', width: '25%' }}>CUSTOMER</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', width: '25%' }}>RECEIVER</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', width: '15%' }}>GOODS TYPE</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', width: '8%', textAlign: 'right' }}>ITEMS</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', width: '12%', textAlign: 'right' }}>WEIGHT (KG)</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {biltis.map((b, idx) => (
                <Table.Tr key={b.id || idx} style={{ borderColor: '#1e1e1e' }}>
                  <Table.Td style={{ textAlign: 'center', fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#a7a7a7' }}>{idx + 1}</Table.Td>
                  <Table.Td style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'JetBrains Mono', color: '#ffffff' }}>{b.bilti_no}</Table.Td>
                  <Table.Td style={{ fontSize: '12px', color: '#ffffff' }}>{b.customer_name}</Table.Td>
                  <Table.Td style={{ fontSize: '12px', color: '#ffffff' }}>{b.receiver_name}</Table.Td>
                  <Table.Td style={{ fontSize: '12px', color: '#ffffff' }}>{b.goods_type}</Table.Td>
                  <Table.Td style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', textAlign: 'right', color: '#ffffff' }}>{b.items_count}</Table.Td>
                  <Table.Td style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', textAlign: 'right', color: '#ffffff' }}>{formatWeight(b.weight_numeric)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>

        {/* Totals Summary Row */}
        <Box
          p="sm"
          mt="md"
          style={{
            backgroundColor: '#0a0a0a',
            border: '1px solid #313131',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'JetBrains Mono',
            fontSize: '12px',
            fontWeight: 700,
            color: '#6798ff',
          }}
        >
          <span>TOTAL BILTIS: {totalBiltis}</span>
          <span>TOTAL ITEMS: {totalItems}</span>
          <span>TOTAL WEIGHT: {formatWeight(totalWeight)}</span>
        </Box>
      </Paper>
    </Box>
  );
}
