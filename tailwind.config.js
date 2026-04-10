/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── Colors ───────────────────────────────────────────────
      colors: {
        // Brand: Neon Cyan
        primary: {
          50:  '#E0FAFF',
          100: '#B3F3FF',
          200: '#66E9FF',
          300: '#33DDFF',
          400: '#00D4FF',
          500: '#00AACC',
          600: '#007A99',
          700: '#005C73',
          800: '#003D4D',
          900: '#001A26',
          950: '#000D14',
        },
        // Brand: Electric Purple
        accent: {
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#581C87',
          900: '#3B0764',
        },
        // Neutral — deep blue-grey dark theme
        neutral: {
          50:  '#E8F4FD',
          100: '#D0E4F5',
          200: '#B8D0E8',
          300: '#A0BCDB',
          400: '#8FA3BE',
          500: '#6B849E',
          600: '#4A6080',
          700: '#2D4060',
          800: '#1A2236',
          850: '#141B2D',
          900: '#0F1525',
          950: '#0A0E1A',
        },
        // Status colors
        status: {
          online:  '#10B981',
          offline: '#6B7280',
          error:   '#EF4444',
          pending: '#F59E0B',
          info:    '#3B82F6',
        },
        // Semantic surface aliases
        surface: '#0F1525',
        card:    '#141B2D',
        elevated:'#1A2236',
        overlay: '#1E2740',
      },

      // ─── Typography ───────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      fontSize: {
        'display': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h1':      ['1.75rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h2':      ['1.375rem',{ lineHeight: '1.4', fontWeight: '600' }],
        'h3':      ['1.125rem',{ lineHeight: '1.4', fontWeight: '600' }],
        'h4':      ['0.9375rem',{ lineHeight: '1.5', fontWeight: '600' }],
        'body':    ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        'sm':      ['0.8125rem',{ lineHeight: '1.5', fontWeight: '400' }],
        'xs':      ['0.75rem',  { lineHeight: '1.4', fontWeight: '400' }],
        'mono-sm': ['0.8125rem',{ lineHeight: '1.5', fontWeight: '500' }],
      },

      // ─── Spacing ──────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '30':  '7.5rem',
        '72':  '18rem',
        '80':  '20rem',
        '88':  '22rem',
        '96':  '24rem',
      },

      // ─── Border Radius ────────────────────────────────────────
      borderRadius: {
        'card':  '12px',
        'modal': '16px',
        'badge': '6px',
        'tag':   '4px',
      },

      // ─── Box Shadow ───────────────────────────────────────────
      boxShadow: {
        'card':        '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover':  '0 4px 32px rgba(0, 212, 255, 0.08), 0 0 0 1px rgba(0, 212, 255, 0.2)',
        'glow-cyan':   '0 0 20px rgba(0, 212, 255, 0.25)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.25)',
        'modal':       '0 24px 80px rgba(0, 0, 0, 0.7)',
        'dropdown':    '0 8px 32px rgba(0, 0, 0, 0.6)',
      },

      // ─── Animation ────────────────────────────────────────────
      transitionTimingFunction: {
        'snappy': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'gentle': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      transitionDuration: {
        'micro':  '100ms',
        'fast':   '150ms',
        'base':   '200ms',
        'medium': '300ms',
        'slow':   '500ms',
      },
      keyframes: {
        fadeSlideIn: {
          'from': { opacity: '0', transform: 'translateY(-8px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to':   { opacity: '1' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.96)' },
          'to':   { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0, 212, 255, 0.3)' },
          '50%':      { boxShadow: '0 0 20px rgba(0, 212, 255, 0.6)' },
        },
        slideInRight: {
          'from': { opacity: '0', transform: 'translateX(24px)' },
          'to':   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in':       'fadeIn 200ms ease-out both',
        'fade-slide-in': 'fadeSlideIn 300ms ease-out both',
        'scale-in':      'scaleIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-right':   'slideInRight 300ms ease-out both',
        'slide-up':      'slideInUp 300ms ease-out both',
        'glow-pulse':    'glowPulse 2s ease-in-out infinite',
      },

      // ─── Backdrop Blur ────────────────────────────────────────
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
