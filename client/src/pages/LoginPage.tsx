import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFFFFF' }}>
      <Container maxWidth="lg" sx={{ minHeight: '100vh', py: { xs: 4, md: 8 } }}>
        <Grid container spacing={0} sx={{ minHeight: 'calc(100vh - 120px)' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                height: '100%',
                border: '1px solid #E0E0E0',
                borderRight: { md: 'none' },
                borderRadius: { xs: 2, md: '8px 0 0 8px' },
                bgcolor: '#F5F5F5',
                p: { xs: 3, md: 5 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="overline" sx={{ color: '#666666', letterSpacing: '0.18em' }}>
                  KRAMP PREDICTION CHALLENGE
                </Typography>
                <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>
                  World Cup 2026
                </Typography>
                <Typography variant="h5" sx={{ mt: 1, color: '#666666' }}>
                  Compete with colleagues, track standings, and win prizes.
                </Typography>

                <Grid container spacing={2} sx={{ mt: 4 }}>
                  {[
                    { label: '104', value: 'Matches' },
                    { label: '48', value: 'Teams' },
                    { label: '€5K+', value: 'Prizes' },
                  ].map((item) => (
                    <Grid key={item.value} size={{ xs: 4 }}>
                      <Card sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ color: '#9B1915', fontWeight: 700 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666666' }}>
                            {item.value}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Why participate?
                  </Typography>
                  <Grid container spacing={1.5}>
                    {[
                      'Win prizes for top predictions',
                      'Follow matches with your team',
                      'Join the company challenge',
                    ].map((item) => (
                      <Grid key={item} size={12}>
                        <Chip
                          label={item}
                          variant="outlined"
                          sx={{
                            width: '100%',
                            justifyContent: 'flex-start',
                            borderColor: '#E0E0E0',
                            color: '#212121',
                            bgcolor: '#FFFFFF',
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Trusted by teams across Kramp • It&apos;s that easy.
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                height: '100%',
                borderRadius: { xs: 2, md: '0 8px 8px 0' },
                borderLeft: { md: 'none' },
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box
                    component="img"
                    src="/assets/kramp-logo-red.svg"
                    alt="Kramp"
                    sx={{ height: 36, width: 'auto' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    It&apos;s that easy.
                  </Typography>
                </Box>

                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Sign in to your account
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Use your company email to access the prediction challenge.
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loading}
                    sx={{ mt: 3 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Sign In'}
                  </Button>
                </form>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ mt: 2 }}
                >
                  Create account
                </Button>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => alert('Password reset functionality coming soon!')}
                    sx={{ cursor: 'pointer' }}
                  >
                    Forgot password?
                  </Link>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
