import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  EmojiEvents as TrophyIcon,
  SportsSoccer as SoccerIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { dataService } from '../services/dataService';
import type { ScoringRule, BonusQuestion } from '../types';

export default function RulesPage() {
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rules, questions] = await Promise.all([
          dataService.getScoringRules(),
          dataService.getBonusQuestions(),
        ]);
        setScoringRules(rules);
        setBonusQuestions(questions);
      } catch (error) {
        console.error('Error fetching rules data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to get stage display name
  const getStageDisplayName = (stage: string): string => {
    const names: Record<string, string> = {
      group: 'Group Stage',
      round32: 'Round of 32',
      round16: 'Round of 16',
      quarter: 'Quarter-finals',
      semi: 'Semi-finals',
      third_place: 'Third-Place Match',
      final: 'Final',
    };
    return names[stage] || stage;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        📋 Game Rules & Scoring
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Learn how to play the World Cup 2026 Prediction Game and maximize your points!
      </Typography>

      {/* Overview Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #9B1915 0%, #C42420 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
            <SoccerIcon sx={{ color: 'white' }} /> How to Play
          </Typography>
          <Typography variant="body1" sx={{ color: 'white' }}>
            1. <strong>Make your predictions</strong> for all 104 World Cup matches before the deadline
            <br />
            2. <strong>Answer bonus questions</strong> about the tournament (top scorer, champion, etc.)
            <br />
            3. <strong>Submit before June 11, 2026 at 23:00</strong> - no changes allowed after!
            <br />
            4. <strong>Earn points</strong> as matches are played and results are known
            <br />
            5. <strong>Climb the leaderboard</strong> and compete against colleagues and departments
            <br />
            6. <strong>Win prizes!</strong> Top individual players and departments receive awards
          </Typography>
        </CardContent>
      </Card>

      {/* Deadline Card */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="h6">⏰ Important Deadline</Typography>
        <Typography variant="body2">
          All predictions must be submitted by <strong>June 11, 2026 at 23:00</strong>. 
          After this time, predictions are locked and cannot be changed. The tournament starts on June 11, 2026.
        </Typography>
      </Alert>

      {/* Scoring System */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            🎯 Scoring System
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" gutterBottom>
            Points are awarded based on the accuracy of your predictions. The scoring system is progressive -
            you earn more points for predictions in later rounds!
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* All Stages Scoring */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Match Prediction Scoring
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            Points are progressive - you earn more in later rounds! The scoring system rewards accuracy with higher stakes.
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Round</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Exact Score</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Correct Winner/Draw</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scoringRules
                  .sort((a, b) => {
                    const order = ['group', 'round32', 'round16', 'quarter', 'semi', 'third_place', 'final'];
                    return order.indexOf(a.stage) - order.indexOf(b.stage);
                  })
                  .map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell><strong>{getStageDisplayName(rule.stage)}</strong></TableCell>
                      <TableCell align="right">
                        <Chip label={`${rule.exactScorePoints} pts`} color="primary" size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={`${rule.correctWinnerPoints} pts`} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>How it works:</strong> If you predict the exact score, you get full points. 
              If you predict the correct winner (or draw), you get partial points. Wrong predictions earn 0 points.
            </Typography>
          </Alert>

          {/* Bonus Points */}
          <Typography variant="h6" gutterBottom>
            Bonus Questions
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Question</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bonusQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell><strong>{question.questionTextEn}</strong></TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={`${question.points} pts`} 
                        color={question.points >= 20 ? "primary" : "default"} 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Tie-Breaking Rules */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            🏅 Tie-Breaking Rules
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" gutterBottom>
            If two or more players have the same total points, the ranking is determined by:
          </Typography>
          <Box component="ol" sx={{ pl: 2 }}>
            <Typography component="li" variant="body1">
              <strong>1. Total Points</strong> - Primary ranking metric
            </Typography>
            <Typography component="li" variant="body1">
              <strong>2. Number of Exact Scores</strong> - More exact predictions rank higher
            </Typography>
            <Typography component="li" variant="body1">
              <strong>3. Number of Correct Winners</strong> - More correct outcomes rank higher
            </Typography>
            <Typography component="li" variant="body1">
              <strong>4. Champion Prediction Correct</strong> - Correctly predicting the champion breaks ties
            </Typography>
            <Typography component="li" variant="body1">
              <strong>5. Earlier Registration Date</strong> - First to register wins
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* How to Update Predictions */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            ✏️ Updating Your Predictions
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" gutterBottom>
            <strong>Before the deadline (June 11, 2026 23:00):</strong>
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body1">
              You can change your predictions as many times as you want
            </Typography>
            <Typography component="li" variant="body1">
              Changes are saved automatically when you update a score
            </Typography>
            <Typography component="li" variant="body1">
              Use the "Save All" button to save all changes at once
            </Typography>
            <Typography component="li" variant="body1">
              Your completion progress is tracked at the top of the page
            </Typography>
          </Box>
          <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
            <strong>After the deadline:</strong>
          </Typography>
          <Typography variant="body1">
            All predictions are locked. No changes can be made after June 11, 2026 at 23:00.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Prizes */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            <TrophyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Prizes & Winners
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" gutterBottom>
            Winners will be announced after the World Cup Final on July 19, 2026.
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Individual Prizes:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body1">
              🥇 <strong>1st Place:</strong> Professional Foosball Table
            </Typography>
            <Typography component="li" variant="body1">
              🥈 <strong>2nd Place:</strong> 55" Smart TV
            </Typography>
            <Typography component="li" variant="body1">
              🥉 <strong>3rd Place:</strong> iPad Pro
            </Typography>
          </Box>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Department Prize:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body1">
              🏆 <strong>Winning Department:</strong> Team Dinner Voucher (€500)
            </Typography>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            Visit the <strong>Prizes</strong> page to see all prizes and eligibility rules!
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* FAQ */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            <HelpIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Frequently Asked Questions
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="h6" gutterBottom>
              Q: What happens if I don't predict all 104 matches?
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              A: You can still participate! You'll earn points for the matches you did predict. However, predicting 
              all matches gives you the best chance to win.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Q: Do I score points for matches that happen after extra time or penalties?
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              A: No. For knockout matches, we score based on the result after 90 minutes of regular play.
              However, you do predict which team advances (even if it's via penalties).
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Q: When are points calculated?
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              A: Points are calculated automatically within minutes after each match finishes. The leaderboard 
              updates in real-time.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Q: Can I see other people's predictions?
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              A: No. All predictions are private until after the tournament deadline.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Q: What if there's a technical issue?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              A: Contact the game administrator immediately. We'll review and resolve any technical issues fairly.
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Maximum Points */}
      <Card sx={{ mt: 3, background: 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            💯 Maximum Possible Points
          </Typography>
          <Typography variant="body1">
            If you predict everything perfectly (which is nearly impossible!), you could earn approximately 
            <strong> ~1,200 points</strong> throughout the entire tournament.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
