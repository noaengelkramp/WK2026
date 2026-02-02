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
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Badge as BadgeIcon,
  SportsSoccer as SoccerIcon,
  Flag as FlagIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import UserManagement from '../components/admin/UserManagement';
import CustomerManagement from '../components/admin/CustomerManagement';
import ApiDashboard from '../components/admin/ApiDashboard';
import MatchManagement from '../components/admin/MatchManagement';
import TeamManagement from '../components/admin/TeamManagement';
import Settings from '../components/admin/Settings';

type TabValue = 'dashboard' | 'users' | 'customers' | 'matches' | 'teams' | 'settings';

export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState<TabValue>('dashboard');

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        🔧 Admin Panel
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage users, matches, teams, and tournament settings
      </Typography>

      {/* Admin Access Notice */}
      <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
        <strong>Admin Access Required</strong> - This panel is restricted to administrators only. All actions are logged
        for security purposes.
      </Alert>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" value="dashboard" />
          <Tab icon={<PeopleIcon />} iconPosition="start" label="Users" value="users" />
          <Tab icon={<BadgeIcon />} iconPosition="start" label="Customers" value="customers" />
          <Tab icon={<SoccerIcon />} iconPosition="start" label="Matches" value="matches" />
          <Tab icon={<FlagIcon />} iconPosition="start" label="Teams" value="teams" />
          <Tab icon={<SettingsIcon />} iconPosition="start" label="Settings" value="settings" />
        </Tabs>
      </Card>

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
    </Box>
  );
}
