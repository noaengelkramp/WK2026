import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Chip,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  Pagination,
} from '@mui/material';
import {
  SportsSoccer as SoccerIcon,
  Schedule as ScheduleIcon,
  CheckCircle as FinishedIcon,
  PlayCircle as LiveIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { dataService } from '../services/dataService';
import type { Match, Team } from '../types';

type StageFilter = 'all' | 'group' | 'round32' | 'round16' | 'quarter' | 'semi' | 'final';

const stageLabels: Record<StageFilter, string> = {
  all: 'All Matches',
  group: 'Group Stage',
  round32: 'Round of 32',
  round16: 'Round of 16',
  quarter: 'Quarter-finals',
  semi: 'Semi-finals',
  final: 'Final',
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const matchesPerPage = 20;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [matchesData, teamsData] = await Promise.all([
        dataService.getMatches(),
        dataService.getTeams(),
      ]);

      setMatches(matchesData);
      setTeams(teamsData);
    } catch (err) {
      console.error('Failed to load matches:', err);
      setError('Failed to load matches. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter matches based on selected filters
  const filteredMatches = matches.filter((match) => {
    // Stage filter
    if (stageFilter !== 'all' && match.stage !== stageFilter) {
      return false;
    }

    // Team filter
    if (teamFilter !== 'all' && match.homeTeam.id !== teamFilter && match.awayTeam.id !== teamFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && match.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Sort matches by match number
  const sortedMatches = [...filteredMatches].sort((a, b) => a.matchNumber - b.matchNumber);
  
  // Pagination
  const totalPages = Math.ceil(sortedMatches.length / matchesPerPage);
  const paginatedMatches = sortedMatches.slice(
    (page - 1) * matchesPerPage,
    page * matchesPerPage
  );
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [stageFilter, teamFilter, statusFilter]);

  // Get match status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'live':
        return {
          icon: <LiveIcon sx={{ fontSize: 18 }} />,
          label: 'LIVE',
          color: '#d32f2f',
        };
      case 'finished':
        return {
          icon: <FinishedIcon sx={{ fontSize: 18 }} />,
          label: 'Finished',
          color: '#388e3c',
        };
      default:
        return {
          icon: <ScheduleIcon sx={{ fontSize: 18 }} />,
          label: 'Scheduled',
          color: '#666666',
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        ⚽ World Cup Matches
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View all {matches.length} matches of the 2026 World Cup tournament
      </Typography>

      {/* Stage Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={stageFilter}
          onChange={(_, value) => setStageFilter(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {Object.entries(stageLabels).map(([value, label]) => (
            <Tab key={value} label={label} value={value} />
          ))}
        </Tabs>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label="Filter by Team"
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                size="small"
              >
                <MenuItem value="all">All Teams</MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="live">Live</MenuItem>
                <MenuItem value="finished">Finished</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Match Count */}
      <Alert severity="info" icon={<SoccerIcon />} sx={{ mb: 3 }}>
        Showing <strong>{(page - 1) * matchesPerPage + 1}-{Math.min(page * matchesPerPage, sortedMatches.length)}</strong> of <strong>{sortedMatches.length}</strong> matches
      </Alert>

      {/* Matches List */}
      {paginatedMatches.length === 0 ? (
        <Alert severity="warning">No matches found matching your filters.</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {paginatedMatches.map((match) => {
            const statusInfo = getStatusInfo(match.status);

            return (
              <Card
                key={match.id}
                sx={{
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    {/* Match Number & Stage */}
                    <Grid size={{ xs: 12, md: 2 }}>
                      <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          Match #{match.matchNumber}
                        </Typography>
                        <Chip
                          label={stageLabels[match.stage as StageFilter] || match.stage}
                          size="small"
                          sx={{ mt: 0.5, backgroundColor: '#F5F5F5' }}
                        />
                        {match.groupLetter && (
                          <Chip
                            label={`Group ${match.groupLetter}`}
                            size="small"
                            sx={{ mt: 0.5, ml: 0.5, backgroundColor: '#F5F5F5' }}
                          />
                        )}
                      </Box>
                    </Grid>

                    {/* Teams & Score */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        {/* Home Team */}
                        <Box sx={{ flex: 1, textAlign: 'right' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: match.status === 'live' ? 'bold' : 'normal' }}>
                              {match.homeTeam.name}
                            </Typography>
                            <Box
                              component="img"
                              src={match.homeTeam.flagUrl}
                              alt={match.homeTeam.name}
                              sx={{ width: 40, height: 30, objectFit: 'cover', borderRadius: 0.5, boxShadow: 1 }}
                            />
                          </Box>
                        </Box>

                        {/* Score or VS */}
                        <Box
                          sx={{
                            minWidth: 80,
                            textAlign: 'center',
                            px: 2,
                            py: 1,
                            backgroundColor: match.status === 'live' ? '#d32f2f' : '#F5F5F5',
                            borderRadius: 1,
                          }}
                        >
                          {match.status === 'finished' || match.status === 'live' ? (
                            <Typography
                              variant="h5"
                              sx={{
                                fontWeight: 'bold',
                                color: match.status === 'live' ? 'white' : 'text.primary',
                              }}
                            >
                              {match.homeScore} - {match.awayScore}
                            </Typography>
                          ) : (
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                              vs
                            </Typography>
                          )}
                        </Box>

                        {/* Away Team */}
                        <Box sx={{ flex: 1, textAlign: 'left' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              component="img"
                              src={match.awayTeam.flagUrl}
                              alt={match.awayTeam.name}
                              sx={{ width: 40, height: 30, objectFit: 'cover', borderRadius: 0.5, boxShadow: 1 }}
                            />
                            <Typography variant="h6" sx={{ fontWeight: match.status === 'live' ? 'bold' : 'normal' }}>
                              {match.awayTeam.name}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>

                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

                    {/* Match Details */}
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Box>
                        {/* Status */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip
                            icon={statusInfo.icon}
                            label={statusInfo.label}
                            size="small"
                            sx={{
                              backgroundColor: statusInfo.color,
                              color: 'white',
                              fontWeight: 'bold',
                            }}
                          />
                        </Box>

                        {/* Date & Time */}
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <ScheduleIcon sx={{ fontSize: 16 }} />
                          {formatDate(match.matchDate)}
                        </Typography>

                        {/* Venue */}
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationIcon sx={{ fontSize: 16 }} />
                          {match.venue}, {match.city}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => {
              setPage(value);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}
