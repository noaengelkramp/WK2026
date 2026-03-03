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
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFFFFF' }}>
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
                    src="/assets/kramp-logo-red.svg"
                    alt="Kramp"
                    sx={{ height: 32, width: 'auto' }}
                  />
                </Box>

                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#212121' }}>
                  Register
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Enter your details below to create your participant account.
                </Typography>

                {error && (
                  <Alert severity="error" variant="outlined" sx={{ mb: 3, borderRadius: 0 }}>
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
                        variant="outlined"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        variant="outlined"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        variant="outlined"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Customer Number"
                        name="customerNumber"
                        variant="outlined"
                        value={formData.customerNumber}
                        onChange={handleChange}
                        required
                        placeholder="C1234_1234567"
                        helperText="Format: C1234_1234567"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Password"
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
                        label="Confirm Password"
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
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                  </Button>
                </form>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/login')}
                    sx={{ cursor: 'pointer', color: '#666', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
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
