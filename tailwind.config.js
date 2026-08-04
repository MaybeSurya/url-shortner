/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './client/index.html',
    './client/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces (zinc-based, clean)
        'surface': 'var(--color-surface, #fafafa)',
        'surface-dim': 'var(--color-surface-dim, #e4e4e7)',
        'surface-bright': 'var(--color-surface-bright, #ffffff)',
        'surface-container-lowest': 'var(--color-surface-container-lowest, #ffffff)',
        'surface-container-low': 'var(--color-surface-container-low, #f4f4f5)',
        'surface-container': 'var(--color-surface-container, #f1f1f3)',
        'surface-container-high': 'var(--color-surface-container-high, #e8e8eb)',
        'surface-container-highest': 'var(--color-surface-container-highest, #e0e0e3)',

        // Text
        'on-surface': 'var(--color-on-surface, #09090b)',
        'on-surface-variant': 'var(--color-on-surface-variant, #52525b)',
        'inverse-surface': 'var(--color-inverse-surface, #18181b)',
        'inverse-on-surface': 'var(--color-inverse-on-surface, #f4f4f5)',

        // Borders
        'outline': 'var(--color-outline, #a1a1aa)',
        'outline-variant': 'var(--color-outline-variant, #e4e4e7)',

        // Background
        'background': 'var(--color-background, #fafafa)',
        'on-background': 'var(--color-on-background, #09090b)',

        // Brand: Electric Indigo
        'primary': {
          DEFAULT: '#4648d4',
          hover: '#3b3db8',
          light: '#eef0ff',
          muted: 'rgba(70, 72, 212, 0.1)',
        },
        'on-primary': '#ffffff',

        // Success green
        'secondary': {
          DEFAULT: '#16a34a',
          light: '#f0fdf4',
          muted: 'rgba(22, 163, 74, 0.1)',
        },
        'on-secondary': '#ffffff',

        // Warning amber
        'tertiary': {
          DEFAULT: '#d97706',
          light: '#fffbeb',
          muted: 'rgba(217, 119, 6, 0.1)',
        },

        // Error red
        'error': {
          DEFAULT: '#dc2626',
          light: '#fef2f2',
          muted: 'rgba(220, 38, 38, 0.1)',
        },

        // Zinc shades for fine-grained control
        'zinc': {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          850: '#1f1f23',
          900: '#18181b',
          950: '#09090b',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },

      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        'xs':  ['11px', { lineHeight: '1.5' }],
        'sm':  ['13px', { lineHeight: '1.5' }],
        'base':['14px', { lineHeight: '1.6' }],
        'lg':  ['16px', { lineHeight: '1.5' }],
        'xl':  ['18px', { lineHeight: '1.4' }],
        '2xl': ['22px', { lineHeight: '1.3' }],
        '3xl': ['28px', { lineHeight: '1.2' }],
      },

      spacing: {
        // 8pt grid
        '0.5': '2px',
        '1':   '4px',
        '1.5': '6px',
        '2':   '8px',
        '2.5': '10px',
        '3':   '12px',
        '4':   '16px',
        '5':   '20px',
        '6':   '24px',
        '7':   '28px',
        '8':   '32px',
        '9':   '36px',
        '10':  '40px',
        '12':  '48px',
        '14':  '56px',
        '16':  '64px',
        '18':  '72px',
        '20':  '80px',
      },

      borderRadius: {
        'none': '0',
        'sm':   '4px',
        'DEFAULT': '6px',
        'md':   '8px',
        'lg':   '10px',
        'xl':   '12px',
        '2xl':  '16px',
        'full': '9999px',
      },

      boxShadow: {
        'xs':      '0 1px 2px rgba(0,0,0,0.04)',
        'sm':      '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'DEFAULT': '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)',
        'md':      '0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -2px rgba(0,0,0,0.03)',
        'lg':      '0 20px 25px -5px rgba(0,0,0,0.06), 0 10px 10px -5px rgba(0,0,0,0.02)',
        'xl':      '0 25px 50px -12px rgba(0,0,0,0.12)',
        'inner':   'inset 0 2px 4px 0 rgba(0,0,0,0.04)',
        'none':    'none',
        // Brand
        'glow':    '0 0 0 3px rgba(70, 72, 212, 0.18)',
        'glow-sm': '0 0 0 2px rgba(70, 72, 212, 0.14)',
        // Elevated card
        'card':    '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)',
        'card-hover': '0 0 0 1px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
      },

      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out':    'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      transitionDuration: {
        '50':  '50ms',
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '500': '500ms',
      },

      animation: {
        'fade-in':    'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':   'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer':    'shimmer 1.4s ease-in-out infinite',
        'spin-slow':  'spin 2s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },

      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};
