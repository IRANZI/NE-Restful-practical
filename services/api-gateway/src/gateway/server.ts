import { env } from '../config/env';
import app from './app';

app.listen(env.gatewayPort, () => {
  console.log(`API gateway running on port ${env.gatewayPort}`);
  console.log(`Swagger documentation available at http://localhost:${env.gatewayPort}/api-docs`);
});
