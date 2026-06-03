import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import { globalIgnores } from 'eslint/config';
import unusedImports from 'eslint-plugin-unused-imports';

const eslintConfig = [
  // 1. Global ignores MUST come first
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'public/workbox-*.js',
    'public/sw.js',
    'public/**/*.min.js',
  ]),

  // 2. Next.js flat configs
  ...nextCoreWebVitals,
  ...nextTypescript,

  // 3. Custom rules
  {
    plugins: { 'unused-imports': unusedImports },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      // Production-safe rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'off', // handled by unused-imports plugin
    },
  },
];

export default eslintConfig;
