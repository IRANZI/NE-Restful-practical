import { attachServiceErrorHandlers, createServiceApp } from '../../shared/create-service-app';
import notificationRoutes from './routes/notification.routes';

const app = createServiceApp('notification-service');

app.use(notificationRoutes);

attachServiceErrorHandlers(app);

export default app;
