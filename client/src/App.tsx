import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './utils/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import MyPredictionPage from './pages/MyPredictionPage';
import StandingsIndividualPage from './pages/StandingsIndividualPage';
import RulesPage from './pages/RulesPage';
import PrizesPage from './pages/PrizesPage';
import MatchesPage from './pages/MatchesPage';
import GroupsPage from './pages/GroupsPage';
import StatisticsPage from './pages/StatisticsPage';
import AdminPanel from './pages/AdminPanel';
import CountrySelectorPage from './pages/CountrySelectorPage';
import { CircularProgress, Box } from '@mui/material';
import { getEventCodeFromPath, isPublicEventRoute, stripEventPrefix, withEventPrefix } from './utils/eventRouting';
import { useEffect } from 'react';
import i18n, { normalizeLocaleToLanguage } from './i18n';
import { eventService } from './services/eventService';

// Protected routes component
const ProtectedRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const eventCode = getEventCodeFromPath();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={withEventPrefix(eventCode, '/login')} replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="my-prediction" element={<MyPredictionPage />} />
        <Route path="standings/individual" element={<StandingsIndividualPage />} />
        <Route path="matches" element={<MatchesPage />} />
        <Route path="groups" element={<GroupsPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="prizes" element={<PrizesPage />} />
        <Route path="rules" element={<RulesPage />} />
        <Route path="admin" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to={withEventPrefix(eventCode, '/')} replace />} />
      </Routes>
    </Layout>
  );
};

const isRootSelectorDomain = () => {
  const host = window.location.hostname.toLowerCase();
  return host === 'poules.kramp.com' || host === 'www.poules.kramp.com';
};

const RootRoute = () => {
  if (isRootSelectorDomain() || window.location.pathname === '/') {
    return <CountrySelectorPage />;
  }

  return <ProtectedRoutes />;
};

function App() {
  useEffect(() => {
    eventService.getCurrent()
      .then((response) => {
        if (response.mode === 'event' && response.event) {
          i18n.changeLanguage(normalizeLocaleToLanguage(response.event.defaultLocale));
        }
      })
      .catch(() => {
        // no-op
      });
  }, []);

  const EventAppRouter = () => {
    const eventCode = getEventCodeFromPath();
    if (!eventCode) return <Navigate to="/" replace />;

    const appPath = stripEventPrefix(window.location.pathname);
    if (isPublicEventRoute(appPath)) {
      if (appPath === '/login') return <LoginPage />;
      if (appPath === '/register') return <RegisterPage />;
      if (appPath === '/verify-email') return <VerifyEmailPage />;
    }

    return <ProtectedRoutes />;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<RootRoute />} />

            {/* Event-scoped routes (path-based) */}
            <Route path="/:eventCode/*" element={<EventAppRouter />} />

            {/* Backward compatibility for non-prefixed routes */}
            <Route path="/login" element={<Navigate to="/internal/login" replace />} />
            <Route path="/register" element={<Navigate to="/internal/register" replace />} />
            <Route path="/verify-email" element={<Navigate to="/internal/verify-email" replace />} />
            <Route path="/*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
