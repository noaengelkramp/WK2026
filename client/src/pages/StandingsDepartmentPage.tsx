import { useState, useEffect } from 'react';
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
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { standingsService } from '../services/standingsService';

interface DepartmentStanding {
  rank: number | null;
  departmentId: string;
  totalPoints: number;
  averagePoints: string;
  participantCount: number;
  department: {
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
  };
}

export default function StandingsDepartmentPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<DepartmentStanding[]>([]);
  const [expandedDepartment, setExpandedDepartment] = useState<string | null>(null);

  // Fetch department standings
  useEffect(() => {
    const fetchDepartmentStandings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await standingsService.getDepartmentStandings();
        setDepartments(response.standings);
      } catch (err: any) {
        console.error('Error fetching department standings:', err);
        setError(err.response?.data?.message || 'Failed to load department standings');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentStandings();
  }, []);

  const handleToggleDepartment = (departmentId: string) => {
    setExpandedDepartment(expandedDepartment === departmentId ? null : departmentId);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        <TrophyIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '2rem' }} />
        Department Standings
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        See which department is leading in the prediction competition! Rankings are based on total points earned by all department members.
      </Typography>

      {/* Info Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            ℹ️ How Department Ranking Works
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>Total Points:</strong> Sum of all points earned by department members
            <br />
            • <strong>Average Points:</strong> Total points divided by number of participants
            <br />
            • <strong>Ranking:</strong> Departments are ranked by total points (not average)
          </Typography>
        </CardContent>
      </Card>

      {/* Department Standings Table */}
      <Card>
        <CardContent>
          {departments.length === 0 ? (
            <Alert severity="info">
              No department standings available yet. Standings will appear once users start making predictions.
            </Alert>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '50px' }}></TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Department</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Total Points</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Average Points</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Participants</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departments.map((dept) => (
                    <>
                      <TableRow
                        key={dept.departmentId}
                        sx={{
                          backgroundColor: 
                            dept.rank === 1 ? '#FFD700' : 
                            dept.rank === 2 ? '#C0C0C0' : 
                            dept.rank === 3 ? '#CD7F32' : 
                            'inherit',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' },
                        }}
                        onClick={() => handleToggleDepartment(dept.departmentId)}
                      >
                        <TableCell>
                          <IconButton size="small">
                            {expandedDepartment === dept.departmentId ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {dept.rank === 1 && '🥇'}
                            {dept.rank === 2 && '🥈'}
                            {dept.rank === 3 && '🥉'}
                            {dept.rank && dept.rank > 3 && `#${dept.rank}`}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {dept.department.logoUrl ? (
                              <Avatar src={dept.department.logoUrl} sx={{ width: 40, height: 40 }} />
                            ) : (
                              <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                                {dept.department.name[0]}
                              </Avatar>
                            )}
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {dept.department.name}
                              </Typography>
                              {dept.department.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {dept.department.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={dept.totalPoints} 
                            color="primary" 
                            sx={{ fontWeight: 'bold', minWidth: 70 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1">
                            {parseFloat(dept.averagePoints).toFixed(1)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={dept.participantCount} 
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                      </TableRow>

                      {/* Expandable row for department details */}
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                          <Collapse in={expandedDepartment === dept.departmentId} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                Department Details
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                • Total members participating: <strong>{dept.participantCount}</strong>
                                <br />
                                • Combined points: <strong>{dept.totalPoints}</strong>
                                <br />
                                • Average per member: <strong>{parseFloat(dept.averagePoints).toFixed(2)}</strong>
                                {dept.rank && (
                                  <>
                                    <br />
                                    • Current position: <strong>#{dept.rank}</strong>
                                  </>
                                )}
                              </Typography>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      {departments.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Competition Statistics
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Departments
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {departments.length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Leading Department
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {departments[0]?.department.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Highest Total Points
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {departments[0]?.totalPoints || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Participants
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {departments.reduce((sum, dept) => sum + dept.participantCount, 0)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
