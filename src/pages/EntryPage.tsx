import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { TripHeaderStrip } from '../components/trip/TripHeaderStrip';
import { BiltiGrid } from '../components/bilti/BiltiGrid';
import { GridFooter } from '../components/footer/GridFooter';
import { ActionBar } from '../components/layout/ActionBar';
import { SavePrintModal } from '../components/modals/SavePrintModal';
import { PrintTemplate } from '../components/modals/PrintTemplate';
import { useTripStore } from '../stores/tripStore';
import { useBiltiStore, createEmptyBiltiRow } from '../stores/biltiStore';
import { useGlobalKeyboardShortcuts, focusCell } from '../hooks/useKeyboardNav';
import { manifestSchema } from '../utils/validators';
import type { ManifestSchemaType } from '../utils/validators';
import type { TripChallan, BiltiEntry } from '../types';
import { saveTripAndBiltis } from '../services/tripService';
import { fetchCustomers, fetchReceivers } from '../services/masterService';
import { supabase, isMockSupabase } from '../services/supabase';


export default function EntryPage() {
  const { tripData, resetTrip } = useTripStore();
  const { biltiRows, resetCanvas, setCustomersMaster, setReceiversMaster } = useBiltiStore();
  
  const [modalOpened, setModalOpened] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize react-hook-form
  const {
    control,
    register,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ManifestSchemaType>({
    resolver: zodResolver(manifestSchema),
    defaultValues: {
      trip: tripData,
      biltis: biltiRows,
    },
  });

  // Fetch Autocomplete lookup lists on mount
  useEffect(() => {
    async function loadMasterData() {
      try {
        const customers = await fetchCustomers();
        const receivers = await fetchReceivers();
        setCustomersMaster(customers);
        setReceiversMaster(receivers);
      } catch (err) {
        console.error('Failed to load master lookup lists:', err);
      }
    }
    loadMasterData();
  }, [setCustomersMaster, setReceiversMaster]);

  // Sync tripData from Zustand to the react-hook-form state whenever tripData updates in store
  useEffect(() => {
    setValue('trip', tripData);
  }, [tripData, setValue]);

  // Handle Save & Print action (F9 / Ctrl + S or button press)
  const triggerSavePrint = () => {
    // Collect errors from fields
    const currentValues = watch();
    
    // Explicitly validate with Zod schema
    const result = manifestSchema.safeParse(currentValues);
    
    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });
      setValidationErrors(errorMessages);
    } else {
      setValidationErrors([]);
    }
    
    setModalOpened(true);
  };

  // Bind global keyboard listener (F9 / Ctrl+S)
  useGlobalKeyboardShortcuts({ onSavePrint: triggerSavePrint });

  // Execute Save & Print database transactional flow
  const executeSaveAndPrint = async () => {
    const formValues = watch();
    
    // Final verification check
    const validation = manifestSchema.safeParse(formValues);
    if (!validation.success) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please resolve errors before saving.',
        color: 'red',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Commit to database
      const response = await saveTripAndBiltis(formValues.trip as TripChallan, formValues.biltis as BiltiEntry[]);
      
      if (!response.success) {
        throw new Error(response.error || 'Database insert failed.');
      }

      // 2. Trigger Silent Print (Uses native print media stylesheets to target the #print-manifest-template)
      window.print();

      // 2b. Update status to printed
      if (response.challan?.id) {
        if (isMockSupabase) {
          const trips = JSON.parse(localStorage.getItem('atme_mock_trips') || '[]');
          const updated = trips.map((t: any) => (t.id === response.challan?.id ? { ...t, status: 'printed' } : t));
          localStorage.setItem('atme_mock_trips', JSON.stringify(updated));
        } else {
          await supabase
            .from('trip_challans')
            .update({ status: 'printed' })
            .eq('id', response.challan.id);
        }
      }


      // 3. Clear Screen & Canvas
      resetTrip();
      resetCanvas();
      
      // Reset react-hook-form inputs
      reset({
        trip: {
          challan_no: '',
          truck_no: '',
          driver_name: '',
          origin: '',
          destination: '',
          trip_date: new Date().toISOString().split('T')[0],
        },
        biltis: [createEmptyBiltiRow()],
      });

      // Show Toast Notification
      notifications.show({
        title: 'Manifest Saved & Printed',
        message: `Challan ${response.challan?.challan_no || formValues.trip.challan_no} uploaded and printed successfully ✓`,
        color: 'green',
        autoClose: 5000,
      });

      setModalOpened(false);
      
      // Refocus the Challan No input cell
      focusCell(0, 'bilti_no');
      setTimeout(() => {
        const challanInput = document.querySelector('input[placeholder="e.g. TRP-0041"]') as HTMLInputElement | null;
        if (challanInput) challanInput.focus();
      }, 50);

    } catch (err: any) {
      notifications.show({
        title: 'Transaction Failed',
        message: err.message || 'An unexpected error occurred.',
        color: 'red',
        autoClose: 10000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Watch the fields live to compute footer totals
  const watchedBiltis = watch('biltis') || [];
  const biltiCount = watchedBiltis.length;
  const totalItems = watchedBiltis.reduce((sum, b) => sum + (Number(b.items_count) || 0), 0);
  const totalWeight = watchedBiltis.reduce((sum, b) => sum + (Number(b.weight_numeric) || 0), 0);

  const handleManualAddRow = () => {
    const currentBiltis = watch('biltis') || [];
    setValue('biltis', [...currentBiltis, createEmptyBiltiRow()]);
    focusCell(currentBiltis.length, 'bilti_no');
  };

  const handleManualReset = () => {
    resetTrip();
    resetCanvas();
    reset({
      trip: {
        challan_no: '',
        truck_no: '',
        driver_name: '',
        origin: '',
        destination: '',
        trip_date: new Date().toISOString().split('T')[0],
      },
      biltis: [createEmptyBiltiRow()],
    });
    notifications.show({
      title: 'Canvas Cleared',
      message: 'Workspace reset to clean slate.',
      color: 'blue',
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full mx-auto gap-4">
      {/* Hidden printable A4 sheet component */}
      <PrintTemplate />

      <div className="flex-1 flex flex-col overflow-hidden gap-4">
        {/* Challan Headers Strip */}
        <TripHeaderStrip />
        
        {/* Core Entry Table */}
        <div className="flex-1 min-h-0 bg-terminal-panel border border-terminal-default rounded flex flex-col overflow-hidden">
          <BiltiGrid
            control={control}
            register={register}
            setValue={setValue}
            errors={errors}
          />
          
          {/* Live Computations Footer */}
          <GridFooter
            biltiCount={biltiCount}
            totalItems={totalItems}
            totalWeight={totalWeight}
          />
        </div>
      </div>

      {/* Actions Bottom Bar */}
      <ActionBar
        onAddRow={handleManualAddRow}
        onReset={handleManualReset}
        onSavePrint={triggerSavePrint}
        isSubmitting={isSubmitting}
      />

      {/* Save Manifest Confirmation dialog */}
      <SavePrintModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        tripData={watch('trip') as TripChallan}
        biltis={watch('biltis') as BiltiEntry[]}
        validationErrors={validationErrors}
        isSubmitting={isSubmitting}
        onConfirm={executeSaveAndPrint}
      />
    </div>
  );
}
