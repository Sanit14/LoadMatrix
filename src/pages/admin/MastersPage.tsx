import { useEffect, useState } from 'react';
import { Table, Tabs, Button, Group, Modal, TextInput, ActionIcon, Paper, Center, Loader, Box } from '@mantine/core';
import { IconPlus, IconTrash, IconSearch } from '@tabler/icons-react';
import { fetchCustomers, fetchReceivers } from '../../services/masterService';
import { addCustomer, deleteCustomer, addReceiver, deleteReceiver } from '../../services/adminService';
import { useBiltiStore } from '../../stores/biltiStore';
import type { MasterRecord } from '../../types';
import { notifications } from '@mantine/notifications';

export default function MastersPage() {
  const { setCustomersMaster, setReceiversMaster } = useBiltiStore();
  const [activeTab, setActiveTab] = useState<string | null>('customers');
  const [loading, setLoading] = useState(true);

  // Data lists
  const [customers, setCustomers] = useState<string[]>([]);
  const [receivers, setReceivers] = useState<MasterRecord[]>([]);

  // Search filters
  const [custSearch, setCustSearch] = useState('');
  const [recSearch, setRecSearch] = useState('');

  // Modals
  const [custOpened, setCustOpened] = useState(false);
  const [recOpened, setRecOpened] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newRecName, setNewRecName] = useState('');
  const [newRecCity, setNewRecCity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const custData = await fetchCustomers();
      const recData = await fetchReceivers();
      setCustomers(custData);
      setReceivers(recData);
      
      // Update global autocomplete store
      setCustomersMaster(custData);
      setReceiversMaster(recData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    setSubmitting(true);
    const result = await addCustomer(newCustName.trim());
    setSubmitting(false);

    if (result.success) {
      notifications.show({
        title: 'Customer Added',
        message: `${newCustName} added to master registry.`,
        color: 'green',
      });
      setNewCustName('');
      setCustOpened(false);
      loadData();
    } else {
      notifications.show({
        title: 'Operation Failed',
        message: result.error || 'Duplicate customer or DB error.',
        color: 'red',
      });
    }
  };

  const handleAddReceiver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecName.trim() || !newRecCity.trim()) return;

    setSubmitting(true);
    const result = await addReceiver(newRecName.trim(), newRecCity.trim());
    setSubmitting(false);

    if (result.success) {
      notifications.show({
        title: 'Receiver Added',
        message: `${newRecName} (${newRecCity}) registered successfully.`,
        color: 'green',
      });
      setNewRecName('');
      setNewRecCity('');
      setRecOpened(false);
      loadData();
    } else {
      notifications.show({
        title: 'Operation Failed',
        message: result.error || 'Duplicate receiver or DB error.',
        color: 'red',
      });
    }
  };

  const handleDeleteCustomer = async (name: string) => {
    if (window.confirm(`Are you sure you want to remove '${name}' from Customer Master?`)) {
      const result = await deleteCustomer(name);
      if (result.success) {
        notifications.show({
          title: 'Deleted customer',
          message: `${name} removed from registry.`,
          color: 'yellow',
        });
        loadData();
      } else {
        notifications.show({
          title: 'Delete Failed',
          message: result.error || 'Database constraint violation.',
          color: 'red',
        });
      }
    }
  };

  const handleDeleteReceiver = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove '${name}' from Receiver Master?`)) {
      const result = await deleteReceiver(id);
      if (result.success) {
        notifications.show({
          title: 'Deleted receiver',
          message: `${name} removed from registry.`,
          color: 'yellow',
        });
        loadData();
      } else {
        notifications.show({
          title: 'Delete Failed',
          message: result.error || 'Database constraint violation.',
          color: 'red',
        });
      }
    }
  };

  // Filter lists based on search
  const filteredCustomers = customers.filter((c) =>
    c.toLowerCase().includes(custSearch.toLowerCase())
  );

  const filteredReceivers = receivers.filter(
    (r) =>
      r.name.toLowerCase().includes(recSearch.toLowerCase()) ||
      (r.city && r.city.toLowerCase().includes(recSearch.toLowerCase()))
  );

  if (loading) {
    return (
      <Center style={{ flex: 1 }}>
        <Loader color="dataBlue" size="md" />
      </Center>
    );
  }

  return (
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
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        color="dataBlue"
        styles={{
          tab: { fontSize: '12px', fontWeight: 600, fontFamily: 'JetBrains Mono' },
          panel: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingTop: '16px' },
        }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <Tabs.List style={{ flexShrink: 0 }}>
          <Tabs.Tab value="customers">CUSTOMERS ({filteredCustomers.length})</Tabs.Tab>
          <Tabs.Tab value="receivers">RECEIVERS ({filteredReceivers.length})</Tabs.Tab>
        </Tabs.List>

        {/* CUSTOMERS PANEL */}
        <Tabs.Panel value="customers">
          <Group justify="space-between" mb="md" style={{ flexShrink: 0 }}>
            <TextInput
              placeholder="Filter customers..."
              leftSection={<IconSearch size={16} />}
              value={custSearch}
              onChange={(e) => setCustSearch(e.target.value)}
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
              }}
            />
            <Button leftSection={<IconPlus size={16} />} style={{ backgroundColor: '#ffffff', color: '#0a0a0a', fontWeight: 600 }} size="xs" onClick={() => setCustOpened(true)}>
              Add Customer
            </Button>
          </Group>

          <Box style={{ flex: 1, overflowY: 'auto' }}>
            <Table striped highlightOnHover verticalSpacing="xs">
              <Table.Thead style={{ backgroundColor: '#0a0a0a', position: 'sticky', top: 0, zIndex: 1 }}>
                <Table.Tr style={{ borderColor: '#313131' }}>
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', width: '10%' }}>#</Table.Th>
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>CUSTOMER NAME</Table.Th>
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', textAlign: 'center', width: '15%' }}>ACTIONS</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredCustomers.map((c, idx) => (
                  <Table.Tr key={idx} style={{ borderColor: '#1e1e1e' }}>
                    <Table.Td style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#a7a7a7' }}>{idx + 1}</Table.Td>
                    <Table.Td style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{c}</Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteCustomer(c)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        </Tabs.Panel>

        {/* RECEIVERS PANEL */}
        <Tabs.Panel value="receivers">
          <Group justify="space-between" mb="md" style={{ flexShrink: 0 }}>
            <TextInput
              placeholder="Filter receivers..."
              leftSection={<IconSearch size={16} />}
              value={recSearch}
              onChange={(e) => setRecSearch(e.target.value)}
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
              }}
            />
            <Button leftSection={<IconPlus size={16} />} style={{ backgroundColor: '#ffffff', color: '#0a0a0a', fontWeight: 600 }} size="xs" onClick={() => setRecOpened(true)}>
              Add Receiver
            </Button>
          </Group>

          <Box style={{ flex: 1, overflowY: 'auto' }}>
            <Table striped highlightOnHover verticalSpacing="xs">
              <Table.Thead style={{ backgroundColor: '#0a0a0a', position: 'sticky', top: 0, zIndex: 1 }}>
                <Table.Tr style={{ borderColor: '#313131' }}>
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', width: '10%' }}>#</Table.Th>
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>RECEIVER WAREHOUSE / SITE</Table.Th>
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>LOCATION CITY</Table.Th>
                  <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', textAlign: 'center', width: '15%' }}>ACTIONS</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredReceivers.map((r, idx) => (
                  <Table.Tr key={r.id || idx} style={{ borderColor: '#1e1e1e' }}>
                    <Table.Td style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#a7a7a7' }}>{idx + 1}</Table.Td>
                    <Table.Td style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{r.name}</Table.Td>
                    <Table.Td style={{ fontSize: '12px', color: '#ffffff' }}>{r.city || 'N/A'}</Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteReceiver(r.id!, r.name)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        </Tabs.Panel>
      </Tabs>

      {/* Add Customer Modal */}
      <Modal
        opened={custOpened}
        onClose={() => setCustOpened(false)}
        title="Register Master Customer"
        centered
        size="sm"
        styles={{
          header: { backgroundColor: '#141414', color: '#ffffff', fontFamily: 'JetBrains Mono', borderBottom: '1px solid #313131' },
          content: { backgroundColor: '#141414', border: '1px solid #313131' },
        }}
      >
        <form onSubmit={handleAddCustomer}>
          <Stack gap="md">
            <TextInput
              label="Customer Name"
              placeholder="e.g. Singhania Steel Corp"
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              required
              variant="filled"
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontFamily: 'JetBrains Mono', fontSize: '12px' },
              }}
            />
            <Button type="submit" style={{ backgroundColor: '#ffffff', color: '#0a0a0a', fontWeight: 600, fontFamily: 'JetBrains Mono' }} loading={submitting} fullWidth>
              SAVE TO DICTIONARY
            </Button>
          </Stack>
        </form>
      </Modal>

      {/* Add Receiver Modal */}
      <Modal
        opened={recOpened}
        onClose={() => setRecOpened(false)}
        title="Register Master Receiver"
        centered
        size="sm"
        styles={{
          header: { backgroundColor: '#141414', color: '#ffffff', fontFamily: 'JetBrains Mono', borderBottom: '1px solid #313131' },
          content: { backgroundColor: '#141414', border: '1px solid #313131' },
        }}
      >
        <form onSubmit={handleAddReceiver}>
          <Stack gap="md">
            <TextInput
              label="Receiver Outlet / Name"
              placeholder="e.g. Mumbai Logistics Yard"
              value={newRecName}
              onChange={(e) => setNewRecName(e.target.value)}
              required
              variant="filled"
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontFamily: 'JetBrains Mono', fontSize: '12px' },
              }}
            />
            <TextInput
              label="Destination City"
              placeholder="e.g. Mumbai"
              value={newRecCity}
              onChange={(e) => setNewRecCity(e.target.value)}
              required
              variant="filled"
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontFamily: 'JetBrains Mono', fontSize: '12px' },
              }}
            />
            <Button type="submit" style={{ backgroundColor: '#ffffff', color: '#0a0a0a', fontWeight: 600, fontFamily: 'JetBrains Mono' }} loading={submitting} fullWidth>
              SAVE TO DICTIONARY
            </Button>
          </Stack>
        </form>
      </Modal>
    </Paper>
  );
}

import { Stack } from '@mantine/core';
