/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // UX4G Mandated Core Violet Palette
        gov: {
          tricolor: {
            saffron: '#FF9933',
            white: '#FFFFFF',
            green: '#138808',
            blue: '#000080',
          }
        },
        violet: {
          950: '#0a0416',
          900: '#12082b',
          850: '#190d38',
          800: '#23124d',
          700: '#35186b',
          600: '#5521a3',
          500: '#7c3aed',
          400: '#a78bfa',
          300: '#c4b5fd',
          200: '#ddd6fe',
          100: '#ede9fe',
          50: '#f5f3ff',
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
        },
        neon: {
          cyan: '#00f0ff',
          magenta: '#ff007f',
          emerald: '#00ffaa',
          amber: '#ffaa00',
          violet: '#b026ff',
        },
        checkpoint: '#ec4899',
        paloalto: '#f97316',
        fortinet: '#ef4444',
        pfsense: '#06b6d4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'liquid-slow': 'liquid 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'wave-flow': 'waveFlow 4s linear infinite',
        'rainbow-shift': 'rainbowShift 8s ease infinite',
      },
      keyframes: {
        liquid: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.6))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 18px rgba(217, 70, 239, 0.9))' },
        },
        waveFlow: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        rainbowShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      }
    },
  },
  plugins: [],
}
