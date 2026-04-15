import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Citizen';

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/auth');
  }, [navigate]);

  // Demo data matching the Stitch design
  const stats = [
    { label: 'Total Grievances', value: '24', icon: 'description', color: 'primary' },
    { label: 'In Progress', value: '08', icon: 'pending', color: 'secondary' },
    { label: 'Resolved', value: '16', icon: 'check_circle', color: 'success' },
  ];

  const grievances = [
    { id: 1, title: 'Pothole near Residency Road', dept: 'Public Works', status: 'In Progress', date: '2 days ago', severity: 'High' },
    { id: 2, title: 'Street Light Faulty - Zone 4', dept: 'Electricity Board', status: 'In Progress', date: '3 days ago', severity: 'Medium' },
    { id: 3, title: 'Water Supply Disruption', dept: 'Water Management', status: 'Resolved', date: '5 days ago', severity: 'High' },
    { id: 4, title: 'Waste Collection Delay', dept: 'Sanitation', status: 'Resolved', date: '1 week ago', severity: 'Low' },
  ];

  return (
    <DashboardLayout>
      {/* Hero Greeting */}
      <section className="dash-hero">
        <div>
          <h1 className="dash-welcome">
            Welcome back, <span className="name-highlight">{userName}.</span>
          </h1>
          <p className="dash-sub">Your voice matters. Monitoring your civic contributions and concerns.</p>
        </div>
        <Link to="/submit" className="btn btn-primary">
          <span className="material-symbols-outlined">add</span>
          File New Grievance
        </Link>
      </section>

      {/* Stat Cards */}
      <section className="dash-stats">
        {stats.map(s => (
          <div key={s.label} className={`stat-card card stat-${s.color}`}>
            <div className="stat-icon-wrap">
              <span className="material-symbols-outlined filled">{s.icon}</span>
            </div>
            <span className="stat-label">{s.label}</span>
            <span className="stat-value">{s.value}</span>
          </div>
        ))}
      </section>

      {/* Main Grid */}
      <div className="dash-grid">
        {/* Left: Recent Grievances */}
        <section className="dash-section">
          <div className="section-header">
            <h2>Recent My Grievances</h2>
            <Link to="#" className="btn btn-tertiary">View All</Link>
          </div>
          <div className="grievance-list">
            {grievances.map(g => (
              <Link to={`/grievance/${g.id}`} key={g.id} className="grievance-card card">
                <div className="grievance-card-top">
                  <h3 className="grievance-title">{g.title}</h3>
                  <span className={`chip ${g.status === 'Resolved' ? 'chip-success' : 'chip-warning'}`}>
                    {g.status}
                  </span>
                </div>
                <div className="grievance-card-bottom">
                  <span className="grievance-dept">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>account_balance</span>
                    Department: {g.dept}
                  </span>
                  <span className="grievance-date">{g.date}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Right: Insights & Guidance */}
        <aside className="dash-aside">
          <div className="insight-card card surface-low">
            <div className="insight-header">
              <span className="material-symbols-outlined filled" style={{ color: 'var(--saffron)' }}>psychology</span>
              <h3>AI Powered Insights</h3>
            </div>
            <p>
              Based on your history, the <strong>Electricity Board</strong> typically resolves issues in your area within <strong>3 days</strong>. Your pending street light grievance is expected to be resolved by tomorrow.
            </p>
          </div>

          <div className="guidance-card card surface-low">
            <div className="insight-header">
              <span className="material-symbols-outlined filled" style={{ color: 'var(--emerald)' }}>menu_book</span>
              <h3>Need Guidance?</h3>
            </div>
            <p>Access the official BhashaFlow handbook for step-by-step grievance filing.</p>
            <button className="btn btn-outline" style={{ marginTop: 'var(--space-4)' }}>
              <span className="material-symbols-outlined">open_in_new</span>
              View Handbook
            </button>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="page-footer">
        <div className="footer-brand">BhashaFlow</div>
        <p className="footer-tagline">Empowering citizens through transparent governance.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Support</a>
        </div>
      </footer>
    </DashboardLayout>
  );
}