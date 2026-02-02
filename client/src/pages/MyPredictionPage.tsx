import { useState, useEffect } from 'react';
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Send as SendIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { dataService } from '../services/dataService';
import { predictionService } from '../services/predictionService';
import type { Match, Team, BonusQuestion } from '../types';

export default function MyPredictionPage() {
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
  // Data states
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [predictions, setPredictions] = useState<Record<string, { home: number; away: number }>>({});
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [bonusAnswers, setBonusAnswers] = useState<Record<string, string>>({});
  const [champion, setChampion] = useState('');
  
  // UI states
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  // Calculate progress
  const totalMatches = 104;
  const predictedMatches = Object.keys(predictions).length;
  const progress = (predictedMatches / totalMatches) * 100;

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [matchesData, teamsData, myPredictions, bonusQuestionsData] = await Promise.all([
          dataService.getMatches(),
          dataService.getTeams(),
          predictionService.getMyPredictions(),
          predictionService.getBonusQuestions(),
        ]);

        setMatches(matchesData);
        setTeams(teamsData);
        setBonusQuestions(bonusQuestionsData);

        // Load existing predictions into state
        const predMap: Record<string, { home: number; away: number }> = {};
        myPredictions.predictions.forEach((pred) => {
          predMap[pred.matchId] = {
            home: pred.predictedHomeScore,
            away: pred.predictedAwayScore,
          };
        });
        setPredictions(predMap);

        // Load existing bonus answers
        const bonusMap: Record<string, string> = {};
        myPredictions.bonusAnswers.forEach((answer: any) => {
          bonusMap[answer.bonusQuestionId] = answer.answer;
        });
        setBonusAnswers(bonusMap);

      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load prediction data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle prediction change
  const handlePredictionChange = (matchId: string, team: 'home' | 'away', value: string) => {
    // Parse the value - handle empty string and zero correctly
    const numValue = value === '' ? undefined : parseInt(value, 10);
    
    // Only update if it's a valid number (including 0) or undefined
    if (numValue !== undefined && (isNaN(numValue) || numValue < 0)) {
      return; // Ignore invalid inputs
    }
    
    setPredictions({
      ...predictions,
      [matchId]: {
        home: team === 'home' ? numValue : (predictions[matchId]?.home ?? undefined),
        away: team === 'away' ? numValue : (predictions[matchId]?.away ?? undefined),
      },
    });
  };

  // Auto-save prediction
  const handleSavePrediction = async (matchId: string) => {
    const prediction = predictions[matchId];
    if (!prediction) return;
    
    // Only save if both scores are filled (not undefined)
    if (prediction.home === undefined || prediction.away === undefined) {
      return; // Don't save incomplete predictions
    }

    try {
      await predictionService.submitPrediction({
        matchId,
        homeScore: prediction.home,
        awayScore: prediction.away,
      });
      
      setSaveMessage('Prediction saved! ✓');
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (err: any) {
      console.error('Error saving prediction:', err);
      setError(err.response?.data?.message || 'Failed to save prediction');
    }
  };

  // Handle bonus answer change
  const handleBonusAnswerChange = (questionId: string, answer: string) => {
    setBonusAnswers({
      ...bonusAnswers,
      [questionId]: answer,
    });
  };

  // Save bonus answer
  const handleSaveBonusAnswer = async (questionId: string) => {
    if (!bonusAnswers[questionId]) return;

    try {
      await predictionService.submitBonusAnswer({
        bonusQuestionId: questionId,
        answer: bonusAnswers[questionId],
      });
      
      setSaveMessage('Bonus answer saved! ✓');
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (err: any) {
      console.error('Error saving bonus answer:', err);
      setError(err.response?.data?.message || 'Failed to save bonus answer');
    }
  };

  // Save all predictions
  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setError(null);

      // Save all predictions (skip incomplete ones with undefined scores)
      const predictionPromises = Object.entries(predictions)
        .filter(([_, scores]) => scores.home !== undefined && scores.away !== undefined)
        .map(([matchId, scores]) =>
          predictionService.submitPrediction({
            matchId,
            homeScore: scores.home!,
            awayScore: scores.away!,
          })
        );

      // Save all bonus answers
      const bonusPromises = Object.entries(bonusAnswers).map(([questionId, answer]) =>
        predictionService.submitBonusAnswer({
          bonusQuestionId: questionId,
          answer,
        })
      );

      await Promise.all([...predictionPromises, ...bonusPromises]);

      setSaveMessage('All predictions saved successfully! ✓');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving all predictions:', err);
      setError(err.response?.data?.message || 'Failed to save all predictions');
    } finally {
      setSaving(false);
    }
  };

  // Submit final predictions
  const handleFinalSubmit = () => {
    setSubmitDialogOpen(true);
  };

  const confirmFinalSubmit = async () => {
    await handleSaveAll();
    setSubmitDialogOpen(false);
    // In a real app, this would lock the predictions
  };

  // Group matches by stage
  const groupMatches = matches.filter(m => m.stage === 'group');
  const knockoutMatches = matches.filter(m => m.stage !== 'group');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && matches.length === 0) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        ⚽ My Predictions
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Predict the scores for all 104 matches and answer bonus questions to earn points!
      </Typography>

      {/* Deadline Warning */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="h6">⏰ Prediction Deadline: June 11, 2026 at 23:00</Typography>
        <Typography variant="body2">Make sure to submit all your predictions before the deadline!</Typography>
      </Alert>

      {/* Save message */}
      {saveMessage && (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckIcon />}>
          {saveMessage}
        </Alert>
      )}

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Progress Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            📊 Completion Progress
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {predictedMatches} / {totalMatches} matches predicted ({progress.toFixed(1)}%)
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 12, borderRadius: 6, mt: 2 }} 
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveAll}
              disabled={saving || predictedMatches === 0}
            >
              {saving ? 'Saving...' : 'Save All Predictions'}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SendIcon />}
              onClick={handleFinalSubmit}
              disabled={saving || predictedMatches === 0}
            >
              Final Submit
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Group Stage Predictions */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            🏟️ Group Stage Predictions ({groupMatches.length} matches)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {groupMatches.map((match) => (
              <Grid size={{ xs: 12, md: 6 }} key={match.id}>
                <Card variant="outlined" sx={{ '&:hover': { boxShadow: 2 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip 
                        label={`Match #${match.matchNumber}`} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label={`Group ${match.groupLetter}`} 
                        size="small" 
                      />
                    </Box>

                    <Grid container spacing={2} alignItems="center">
                      {/* Home Team */}
                      <Grid size={4} sx={{ textAlign: 'center' }}>
                        <Box
                          component="img"
                          src={match.homeTeam.flagUrl}
                          alt={match.homeTeam.name}
                          sx={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 1, mb: 1 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {match.homeTeam.name}
                        </Typography>
                      </Grid>

                      {/* Score inputs */}
                      <Grid size={4} sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                          <TextField
                            type="number"
                            value={predictions[match.id]?.home ?? ''}
                            onChange={(e) => handlePredictionChange(match.id, 'home', e.target.value)}
                            onBlur={() => handleSavePrediction(match.id)}
                            inputProps={{ min: 0, max: 20, style: { textAlign: 'center' } }}
                            sx={{ width: 60 }}
                            size="small"
                          />
                          <Typography variant="h6">-</Typography>
                          <TextField
                            type="number"
                            value={predictions[match.id]?.away ?? ''}
                            onChange={(e) => handlePredictionChange(match.id, 'away', e.target.value)}
                            onBlur={() => handleSavePrediction(match.id)}
                            inputProps={{ min: 0, max: 20, style: { textAlign: 'center' } }}
                            sx={{ width: 60 }}
                            size="small"
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                          {new Date(match.matchDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Grid>

                      {/* Away Team */}
                      <Grid size={4} sx={{ textAlign: 'center' }}>
                        <Box
                          component="img"
                          src={match.awayTeam.flagUrl}
                          alt={match.awayTeam.name}
                          sx={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 1, mb: 1 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {match.awayTeam.name}
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

      {/* Knockout Stage Predictions */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            🏆 Knockout Stage Predictions ({knockoutMatches.length} matches)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info" sx={{ mb: 2 }}>
            Knockout matches will be available once the group stage teams are determined.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            You'll be able to predict these matches once the qualified teams are known after the group stage.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Champion Prediction */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            🥇 Champion Prediction (30 points)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrophyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Who will win the World Cup 2026?
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Champion</InputLabel>
                <Select
                  value={champion}
                  label="Select Champion"
                  onChange={(e) => setChampion(e.target.value)}
                >
                  {teams.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name} {team.flagUrl && `(Group ${team.groupLetter})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                disabled={!champion}
              >
                Save Champion Prediction
              </Button>
            </CardContent>
          </Card>
        </AccordionDetails>
      </Accordion>

      {/* Bonus Questions */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            ❓ Bonus Questions ({bonusQuestions.length} questions)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {bonusQuestions.length === 0 ? (
              <Grid size={12}>
                <Alert severity="info">
                  No bonus questions available yet. Check back soon!
                </Alert>
              </Grid>
            ) : (
              bonusQuestions.map((question) => (
                <Grid size={12} key={question.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {question.questionTextEn}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Worth {question.points} points
                      </Typography>
                      <TextField
                        fullWidth
                        label="Your Answer"
                        value={bonusAnswers[question.id] || ''}
                        onChange={(e) => handleBonusAnswerChange(question.id, e.target.value)}
                        sx={{ mt: 2 }}
                      />
                      <Button
                        variant="outlined"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => handleSaveBonusAnswer(question.id)}
                        disabled={!bonusAnswers[question.id]}
                      >
                        Save Answer
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Submit Confirmation Dialog */}
      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)}>
        <DialogTitle>Confirm Final Submission</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to submit your predictions? You have predicted {predictedMatches} out of {totalMatches} matches.
          </Typography>
          <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
            Note: You can still update your predictions until the deadline (June 11, 2026 23:00).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmFinalSubmit} variant="contained" color="primary">
            Confirm Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
