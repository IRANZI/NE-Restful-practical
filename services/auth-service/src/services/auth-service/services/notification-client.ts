import { env } from '../../../config/env';

export async function requestNotification(to: string, subject: string, text: string) {
  try {
    await fetch(`${env.serviceUrls.notifications}/api/notifications/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to, subject, text })
    });
  } catch (error) {
    console.error('Notification service request failed', error);
  }
}
