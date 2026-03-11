import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2dd4bf', // Un cyan vibrante que resalta perfecto en fondos oscuros
    },
    secondary: {
      main: '#c084fc', // Un morado un poco más claro para mejor legibilidad
    },
    background: {
      default: '#0d1117', // Fondo principal (estilo GitHub Dark)
      paper: '#161b22',   // Un gris muy oscuro para separar las tarjetas/cajas del fondo
    },
    text: {
      primary: '#c9d1d9',   // Blanco suave, no puro (cansa menos la vista)
      secondary: '#8b949e', // Gris para subtítulos
    },
    divider: '#30363d', // Color de las líneas separadoras y bordes
    warning: { main: '#fbbf24' },
    info: { main: '#60a5fa' },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  },
  
  // ==========================================================
  // ESTILOS GLOBALES DE COMPONENTES (Para mantener tu código limpio)
  // ==========================================================
  components: {
    
    // 1. BARRA DE NAVEGACIÓN (Navbar)
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0d1117', // Mismo fondo que la app
          backgroundImage: 'none',    // MUI le pone un degradado por defecto en dark mode, se lo quitamos
          borderBottom: '1px solid #30363d', // Una línea sutil debajo
          boxShadow: 'none',          // Quitamos la sombra anticuada
        },
      },
    },

    // 2. TARJETAS (Cards para los grid de proyectos)
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#161b22',
          backgroundImage: 'none',
          borderRadius: '12px',
          border: '1px solid #30363d', // En dark mode los bordes sutiles quedan mejor que las sombras
          boxShadow: 'none',
          transition: 'transform 0.2s ease-in-out, border-color 0.2s',
          // Un pequeño efecto hover si quieres que resalten al pasar el ratón
          '&:hover': {
            borderColor: '#58a6ff', // Borde azul al hacer hover
            transform: 'translateY(-4px)',
          },
        },
      },
    },

    // 3. CAJAS PARA FORMULARIOS Y MODALES (Paper y Dialog)
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Limpiamos estilos por defecto de MUI
        },
        // Estilo específico para los bordes redondeados (ideal para cajas de login)
        rounded: {
          borderRadius: '16px',
          border: '1px solid #30363d',
        }
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#161b22',
          borderRadius: '16px',
          border: '1px solid #30363d',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)', // Sombra profunda para que el modal flote
        },
      },
    },

    // 4. ETIQUETAS (Chips/Badges)
    MuiChip: {
      styleOverrides: {
        root: { 
          borderRadius: '16px',
        },
        outlined: {
          borderColor: '#30363d',
          backgroundColor: '#0d1117',
        }
      }
    },
    
    // 5. BOTONES Y CAMPOS DE TEXTO (Opcional pero recomendado)
    // Dentro de tu darkTheme.js, en la sección "components":
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none', 
          borderRadius: '20px', // Todos los botones serán redondeados
          
          // ¡Aquí está la magia! Le decimos a MUI cómo estilizar la clase .active globalmente
          '&.active': {
            color: theme.palette.primary.main,
            fontWeight: 'bold',
          },
        }),
        // Estilo por defecto para los botones de texto (como los del Navbar)
        text: ({ theme }) => ({
          color: theme.palette.text.secondary, // Gris suave por defecto
          '&:hover': {
            color: theme.palette.text.primary, // Se ilumina al pasar el ratón
          }
        })
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Campos de formulario un poco más redondeados
        }
      }
    }
  },
});

export default darkTheme;