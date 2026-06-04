import { attachServiceErrorHandlers, createServiceApp } from '../../shared/create-service-app';
import inspectionRoutes from './routes/inspections.routes';

const app = createServiceApp('inspection-service');

app.use(inspectionRoutes);

attachServiceErrorHandlers(app);

export default app;
