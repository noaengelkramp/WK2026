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
} from '@mui/material';
import { EmojiEvents as TrophyIcon, Schedule as ClockIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getNextMatch, mockLeaderboard, mockDepartmentStandings } from '../data/mockData';

export default function HomePage() {
  const navigate = useNavigate();
  const nextMatch = getNextMatch();
  const topPlayers = mockLeaderboard.slice(0, 5);
  const topDepartments = mockDepartmentStandings.slice(0, 5);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        🏆 Welcome to World Cup 2026 Prediction Game
      </Typography>

      <Grid container spacing={3}>
        {/* Next Match Card */}
        <Grid size={12}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ClockIcon /> Next Match
              </Typography>
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
            </CardContent>
          </Card>
        </Grid>

        {/* Deadline Countdown Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                ⏰ Prediction Deadline
              </Typography>
              <Typography variant="h3" sx={{ my: 2 }}>
                15 Days 4 Hours
              </Typography>
              <Typography variant="body1">
                June 11, 2026 at 23:00
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Make sure to submit all your predictions before the deadline!
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Prize Info Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', height: '100%' }}>
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
                      <TableRow key={entry.rank}>
                        <TableCell>
                          {entry.rank === 1 && '🥇'}
                          {entry.rank === 2 && '🥈'}
                          {entry.rank === 3 && '🥉'}
                          {entry.rank > 3 && entry.rank}
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
                    {topDepartments.map((dept) => (
                      <TableRow key={dept.rank}>
                        <TableCell>
                          {dept.rank === 1 && '🥇'}
                          {dept.rank === 2 && '🥈'}
                          {dept.rank === 3 && '🥉'}
                          {dept.rank > 3 && dept.rank}
                        </TableCell>
                        <TableCell>{dept.departmentName}</TableCell>
                        <TableCell align="right">
                          <Chip label={dept.averagePoints.toFixed(1)} color="secondary" size="small" />
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
