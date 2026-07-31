/**
 * Momentum Light Cyan/Blue Clean Palette
 * Restored based on user screenshot specification
 */

export const themeConfig = {
  colors: {
    // Primary Cyan & Blue Colors (From Screenshot)
    brand: {
      primaryCyan: '#00A8CC',      // Main Cyan Action & Badge fill
      activeBlue: '#0070F3',       // Logo & Accent Blue (#0070F3 / #0088FF)
      lightCyanBg: '#E0F7FA',      // Light Cyan Badge/Pill Background
      cardCyanBg: '#0096B7',       // Hero Box Dark Cyan Background (#008CA8 - #0096B7)
      emeraldGreen: '#10B981',     // Connected Status Sync Badge Text
      lightGreenBg: '#D1FAE5',     // Connected Status Sync Badge BG
    },
    // Background Colors
    background: {
      pageBg: '#F8FAFC',           // Clean Crisp Light Slate/White Background
      cardBg: '#FFFFFF',           // Pure White Cards
    },
    // UI Surface Elements
    surface: {
      cardBorder: '#E2E8F0',
      pillBg: '#F1F5F9',
      pillActiveBg: '#00A8CC',
      pillActiveText: '#FFFFFF',
      pillInactiveText: '#475569',
      bottomNavBg: 'rgba(255, 255, 255, 0.98)',
      bottomNavBorder: '#E2E8F0',
    },
    // Text Colors
    text: {
      primary: '#0F172A',          // Dark Slate Headings & Title
      secondary: '#475569',        // Slate Body Text
      muted: '#94A3B8',            // Light Muted Text
      brandBlue: '#0070F3',        // Momentum Header Text
      cyanAction: '#00A8CC',       // Active Tab & Action Text
    },
    // Button & Action Tokens
    action: {
      primaryBtnBg: '#00A8CC',     // 'יעד חדש' & (+) FAB button
      primaryBtnText: '#FFFFFF',
      heroBoxBtnBg: '#4DD0E1',     // 'טריאז רציף באשף' Button
      heroBoxBtnText: '#004D40',
    },
  },
  borderRadius: {
    card: '1.25rem', // 20px rounded cards
    pill: '9999px',
    button: '9999px',
  },
  shadows: {
    cardShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
    fabShadow: '0 10px 25px -5px rgba(0, 168, 204, 0.4), 0 8px 10px -6px rgba(0, 168, 204, 0.2)',
    navShadow: '0 -4px 25px rgba(0, 0, 0, 0.08)',
  },
} as const;

export type ThemeConfig = typeof themeConfig;
