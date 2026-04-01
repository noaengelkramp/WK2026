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
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../services/api';
import { withEventPrefix, getEventCodeFromPath } from '../utils/eventRouting';
import { eventService } from '../services/eventService';
import i18n, { normalizeLocaleToLanguage } from '../i18n';
import { useEffect } from 'react';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const eventCode = getEventCodeFromPath();

  useEffect(() => {
    eventService.getCurrent()
      .then((response) => {
        if (response.mode === 'event' && response.event) {
          i18n.changeLanguage(normalizeLocaleToLanguage(response.event.defaultLocale));
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login({ identifier, password });
      navigate(withEventPrefix(eventCode, '/'));
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFFFFF', textAlign: 'center' }}>
      <Container maxWidth="lg" sx={{ minHeight: '100vh', py: { xs: 4, md: 8 } }}>
        <Grid container spacing={0} sx={{ minHeight: 'calc(100vh - 120px)' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                height: '100%',
                border: '1px solid #E0E0E0',
                borderRight: { md: 'none' },
                borderRadius: 0,
                bgcolor: '#F5F5F5',
                p: { xs: 3, md: 5 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="overline" sx={{ color: '#9B1915', fontWeight: 700, letterSpacing: '0.1em' }}>
                  {t('login.heroTag')}
                </Typography>
                <Typography variant="h3" sx={{ mt: 1, fontWeight: 700, color: '#212121' }}>
                  {t('login.heroTitle')}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, color: '#666666', fontSize: '1.1rem' }}>
                  {t('login.heroDescription')}
                </Typography>

                <Grid container spacing={2} sx={{ mt: 4 }}>
                  {[
                    { label: '104', value: 'Matches' },
                    { label: '48', value: 'Teams' },
                    { label: '€10K+', value: 'Prize Pool' },
                  ].map((item) => (
                    <Grid key={item.value} size={{ xs: 4 }}>
                      <Card variant="outlined" sx={{ borderRadius: 0, backgroundColor: '#FFFFFF' }}>
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h5" sx={{ color: '#9B1915', fontWeight: 700 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666666', fontWeight: 700, textTransform: 'uppercase' }}>
                            {item.value}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ mt: 6 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase', color: '#212121' }}>
                    Why participate?
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[
                      'Win high-end tech and professional football gear',
                      'Real-time leaderboards and expert statistics',
                      'Easy prediction management for all 104 matches',
                    ].map((item) => (
                      <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#9B1915' }} />
                        <Typography variant="body2" sx={{ color: '#444', fontWeight: 500 }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography variant="caption" sx={{ color: '#999', fontWeight: 500 }}>
                  © 2026 Kramp Groep B.V. • It&apos;s that easy.
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                borderRadius: 0,
                borderLeft: { md: 'none' },
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 6 } }}>
                <Box sx={{ mb: 6 }}>
                  <Box
                    component="img"
                    src="/kramp-logo-red.svg"
                    alt="Kramp"
                    sx={{ height: 64, width: 'auto' }}
                  />
                </Box>

                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#212121' }}>
                  {t('login.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  {t('login.subtitle')}
                </Typography>

                {error && (
                  <Alert severity="error" variant="outlined" sx={{ mb: 3, borderRadius: 0 }}>
                    {error}
                  </Alert>
                )}

                  <form onSubmit={handleSubmit}>
                    <TextField
                      fullWidth
                      label={t('login.identifier')}
                      type="text"
                      variant="outlined"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      margin="normal"
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                    />
                  <TextField
                    fullWidth
                    label={t('login.password')}
                    type="password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loading}
                    sx={{ mt: 4, height: 48 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : t('login.submit')}
                  </Button>
                </form>

                <Divider sx={{ my: 4 }}>
                  <Typography variant="caption" sx={{ color: '#999', textTransform: 'uppercase', fontWeight: 700 }}>
                    {t('login.newHere')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => navigate(withEventPrefix(eventCode, '/register'))}
                  sx={{ height: 48 }}
                >
                  {t('login.createAccount')}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => alert('Please contact IT support for password recovery.')}
                    sx={{ cursor: 'pointer', color: '#666', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {t('login.forgotPassword')}
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
