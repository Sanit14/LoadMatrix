import { supabase, isMockSupabase } from './supabase';
import type { TripChallan, BiltiEntry } from '../types';
import { upsertMasterRecords } from './masterService';
import { useAuthStore } from '../stores/authStore';

export interface SaveTripResult {
  success: boolean;
  challan?: TripChallan;
  error?: string;
}

export async function saveTripAndBiltis(
  trip: TripChallan,
  biltis: BiltiEntry[]
): Promise<SaveTripResult> {
  const totalBiltis = biltis.length;
  const totalItems = biltis.reduce((sum, b) => sum + (b.items_count || 0), 0);
  const totalWeight = biltis.reduce((sum, b) => sum + (b.weight_numeric || 0), 0);

  const tripData: any = {
    ...trip,
    total_biltis: totalBiltis,
    total_items: totalItems,
    total_weight: totalWeight,
    clerk_id: useAuthStore.getState().user?.id,
    status: 'saved',
  };


  if (isMockSupabase) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Save to local storage for demonstration
    const mockTripId = crypto.randomUUID();
    const savedTrip = { ...tripData, id: mockTripId, created_at: new Date().toISOString() };
    const savedBiltis = biltis.map((b) => ({
      ...b,
      id: crypto.randomUUID(),
      challan_id: mockTripId,
      created_at: new Date().toISOString(),
    }));

    // Retrieve existing mock database from localStorage
    const existingTrips = JSON.parse(localStorage.getItem('atme_mock_trips') || '[]');
    const existingBiltis = JSON.parse(localStorage.getItem('atme_mock_biltis') || '[]');

    localStorage.setItem('atme_mock_trips', JSON.stringify([...existingTrips, savedTrip]));
    localStorage.setItem('atme_mock_biltis', JSON.stringify([...existingBiltis, ...savedBiltis]));

    // Background fire-and-forget upsert of master lists
    const uniqueCustomers = Array.from(new Set(biltis.map((b) => b.customer_name).filter(Boolean)));
    const uniqueReceivers = biltis
      .map((b) => ({ name: b.receiver_name }))
      .filter((r) => r.name);
    upsertMasterRecords(uniqueCustomers, uniqueReceivers).catch(console.error);

    return {
      success: true,
      challan: savedTrip,
    };
  }

  try {
    // 1. Insert Trip Challan
    const { data: challanData, error: challanError } = await supabase
      .from('trip_challans')
      .insert([tripData])
      .select()
      .single();

    if (challanError) {
      throw new Error(`Failed to insert trip challan: ${challanError.message}`);
    }

    // 2. Insert Biltis with challan_id reference
    const biltiInserts = biltis.map((b) => ({
      challan_id: challanData.id,
      bilti_no: b.bilti_no,
      customer_name: b.customer_name,
      receiver_name: b.receiver_name,
      goods_type: b.goods_type,
      items_count: b.items_count,
      weight_numeric: b.weight_numeric,
      weight_auto_calculated: b.weight_auto_calculated,
    }));

    const { error: biltisError } = await supabase.from('bilti_entries').insert(biltiInserts);

    if (biltisError) {
      // Note: In case of error, we rely on Supabase foreign keys cascade or we log the critical error
      throw new Error(`Failed to insert bilti entries: ${biltisError.message}`);
    }

    // 3. Upsert master records (background fire-and-forget)
    const uniqueCustomers = Array.from(new Set(biltis.map((b) => b.customer_name).filter(Boolean)));
    const uniqueReceivers = biltis
      .map((b) => ({ name: b.receiver_name }))
      .filter((r) => r.name);
    upsertMasterRecords(uniqueCustomers, uniqueReceivers).catch(console.error);

    return {
      success: true,
      challan: challanData,
    };
  } catch (err: any) {
    console.error('Save manifest database transaction failed:', err);
    return {
      success: false,
      error: err.message || 'Unknown database error occurred',
    };
  }
}
