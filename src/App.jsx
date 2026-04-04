import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/shared/Navbar';
import Landing  from './pages/Landing';
import SignIn   from './pages/SignIn';
import Upload   from './pages/Upload';
import Analysis from './pages/Analysis';
import Dashboard from './pages/Dashboard';

/* Protected wrapper — redirects to /signin if not authed */
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }
  return user ? children : <Navigate to="/signin" replace />;
}

function AppInner() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Routes>
          {/* Public */}
          <Route path="/"       element={<Landing />} />
          <Route path="/signin" element={user ? <Navigate to="/dashboard" replace /> : <SignIn />} />

          {/* Protected */}
          <Route path="/upload"   element={<Protected><Upload /></Protected>} />
          <Route path="/analysis" element={<Protected><Analysis /></Protected>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppInner />
      </Router>
    </AuthProvider>
  );
}
