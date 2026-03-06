import { execSync } from 'child_process';

module.exports = async function integrationSetup() {
  execSync('pnpm run docker:up', { stdio: 'inherit' });
};
