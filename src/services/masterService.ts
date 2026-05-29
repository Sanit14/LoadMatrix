import { supabase, isMockSupabase } from './supabase';
import type { MasterRecord } from '../types';

// Local storage keys for mock mode
const MOCK_CUSTOMERS_KEY = 'atme_mock_customers';
const MOCK_RECEIVERS_KEY = 'atme_mock_receivers';

const DEFAULT_CUSTOMERS = [
  'Sharma Traders',
  'Patel & Sons',
  'Gupta Logistics',
  'Verma Cement Agency',
  'Balaji Enterprises',
  'Singhania Steel',
];

const DEFAULT_RECEIVERS: MasterRecord[] = [
  { id: '1', name: 'Delhi Warehouse A', city: 'Delhi' },
  { id: '2', name: 'Mumbai Hub B', city: 'Mumbai' },
  { id: '3', name: 'Nagpur Cold Storage', city: 'Nagpur' },
  { id: '4', name: 'Kolkata Depot 4', city: 'Kolkata' },
  { id: '5', name: 'Chennai Goods Yard', city: 'Chennai' },
];

export async function fetchCustomers(): Promise<string[]> {
  if (isMockSupabase) {
    const cached = localStorage.getItem(MOCK_CUSTOMERS_KEY);
    if (cached) return JSON.parse(cached);
    localStorage.setItem(MOCK_CUSTOMERS_KEY, JSON.stringify(DEFAULT_CUSTOMERS));
    return DEFAULT_CUSTOMERS;
  }

  try {
    const { data, error } = await supabase
      .from('customers_master')
      .select('name')
      .order('name', { ascending: true });

    if (error) throw error;
    return data.map((c) => c.name);
  } catch (err) {
    console.error('Error fetching customers:', err);
    return DEFAULT_CUSTOMERS; // fallback on error
  }
}

export async function fetchReceivers(): Promise<MasterRecord[]> {
  if (isMockSupabase) {
    const cached = localStorage.getItem(MOCK_RECEIVERS_KEY);
    if (cached) return JSON.parse(cached);
    localStorage.setItem(MOCK_RECEIVERS_KEY, JSON.stringify(DEFAULT_RECEIVERS));
    return DEFAULT_RECEIVERS;
  }

  try {
    const { data, error } = await supabase
      .from('receivers_master')
      .select('id, name, city')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as MasterRecord[];
  } catch (err) {
    console.error('Error fetching receivers:', err);
    return DEFAULT_RECEIVERS; // fallback on error
  }
}

export async function upsertMasterRecords(
  customers: string[],
  receivers: { name: string; city?: string }[]
): Promise<void> {
  if (isMockSupabase) {
    // Read local
    const cachedCustomers = await fetchCustomers();
    const cachedReceivers = await fetchReceivers();

    // Merge customers
    const updatedCustomers = Array.from(new Set([...cachedCustomers, ...customers]));
    localStorage.setItem(MOCK_CUSTOMERS_KEY, JSON.stringify(updatedCustomers));

    // Merge receivers
    const updatedReceivers = [...cachedReceivers];
    receivers.forEach((rec) => {
      if (!updatedReceivers.some((r) => r.name.toLowerCase() === rec.name.toLowerCase())) {
        updatedReceivers.push({
          id: crypto.randomUUID(),
          name: rec.name,
          city: rec.city || 'Unknown',
        });
      }
    });
    localStorage.setItem(MOCK_RECEIVERS_KEY, JSON.stringify(updatedReceivers));
    return;
  }

  try {
    // Prepare customer records
    if (customers.length > 0) {
      const customerInserts = customers.map((name) => ({ name }));
      await supabase.from('customers_master').upsert(customerInserts, { onConflict: 'name' });
    }

    // Prepare receiver records
    if (receivers.length > 0) {
      const receiverInserts = receivers.map((rec) => ({
        name: rec.name,
        city: rec.city || 'Unknown',
      }));
      await supabase.from('receivers_master').upsert(receiverInserts, { onConflict: 'name' });
    }
  } catch (err) {
    console.error('Error upserting master records:', err);
  }
}
