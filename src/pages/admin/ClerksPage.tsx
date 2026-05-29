import { useEffect, useState } from 'react';
import { Table, Button, Group, Modal, TextInput, Select, PasswordInput, ActionIcon, Paper, Center, Loader, Box, Badge, Text, Stack } from '@mantine/core';
import { IconUserPlus, IconEdit, IconLock, IconLockOpen } from '@tabler/icons-react';
import { fetchAllClerks, createClerk, updateClerkProfile } from '../../services/adminService';
import type { UserProfile } from '../../stores/authStore';
import { RoleBadge } from '../../components/common/RoleBadge';
import { notifications } from '@mantine/notifications';

export default function ClerksPage() {
  const [clerks, setClerks] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Modal State
  const [addOpened, setAddOpened] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState<'clerk' | 'supervisor'>('clerk');
  const [addPassword, setAddPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [editOpened, setEditOpened] = useState(false);
  const [editingClerk, setEditingClerk] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'clerk' | 'supervisor'>('clerk');

  const loadClerks = async () => {
    setLoading(true);
    const data = await fetchAllClerks();
    setClerks(data);
    setLoading(false);
  };

  useEffect(() => {
    loadClerks();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await createClerk(addEmail, addPassword, addName, addRole);
    setSubmitting(false);

    if (result.success) {
      notifications.show({
        title: 'Clerk Created',
        message: `Successfully created ${addName} as a ${addRole}.`,
        color: 'green',
      });
      setAddOpened(false);
      // Reset form
      setAddName('');
      setAddEmail('');
      setAddPassword('');
      setAddRole('clerk');
      loadClerks();
    } else {
      notifications.show({
        title: 'Error Creating Clerk',
        message: result.error || 'Database operation failed.',
        color: 'red',
      });
    }
  };

  const handleEditClick = (clerk: UserProfile) => {
    setEditingClerk(clerk);
    setEditName(clerk.full_name);
    setEditRole(clerk.role);
    setEditOpened(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClerk) return;

    setSubmitting(true);
    const result = await updateClerkProfile(editingClerk.id, {
      full_name: editName,
      role: editRole,
    });
    setSubmitting(false);

    if (result.success) {
      notifications.show({
        title: 'Profile Updated',
        message: `Updated profile details for ${editName} successfully.`,
        color: 'green',
      });
      setEditOpened(false);
      loadClerks();
    } else {
      notifications.show({
        title: 'Error Updating Profile',
        message: result.error || 'Failed to sync updates.',
        color: 'red',
      });
    }
  };

  const handleToggleActive = async (clerk: UserProfile) => {
    const nextActive = !clerk.is_active;
    const actionLabel = nextActive ? 'activation' : 'deactivation';
    
    const result = await updateClerkProfile(clerk.id, { is_active: nextActive });
    if (result.success) {
      notifications.show({
        title: `Operator State Modified`,
        message: `Account for ${clerk.full_name} has been ${actionLabel}.`,
        color: nextActive ? 'green' : 'yellow',
      });
      loadClerks();
    } else {
      notifications.show({
        title: `Failed to change state`,
        message: result.error || 'Update rejected.',
        color: 'red',
      });
    }
  };

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
      {/* Header bar */}
      <Group justify="space-between" mb="md" style={{ flexShrink: 0 }}>
        <Text size="xs" fw={700} style={{ color: '#a7a7a7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Registered Terminal Operators
        </Text>
        <Button leftSection={<IconUserPlus size={16} />} style={{ backgroundColor: '#ffffff', color: '#0a0a0a', fontWeight: 600 }} size="xs" onClick={() => setAddOpened(true)}>
          Add New Operator
        </Button>
      </Group>

      {/* Main Table */}
      {loading ? (
        <Center style={{ flex: 1 }}>
          <Loader color="dataBlue" size="md" />
        </Center>
      ) : (
        <Box style={{ flex: 1, overflowY: 'auto' }}>
          <Table striped highlightOnHover verticalSpacing="xs">
            <Table.Thead style={{ backgroundColor: '#0a0a0a', position: 'sticky', top: 0, zIndex: 1 }}>
              <Table.Tr style={{ borderColor: '#313131' }}>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>OPERATOR ID</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>FULL NAME</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>ROLE</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>STATUS</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', textAlign: 'center', width: '15%' }}>ACTIONS</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {clerks.map((clerk) => (
                <Table.Tr key={clerk.id} style={{ borderColor: '#1e1e1e' }}>
                  <Table.Td style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#a7a7a7' }}>
                    {clerk.id.substring(0, 8)}...
                  </Table.Td>
                  <Table.Td style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{clerk.full_name}</Table.Td>
                  <Table.Td>
                    <RoleBadge role={clerk.role} />
                  </Table.Td>
                  <Table.Td>
                    {clerk.is_active ? (
                      <Badge color="green" variant="outline" size="xs">
                        Active
                      </Badge>
                    ) : (
                      <Badge color="red" variant="outline" size="xs">
                        Inactive
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="center" wrap="nowrap">
                      <ActionIcon variant="subtle" color="dataBlue" onClick={() => handleEditClick(clerk)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color={clerk.is_active ? 'red' : 'green'}
                        onClick={() => handleToggleActive(clerk)}
                        title={clerk.is_active ? 'Deactivate user' : 'Activate user'}
                      >
                        {clerk.is_active ? <IconLock size={16} /> : <IconLockOpen size={16} />}
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      )}

      {/* Add Clerk Modal */}
      <Modal
        opened={addOpened}
        onClose={() => setAddOpened(false)}
        title="Add New Operator"
        centered
        size="sm"
        styles={{
          header: { backgroundColor: '#141414', color: '#ffffff', fontFamily: 'JetBrains Mono', borderBottom: '1px solid #313131' },
          content: { backgroundColor: '#141414', border: '1px solid #313131' },
        }}
      >
        <form onSubmit={handleAddSubmit}>
          <Stack gap="md">
            <TextInput
              label="Full Name"
              placeholder="e.g. Ramesh Kumar"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              required
              variant="filled"
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontFamily: 'JetBrains Mono', fontSize: '12px' },
              }}
            />

            <TextInput
              label="Operator Email"
              placeholder="operator@atme.com"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              required
              type="email"
              variant="filled"
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontFamily: 'JetBrains Mono', fontSize: '12px' },
              }}
            />

            <Select
              label="Operator Privilege"
              data={[
                { value: 'clerk', label: 'Terminal Clerk (Normal)' },
                { value: 'supervisor', label: 'Supervisor (Full Admin)' },
              ]}
              value={addRole}
              onChange={(val) => setAddRole(val as any)}
              required
              variant="filled"
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontFamily: 'JetBrains Mono', fontSize: '12px' },
              }}
            />

            <PasswordInput
              label="Temporary Password"
              placeholder="Min 6 characters"
              value={addPassword}
              onChange={(e) => setAddPassword(e.target.value)}
              required
              variant="filled"
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontFamily: 'JetBrains Mono', fontSize: '12px' },
              }}
            />

            <Button
              type="submit"
              loading={submitting}
              fullWidth
              style={{ backgroundColor: '#ffffff', color: '#0a0a0a', fontWeight: 600, fontFamily: 'JetBrains Mono' }}
            >
              INITIALIZE USER
            </Button>
          </Stack>
        </form>
      </Modal>

      {/* Edit Clerk Modal */}
      <Modal
        opened={editOpened}
        onClose={() => setEditOpened(false)}
        title="Edit Operator Profile"
        centered
        size="sm"
        styles={{
          header: { backgroundColor: '#141414', color: '#ffffff', fontFamily: 'JetBrains Mono', borderBottom: '1px solid #313131' },
          content: { backgroundColor: '#141414', border: '1px solid #313131' },
        }}
      >
        <form onSubmit={handleEditSubmit}>
          <Stack gap="md">
            <TextInput
              label="Full Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              variant="filled"
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontFamily: 'JetBrains Mono', fontSize: '12px' },
              }}
            />

            <Select
              label="Operator Privilege"
              data={[
                { value: 'clerk', label: 'Terminal Clerk (Normal)' },
                { value: 'supervisor', label: 'Supervisor (Full Admin)' },
              ]}
              value={editRole}
              onChange={(val) => setEditRole(val as any)}
              required
              variant="filled"
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontFamily: 'JetBrains Mono', fontSize: '12px' },
              }}
            />

            <Button
              type="submit"
              loading={submitting}
              fullWidth
              style={{ backgroundColor: '#ffffff', color: '#0a0a0a', fontWeight: 600, fontFamily: 'JetBrains Mono' }}
            >
              SAVE UPDATES
            </Button>
          </Stack>
        </form>
      </Modal>
    </Paper>
  );
}
