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
  TextField,
  Chip,
  Avatar,
  Grid,
  Button,
  TablePagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Download as DownloadIcon, Search as SearchIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { standingsService } from '../services/standingsService';
import type { LeaderboardEntry } from '../types';

export default function StandingsIndividualPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [standings, setStandings] = useState<LeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);

  // Fetch standings data
  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await standingsService.getIndividualStandings({
          limit: rowsPerPage,
          offset: page * rowsPerPage,
          search: searchTerm || undefined,
        });
        setStandings(response.standings);
        setTotal(response.total);
      } catch (err: any) {
        console.error('Error fetching standings:', err);
        setError(err.response?.data?.message || 'Failed to load standings');
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [page, rowsPerPage, searchTerm]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Rank', 'Customer Number', 'Name', 'Company', 'Total Points', 'Exact Scores', 'Correct Winners', 'Predictions'];
    const rows = standings.map(entry => [
      entry.rank,
      entry.customerNumber,
      entry.firstName && entry.lastName ? `${entry.firstName} ${entry.lastName}` : '(hidden)',
      entry.companyName || '(hidden)',
      entry.totalPoints,
      entry.exactScores,
      entry.correctWinners,
      entry.predictionsMade,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `standings-individual-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        🏆 Individual Standings
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        See how you rank against your colleagues. The leaderboard updates automatically after each match.
      </Typography>

      {/* Filters Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 10 }}>
              <TextField
                fullWidth
                label="Search by name"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleExportCSV}
                disabled={standings.length === 0}
                sx={{ height: '56px' }}
              >
                Export CSV
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Standings Table Card */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          ) : standings.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>
              No standings found. {searchTerm && 'Try adjusting your search.'}
            </Alert>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Customer</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Company</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Total Points</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Exact Scores</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Correct Winners</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Predictions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {standings.map((entry, index) => (
                      <TableRow
                        key={entry.userId || `anon-${index}`}
                        sx={{
                          backgroundColor: entry.isCurrentUser
                            ? 'rgba(33, 150, 243, 0.08)' // Light blue highlight for current user
                            : entry.rank === 1
                            ? '#FFD700'
                            : entry.rank === 2
                            ? '#C0C0C0'
                            : entry.rank === 3
                            ? '#CD7F32'
                            : 'inherit',
                          borderLeft: entry.isCurrentUser ? '4px solid #2196F3' : 'none',
                          '&:hover': { backgroundColor: 'action.hover' },
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {entry.rank === 1 && '🥇'}
                            {entry.rank === 2 && '🥈'}
                            {entry.rank === 3 && '🥉'}
                            {entry.rank && entry.rank > 3 && `#${entry.rank}`}
                            {entry.isCurrentUser && (
                              <Chip label="YOU" size="small" color="primary" sx={{ ml: 1 }} />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: entry.isCurrentUser ? 'bold' : 'normal',
                            }}
                          >
                            {entry.customerNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {entry.firstName && entry.lastName ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                {entry.firstName[0]}{entry.lastName[0]}
                              </Avatar>
                              <Typography variant="body1" sx={{ fontWeight: entry.isCurrentUser ? 'bold' : 'normal' }}>
                                {entry.firstName} {entry.lastName}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              (hidden)
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.companyName ? (
                            <Chip label={entry.companyName} size="small" variant="outlined" />
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              (hidden)
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={entry.totalPoints}
                            color="primary"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell align="right">{entry.exactScores}</TableCell>
                        <TableCell align="right">{entry.correctWinners}</TableCell>
                        <TableCell align="right">{entry.predictionsMade}/104</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[25, 50, 100]}
                sx={{ mt: 2 }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
