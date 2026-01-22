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
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
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

      const matchesData = await dataService.getMatches();
      setMatches(matchesData);
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
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        📊 Tournament Statistics
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Comprehensive statistics and insights from the World Cup 2026
      </Typography>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
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
              <Card sx={{ background: 'linear-gradient(135deg, #9B1915 0%, #C42420 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {stats.totalMatches}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Total Matches
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {stats.finishedMatches}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Matches Played
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ background: 'linear-gradient(135deg, #666666 0%, #888888 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {stats.totalGoals}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Total Goals
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {stats.avgGoalsPerMatch.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
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
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🔥 Highest-Scoring Match
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          component="img"
                          src={stats.maxGoalsMatch.homeTeam.flagUrl}
                          alt={stats.maxGoalsMatch.homeTeam.name}
                          sx={{ width: 32, height: 24, objectFit: 'cover', borderRadius: 0.5 }}
                        />
                        <Typography variant="body1">{stats.maxGoalsMatch.homeTeam.name}</Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', px: 2 }}>
                        {stats.maxGoalsMatch.homeScore} - {stats.maxGoalsMatch.awayScore}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">{stats.maxGoalsMatch.awayTeam.name}</Typography>
                        <Box
                          component="img"
                          src={stats.maxGoalsMatch.awayTeam.flagUrl}
                          alt={stats.maxGoalsMatch.awayTeam.name}
                          sx={{ width: 32, height: 24, objectFit: 'cover', borderRadius: 0.5 }}
                        />
                      </Box>
                    </Box>
                    <Chip
                      label={`${stats.maxGoals} Total Goals`}
                      color="primary"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            )}

            {stats.topScoringTeam && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      ⚽ Top Scoring Team
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        component="img"
                        src={stats.topScoringTeam.flagUrl}
                        alt={stats.topScoringTeam.name}
                        sx={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 1, boxShadow: 2 }}
                      />
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                          {stats.topScoringTeam.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
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
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
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
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Match Status
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                    <Pie
                      data={getStatusDistributionData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom' },
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
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
      {selectedTab !== 'overview' && (
        <Card>
          <CardContent>
            <Alert severity="info">
              <Typography variant="h6" gutterBottom>
                {selectedTab === 'group' && 'Group Stage Statistics'}
                {selectedTab === 'knockout' && 'Knockout Stage Statistics'}
                {selectedTab === 'predictions' && 'Prediction Statistics'}
              </Typography>
              <Typography variant="body2">
                Detailed statistics for this section will be available as the tournament progresses.
                {selectedTab === 'predictions' && ' Prediction accuracy data requires user predictions and match results.'}
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
