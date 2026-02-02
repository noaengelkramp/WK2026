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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import apiClient from '../../services/api';
import type { Match } from '../../types';

export default function MatchManagement() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [editForm, setEditForm] = useState({
    homeScore: '',
    awayScore: '',
    status: '',
    venue: '',
    city: '',
    matchDate: '',
  });

  // Filter state
  const [stageFilter, setStageFilter] = useState('all');

  // Fetch matches
  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ success: boolean; count: number; matches: Match[] }>('/admin/matches');
      setMatches(response.data.matches);
    } catch (err: any) {
      console.error('Error fetching matches:', err);
      setError(err.response?.data?.error || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Open edit dialog
  const handleEditMatch = (match: Match) => {
    setSelectedMatch(match);
    setEditForm({
      homeScore: match.homeScore?.toString() || '',
      awayScore: match.awayScore?.toString() || '',
      status: match.status || 'scheduled',
      venue: match.venue || '',
      city: match.city || '',
      matchDate: match.matchDate ? new Date(match.matchDate).toISOString().slice(0, 16) : '',
    });
    setEditDialogOpen(true);
  };

  // Close edit dialog
  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedMatch(null);
    setEditForm({
      homeScore: '',
      awayScore: '',
      status: '',
      venue: '',
      city: '',
      matchDate: '',
    });
  };

  // Save match updates
  const handleSaveMatch = async () => {
    if (!selectedMatch) return;

    try {
      setError(null);
      
      // Prepare update data
      const updateData: any = {
        status: editForm.status,
        venue: editForm.venue,
        city: editForm.city,
        matchDate: editForm.matchDate ? new Date(editForm.matchDate).toISOString() : undefined,
      };

      // If updating scores, use the result endpoint
      if (editForm.homeScore !== '' && editForm.awayScore !== '') {
        const homeScore = parseInt(editForm.homeScore, 10);
        const awayScore = parseInt(editForm.awayScore, 10);
        
        if (!isNaN(homeScore) && !isNaN(awayScore) && homeScore >= 0 && awayScore >= 0) {
          await apiClient.post(`/admin/matches/${selectedMatch.id}/result`, {
            homeScore,
            awayScore,
          });
          setSuccess('Match result updated and scoring processed!');
        }
      } else {
        // Just update match details
        await apiClient.put(`/admin/matches/${selectedMatch.id}`, updateData);
        setSuccess('Match details updated successfully!');
      }

      // Refresh matches
      await fetchMatches();
      handleCloseDialog();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating match:', err);
      setError(err.response?.data?.error || 'Failed to update match');
    }
  };

  // Filter matches
  const filteredMatches = stageFilter === 'all' 
    ? matches 
    : matches.filter(m => m.stage === stageFilter);

  // Get status color
  const getStatusColor = (status: string): 'default' | 'warning' | 'success' | 'error' => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'live': return 'warning';
      case 'finished': return 'success';
      default: return 'default';
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
            Match Management
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchMatches}
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

        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Stage</InputLabel>
            <Select
              value={stageFilter}
              label="Stage"
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <MenuItem value="all">All Stages</MenuItem>
              <MenuItem value="group">Group Stage</MenuItem>
              <MenuItem value="round32">Round of 32</MenuItem>
              <MenuItem value="round16">Round of 16</MenuItem>
              <MenuItem value="quarter">Quarter-finals</MenuItem>
              <MenuItem value="semi">Semi-finals</MenuItem>
              <MenuItem value="third_place">Third Place</MenuItem>
              <MenuItem value="final">Final</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Stats Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
              <Typography variant="h4" sx={{ color: 'white' }}>{matches.length}</Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>Total Matches</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
              <Typography variant="h4" sx={{ color: 'white' }}>
                {matches.filter(m => m.status === 'finished').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>Finished</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
              <Typography variant="h4" sx={{ color: 'white' }}>
                {matches.filter(m => m.status === 'scheduled').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>Scheduled</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Matches Table */}
        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>#</strong></TableCell>
                <TableCell><strong>Match</strong></TableCell>
                <TableCell><strong>Stage</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Venue</strong></TableCell>
                <TableCell><strong>Score</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No matches found for selected filter
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMatches.map((match) => (
                  <TableRow key={match.id} hover>
                    <TableCell>{match.matchNumber}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {match.homeTeam?.name || 'TBD'} vs {match.awayTeam?.name || 'TBD'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={match.stage} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {match.matchDate 
                          ? new Date(match.matchDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {match.city || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {match.homeScore !== null && match.awayScore !== null ? (
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {match.homeScore} - {match.awayScore}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={match.status} 
                        color={getStatusColor(match.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditMatch(match)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Edit Match Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Edit Match #{selectedMatch?.matchNumber}
              </Typography>
              <IconButton onClick={handleCloseDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedMatch && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {selectedMatch.homeTeam?.name || 'TBD'} vs {selectedMatch.awayTeam?.name || 'TBD'}
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {/* Match Result */}
                  <Grid size={6}>
                    <TextField
                      fullWidth
                      label="Home Score"
                      type="number"
                      value={editForm.homeScore}
                      onChange={(e) => setEditForm({ ...editForm, homeScore: e.target.value })}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      fullWidth
                      label="Away Score"
                      type="number"
                      value={editForm.awayScore}
                      onChange={(e) => setEditForm({ ...editForm, awayScore: e.target.value })}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>

                  {/* Status */}
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={editForm.status}
                        label="Status"
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      >
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                        <MenuItem value="live">Live</MenuItem>
                        <MenuItem value="finished">Finished</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Venue */}
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Venue"
                      value={editForm.venue}
                      onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                    />
                  </Grid>

                  {/* City */}
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="City"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    />
                  </Grid>

                  {/* Match Date */}
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Match Date"
                      type="datetime-local"
                      value={editForm.matchDate}
                      onChange={(e) => setEditForm({ ...editForm, matchDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} startIcon={<CloseIcon />}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveMatch} 
              variant="contained" 
              startIcon={<SaveIcon />}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
