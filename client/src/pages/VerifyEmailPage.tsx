import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import api from '../services/api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const response = await api.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(
          err.response?.data?.message || 'Failed to verify email. The link may have expired.'
        );
      }
    };

    verifyEmail();
  }, [token]);

  const handleContinue = () => {
    navigate('/login');
  };

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
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center' }}>
            {/* Logo/Header */}
            <Typography variant="h4" gutterBottom sx={{ color: '#9B1915', fontWeight: 'bold' }}>
              🏆 World Cup 2026
            </Typography>
            <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
              Email Verification
            </Typography>

            {/* Loading State */}
            {status === 'loading' && (
              <Box>
                <CircularProgress size={60} sx={{ color: '#9B1915', mb: 3 }} />
                <Typography variant="body1" color="text.secondary">
                  Verifying your email address...
                </Typography>
              </Box>
            )}

            {/* Success State */}
            {status === 'success' && (
              <Box>
                <CheckCircleIcon sx={{ fontSize: 80, color: '#4CAF50', mb: 3 }} />
                <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                  {message}
                </Alert>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Your email has been verified! You can now access all features and start making
                  predictions for the World Cup 2026.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleContinue}
                  sx={{
                    bgcolor: '#9B1915',
                    '&:hover': { bgcolor: '#7A1411' },
                    textTransform: 'none',
                    px: 4,
                  }}
                >
                  Continue to Login
                </Button>
              </Box>
            )}

            {/* Error State */}
            {status === 'error' && (
              <Box>
                <ErrorIcon sx={{ fontSize: 80, color: '#f44336', mb: 3 }} />
                <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                  {message}
                </Alert>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  If your verification link has expired, you can request a new one after logging
                  in.
                </Typography>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleContinue}
                  sx={{
                    borderColor: '#9B1915',
                    color: '#9B1915',
                    '&:hover': {
                      borderColor: '#7A1411',
                      bgcolor: 'rgba(155, 25, 21, 0.04)',
                    },
                    textTransform: 'none',
                    px: 4,
                  }}
                >
                  Go to Login
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
