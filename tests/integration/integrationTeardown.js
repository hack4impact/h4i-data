import { execSync } from 'child_process';

module.exports = async function integrationTeardown() {
  execSync('pnpm run docker:down', { stdio: 'inherit' });
};
