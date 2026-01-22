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
} from '@mui/material';
import { EmojiEvents as TrophyIcon, Info as InfoIcon } from '@mui/icons-material';
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

  const groups: GroupLetter[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [teamsData, matchesData] = await Promise.all([
        dataService.getTeams(),
        dataService.getMatches({ stage: 'group' }),
      ]);

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
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        🏆 World Cup Groups
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View standings and fixtures for all 12 groups
      </Typography>

      {/* Qualification Info */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        <strong>Qualification Rules:</strong> The top 2 teams from each group advance to the knockout stage, plus
        the best 8 third-place teams. Win = 3 points, Draw = 1 point, Loss = 0 points.
      </Alert>

      {/* Group Tabs */}
      <Card sx={{ mb: 3 }}>
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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrophyIcon color="primary" />
                Group {selectedGroup} Standings
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Pos</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Team</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        P
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        W
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        D
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        L
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        GF
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        GA
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        GD
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        Pts
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {standings.map((standing) => (
                      <TableRow
                        key={standing.team.id}
                        sx={{
                          backgroundColor:
                            standing.position <= 2
                              ? '#e8f5e9' // Top 2 qualify (light green)
                              : standing.position === 3
                              ? '#fff9c4' // 3rd place (light yellow - may qualify)
                              : 'transparent',
                        }}
                      >
                        <TableCell sx={{ fontWeight: 'bold' }}>{standing.position}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              component="img"
                              src={standing.team.flagUrl}
                              alt={standing.team.name}
                              sx={{ width: 24, height: 18, objectFit: 'cover', borderRadius: 0.5 }}
                            />
                            <Typography variant="body2">{standing.team.name}</Typography>
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
                  <Box sx={{ width: 16, height: 16, backgroundColor: '#e8f5e9', border: '1px solid #ddd' }} />
                  <Typography variant="caption">Qualified</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: '#fff9c4', border: '1px solid #ddd' }} />
                  <Typography variant="caption">Possible (3rd place)</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Group Fixtures */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
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
                    <Box key={match.id} sx={{ p: 2, backgroundColor: '#F5F5F5', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Match #{match.matchNumber} • {formatDate(match.matchDate)}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                        {/* Home Team */}
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            component="img"
                            src={match.homeTeam.flagUrl}
                            alt={match.homeTeam.name}
                            sx={{ width: 24, height: 18, objectFit: 'cover', borderRadius: 0.5 }}
                          />
                          <Typography variant="body2" noWrap>
                            {match.homeTeam.name}
                          </Typography>
                        </Box>

                        {/* Score or vs */}
                        <Box sx={{ minWidth: 60, textAlign: 'center', mx: 1 }}>
                          {match.status === 'finished' ? (
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {match.homeScore} - {match.awayScore}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              vs
                            </Typography>
                          )}
                        </Box>

                        {/* Away Team */}
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                          <Typography variant="body2" noWrap>
                            {match.awayTeam.name}
                          </Typography>
                          <Box
                            component="img"
                            src={match.awayTeam.flagUrl}
                            alt={match.awayTeam.name}
                            sx={{ width: 24, height: 18, objectFit: 'cover', borderRadius: 0.5 }}
                          />
                        </Box>
                      </Box>

                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {match.venue}, {match.city}
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
