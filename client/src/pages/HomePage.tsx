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
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  EmojiEventsOutlined as TrophyIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#212121' }}>
          World Cup 2026 Prediction Challenge
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Compete with other football fans and win amazing prizes.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Next Match Card - Catalog Style */}
        <Grid size={12}>
          <Card variant="outlined" sx={{ overflow: 'hidden' }}>
            <Box sx={{ 
              backgroundColor: '#F5F5F5', 
              px: 3, 
              py: 1.5, 
              borderBottom: '1px solid #E0E0E0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666666' }}>
                Upcoming Match
              </Typography>
              <Chip 
                label="LIVE SOON" 
                size="small" 
                sx={{ 
                  backgroundColor: '#FF9800', 
                  color: 'white', 
                  fontWeight: 700,
                  borderRadius: '2px',
                  height: '20px',
                  fontSize: '0.65rem'
                }} 
              />
            </Box>
            <CardContent sx={{ p: 4 }}>
              {loadingMatches ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} sx={{ color: '#9B1915' }} />
                </Box>
              ) : matchError ? (
                <Alert severity="warning" variant="outlined" sx={{ borderRadius: 0 }}>
                  {matchError}
                </Alert>
              ) : nextMatch ? (
                <Grid container spacing={4} sx={{ alignItems: 'center' }}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 4 }, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Box
                          component="img"
                          src={nextMatch.homeTeam.flagUrl}
                          alt={nextMatch.homeTeam.name}
                          sx={{
                            width: { xs: 60, sm: 80 },
                            height: { xs: 45, sm: 60 },
                            objectFit: 'cover',
                            border: '1px solid #E0E0E0',
                            mb: 1,
                          }}
                        />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{nextMatch.homeTeam.name}</Typography>
                      </Box>
                      
                      <Typography variant="h6" sx={{ color: '#999', fontWeight: 300 }}>VS</Typography>
                      
                      <Box sx={{ textAlign: 'center' }}>
                        <Box
                          component="img"
                          src={nextMatch.awayTeam.flagUrl}
                          alt={nextMatch.awayTeam.name}
                          sx={{
                            width: { xs: 60, sm: 80 },
                            height: { xs: 45, sm: 60 },
                            objectFit: 'cover',
                            border: '1px solid #E0E0E0',
                            mb: 1,
                          }}
                        />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{nextMatch.awayTeam.name}</Typography>
                      </Box>
                      
                      <Box sx={{ ml: { md: 4 }, display: { xs: 'none', sm: 'block' }, borderLeft: '1px solid #E0E0E0', pl: 4 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#212121' }}>
                          {new Date(nextMatch.matchDate).toLocaleDateString('en-GB', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(nextMatch.matchDate).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} • {nextMatch.venue}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      endIcon={<ChevronRightIcon fontSize="small" />}
                      onClick={() => navigate('/my-prediction')}
                      sx={{ px: 4 }}
                    >
                      Predict Now
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info" variant="outlined" sx={{ borderRadius: 0 }}>
                  No upcoming matches scheduled
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Deadline Countdown Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 0 }}>
            <CardContent>
              <Typography variant="overline" sx={{ fontWeight: 700, color: '#666' }}>
                Prediction Deadline
              </Typography>
              <Typography variant="h3" sx={{ my: 1, color: '#9B1915', fontWeight: 700 }}>
                15
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>Days 4 Hours</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                June 11, 2026 at 23:00
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Prize Info Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ height: '100%', backgroundColor: '#FFFFFF', borderRadius: 0, borderLeft: '4px solid #9B1915' }}>
            <CardContent>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, color: '#212121' }}>
                <TrophyIcon sx={{ color: '#9B1915' }} /> Top Prizes
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={4}>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>1st Place</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>65" Smart TV</Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>2nd Place</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Premium Tablet</Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>3rd Place</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Official Football Kit</Typography>
                </Grid>
              </Grid>
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                onClick={() => navigate('/prizes')}
              >
                View Prize Catalog
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Individual Players */}
        <Grid size={12}>
          <Card variant="outlined" sx={{ borderRadius: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Leaderboard
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Live snapshot of the top performing participants.
                  </Typography>
                </Box>
                <Button variant="outlined" size="small" onClick={() => navigate('/standings/individual')}>
                  View Full Standings
                </Button>
              </Box>
              
              {loadingPlayers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} sx={{ color: '#9B1915' }} />
                </Box>
              ) : playersError ? (
                <Alert severity="error" variant="outlined" sx={{ borderRadius: 0 }}>
                  {playersError}
                </Alert>
              ) : topPlayers.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell width={80}>Rank</TableCell>
                        <TableCell>Participant</TableCell>
                        <TableCell align="right">Total Points</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topPlayers.map((entry, index) => (
                        <TableRow key={entry.userId || `player-${index}`} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 700,
                              color: entry.rank === 1 ? '#9B1915' : 'inherit'
                            }}>
                              {entry.rank ?? index + 1}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {entry.username || (entry.firstName && entry.lastName 
                              ? `${entry.firstName} ${entry.lastName}`
                              : entry.customerNumber)
                            }
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {entry.totalPoints}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info" variant="outlined" sx={{ borderRadius: 0 }}>
                  No players have made predictions yet
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Links */}
        <Grid size={12}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase', color: '#666' }}>
            Quick Links
          </Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Match Schedule', path: '/matches' },
              { label: 'Groups & Standings', path: '/groups' },
              { label: 'Game Statistics', path: '/statistics' },
              { label: 'Rules & FAQ', path: '/rules' },
            ].map((item) => (
              <Grid key={item.path} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  variant="outlined"
                  onClick={() => navigate(item.path)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 0,
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      borderColor: '#9B1915',
                      backgroundColor: '#F5F5F5'
                    },
                  }}
                >
                  <CardContent sx={{ p: '16px !important', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {item.label}
                    </Typography>
                    <ChevronRightIcon fontSize="small" sx={{ color: '#9B1915' }} />
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
