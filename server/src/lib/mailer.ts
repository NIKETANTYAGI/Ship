import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASS = process.env.GMAIL_APP_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASS,
  },
});

/**
 * Universal Email Utility (Gmail)
 * Used for OTPs and other transactional emails.
 */
export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  if (!GMAIL_USER || !GMAIL_APP_PASS) {
    console.log('\n--- 📧 MOCK EMAIL NOTIFICATION ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    console.log('----------------------------------\n');
    return { success: true, messageId: 'mock-' + Date.now() };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Parcel Support" <${GMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Gmail Email Failed:', error);
    return { success: false, error: 'Failed to send email' };
  }
};
