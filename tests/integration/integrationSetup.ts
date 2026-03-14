import { execSync } from 'child_process';

export default async function integrationSetup() {
  execSync('pnpm run docker:test:up', { stdio: 'inherit' });
}
