import { spawn } from 'node:child_process';

// One command starts the gateway, each microservice, and the frontend for local development.
const workspaces = [
  'services/api-gateway',
  'services/auth-service',
  'services/extinguisher-service',
  'services/inspection-service',
  'services/report-service',
  'services/notification-service',
  'frontend'
];

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const children = workspaces.map((workspace) => {
  const child = spawn(npmCommand, ['--workspace', workspace, 'run', 'dev'], {
    stdio: 'inherit',
    shell: false
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${workspace} exited with code ${code}`);
    }
  });

  return child;
});

function shutdown() {
  // Stop every child process when the developer stops the root dev command.
  for (const child of children) {
    child.kill();
  }

  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
