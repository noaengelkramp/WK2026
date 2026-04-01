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
  HomeOutlined as HomeIcon,
  SportsSoccerOutlined as SoccerIcon,
  EmojiEventsOutlined as TrophyIcon,
  PersonOutline as PersonIcon,
  PeopleOutlined as PeopleIcon,
  BarChartOutlined as ChartIcon,
  CardGiftcardOutlined as PrizeIcon,
  GavelOutlined as RulesIcon,
  AdminPanelSettingsOutlined as AdminIcon,
  LanguageOutlined as LanguageIcon,
  LogoutOutlined as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getEventCodeFromPath, withEventPrefix } from '../../utils/eventRouting';
import { useTranslation } from 'react-i18next';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

// Available languages (European languages for World Cup 2026)
const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'de', name: 'Deutsch' },
];

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
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

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null);
  };

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);
    i18n.changeLanguage(langCode);
    handleLanguageMenuClose();
    handleUserMenuClose();
    // TODO: In production, this would call an API to update user preference
    // and reload the app with translated content
    console.log(`Language changed to: ${langCode}`);
  };

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  const menuItems = [
    { text: t('nav.home'), icon: <HomeIcon />, path: '/' },
    { text: t('nav.myPrediction'), icon: <SoccerIcon />, path: '/my-prediction' },
    { text: t('nav.standings'), icon: <TrophyIcon />, path: '/standings/individual' },
    { text: t('nav.matches'), icon: <SoccerIcon />, path: '/matches' },
    { text: t('nav.groups'), icon: <PeopleIcon />, path: '/groups' },
    { text: t('nav.statistics'), icon: <ChartIcon />, path: '/statistics' },
    { text: t('nav.prizes'), icon: <PrizeIcon />, path: '/prizes' },
    { text: t('nav.rules'), icon: <RulesIcon />, path: '/rules' },
  ];

  const eventCode = getEventCodeFromPath();
  const eventPath = (path: string) => withEventPrefix(eventCode, path);

  if (user.isAdmin || user.role === 'event_admin' || user.role === 'platform_admin') {
    menuItems.push({ text: t('nav.admin'), icon: <AdminIcon />, path: '/admin' });
  }

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate(eventPath('/login'));
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ backgroundColor: theme.palette.primary.main, display: 'flex', justifyContent: 'center', py: 2 }}>
        <Box
          component="img"
          src="/assets/kramp-logo-white.svg"
          alt="Kramp - It's That Easy"
          sx={{
            height: 40,
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
          }}
        />
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
               selected={location.pathname === eventPath(item.path)}
               onClick={() => {
                 navigate(eventPath(item.path));
                 if (isMobile) setMobileOpen(false);
               }}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#F5E5E4', // Light red tint for selected
                  '& .MuiListItemIcon-root': {
                    color: '#9B1915',
                  },
                },
                '& .MuiListItemIcon-root': {
                  color: '#666666',
                },
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
              {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
          >
            <MenuItem disabled>
              <PersonIcon sx={{ mr: 1 }} />
              {user.username || user.email}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLanguageMenuOpen}>
              <LanguageIcon sx={{ mr: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{currentLanguage.name}</span>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              {t('nav.logout')}
            </MenuItem>
          </Menu>

          {/* Language Selection Submenu */}
          <Menu
            anchorEl={languageMenuAnchor}
            open={Boolean(languageMenuAnchor)}
            onClose={handleLanguageMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem disabled sx={{ opacity: 1, fontWeight: 'bold' }}>
              <LanguageIcon sx={{ mr: 1 }} />
              {t('nav.selectLanguage')}
            </MenuItem>
            <Divider />
            {languages.map((lang) => (
              <MenuItem
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                selected={lang.code === selectedLanguage}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#F5E5E4',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                  <Typography>{lang.name}</Typography>
                </Box>
              </MenuItem>
            ))}
            <Divider sx={{ mt: 1 }} />
            <MenuItem disabled sx={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
              💡 More languages coming soon
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
