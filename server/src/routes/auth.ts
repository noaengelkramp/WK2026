import { Router } from 'express';
import { register, login, getProfile, updateProfile, verifyEmail, resendVerificationEmail } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { registerSchema, loginSchema, updateProfileSchema, verifyEmailSchema } from '../schemas/authSchema';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/verify-email', validateRequest(verifyEmailSchema), verifyEmail);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validateRequest(updateProfileSchema), updateProfile);
router.post('/resend-verification', authenticate, resendVerificationEmail);

export default router;
