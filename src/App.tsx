import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { supabase, isMockSupabase } from './services/supabase';
import { useAuthStore } from './stores/authStore';
import { fetchUserProfile } from './services/authService';
import { useRulesStore } from './stores/rulesStore';
import { Loader, Center } from '@mantine/core';

export default function App() {
  const { setUser, setProfile, setLoading, isLoading } = useAuthStore();
  const { fetchRules } = useRulesStore();

  useEffect(() => {
    // 1. Initial rules load
    fetchRules();

    // 2. Auth session restore
    if (isMockSupabase) {
      const mockUserStr = localStorage.getItem('atme_mock_user');
      const mockProfileStr = localStorage.getItem('atme_mock_profile');
      if (mockUserStr && mockProfileStr) {
        setUser(JSON.parse(mockUserStr));
        setProfile(JSON.parse(mockProfileStr));
      }
      setLoading(false);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          fetchUserProfile(session.user.id).then(setProfile);
        } else {
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setProfile(profile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, [setUser, setProfile, setLoading, fetchRules]);

  if (isLoading) {
    return (
      <Center style={{ width: '100vw', height: '100vh', backgroundColor: '#0a0a0a' }}>
        <Loader color="dataBlue" size="lg" />
      </Center>
    );
  }

  return <RouterProvider router={router} />;
}
