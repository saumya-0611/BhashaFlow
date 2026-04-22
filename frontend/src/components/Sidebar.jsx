import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGrievanceFlow } from '../context/GrievanceFlowContext';
import LeaveFlowModal from './LeaveFlowModal';
import api from '../utils/api';
import './Sidebar.css';

export default function Sidebar({ isAdmin = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isInFlow, activeGrievanceId, exitFlow } = useGrievanceFlow();

  const [showModal, setShowModal] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Check if a path is part of the grievance flow
  const isFlowPath = (path) => {
    return path.startsWith('/verify/') ||
           path.startsWith('/grievance-form/') ||
           path.startsWith('/review/') ||
           path === '/submit';
  };

  const handleNavClick = (e, path) => {
    // If we are in a flow and clicking to a non-flow destination, intercept
    if (isInFlow && !isFlowPath(path)) {
      e.preventDefault();
      setPendingPath(path);
      setShowModal(true);
    }
  };

  const handleStay = () => {
    setShowModal(false);
    setPendingPath(null);
  };

  const handleLeave = async () => {
    setDeleting(true);
    try {
      if (activeGrievanceId) {
        await api.delete(`/api/grievance/${activeGrievanceId}`);
      }
    } catch {
      // Best effort — proceed even if delete fails
    }
    exitFlow();
    setDeleting(false);
    setShowModal(false);
    navigate(pendingPath || '/dashboard');
    setPendingPath(null);
  };

  const handleLogout = () => {
    if (isInFlow) {
      setPendingPath('__logout__');
      setShowModal(true);
      return;
    }
    doLogout();
  };

  const doLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    window.location.href = '/auth';
  };

  const handleLeaveLogout = async () => {
    setDeleting(true);
    try {
      if (activeGrievanceId) {
        await api.delete(`/api/grievance/${activeGrievanceId}`);
      }
    } catch { /* best effort */ }
    exitFlow();
    setDeleting(false);
    setShowModal(false);
    doLogout();
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

  return (
    <>
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
            <Link
              key={link.name}
              to={link.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, link.path)}
            >
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

      <LeaveFlowModal
        open={showModal}
        onStay={handleStay}
        onLeave={pendingPath === '__logout__' ? handleLeaveLogout : handleLeave}
        loading={deleting}
      />
    </>
  );
}