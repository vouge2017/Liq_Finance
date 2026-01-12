import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-refresh': require('eslint-plugin-react-refresh'),
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#[0-9A-Fa-f]{3,6}$/]',
          message: 'Hex colors not allowed in JSX. Use CSS variables (var(--bg-main), var(--text-primary)) or Tailwind theme colors. See VISUAL_CONTRACT.md.',
        },
        {
          selector: 'CallExpression[callee.object.name="style"] > ObjectExpression > Property[key.name="backgroundColor"][value=/^#[0-9A-Fa-f]{3,6}$/]',
          message: 'Hex colors in style objects not allowed. Use CSS variables.',
        },
        {
          selector: 'CallExpression[callee.object.name="style"] > ObjectExpression > Property[key.name="color"][value=/^#[0-9A-Fa-f]{3,6}$/]',
          message: 'Hex colors in style objects not allowed. Use CSS variables.',
        },
      ],
    },
  },
  {
    files: ['src/index.css', 'src/lib/design-tokens.ts', 'src/lib/colors.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: ['**/*.svg'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: ['**/mock-data*.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
);
