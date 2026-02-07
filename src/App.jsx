import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PropertyEditor from './pages/PropertyEditor';
import GuestView from './pages/GuestView';
import PrintView from './pages/PrintView';
import GuidePdfView from './pages/GuidePdfView';
import OfflineIndicator from './components/OfflineIndicator';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';

function Protected({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite">
        <div className="animate-pulse text-sage font-serif">Loading session...</div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <OfflineIndicator />
        <PWAUpdatePrompt />
        <Router>
          <Routes>
          {/* Public Guest Route */}
          <Route path="/g/:slug" element={<GuestView />} />
          
          {/* Owner Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <Protected>
                  <Dashboard />
                </Protected>
              } 
            />
            <Route 
              path="/dashboard/property/:id" 
              element={
                <Protected>
                  <PropertyEditor />
                </Protected>
              } 
            />
            <Route
              path="/dashboard/property/:id/print"
              element={
                <Protected>
                  <PrintView />
                </Protected>
              }
            />
            <Route
              path="/dashboard/property/:id/pdf"
              element={
                <Protected>
                  <GuidePdfView />
                </Protected>
              }
            />
          </Route>

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}