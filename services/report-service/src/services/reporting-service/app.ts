import { attachServiceErrorHandlers, createServiceApp } from '../../shared/create-service-app';
import reportRoutes from './routes/reports.routes';

const app = createServiceApp('reporting-service');

app.use(reportRoutes);

attachServiceErrorHandlers(app);

export default app;
