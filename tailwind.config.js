/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './admin/*.html',
    './assets/js/*.js',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      fontFamily: {
        agharti:           ['Agharti', 'sans-serif'],
        'agharti-condensed': ['"Agharti Condensed"', 'sans-serif'],
        'agharti-dsc':     ['"Agharti DSC"', 'sans-serif'],   // Demi Semi-Condensed — headlines & buttons
        'agharti-bsc':     ['"Agharti BSC"', 'sans-serif'],   // Bold Semi-Condensed — creator names
        'agharti-bc':      ['"Agharti BC"', 'sans-serif'],    // Bold Condensed — Sobre "GRUPO FAROL"
        'agharti-lsc':     ['"Agharti LSC"', 'sans-serif'],   // Light Semi-Condensed — Sobre "SoMos o"
        'agharti-tsc':     ['"Agharti TSC"', 'sans-serif'],   // Thin Semi-Condensed — "Centenas de comunidades"
        'agharti-buw':     ['"Agharti BUW"', 'sans-serif'],   // Black Ultra-Wide — stat numbers
        'agharti-duc':     ['"Agharti DUC"', 'sans-serif'],   // Demi Ultra-Condensed — creator tags
        casual:            ['Casual Human', 'sans-serif'],
        foun:              ['Foun', 'serif'],
        serif:             ['PT Serif', 'Georgia', 'serif'],
        sans:              ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Cores extraídas do Figma — node 1:4
        brand: {
          red:    '#B9323B',  // CTA principal (Figma: #b9323b)
          beige:  '#FFF2E7',  // Fundo da página (Figma: #fff2e7)
          black:  '#1A1A1A',  // Texto padrão
          blue:   '#5C8DC9',  // CTA secundário / cards
          yellow: '#D1D362',  // Cards de stats
          pink:   '#B1375B',  // Cards de stats
        },
      },
    },
  },
  safelist: [
    'bg-green-600',
    'bg-red-600',
    'text-white',
    '-translate-x-1/2',
  ],
  plugins: [],
}
