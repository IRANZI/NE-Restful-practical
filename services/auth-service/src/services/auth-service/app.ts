import { createServiceApp, attachServiceErrorHandlers } from '../../shared/create-service-app';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';

const app = createServiceApp('auth-service');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

attachServiceErrorHandlers(app);

export default app;
