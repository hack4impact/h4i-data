import { execSync } from 'child_process';

export default async function integrationSetup() {
  execSync('pnpm run docker:up', { stdio: 'inherit' });
}
