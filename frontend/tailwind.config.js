module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'primary-blue': '#3B82F6',
        'dark-blue': '#1E40AF',
        'light-blue': '#DBEAFE',
        
        // Secondary Colors
        'success': '#10B981',
        'error': '#EF4444',
        'warning': '#F59E0B',
        'accent': '#8B5CF6',
        
        // Neutral Colors
        'dark-gray': '#1F2937',
        'medium-gray': '#6B7280',
        'light-gray': '#F3F4F6',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'secondary': ['DM Sans', 'sans-serif'],
        'mono': ['Roboto Mono', 'monospace'],
      },
      fontSize: {
        'display': '2rem',      // 32px
        'h1': '1.5rem',         // 24px
        'h2': '1.25rem',        // 20px
        'h3': '1.125rem',       // 18px
        'body': '1rem',         // 16px
        'small': '0.875rem',    // 14px
        'tiny': '0.75rem',      // 12px
      },
    },
  },
  plugins: [],
}