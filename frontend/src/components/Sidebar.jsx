import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Sidebar.css';

export default function Sidebar({ isAdmin = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isFlowPath = (path) =>
    path.startsWith('/verify/') || path.startsWith('/grievance-form/');

  const getFlowGrievanceId = () => {
    const match = location.pathname.match(/^\/(verify|grievance-form)\/([^/]+)/);
    return match ? match[2] : null;
  };

  const handleNavClick = async (e, path) => {
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

  const citizenLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Submit New', path: '/submit',    icon: 'add_circle' },
    // FIX: removed /ai-result/demo — that route requires a real grievance ID
    // AI Insights are accessible via Dashboard → grievance card → detail
  ];

  const adminLinks = [
    { name: 'Overview',        path: '/admin',             icon: 'dashboard'    },
    { name: 'All Grievances',  path: '/admin/grievances',  icon: 'description'  },
    { name: 'AI Insights',     path: '/admin/ai-insights', icon: 'psychology'   },
  ];

  const commonLinks = [
    { name: 'Help',     path: '/help',     icon: 'help'     },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ];

  const links = isAdmin ? adminLinks : citizenLinks;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    window.location.href = '/auth';
  };

  return (
    <aside className="sidebar surface-highest">
      {/* Brand */}
      <div className="sidebar-brand">
        <h2>BhashaFlow</h2>
        <span className="subtitle">{isAdmin ? 'Admin Portal' : 'Citizen Portal'}</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {links.map((link) => {
          const isActive =
            location.pathname === link.path ||
            (location.pathname.startsWith(link.path) &&
              link.path !== '/dashboard' &&
              link.path !== '/admin');
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, link.path)}
            >
              <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>
                {link.icon}
              </span>
              {link.name}
            </Link>
          );
        })}

        <div className="nav-divider"></div>

        {commonLinks.map((link) => (
          <Link key={link.name} to={link.path} className="nav-item" onClick={(e) => handleNavClick(e, link.path)}>
            <span className="material-symbols-outlined">{link.icon}</span>
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Bottom Area */}
      <div className="sidebar-bottom">
        {isAdmin && (
          <div className="operational-health card surface-lowest ghost-border">
            <span className="health-title">Operational Health</span>
            <div className="health-bar-bg">
              <div className="health-bar-fill" style={{ width: '88%' }}></div>
            </div>
            <span className="health-value">88% Capacity utilized</span>
          </div>
        )}
        <button onClick={handleLogout} className="nav-item logout-btn">
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}