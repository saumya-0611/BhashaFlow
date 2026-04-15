import DashboardLayout from '../components/DashboardLayout';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const stats = [
    { label: 'Pending Review', value: '1,284', desc: 'Needs immediate allocation to departments', icon: 'pending_actions', color: 'primary' },
    { label: 'Critical Priority', value: '42', desc: 'SLA breach risk in next 2 hours', icon: 'warning', color: 'error' },
    { label: 'Avg. Resolution Time', value: '18.5h', desc: 'Calculated across all language flows', icon: 'schedule', color: 'secondary' },
  ];

  const categories = [
    { name: 'Roads & Infrastructure', pct: 34, color: 'var(--primary-container)' },
    { name: 'Water Supply', pct: 22, color: 'var(--saffron)' },
    { name: 'Electricity', pct: 18, color: 'var(--emerald)' },
    { name: 'Sanitation', pct: 14, color: '#c084fc' },
    { name: 'Other', pct: 12, color: 'var(--outline)' },
  ];

  const urgentGrievances = [
    { id: 'GRV-8841', title: 'Road collapse at NH-48 junction', dept: 'Public Works', severity: 'Critical', time: '12 min ago', lang: 'Hindi' },
    { id: 'GRV-8839', title: 'Sewage overflow in residential zone', dept: 'Sanitation', severity: 'Critical', time: '28 min ago', lang: 'Kannada' },
    { id: 'GRV-8837', title: 'Power outage affecting 200+ homes', dept: 'Electricity', severity: 'High', time: '45 min ago', lang: 'Tamil' },
    { id: 'GRV-8835', title: 'Water contamination report', dept: 'Water Management', severity: 'High', time: '1 hour ago', lang: 'Telugu' },
  ];

  return (
    <DashboardLayout isAdmin>
      <div className="admin-page">
        {/* Header */}
        <section className="admin-header">
          <div>
            <h1>Administrative Dashboard</h1>
            <p className="admin-sub">Status Overview</p>
          </div>
          <div className="admin-header-badge">
            <span className="material-symbols-outlined">shield</span>
            <span>System Sovereignty</span>
          </div>
        </section>

        {/* Stats */}
        <section className="admin-stats">
          {stats.map(s => (
            <div key={s.label} className={`admin-stat-card card stat-${s.color}`}>
              <div className="admin-stat-top">
                <div className="admin-stat-icon-wrap">
                  <span className="material-symbols-outlined filled">{s.icon}</span>
                </div>
                <span className="admin-stat-label">{s.label}</span>
              </div>
              <span className="admin-stat-value">{s.value}</span>
              <p className="admin-stat-desc">{s.desc}</p>
            </div>
          ))}
        </section>

        <div className="admin-grid">
          {/* Categories */}
          <section className="categories-section card">
            <h2>
              <span className="material-symbols-outlined">pie_chart</span>
              Categories
            </h2>
            <div className="category-list">
              {categories.map(c => (
                <div key={c.name} className="category-item">
                  <div className="category-info">
                    <div className="category-dot" style={{ background: c.color }}></div>
                    <span className="category-name">{c.name}</span>
                  </div>
                  <div className="category-bar-wrap">
                    <div className="category-bar-bg">
                      <div className="category-bar-fill" style={{ width: `${c.pct}%`, background: c.color }}></div>
                    </div>
                    <span className="category-pct">{c.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Urgent */}
          <section className="urgent-section card">
            <h2>
              <span className="material-symbols-outlined">notification_important</span>
              Recent Urgent Grievances
            </h2>
            <div className="urgent-table">
              <div className="urgent-header-row">
                <span>ID</span>
                <span>Title</span>
                <span>Department</span>
                <span>Severity</span>
                <span>Language</span>
                <span>Time</span>
              </div>
              {urgentGrievances.map(g => (
                <div key={g.id} className="urgent-row">
                  <span className="urgent-id">{g.id}</span>
                  <span className="urgent-title">{g.title}</span>
                  <span className="urgent-dept">{g.dept}</span>
                  <span className={`chip ${g.severity === 'Critical' ? 'chip-error' : 'chip-warning'}`}>{g.severity}</span>
                  <span className="chip chip-primary">{g.lang}</span>
                  <span className="urgent-time">{g.time}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Operational Filters */}
        <section className="filters-section card">
          <h2>
            <span className="material-symbols-outlined">tune</span>
            Operational Filters
          </h2>
          <div className="filters-grid">
            <div className="field-group">
              <label className="input-label">Department</label>
              <select className="input-field">
                <option>All Departments</option>
                <option>Public Works</option>
                <option>Water Management</option>
                <option>Electricity</option>
                <option>Sanitation</option>
              </select>
            </div>
            <div className="field-group">
              <label className="input-label">Status</label>
              <select className="input-field">
                <option>All Statuses</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </div>
            <div className="field-group">
              <label className="input-label">Severity</label>
              <select className="input-field">
                <option>All Severities</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="field-group">
              <label className="input-label">Language</label>
              <select className="input-field">
                <option>All Languages</option>
                <option>Hindi</option>
                <option>Tamil</option>
                <option>Kannada</option>
                <option>Telugu</option>
                <option>Bengali</option>
              </select>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="page-footer">
          <p className="footer-tagline">© 2024 BhashaFlow Governance Initiative. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Policy & Ethics</a>
            <a href="#">API Documentation</a>
            <a href="#">Contact Support</a>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
}
