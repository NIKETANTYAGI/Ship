import { Request, Response } from 'express';
import redis from '../../../Database/redis';
import { sendEmail } from '../../../lib/mailer';

// Keys used in Redis
const OTP_KEY = (email: string) => `otp:${email}`;
const RATE_KEY = (email: string) => `otp_attempts:${email}`;
const MAX_ATTEMPTS = 5;         // per hour
const OTP_TTL = 300;            // 5 minutes in seconds
const RATE_TTL = 3600;          // 1 hour in seconds

// Generate a random 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Mask email: example@gmail.com → ex***@gmail.com
function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (name.length <= 2) return email;
  return name.slice(0, 2) + '***@' + domain;
}

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  // Validate email
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({
      success: false,
      error: { code: 'AUTH_001', message: 'Invalid email address' },
    });
    return;
  }

  // ── Rate limiting: max 5 attempts per email per hour ─────────
  const attemptsRaw = await redis.get(RATE_KEY(email));
  const attempts = attemptsRaw ? parseInt(attemptsRaw, 10) : 0;

  if (attempts >= MAX_ATTEMPTS) {
    res.status(429).json({
      success: false,
      error: { code: 'AUTH_004', message: 'Too many attempts. Try after 1 hour.' },
    });
    return;
  }

  // ── Generate and store OTP in Redis ─────────────────────────
  const otp = generateOtp();

  // Store OTP with 5-minute TTL
  await redis.set(OTP_KEY(email), otp, 'EX', OTP_TTL);

  // Increment attempt counter; set TTL only on first attempt
  if (attempts === 0) {
    await redis.set(RATE_KEY(email), '1', 'EX', RATE_TTL);
  } else {
    await redis.incr(RATE_KEY(email));
  }

  // ── Send OTP via Gmail ───────────────────────────────────────
  const subject = `${otp} is your Parcel verification code`;
  const text = `Your verification code is ${otp}. It will expire in 5 minutes.`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb;">Verification Code</h2>
      <p>Use the following code to verify your email address on Parcel:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #64748b; font-size: 14px;">This code will expire in 5 minutes.</p>
    </div>
  `;

  const emailResult = await sendEmail(email, subject, text, html);

  if (!emailResult.success) {
    res.status(500).json({
      success: false,
      error: { code: 'AUTH_005', message: 'Failed to send OTP email' },
    });
    return;
  }

  // ── Success response ─────────────────────────────────────────
  res.status(200).json({
    success: true,
    data: {
      message: 'OTP sent successfully',
      expires_in: OTP_TTL,
      masked_email: maskEmail(email),
    },
  });
};
