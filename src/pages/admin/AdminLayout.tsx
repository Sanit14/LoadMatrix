import { Tabs, Box, Title, Text } from '@mantine/core';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/admin/masters')) return 'masters';
    if (path.includes('/admin/rules')) return 'rules';
    if (path.includes('/admin/all-trips')) return 'all-trips';
    return 'clerks'; // default
  };

  return (
    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0 }}>
        <Title order={3} style={{ fontFamily: 'JetBrains Mono', color: '#ffffff', letterSpacing: '-0.021px' }}>
          SUPERVISOR CONTROL PANEL
        </Title>
        <Text size="xs" style={{ color: '#a7a7a7' }}>
          Manage system configurations, user operators, rulesets, and aggregate logs
        </Text>
      </div>

      <Tabs
        value={getActiveTab()}
        onChange={(val) => navigate(`/admin/${val}`)}
        color="dataBlue"
        variant="outline"
        styles={{
          tab: {
            fontSize: '12px',
            fontFamily: 'JetBrains Mono',
            backgroundColor: '#141414',
            borderColor: '#313131',
          },
          list: {
            borderColor: '#313131',
          }
        }}
        style={{ flexShrink: 0 }}
      >
        <Tabs.List>
          <Tabs.Tab value="clerks">OPERATOR CLERKS</Tabs.Tab>
          <Tabs.Tab value="masters">CUSTOMER & RECEIVER MASTERS</Tabs.Tab>
          <Tabs.Tab value="rules">WEIGHT RULES</Tabs.Tab>
          <Tabs.Tab value="all-trips">CROSS-CLERK LOGS</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
