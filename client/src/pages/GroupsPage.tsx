import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { EmojiEventsOutlined as TrophyIcon, InfoOutlined as InfoIcon, RefreshOutlined as RefreshIcon } from '@mui/icons-material';
import { dataService } from '../services/dataService';
import type { Team, Match } from '../types';

type GroupLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

interface GroupStanding {
  position: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export default function GroupsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupLetter>('A');

  // For 2022 World Cup data: 8 groups (A-H)
  // For 2026 World Cup: will have 12 groups (A-L)
  const groups: GroupLetter[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when user returns to this page (e.g., from Testing tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', loadData);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', loadData);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [teamsData, matchesData] = await Promise.all([
        dataService.getTeams(),
        dataService.getMatches({ stage: 'group' }),
      ]);

      console.log('=== GROUPS PAGE DATA LOADED ===');
      console.log('Total teams:', teamsData.length);
      console.log('Total matches:', matchesData.length);
      console.log('Match statuses:', matchesData.reduce((acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));
      console.log('Sample match:', matchesData[0]);

      setTeams(teamsData);
      setMatches(matchesData);
    } catch (err) {
      console.error('Failed to load groups:', err);
      setError('Failed to load group data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate standings for a group
  const calculateGroupStandings = (groupLetter: GroupLetter): GroupStanding[] => {
    // Get teams in this group
    const groupTeams = teams.filter((team) => team.groupLetter === groupLetter);

    // Get matches for this group that are finished
    const groupMatches = matches.filter(
      (match) => match.groupLetter === groupLetter && match.status === 'finished'
    );

    console.log(`Group ${groupLetter} - Total matches:`, matches.filter(m => m.groupLetter === groupLetter).length);
    console.log(`Group ${groupLetter} - Finished matches:`, groupMatches.length);
    console.log(`Group ${groupLetter} - Teams:`, groupTeams.length);

    // Initialize standings
    const standings: GroupStanding[] = groupTeams.map((team) => ({
      position: 0,
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    }));

    // Calculate stats from finished matches
    groupMatches.forEach((match) => {
      // Defensive check: ensure teams exist
      if (!match.homeTeam || !match.awayTeam) {
        console.warn('Match missing team data:', match);
        return;
      }

      const homeStanding = standings.find((s) => s.team.id === match.homeTeam.id);
      const awayStanding = standings.find((s) => s.team.id === match.awayTeam.id);

      if (homeStanding && awayStanding && match.homeScore !== undefined && match.awayScore !== undefined) {
        // Update played
        homeStanding.played++;
        awayStanding.played++;

        // Update goals
        homeStanding.goalsFor += match.homeScore;
        homeStanding.goalsAgainst += match.awayScore;
        awayStanding.goalsFor += match.awayScore;
        awayStanding.goalsAgainst += match.homeScore;

        // Determine winner and update points
        if (match.homeScore > match.awayScore) {
          // Home win
          homeStanding.won++;
          homeStanding.points += 3;
          awayStanding.lost++;
        } else if (match.homeScore < match.awayScore) {
          // Away win
          awayStanding.won++;
          awayStanding.points += 3;
          homeStanding.lost++;
        } else {
          // Draw
          homeStanding.drawn++;
          awayStanding.drawn++;
          homeStanding.points++;
          awayStanding.points++;
        }
      }
    });

    // Calculate goal difference
    standings.forEach((standing) => {
      standing.goalDifference = standing.goalsFor - standing.goalsAgainst;
    });

    // Sort by: 1) Points, 2) Goal difference, 3) Goals for, 4) Team name
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.team.name.localeCompare(b.team.name);
    });

    // Assign positions
    standings.forEach((standing, index) => {
      standing.position = index + 1;
    });

    return standings;
  };

  // Get group matches
  const getGroupMatches = (groupLetter: GroupLetter): Match[] => {
    return matches
      .filter((match) => match.groupLetter === groupLetter)
      .sort((a, b) => a.matchNumber - b.matchNumber);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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

  const standings = calculateGroupStandings(selectedGroup);
  const groupMatches = getGroupMatches(selectedGroup);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 0 }}>
            2022 World Cup Groups
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Final standings and results from Qatar 2022
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton onClick={loadData} color="primary" disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Qualification Info */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3, borderRadius: 2 }}>
        <strong>Qualification Rules:</strong> The top 2 teams from each group advance to the knockout stage, plus
        the best 8 third-place teams. Win = 3 points, Draw = 1 point, Loss = 0 points.
      </Alert>

      {/* Group Tabs */}
      <Card sx={{ mb: 3 }} variant="outlined">
        <Tabs
          value={selectedGroup}
          onChange={(_, value) => setSelectedGroup(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {groups.map((group) => (
            <Tab key={group} label={`Group ${group}`} value={group} />
          ))}
        </Tabs>
      </Card>

      <Grid container spacing={3}>
        {/* Standings Table */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                <TrophyIcon />
                Group {selectedGroup} Standings
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, borderRadius: 1 }}>
                <Table size="small">
                  <TableHead sx={{ '& .MuiTableCell-head': { color: 'white', fontWeight: 'bold' } }}>
                    <TableRow sx={{ backgroundColor: '#9B1915' }}>
                      <TableCell>Pos</TableCell>
                      <TableCell>Team</TableCell>
                      <TableCell align="center">P</TableCell>
                      <TableCell align="center">W</TableCell>
                      <TableCell align="center">D</TableCell>
                      <TableCell align="center">L</TableCell>
                      <TableCell align="center">GF</TableCell>
                      <TableCell align="center">GA</TableCell>
                      <TableCell align="center">GD</TableCell>
                      <TableCell align="center">Pts</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {standings.map((standing) => (
                      <TableRow
                        key={standing.team.id}
                        sx={{
                          backgroundColor:
                            standing.position <= 2
                              ? 'rgba(76, 175, 80, 0.08)' // Subtle green for qualification
                              : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 'bold' }}>{standing.position}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              component="img"
                              src={standing.team.flagUrl}
                              alt={standing.team.name}
                              sx={{ width: 24, height: 18, objectFit: 'cover', borderRadius: 0, border: '1px solid #E0E0E0' }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{standing.team.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">{standing.played}</TableCell>
                        <TableCell align="center">{standing.won}</TableCell>
                        <TableCell align="center">{standing.drawn}</TableCell>
                        <TableCell align="center">{standing.lost}</TableCell>
                        <TableCell align="center">{standing.goalsFor}</TableCell>
                        <TableCell align="center">{standing.goalsAgainst}</TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 'bold',
                            color: standing.goalDifference > 0 ? 'success.main' : standing.goalDifference < 0 ? 'error.main' : 'text.primary',
                          }}
                        >
                          {standing.goalDifference > 0 ? '+' : ''}
                          {standing.goalDifference}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                          {standing.points}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Legend */}
              <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: 'rgba(76, 175, 80, 0.15)', border: '1px solid #4CAF50' }} />
                  <Typography variant="caption">Qualified for Knockout Stage</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Group Fixtures */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Group {selectedGroup} Fixtures
              </Typography>

              <Divider sx={{ my: 2 }} />

              {groupMatches.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No matches scheduled yet for this group.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {groupMatches.map((match) => (
                    <Box key={match.id} sx={{ p: 2, border: '1px solid #E0E0E0', borderRadius: 1, backgroundColor: '#FFFFFF' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        MATCH #{match.matchNumber} • {formatDate(match.matchDate)}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
                        {/* Home Team */}
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            component="img"
                            src={match.homeTeam.flagUrl}
                            alt={match.homeTeam.name}
                            sx={{ width: 24, height: 18, objectFit: 'cover', borderRadius: 0, border: '1px solid #E0E0E0' }}
                          />
                          <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                            {match.homeTeam.name}
                          </Typography>
                        </Box>

                        {/* Score or vs */}
                        <Box 
                          sx={{ 
                            minWidth: 50, 
                            textAlign: 'center', 
                            mx: 1, 
                            py: 0.5, 
                            px: 1, 
                            backgroundColor: '#F5F5F5',
                            borderRadius: 1,
                            border: '1px solid #E0E0E0'
                          }}
                        >
                          {match.status === 'finished' ? (
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {match.homeScore} - {match.awayScore}
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                              VS
                            </Typography>
                          )}
                        </Box>

                        {/* Away Team */}
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                            {match.awayTeam.name}
                          </Typography>
                          <Box
                            component="img"
                            src={match.awayTeam.flagUrl}
                            alt={match.awayTeam.name}
                            sx={{ width: 24, height: 18, objectFit: 'cover', borderRadius: 0, border: '1px solid #E0E0E0' }}
                          />
                        </Box>
                      </Box>

                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: '0.7rem' }}>
                        {match.venue.toUpperCase()}, {match.city.toUpperCase()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
