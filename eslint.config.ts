import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '*.config.mts',
      'prisma/**',
      'legacy**',
      'generated/**',
    ],
  },
  tseslint.configs.stylistic,
  tseslint.configs.strict,
  eslintConfigPrettier
);
