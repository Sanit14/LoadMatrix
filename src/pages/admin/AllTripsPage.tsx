import { useEffect, useState } from 'react';
import { Table, Group, Select, TextInput, Button, Paper, Center, Loader, Box, Pagination, ActionIcon, Tooltip } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconEye, IconPrinter, IconSearch, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { fetchTripHistory, reprintTrip } from '../../services/tripQueryService';
import { fetchAllClerks } from '../../services/adminService';
import type { TripWithBiltis } from '../../services/tripQueryService';
import type { UserProfile } from '../../stores/authStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatWeight } from '../../utils/formatters';
import { notifications } from '@mantine/notifications';

const PAGE_SIZE = 20;

export default function AllTripsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<TripWithBiltis[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clerks, setClerks] = useState<UserProfile[]>([]);

  // Filter states
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [searchVal, setSearchVal] = useState('');
  const [statusVal, setStatusVal] = useState<string | null>('ALL');
  const [selectedClerk, setSelectedClerk] = useState<string | null>('ALL');
  const [activePage, setActivePage] = useState(1);

  // Aggregate stats
  const [aggregates, setAggregates] = useState({ tripsCount: 0, biltisCount: 0, weightCount: 0 });

  const loadClerkOptions = async () => {
    const list = await fetchAllClerks();
    setClerks(list);
  };

  const loadData = async (page = activePage) => {
    setLoading(true);
    if (user) {
      const filters = {
        dateFrom: dateRange[0],
        dateTo: dateRange[1],
        search: searchVal,
        status: statusVal === 'ALL' ? undefined : statusVal || undefined,
        clerkId: selectedClerk === 'ALL' ? undefined : selectedClerk || undefined,
        page,
        pageSize: PAGE_SIZE,
      };

      // 1. Fetch current page of trips
      const result = await fetchTripHistory(filters, user.id, true);
      setTrips(result.trips);
      setTotalCount(result.totalCount);

      // 2. Fetch full matches to calculate overall aggregate sums
      const allMatches = await fetchTripHistory(
        {
          ...filters,
          page: 1,
          pageSize: 10000, // large bounds to sum all records
        },
        user.id,
        true
      );

      const tripsCount = allMatches.trips.length;
      const biltisCount = allMatches.trips.reduce((sum, t) => sum + (t.total_biltis || 0), 0);
      const weightCount = allMatches.trips.reduce((sum, t) => sum + (Number(t.total_weight) || 0), 0);
      setAggregates({ tripsCount, biltisCount, weightCount });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClerkOptions();
  }, []);

  useEffect(() => {
    loadData(1);
    setActivePage(1);
  }, [user, statusVal, selectedClerk]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(1);
    setActivePage(1);
  };

  const handleClearFilters = () => {
    setDateRange([null, null]);
    setSearchVal('');
    setStatusVal('ALL');
    setSelectedClerk('ALL');
    setActivePage(1);
    setTimeout(() => {
      loadData(1);
    }, 10);
  };

  const handlePageChange = (page: number) => {
    setActivePage(page);
    loadData(page);
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
      loadData(activePage);
    } else {
      notifications.show({
        title: 'Print Error',
        message: `Could not print manifest for ${challanNo}.`,
        color: 'red',
      });
    }
  };

  const clerkOptions = [
    { value: 'ALL', label: 'All Operators' },
    ...clerks.map((c) => ({ value: c.id, label: c.full_name })),
  ];

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
      {/* Filter panel */}
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

            <Select
              label="Operator Clerk"
              data={clerkOptions}
              value={selectedClerk}
              onChange={setSelectedClerk}
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
              QUERY LOGS
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
          </Group>
        </form>
      </Paper>

      {/* Main logs grid wrapper */}
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
          <EmptyState description="No logs matched the selected cross-clerk search query." />
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
                    <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>OPERATOR</Table.Th>
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
                      <Table.Td style={{ fontSize: '12px', color: '#ffffff' }}>{t.clerk?.full_name || 'N/A'}</Table.Td>
                      <Table.Td>
                        <StatusBadge status={t.status || 'saved'} />
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

            {/* Aggregate summary statistics footer */}
            <Box
              p="xs"
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
                flexShrink: 0,
              }}
            >
              <span>FILTERED TRIPS: {aggregates.tripsCount}</span>
              <span>FILTERED BILTIS: {aggregates.biltisCount}</span>
              <span>FILTERED WEIGHT: {formatWeight(aggregates.weightCount)}</span>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
