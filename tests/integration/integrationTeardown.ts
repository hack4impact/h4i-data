import { execSync } from 'child_process';

export default async function integrationTeardown() {
  execSync('pnpm run docker:test:down', { stdio: 'inherit' });
}
