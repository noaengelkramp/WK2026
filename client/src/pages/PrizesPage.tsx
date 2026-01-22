import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';

export default function PrizesPage() {
  const prizes = [
    {
      place: '1st Place',
      prize: 'Foosball Table',
      emoji: '🥇',
      description: 'Professional-grade foosball table for the ultimate champion',
      color: '#FFD700', // Gold
    },
    {
      place: '2nd Place',
      prize: 'Smart TV (55")',
      emoji: '🥈',
      description: '4K Ultra HD Smart TV to watch future tournaments in style',
      color: '#C0C0C0', // Silver
    },
    {
      place: '3rd Place',
      prize: 'Premium Tablet',
      emoji: '🥉',
      description: 'Latest tablet for entertainment and productivity',
      color: '#CD7F32', // Bronze
    },
    {
      place: 'Department Winner',
      prize: 'Team Dinner Voucher',
      emoji: '🍽️',
      description: '€500 voucher for a celebratory team dinner',
      color: '#9B1915', // Kramp Red
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        🏆 Prizes & Awards
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Compete for amazing prizes in the World Cup 2026 Prediction Game!
      </Typography>

      {/* Overview Alert */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        <strong>Winners will be announced after the tournament ends on July 19, 2026.</strong>
        <br />
        Prizes will be distributed during the company celebration event in late July 2026.
      </Alert>

      {/* Individual Prizes */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrophyIcon color="primary" /> Individual Prizes
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {prizes.slice(0, 3).map((prize, index) => (
          <Grid key={index} size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${prize.color}20 0%, ${prize.color}10 100%)`,
                border: `2px solid ${prize.color}`,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h1" sx={{ fontSize: '4rem', mb: 1 }}>
                    {prize.emoji}
                  </Typography>
                  <Chip
                    label={prize.place}
                    sx={{
                      backgroundColor: prize.color,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      px: 1,
                    }}
                  />
                </Box>

                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {prize.prize}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {prize.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Department Prize */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <GroupsIcon color="primary" /> Department Prize
      </Typography>

      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #9B191520 0%, #9B191510 100%)',
          border: '2px solid #9B1915',
        }}
      >
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h1" sx={{ fontSize: '5rem' }}>
                  {prizes[3].emoji}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 9 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {prizes[3].prize}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {prizes[3].description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Awarded to the department with the highest average points per participant. Every prediction counts
                towards your team's success!
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Eligibility Rules */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckIcon color="primary" /> Eligibility & Rules
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <List>
            <ListItem>
              <ListItemIcon>
                <StarIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="All Employees Eligible"
                secondary="Any company employee who registers and submits predictions before the deadline (June 11, 2026 at 23:00) is eligible to win."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <StarIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Final Standings Determine Winners"
                secondary="Winners are determined by the final standings after all 104 matches are completed on July 19, 2026."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <StarIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Tie-Breaking Rules Apply"
                secondary="In case of a tie, winners will be determined by: 1) Most exact score predictions, 2) Most correct winner predictions, 3) Earlier registration date."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <StarIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Department Minimum Requirement"
                secondary="For the Department Prize, a department must have at least 5 participants to be eligible."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <StarIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Prize Claim Period"
                secondary="Winners must claim their prizes within 30 days of the announcement. Unclaimed prizes will be donated to charity."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <StarIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Non-Transferable"
                secondary="Prizes are non-transferable and must be claimed by the winner personally. No cash alternatives available."
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Winner Announcement */}
      <Card sx={{ background: 'linear-gradient(135deg, #9B1915 0%, #C42420 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
            <CalendarIcon sx={{ color: 'white' }} /> Winner Announcement
          </Typography>

          <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
            Winners will be officially announced during the company celebration event in late July 2026, after all
            final scores are verified and standings are confirmed.
          </Typography>

          <Typography variant="body2" sx={{ color: 'white' }}>
            All participants will receive an email notification when winners are announced. Stay tuned!
          </Typography>
        </CardContent>
      </Card>

      {/* Fun Fact */}
      <Alert severity="success" icon={<TrophyIcon />} sx={{ mt: 3 }}>
        <strong>Fun Fact:</strong> The maximum possible score in this game is approximately 1,200 points! Do you have
        what it takes to be the prediction champion? 🏆
      </Alert>
    </Box>
  );
}
