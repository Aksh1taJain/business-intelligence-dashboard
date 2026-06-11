import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { registerValidators, loginValidators, validate } from '../middleware/validate';

const router = Router();

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 * Returns: { token, user }
 */
router.post('/register', registerValidators, validate, register);

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { token, user }
 */
router.post('/login', loginValidators, validate, login);

/**
 * GET /api/auth/profile
 * Headers: Authorization: Bearer <token>
 * Returns: { user }
 */
router.get('/profile', authenticateToken, getProfile);

export default router;
