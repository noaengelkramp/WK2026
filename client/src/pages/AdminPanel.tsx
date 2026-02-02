import { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Tabs,
  Tab,
  Alert,
  CardContent,
  Chip,
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

      {/* Other Tabs - Placeholder */}
      {(selectedTab === 'matches' || selectedTab === 'teams' || selectedTab === 'settings') && (
        <Card>
          <CardContent>
            <Alert severity="info" icon={<SettingsIcon />}>
              <Typography variant="h6" gutterBottom>
                {selectedTab === 'matches' && 'Match Management'}
                {selectedTab === 'teams' && 'Team Management'}
                {selectedTab === 'settings' && 'System Settings'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                This section allows administrators to:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                {selectedTab === 'matches' && (
                  <>
                    <li>View all 104 World Cup matches</li>
                    <li>Edit match details (date, time, venue)</li>
                    <li>Enter match results manually (home/away scores)</li>
                    <li>Update match status (scheduled/live/finished)</li>
                    <li>Trigger scoring recalculation after results</li>
                    <li>Import fixtures from Live-Score API</li>
                  </>
                )}
                {selectedTab === 'teams' && (
                  <>
                    <li>View all 48 teams</li>
                    <li>Edit team details (name, group, FIFA ranking)</li>
                    <li>Upload team flags</li>
                    <li>Sync team data from API</li>
                  </>
                )}
                {selectedTab === 'settings' && (
                  <>
                    <li>Configure scoring rules (points per prediction type)</li>
                    <li>Set tournament dates and deadlines</li>
                    <li>Configure email notifications</li>
                    <li>Manage API integration settings</li>
                    <li>View audit logs</li>
                  </>
                )}
              </Box>
              <Chip
                label="Coming Soon"
                color="primary"
                size="small"
                sx={{ mt: 1 }}
              />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Full implementation requires additional backend API endpoints.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
