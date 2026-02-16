import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Science as ScienceIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import api from '../../services/api';

const PRESETS = [
  { 
    label: 'Tournament Start', 
    date: '2022-11-20', 
    description: 'All matches scheduled, no results',
    color: 'default' as const,
  },
  { 
    label: 'After Group Stages', 
    date: '2022-12-02', 
    description: 'Groups complete, knockouts TBD',
    color: 'primary' as const,
  },
  { 
    label: 'Before Quarter-Finals', 
    date: '2022-12-08', 
    description: 'Round of 16 complete',
    color: 'primary' as const,
  },
  { 
    label: 'Week Before Final', 
    date: '2022-12-11', 
    description: 'Quarter-finals complete, semis TBD',
    color: 'secondary' as const,
  },
  { 
    label: 'Tournament Complete', 
    date: '2022-12-18', 
    description: 'All matches finished',
    color: 'success' as const,
  },
];

interface PopulateResult {
  totalMatches: number;
  finished: number;
  scheduled: number;
  tbdTeams: number;
}

export default function TestingPanel() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PopulateResult | null>(null);
  const [error, setError] = useState<string>('');
  
  const handlePopulate = async (date: string) => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      // Use extended timeout for this operation (60 seconds) as it fetches data from external API
      const response = await api.post('/admin/populate-historic', { date }, { timeout: 60000 });
      
      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError(response.data.message || 'Failed to populate matches');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = async () => {
    // Reset to full tournament data (Dec 18, 2022 = all complete)
    await handlePopulate('2022-12-18');
  };
  
  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ScienceIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Testing & Historic Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Populate database with match data from specific tournament dates
              </Typography>
            </Box>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>How it works:</strong> Select a date during the 2022 World Cup to simulate the tournament
            at that point in time. Matches before the date will show results, matches after will be "scheduled"
            with potentially TBD teams for knockout stages.
          </Alert>
          
          {/* Preset Buttons */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Quick Presets
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {PRESETS.map((preset) => (
              <Grid item xs={12} md={6} lg={4} key={preset.date}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => !loading && handlePopulate(preset.date)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary">
                        {preset.label}
                      </Typography>
                      <Chip 
                        label={preset.date} 
                        size="small" 
                        color={preset.color}
                        icon={<CalendarIcon />}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {preset.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Custom Date Picker */}
          <Typography variant="h6" gutterBottom>
            Custom Date
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              inputProps={{
                min: '2022-11-20',
                max: '2022-12-18',
              }}
              label="Select Date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ maxWidth: 300 }}
            />
            <Button
              onClick={() => handlePopulate(selectedDate)}
              disabled={!selectedDate || loading}
              variant="contained"
              startIcon={<CheckIcon />}
              size="large"
            >
              Proceed
            </Button>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Reset Button */}
          <Typography variant="h6" gutterBottom>
            Reset to Full Data
          </Typography>
          <Button
            onClick={handleReset}
            disabled={loading}
            variant="outlined"
            startIcon={<RefreshIcon />}
            color="secondary"
          >
            Reset to Full Tournament Data
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Restores all 64 matches with complete results from the 2022 World Cup
          </Typography>
        </CardContent>
      </Card>
      
      {/* Loading State */}
      {loading && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ mr: 2 }} />
              <Typography variant="h6">Populating matches...</Typography>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Results Display */}
      {result && !loading && (
        <Card sx={{ mb: 3, bgcolor: 'success.50', borderColor: 'success.main', borderWidth: 2 }}>
          <CardContent>
            <Typography variant="h6" color="success.main" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckIcon sx={{ mr: 1 }} />
              Successfully Updated
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="primary.main">
                    {result.totalMatches}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Matches
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="success.main">
                    {result.finished}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Finished
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="info.main">
                    {result.scheduled}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Scheduled
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="warning.main">
                    {result.tbdTeams}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    TBD Teams
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Error Display */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Error:</strong> {error}
        </Alert>
      )}
    </Box>
  );
}
