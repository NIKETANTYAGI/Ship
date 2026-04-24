import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

/**
 * Sends a notification to Slack channel.
 * Used for internal system monitoring and critical error alerts.
 */
export const sendSlackAlert = async (message: string, level: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') => {
    if (!SLACK_WEBHOOK_URL) {
        console.log(`[SLACK MOCK - ${level}] ${message}`);
        return;
    }

    const color = level === 'CRITICAL' ? '#FF0000' : level === 'WARNING' ? '#FFA500' : '#36a64f';
    const icon = level === 'CRITICAL' ? '🚨' : level === 'WARNING' ? '⚠️' : 'ℹ️';

    try {
        await axios.post(SLACK_WEBHOOK_URL, {
            attachments: [
                {
                    fallback: `${icon} ${message}`,
                    color,
                    title: `${icon} System Alert - ${level}`,
                    text: message,
                    ts: Math.floor(Date.now() / 1000)
                }
            ]
        });
    } catch (error) {
        console.error('Failed to send Slack alert:', error);
    }
};
