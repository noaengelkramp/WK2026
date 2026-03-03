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
  
  // Loading states
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  
  // Error states
  const [matchError, setMatchError] = useState<string | null>(null);
  const [playersError, setPlayersError] = useState<string | null>(null);

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

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          World Cup 2026 Prediction Challenge
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Compete with colleagues and win amazing prizes.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Next Match Card */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ClockIcon sx={{ color: '#9B1915' }} /> Next Match
                </Typography>
                <Chip label="LIVE SOON" color="warning" size="small" />
              </Box>
              
              {loadingMatches ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : matchError ? (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {matchError}
                </Alert>
              ) : nextMatch ? (
                <>
                  <Grid container spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
                    <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'center' }}>
                      <Box
                        component="img"
                        src={nextMatch.homeTeam.flagUrl}
                        alt={`${nextMatch.homeTeam.name} flag`}
                        sx={{
                          width: 100,
                          height: 75,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid #E0E0E0',
                          mb: 1,
                        }}
                      />
                      <Typography variant="h6">{nextMatch.homeTeam.name}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'center' }}>
                      <Typography variant="h5">VS</Typography>
                      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                        {new Date(nextMatch.matchDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{nextMatch.venue}, {nextMatch.city}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'center' }}>
                      <Box
                        component="img"
                        src={nextMatch.awayTeam.flagUrl}
                        alt={`${nextMatch.awayTeam.name} flag`}
                        sx={{
                          width: 100,
                          height: 75,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid #E0E0E0',
                          mb: 1,
                        }}
                      />
                      <Typography variant="h6">{nextMatch.awayTeam.name}</Typography>
                    </Grid>
                  </Grid>
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => navigate('/my-prediction')}
                    >
                      Make your predictions now
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
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Prediction Deadline
              </Typography>
              <Typography variant="h3" sx={{ my: 1, color: '#9B1915', fontWeight: 700 }}>
                15
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>Days 4 Hours</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                June 11, 2026 at 23:00
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Prize Info Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #C42420 0%, #9B1915 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                <TrophyIcon sx={{ color: 'white' }} /> Prizes to Win
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
                1st: Professional Foosball Table
              </Typography>
              <Typography variant="h6" sx={{ mt: 1, color: 'white' }}>
                2nd: Smart TV 55"
              </Typography>
              <Typography variant="h6" sx={{ mt: 1, color: 'white' }}>
                3rd: iPad Pro
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2, color: 'white', borderColor: 'rgba(255,255,255,0.6)' }}
                onClick={() => navigate('/prizes')}
              >
                View all prizes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Individual Players */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrophyIcon color="primary" /> Top Players
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Live snapshot of the current leaderboard.
                  </Typography>
                </Box>
                <Button variant="outlined" onClick={() => navigate('/standings/individual')}>
                  View all standings
                </Button>
              </Box>
              
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
                        {topPlayers.map((entry, index) => (
                          <TableRow key={entry.userId || `player-${index}`}>
                            <TableCell>
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  bgcolor:
                                    entry.rank === 1
                                      ? '#FFD700'
                                      : entry.rank === 2
                                      ? '#C0C0C0'
                                      : entry.rank === 3
                                      ? '#CD7F32'
                                      : '#E0E0E0',
                                  color: '#212121',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                }}
                              >
                                {entry.rank ?? index + 1}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {entry.firstName && entry.lastName 
                                ? `${entry.firstName} ${entry.lastName}`
                                : entry.customerNumber
                              }
                            </TableCell>
                            <TableCell align="right">
                              <Chip label={entry.totalPoints} color="primary" size="small" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No players have made predictions yet
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Links */}
        <Grid size={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Quick access
          </Typography>
          <Grid container spacing={2}>
            {[
              { label: 'View matches', path: '/matches' },
              { label: 'Group standings', path: '/groups' },
              { label: 'Statistics', path: '/statistics' },
              { label: 'How to play', path: '/rules' },
            ].map((item) => (
              <Grid key={item.path} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {item.label}
                    </Typography>
                    <Button variant="outlined" onClick={() => navigate(item.path)}>
                      Open
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
