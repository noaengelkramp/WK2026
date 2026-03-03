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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    customerNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.customerNumber) {
      setError('Please fill in all fields');
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

    // Validate customer number format: C1234_1234567
    const customerNumberRegex = /^C\d{4}_\d{7}$/;
    if (!customerNumberRegex.test(formData.customerNumber)) {
      setError('Customer number must be in format: C1234_1234567');
      return;
    }

    // Call registration API
    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        customerNumber: formData.customerNumber,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
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
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h3" gutterBottom>
                ✅
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Registration Successful!
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
                  JOIN THE COMPETITION
                </Typography>
                <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>
                  Create your account
                </Typography>
                <Typography variant="h5" sx={{ mt: 1, color: '#666666' }}>
                  Get access to matches, standings, and prizes.
                </Typography>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Benefits
                  </Typography>
                  <Grid container spacing={1.5}>
                    {[
                      'Track your progress across all matches',
                      'Earn points and climb the leaderboard',
                      'Join your department rankings',
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
                  Company-only challenge • It&apos;s that easy.
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
                  Register
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Use your company details to create your account.
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Customer Number"
                        name="customerNumber"
                        value={formData.customerNumber}
                        onChange={handleChange}
                        margin="normal"
                        required
                        placeholder="C1234_1234567"
                        helperText="Format: C1234_1234567"
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        margin="normal"
                        required
                        helperText="Minimum 8 characters"
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        margin="normal"
                        required
                      />
                    </Grid>
                  </Grid>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loading}
                    sx={{ mt: 3 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Create account'}
                  </Button>
                </form>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/login')}
                    sx={{ cursor: 'pointer' }}
                  >
                    Already have an account? Sign in
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
