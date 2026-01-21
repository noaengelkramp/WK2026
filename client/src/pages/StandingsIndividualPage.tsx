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
} from '@mui/material';
import { useState } from 'react';
import { mockLeaderboard } from '../data/mockData';

export default function StandingsIndividualPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeaderboard = mockLeaderboard.filter((entry) =>
    `${entry.user.firstName} ${entry.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        🏆 Individual Standings
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Search by name"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to search..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Player</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Department</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Total Points</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Exact Scores</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Correct Winners</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Predictions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLeaderboard.map((entry, index) => (
                  <TableRow
                    key={entry.user.id}
                    sx={{
                      backgroundColor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#CD7F32' : 'inherit',
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {entry.rank === 1 && '🥇'}
                        {entry.rank === 2 && '🥈'}
                        {entry.rank === 3 && '🥉'}
                        {entry.rank > 3 && entry.rank}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {entry.user.firstName[0]}{entry.user.lastName[0]}
                        </Avatar>
                        <Typography variant="body1">
                          {entry.user.firstName} {entry.user.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{entry.department.name}</TableCell>
                    <TableCell align="right">
                      <Chip label={entry.totalPoints} color="primary" />
                    </TableCell>
                    <TableCell align="right">{entry.correctScores}</TableCell>
                    <TableCell align="right">{entry.correctWinners}</TableCell>
                    <TableCell align="right">{entry.predictionsMade}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
