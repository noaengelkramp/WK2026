import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  EmojiEventsOutlined as TrophyIcon,
  CheckCircleOutlined as CheckIcon,
  InfoOutlined as InfoIcon,
  CalendarTodayOutlined as CalendarIcon,
  GroupsOutlined as GroupsIcon,
} from '@mui/icons-material';

export default function PrizesPage() {
  const prizes = [
    {
      place: '1st Place',
      prize: 'Professional Foosball Table',
      description: 'The ultimate office companion. High-quality build with professional handles and players.',
      color: '#9B1915',
    },
    {
      place: '2nd Place',
      prize: 'Smart TV (55")',
      description: '4K Ultra HD Smart TV featuring the latest streaming apps and HDR technology.',
      color: '#212121',
    },
    {
      place: '3rd Place',
      prize: 'Premium Tablet',
      description: 'High-performance tablet with a stunning display, perfect for work and entertainment.',
      color: '#666666',
    },
    {
      place: 'Team Award',
      prize: 'Department Dinner Voucher',
      description: 'A celebratory dinner for your entire department (up to €500 value).',
      color: '#9B1915',
    },
  ];

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#212121' }}>
          Prize Catalog
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Exclusive rewards for the top-performing predictors in the Kramp 2026 Challenge.
        </Typography>
      </Box>

      <Alert severity="info" icon={<InfoIcon />} variant="outlined" sx={{ mb: 4, borderRadius: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Winners will be announced after the tournament final on July 19, 2026.
        </Typography>
      </Alert>

      <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666' }}>
        Individual Performance Rewards
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {prizes.slice(0, 3).map((prize, index) => (
          <Grid key={index} size={{ xs: 12, md: 4 }}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 0 }}>
              <Box sx={{ height: 160, backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrophyIcon sx={{ fontSize: 60, color: prize.color }} />
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" sx={{ fontWeight: 700, color: '#9B1915' }}>
                  {prize.place}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, mt: 0.5 }}>
                  {prize.prize}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {prize.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666' }}>
        Department Excellence
      </Typography>

      <Card variant="outlined" sx={{ mb: 6, borderRadius: 0 }}>
        <Grid container spacing={0}>
          <Grid size={{ xs: 12, md: 4 }} sx={{ backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
            <GroupsIcon sx={{ fontSize: 80, color: '#9B1915' }} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="overline" sx={{ fontWeight: 700, color: '#9B1915' }}>
                Team Category
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, mt: 0.5 }}>
                {prizes[3].prize}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {prizes[3].description}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="body2" color="text.secondary">
                This award recognizes the department with the highest average points per participant. At least 5 participants from a department must be registered to qualify.
              </Typography>
            </CardContent>
          </Grid>
        </Grid>
      </Card>

      <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666' }}>
        Eligibility & Guidelines
      </Typography>

      <Card variant="outlined" sx={{ borderRadius: 0 }}>
        <CardContent sx={{ p: 0 }}>
          <List sx={{ p: 0 }}>
            {[
              {
                title: 'Participant Eligibility',
                desc: 'Open to all Kramp Group employees who register before the June 11 deadline.'
              },
              {
                title: 'Winner Determination',
                desc: 'Rankings are finalized after the completion of all 104 tournament matches.'
              },
              {
                title: 'Tie-Breaking Protocol',
                desc: 'Ties are resolved by: 1) Correct scores, 2) Correct winners, 3) Registration date.'
              },
              {
                title: 'Prize Collection',
                desc: 'Prizes will be presented during local office events in late July 2026.'
              }
            ].map((rule, idx) => (
              <Box key={idx}>
                <ListItem sx={{ py: 2.5, px: 4 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <CheckIcon sx={{ color: '#9B1915' }} fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>{rule.title}</Typography>}
                    secondary={<Typography variant="body2" color="text.secondary">{rule.desc}</Typography>}
                  />
                </ListItem>
                {idx < 3 && <Divider />}
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mt: 4, borderRadius: 0, backgroundColor: '#212121', color: '#FFFFFF' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CalendarIcon sx={{ color: '#9B1915' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Announcement Schedule</Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
            Official winners will be published on the internal portal and via email on July 20, 2026. Standings on this platform are updated in real-time but remain unofficial until final verification.
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#9B1915' }}>
            It&apos;s that easy.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
