import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Button,
  Alert,
  Chip,
  Divider,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  AlertTitle,
} from '@mui/material';
import {
  CloudSync as SyncIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Api as ApiIcon,
} from '@mui/icons-material';
import { adminService } from '../../services/adminService';

interface ApiStatus {
  configured: boolean;
  account?: {
    name: string;
    email: string;
  };
  subscription?: {
    plan: string;
    active: boolean;
    expires: string;
  };
  requests?: {
    today: number;
    limit: number;
    remaining: number;
    sessionCount: number;
  };
  status?: 'healthy' | 'warning' | 'critical';
  error?: string;
}

interface DashboardStats {
  users: {
    total: number;
    recentSignups: number;
    withPredictions: number;
    participationRate: number;
  };
  customers: {
    total: number;
    active: number;
  };
  matches: {
    total: number;
    finished: number;
    upcoming: number;
  };
  teams: {
    total: number;
  };
  predictions: {
    total: number;
    averagePerUser: number;
  };
}

export default function ApiDashboard() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncType, setSyncType] = useState<'all' | 'teams' | 'fixtures' | 'standings'>('all');
  const [season, setSeason] = useState<'2022' | '2026'>('2022');
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apiRes, statsRes] = await Promise.all([
        adminService.getApiStatus(),
        adminService.getDashboardStats(),
      ]);
      
      setApiStatus(apiRes.apiStatus);
      setStats(statsRes.stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    
    try {
      const result = await adminService.syncFromApi({ syncType, season });
      
      if (result.success) {
        setSyncMessage({
          type: 'success',
          text: `Successfully synced ${syncType} data from ${season} World Cup`,
        });
        // Reload data to show updated stats
        await loadData();
      } else {
        setSyncMessage({
          type: 'error',
          text: result.results?.errors?.join(', ') || 'Sync completed with errors',
        });
      }
    } catch (error: any) {
      setSyncMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to sync data from API',
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'healthy':
        return <SuccessIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'critical':
        return <ErrorIcon />;
      default:
        return <ApiIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const requestPercentage = apiStatus?.requests
    ? (apiStatus.requests.today / apiStatus.requests.limit) * 100
    : 0;

  return (
    <Box>
      {/* Page Header */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        API-Football Dashboard
      </Typography>

      {syncMessage && (
        <Alert severity={syncMessage.type} sx={{ mb: 3 }} onClose={() => setSyncMessage(null)}>
          {syncMessage.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* API Status Card */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ApiIcon /> API Status
                </Typography>
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={loadData}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2 }} />

              {!apiStatus?.configured ? (
                <Alert severity="warning">
                  <AlertTitle>API Not Configured</AlertTitle>
                  Add your API-Football key to the .env file to enable live data sync.
                </Alert>
              ) : apiStatus.error ? (
                <Alert severity="error">
                  <AlertTitle>API Error</AlertTitle>
                  {apiStatus.error}
                </Alert>
              ) : (
                <Box>
                  {/* Account Info */}
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Account Information
                    </Typography>
                    <Typography variant="body1">
                      {apiStatus.account?.name} ({apiStatus.account?.email})
                    </Typography>
                    <Box mt={1}>
                      <Chip
                        label={apiStatus.subscription?.plan}
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={apiStatus.subscription?.active ? 'Active' : 'Inactive'}
                        color={apiStatus.subscription?.active ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      Expires: {apiStatus.subscription?.expires ? new Date(apiStatus.subscription.expires).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>

                  {/* Request Usage */}
                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Daily Request Usage
                      </Typography>
                      <Chip
                        icon={getStatusIcon(apiStatus.status)}
                        label={apiStatus.status?.toUpperCase()}
                        color={getStatusColor(apiStatus.status)}
                        size="small"
                      />
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="h4" fontWeight="bold">
                        {apiStatus.requests?.today || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" alignSelf="flex-end">
                        / {apiStatus.requests?.limit || 100} requests
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={Math.min(requestPercentage, 100)}
                      color={
                        requestPercentage < 70 ? 'success' :
                        requestPercentage < 90 ? 'warning' : 'error'
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />

                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        Remaining: {apiStatus.requests?.remaining || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {requestPercentage.toFixed(1)}% used
                      </Typography>
                    </Box>
                  </Box>

                  {/* Session Requests */}
                  <Alert severity="info" icon={<SyncIcon />}>
                    <Typography variant="body2">
                      <strong>Session Requests:</strong> {apiStatus.requests?.sessionCount || 0}
                    </Typography>
                    <Typography variant="caption">
                      Requests made since server started
                    </Typography>
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Project Stats Card */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SuccessIcon color="success" /> Project Statistics
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">
                      {stats?.users.total || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                    <Chip
                      label={`${stats?.users.recentSignups || 0} new (7d)`}
                      size="small"
                      color="success"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">
                      {stats?.matches.total || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Matches
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                      {stats?.matches.finished || 0} finished, {stats?.matches.upcoming || 0} upcoming
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">
                      {stats?.teams.total || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Teams
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">
                      {stats?.predictions.total || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Predictions
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                      Avg {stats?.predictions.averagePerUser || 0}/user
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Participation Rate:</strong> {stats?.users.participationRate || 0}%
                </Typography>
                <Typography variant="caption">
                  {stats?.users.withPredictions || 0} of {stats?.users.total || 0} users have made predictions
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Sync Control Card */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SyncIcon /> Sync Data from API
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              <Alert severity="warning" sx={{ mb: 3 }}>
                <AlertTitle>⚠️ 2026 Data Not Available with Free Plan</AlertTitle>
                <Typography variant="body2">
                  The free plan only has access to seasons 2022-2024. Use 2022 data for development and testing.
                  Upgrade to a paid plan to access 2026 World Cup data when available.
                </Typography>
              </Alert>

              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Sync Type</InputLabel>
                    <Select
                      value={syncType}
                      label="Sync Type"
                      onChange={(e) => setSyncType(e.target.value as any)}
                      disabled={syncing}
                    >
                      <MenuItem value="all">All Data</MenuItem>
                      <MenuItem value="teams">Teams Only</MenuItem>
                      <MenuItem value="fixtures">Fixtures Only</MenuItem>
                      <MenuItem value="standings">Standings Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Season</InputLabel>
                    <Select
                      value={season}
                      label="Season"
                      onChange={(e) => setSeason(e.target.value as any)}
                      disabled={syncing}
                    >
                      <MenuItem value="2022">2022 (Available)</MenuItem>
                      <MenuItem value="2026">2026 (Requires Paid Plan)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={syncing ? <CircularProgress size={20} /> : <SyncIcon />}
                    onClick={handleSync}
                    disabled={syncing || !apiStatus?.configured}
                    sx={{ height: 56 }}
                  >
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </Button>
                </Grid>
              </Grid>

              <Box mt={2}>
                <Typography variant="caption" color="text.secondary" display="block">
                  <strong>What will be synced:</strong>
                </Typography>
                <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3 }}>
                  {syncType === 'all' && (
                    <>
                      <li><Typography variant="caption">Teams (32-48 teams with logos and info)</Typography></li>
                      <li><Typography variant="caption">Fixtures (64-104 matches with schedules)</Typography></li>
                      <li><Typography variant="caption">Standings (Group tables and rankings)</Typography></li>
                    </>
                  )}
                  {syncType === 'teams' && (
                    <li><Typography variant="caption">All teams participating in World Cup {season}</Typography></li>
                  )}
                  {syncType === 'fixtures' && (
                    <li><Typography variant="caption">All match fixtures (group stage + knockouts)</Typography></li>
                  )}
                  {syncType === 'standings' && (
                    <li><Typography variant="caption">Current group standings and rankings</Typography></li>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  This will use {syncType === 'all' ? '3' : '1'} API request{syncType === 'all' ? 's' : ''} from your daily quota.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
