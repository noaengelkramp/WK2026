import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Autocomplete,
  Button,
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
  ExpandMoreOutlined as ExpandIcon,
  SaveOutlined as SaveIcon,
  CheckCircleOutlined as CheckIcon,
  SendOutlined as SendIcon,
  EmojiEventsOutlined as TrophyIcon,
  InfoOutlined as InfoIcon,
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
  const [predictions, setPredictions] = useState<Record<string, { home: number | undefined; away: number | undefined }>>({});
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [bonusAnswers, setBonusAnswers] = useState<Record<string, string>>({});
  const [bonusInputValues, setBonusInputValues] = useState<Record<string, string>>({});
  const [champion, setChampion] = useState('');
  const [topScorerOptions, setTopScorerOptions] = useState<Array<{ label: string; value: string }>>([]);
  
  // UI states
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [expandedStage, setExpandedStage] = useState<string | false>(false);

  const stageOrder: Match['stage'][] = ['group', 'round32', 'round16', 'quarter', 'semi', 'third_place', 'final'];
  const stageLabels: Record<Match['stage'], string> = {
    group: 'Group Stage',
    round32: 'Round of 32',
    round16: 'Round of 16',
    quarter: 'Quarter-finals',
    semi: 'Semi-finals',
    third_place: 'Third-place Match',
    final: 'Final',
  };

  const isCompletePrediction = (prediction?: { home: number | undefined; away: number | undefined }) =>
    !!prediction && prediction.home !== undefined && prediction.away !== undefined;

  const matchIdSet = new Set(matches.map((m) => m.id));
  const predictedMatches = Object.entries(predictions).filter(
    ([matchId, prediction]) => matchIdSet.has(matchId) && isCompletePrediction(prediction)
  ).length;
  const totalMatches = matches.length;
  const progress = totalMatches > 0 ? (predictedMatches / totalMatches) * 100 : 0;

  const stageProgress = stageOrder
    .map((stage) => {
      const stageMatches = matches.filter((m) => m.stage === stage);
      const total = stageMatches.length;
      const predicted = stageMatches.filter((m) => isCompletePrediction(predictions[m.id])).length;
      const stageProgressValue = total > 0 ? (predicted / total) * 100 : 0;

      let status: 'live' | 'upcoming' | 'completed' | 'open' = 'open';
      if (stageMatches.some((m) => m.status === 'live')) status = 'live';
      else if (stageMatches.length > 0 && stageMatches.every((m) => m.status === 'finished')) status = 'completed';
      else if (stageMatches.some((m) => m.status === 'scheduled')) status = 'upcoming';

      return { stage, label: stageLabels[stage], total, predicted, progress: stageProgressValue, status, matches: stageMatches };
    })
    .filter((entry) => entry.total > 0);

  const getCurrentStage = (): Match['stage'] => {
    const liveStage = stageProgress.find((s) => s.status === 'live');
    if (liveStage) return liveStage.stage;

    const upcomingStage = stageProgress.find((s) => s.status === 'upcoming');
    if (upcomingStage) return upcomingStage.stage;

    const completedStages = stageProgress.filter((s) => s.status === 'completed');
    if (completedStages.length > 0) {
      return completedStages[completedStages.length - 1].stage;
    }

    return 'group';
  };

  useEffect(() => {
    if (matches.length > 0) {
      setExpandedStage(getCurrentStage());
    }
  }, [matches.length]);

  const handleStageAccordionChange = (stage: Match['stage']) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedStage(isExpanded ? stage : false);
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [matchesData, teamsData, myPredictions, bonusQuestionsData, statsData] = await Promise.all([
          dataService.getMatches(),
          dataService.getTeams(),
          predictionService.getMyPredictions(),
          predictionService.getBonusQuestions(),
          dataService.getTournamentStatistics('2022'),
        ]);

        setMatches(matchesData);
        setTeams(teamsData);
        setBonusQuestions(bonusQuestionsData);

        const scorerOptions = (statsData?.topScorers || [])
          .map((entry: any) => {
            const playerName = entry?.player?.name || entry?.name || entry?.playerName;
            if (!playerName) return null;
            const teamName = entry?.statistics?.[0]?.team?.name || entry?.team?.name;
            const label = teamName ? `${playerName} (${teamName})` : playerName;
            return { label, value: playerName };
          })
          .filter(Boolean) as Array<{ label: string; value: string }>;
        setTopScorerOptions(scorerOptions);

        // Load existing predictions into state
        const predMap: Record<string, { home: number; away: number }> = {};
        myPredictions.predictions.forEach((pred) => {
          predMap[pred.matchId] = {
            home: pred.homeScore,
            away: pred.awayScore,
          };
        });
        setPredictions(predMap);

        // Load existing bonus answers
        const bonusMap: Record<string, string> = {};
        const bonusInputMap: Record<string, string> = {};
        myPredictions.bonusAnswers.forEach((answer: any) => {
          const value = answer.answer;
          bonusMap[answer.bonusQuestionId] = value;
          bonusInputMap[answer.bonusQuestionId] = value;
        });
        setBonusAnswers(bonusMap);
        setBonusInputValues(bonusInputMap);

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

  const countryQuestionTypes: BonusQuestion['questionType'][] = [
    'champion',
    'most_yellow_cards',
    'highest_scoring_team',
  ];

  const teamOptions = teams.map((team) => ({ label: team.name, value: team.name }));

  const isValidBonusAnswer = (question: BonusQuestion) => {
    const answer = bonusAnswers[question.id];
    if (!answer) return false;

    if (countryQuestionTypes.includes(question.questionType)) {
      return teamOptions.some((option) => option.value === answer);
    }

    if (question.questionType === 'top_scorer') {
      return topScorerOptions.some((option) => option.value === answer);
    }

    return true;
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
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#212121' }}>
          My Predictions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Predict match scores and answer bonus questions to earn points and climb the leaderboard.
        </Typography>
      </Box>

      {/* Deadline Warning */}
      <Alert 
        severity="warning" 
        variant="outlined" 
        icon={<InfoIcon />}
        sx={{ mb: 4, borderRadius: 0, backgroundColor: '#FFF9C4', borderColor: '#FBC02D' }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Prediction Deadline: June 11, 2026 at 23:00
        </Typography>
        <Typography variant="caption">
          Predictions will be locked after the deadline. You can update your entries until then.
        </Typography>
      </Alert>

      {/* Save message */}
      {saveMessage && (
        <Alert severity="success" variant="outlined" sx={{ mb: 3, borderRadius: 0 }} icon={<CheckIcon />}>
          {saveMessage}
        </Alert>
      )}

      {/* Error message */}
      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 3, borderRadius: 0 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Progress Card */}
      <Card variant="outlined" sx={{ mb: 4, borderRadius: 0 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', color: '#666' }}>
              Completion Progress
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {predictedMatches} / {totalMatches} Matches Predicted
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ mb: 3 }}
          />

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {stageProgress.map((stage) => (
              <Grid key={stage.stage} size={{ xs: 12, md: 6 }}>
                <Box sx={{ border: '1px solid #E0E0E0', p: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{stage.label}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{stage.predicted}/{stage.total}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={stage.progress} />
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSaveAll}
              disabled={saving || predictedMatches === 0}
            >
              {saving ? 'Saving...' : 'Save All'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SendIcon />}
              onClick={handleFinalSubmit}
              disabled={saving || predictedMatches === 0}
            >
              Final Submit
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Stage-based Predictions */}
      {stageProgress.map((stage) => (
        <Accordion
          key={stage.stage}
          variant="outlined"
          sx={{ borderRadius: 0, mb: 2 }}
          expanded={expandedStage === stage.stage}
          onChange={handleStageAccordionChange(stage.stage)}
        >
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {stage.label} ({stage.predicted}/{stage.total})
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3, backgroundColor: '#F9F9F9' }}>
            <Grid container spacing={2}>
              {stage.matches.map((match) => (
                <Grid size={{ xs: 12, lg: 6 }} key={match.id}>
                  <Card variant="outlined" sx={{ borderRadius: 0, '&:hover': { borderColor: '#9B1915' } }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#999' }}>
                          MATCH #{match.matchNumber}{match.groupLetter ? ` • GROUP ${match.groupLetter}` : ''}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#666' }}>
                          {new Date(match.matchDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>

                      <Grid container spacing={1} alignItems="center">
                        <Grid size={4}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box
                              component="img"
                              src={match.homeTeam.flagUrl}
                              alt={match.homeTeam.name}
                              sx={{ width: 40, height: 30, objectFit: 'cover', border: '1px solid #EEE', mb: 1 }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'center' }}>
                              {match.homeTeam.name}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid size={4}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <TextField
                              type="number"
                              value={predictions[match.id]?.home ?? ''}
                              onChange={(e) => handlePredictionChange(match.id, 'home', e.target.value)}
                              onBlur={() => handleSavePrediction(match.id)}
                              inputProps={{
                                min: 0,
                                max: 20,
                                style: {
                                  textAlign: 'center',
                                  fontWeight: 700,
                                  padding: '8px 4px'
                                }
                              }}
                              sx={{
                                width: { xs: 45, sm: 50 },
                                '& .MuiOutlinedInput-root': { borderRadius: 0 },
                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                  '-webkit-appearance': 'none',
                                  margin: 0,
                                },
                                '& input[type=number]': {
                                  '-moz-appearance': 'textfield',
                                },
                              }}
                              size="small"
                            />
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>:</Typography>
                            <TextField
                              type="number"
                              value={predictions[match.id]?.away ?? ''}
                              onChange={(e) => handlePredictionChange(match.id, 'away', e.target.value)}
                              onBlur={() => handleSavePrediction(match.id)}
                              inputProps={{
                                min: 0,
                                max: 20,
                                style: {
                                  textAlign: 'center',
                                  fontWeight: 700,
                                  padding: '8px 4px'
                                }
                              }}
                              sx={{
                                width: { xs: 45, sm: 50 },
                                '& .MuiOutlinedInput-root': { borderRadius: 0 },
                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                  '-webkit-appearance': 'none',
                                  margin: 0,
                                },
                                '& input[type=number]': {
                                  '-moz-appearance': 'textfield',
                                },
                              }}
                              size="small"
                            />
                          </Box>
                        </Grid>

                        <Grid size={4}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box
                              component="img"
                              src={match.awayTeam.flagUrl}
                              alt={match.awayTeam.name}
                              sx={{ width: 40, height: 30, objectFit: 'cover', border: '1px solid #EEE', mb: 1 }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'center' }}>
                              {match.awayTeam.name}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Champion Prediction */}
      <Accordion variant="outlined" sx={{ borderRadius: 0, mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Tournament Champion
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 0, maxWidth: 500 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrophyIcon fontSize="small" sx={{ color: '#9B1915' }} />
                Who will win the World Cup 2026?
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Select Champion</InputLabel>
                <Select
                  value={champion}
                  label="Select Champion"
                  onChange={(e) => setChampion(e.target.value)}
                  sx={{ borderRadius: 0 }}
                >
                  {teams.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ mt: 2 }}
                disabled={!champion}
              >
                Save Choice
              </Button>
            </CardContent>
          </Card>
        </AccordionDetails>
      </Accordion>

      {/* Bonus Questions */}
      <Accordion defaultExpanded variant="outlined" sx={{ borderRadius: 0 }}>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Bonus Questions
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {bonusQuestions.length === 0 ? (
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  No bonus questions are currently available.
                </Typography>
              </Grid>
            ) : (
              bonusQuestions.map((question) => (
                <Grid size={{ xs: 12, md: 6 }} key={question.id}>
                  <Card variant="outlined" sx={{ borderRadius: 0, height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {question.questionTextEn}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9B1915', fontWeight: 700, mb: 2, display: 'block' }}>
                        WORTH {question.points} POINTS
                      </Typography>
                      {countryQuestionTypes.includes(question.questionType) ? (
                        <Autocomplete
                          fullWidth
                          size="small"
                          options={teamOptions}
                          value={
                            teamOptions.find((option) => option.value === bonusAnswers[question.id]) || null
                          }
                          onChange={(_, newValue) =>
                            handleBonusAnswerChange(question.id, newValue?.value || '')
                          }
                          inputValue={bonusInputValues[question.id] || ''}
                          onInputChange={(_, newInputValue) =>
                            setBonusInputValues({
                              ...bonusInputValues,
                              [question.id]: newInputValue,
                            })
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select team"
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                            />
                          )}
                        />
                      ) : question.questionType === 'top_scorer' ? (
                        <Autocomplete
                          fullWidth
                          size="small"
                          options={topScorerOptions}
                          value={
                            topScorerOptions.find((option) => option.value === bonusAnswers[question.id]) || null
                          }
                          onChange={(_, newValue) =>
                            handleBonusAnswerChange(question.id, newValue?.value || '')
                          }
                          inputValue={bonusInputValues[question.id] || ''}
                          onInputChange={(_, newInputValue) =>
                            setBonusInputValues({
                              ...bonusInputValues,
                              [question.id]: newInputValue,
                            })
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select player"
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                            />
                          )}
                        />
                      ) : (
                        <TextField
                          fullWidth
                          size="small"
                          label="Your Answer"
                          variant="outlined"
                          value={bonusAnswers[question.id] || ''}
                          onChange={(e) => handleBonusAnswerChange(question.id, e.target.value)}
                          sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                        />
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 2 }}
                        onClick={() => handleSaveBonusAnswer(question.id)}
                        disabled={!isValidBonusAnswer(question)}
                      >
                        Save
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
      <Dialog 
        open={submitDialogOpen} 
        onClose={() => setSubmitDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 0 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Final Submission</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            You have predicted <strong>{predictedMatches}</strong> out of <strong>{totalMatches}</strong> matches.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            You can still update your predictions until the deadline on June 11, 2026.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSubmitDialogOpen(false)} size="small">Cancel</Button>
          <Button onClick={confirmFinalSubmit} variant="contained" color="primary" size="small">
            Confirm Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
