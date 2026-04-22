/**
 * AIAnalysis.jsx
 * Route: /ai-result/:id  —  Step 4
 *
 * FIX: No longer depends exclusively on location.state.
 * If state is missing (refresh / direct URL), fetches from GET /api/grievance/:id.
 * Consistent field names: category, priority only (no llm_category fallback).
 * Added loading and error states.
 */

import { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import './AIAnalysis.css';

export default function AIAnalysis() {
  const { id }    = useParams();
  const location  = useLocation();

  const [data, setData]       = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError]     = useState('');

  // ── Fallback fetch if no state (refresh / direct URL) ─────────
  useEffect(() => {
    if (location.state) return;

    const fetchData = async () => {
      try {
        const res = await api.get(`/api/grievance/${id}`);
        const { grievance, ai_analysis } = res.data;

        // Reconstruct the shape GrievanceForm.navigate() would have passed
        setData({
          english_summary:          ai_analysis?.english_summary || grievance.title || '',
          category:                 grievance.category || 'other',
          priority:                 grievance.priority || 'medium',
          keywords:                 ai_analysis?.keywords || [],
          confidence_score:         ai_analysis?.confidence_score,
          detected_language:        ai_analysis?.detected_language || grievance.original_language || 'en-IN',
          portal_links:             grievance.portal_links || null,
          nearby_offices:           grievance.nearby_offices || [],
          procedure_steps:          grievance.procedure_steps || [],
          expected_resolution_days: grievance.expected_resolution_days || null,
        });
      } catch (err) {
        setError('Could not load grievance analysis. Please try again from the dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, location.state]);

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <motion.div
              style={{ width: 40, height: 40, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px' }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
            />
            <p style={{ color: 'var(--on-surface-variant)' }}>Loading AI analysis…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Error ─────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="card" style={{ padding: '32px', textAlign: 'center', maxWidth: 400 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--error)' }}>error</span>
            <p style={{ margin: '16px 0 24px' }}>{error || 'Analysis data not available.'}</p>
            <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Destructure — use ONLY category/priority (no llm_* fallbacks) ──
  const {
    english_summary          = '',
    category                 = 'other',
    priority                 = 'medium',
    portal_links             = null,
    nearby_offices           = [],
    procedure_steps          = [],
    expected_resolution_days = null,
    confidence_score,
  } = data;

  // Normalise portal_links → always an array for the render loop
  const portalsArray = (() => {
    if (!portal_links) return [];
    if (Array.isArray(portal_links)) {
      return portal_links.map(p => ({
        name: p.portal_name || p.name,
        url:  p.portal_url || p.url,
        desc: p.helpline ? `Helpline: ${p.helpline}` : (p.desc || ''),
      }));
    }
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
        {english_summary ? (
          <blockquote className="ai-quote card">
            <span className="material-symbols-outlined quote-icon">format_quote</span>
            <p style={{ fontStyle: 'normal' }}>
              <strong>English Summary:</strong> {english_summary}
            </p>
          </blockquote>
        ) : (
          <div className="card" style={{ padding: '16px', marginBottom: '24px', color: 'var(--outline)' }}>
            AI summary not available for this grievance.
          </div>
        )}

        <div className="ai-grid">
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
                      ? 'severity-high' : ''
                  }`}>
                    {priority}
                  </span>
                </div>
                {confidence_score != null && (
                  <div className="class-item">
                    <span className="class-label">AI Confidence</span>
                    <span className="class-value">{Math.round(confidence_score * 100)}%</span>
                  </div>
                )}
                {expected_resolution_days != null && (
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
                    {location.state
                      ? 'No specific portals matched for your state/category combination.'
                      : 'No persisted portal data is available for this grievance.'}
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
                    {location.state
                      ? 'No procedure steps available for this category/state.'
                      : 'No persisted procedure steps are available for this grievance.'}
                  </p>
                )}
              </div>
            </section>

            {/* CTA */}
            <div className="ai-cta">
              <p>Move forward with your application or keep a record for your files.</p>
              <div className="ai-cta-btns">
                <button className="btn btn-primary" onClick={() => window.print()}>
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

          {/* Right aside */}
          <aside className="ai-aside">

            {/* Nearby Offices */}
            <div className="contact-card card surface-low">
              <h3>
                <span className="material-symbols-outlined">business</span>
                Nearby Offices
              </h3>
              {nearby_offices.length > 0 ? nearby_offices.map((office, idx) => (
                <div key={idx} className="contact-item" style={{ marginBottom: '16px' }}>
                  <span className="contact-label" style={{ fontWeight: 'bold' }}>
                    {office.name || office}
                  </span>
                  {office.lat && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${office.lat},${office.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="contact-value"
                    >
                      View on Google Maps ↗
                    </a>
                  )}
                </div>
              )) : (
                <p style={{ fontSize: '14px', color: 'var(--outline)' }}>
                  {location.state
                    ? 'No nearby offices found for your district.'
                    : 'No persisted nearby offices are available for this grievance.'}
                </p>
              )}
            </div>

            {/* Helpline */}
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
