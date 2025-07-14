import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LeaderDashboard from './pages/LeaderDashboard.jsx'
import BossDashboard from './pages/BossDashboard.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Navigate to="/auth" />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/leader" element={
              <ProtectedRoute>
                <LeaderDashboard />
              </ProtectedRoute>
            } />
            <Route path="/boss" element={
              <ProtectedRoute>
                <BossDashboard />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;