import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authStore';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">SeedDestiny Admin</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/" className={`navbar-item ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}>
          3D Resource Library
        </Link>
        <Link to="/labels" className={`navbar-item ${isActive('/labels') ? 'active' : ''}`}>
          Label Management
        </Link>
        {/* Future expansion items can go here */}
      </div>
      <div className="navbar-end">
        <span className="navbar-item">Welcome, {user?.username}</span>
        <button onClick={handleLogout} className="logout-btn-small">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
