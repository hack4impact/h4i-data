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
  eslintConfigPrettier,
  {
    rules: {
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
    },
  },
  {
    files: ['tests/**/*.ts', 'tests/**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  }
);
