import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { APIKeyProvider } from './context/APIKeyContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import GeminiChat from './components/GeminiChat';

function AppRoutes() {
  const location = useLocation();
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      {!['/', '/login', '/signup'].includes(location.pathname) && <GeminiChat />}
    </>
  );
}

function App() {
  return (
    <APIKeyProvider>
      <Router>
        <AppRoutes />
      </Router>
    </APIKeyProvider>
  );
}

export default App;