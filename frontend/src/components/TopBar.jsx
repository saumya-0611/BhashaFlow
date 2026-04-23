import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './TopBar.css';

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isFlowPath = (path) =>
    path.startsWith('/verify/') || path.startsWith('/grievance-form/');

  const getFlowGrievanceId = () => {
    const match = location.pathname.match(/^\/(verify|grievance-form)\/([^/]+)/);
    return match ? match[2] : null;
  };

  const handleBreadcrumbClick = async (e, path) => {
    if (!isFlowPath(location.pathname) || isFlowPath(path)) return;

    e.preventDefault();
    const shouldLeave = window.confirm('If you leave now, your in-progress grievance will be deleted. Continue?');
    if (!shouldLeave) return;

    const grievanceId = getFlowGrievanceId();
    try {
      if (grievanceId) {
        await api.delete(`/api/grievance/${grievanceId}`);
      }
    } catch {
      // best effort
    }
    navigate(path);
  };
  
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
              <Link to={crumb.path} className="crumb link" onClick={(e) => handleBreadcrumbClick(e, crumb.path)}>{crumb.name}</Link>
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
