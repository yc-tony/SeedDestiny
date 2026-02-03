import { useAuth } from '../store/authStore';
import ResourceUpload from './ResourceUpload';
import MaterialUpload from './MaterialUpload';
import ResourceUpdate from './ResourceUpdate';
import MaterialUpdate from './MaterialUpdate';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">
          <h1>SeedDestiny Archangel</h1>
        </div>
        <div className="user-info">
          <span>歡迎, {user?.username}</span>
          <button onClick={logout} className="logout-btn">
            登出
          </button>
        </div>
      </header>

      <main className="main-content">
        <ResourceUpload />
        <MaterialUpload />
        <ResourceUpdate />
        <MaterialUpdate />
      </main>
    </div>
  );
}

export default Dashboard;
