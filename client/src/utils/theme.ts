import { createTheme } from '@mui/material/styles';

// Kramp Brand Colors (from Kramp Brand Guide)
export const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6600', // Kramp Orange - Primary brand color
      light: '#FF8533',
      dark: '#CC5200',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#003D6D', // Kramp Dark Blue - Professional, trustworthy
      light: '#0056A0',
      dark: '#002347',
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
      default: '#F8F9FA', // Light gray background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121', // Dark gray for primary text
      secondary: '#666666', // Medium gray for secondary text
    },
    divider: '#E0E0E0',
  },
  typography: {
    fontFamily: '"Roboto", "Open Sans", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#003D6D', // Kramp Dark Blue
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#003D6D',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#003D6D',
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
          backgroundColor: '#FF6600',
          '&:hover': {
            backgroundColor: '#FF8533',
          },
        },
        containedSecondary: {
          backgroundColor: '#003D6D',
          '&:hover': {
            backgroundColor: '#0056A0',
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
          backgroundColor: '#FF6600',
          color: '#FFFFFF',
        },
        colorSecondary: {
          backgroundColor: '#003D6D',
          color: '#FFFFFF',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#003D6D',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#003D6D',
          color: '#FFFFFF',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F8F9FA',
          '& .MuiTableCell-head': {
            fontWeight: 700,
            color: '#003D6D',
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
          backgroundColor: '#FFE5CC', // Light orange
        },
        barColorPrimary: {
          backgroundColor: '#FF6600', // Kramp Orange
        },
      },
    },
  },
});
