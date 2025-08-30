import tseslint from 'typescript-eslint';

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
);