import { attachServiceErrorHandlers, createServiceApp } from '../../shared/create-service-app';
import extinguisherRoutes from './routes/extinguishers.routes';

const app = createServiceApp('extinguisher-service');

app.use(extinguisherRoutes);

attachServiceErrorHandlers(app);

export default app;
