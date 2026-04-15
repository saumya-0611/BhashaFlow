import { Link, useLocation } from 'react-router-dom';
import './TopBar.css';

export default function TopBar() {
  const location = useLocation();
  
  // Minimal breadcrumbs based on paths
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return [{ name: 'Dashboard' }];
    if (path.includes('submit')) return [{ name: 'Dashboard', path: '/dashboard' }, { name: 'Submit New' }];
    if (path.includes('admin')) return [{ name: 'Admin Portal' }];
    if (path.includes('grievance')) return [{ name: 'Dashboard', path: '/dashboard' }, { name: 'My Grievances', path: '/dashboard' }, { name: 'Detail' }];
    if (path.includes('ai-result')) return [{ name: 'Dashboard', path: '/dashboard' }, { name: 'AI Insights' }];
    return [];
  };

  const breadcrumbs = getBreadcrumbs();
  const userName = localStorage.getItem('userName') || 'Citizen';

  return (
    <header className="topbar glass">
      <div className="breadcrumbs">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.name} className="crumb-wrap">
            {i > 0 && <span className="material-symbols-outlined separator">chevron_right</span>}
            {crumb.path ? (
              <Link to={crumb.path} className="crumb link">{crumb.name}</Link>
            ) : (
              <span className="crumb current">{crumb.name}</span>
            )}
          </span>
        ))}
      </div>

      <div className="topbar-actions">
        <button className="icon-btn">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="user-profile">
          <div className="avatar">{userName.charAt(0).toUpperCase()}</div>
          <span className="username">{userName}</span>
        </div>
      </div>
    </header>
  );
}
