import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Center, Loader } from '@mantine/core';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'supervisor';
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <Center style={{ width: '100vw', height: '100vh', backgroundColor: '#0a0a0a' }}>
        <Loader color="dataBlue" size="lg" />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole === 'supervisor' && profile?.role !== 'supervisor') {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
