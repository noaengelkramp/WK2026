import { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  DashboardOutlined as DashboardIcon,
  PeopleOutlined as PeopleIcon,
  BadgeOutlined as BadgeIcon,
  SportsSoccerOutlined as SoccerIcon,
  FlagOutlined as FlagIcon,
  SettingsOutlined as SettingsIcon,
  ReportProblemOutlined as WarningIcon,
  ScienceOutlined as ScienceIcon,
} from '@mui/icons-material';
import UserManagement from '../components/admin/UserManagement';
import CustomerManagement from '../components/admin/CustomerManagement';
import ApiDashboard from '../components/admin/ApiDashboard';
import MatchManagement from '../components/admin/MatchManagement';
import TeamManagement from '../components/admin/TeamManagement';
import Settings from '../components/admin/Settings';
import TestingPanel from '../components/admin/TestingPanel';

type TabValue = 'dashboard' | 'users' | 'customers' | 'matches' | 'teams' | 'settings' | 'testing';

export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState<TabValue>('dashboard');

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#212121' }}>
          Admin Control Center
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, matches, teams, and tournament configurations.
        </Typography>
      </Box>

      {/* Admin Access Notice */}
      <Alert severity="warning" variant="outlined" icon={<WarningIcon />} sx={{ mb: 4, borderRadius: 0 }}>
        <strong>Admin Access Restricted</strong> - This panel is for authorized administrators only. All actions are logged.
      </Alert>

      {/* Tabs */}
      <Card variant="outlined" sx={{ mb: 4, borderRadius: 0, borderBottom: 'none' }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            '& .MuiTabs-indicator': { backgroundColor: '#9B1915' },
            '& .MuiTab-root.Mui-selected': { color: '#9B1915' }
          }}
        >
          <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" value="dashboard" />
          <Tab icon={<PeopleIcon />} iconPosition="start" label="Users" value="users" />
          <Tab icon={<BadgeIcon />} iconPosition="start" label="Customers" value="customers" />
          <Tab icon={<SoccerIcon />} iconPosition="start" label="Matches" value="matches" />
          <Tab icon={<FlagIcon />} iconPosition="start" label="Teams" value="teams" />
          <Tab icon={<SettingsIcon />} iconPosition="start" label="Settings" value="settings" />
          <Tab icon={<ScienceIcon />} iconPosition="start" label="Testing" value="testing" />
        </Tabs>
      </Card>

      <Box sx={{ border: '1px solid #E0E0E0', p: 3, backgroundColor: '#FFFFFF' }}>
        {/* Dashboard Tab */}
        {selectedTab === 'dashboard' && <ApiDashboard />}

        {/* User Management Tab */}
        {selectedTab === 'users' && <UserManagement />}

        {/* Customer Management Tab */}
        {selectedTab === 'customers' && <CustomerManagement />}

        {/* Match Management Tab */}
        {selectedTab === 'matches' && <MatchManagement />}

        {/* Team Management Tab */}
        {selectedTab === 'teams' && <TeamManagement />}

        {/* Settings Tab */}
        {selectedTab === 'settings' && <Settings />}

        {/* Testing Tab */}
        {selectedTab === 'testing' && <TestingPanel />}
      </Box>
    </Box>
  );
}
