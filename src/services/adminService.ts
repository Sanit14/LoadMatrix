import { supabase, isMockSupabase } from './supabase';
import type { UserProfile } from '../stores/authStore';
import type { GoodsWeightRule } from '../stores/rulesStore';
import type { MasterRecord } from '../types';

/* ==============================================================
   1. Clerks / User Profiles CRUD
   ============================================================== */

export async function fetchAllClerks(): Promise<UserProfile[]> {
  if (isMockSupabase) {
    const cached = localStorage.getItem('atme_mock_user_profiles');
    if (cached) return JSON.parse(cached);
    
    // Seed default profiles
    const defaultProfiles: UserProfile[] = [
      { id: 'mock-supervisor-id', full_name: 'Supervisor Sanjay', role: 'supervisor', is_active: true },
      { id: 'mock-clerk-id', full_name: 'Clerk Ramesh', role: 'clerk', is_active: true },
    ];
    localStorage.setItem('atme_mock_user_profiles', JSON.stringify(defaultProfiles));
    return defaultProfiles;
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching clerks:', err);
    return [];
  }
}

export async function createClerk(
  email: string,
  password?: string,
  fullName?: string,
  role?: 'clerk' | 'supervisor'
): Promise<{ success: boolean; error?: string }> {
  const fName = fullName || 'New Clerk';
  const uRole = role || 'clerk';

  if (isMockSupabase) {
    const cached = localStorage.getItem('atme_mock_user_profiles');
    const profiles: UserProfile[] = cached ? JSON.parse(cached) : [];
    
    const newId = `mock-user-${crypto.randomUUID()}`;
    const newProfile: UserProfile = {
      id: newId,
      full_name: fName,
      role: uRole,
      is_active: true,
    };
    
    profiles.push(newProfile);
    localStorage.setItem('atme_mock_user_profiles', JSON.stringify(profiles));
    return { success: true };
  }

  try {
    // 1. Create authentication user via auth admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: password || 'TempPass123!',
      email_confirm: true,
      user_metadata: { full_name: fName, role: uRole },
    });

    if (error) throw error;

    // 2. Insert corresponding profile row
    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: data.user.id,
      full_name: fName,
      role: uRole,
      is_active: true,
    });

    if (profileError) throw profileError;

    return { success: true };
  } catch (err: any) {
    console.error('Error creating clerk:', err);
    return { success: false, error: err.message || 'Failed to create clerk' };
  }
}

export async function updateClerkProfile(
  id: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  if (isMockSupabase) {
    const cached = localStorage.getItem('atme_mock_user_profiles');
    if (!cached) return { success: false, error: 'No profiles found' };
    
    const profiles: UserProfile[] = JSON.parse(cached);
    const updated = profiles.map((p) => (p.id === id ? { ...p, ...updates } : p));
    localStorage.setItem('atme_mock_user_profiles', JSON.stringify(updated));
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error updating clerk:', err);
    return { success: false, error: err.message || 'Failed to update clerk' };
  }
}

/* ==============================================================
   2. Goods Weight Rules CRUD
   ============================================================== */

export async function fetchAllWeightRules(): Promise<GoodsWeightRule[]> {
  if (isMockSupabase) {
    const cached = localStorage.getItem('atme_mock_rules');
    if (cached) return JSON.parse(cached);
    
    const defaultRules: GoodsWeightRule[] = [
      { id: '1', keyword: 'cement', weight_per_unit: 50, unit_label: 'bag', is_active: true },
      { id: '2', keyword: 'rice', weight_per_unit: 50, unit_label: 'sack', is_active: true },
      { id: '3', keyword: 'wheat', weight_per_unit: 50, unit_label: 'sack', is_active: true },
      { id: '4', keyword: 'sugar', weight_per_unit: 50, unit_label: 'bag', is_active: true },
      { id: '5', keyword: 'fertilizer', weight_per_unit: 45, unit_label: 'bag', is_active: true },
      { id: '6', keyword: 'cotton', weight_per_unit: 170, unit_label: 'bale', is_active: true },
    ];
    localStorage.setItem('atme_mock_rules', JSON.stringify(defaultRules));
    return defaultRules;
  }

  try {
    const { data, error } = await supabase
      .from('goods_weight_rules')
      .select('*')
      .order('keyword', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching weight rules:', err);
    return [];
  }
}

export async function saveWeightRule(
  rule: Omit<GoodsWeightRule, 'id'> & { id?: string }
): Promise<{ success: boolean; rule?: GoodsWeightRule; error?: string }> {
  if (isMockSupabase) {
    const cached = localStorage.getItem('atme_mock_rules');
    const rules: GoodsWeightRule[] = cached ? JSON.parse(cached) : [];
    
    if (rule.id) {
      // Edit
      const updatedRules = rules.map((r) => {
        if (r.id === rule.id) {
          return { ...r, ...rule } as GoodsWeightRule;
        }
        return r;
      });
      localStorage.setItem('atme_mock_rules', JSON.stringify(updatedRules));
      return { success: true, rule: rule as GoodsWeightRule };
    } else {
      // Add
      const newRule: GoodsWeightRule = {
        ...rule,
        id: crypto.randomUUID(),
      };
      // Check conflict
      if (rules.some((r) => r.keyword.toLowerCase() === rule.keyword.toLowerCase())) {
        return { success: false, error: 'Rule with this keyword already exists' };
      }
      rules.push(newRule);
      localStorage.setItem('atme_mock_rules', JSON.stringify(rules));
      return { success: true, rule: newRule };
    }
  }

  try {
    if (rule.id) {
      const { data, error } = await supabase
        .from('goods_weight_rules')
        .update(rule)
        .eq('id', rule.id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, rule: data };
    } else {
      const { data, error } = await supabase
        .from('goods_weight_rules')
        .insert([rule])
        .select()
        .single();
      if (error) throw error;
      return { success: true, rule: data };
    }
  } catch (err: any) {
    console.error('Error saving weight rule:', err);
    return { success: false, error: err.message || 'Failed to save weight rule' };
  }
}

export async function deleteWeightRule(id: string): Promise<{ success: boolean; error?: string }> {
  if (isMockSupabase) {
    const cached = localStorage.getItem('atme_mock_rules');
    if (!cached) return { success: false, error: 'No rules found' };
    const rules: GoodsWeightRule[] = JSON.parse(cached);
    const filtered = rules.filter((r) => r.id !== id);
    localStorage.setItem('atme_mock_rules', JSON.stringify(filtered));
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('goods_weight_rules')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting rule:', err);
    return { success: false, error: err.message || 'Failed to delete rule' };
  }
}

/* ==============================================================
   3. Master Data CRUD (for Customers & Receivers Edit)
   ============================================================== */

export async function addCustomer(name: string): Promise<{ success: boolean; error?: string }> {
  if (isMockSupabase) {
    const cached = localStorage.getItem('atme_mock_customers');
    const list: string[] = cached ? JSON.parse(cached) : [];
    if (list.includes(name)) return { success: false, error: 'Customer already exists' };
    list.push(name);
    localStorage.setItem('atme_mock_customers', JSON.stringify(list));
    return { success: true };
  }

  try {
    const { error } = await supabase.from('customers_master').insert([{ name }]);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error adding customer:', err);
    return { success: false, error: err.message || 'Failed to add customer' };
  }
}

export async function deleteCustomer(name: string): Promise<{ success: boolean; error?: string }> {
  if (isMockSupabase) {
    const cached = localStorage.getItem('atme_mock_customers');
    if (!cached) return { success: false, error: 'No customer data' };
    const list: string[] = JSON.parse(cached);
    const filtered = list.filter((n) => n !== name);
    localStorage.setItem('atme_mock_customers', JSON.stringify(filtered));
    return { success: true };
  }

  try {
    const { error } = await supabase.from('customers_master').delete().eq('name', name);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting customer:', err);
    return { success: false, error: err.message || 'Failed to delete customer' };
  }
}

export async function addReceiver(name: string, city: string): Promise<{ success: boolean; error?: string }> {
  if (isMockSupabase) {
    const cached = localStorage.getItem('atme_mock_receivers');
    const list: MasterRecord[] = cached ? JSON.parse(cached) : [];
    if (list.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      return { success: false, error: 'Receiver already exists' };
    }
    list.push({ id: crypto.randomUUID(), name, city });
    localStorage.setItem('atme_mock_receivers', JSON.stringify(list));
    return { success: true };
  }

  try {
    const { error } = await supabase.from('receivers_master').insert([{ name, city }]);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error adding receiver:', err);
    return { success: false, error: err.message || 'Failed to add receiver' };
  }
}

export async function deleteReceiver(id: string): Promise<{ success: boolean; error?: string }> {
  if (isMockSupabase) {
    const cached = localStorage.getItem('atme_mock_receivers');
    if (!cached) return { success: false, error: 'No receivers data' };
    const list: MasterRecord[] = JSON.parse(cached);
    const filtered = list.filter((r) => r.id !== id);
    localStorage.setItem('atme_mock_receivers', JSON.stringify(filtered));
    return { success: true };
  }

  try {
    const { error } = await supabase.from('receivers_master').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting receiver:', err);
    return { success: false, error: err.message || 'Failed to delete receiver' };
  }
}
