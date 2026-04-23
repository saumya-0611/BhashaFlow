import { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { useGrievanceFlow } from '../context/GrievanceFlowContext';
import api from '../utils/api';
import './AIAnalysis.css';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: [0.4, 0, 0.2, 1] }
  }),
};

export default function AIAnalysis() {
  const { id }       = useParams();
  const location     = useLocation();
  const { exitFlow } = useGrievanceFlow();

  useEffect(() => { exitFlow(); }, [exitFlow]);

  const [data, setData]       = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (location.state) return;
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/grievance/${id}`);
        const { grievance, ai_analysis } = res.data;
        setData({
          english_summary:          ai_analysis?.english_summary || grievance.title || '',
          category:                 grievance.category || 'other',
          keywords:                 ai_analysis?.keywords || [],
          confidence_score:         ai_analysis?.confidence_score,
          detected_language:        ai_analysis?.detected_language || grievance.original_language || 'en-IN',
          portal_links:             grievance.portal_links || null,
          nearby_offices:           grievance.nearby_offices || [],
          procedure_steps:          grievance.procedure_steps || [],
          expected_resolution_days: grievance.expected_resolution_days || null,
        });
      } catch {
        setError('Could not load grievance analysis. Please try again from the dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, location.state]);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <motion.div
              style={{ width: 44, height: 44, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px' }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
            />
            <p style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>Loading AI analysis…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ padding: '32px', textAlign: 'center', maxWidth: 400 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 44, color: 'var(--error)', display: 'block', marginBottom: 16 }}>error</span>
            <p style={{ marginBottom: 24, color: 'var(--on-surface-variant)' }}>{error || 'Analysis data not available.'}</p>
            <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const {
    english_summary          = '',
    category                 = 'other',
    portal_links             = null,
    nearby_offices           = [],
    procedure_steps          = [],
    expected_resolution_days = null,
    confidence_score,
  } = data;

  const portalsArray = (() => {
    if (!portal_links) return [];
    if (Array.isArray(portal_links)) return portal_links.map(p => ({
      name: p.portal_name || p.name,
      url:  p.portal_url  || p.url,
      desc: p.helpline ? `Helpline: ${p.helpline}` : (p.desc || ''),
    }));
    return [{ name: portal_links.portal_name, url: portal_links.portal_url, desc: portal_links.helpline ? `Helpline: ${portal_links.helpline}` : '' }];
  })();

  return (
    <DashboardLayout>
      <div className="ai-page">

        {/* Success banner */}
        <motion.div
          className="ai-success-banner"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className="ai-success-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 320, damping: 20 }}
          >
            <span className="material-symbols-outlined filled">check_circle</span>
          </motion.div>
          <div className="ai-success-text">
            <h2>Grievance Submitted Successfully</h2>
            <p>Your complaint has been received, analysed by AI, and is being routed to the correct authority.</p>
          </div>
        </motion.div>

        {/* Summary quote */}
        {english_summary && (
          <motion.div
            className="ai-quote"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <span className="material-symbols-outlined quote-icon">format_quote</span>
            <p><strong>AI Summary: </strong>{english_summary}</p>
          </motion.div>
        )}

        <div className="ai-grid">
          <div className="ai-main">

            {/* Classification */}
            <motion.section className="ai-section" custom={0} variants={sectionVariants} initial="hidden" animate="show">
              <h2>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)' }}>analytics</span>
                Classification
              </h2>
              <div className="class-grid">
                <div className="class-item">
                  <span className="class-label">Category</span>
                  <span className="class-value" style={{ textTransform: 'capitalize' }}>{category}</span>
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
            </motion.section>

            {/* Government Portals */}
            <motion.section className="ai-section" custom={1} variants={sectionVariants} initial="hidden" animate="show">
              <h2>
                <span className="material-symbols-outlined" style={{ color: 'var(--saffron)' }}>account_balance</span>
                Relevant Government Portals
              </h2>
              <div className="action-list">
                {portalsArray.length > 0 ? portalsArray.map((p, i) => (
                  <motion.a
                    key={i}
                    href={p.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="action-card"
                    style={{ textDecoration: 'none' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <div className="action-info">
                      <div className="action-icon">
                        <span className="material-symbols-outlined">domain</span>
                      </div>
                      <div>
                        <strong>{p.name || 'Portal'}</strong>
                        {p.desc && <p>{p.desc}</p>}
                      </div>
                    </div>
                    <span className="material-symbols-outlined">open_in_new</span>
                  </motion.a>
                )) : (
                  <p style={{ color: 'var(--outline)', fontSize: 13 }}>No specific portals matched for your state/category.</p>
                )}
              </div>
            </motion.section>

            {/* Procedure */}
            <motion.section className="ai-section" custom={2} variants={sectionVariants} initial="hidden" animate="show">
              <h2>
                <span className="material-symbols-outlined" style={{ color: 'var(--emerald)' }}>format_list_numbered</span>
                Next Steps
              </h2>
              {procedure_steps.length > 0 ? (
                <div className="procedure-list">
                  {procedure_steps.map((step, i) => (
                    <motion.div
                      key={i}
                      className="procedure-step"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.07 }}
                    >
                      <div className="procedure-num">{i + 1}</div>
                      <p>{step}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--outline)', fontSize: 13 }}>No procedure steps available for this category.</p>
              )}
            </motion.section>

            {/* CTA */}
            <motion.div className="ai-cta" custom={3} variants={sectionVariants} initial="hidden" animate="show">
              <p>Save this analysis for your records or return to your dashboard to track progress.</p>
              <div className="ai-cta-btns">
                <button className="btn btn-primary" onClick={() => window.print()} style={{ borderRadius: 10 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                  Download Summary
                </button>
                <Link to="/dashboard" className="btn btn-outline" style={{ borderRadius: 10 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>dashboard</span>
                  Back to Dashboard
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Aside */}
          <aside className="ai-aside">

            {/* Nearby Offices */}
            <motion.div className="ai-aside-card" custom={0} variants={sectionVariants} initial="hidden" animate="show">
              <h3>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)' }}>business</span>
                Nearby Offices
              </h3>
              {nearby_offices.length > 0 ? nearby_offices.map((office, idx) => (
                <div key={idx} className="contact-item">
                  <span className="contact-label">{office.name || office}</span>
                  {office.lat && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${office.lat},${office.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="contact-value"
                    >
                      View on Maps →
                    </a>
                  )}
                </div>
              )) : (
                <p style={{ fontSize: 13, color: 'var(--outline)' }}>No nearby offices found for your district.</p>
              )}
            </motion.div>

            {/* Helpline */}
            {portal_links?.helpline && (
              <motion.div className="ai-aside-card" custom={1} variants={sectionVariants} initial="hidden" animate="show">
                <h3>
                  <span className="material-symbols-outlined" style={{ color: 'var(--saffron)' }}>call</span>
                  Helpline
                </h3>
                <a href={`tel:${portal_links.helpline}`} className="contact-value" style={{ fontSize: 20, fontWeight: 800 }}>
                  {portal_links.helpline}
                </a>
                <p style={{ fontSize: 12, color: 'var(--outline)', marginTop: 4 }}>{portal_links.portal_name}</p>
              </motion.div>
            )}

            {/* Map */}
            <motion.div className="ai-aside-card" custom={2} variants={sectionVariants} initial="hidden" animate="show">
              <h3>
                <span className="material-symbols-outlined" style={{ color: 'var(--emerald)' }}>map</span>
                Coverage Map
              </h3>
              <div className="map-placeholder">
                <span className="material-symbols-outlined">location_on</span>
                <span>Interactive Map</span>
                <span style={{ fontSize: 11, background: 'var(--surface-container-highest)', padding: '2px 8px', borderRadius: 4 }}>Region coverage</span>
              </div>
            </motion.div>

            {/* Eco badge */}
            <motion.div className="ai-aside-card" custom={3} variants={sectionVariants} initial="hidden" animate="show">
              <h3>
                <span className="material-symbols-outlined" style={{ color: 'var(--emerald)' }}>eco</span>
                Environmental Impact
              </h3>
              <div className="eco-badge">
                <span className="material-symbols-outlined" style={{ color: 'var(--emerald)', fontSize: 18 }}>eco</span>
                <div>
                  <span className="eco-label">Digital Filing</span>
                  <p>Saved approx. 120g paper carbon by filing digitally.</p>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}