import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './utils/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyPredictionPage from './pages/MyPredictionPage';
import StandingsIndividualPage from './pages/StandingsIndividualPage';
import { CircularProgress, Box } from '@mui/material';

// Placeholder pages (to be implemented)
const PlaceholderPage = ({ title }: { title: string }) => (
  <div>
    <h1>{title}</h1>
    <p>This page is coming soon...</p>
  </div>
);

// Protected routes component
const ProtectedRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/my-prediction" element={<MyPredictionPage />} />
        <Route path="/standings/individual" element={<StandingsIndividualPage />} />
        <Route path="/standings/departments" element={<PlaceholderPage title="Department Standings" />} />
        <Route path="/matches" element={<PlaceholderPage title="Matches" />} />
        <Route path="/groups" element={<PlaceholderPage title="Groups" />} />
        <Route path="/statistics" element={<PlaceholderPage title="Statistics" />} />
        <Route path="/prizes" element={<PlaceholderPage title="Prizes" />} />
        <Route path="/rules" element={<PlaceholderPage title="Rules" />} />
        <Route path="/admin" element={<PlaceholderPage title="Admin Panel" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes with layout */}
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
