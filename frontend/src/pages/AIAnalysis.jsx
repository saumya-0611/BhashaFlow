import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import './AIAnalysis.css';

export default function AIAnalysis() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // If no state exists, the user refreshed, maybe back out or show loading if we wanted to fetch.
  // For now, if no state, we fallback to empty objects to not break UI, or we redirect to dashboard
  const data = location.state || {};
  const { 
    english_summary = 'No summary generated yet.', 
    category = 'General', 
    priority = 'Normal',
    portal_links = [],
    nearby_offices = [],
    procedure_steps = []
  } = data;

  return (
    <DashboardLayout>
      <div className="ai-page">
        {/* Header */}
        <section className="ai-header">
          <div className="ai-header-badge">
            <span className="material-symbols-outlined filled">psychology</span>
            <h1>AI Analysis Result</h1>
          </div>
          <p>Your grievance form has been submitted and analysed. Here is the translated summary and next best actions mapped to nearby resources.</p>
        </section>

        {/* Quoted Text (English Summary) */}
        <blockquote className="ai-quote card">
          <span className="material-symbols-outlined quote-icon">format_quote</span>
          <p style={{ fontStyle: 'normal' }}><strong>English Summary:</strong> {english_summary}</p>
        </blockquote>

        <div className="ai-grid">
          {/* Left Column */}
          <div className="ai-main">
            {/* Classification Grid */}
            <section className="classification-section card">
              <h2>
                <span className="material-symbols-outlined">analytics</span>
                Classification
              </h2>
              <div className="class-grid">
                <div className="class-item">
                  <span className="class-label">Category</span>
                  <span className="class-value">{category}</span>
                </div>
                <div className="class-item">
                  <span className="class-label">Predicted Priority</span>
                  <span className={`class-value ${(priority.toLowerCase() === 'high' || priority.toLowerCase() === 'critical') ? 'severity-high' : ''}`}>
                    {priority}
                  </span>
                </div>
              </div>
            </section>

            {/* Portal Links */}
            <section className="actions-section card">
              <h2>
                <span className="material-symbols-outlined">account_balance</span>
                Relevant Government Portals
              </h2>
              <div className="action-list">
                {portal_links.length > 0 ? portal_links.map((p, i) => (
                  <a key={i} href={p.url || '#'} target="_blank" rel="noreferrer" className="action-card surface-low" style={{ textDecoration: 'none' }}>
                    <div className="action-info">
                      <span className="material-symbols-outlined action-icon">domain</span>
                      <div>
                        <strong>{p.name || p.title || p}</strong>
                        {p.desc && <p>{p.desc}</p>}
                      </div>
                    </div>
                    <span className="material-symbols-outlined">open_in_new</span>
                  </a>
                )) : (
                  <p className="text-sm" style={{ color: 'var(--outline)' }}>No specific portals matched.</p>
                )}
              </div>
            </section>

            {/* Procedure Steps */}
            <section className="actions-section card">
              <h2>
                <span className="material-symbols-outlined">format_list_numbered</span>
                Procedure Guidelines
              </h2>
              <div style={{ marginLeft: '16px' }}>
                {procedure_steps.length > 0 ? (
                  <ol style={{ paddingLeft: '16px', lineHeight: '1.6' }}>
                    {procedure_steps.map((step, i) => (
                      <li key={i} style={{ marginBottom: '8px' }}>{step}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--outline)' }}>No standard procedure steps returned.</p>
                )}
              </div>
            </section>

            {/* CTA */}
            <div className="ai-cta">
              <p>Move forward with your application or keep a record for your files.</p>
              <div className="ai-cta-btns">
                <button className="btn btn-primary" onClick={() => alert('PDF generation coming soon!')}>
                  <span className="material-symbols-outlined">download</span>
                  Download PDF Summary
                </button>
                <Link to="/dashboard" className="btn btn-outline">
                  <span className="material-symbols-outlined">dashboard</span>
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <aside className="ai-aside">
            
            {/* Nearby Offices */}
            <div className="contact-card card surface-low">
              <h3>
                <span className="material-symbols-outlined">business</span>
                Nearby Offices
              </h3>
              {nearby_offices.length > 0 ? nearby_offices.map((office, idx) => (
                <div key={idx} className="contact-item" style={{ marginBottom: '16px' }}>
                  <span className="contact-label" style={{ fontWeight: 'bold' }}>{office.name || office}</span>
                  {office.address && <span className="contact-value" style={{ display: 'block', fontSize: '14px' }}>{office.address}</span>}
                  {office.phone && <a href={`tel:${office.phone}`} className="contact-value" style={{ display: 'block', fontSize: '14px', marginTop: '4px' }}>{office.phone}</a>}
                </div>
              )) : (
                <p style={{ fontSize: '14px', color: 'var(--outline)' }}>No nearby offices listed.</p>
              )}
            </div>

            {/* Map Placeholder */}
            <div className="map-card card surface-low">
              <h3>Service Coverage Map</h3>
              <div className="map-placeholder" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>map</span>
                <span>Interactive Map</span>
                <span style={{ fontSize: '12px', background: 'var(--surface-container-highest)', padding: '2px 8px', borderRadius: '4px' }}>
                  Coverage matching user region
                </span>
              </div>
            </div>

            {/* Case Metadata */}
            <div className="meta-card card surface-low">
              <h3>Case Metadata</h3>
              <div className="eco-badge">
                <span className="material-symbols-outlined" style={{ color: 'var(--emerald)', fontSize: 20 }}>eco</span>
                <div>
                  <span className="eco-label">Eco Impact</span>
                  <p>Digital filing saved approx. 120g of paper carbon.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
