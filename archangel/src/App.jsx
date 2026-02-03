import { AuthProvider } from './store/authStore';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { useAuth } from './store/authStore';
import './App.css';

function AppContent() {
  const { token } = useAuth();

  return (
    <div className="App">
      {!token ? <Login /> : <Dashboard />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
