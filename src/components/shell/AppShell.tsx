import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { TopBar } from './TopBar';

export function AppShellWrapper() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 52 }}
      navbar={{
        width: 220,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      styles={{
        main: {
          backgroundColor: '#0a0a0a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 52px)',
          overflow: 'hidden',
        },
        navbar: {
          backgroundColor: '#141414',
          borderRight: '1px solid #313131',
        },
        header: {
          backgroundColor: '#141414',
          borderBottom: '1px solid #313131',
        }
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" style={{ flexWrap: 'nowrap' }}>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="dataBlue" />
          <TopBar />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <SidebarNav toggleMobile={toggle} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
