/** @type {import('tailwindcss').Config} */
// Color tokens extracted from Figma via Figma MCP (get_variable_defs)
// File: ZqpEbKnJVN1osn35oVOwxt — Site Farol Identidade Visual
// Breakpoints derived from actual Figma frame widths: Mobile 480px, Tablet 768px, Desktop 1920px
module.exports = {
  content: [
    './*.html',
    './admin/**/*.html',
    './assets/js/**/*.js',
  ],
  theme: {
    // Breakpoints match Figma frame widths exactly.
    // Mobile frame: 480px | Tablet frame: 768px | Desktop frame: 1920px
    // lg/xl are intermediate thresholds for desktop-range responsiveness.
    screens: {
      sm:  '480px',   // Figma Mobile frame width
      md:  '768px',   // Figma Tablet frame width
      lg:  '1024px',  // desktop starts
      xl:  '1280px',  // wide desktop
      '2xl': '1920px', // matches Figma Desktop frame exactly
    },
    extend: {
      fontFamily: {
        agharti:        ['Agharti', 'sans-serif'],
        'casual-human': ['Casual Human', 'sans-serif'],
        foun:           ['Foun', 'serif'],
        'pt-serif':     ['PT Serif', 'serif'],
        poppins:        ['Poppins', 'sans-serif'],
      },
      // ── Color tokens — extracted from Figma variable defs ──
      colors: {
        'farol-beige':       '#FFF2E7',  // farolBeige
        'farol-black':       '#000000',  // black
        'farol-white':       '#FFFFFF',  // white
        'farol-text':        '#1A1A1A',  // text
        'farol-burning-red': '#B9323B',  // farolBurningRed
        'farol-red':         '#B1375B',  // farolRed / farolMagenta
        'farol-blue':        '#5C8DC9',  // farolBlue
        'farol-yellow':      '#E5A545',  // farolYellow
        'farol-green':       '#D1D362',  // farolGreen
        'farol-orange':      '#D96837',  // farolOrange
        'farol-teal':        '#90C2AC',  // farolTeal
      },
    },
  },
  plugins: [],
}
