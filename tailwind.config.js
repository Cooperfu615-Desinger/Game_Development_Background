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
        // Neon greens / ambers for status/success
        neon: {
          green:  '#39FF14',
          cyan:   '#00D4FF',
          purple: '#A855F7',
          amber:  '#FFB800',
          red:    '#FF2D55',
          pink:   '#FF006E',
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
          online:  '#39FF14',
          offline: '#6B7280',
          error:   '#FF2D55',
          pending: '#FFB800',
          info:    '#00D4FF',
        },
        // Semantic surface aliases
        surface: '#0F1525',
        card:    '#141B2D',
        elevated:'#1A2236',
        overlay: '#1E2740',
      },

      // ─── Typography ───────────────────────────────────────────
      fontFamily: {
        // UI body text — geometric, sharp, military-tech feel
        sans: ['Rajdhani', 'Noto Sans TC', 'system-ui', '-apple-system', 'sans-serif'],
        // Monospace data / code
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
        // Display / stat numbers — classic sci-fi
        display: ['Orbitron', 'JetBrains Mono', 'monospace'],
        // CJK fallback body
        cjk:  ['Noto Sans TC', 'system-ui', 'sans-serif'],
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
      letterSpacing: {
        'widest-hud': '0.2em',
        'wide-hud':   '0.12em',
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
        'card':              '0 4px 24px rgba(0, 0, 0, 0.5)',
        'card-hover':        '0 4px 32px rgba(0, 212, 255, 0.1), 0 0 0 1px rgba(0, 212, 255, 0.25)',
        'glow-cyan':         '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-cyan-intense': '0 0 30px rgba(0, 212, 255, 0.6), 0 0 60px rgba(0, 212, 255, 0.2)',
        'glow-purple':       '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-purple-intense':'0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(168, 85, 247, 0.2)',
        'glow-green':        '0 0 20px rgba(57, 255, 20, 0.35)',
        'glow-red':          '0 0 20px rgba(255, 45, 85, 0.35)',
        'glow-amber':        '0 0 20px rgba(255, 184, 0, 0.35)',
        'inner-glow-cyan':   'inset 0 0 20px rgba(0, 212, 255, 0.1)',
        'neon-border':       '0 0 0 1px rgba(0, 212, 255, 0.4), 0 0 12px rgba(0, 212, 255, 0.2)',
        'modal':             '0 24px 80px rgba(0, 0, 0, 0.8)',
        'dropdown':          '0 8px 32px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(0, 212, 255, 0.1)',
      },

      // ─── Background Image ─────────────────────────────────────
      backgroundImage: {
        'grid-dot':     'radial-gradient(circle, rgba(0, 212, 255, 0.08) 1px, transparent 1px)',
        'grid-line':    'linear-gradient(rgba(0, 212, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.04) 1px, transparent 1px)',
        'scan-line':    'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0, 0, 0, 0.04) 2px, rgba(0, 0, 0, 0.04) 3px)',
        'neon-gradient':'linear-gradient(135deg, #00D4FF 0%, #A855F7 100%)',
        'cyan-fade':    'linear-gradient(180deg, rgba(0, 212, 255, 0.12) 0%, transparent 100%)',
        'ambient-glow': 'radial-gradient(ellipse 60% 50% at 15% 60%, rgba(0, 212, 255, 0.05) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 85% 15%, rgba(168, 85, 247, 0.05) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid-28': '28px 28px',
        'grid-32': '32px 32px',
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
          '50%':      { boxShadow: '0 0 24px rgba(0, 212, 255, 0.7)' },
        },
        glowPulseGreen: {
          '0%, 100%': { boxShadow: '0 0 6px rgba(57, 255, 20, 0.3)' },
          '50%':      { boxShadow: '0 0 18px rgba(57, 255, 20, 0.7)' },
        },
        slideInRight: {
          'from': { opacity: '0', transform: 'translateX(24px)' },
          'to':   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        neonFlicker: {
          '0%, 89%, 91%, 93%, 100%': {
            opacity: '1',
            textShadow: '0 0 12px rgba(0, 212, 255, 0.6)',
          },
          '90%': { opacity: '0.7', textShadow: 'none' },
          '92%': { opacity: '0.9', textShadow: '0 0 20px rgba(0, 212, 255, 0.8)' },
        },
        cornerExpand: {
          'from': { width: '16px', height: '16px', opacity: '0.6' },
          'to':   { width: '24px', height: '24px', opacity: '1' },
        },
        scanSweep: {
          'from': { transform: 'translateY(-100%)' },
          'to':   { transform: 'translateY(100%)' },
        },
        dataStream: {
          'from': { backgroundPosition: '200% center' },
          'to':   { backgroundPosition: '-200% center' },
        },
        borderFlash: {
          '0%, 100%': { borderColor: 'rgba(0, 212, 255, 0.3)' },
          '50%':      { borderColor: 'rgba(0, 212, 255, 0.8)', boxShadow: '0 0 15px rgba(0, 212, 255, 0.4)' },
        },
        statusPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.85)' },
        },
      },
      animation: {
        'fade-in':          'fadeIn 200ms ease-out both',
        'fade-slide-in':    'fadeSlideIn 300ms ease-out both',
        'scale-in':         'scaleIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-right':      'slideInRight 300ms ease-out both',
        'slide-up':         'slideInUp 300ms ease-out both',
        'glow-pulse':       'glowPulse 2.5s ease-in-out infinite',
        'glow-pulse-green': 'glowPulseGreen 2s ease-in-out infinite',
        'neon-flicker':     'neonFlicker 4s ease-in-out infinite',
        'scan-sweep':       'scanSweep 3s linear infinite',
        'data-stream':      'dataStream 3s linear infinite',
        'border-flash':     'borderFlash 3s ease-in-out infinite',
        'status-pulse':     'statusPulse 2s ease-in-out infinite',
      },

      // ─── Backdrop Blur ────────────────────────────────────────
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
