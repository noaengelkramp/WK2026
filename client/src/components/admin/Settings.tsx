import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import apiClient from '../../services/api';

interface ScoringRule {
  id: string;
  stage: string;
  pointsExactScore: number;
  pointsCorrectWinner: number;
  description: string;
}

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Scoring rules
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);
  const [editingRule, setEditingRule] = useState<string | null>(null);

  // Tournament settings
  const [tournamentSettings, setTournamentSettings] = useState({
    predictionDeadline: '2026-06-11T23:00:00',
    tournamentStartDate: '2026-06-11T00:00:00',
    tournamentEndDate: '2026-07-19T23:59:59',
  });

  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    emailFrom: '',
    emailEnabled: 'false',
  });

  // Fetch scoring rules
  const fetchScoringRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ success: boolean; count: number; scoringRules: ScoringRule[] }>('/scoring-rules');
      setScoringRules(response.data.scoringRules);
    } catch (err: any) {
      console.error('Error fetching scoring rules:', err);
      setError(err.response?.data?.error || 'Failed to load scoring rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScoringRules();
  }, []);

  // Save scoring rule
  // @ts-ignore - Unused function for now - will implement backend endpoint later
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveScoringRule = async (ruleId: string, updates: Partial<ScoringRule>) => {
    try {
      setError(null);
      await apiClient.put(`/admin/scoring-rules/${ruleId}`, updates);
      setSuccess('Scoring rule updated successfully!');
      await fetchScoringRules();
      setEditingRule(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating scoring rule:', err);
      setError(err.response?.data?.error || 'Failed to update scoring rule');
    }
  };

  // Save tournament settings
  const handleSaveTournamentSettings = async () => {
    try {
      setError(null);
      // TODO: Implement tournament settings API endpoint
      setSuccess('Tournament settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving tournament settings:', err);
      setError('Failed to save tournament settings');
    }
  };

  // Save email settings
  const handleSaveEmailSettings = async () => {
    try {
      setError(null);
      // TODO: Implement email settings API endpoint
      setSuccess('Email settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving email settings:', err);
      setError('Failed to save email settings');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            System Settings
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchScoringRules}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Scoring Rules Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            🎯 Scoring Rules
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Configure points awarded for predictions at different tournament stages
          </Typography>

          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Stage</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell align="center"><strong>Exact Score</strong></TableCell>
                  <TableCell align="center"><strong>Correct Winner</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scoringRules.map((rule) => (
                  <TableRow key={rule.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                        {rule.stage.replace('_', ' ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {rule.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {editingRule === rule.id ? (
                        <TextField
                          size="small"
                          type="number"
                          defaultValue={rule.pointsExactScore}
                          sx={{ width: 80 }}
                          inputProps={{ min: 0 }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                          {rule.pointsExactScore} pts
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {editingRule === rule.id ? (
                        <TextField
                          size="small"
                          type="number"
                          defaultValue={rule.pointsCorrectWinner}
                          sx={{ width: 80 }}
                          inputProps={{ min: 0 }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                          {rule.pointsCorrectWinner} pts
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => setEditingRule(rule.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Note:</strong> Editing scoring rules is currently view-only. Full implementation requires backend API updates.
          </Alert>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Tournament Settings Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            ⚽ Tournament Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Configure tournament dates and prediction deadlines
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Prediction Deadline"
                type="datetime-local"
                value={tournamentSettings.predictionDeadline}
                onChange={(e) => setTournamentSettings({ ...tournamentSettings, predictionDeadline: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Last moment users can submit predictions"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Tournament Start Date"
                type="datetime-local"
                value={tournamentSettings.tournamentStartDate}
                onChange={(e) => setTournamentSettings({ ...tournamentSettings, tournamentStartDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Tournament End Date"
                type="datetime-local"
                value={tournamentSettings.tournamentEndDate}
                onChange={(e) => setTournamentSettings({ ...tournamentSettings, tournamentEndDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={12}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveTournamentSettings}
              >
                Save Tournament Settings
              </Button>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Note:</strong> Tournament settings are currently stored in frontend only. Backend integration coming soon.
          </Alert>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Email Settings Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            📧 Email & Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Configure SMTP settings for email notifications
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="SMTP Host"
                value={emailSettings.smtpHost}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                placeholder="smtp.gmail.com"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="SMTP Port"
                type="number"
                value={emailSettings.smtpPort}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                placeholder="587"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="SMTP User"
                value={emailSettings.smtpUser}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                placeholder="your-email@gmail.com"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email From"
                value={emailSettings.emailFrom}
                onChange={(e) => setEmailSettings({ ...emailSettings, emailFrom: e.target.value })}
                placeholder="World Cup 2026 <noreply@wk2026.com>"
              />
            </Grid>
            <Grid size={12}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveEmailSettings}
              >
                Save Email Settings
              </Button>
            </Grid>
          </Grid>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Security Note:</strong> SMTP password should be configured via environment variables on the server, not through this UI.
          </Alert>
        </Box>
      </CardContent>
    </Card>
  );
}
