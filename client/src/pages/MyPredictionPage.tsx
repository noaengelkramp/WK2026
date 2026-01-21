import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Chip,
  Alert,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  Save as SaveIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { mockMatches, mockTeams } from '../data/mockData';

export default function MyPredictionPage() {
  const [saved, setSaved] = useState(false);
  const [predictions, setPredictions] = useState<{ [key: string]: { home: number; away: number } }>({});
  const [champion, setChampion] = useState('');

  const totalMatches = 104;
  const predictedMatches = Object.keys(predictions).length;
  const progress = (predictedMatches / totalMatches) * 100;

  const handlePredictionChange = (matchId: string, team: 'home' | 'away', value: number) => {
    setPredictions({
      ...predictions,
      [matchId]: {
        ...predictions[matchId],
        home: team === 'home' ? value : predictions[matchId]?.home || 0,
        away: team === 'away' ? value : predictions[matchId]?.away || 0,
      },
    });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        ⚽ My Predictions
      </Typography>

      {/* Deadline Warning */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="h6">Prediction Deadline: June 11, 2026 at 23:00</Typography>
        <Typography variant="body2">You have 15 days and 4 hours remaining</Typography>
      </Alert>

      {/* Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Completion Progress
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {predictedMatches} / {totalMatches} matches predicted ({progress.toFixed(0)}%)
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
        </CardContent>
      </Card>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckIcon />}>
          Your predictions have been saved successfully!
        </Alert>
      )}

      {/* Group Stage Predictions */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Group Stage Predictions (48 matches)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {mockMatches
              .filter((match) => match.stage === 'group')
              .map((match) => (
                <Grid item xs={12} key={match.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={1}>
                          <Chip
                            label={`#${match.matchNumber}`}
                            size="small"
                            color={match.status === 'finished' ? 'success' : 'default'}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h4">{match.homeTeam.flagUrl}</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {match.homeTeam.name}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={3} sx={{ textAlign: 'center' }}>
                          {match.status === 'finished' ? (
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                              {match.homeScore} - {match.awayScore}
                            </Typography>
                          ) : (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                              <TextField
                                type="number"
                                size="small"
                                sx={{ width: 60 }}
                                inputProps={{ min: 0, max: 10, style: { textAlign: 'center' } }}
                                value={predictions[match.id]?.home || ''}
                                onChange={(e) => handlePredictionChange(match.id, 'home', parseInt(e.target.value) || 0)}
                                disabled={match.status === 'finished'}
                              />
                              <Typography variant="h6">-</Typography>
                              <TextField
                                type="number"
                                size="small"
                                sx={{ width: 60 }}
                                inputProps={{ min: 0, max: 10, style: { textAlign: 'center' } }}
                                value={predictions[match.id]?.away || ''}
                                onChange={(e) => handlePredictionChange(match.id, 'away', parseInt(e.target.value) || 0)}
                                disabled={match.status === 'finished'}
                              />
                            </Box>
                          )}
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h4">{match.awayTeam.flagUrl}</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {match.awayTeam.name}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(match.matchDate).toLocaleDateString()}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {match.venue}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Knockout Stage Info */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Knockout Stage Predictions (Coming Soon)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info">
            Knockout bracket will be available once group stage predictions are complete. The bracket will automatically populate based on your predicted group standings.
          </Alert>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 3 }} />

      {/* Champion Prediction */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            🏆 Who Will Win the World Cup 2026?
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Champion</InputLabel>
            <Select
              value={champion}
              label="Select Champion"
              onChange={(e) => setChampion(e.target.value)}
            >
              {mockTeams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{team.flagUrl}</Typography>
                    <Typography>{team.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Bonus Questions */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Bonus Questions
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Top Scorer</InputLabel>
                <Select label="Top Scorer">
                  <MenuItem value="mbappe">Kylian Mbappé</MenuItem>
                  <MenuItem value="haaland">Erling Haaland</MenuItem>
                  <MenuItem value="messi">Lionel Messi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Highest Scoring Team</InputLabel>
                <Select label="Highest Scoring Team">
                  {mockTeams.slice(0, 5).map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.flagUrl} {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Goals in Tournament"
                type="number"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Most Yellow Cards Team</InputLabel>
                <Select label="Most Yellow Cards Team">
                  {mockTeams.slice(0, 5).map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.flagUrl} {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Action Buttons */}
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save Draft
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<CheckIcon />}
                disabled={progress < 100}
              >
                Submit Final Predictions
              </Button>
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
            You can edit your predictions anytime before the deadline. Final submission locks all predictions.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
