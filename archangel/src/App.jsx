import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/authStore';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ResourceLibrary from './components/ResourceLibrary';
import ResourceDetail from './components/ResourceDetail';
import LabelManagement from './components/LabelManagement';
import Navbar from './components/Navbar';
import './App.css';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Navbar />
      <div className="app-container">
        {children}
      </div>
    </>
  );
}

function AppContent() {
  const { token } = useAuth();

  return (
    <div className="App">
       <Routes>
         <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />

         <Route path="/" element={
           <ProtectedRoute>
             <ResourceLibrary />
           </ProtectedRoute>
         } />

         <Route path="/resource/:id" element={
           <ProtectedRoute>
             <ResourceDetail />
           </ProtectedRoute>
         } />

         {/* Fallback to Dashboard if needed or remove if replaced by Library */}
         <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
         } />

         <Route path="*" element={<Navigate to="/" replace />} />
       </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
ction App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
