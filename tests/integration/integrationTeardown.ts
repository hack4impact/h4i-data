import { execSync } from 'child_process';

export default async function integrationTeardown() {
  execSync('pnpm run docker:down', { stdio: 'inherit' });
}
