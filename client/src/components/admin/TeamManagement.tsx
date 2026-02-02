import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Grid,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import apiClient from '../../services/api';
import type { Team } from '../../types';

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Edit/Create dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    countryCode: '',
    flagUrl: '',
    groupLetter: '',
    fifaRank: '',
  });

  // Fetch teams
  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ success: boolean; count: number; teams: Team[] }>('/admin/teams');
      setTeams(response.data.teams);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
      setError(err.response?.data?.error || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Open dialog for editing
  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setIsEditMode(true);
    setFormData({
      name: team.name || '',
      countryCode: team.countryCode || '',
      flagUrl: team.flagUrl || '',
      groupLetter: team.groupLetter || '',
      fifaRank: team.fifaRank?.toString() || '',
    });
    setDialogOpen(true);
  };

  // Open dialog for creating
  const handleCreateTeam = () => {
    setSelectedTeam(null);
    setIsEditMode(false);
    setFormData({
      name: '',
      countryCode: '',
      flagUrl: '',
      groupLetter: '',
      fifaRank: '',
    });
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTeam(null);
    setFormData({
      name: '',
      countryCode: '',
      flagUrl: '',
      groupLetter: '',
      fifaRank: '',
    });
  };

  // Save team (create or update)
  const handleSaveTeam = async () => {
    try {
      setError(null);

      const teamData: any = {
        name: formData.name,
        countryCode: formData.countryCode.toUpperCase(),
        flagUrl: formData.flagUrl || `https://flagcdn.com/w320/${formData.countryCode.toLowerCase()}.png`,
        groupLetter: formData.groupLetter || null,
        fifaRank: formData.fifaRank ? parseInt(formData.fifaRank, 10) : null,
      };

      if (isEditMode && selectedTeam) {
        // Update existing team
        await apiClient.put(`/admin/teams/${selectedTeam.id}`, teamData);
        setSuccess('Team updated successfully!');
      } else {
        // Create new team
        await apiClient.post('/admin/teams', teamData);
        setSuccess('Team created successfully!');
      }

      // Refresh teams
      await fetchTeams();
      handleCloseDialog();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving team:', err);
      setError(err.response?.data?.error || 'Failed to save team');
    }
  };

  // Delete team
  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${teamName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      await apiClient.delete(`/admin/teams/${teamId}`);
      setSuccess(`Team "${teamName}" deleted successfully!`);
      await fetchTeams();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting team:', err);
      setError(err.response?.data?.error || 'Failed to delete team');
    }
  };

  // Group teams by group letter
  const groupedTeams = teams.reduce((acc, team) => {
    const group = team.groupLetter || 'Unassigned';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(team);
    return acc;
  }, {} as Record<string, Team[]>);

  const groups = Object.keys(groupedTeams).sort();

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
            Team Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTeam}
            >
              Add Team
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchTeams}
            >
              Refresh
            </Button>
          </Box>
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

        {/* Stats Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
              <Typography variant="h4" sx={{ color: 'white' }}>{teams.length}</Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>Total Teams</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
              <Typography variant="h4" sx={{ color: 'white' }}>
                {groups.filter(g => g !== 'Unassigned').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>Groups</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
              <Typography variant="h4" sx={{ color: 'white' }}>
                {groupedTeams['Unassigned']?.length || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>Unassigned</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Teams Table by Group */}
        {groups.map(group => (
          <Box key={group} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: 'primary.main' }}>
              {group === 'Unassigned' ? '🔸 Unassigned Teams' : `🏆 Group ${group}`}
            </Typography>
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Flag</strong></TableCell>
                    <TableCell><strong>Team Name</strong></TableCell>
                    <TableCell><strong>Country Code</strong></TableCell>
                    <TableCell><strong>FIFA Rank</strong></TableCell>
                    <TableCell><strong>Group</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedTeams[group].map((team) => (
                    <TableRow key={team.id} hover>
                      <TableCell>
                        <Avatar 
                          src={team.flagUrl} 
                          alt={team.name}
                          variant="rounded"
                          sx={{ width: 40, height: 30 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {team.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={team.countryCode} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {team.fifaRank ? (
                          <Typography variant="body2">#{team.fifaRank}</Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {team.groupLetter ? (
                          <Chip label={`Group ${team.groupLetter}`} size="small" color="primary" />
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditTeam(team)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteTeam(team.id, team.name)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}

        {/* Edit/Create Team Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {isEditMode ? `Edit Team: ${selectedTeam?.name}` : 'Create New Team'}
              </Typography>
              <IconButton onClick={handleCloseDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                {/* Team Name */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    required
                    label="Team Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Brazil"
                  />
                </Grid>

                {/* Country Code */}
                <Grid size={6}>
                  <TextField
                    fullWidth
                    required
                    label="Country Code"
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., BRA"
                    inputProps={{ maxLength: 3 }}
                  />
                </Grid>

                {/* Group Letter */}
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="Group Letter"
                    value={formData.groupLetter}
                    onChange={(e) => setFormData({ ...formData, groupLetter: e.target.value.toUpperCase() })}
                    placeholder="e.g., A"
                    inputProps={{ maxLength: 1 }}
                  />
                </Grid>

                {/* FIFA Rank */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="FIFA Rank"
                    type="number"
                    value={formData.fifaRank}
                    onChange={(e) => setFormData({ ...formData, fifaRank: e.target.value })}
                    placeholder="e.g., 1"
                    inputProps={{ min: 1 }}
                  />
                </Grid>

                {/* Flag URL */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Flag URL (optional)"
                    value={formData.flagUrl}
                    onChange={(e) => setFormData({ ...formData, flagUrl: e.target.value })}
                    placeholder="Auto-generated from country code if empty"
                    helperText="Leave blank to auto-generate from flagcdn.com"
                  />
                </Grid>

                {/* Preview */}
                {(formData.flagUrl || formData.countryCode) && (
                  <Grid size={12}>
                    <Box sx={{ textAlign: 'center', pt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Preview:</Typography>
                      <Avatar 
                        src={formData.flagUrl || `https://flagcdn.com/w320/${formData.countryCode.toLowerCase()}.png`}
                        alt={formData.name}
                        variant="rounded"
                        sx={{ width: 80, height: 60, margin: '0 auto' }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} startIcon={<CloseIcon />}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTeam} 
              variant="contained" 
              startIcon={<SaveIcon />}
              disabled={!formData.name || !formData.countryCode}
            >
              {isEditMode ? 'Save Changes' : 'Create Team'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
