/**
 * AIAnalysis.jsx
 * Route: /ai-result/:id
 * Step 4 — shows AI results, government portals, nearby offices, procedure steps.
 *
 * Data arrives via location.state (set by GrievanceForm navigate call).
 * State shape (merged from /ingest + /submit responses):
 * {
 *   english_summary, category, priority, keywords, confidence_score,
 *   portal_links: { portal_name, portal_url, helpline } | null,
 *   nearby_offices: [{ name, lat, lng }],
 *   procedure_steps: ["Step 1…", "Step 2…"],
 *   expected_resolution_days: number
 * }
 */

import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import './AIAnalysis.css';

export default function AIAnalysis() {
  const { id }       = useParams();
  const location     = useLocation();
  const navigate     = useNavigate();

  const data = location.state || {};

  const {
    english_summary         = 'No summary generated yet.',
    category                = 'General',
    priority                = 'Normal',
    // FIX: backend returns portal_links as a single object {portal_name, portal_url, helpline}
    // Normalise to an array so the render loop works regardless
    portal_links            = null,
    nearby_offices          = [],
    procedure_steps         = [],
    expected_resolution_days,
    confidence_score,
  } = data;

  // FIX: normalise portal_links → always an array for the render loop
  const portalsArray = (() => {
    if (!portal_links) return [];
    if (Array.isArray(portal_links)) return portal_links;
    // Single object shape from backend: { portal_name, portal_url, helpline }
    return [{
      name: portal_links.portal_name,
      url:  portal_links.portal_url,
      desc: portal_links.helpline ? `Helpline: ${portal_links.helpline}` : '',
    }];
  })();

  return (
    <DashboardLayout>
      <div className="ai-page">

        {/* Header */}
        <section className="ai-header">
          <div className="ai-header-badge">
            <span className="material-symbols-outlined filled">psychology</span>
            <h1>AI Analysis Result</h1>
          </div>
          <p>
            Your grievance has been submitted and analysed. Here is the translated summary
            and next best actions mapped to nearby resources.
          </p>
        </section>

        {/* English Summary */}
        <blockquote className="ai-quote card">
          <span className="material-symbols-outlined quote-icon">format_quote</span>
          <p style={{ fontStyle: 'normal' }}>
            <strong>English Summary:</strong> {english_summary}
          </p>
        </blockquote>

        <div className="ai-grid">
          {/* Left Column */}
          <div className="ai-main">

            {/* Classification */}
            <section className="classification-section card">
              <h2>
                <span className="material-symbols-outlined">analytics</span>
                Classification
              </h2>
              <div className="class-grid">
                <div className="class-item">
                  <span className="class-label">Category</span>
                  <span className="class-value" style={{ textTransform: 'capitalize' }}>{category}</span>
                </div>
                <div className="class-item">
                  <span className="class-label">Predicted Priority</span>
                  <span className={`class-value ${
                    (priority?.toLowerCase() === 'high' || priority?.toLowerCase() === 'critical')
                      ? 'severity-high'
                      : ''
                  }`}>
                    {priority}
                  </span>
                </div>
                {confidence_score && (
                  <div className="class-item">
                    <span className="class-label">AI Confidence</span>
                    <span className="class-value">{Math.round(confidence_score * 100)}%</span>
                  </div>
                )}
                {expected_resolution_days && (
                  <div className="class-item">
                    <span className="class-label">Expected Resolution</span>
                    <span className="class-value">{expected_resolution_days} days</span>
                  </div>
                )}
              </div>
            </section>

            {/* Government Portals */}
            <section className="actions-section card">
              <h2>
                <span className="material-symbols-outlined">account_balance</span>
                Relevant Government Portals
              </h2>
              <div className="action-list">
                {portalsArray.length > 0 ? portalsArray.map((p, i) => (
                  <a
                    key={i}
                    href={p.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="action-card surface-low"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="action-info">
                      <span className="material-symbols-outlined action-icon">domain</span>
                      <div>
                        <strong>{p.name || p.portal_name || 'Portal'}</strong>
                        {p.desc && <p>{p.desc}</p>}
                      </div>
                    </div>
                    <span className="material-symbols-outlined">open_in_new</span>
                  </a>
                )) : (
                  <p style={{ color: 'var(--outline)', fontSize: 'var(--body-sm)' }}>
                    No specific portals matched for your state/category combination.
                  </p>
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
                  <p style={{ color: 'var(--outline)', fontSize: 'var(--body-sm)' }}>
                    No procedure steps available for this category/state.
                  </p>
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
              {/* FIX: nearby_offices from Nominatim = { name, lat, lng } */}
              {nearby_offices.length > 0 ? nearby_offices.map((office, idx) => (
                <div key={idx} className="contact-item" style={{ marginBottom: '16px' }}>
                  <span className="contact-label" style={{ fontWeight: 'bold' }}>
                    {office.name || office}
                  </span>
                  {office.lat && (
                    <a
                      href={`https://maps.google.com/?q=${office.lat},${office.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="contact-value"
                      style={{ fontSize: '13px' }}
                    >
                      View on Google Maps ↗
                    </a>
                  )}
                </div>
              )) : (
                <p style={{ fontSize: '14px', color: 'var(--outline)' }}>
                  No nearby offices found for your district.
                </p>
              )}
            </div>

            {/* Helpline (from portal_links) */}
            {portal_links?.helpline && (
              <div className="contact-card card surface-low">
                <h3>
                  <span className="material-symbols-outlined">call</span>
                  Helpline
                </h3>
                <a href={`tel:${portal_links.helpline}`} className="contact-value" style={{ fontSize: '20px', fontWeight: 700 }}>
                  {portal_links.helpline}
                </a>
                <p style={{ fontSize: '13px', color: 'var(--outline)', marginTop: '4px' }}>
                  {portal_links.portal_name}
                </p>
              </div>
            )}

            {/* Map Placeholder */}
            <div className="map-card card surface-low">
              <h3>Service Coverage Map</h3>
              <div className="map-placeholder">
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>map</span>
                <span>Interactive Map</span>
                <span style={{ fontSize: '12px', background: 'var(--surface-container-highest)', padding: '2px 8px', borderRadius: '4px' }}>
                  Coverage matching user region
                </span>
              </div>
            </div>

            {/* Eco badge */}
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