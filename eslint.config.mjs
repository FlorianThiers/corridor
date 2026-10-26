import { defineConfig, globalIgnores } from 'eslint/config'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextCoreWebVitals,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'node_modules/**',
    'next-env.d.ts',
  ]),
  {
    rules: {
      // React 19 / eslint-plugin-react-hooks@7 — too strict for existing codebase
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-location-assign-relative-destination': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
])
