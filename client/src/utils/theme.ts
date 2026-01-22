import { createTheme } from '@mui/material/styles';

// Kramp Brand Colors (from Kramp Brand Guide)
export const theme = createTheme({
  palette: {
    primary: {
      main: '#9B1915', // Kramp Red - Primary brand color
      light: '#C42420',
      dark: '#7A1411',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#194461', // Kramp Blue - Secondary brand color
      light: '#2A5F7F',
      dark: '#0F2F42',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#4CAF50', // Green for success states
      light: '#81C784',
      dark: '#388E3C',
    },
    warning: {
      main: '#FF9800', // Orange-yellow for warnings
      light: '#FFB74D',
      dark: '#F57C00',
    },
    error: {
      main: '#D32F2F', // Red for errors
      light: '#EF5350',
      dark: '#C62828',
    },
    info: {
      main: '#0288D1', // Light blue for info
      light: '#03A9F4',
      dark: '#01579B',
    },
    background: {
      default: '#F5F5F5', // Light grey background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121', // Dark grey for primary text
      secondary: '#666666', // Medium grey for secondary text
    },
    divider: '#E0E0E0',
  },
  typography: {
    fontFamily: '"Roboto", "Open Sans", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#9B1915', // Kramp Red
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#9B1915',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#194461', // Kramp Blue
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#212121',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#212121',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#212121',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
        containedPrimary: {
          backgroundColor: '#9B1915',
          '&:hover': {
            backgroundColor: '#C42420',
          },
        },
        containedSecondary: {
          backgroundColor: '#194461',
          '&:hover': {
            backgroundColor: '#2A5F7F',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
        colorPrimary: {
          backgroundColor: '#9B1915',
          color: '#FFFFFF',
        },
        colorSecondary: {
          backgroundColor: '#194461',
          color: '#FFFFFF',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#9B1915',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#194461',
          color: '#FFFFFF',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F5F5F5',
          '& .MuiTableCell-head': {
            fontWeight: 700,
            color: '#9B1915',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E0E0E0',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
        },
        colorPrimary: {
          backgroundColor: '#F5E5E4', // Light red tint
        },
        barColorPrimary: {
          backgroundColor: '#9B1915', // Kramp Red
        },
      },
    },
  },
});
