import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  BarChartOutlined as BarChartIcon,
  PieChartOutlined as PieChartIcon,
  TrendingUpOutlined as TrendingUpIcon,
  EmojiEventsOutlined as TrophyIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { dataService } from '../services/dataService';
import type { Match } from '../types';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

type TabValue = 'overview' | 'group' | 'knockout' | 'predictions';

export default function StatisticsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [topScorers, setTopScorers] = useState<any[]>([]);
  const [topCards, setTopCards] = useState<any[]>([]);
  const [predictionStats, setPredictionStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabValue>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [matchesData, statsData, predStats] = await Promise.all([
        dataService.getMatches(),
        dataService.getTournamentStatistics('2022'), // Use 2022 for testing
        dataService.getPredictionStatistics(),
      ]);
      
      setMatches(matchesData);
      setTopScorers(statsData.topScorers);
      setTopCards(statsData.topCards);
      setPredictionStats(predStats);
    } catch (err) {
      console.error('Failed to load statistics:', err);
      setError('Failed to load statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate tournament statistics
  const calculateStats = () => {
    const finishedMatches = matches.filter((m) => m.status === 'finished');

    const totalGoals = finishedMatches.reduce(
      (sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0),
      0
    );

    const avgGoalsPerMatch = finishedMatches.length > 0 ? totalGoals / finishedMatches.length : 0;

    const maxGoalsMatch = finishedMatches.reduce(
      (max, m) => {
        const goals = (m.homeScore || 0) + (m.awayScore || 0);
        return goals > max.goals ? { match: m, goals } : max;
      },
      { match: null as Match | null, goals: 0 }
    );

    // Calculate team goal stats
    const teamGoals: Record<string, number> = {};
    finishedMatches.forEach((m) => {
      const homeId = m.homeTeam.id;
      const awayId = m.awayTeam.id;
      teamGoals[homeId] = (teamGoals[homeId] || 0) + (m.homeScore || 0);
      teamGoals[awayId] = (teamGoals[awayId] || 0) + (m.awayScore || 0);
    });

    const topScoringTeam = Object.entries(teamGoals).reduce(
      (max, [teamId, goals]) => {
        if (goals > max.goals) {
          const team = matches.find((m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId);
          return {
            team: team?.homeTeam.id === teamId ? team.homeTeam : team?.awayTeam,
            goals,
          };
        }
        return max;
      },
      { team: null as any, goals: 0 }
    );

    return {
      totalMatches: matches.length,
      finishedMatches: finishedMatches.length,
      scheduledMatches: matches.filter((m) => m.status === 'scheduled').length,
      totalGoals,
      avgGoalsPerMatch,
      maxGoalsMatch: maxGoalsMatch.match,
      maxGoals: maxGoalsMatch.goals,
      topScoringTeam: topScoringTeam.team,
      topScoringTeamGoals: topScoringTeam.goals,
    };
    };
  };

  const renderStageStats = (stageType: 'group' | 'knockout') => {
    const isGroup = stageType === 'group';
    const stageMatches = matches.filter(m => 
      isGroup ? m.stage === 'group' : m.stage !== 'group'
    );
    const finishedCount = stageMatches.filter(m => m.status === 'finished').length;
    const goals = stageMatches.reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0);
    const avgGoals = finishedCount > 0 ? goals / finishedCount : 0;

    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                {isGroup ? 'Group Stage' : 'Knockout Stage'} Overview
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ py: 1 }}>
                <Typography variant="body2" color="text.secondary">Total Matches</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stageMatches.length}</Typography>
              </Box>
              <Box sx={{ py: 1 }}>
                <Typography variant="body2" color="text.secondary">Matches Played</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{finishedCount}</Typography>
              </Box>
              <Box sx={{ py: 1 }}>
                <Typography variant="body2" color="text.secondary">Total Goals</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{goals}</Typography>
              </Box>
              <Box sx={{ py: 1 }}>
                <Typography variant="body2" color="text.secondary">Average Goals</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{avgGoals.toFixed(2)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Goals per Match ({isGroup ? 'Groups' : 'Knockout'})
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar
                  data={{
                    labels: stageMatches.filter(m => m.status === 'finished').slice(-15).map(m => `M${m.matchNumber}`),
                    datasets: [{
                      label: 'Goals',
                      data: stageMatches.filter(m => m.status === 'finished').slice(-15).map(m => (m.homeScore || 0) + (m.awayScore || 0)),
                      backgroundColor: '#9B1915'
                    }]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderPredictionStats = () => {
    if (!predictionStats) return null;

    const { accuracy, championPredictions, scorerPredictions } = predictionStats;

    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Prediction Accuracy
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', mt: 2 }}>
                {accuracy.total > 0 ? (
                  <Pie
                    data={{
                      labels: ['Exact Score', 'Correct Winner', 'Incorrect'],
                      datasets: [{
                        data: [accuracy.exact, accuracy.winner, accuracy.incorrect],
                        backgroundColor: ['#4CAF50', '#2196F3', '#F44336']
                      }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                  />
                ) : (
                  <Typography color="text.secondary">No predictions have been scored yet.</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Top Champion Predictions
              </Typography>
              <Divider sx={{ my: 1 }} />
              {championPredictions.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  {championPredictions.map((pred: any, idx: number) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{pred.answer}</Typography>
                      <Chip label={`${pred.count} Users`} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No champion predictions made yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Top Scorer Predictions
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {scorerPredictions.length > 0 ? (
                  scorerPredictions.map((pred: any, idx: number) => (
                    <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box sx={{ p: 2, border: '1px solid #E0E0E0', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{pred.answer}</Typography>
                        <Typography variant="body2" color="text.secondary">{pred.count} votes</Typography>
                      </Box>
                    </Grid>
                  ))
                ) : (
                  <Grid size={{ xs: 12 }}>
                    <Typography color="text.secondary">No top scorer predictions made yet.</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Prepare chart data for matches by stage
  const getStageDistributionData = () => {
    const stageCounts: Record<string, number> = {};
    matches.forEach((m) => {
      stageCounts[m.stage] = (stageCounts[m.stage] || 0) + 1;
    });

    const stageLabels: Record<string, string> = {
      group: 'Group Stage',
      round32: 'Round of 32',
      round16: 'Round of 16',
      quarter: 'Quarter-finals',
      semi: 'Semi-finals',
      final: 'Final',
      third_place: '3rd Place',
    };

    return {
      labels: Object.keys(stageCounts).map((s) => stageLabels[s] || s),
      datasets: [
        {
          label: 'Matches',
          data: Object.values(stageCounts),
          backgroundColor: [
            '#9B1915',
            '#C42420',
            '#E53935',
            '#EF5350',
            '#E57373',
            '#EF9A9A',
            '#FFCDD2',
          ],
        },
      ],
    };
  };

  // Prepare chart data for match status
  const getStatusDistributionData = () => {
    const statusCounts: Record<string, number> = {};
    matches.forEach((m) => {
      statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;
    });

    return {
      labels: ['Scheduled', 'Live', 'Finished'],
      datasets: [
        {
          data: [
            statusCounts.scheduled || 0,
            statusCounts.live || 0,
            statusCounts.finished || 0,
          ],
          backgroundColor: ['#666666', '#d32f2f', '#388e3c'],
        },
      ],
    };
  };

  // Goals per stage chart
  const getGoalsPerStageData = () => {
    const stageGoals: Record<string, number> = {};
    matches
      .filter((m) => m.status === 'finished')
      .forEach((m) => {
        const goals = (m.homeScore || 0) + (m.awayScore || 0);
        stageGoals[m.stage] = (stageGoals[m.stage] || 0) + goals;
      });

    const stageLabels: Record<string, string> = {
      group: 'Group Stage',
      round32: 'Round of 32',
      round16: 'Round of 16',
      quarter: 'Quarter-finals',
      semi: 'Semi-finals',
      final: 'Final',
      third_place: '3rd Place',
    };

    return {
      labels: Object.keys(stageGoals).map((s) => stageLabels[s] || s),
      datasets: [
        {
          label: 'Goals Scored',
          data: Object.values(stageGoals),
          backgroundColor: '#9B1915',
        },
      ],
    };
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

  const stats = calculateStats();

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Tournament Statistics
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Comprehensive statistics and insights from the World Cup 2026
      </Typography>

      {/* Tabs */}
      <Card sx={{ mb: 3 }} variant="outlined">
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<TrendingUpIcon />} iconPosition="start" label="Overview" value="overview" />
          <Tab icon={<BarChartIcon />} iconPosition="start" label="Group Stage" value="group" />
          <Tab icon={<TrophyIcon />} iconPosition="start" label="Knockout" value="knockout" />
          <Tab icon={<PieChartIcon />} iconPosition="start" label="Predictions" value="predictions" />
        </Tabs>
      </Card>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <Box>
          {/* Key Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined" sx={{ borderLeft: '4px solid #9B1915' }}>
                <CardContent>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats.totalMatches}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Total Matches
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined" sx={{ borderLeft: '4px solid #4CAF50' }}>
                <CardContent>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats.finishedMatches}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Matches Played
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined" sx={{ borderLeft: '4px solid #666666' }}>
                <CardContent>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats.totalGoals}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Total Goals
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined" sx={{ borderLeft: '4px solid #0288D1' }}>
                <CardContent>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats.avgGoalsPerMatch.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Avg Goals/Match
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Highlight Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.maxGoalsMatch && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                      Highest-Scoring Match
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          component="img"
                          src={stats.maxGoalsMatch.homeTeam.flagUrl}
                          alt={stats.maxGoalsMatch.homeTeam.name}
                          sx={{ width: 32, height: 24, objectFit: 'cover', border: '1px solid #E0E0E0' }}
                        />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{stats.maxGoalsMatch.homeTeam.name}</Typography>
                      </Box>
                      <Box sx={{ px: 2, py: 0.5, backgroundColor: '#F5F5F5', borderRadius: 1, border: '1px solid #E0E0E0' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                          {stats.maxGoalsMatch.homeScore} - {stats.maxGoalsMatch.awayScore}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{stats.maxGoalsMatch.awayTeam.name}</Typography>
                        <Box
                          component="img"
                          src={stats.maxGoalsMatch.awayTeam.flagUrl}
                          alt={stats.maxGoalsMatch.awayTeam.name}
                          sx={{ width: 32, height: 24, objectFit: 'cover', border: '1px solid #E0E0E0' }}
                        />
                      </Box>
                    </Box>
                    <Chip
                      label={`${stats.maxGoals} Total Goals`}
                      size="small"
                      variant="outlined"
                      sx={{ mt: 1, borderRadius: 1, fontWeight: 'bold' }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            )}

            {stats.topScoringTeam && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                      Top Scoring Team
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        component="img"
                        src={stats.topScoringTeam.flagUrl}
                        alt={stats.topScoringTeam.name}
                        sx={{ width: 64, height: 48, objectFit: 'cover', border: '1px solid #E0E0E0' }}
                      />
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                          {stats.topScoringTeam.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {stats.topScoringTeamGoals} goals scored
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Top Scorers
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {topScorers.length > 0 ? (
                    <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                      {topScorers.slice(0, 10).map((player: any, index: number) => (
                        <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: 25, color: '#9B1915' }}>
                              {index + 1}.
                            </Typography>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>{player.player.name}</Typography>
                              <Typography variant="body2" color="text.secondary">{player.statistics[0].team.name}</Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={`${player.statistics[0].goals.total} Goals`} 
                            size="small" 
                            sx={{ backgroundColor: '#F5F5F5', fontWeight: 'bold' }} 
                          />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No top scorers data available.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Discipline (Yellow Cards)
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {topCards.length > 0 ? (
                    <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                      {topCards.slice(0, 10).map((player: any, index: number) => (
                        <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: 25, color: '#9B1915' }}>
                              {index + 1}.
                            </Typography>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>{player.player.name}</Typography>
                              <Typography variant="body2" color="text.secondary">{player.statistics[0].team.name}</Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={`${player.statistics[0].cards.yellow} Yellow`} 
                            size="small" 
                            sx={{ backgroundColor: '#FFEB3B', fontWeight: 'bold' }} 
                          />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No discipline data available.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Matches by Stage
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar
                      data={getStageDistributionData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                        },
                        scales: {
                          y: { beginAtZero: true, grid: { display: false } },
                          x: { grid: { display: false } }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Match Status
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                    <Pie
                      data={getStatusDistributionData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Goals per Stage
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar
                      data={getGoalsPerStageData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                        },
                        scales: {
                          y: { beginAtZero: true, grid: { display: false } },
                          x: { grid: { display: false } }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Other tabs placeholder */}
      {selectedTab === 'group' && renderStageStats('group')}
      {selectedTab === 'knockout' && renderStageStats('knockout')}
      {selectedTab === 'predictions' && renderPredictionStats()}
    </Box>
  );
}
