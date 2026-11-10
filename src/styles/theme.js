export const theme = {
  colors: {
    primary: '#10B981',
    primaryDark: '#047857',
    accent: '#F59E0B',
    danger: '#EF4444',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    white: '#FFFFFF',
    successSoft: '#D1FAE5',
    accentSoft: '#FEF3C7',
    primarySoft: '#ECFDF5',
  },
  typography: {
    h1: { fontSize: 30, lineHeight: 36, fontWeight: '800' },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: '800' },
    h3: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
    bold: { fontWeight: '700' },
    regular: { fontWeight: '400' },
  },
  spacing: { sm: 8, md: 16, lg: 24, xl: 32 },
  radii: { sm: 10, md: 14, lg: 18, pill: 999 },
  shadows: {
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
  },
};

export default theme;
