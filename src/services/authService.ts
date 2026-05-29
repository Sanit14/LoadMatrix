import { supabase, isMockSupabase } from './supabase';
import type { UserProfile } from '../stores/authStore';
import type { User } from '@supabase/supabase-js';

export async function signInWithPassword(email: string, password?: string) {
  if (isMockSupabase) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Custom dummy users for mock development
    const role: 'clerk' | 'supervisor' = email.includes('supervisor') ? 'supervisor' : 'clerk';
    const name = role === 'supervisor' ? 'Supervisor Sanjay' : 'Clerk Ramesh';
    
    const mockUser: User = {
      id: role === 'supervisor' ? 'mock-supervisor-id' : 'mock-clerk-id',
      email,
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
    };

    const mockProfile: UserProfile = {
      id: mockUser.id,
      full_name: name,
      role,
      is_active: true,
    };

    localStorage.setItem('atme_mock_user', JSON.stringify(mockUser));
    localStorage.setItem('atme_mock_profile', JSON.stringify(mockProfile));

    return { data: { user: mockUser, session: { user: mockUser } }, error: null };
  }

  return supabase.auth.signInWithPassword({ email, password: password || '' });
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (isMockSupabase) {
    const profileStr = localStorage.getItem('atme_mock_profile');
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      if (profile.id === userId) return profile;
    }
    // Default fallback
    return {
      id: userId,
      full_name: userId === 'mock-supervisor-id' ? 'Supervisor Sanjay' : 'Clerk Ramesh',
      role: userId === 'mock-supervisor-id' ? 'supervisor' : 'clerk',
      is_active: true,
    };
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    return null;
  }
}

export async function signOut() {
  if (isMockSupabase) {
    localStorage.removeItem('atme_mock_user');
    localStorage.removeItem('atme_mock_profile');
    return { error: null };
  }
  return supabase.auth.signOut();
}
