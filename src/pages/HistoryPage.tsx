import { useEffect, useState } from 'react';
import { Table, Title, Text, ActionIcon, Group, Select, TextInput, Button, Paper, Center, Loader, Box, Pagination } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconEye, IconPrinter, IconSearch, IconDownload, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { fetchTripHistory, reprintTrip } from '../services/tripQueryService';
import type { TripWithBiltis } from '../services/tripQueryService';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { notifications } from '@mantine/notifications';

const PAGE_SIZE = 20;

export default function HistoryPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuthStore();
  const [trips, setTrips] = useState<TripWithBiltis[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [searchVal, setSearchVal] = useState('');
  const [statusVal, setStatusVal] = useState<string | null>('ALL');
  const [activePage, setActivePage] = useState(1);

  const supervisor = profile?.role === 'supervisor';

  const loadHistory = async (page = activePage) => {
    setLoading(true);
    if (user) {
      const result = await fetchTripHistory(
        {
          dateFrom: dateRange[0],
          dateTo: dateRange[1],
          search: searchVal,
          status: statusVal === 'ALL' ? undefined : statusVal || undefined,
          page,
          pageSize: PAGE_SIZE,
        },
        user.id,
        supervisor
      );
      setTrips(result.trips);
      setTotalCount(result.totalCount);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadHistory(1);
    setActivePage(1);
  }, [user, supervisor, statusVal]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadHistory(1);
    setActivePage(1);
  };

  const handleClearFilters = () => {
    setDateRange([null, null]);
    setSearchVal('');
    setStatusVal('ALL');
    setActivePage(1);
    // Reload with cleared parameters
    setTimeout(() => {
      loadHistory(1);
    }, 10);
  };

  const handlePageChange = (page: number) => {
    setActivePage(page);
    loadHistory(page);
  };

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
      loadHistory(activePage);
    } else {
      notifications.show({
        title: 'Print Error',
        message: `Could not print manifest for ${challanNo}.`,
        color: 'red',
      });
    }
  };

  const handleExportCSV = async () => {
    if (!user) return;
    notifications.show({
      title: 'Generating Report',
      message: 'Compiling filtered manifest logs to CSV format...',
      color: 'dataBlue',
      autoClose: 2000,
    });

    const result = await fetchTripHistory(
      {
        dateFrom: dateRange[0],
        dateTo: dateRange[1],
        search: searchVal,
        status: statusVal === 'ALL' ? undefined : statusVal || undefined,
        page: 1,
        pageSize: 10000, // retrieve all matches for report
      },
      user.id,
      supervisor
    );

    if (result.trips.length === 0) {
      notifications.show({
        title: 'Export Failed',
        message: 'No records matching current filters to export.',
        color: 'red',
      });
      return;
    }

    const headers = ['Challan No', 'Truck No', 'Driver Name', 'Origin', 'Destination', 'Trip Date', 'Total Biltis', 'Total Items', 'Total Weight', 'Status', 'Operator'];
    const rows = result.trips.map((t) => [
      t.challan_no,
      t.truck_no,
      t.driver_name,
      t.origin,
      t.destination,
      t.trip_date,
      t.total_biltis || 0,
      t.total_items || 0,
      t.total_weight || 0,
      t.status || 'saved',
      t.clerk?.full_name || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `atme_trip_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
      {/* Title */}
      <div style={{ flexShrink: 0 }}>
        <Title order={3} style={{ fontFamily: 'JetBrains Mono', color: '#ffffff', letterSpacing: '-0.021px' }}>
          TRIP LOG HISTORY
        </Title>
        <Text size="xs" style={{ color: '#a7a7a7' }}>
          Search, filter, review and export completed dispatches
        </Text>
      </div>

      {/* Filter Bar Panel */}
      <Paper
        p="sm"
        radius="md"
        style={{
          backgroundColor: '#141414',
          border: '1px solid #313131',
          flexShrink: 0,
        }}
      >
        <form onSubmit={handleSearch}>
          <Group align="flex-end" gap="xs">
            <DatePickerInput
              type="range"
              label="Trip Date Range"
              placeholder="Pick date range"
              value={dateRange}
              onChange={setDateRange}
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontSize: '11px', fontWeight: 600, fontFamily: 'JetBrains Mono' },
              }}
            />

            <TextInput
              label="Search"
              placeholder="Challan or Truck No."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontSize: '11px', fontWeight: 600, fontFamily: 'JetBrains Mono' },
              }}
            />

            <Select
              label="Challan Status"
              data={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'saved', label: 'Saved' },
                { value: 'printed', label: 'Printed' },
                { value: 'pending', label: 'Pending' },
              ]}
              value={statusVal}
              onChange={setStatusVal}
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontSize: '11px', fontWeight: 600, fontFamily: 'JetBrains Mono' },
              }}
            />

            <Button
              type="submit"
              leftSection={<IconSearch size={14} />}
              style={{
                fontFamily: 'JetBrains Mono',
                backgroundColor: '#ffffff',
                color: '#0a0a0a',
                fontWeight: 600,
              }}
            >
              QUERY
            </Button>

            <Button
              variant="subtle"
              color="gray"
              onClick={handleClearFilters}
              leftSection={<IconX size={14} />}
              styles={{
                root: { color: '#7c7c7c' }
              }}
            >
              Clear
            </Button>

            <Button
              variant="subtle"
              color="dataBlue"
              onClick={handleExportCSV}
              leftSection={<IconDownload size={14} />}
              style={{ marginLeft: 'auto' }}
            >
              Export CSV
            </Button>
          </Group>
        </form>
      </Paper>

      {/* Main Table Grid */}
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
        {loading ? (
          <Center style={{ flex: 1 }}>
            <Loader color="dataBlue" size="md" />
          </Center>
        ) : trips.length === 0 ? (
          <EmptyState description="No trip logs matched the selected filter query criteria." />
        ) : (
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box style={{ flex: 1, overflowY: 'auto' }}>
              <Table striped highlightOnHover verticalSpacing="xs">
                <Table.Thead style={{ backgroundColor: '#0a0a0a', position: 'sticky', top: 0, zIndex: 1 }}>
                  <Table.Tr style={{ borderColor: '#313131' }}>
                    <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>CHALLAN NO</Table.Th>
                    <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>TRUCK NO</Table.Th>
                    <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>DRIVER NAME</Table.Th>
                    <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>ROUTE</Table.Th>
                    <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', textAlign: 'center' }}>BILTIS</Table.Th>
                    <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', textAlign: 'right' }}>WEIGHT (KG)</Table.Th>
                    <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>TRIP DATE</Table.Th>
                    {supervisor && (
                      <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>OPERATOR</Table.Th>
                    )}
                    <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>STATUS</Table.Th>
                    <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', textAlign: 'center', width: '10%' }}>ACTIONS</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {trips.map((t) => (
                    <Table.Tr key={t.id} style={{ borderColor: '#1e1e1e' }}>
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
                      <Table.Td style={{ fontSize: '12px', color: '#ffffff' }}>{t.trip_date}</Table.Td>
                      {supervisor && (
                        <Table.Td style={{ fontSize: '12px', color: '#ffffff' }}>{t.clerk?.full_name || 'N/A'}</Table.Td>
                      )}
                      <Table.Td>
                        <StatusBadge status={t.status || 'saved'} />
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="center" wrap="nowrap">
                          <ActionIcon variant="subtle" color="dataBlue" onClick={() => navigate(`/trips/${t.id}`)}>
                            <IconEye size={16} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" color="dataBlue" onClick={() => handleReprint(t.id!, t.challan_no)}>
                            <IconPrinter size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Group justify="center" mt="md" style={{ flexShrink: 0 }}>
                <Pagination
                  total={totalPages}
                  value={activePage}
                  onChange={handlePageChange}
                  color="dataBlue"
                  styles={{
                    control: { backgroundColor: '#0a0a0a', borderColor: '#313131', color: '#ffffff' },
                  }}
                />
              </Group>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
