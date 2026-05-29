import { Modal, Button, Group, Text, Alert, LoadingOverlay, Card, Grid } from '@mantine/core';
import { IconAlertTriangle, IconPrinter, IconCircleCheck } from '@tabler/icons-react';
import type { TripChallan, BiltiEntry } from '../../types';
import { formatWeight } from '../../utils/formatters';

interface SavePrintModalProps {
  opened: boolean;
  onClose: () => void;
  tripData: TripChallan;
  biltis: BiltiEntry[];
  validationErrors: string[];
  isSubmitting: boolean;
  onConfirm: () => void;
}

export function SavePrintModal({
  opened,
  onClose,
  tripData,
  biltis,
  validationErrors,
  isSubmitting,
  onConfirm,
}: SavePrintModalProps) {
  const hasErrors = validationErrors.length > 0;
  
  const totalItems = biltis.reduce((sum, b) => sum + (Number(b.items_count) || 0), 0);
  const totalWeight = biltis.reduce((sum, b) => sum + (Number(b.weight_numeric) || 0), 0);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text className="font-mono font-bold text-data-blue uppercase tracking-widest flex items-center gap-2">
          <IconPrinter className="w-4 h-4 text-data-blue" />
          Review & Commit Manifest
        </Text>
      }
      centered
      size="md"
      overlayProps={{
        backgroundOpacity: 0.7,
        blur: 3,
      }}
      styles={{
        content: {
          backgroundColor: '#141414',
          border: '1px solid #313131',
          color: '#ffffff',
        },
        header: {
          backgroundColor: '#141414',
          borderBottom: '1px solid #313131',
          color: '#ffffff',
        },
      }}
    >
      <div className="relative py-2">
        <LoadingOverlay
          visible={isSubmitting}
          overlayProps={{ blur: 1, backgroundOpacity: 0.6, color: '#0a0a0a' }}
          loaderProps={{ color: 'dataBlue', type: 'bars' }}
        />

        {/* Validation Errors Alert Box */}
        {hasErrors && (
          <Alert
            icon={<IconAlertTriangle size="1rem" />}
            title="Validation Errors Found"
            color="red"
            variant="filled"
            className="mb-4 font-mono text-xs"
          >
            <ul className="list-disc pl-4 mt-1 space-y-1">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </Alert>
        )}

        {!hasErrors && (
          <div className="space-y-4 font-mono">
            {/* Trip Challan Metadata Card */}
            <Card bg="#0a0a0a" className="border border-terminal-default rounded p-3 select-none">
              <Text className="text-data-blue text-[11px] uppercase tracking-wider mb-2 font-bold">
                Trip Specifications
              </Text>
              
              <Grid gutter="xs" className="text-xs">
                <Grid.Col span={6}>
                  <Text span className="text-gray-500 font-sans">Challan:</Text>{' '}
                  <span className="text-white font-bold">{tripData.challan_no || 'N/A'}</span>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text span className="text-gray-500 font-sans">Truck No:</Text>{' '}
                  <span className="text-white font-bold">{tripData.truck_no || 'N/A'}</span>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text span className="text-gray-500 font-sans">Driver:</Text>{' '}
                  <span className="text-white">{tripData.driver_name || 'N/A'}</span>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text span className="text-gray-500 font-sans">Date:</Text>{' '}
                  <span className="text-white">{tripData.trip_date || 'N/A'}</span>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Text span className="text-gray-500 font-sans">Route:</Text>{' '}
                  <span className="text-white">
                    {tripData.origin || 'N/A'} → {tripData.destination || 'N/A'}
                  </span>
                </Grid.Col>
              </Grid>
            </Card>

            {/* Calculations and Load Summary Card */}
            <Card bg="#0a0a0a" className="border border-terminal-default rounded p-3 select-none">
              <Text className="text-data-blue text-[11px] uppercase tracking-wider mb-2 font-bold">
                Consignments Summary
              </Text>
              
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-sans">Total Bilti Slips:</span>
                  <span className="text-success font-bold">{biltis.length} biltis</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-sans">Sum of Loaded Items:</span>
                  <span className="text-info font-bold">{totalItems} bags/items</span>
                </div>
                <div className="flex justify-between border-t border-terminal-default pt-1.5 mt-1">
                  <span className="text-gray-500 font-sans font-semibold">Total Tonnage (Weight):</span>
                  <span className="text-data-blue font-extrabold">{formatWeight(totalWeight)}</span>
                </div>
              </div>
            </Card>

            <Text size="xs" color="dimmed" className="font-sans leading-relaxed text-center block px-4 text-gray-500 select-none">
              Confirming this transaction will write the manifest to Supabase, update the master lookup directory, print the A4 manifest sheet, and clear the local screen canvas.
            </Text>
          </div>
        )}

        {/* Modal Action Controls */}
        <Group justify="flex-end" className="mt-5 border-t border-terminal-default pt-4">
          <Button
            variant="subtle"
            color="gray"
            onClick={onClose}
            className="font-mono text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
          
          {!hasErrors && (
            <Button
              leftSection={<IconCircleCheck className="w-4 h-4" />}
              onClick={onConfirm}
              style={{ backgroundColor: '#ffffff', color: '#0a0a0a', border: 0 }}
              className="font-mono text-xs font-bold hover:bg-silver-dust transition"
            >
              Confirm & Commit
            </Button>
          )}
        </Group>
      </div>
    </Modal>
  );
}
