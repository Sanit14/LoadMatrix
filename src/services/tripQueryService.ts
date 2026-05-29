import { supabase, isMockSupabase } from './supabase';
import type { TripChallan, BiltiEntry } from '../types';

export interface TripWithBiltis extends TripChallan {
  bilti_entries?: BiltiEntry[];
  clerk?: { full_name: string; role: string };
  user_profiles?: { full_name: string; role: string }; // Supabase joins
}

export async function fetchTodayTrips(clerkId?: string, isSupervisor?: boolean): Promise<TripWithBiltis[]> {
  const today = new Date().toISOString().split('T')[0];
  
  if (isMockSupabase) {
    const trips: TripWithBiltis[] = JSON.parse(localStorage.getItem('atme_mock_trips') || '[]');
    const filtered = trips.filter((t) => {
      const matchDate = t.trip_date === today || (t.created_at && t.created_at.startsWith(today));
      if (!matchDate) return false;
      if (isSupervisor) return true;
      return t.clerk_id === clerkId;
    });
    return filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
  }

  try {
    let query = supabase
      .from('trip_challans')
      .select('*, user_profiles(full_name, role)')
      .gte('trip_date', today);

    if (!isSupervisor && clerkId) {
      query = query.eq('clerk_id', clerkId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    
    // Map user_profiles -> clerk for interface compatibility
    return (data || []).map((t: any) => ({
      ...t,
      clerk: t.user_profiles
    }));
  } catch (err) {
    console.error('Failed to fetch today\'s trips:', err);
    return [];
  }
}

export async function fetchTripDetails(id: string): Promise<TripWithBiltis | null> {
  if (isMockSupabase) {
    const trips: TripChallan[] = JSON.parse(localStorage.getItem('atme_mock_trips') || '[]');
    const biltis: BiltiEntry[] = JSON.parse(localStorage.getItem('atme_mock_biltis') || '[]');
    const trip = trips.find((t) => t.id === id);
    if (!trip) return null;

    const tripBiltis = biltis.filter((b) => b.challan_id === id);
    
    let clerkName = 'Clerk Ramesh';
    if (trip.clerk_id === 'mock-supervisor-id') {
      clerkName = 'Supervisor Sanjay';
    }
    return {
      ...trip,
      bilti_entries: tripBiltis,
      clerk: { full_name: clerkName, role: trip.clerk_id === 'mock-supervisor-id' ? 'supervisor' : 'clerk' }
    };
  }

  try {
    const { data: tripData, error: tripError } = await supabase
      .from('trip_challans')
      .select('*, user_profiles(full_name, role)')
      .eq('id', id)
      .single();

    if (tripError) throw tripError;

    const { data: biltiData, error: biltiError } = await supabase
      .from('bilti_entries')
      .select('*')
      .eq('challan_id', id);

    if (biltiError) throw biltiError;

    return {
      ...tripData,
      bilti_entries: biltiData || [],
      clerk: tripData.user_profiles
    };
  } catch (err) {
    console.error('Failed to fetch trip details:', err);
    return null;
  }
}

export interface HistoryFilterParams {
  dateFrom?: Date | null;
  dateTo?: Date | null;
  search?: string;
  status?: string;
  clerkId?: string;
  page: number;
  pageSize: number;
}

export interface HistoryResult {
  trips: TripWithBiltis[];
  totalCount: number;
}

export async function fetchTripHistory(
  params: HistoryFilterParams,
  currentUserClerkId?: string,
  isSupervisor?: boolean
): Promise<HistoryResult> {
  const { dateFrom, dateTo, search, status, clerkId, page, pageSize } = params;

  if (isMockSupabase) {
    let trips: TripWithBiltis[] = JSON.parse(localStorage.getItem('atme_mock_trips') || '[]');
    
    // RLS emulation
    if (!isSupervisor && currentUserClerkId) {
      trips = trips.filter((t) => t.clerk_id === currentUserClerkId);
    } else if (clerkId) {
      trips = trips.filter((t) => t.clerk_id === clerkId);
    }

    // Apply filters
    if (dateFrom) {
      const fromStr = dateFrom.toISOString().split('T')[0];
      trips = trips.filter((t) => t.trip_date >= fromStr);
    }
    if (dateTo) {
      const toStr = dateTo.toISOString().split('T')[0];
      trips = trips.filter((t) => t.trip_date <= toStr);
    }
    if (search) {
      const s = search.toLowerCase();
      trips = trips.filter(
        (t) =>
          t.challan_no.toLowerCase().includes(s) ||
          t.truck_no.toLowerCase().includes(s) ||
          t.driver_name.toLowerCase().includes(s)
      );
    }
    if (status && status !== 'ALL') {
      trips = trips.filter((t) => t.status === status);
    }

    const totalCount = trips.length;
    // Pagination
    const sorted = trips.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    const startIdx = (page - 1) * pageSize;
    const paginated = sorted.slice(startIdx, startIdx + pageSize);

    // Map clerk name
    const resultTrips = paginated.map((t) => {
      let clerkName = 'Clerk Ramesh';
      if (t.clerk_id === 'mock-supervisor-id') {
        clerkName = 'Supervisor Sanjay';
      }
      return {
        ...t,
        clerk: { full_name: clerkName, role: t.clerk_id === 'mock-supervisor-id' ? 'supervisor' : 'clerk' }
      };
    });

    return { trips: resultTrips, totalCount };
  }

  try {
    let countQuery = supabase
      .from('trip_challans')
      .select('*', { count: 'exact', head: true });

    let dataQuery = supabase
      .from('trip_challans')
      .select('*, user_profiles(full_name, role)');

    // RLS check
    if (!isSupervisor && currentUserClerkId) {
      countQuery = countQuery.eq('clerk_id', currentUserClerkId);
      dataQuery = dataQuery.eq('clerk_id', currentUserClerkId);
    } else if (clerkId) {
      countQuery = countQuery.eq('clerk_id', clerkId);
      dataQuery = dataQuery.eq('clerk_id', clerkId);
    }

    if (dateFrom) {
      const fromStr = dateFrom.toISOString().split('T')[0];
      countQuery = countQuery.gte('trip_date', fromStr);
      dataQuery = dataQuery.gte('trip_date', fromStr);
    }
    if (dateTo) {
      const toStr = dateTo.toISOString().split('T')[0];
      countQuery = countQuery.lte('trip_date', toStr);
      dataQuery = dataQuery.lte('trip_date', toStr);
    }
    if (search) {
      const term = `%${search}%`;
      countQuery = countQuery.or(`challan_no.ilike.${term},truck_no.ilike.${term},driver_name.ilike.${term}`);
      dataQuery = dataQuery.or(`challan_no.ilike.${term},truck_no.ilike.${term},driver_name.ilike.${term}`);
    }
    if (status && status !== 'ALL') {
      countQuery = countQuery.eq('status', status);
      dataQuery = dataQuery.eq('status', status);
    }

    // Get count
    const { count, error: countError } = await countQuery;
    if (countError) throw countError;

    // Get paginated data
    const startIdx = (page - 1) * pageSize;
    const { data, error: dataError } = await dataQuery
      .order('created_at', { ascending: false })
      .range(startIdx, startIdx + pageSize - 1);

    if (dataError) throw dataError;

    const trips = (data || []).map((t: any) => ({
      ...t,
      clerk: t.user_profiles
    }));

    return { trips, totalCount: count || 0 };
  } catch (err) {
    console.error('Failed to query trip history:', err);
    return { trips: [], totalCount: 0 };
  }
}

export async function reprintTrip(id: string): Promise<boolean> {
  try {
    const tripDetails = await fetchTripDetails(id);
    if (!tripDetails) return false;

    const { buildManifestHTML, triggerPrint } = await import('./printService');
    const html = buildManifestHTML(tripDetails, tripDetails.bilti_entries || []);
    await triggerPrint(html);

    // Update status to printed
    if (isMockSupabase) {
      const trips = JSON.parse(localStorage.getItem('atme_mock_trips') || '[]');
      const updated = trips.map((t: any) => (t.id === id ? { ...t, status: 'printed' } : t));
      localStorage.setItem('atme_mock_trips', JSON.stringify(updated));
    } else {
      await supabase
        .from('trip_challans')
        .update({ status: 'printed' })
        .eq('id', id);
    }
    return true;
  } catch (err) {
    console.error('Reprint operation failed:', err);
    return false;
  }
}

