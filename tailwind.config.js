const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 1. Adds your custom font families
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      // 2. This is the official way to configure the .prose styles
      // This configuration mirrors the custom CSS you have in your <style> tag.
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.slate[800]'),
            '--tw-prose-headings': theme('colors.slate[900]'),
            '--tw-prose-links': theme('colors.indigo[600]'),
            '--tw-prose-quotes': theme('colors.gray[700]'),
            '--tw-prose-quote-borders': theme('colors.indigo[200]'),
            
            // --- Inline Code ---
            // This targets inline code that is *not* in a <pre> block
            // It applies your custom indigo-100/indigo-800 styling.
            'code:not(pre > code)': {
              backgroundColor: theme('colors.indigo[100]'),
              color: theme('colors.indigo[800]'),
              padding: '0.2em 0.4em',
              borderRadius: '6px',
              fontWeight: '500',
            },

            // --- Code Blocks ---
            // This setup assumes you are still loading 'github-dark.min.css'
            // for syntax highlighting, so we just style the <pre> container.
            '--tw-prose-pre-code': 'inherit', // Let the highlighter style the text
            '--tw-prose-pre-bg': '#0d1117', // Match github-dark bg
            'pre': {
               borderRadius: '12px',
               padding: '1.25em',
            },
          },
        },
      }),
    },
  },
  plugins: [
    // 3. This plugin provides all the base .prose styles
    require('@tailwindcss/typography'),
  ],
}