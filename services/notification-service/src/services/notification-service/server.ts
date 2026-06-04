import app from './app';
import { env } from '../../config/env';

app.listen(env.notificationServicePort, () => {
  console.log(`Notification service running on port ${env.notificationServicePort}`);
});
