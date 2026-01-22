import { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  SportsSoccer as SoccerIcon,
  EmojiEvents as TrophyIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  BarChart as ChartIcon,
  CardGiftcard as PrizeIcon,
  Gavel as RulesIcon,
  Assessment as StatsIcon,
  AdminPanelSettings as AdminIcon,
  Language as LanguageIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();

  if (!user) {
    return null; // Or redirect to login
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'My Prediction', icon: <SoccerIcon />, path: '/my-prediction' },
    { text: 'Standings - Individual', icon: <TrophyIcon />, path: '/standings/individual' },
    { text: 'Standings - Departments', icon: <PeopleIcon />, path: '/standings/departments' },
    { text: 'Matches', icon: <SoccerIcon />, path: '/matches' },
    { text: 'Groups', icon: <PeopleIcon />, path: '/groups' },
    { text: 'Statistics', icon: <ChartIcon />, path: '/statistics' },
    { text: 'Prizes', icon: <PrizeIcon />, path: '/prizes' },
    { text: 'Rules', icon: <RulesIcon />, path: '/rules' },
  ];

  if (user.isAdmin) {
    menuItems.push({ text: 'Admin Panel', icon: <AdminIcon />, path: '/admin' });
  }

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ backgroundColor: theme.palette.primary.main }}>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
          ⚽ WC 2026
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            World Cup 2026 Prediction Game
          </Typography>
          <IconButton color="inherit" onClick={handleUserMenuOpen}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
              {user.firstName[0]}{user.lastName[0]}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
          >
            <MenuItem disabled>
              <PersonIcon sx={{ mr: 1 }} />
              {user.firstName} {user.lastName}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleUserMenuClose}>
              <LanguageIcon sx={{ mr: 1 }} />
              Language: {user.languagePreference === 'en' ? 'English' : 'Nederlands'}
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        {children}
      </Box>
    </Box>
  );
}
