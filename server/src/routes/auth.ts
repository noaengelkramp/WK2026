import { Router } from 'express';
import { register, login, getProfile, updateProfile, verifyEmail, resendVerificationEmail } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/resend-verification', authenticate, resendVerificationEmail);

export default router;
