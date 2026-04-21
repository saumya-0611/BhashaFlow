/**
 * VerifyGrievance.jsx
 * Route: /verify/:id
 *
 * Shows the AI-generated verification sentence in the citizen's language.
 * Citizen taps Yes (confirmed) or No (retry).
 * Data comes from location.state set by SubmitGrievance navigate() call —
 * no extra API fetch needed.
 */

import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import './VerifyGrievance.css';

const pageVariants = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, scale: 0.97, transition: { duration: 0.25 } },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.94, y: 24 },
  animate: { opacity: 1, scale: 1,    y: 0,  transition: { delay: 0.15, duration: 0.5, type: 'spring', stiffness: 280, damping: 28 } },
};

export default function VerifyGrievance() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { state }    = useLocation(); // data passed by SubmitGrievance
  const [loading, setLoading] = useState(false);
  const [answered, setAnswered] = useState(false);

  // Fallback if navigated directly without state
  const verificationSentence = state?.verification_sentence || 'Kya yeh sahi hai?';
  const category             = state?.category              || 'other';
  const detectedLanguage     = state?.detected_language     || 'en-IN';
  const keywords             = state?.keywords              || [];

  const handleConfirm = async (confirmed) => {
    setLoading(true);
    setAnswered(true);
    try {
      const { data } = await api.post('/api/grievance/confirm', {
        grievance_id: id,
        confirmed,
      });

      if (!confirmed || data.retry) {
        // Citizen rejected — go back to submit
        navigate('/submit');
      } else {
        // Confirmed — proceed to location form
        navigate(`/grievance-form/${id}`);
      }
    } catch (err) {
      console.error('Confirm error:', err);
      alert('Something went wrong. Please try again.');
      setLoading(false);
      setAnswered(false);
    }
  };

  return (
    <motion.div
      className="verify-page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Brand header */}
      <motion.div
        className="verify-brand"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        <span className="material-symbols-outlined filled" style={{ color: 'var(--saffron)', fontSize: 28 }}>language</span>
        <span className="verify-brand-name">BhashaFlow</span>
        <span className="verify-step-badge">Step 2 of 3</span>
      </motion.div>

      {/* Main card */}
      <motion.div className="verify-card card" variants={cardVariants} initial="initial" animate="animate">

        {/* AI icon + label */}
        <div className="verify-ai-row">
          <motion.span
            className="material-symbols-outlined filled"
            style={{ fontSize: 32, color: 'var(--saffron)' }}
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            psychology
          </motion.span>
          <div>
            <p className="verify-ai-label">AI Understanding</p>
            <p className="verify-ai-sub">Here is what our AI understood from your complaint</p>
          </div>
        </div>

        {/* Verification sentence — the key element */}
        <motion.div
          className="verify-sentence-wrap"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <span className="verify-quote-icon material-symbols-outlined">format_quote</span>
          <p className="verify-sentence">{verificationSentence}</p>
        </motion.div>

        {/* Detected category + language chips */}
        <motion.div
          className="verify-chips"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <span className="chip chip-primary">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>category</span>
            {category}
          </span>
          <span className="chip chip-secondary">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>translate</span>
            {detectedLanguage}
          </span>
        </motion.div>

        {/* Keywords */}
        {keywords.length > 0 && (
          <motion.div
            className="verify-keywords"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            <p className="verify-keywords-label">Key terms detected:</p>
            <div className="verify-keywords-row">
              {keywords.map((kw, i) => (
                <motion.span
                  key={kw}
                  className="chip chip-primary"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.06 }}
                >
                  {kw}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Yes / No buttons */}
        <AnimatePresence>
          {!answered && (
            <motion.div
              className="verify-actions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: 0.75 }}
            >
              <p className="verify-question">Is this understanding correct?</p>
              <div className="verify-btns">
                <motion.button
                  className="btn verify-btn-yes"
                  onClick={() => handleConfirm(true)}
                  disabled={loading}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Haan / Yes
                </motion.button>

                <motion.button
                  className="btn verify-btn-no"
                  onClick={() => handleConfirm(false)}
                  disabled={loading}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="material-symbols-outlined">cancel</span>
                  Nahi / No
                </motion.button>
              </div>

              <p className="verify-hint">
                Tap <strong>No</strong> if the AI misunderstood — you can describe it again.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state after button tap */}
        <AnimatePresence>
          {answered && loading && (
            <motion.div
              className="verify-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="verify-spinner"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
              />
              <p>Processing…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}