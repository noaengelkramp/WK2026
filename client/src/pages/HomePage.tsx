import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { EmojiEvents as TrophyIcon, Schedule as ClockIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { standingsService } from '../services/standingsService';
import type { Match, LeaderboardEntry } from '../types';

interface DepartmentStanding {
  rank: number | null;
  departmentId: string;
  totalPoints: number;
  averagePoints: string;
  participantCount: number;
  department: {
    id: string;
    name: string;
    logoUrl?: string;
  };
}

// Cache duration: 5 minutes (to avoid excessive API calls during development)
const CACHE_DURATION = 5 * 60 * 1000;

// Helper to get cached data
const getCachedData = <T,>(key: string): T | null => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  
  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data as T;
    }
    localStorage.removeItem(key);
  } catch {
    localStorage.removeItem(key);
  }
  return null;
};

// Helper to set cached data
const setCachedData = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
};

export default function HomePage() {
  const navigate = useNavigate();
  
  // State for data
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [topDepartments, setTopDepartments] = useState<DepartmentStanding[]>([]);
  
  // Loading states
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  
  // Error states
  const [matchError, setMatchError] = useState<string | null>(null);
  const [playersError, setPlayersError] = useState<string | null>(null);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);

  // Fetch next match
  useEffect(() => {
    const fetchNextMatch = async () => {
      // Check cache first
      const cached = getCachedData<Match>('homepage_next_match');
      if (cached) {
        setNextMatch(cached);
        setLoadingMatches(false);
        return;
      }

      try {
        setLoadingMatches(true);
        setMatchError(null);
        const matches = await dataService.getUpcomingMatches(1);
        if (matches && matches.length > 0) {
          setNextMatch(matches[0]);
          setCachedData('homepage_next_match', matches[0]);
        }
      } catch (error: any) {
        console.error('Error fetching next match:', error);
        setMatchError(error.response?.data?.message || 'Failed to load next match');
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchNextMatch();
  }, []);

  // Fetch top players
  useEffect(() => {
    const fetchTopPlayers = async () => {
      // Check cache first
      const cached = getCachedData<LeaderboardEntry[]>('homepage_top_players');
      if (cached) {
        setTopPlayers(cached);
        setLoadingPlayers(false);
        return;
      }

      try {
        setLoadingPlayers(true);
        setPlayersError(null);
        const response = await standingsService.getIndividualStandings({ limit: 5, offset: 0 });
        setTopPlayers(response.standings);
        setCachedData('homepage_top_players', response.standings);
      } catch (error: any) {
        console.error('Error fetching top players:', error);
        setPlayersError(error.response?.data?.message || 'Failed to load leaderboard');
      } finally {
        setLoadingPlayers(false);
      }
    };

    fetchTopPlayers();
  }, []);

  // Fetch top departments
  useEffect(() => {
    const fetchTopDepartments = async () => {
      // Check cache first
      const cached = getCachedData<DepartmentStanding[]>('homepage_top_departments');
      if (cached) {
        setTopDepartments(cached);
        setLoadingDepartments(false);
        return;
      }

      try {
        setLoadingDepartments(true);
        setDepartmentsError(null);
        const response = await standingsService.getDepartmentStandings();
        // Sort by total points and take top 5
        const sorted = response.standings
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .slice(0, 5);
        setTopDepartments(sorted);
        setCachedData('homepage_top_departments', sorted);
      } catch (error: any) {
        console.error('Error fetching department standings:', error);
        setDepartmentsError(error.response?.data?.message || 'Failed to load department standings');
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchTopDepartments();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        🏆 Welcome to World Cup 2026 Prediction Game
      </Typography>

      <Grid container spacing={3}>
        {/* Next Match Card */}
        <Grid size={12}>
          <Card sx={{ background: 'linear-gradient(135deg, #9B1915 0%, #C42420 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ClockIcon /> Next Match
              </Typography>
              
              {loadingMatches ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: 'white' }} />
                </Box>
              ) : matchError ? (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {matchError}
                </Alert>
              ) : nextMatch ? (
                <>
                  <Grid container spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
                    <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'center' }}>
                      <Typography variant="h3">{nextMatch.homeTeam.flagUrl}</Typography>
                      <Typography variant="h6">{nextMatch.homeTeam.name}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'center' }}>
                      <Chip label={nextMatch.status.toUpperCase()} color="warning" sx={{ mb: 1 }} />
                      <Typography variant="h5">VS</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {new Date(nextMatch.matchDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                      <Typography variant="body2">{nextMatch.venue}, {nextMatch.city}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'center' }}>
                      <Typography variant="h3">{nextMatch.awayTeam.flagUrl}</Typography>
                      <Typography variant="h6">{nextMatch.awayTeam.name}</Typography>
                    </Grid>
                  </Grid>
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      onClick={() => navigate('/my-prediction')}
                    >
                      Submit Your Predictions
                    </Button>
                  </Box>
                </>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No upcoming matches scheduled
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Deadline Countdown Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)', height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ color: '#9B1915' }}>
                ⏰ Prediction Deadline
              </Typography>
              <Typography variant="h3" sx={{ my: 2, color: '#9B1915' }}>
                15 Days 4 Hours
              </Typography>
              <Typography variant="body1" sx={{ color: '#212121' }}>
                June 11, 2026 at 23:00
              </Typography>
              <Typography variant="body2" sx={{ mt: 2, color: '#666666' }}>
                Make sure to submit all your predictions before the deadline!
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Prize Info Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #C42420 0%, #9B1915 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrophyIcon /> Prizes to Win!
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>
                🎯 1st: Professional Foosball Table
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                📺 2nd: Smart TV 55"
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                📱 3rd: iPad Pro
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                sx={{ mt: 2 }}
                onClick={() => navigate('/prizes')}
              >
                View All Prizes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Individual Players */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrophyIcon color="primary" /> Top Individual Players
              </Typography>
              
              {loadingPlayers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : playersError ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {playersError}
                </Alert>
              ) : topPlayers.length > 0 ? (
                <>
                  <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Rank</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell align="right">Points</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topPlayers.map((entry) => (
                          <TableRow key={entry.user.id}>
                            <TableCell>
                              {entry.rank === 1 && '🥇'}
                              {entry.rank === 2 && '🥈'}
                              {entry.rank === 3 && '🥉'}
                              {entry.rank && entry.rank > 3 && entry.rank}
                            </TableCell>
                            <TableCell>
                              {entry.user.firstName} {entry.user.lastName}
                            </TableCell>
                            <TableCell align="right">
                              <Chip label={entry.totalPoints} color="primary" size="small" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Button
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/standings/individual')}
                  >
                    View Full Standings
                  </Button>
                </>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No players have made predictions yet
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Departments */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrophyIcon color="secondary" /> Top Departments
              </Typography>
              
              {loadingDepartments ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : departmentsError ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {departmentsError}
                </Alert>
              ) : topDepartments.length > 0 ? (
                <>
                  <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Rank</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell align="right">Avg Points</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topDepartments.map((dept, index) => (
                          <TableRow key={dept.departmentId}>
                            <TableCell>
                              {index + 1 === 1 && '🥇'}
                              {index + 1 === 2 && '🥈'}
                              {index + 1 === 3 && '🥉'}
                              {index + 1 > 3 && (index + 1)}
                            </TableCell>
                            <TableCell>{dept.department.name}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={parseFloat(dept.averagePoints).toFixed(1)} 
                                color="secondary" 
                                size="small" 
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Button
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/standings/departments')}
                  >
                    View Department Standings
                  </Button>
                </>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No department standings available yet
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Links */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Quick Links
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button fullWidth variant="outlined" onClick={() => navigate('/matches')}>
                    View Matches
                  </Button>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button fullWidth variant="outlined" onClick={() => navigate('/groups')}>
                    Group Standings
                  </Button>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button fullWidth variant="outlined" onClick={() => navigate('/statistics')}>
                    Statistics
                  </Button>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button fullWidth variant="outlined" onClick={() => navigate('/rules')}>
                    How to Play
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
