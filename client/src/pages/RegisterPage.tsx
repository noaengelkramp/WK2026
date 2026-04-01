import { useEffect, useState } from 'react';
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
  Chip,
  CircularProgress,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../services/api';
import { eventService } from '../services/eventService';
import i18n, { normalizeLocaleToLanguage } from '../i18n';
import { withEventPrefix, getEventCodeFromPath } from '../utils/eventRouting';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const eventCode = getEventCodeFromPath();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    customerNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInternalEvent, setIsInternalEvent] = useState(eventCode === 'internal');
  const [eventName, setEventName] = useState<string>('');

  useEffect(() => {
    // Fast path: infer from URL immediately to avoid wrong form flash
    setIsInternalEvent(eventCode === 'internal');

    eventService.getCurrent()
      .then((response) => {
        if (response.mode === 'event' && response.event) {
          setIsInternalEvent(response.event.code === 'internal');
          setEventName(response.event.name || '');
          const nextLang = normalizeLocaleToLanguage(response.event.defaultLocale);
          i18n.changeLanguage(nextLang);
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username || !formData.email || !formData.password || (!isInternalEvent && !formData.customerNumber)) {
      setError('Please fill in all fields');
      return;
    }

    if (isInternalEvent && !formData.email.toLowerCase().endsWith('@kramp.com')) {
      setError('Internal event registration requires a @kramp.com email address');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Validate customer number format: 7 digits OR full internal format
    const customerNumberRegex = /^(\d{7}|C\d{4}_\d{7})$/;
    if (!isInternalEvent && !customerNumberRegex.test(formData.customerNumber)) {
      setError('Customer number must be 7 digits (or internal format C1234_1234567)');
      return;
    }

    // Call registration API
    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        customerNumber: formData.customerNumber || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(withEventPrefix(eventCode, '/'));
      }, 2000);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm">
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card variant="outlined" sx={{ borderRadius: 0 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Registration Successful
          </Typography>
          <Typography color="text.secondary">
            Redirecting to home page...
          </Typography>
        </CardContent>
      </Card>
    </Box>
      </Container>
    );
  }

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
                  JOIN THE COMPETITION
                </Typography>
                <Typography variant="h3" sx={{ mt: 1, fontWeight: 700, color: '#212121' }}>
                  Create your account
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, color: '#666666', fontSize: '1.1rem' }}>
                  Get access to matches, standings, and exclusive prizes by joining the Kramp prediction challenge.
                </Typography>

                <Box sx={{ mt: 6 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase', color: '#212121' }}>
                    Benefits
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[
                      'Track your progress across all 104 matches',
                      'Earn points and climb the global leaderboard',
                      'Compete for the department ranking',
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
                  {t('register.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  {t('register.subtitle')}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                  {eventName && <Chip label={`Event: ${eventName}`} size="small" color="default" />}
                  {isInternalEvent ? (
                    <Chip label={t('register.internalPolicy')} size="small" color="warning" />
                  ) : (
                    <Chip label={t('register.externalPolicy')} size="small" color="info" />
                  )}
                </Box>

                {error && (
                  <Alert severity="error" variant="outlined" sx={{ mb: 3, borderRadius: 0 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label={t('register.username')}
                        name="username"
                        variant="outlined"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        helperText="This will be your public name on the leaderboards"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label={t('register.email')}
                        name="email"
                        type="email"
                        variant="outlined"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                      />
                    </Grid>
                    {!isInternalEvent && (
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label={t('register.customerNumber')}
                        name="customerNumber"
                        variant="outlined"
                        value={formData.customerNumber}
                        onChange={handleChange}
                        required
                        placeholder="0000000"
                        helperText={t('register.customerNumberHint')}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                      />
                    </Grid>
                    )}
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label={t('register.password')}
                        name="password"
                        type="password"
                        variant="outlined"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        helperText="Minimum 8 characters"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label={t('register.confirmPassword')}
                        name="confirmPassword"
                        type="password"
                        variant="outlined"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                      />
                    </Grid>
                  </Grid>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loading}
                    sx={{ mt: 4, height: 48 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : t('register.createAccount')}
                  </Button>
                </form>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate(withEventPrefix(eventCode, '/login'))}
                    sx={{ cursor: 'pointer', color: '#666', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {t('register.alreadyHaveAccount')}
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
