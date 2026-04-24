import { Router } from 'express';
import { sendOtp } from '../controllers/sendOtp.controller';
import { verifyOtp } from '../controllers/verifyOtp.controller';
import { refreshToken } from '../controllers/refreshToken.controller';
import { logout } from '../controllers/logout.controller';
import { registerUser } from '../controllers/auth.controller';
import { firebaseVerify } from '../controllers/firebaseVerify.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

// POST /auth/register
router.post('/register', registerUser);

// POST /auth/send-otp
/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to User
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid phone number
 */
router.post('/send-otp', sendOtp);

// POST /auth/verify-otp
/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and Issue JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT Tokens issued
 */
router.post('/verify-otp', verifyOtp);

// POST /auth/firebase-verify
/**
 * @swagger
 * /api/auth/firebase-verify:
 *   post:
 *     summary: Verify Firebase ID Token and Issue JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT Tokens issued
 */
router.post('/firebase-verify', firebaseVerify);

// POST /auth/refresh
router.post('/refresh', refreshToken);

// POST /auth/logout (Protected)
router.post('/logout', authMiddleware as any, logout);

export default router;
