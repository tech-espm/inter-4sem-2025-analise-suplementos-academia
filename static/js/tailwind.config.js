module.exports = {
  content: ["./pages/*.{html,js}", "./index.html", "./js/*.js"],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: "#ffffff", // white - Pure foundation that maximizes content focus
        secondary: "#f8f9fa", // gray-50 - Subtle surface differentiation
        accent: "#6a9cde", // blue-400 - Strategic attention director
        
        // Background & Surface
        background: "#ffffff", // white - Clean analytical environment
        surface: "#f1f3f4", // gray-100 - Gentle elevation indicator
        
        // Text Colors
        'text-primary': "#000000", // black - Maximum readability for critical data
        'text-secondary': "#3b3b40", // gray-700 - Reduced emphasis for supporting information
        
        // Status Colors
        success: "#28a745", // green-600 - Positive performance indicators
        warning: "#ffc107", // yellow-400 - Attention-requiring data points
        error: "#dc3545", // red-600 - Critical alerts and negative indicators
        
        // Border & Utility
        border: "#e9ecef", // gray-200 - Strategic borders for data structure
        
        // Extended Gray Scale for Data Analytics
        gray: {
          50: "#f8f9fa",
          100: "#f1f3f4",
          200: "#e9ecef",
          300: "#dee2e6",
          400: "#ced4da",
          500: "#adb5bd",
          600: "#6c757d",
          700: "#495057",
          800: "#343a40",
          900: "#212529"
        }
      },
      fontFamily: {
        // Typography Standards
        'montserrat': ['Montserrat', 'sans-serif'], // Headings - Modern geometric clarity
        'lato': ['Lato', 'sans-serif'], // Body & Captions - Humanist readability
        'source-code': ['Source Code Pro', 'monospace'], // Data - Monospaced precision
        'sans': ['Lato', 'sans-serif'], // Default sans-serif
        'heading': ['Montserrat', 'sans-serif'], // Alias for headings
        'data': ['Source Code Pro', 'monospace'] // Alias for data display
      },
      fontSize: {
        // Data-focused typography scale
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        'data-sm': ['0.875rem', { lineHeight: '1.25rem', fontFamily: 'Source Code Pro' }],
        'data-base': ['1rem', { lineHeight: '1.5rem', fontFamily: 'Source Code Pro' }],
        'data-lg': ['1.125rem', { lineHeight: '1.75rem', fontFamily: 'Source Code Pro' }]
      },
      boxShadow: {
        // Minimal elevation system
        'minimal': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'card': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.12)',
        'none': 'none'
      },
      borderRadius: {
        // Clean, minimal radius values
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem'
      },
      spacing: {
        // Data-focused spacing scale
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      transitionDuration: {
        // Animation timing standards
        '150': '150ms',
        '200': '200ms',
        '300': '300ms'
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)'
      },
      animation: {
        // Custom animations for data interfaces
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-down': 'slideDown 300ms ease-out',
        'loading': 'loading 1.5s infinite',
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        loading: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        }
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.font-variant-numeric-tabular': {
          'font-variant-numeric': 'tabular-nums'
        },
        '.transition-micro': {
          'transition-duration': '150ms',
          'transition-timing-function': 'cubic-bezier(0, 0, 0.2, 1)'
        },
        '.transition-standard': {
          'transition-duration': '200ms',
          'transition-timing-function': 'cubic-bezier(0, 0, 0.2, 1)'
        },
        '.transition-gentle': {
          'transition-duration': '300ms',
          'transition-timing-function': 'cubic-bezier(0, 0, 0.2, 1)'
        }
      }
      addUtilities(newUtilities)
    }
  ]
}