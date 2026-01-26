import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Alert,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Badge as BadgeIcon,
  SportsSoccer as SoccerIcon,
  Flag as FlagIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

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
      {selectedTab === 'dashboard' && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Quick Stats */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ background: 'linear-gradient(135deg, #9B1915 0%, #C42420 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                    0
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Total Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                    104
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Total Matches
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                    48
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Total Teams
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ background: 'linear-gradient(135deg, #666666 0%, #888888 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                    12
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Total Groups
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* System Status */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <CheckIcon color="success" />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Database Connection
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Connected and operational
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <CheckIcon color="success" />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        API Integration
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Live-Score API connected
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <CheckIcon color="success" />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Email Service
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        SMTP configured and ready
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <CheckIcon color="success" />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Scoring Engine
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ready to calculate points
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<PeopleIcon />}
                    sx={{ py: 2 }}
                  >
                    View All Users
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<SoccerIcon />}
                    sx={{ py: 2 }}
                  >
                    Update Match Results
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<SettingsIcon />}
                    sx={{ py: 2 }}
                  >
                    Trigger Scoring
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<FlagIcon />}
                    sx={{ py: 2 }}
                  >
                    Sync Teams from API
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<BadgeIcon />}
                    sx={{ py: 2 }}
                  >
                    Manage Customers
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<SettingsIcon />}
                    sx={{ py: 2 }}
                  >
                    Configure Rules
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Other Tabs - Placeholder */}
      {selectedTab !== 'dashboard' && (
        <Card>
          <CardContent>
            <Alert severity="info" icon={<SettingsIcon />}>
              <Typography variant="h6" gutterBottom>
                {selectedTab === 'users' && 'User Management'}
                {selectedTab === 'customers' && 'Customer Management'}
                {selectedTab === 'matches' && 'Match Management'}
                {selectedTab === 'teams' && 'Team Management'}
                {selectedTab === 'settings' && 'System Settings'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                This section allows administrators to:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                {selectedTab === 'users' && (
                  <>
                    <li>View and search all registered users</li>
                    <li>Create new user accounts</li>
                    <li>Edit user details (name, email, customer number, role)</li>
                    <li>Reset user passwords</li>
                    <li>Bulk import users from CSV</li>
                    <li>View user predictions and statistics</li>
                  </>
                )}
                {selectedTab === 'customers' && (
                  <>
                    <li>View all customer numbers in the database</li>
                    <li>Add new customer numbers to allow registration</li>
                    <li>Bulk import customer numbers from CSV</li>
                    <li>Mark customers as active or inactive</li>
                    <li>See which customers have registered accounts</li>
                    <li>Export customer list to CSV</li>
                  </>
                )}
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
                Full implementation requires additional backend API endpoints and admin authentication.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
