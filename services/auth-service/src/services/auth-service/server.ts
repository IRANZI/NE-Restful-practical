import app from './app';
import { env } from '../../config/env';

app.listen(env.authServicePort, () => {
  console.log(`Auth service running on port ${env.authServicePort}`);
});
