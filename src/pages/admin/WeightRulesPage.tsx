import { useEffect, useState } from 'react';
import { Table, Button, Group, Modal, TextInput, ActionIcon, Paper, Center, Loader, Box, Switch, NumberInput, Text, Stack } from '@mantine/core';
import { IconPlus, IconTrash, IconEdit } from '@tabler/icons-react';
import { fetchAllWeightRules, saveWeightRule, deleteWeightRule } from '../../services/adminService';
import { useRulesStore } from '../../stores/rulesStore';
import type { GoodsWeightRule } from '../../stores/rulesStore';
import { notifications } from '@mantine/notifications';

export default function WeightRulesPage() {
  const { fetchRules } = useRulesStore();
  const [rules, setRules] = useState<GoodsWeightRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpened, setModalOpened] = useState(false);
  const [editingRule, setEditingRule] = useState<GoodsWeightRule | null>(null);
  
  const [keyword, setKeyword] = useState('');
  const [weight, setWeight] = useState<number | string>(50);
  const [unitLabel, setUnitLabel] = useState('bag');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadRules = async () => {
    setLoading(true);
    const data = await fetchAllWeightRules();
    setRules(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleOpenAdd = () => {
    setEditingRule(null);
    setKeyword('');
    setWeight(50);
    setUnitLabel('bag');
    setIsActive(true);
    setModalOpened(true);
  };

  const handleOpenEdit = (rule: GoodsWeightRule) => {
    setEditingRule(rule);
    setKeyword(rule.keyword);
    setWeight(rule.weight_per_unit);
    setUnitLabel(rule.unit_label);
    setIsActive(rule.is_active);
    setModalOpened(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setSubmitting(true);
    const result = await saveWeightRule({
      id: editingRule?.id,
      keyword: keyword.trim().toLowerCase(),
      weight_per_unit: Number(weight) || 0,
      unit_label: unitLabel.trim(),
      is_active: isActive,
    });
    setSubmitting(false);

    if (result.success) {
      notifications.show({
        title: editingRule ? 'Rule Updated' : 'Rule Created',
        message: `Successfully synchronized weights for keyword '${keyword}'.`,
        color: 'green',
      });
      setModalOpened(false);
      loadRules();
      fetchRules(); // reload rules in global useRulesStore
    } else {
      notifications.show({
        title: 'Operation Failed',
        message: result.error || 'Duplicate keyword rule or database issue.',
        color: 'red',
      });
    }
  };

  const handleDelete = async (id: string, kw: string) => {
    if (window.confirm(`Are you sure you want to delete weight rule for '${kw}'?`)) {
      const result = await deleteWeightRule(id);
      if (result.success) {
        notifications.show({
          title: 'Rule Deleted',
          message: `Weight rule for '${kw}' removed.`,
          color: 'yellow',
        });
        loadRules();
        fetchRules(); // reload rules in global useRulesStore
      } else {
        notifications.show({
          title: 'Failed to Delete',
          message: result.error || 'Database constraint violation.',
          color: 'red',
        });
      }
    }
  };

  const handleToggleActive = async (rule: GoodsWeightRule) => {
    const nextActive = !rule.is_active;
    const result = await saveWeightRule({
      ...rule,
      is_active: nextActive,
    });
    if (result.success) {
      loadRules();
      fetchRules(); // sync store
    } else {
      notifications.show({
        title: 'Failed to update rule state',
        message: result.error || 'Error.',
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
          Auto-Weight Keyword Converters
        </Text>
        <Button leftSection={<IconPlus size={16} />} style={{ backgroundColor: '#ffffff', color: '#0a0a0a', fontWeight: 600 }} size="xs" onClick={handleOpenAdd}>
          Add Weight Rule
        </Button>
      </Group>

      {/* Rules Table */}
      {loading ? (
        <Center style={{ flex: 1 }}>
          <Loader color="dataBlue" size="md" />
        </Center>
      ) : (
        <Box style={{ flex: 1, overflowY: 'auto' }}>
          <Table striped highlightOnHover verticalSpacing="xs">
            <Table.Thead style={{ backgroundColor: '#0a0a0a', position: 'sticky', top: 0, zIndex: 1 }}>
              <Table.Tr style={{ borderColor: '#313131' }}>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>MATCH KEYWORD</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', textAlign: 'right' }}>WEIGHT PER UNIT (KG)</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>UNIT LABEL</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', textAlign: 'center' }}>ACTIVE</Table.Th>
                <Table.Th style={{ color: '#a7a7a7', fontSize: '11px', fontFamily: 'JetBrains Mono', textAlign: 'center', width: '15%' }}>ACTIONS</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rules.map((rule) => (
                <Table.Tr key={rule.id} style={{ borderColor: '#1e1e1e' }}>
                  <Table.Td style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#6798ff', textTransform: 'lowercase' }}>
                    {rule.keyword}
                  </Table.Td>
                  <Table.Td style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', textAlign: 'right', color: '#ffffff' }}>
                    {rule.weight_per_unit}
                  </Table.Td>
                  <Table.Td style={{ fontSize: '12px', color: '#ffffff' }}>{rule.unit_label}</Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Switch
                      checked={rule.is_active}
                      onChange={() => handleToggleActive(rule)}
                      color="dataBlue"
                      size="xs"
                    />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="center" wrap="nowrap">
                      <ActionIcon variant="subtle" color="dataBlue" onClick={() => handleOpenEdit(rule)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(rule.id, rule.keyword)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      )}

      {/* Save Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={editingRule ? 'Modify Weight Rule' : 'Create Weight Rule'}
        centered
        size="sm"
        styles={{
          header: { backgroundColor: '#141414', color: '#ffffff', fontFamily: 'JetBrains Mono', borderBottom: '1px solid #313131' },
          content: { backgroundColor: '#141414', border: '1px solid #313131' },
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Match Keyword (e.g. cement)"
              placeholder="case-insensitive substring match"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              required
              disabled={!!editingRule} // don't change keyword once saved
              variant="filled"
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontFamily: 'JetBrains Mono', fontSize: '12px' },
              }}
            />

            <NumberInput
              label="Weight Per Unit (kg)"
              value={weight}
              onChange={(val) => setWeight(val)}
              min={0.1}
              required
              variant="filled"
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontFamily: 'JetBrains Mono', fontSize: '12px' },
              }}
            />

            <TextInput
              label="Unit Label (e.g. bag / sack / bale)"
              placeholder="e.g. bag"
              value={unitLabel}
              onChange={(e) => setUnitLabel(e.target.value)}
              required
              variant="filled"
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontFamily: 'JetBrains Mono', fontSize: '12px' },
              }}
            />

            <Switch
              label="Enable Rule Active"
              checked={isActive}
              onChange={(e) => setIsActive(e.currentTarget.checked)}
              color="dataBlue"
              styles={{
                label: { color: '#a7a7a7', fontFamily: 'JetBrains Mono', fontSize: '12px' },
              }}
            />

            <Button type="submit" style={{ backgroundColor: '#ffffff', color: '#0a0a0a', fontWeight: 600, fontFamily: 'JetBrains Mono' }} loading={submitting} fullWidth>
              SAVE CONVERTER RULE
            </Button>
          </Stack>
        </form>
      </Modal>
    </Paper>
  );
}
