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
      prize: 'High-End Smart TV (65")',
      description: 'The ultimate home cinema experience. 4K OLED display with the latest smart features.',
      color: '#9B1915',
    },
    {
      place: '2nd Place',
      prize: 'Latest Generation Tablet',
      description: 'High-performance tablet with a stunning display, perfect for both productivity and gaming.',
      color: '#212121',
    },
    {
      place: '3rd Place',
      prize: 'Professional Football Kit',
      description: 'Official tournament gear including ball, jersey of your choice, and professional bag.',
      color: '#666666',
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
        Competition Rewards
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {prizes.map((prize, index) => (
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
        Eligibility & Guidelines
      </Typography>

      <Card variant="outlined" sx={{ borderRadius: 0 }}>
        <CardContent sx={{ p: 0 }}>
          <List sx={{ p: 0 }}>
            {[
              {
                title: 'Participant Eligibility',
                desc: 'Open to all registered Kramp customers who create an account before the June 11 deadline.'
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
                desc: 'Winners will be contacted directly via email to arrange shipping or local pickup.'
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
            Official winners will be published on our platform and via email on July 20, 2026. Standings on this platform are updated in real-time but remain unofficial until final verification.
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#9B1915' }}>
            It&apos;s that easy.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
