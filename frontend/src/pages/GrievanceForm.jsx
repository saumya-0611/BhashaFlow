/**
 * GrievanceForm.jsx
 * Route: /grievance-form/:id
 *
 * Step 3 of the citizen flow — collects location and contact details.
 * Fields accept any language; backend translates address to English.
 * On submit → /ai-result/:id
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import './GrievanceForm.css';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  // Union Territories
  'Andaman & Nicobar Islands','Chandigarh','Dadra & Nagar Haveli and Daman & Diu',
  'Delhi','Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

const fieldVariants = {
  initial: { opacity: 0, y: 12 },
  animate: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.07 } }),
};

export default function GrievanceForm() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    user_name: '',
    user_phone: '',
    state: '',
    district: '',
    pincode: '',
    address: '',
    landmark: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const LOADING_MESSAGES = [
    'Translating your address…',
    'Finding nearby offices…',
    'Looking up portal links…',
    'Almost there…',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.state || !form.district || !form.pincode || !form.address) {
      alert('Please fill in State, District, Pincode and Address.');
      return;
    }

    setSubmitting(true);

    // Rotate loading messages while waiting
    let msgIdx = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIdx]);
    }, 2500);

    try {
      const { data } = await api.post('/api/grievance/submit', {
        grievance_id: id,
        ...form,
      });

      clearInterval(msgInterval);
      // Pass portal/office data to the result page via location state
      navigate(`/ai-result/${id}`, { state: data });
    } catch (err) {
      clearInterval(msgInterval);
      alert(err.response?.data?.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  const fields = [
    { label: 'Your Full Name',   field: 'user_name',  type: 'text',  placeholder: 'Rajesh Kumar',      half: true,  custom: 0 },
    { label: 'Phone Number',     field: 'user_phone', type: 'tel',   placeholder: '+91 98XXXXXXXX',    half: true,  custom: 1 },
    { label: 'District',         field: 'district',   type: 'text',  placeholder: 'e.g. Gurugram',     half: true,  custom: 3 },
    { label: 'Pincode',          field: 'pincode',    type: 'text',  placeholder: '122001',            half: true,  custom: 4 },
    { label: 'Landmark (optional)', field: 'landmark', type: 'text', placeholder: 'Near BhashaFlow tower', half: false, custom: 6 },
  ];

  return (
    <DashboardLayout>
      <motion.div
        className="gform-page"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Header */}
        <section className="gform-header">
          <div className="gform-step-row">
            <span className="gform-step-badge">Step 3 of 3</span>
            <div className="gform-steps">
              {['Describe', 'Verify', 'Details'].map((s, i) => (
                <span key={s} className={`gform-step ${i === 2 ? 'active' : i < 2 ? 'done' : ''}`}>{s}</span>
              ))}
            </div>
          </div>
          <h1>Tell us where you are</h1>
          <p>Fill in your location so we can suggest the right offices and portals near you.</p>
        </section>

        <form onSubmit={handleSubmit} className="gform-form">
          <div className="gform-grid">
            {/* Left column */}
            <div className="gform-main">

              {/* State dropdown — separate so it gets its own motion */}
              <motion.div className="field-group" custom={2} variants={fieldVariants} initial="initial" animate="animate">
                <label className="input-label">State / Union Territory</label>
                <select
                  className="input-field"
                  value={form.state}
                  onChange={set('state')}
                  required
                >
                  <option value="">Select your state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </motion.div>

              {/* Two-column sub-grid for half-width fields */}
              <div className="gform-row">
                {fields.filter(f => f.half).map((f) => (
                  <motion.div key={f.field} className="field-group" custom={f.custom} variants={fieldVariants} initial="initial" animate="animate">
                    <label className="input-label">{f.label}</label>
                    <input
                      type={f.type}
                      className="input-field"
                      value={form[f.field]}
                      onChange={set(f.field)}
                      placeholder={f.placeholder}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Address textarea */}
              <motion.div className="field-group" custom={5} variants={fieldVariants} initial="initial" animate="animate">
                <label className="input-label">Full Address</label>
                <textarea
                  className="input-field gform-textarea"
                  value={form.address}
                  onChange={set('address')}
                  placeholder="House no., street, mohalla, ward… (any language)"
                  rows={3}
                  required
                />
                <p className="gform-hint">
                  <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', color: 'var(--emerald)' }}>translate</span>
                  {' '}You can type in your language — we will translate it automatically.
                </p>
              </motion.div>

              {/* Landmark */}
              {fields.filter(f => !f.half).map((f) => (
                <motion.div key={f.field} className="field-group" custom={f.custom} variants={fieldVariants} initial="initial" animate="animate">
                  <label className="input-label">{f.label}</label>
                  <input
                    type={f.type}
                    className="input-field"
                    value={form[f.field]}
                    onChange={set(f.field)}
                    placeholder={f.placeholder}
                  />
                </motion.div>
              ))}

              {/* Submit */}
              <motion.button
                type="submit"
                className="btn btn-primary gform-submit"
                disabled={submitting}
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.97 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {submitting ? (
                  <>
                    <motion.span
                      className="gform-spinner"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                    />
                    {loadingMsg}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">search</span>
                    Find Nearby Help
                  </>
                )}
              </motion.button>
            </div>

            {/* Right column — info card */}
            <aside className="gform-aside">
              <motion.div
                className="card surface-low gform-info"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <div className="gform-info-icon">
                  <span className="material-symbols-outlined filled" style={{ color: 'var(--primary-container)', fontSize: 24 }}>location_on</span>
                </div>
                <h3>Why we need this</h3>
                <p>Your location helps us:</p>
                <ul className="gform-info-list">
                  <li>Find the nearest government offices for your issue</li>
                  <li>Link the correct state portal and helpline</li>
                  <li>Route your grievance to the right authority</li>
                </ul>
              </motion.div>

              <motion.div
                className="card surface-low gform-info"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
              >
                <div className="gform-info-icon">
                  <span className="material-symbols-outlined filled" style={{ color: 'var(--saffron)', fontSize: 24 }}>shield</span>
                </div>
                <h3>Your data is safe</h3>
                <p>Your personal details are encrypted and used only for grievance routing. We do not share them with third parties.</p>
              </motion.div>
            </aside>
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  );
}