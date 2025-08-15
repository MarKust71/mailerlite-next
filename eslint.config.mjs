import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { FlatCompat } from '@eslint/eslintrc'
import importPlugin from 'eslint-plugin-import'
import prettierPlugin from 'eslint-plugin-prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  {
    plugins: {
      prettier: prettierPlugin,
      import: importPlugin
    },
    rules: {
      'prettier/prettier': 'error',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' }
      ],
      // Sortowanie i grupowanie importów
      'import/order': [
        'warn',
        {
          groups: [
            'builtin', // node: fs, path
            'external', // react, next
            'internal', // @/lib, @/components
            ['parent', 'sibling', 'index'], // ./, ../
            'object', // import * as ...
            'type' // import type {...}
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal'
            }
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          },
          'newlines-between': 'always'
        }
      ]
    }
  }
]

export default eslintConfig
