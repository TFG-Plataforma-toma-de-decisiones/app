import { createTheme } from '@mui/material/styles';

// Paleta de colores para el tema claro, inspirada en tus variables CSS.
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1aa28e', // Tono de --accent-color (#2dd4bf) ligeramente más oscuro para mejor contraste
    },
    secondary: {
      main: '#a855f7', // Morado para frontend
    },
    background: {
      default: '#f0f6fc', // Un fondo muy claro, casi blanco
      paper: '#ffffff',   // Fondo para tarjetas y modales
    },
    text: {
      primary: '#0d1117',   // Texto principal oscuro
      secondary: '#57606a', // Texto secundario más suave
    },
    divider: '#d0d7de',
    // Colores para los chips/badges
    warning: { main: '#fbbf24' }, // Dorado para Full Stack
    info: { main: '#60a5fa' },    // Azul para Library
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  },
  components: {
    MuiChip: { styleOverrides: { root: { borderRadius: '16px' } } }
  }
});

export default lightTheme;