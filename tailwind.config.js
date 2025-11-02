const colors = require('tailwindcss/colors');
const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        mono: ['var(--font-jetbrains-mono)', ...fontFamily.mono],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.slate[700]'),
            '--tw-prose-headings': theme('colors.slate[900]'),
            '--tw-prose-lead': theme('colors.slate[600]'),
            '--tw-prose-links': theme('colors.indigo[600]'),
            '--tw-prose-bold': theme('colors.slate[900]'),
            '--tw-prose-counters': theme('colors.slate[500]'),
            '--tw-prose-bullets': theme('colors.slate[300]'),
            '--tw-prose-hr': theme('colors.slate[200]'),
            '--tw-prose-quotes': theme('colors.slate[900]'),
            '--tw-prose-quote-borders': theme('colors.indigo[300]'),
            '--tw-prose-captions': theme('colors.slate[500]'),
            '--tw-prose-code': theme('colors.indigo[600]'),
            '--tw-prose-pre-code': theme('colors.slate[200]'),
            '--tw-prose-pre-bg': theme('colors.slate[800]'),
            '--tw-prose-th-borders': theme('colors.slate[300]'),
            '--tw-prose-td-borders': theme('colors.slate[200]'),
            
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            code: {
              fontWeight: '500',
              backgroundColor: theme('colors.slate.100'),
              padding: theme('spacing.1'),
              borderRadius: theme('borderRadius.md'),
            },
            pre: {
              backgroundColor: theme('colors.slate.800'),
              color: theme('colors.slate.200'),
              borderRadius: theme('borderRadius.lg'),
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: 0,
              color: 'inherit',
            },
            a: {
              textDecoration: 'none',
              transition: 'color 0.2s ease-in-out',
              '&:hover': {
                color: theme('colors.indigo.700'),
              },
            },
            blockquote: {
              fontStyle: 'normal',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
}