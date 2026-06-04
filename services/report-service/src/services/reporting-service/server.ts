import app from './app';
import { env } from '../../config/env';

app.listen(env.reportingServicePort, () => {
  console.log(`Reporting service running on port ${env.reportingServicePort}`);
});
