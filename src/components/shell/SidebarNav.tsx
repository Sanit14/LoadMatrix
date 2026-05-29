import { NavLink, Divider, Stack } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  IconHome,
  IconTruckLoading,
  IconListCheck,
  IconHistory,
  IconShieldLock,
  IconUsers,
  IconDatabase,
  IconScale,
  IconTable,
} from '@tabler/icons-react';

interface SidebarNavProps {
  toggleMobile?: () => void;
}

export function SidebarNav({ toggleMobile }: SidebarNavProps) {
  const location = useLocation();
  const { isSupervisor } = useAuthStore();
  const supervisor = isSupervisor();

  const handleLinkClick = () => {
    if (toggleMobile) toggleMobile();
  };

  const isRouteActive = (path: string) => {
    return location.pathname === path || (path !== '/home' && location.pathname.startsWith(path));
  };

  return (
    <Stack gap="xs" style={{ height: '100%' }}>
      <NavLink
        component={Link}
        to="/home"
        label="Home"
        leftSection={<IconHome size={18} />}
        active={location.pathname === '/home'}
        onClick={handleLinkClick}
        color="dataBlue"
        variant="light"
        styles={{
          label: { fontSize: '13px', fontWeight: 600 },
        }}
      />
      <NavLink
        component={Link}
        to="/entry"
        label="New entry"
        leftSection={<IconTruckLoading size={18} />}
        active={location.pathname === '/entry'}
        onClick={handleLinkClick}
        color="dataBlue"
        variant="light"
        styles={{
          label: { fontSize: '13px', fontWeight: 600 },
          root: location.pathname === '/entry' ? { borderLeft: '3px solid #6798ff' } : {},
        }}
      />
      <NavLink
        component={Link}
        to="/trips/today"
        label="Today's trips"
        leftSection={<IconListCheck size={18} />}
        active={isRouteActive('/trips/today')}
        onClick={handleLinkClick}
        color="dataBlue"
        variant="light"
        styles={{
          label: { fontSize: '13px', fontWeight: 600 },
        }}
      />
      <NavLink
        component={Link}
        to="/history"
        label="Trip history"
        leftSection={<IconHistory size={18} />}
        active={isRouteActive('/history')}
        onClick={handleLinkClick}
        color="dataBlue"
        variant="light"
        styles={{
          label: { fontSize: '13px', fontWeight: 600 },
        }}
      />

      {supervisor && (
        <>
          <Divider my="sm" label="Supervisor Controls" labelPosition="center" styles={{ label: { fontSize: '10px', color: '#a7a7a7' } }} />
          <NavLink
            component={Link}
            to="/admin"
            label="Admin Panel"
            leftSection={<IconShieldLock size={18} />}
            active={location.pathname.startsWith('/admin')}
            defaultOpened
            color="dataBlue"
            variant="light"
            styles={{
              label: { fontSize: '13px', fontWeight: 600 },
            }}
          >
            <NavLink
              component={Link}
              to="/admin/clerks"
              label="Clerks"
              leftSection={<IconUsers size={16} />}
              active={location.pathname === '/admin/clerks'}
              onClick={handleLinkClick}
              color="dataBlue"
              variant="subtle"
              styles={{
                label: { fontSize: '12px' },
              }}
            />
            <NavLink
              component={Link}
              to="/admin/masters"
              label="Master Data"
              leftSection={<IconDatabase size={16} />}
              active={location.pathname === '/admin/masters'}
              onClick={handleLinkClick}
              color="dataBlue"
              variant="subtle"
              styles={{
                label: { fontSize: '12px' },
              }}
            />
            <NavLink
              component={Link}
              to="/admin/rules"
              label="Weight Rules"
              leftSection={<IconScale size={16} />}
              active={location.pathname === '/admin/rules'}
              onClick={handleLinkClick}
              color="dataBlue"
              variant="subtle"
              styles={{
                label: { fontSize: '12px' },
              }}
            />
            <NavLink
              component={Link}
              to="/admin/all-trips"
              label="All Trips"
              leftSection={<IconTable size={16} />}
              active={location.pathname === '/admin/all-trips'}
              onClick={handleLinkClick}
              color="dataBlue"
              variant="subtle"
              styles={{
                label: { fontSize: '12px' },
              }}
            />
          </NavLink>
        </>
      )}
    </Stack>
  );
}
