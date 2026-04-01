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
  shape: {
    borderRadius: 2, // Kramp uses very slight border radius (sharp look)
  },
  typography: {
    fontFamily: '"Source Sans 3", "Open Sans", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#212121', // Use dark text for headers, red only for specific highlights
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#212121',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#212121',
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
          borderRadius: 2, // Sharper corners
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#9B1915',
          '&:hover': {
            backgroundColor: '#7A1411', // Darker on hover
          },
        },
        containedSecondary: {
          backgroundColor: '#666666', 
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#4D4D4D',
          },
        },
        outlined: {
          borderWidth: 1, // Kramp uses 1px borders
          borderColor: '#E0E0E0',
          color: '#212121',
          '&:hover': {
            borderWidth: 1,
            backgroundColor: '#F5F5F5',
            borderColor: '#CCCCCC',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          border: '1px solid #E0E0E0',
          boxShadow: 'none', // Removed shadow for catalog look
          '&:hover': {
            borderColor: '#9B1915', // Subtle red highlight on hover (optional)
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: '1px solid #E0E0E0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#212121',
          boxShadow: 'none',
          borderBottom: '1px solid #E0E0E0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          color: '#212121',
          borderRight: '1px solid #E0E0E0',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F5F5F5',
          '& .MuiTableCell-head': {
            fontWeight: 700,
            color: '#212121',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E0E0E0',
          padding: '12px 16px',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Squared progress bars
          height: 4,
        },
        colorPrimary: {
          backgroundColor: '#F5F5F5',
        },
        barColorPrimary: {
          backgroundColor: '#9B1915',
        },
      },
    },
  },
});
