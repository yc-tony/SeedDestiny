import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">SeedDestiny Admin</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/" className="navbar-item">3D Resource Library</Link>
        <Link to="/labels" className="navbar-item">Label Management</Link>
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
