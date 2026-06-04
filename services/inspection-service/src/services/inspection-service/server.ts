import app from './app';
import { env } from '../../config/env';

app.listen(env.inspectionServicePort, () => {
  console.log(`Inspection service running on port ${env.inspectionServicePort}`);
});
