import app from './app';
import { env } from '../../config/env';

app.listen(env.extinguisherServicePort, () => {
  console.log(`Extinguisher service running on port ${env.extinguisherServicePort}`);
});
