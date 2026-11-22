import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: ['class'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      // Afro-contemporary gallery palette (spec §14).
      // Earth tones on cream, editorial feel. Tokens match CSS variables in globals.css.
      colors: {
        background: 'hsl(var(--bg) / <alpha-value>)',
        foreground: 'hsl(var(--fg) / <alpha-value>)',
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-fg) / <alpha-value>)',
        },
        border: 'hsl(var(--border) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        terracotta: {
          DEFAULT: 'hsl(var(--terracotta) / <alpha-value>)',
          foreground: 'hsl(var(--terracotta-fg) / <alpha-value>)',
        },
        ochre: {
          DEFAULT: 'hsl(var(--ochre) / <alpha-value>)',
          foreground: 'hsl(var(--ochre-fg) / <alpha-value>)',
        },
        indigo: {
          DEFAULT: 'hsl(var(--indigo) / <alpha-value>)',
          foreground: 'hsl(var(--indigo-fg) / <alpha-value>)',
        },
        forest: {
          DEFAULT: 'hsl(var(--forest) / <alpha-value>)',
          foreground: 'hsl(var(--forest-fg) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-fg) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-fg) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};

export default config;
