import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import './Settings.css';

export default function Settings() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  // Security States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    // Load existing preferences/user info
    const storedName = localStorage.getItem('userName') || 'Citizen User';
    setUserName(storedName);
    setEmail('citizen@example.gov.in'); // Placeholder email since we don't store it in localStorage currently
    
    // Load Dark Mode
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.body.classList.add('dark-theme');
    }
  }, []);

  const toggleDarkMode = (e) => {
    const isDark = e.target.checked;
    setDarkMode(isDark);
    localStorage.setItem('darkMode', isDark);
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Simulate save
    localStorage.setItem('userName', userName);
    alert('Settings saved successfully!');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    try {
      await api.post('/api/auth/change-password', { currentPassword, newPassword });
      alert('Password updated successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPassLoading(false);
    }
  };

  const handleGenerate2FA = async () => {
    setTwoFactorLoading(true);
    try {
      const res = await api.post('/api/auth/2fa/generate');
      setQrCodeUrl(res.data.qrCodeUrl);
      setShow2FAModal(true);
    } catch (err) {
      alert('Failed to generate 2FA setup');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setTwoFactorLoading(true);
    try {
      await api.post('/api/auth/2fa/verify', { token: twoFactorToken });
      alert('Two-Factor Authentication enabled successfully!');
      setIs2FAEnabled(true);
      setShow2FAModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid 2FA token');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="settings-page">
        <header className="settings-header">
          <h1 className="settings-title">Account Settings</h1>
          <p className="settings-sub">Manage your profile, preferences, and security settings.</p>
        </header>

        <form onSubmit={handleSave} className="settings-form-wrapper">
          {/* Profile Section */}
          <motion.section 
            className="settings-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="settings-section-header">
              <span className="material-symbols-outlined filled">person</span>
              <h2>Profile Information</h2>
            </div>
            
            <div className="settings-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    disabled 
                    title="Email cannot be changed"
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Preferences Section */}
          <motion.section 
            className="settings-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="settings-section-header">
              <span className="material-symbols-outlined filled">tune</span>
              <h2>Preferences</h2>
            </div>

            <div className="settings-form">
              <div className="form-group" style={{ maxWidth: '300px' }}>
                <label htmlFor="language">Default Language</label>
                <select 
                  id="language" 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Email Notifications</h4>
                  <p>Receive updates about your grievance status.</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={notifications} 
                    onChange={(e) => setNotifications(e.target.checked)} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item" style={{ borderTop: '1px solid var(--outline-variant)' }}>
                <div className="setting-info">
                  <h4>Dark Mode</h4>
                  <p>Switch to a dark UI theme for low-light environments.</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={darkMode} 
                    onChange={toggleDarkMode} 
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </motion.section>

          {/* Security Section */}
          <motion.section 
            className="settings-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="settings-section-header">
              <span className="material-symbols-outlined filled">security</span>
              <h2>Security</h2>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Password</h4>
                <p>Ensure your account is using a long, random password to stay secure.</p>
              </div>
              <button type="button" className="btn btn-outline" onClick={() => setShowPasswordModal(true)}>
                Change Password
              </button>
            </div>

            <div className="setting-item" style={{ borderTop: '1px solid var(--outline-variant)' }}>
              <div className="setting-info">
                <h4>Two-Factor Authentication (2FA)</h4>
                <p>Add an extra layer of security to your account.</p>
              </div>
              {is2FAEnabled ? (
                <button type="button" className="btn btn-outline" disabled style={{ color: 'var(--emerald)', borderColor: 'var(--emerald)' }}>
                  <span className="material-symbols-outlined">check_circle</span> Enabled
                </button>
              ) : (
                <button type="button" className="btn btn-primary" style={{ background: 'var(--emerald)' }} onClick={handleGenerate2FA}>
                  {twoFactorLoading ? 'Generating...' : 'Enable 2FA'}
                </button>
              )}
            </div>
          </motion.section>

          <div className="settings-actions">
            <button type="button" className="btn btn-tertiary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>

      {/* ── Password Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div className="auth-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPasswordModal(false)}>
            <motion.div className="auth-modal-content" initial={{ y: 20, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <button className="auth-modal-close" onClick={() => setShowPasswordModal(false)}><span className="material-symbols-outlined">close</span></button>
              <h3>Change Password</h3>
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength="6" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={passLoading} style={{ marginTop: '8px' }}>
                  {passLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2FA Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {show2FAModal && (
          <motion.div className="auth-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShow2FAModal(false)}>
            <motion.div className="auth-modal-content" initial={{ y: 20, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
              <button className="auth-modal-close" onClick={() => setShow2FAModal(false)}><span className="material-symbols-outlined">close</span></button>
              <h3>Set Up 2FA</h3>
              <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginBottom: '16px' }}>Scan this QR code with your authenticator app (like Google Authenticator or Authy).</p>
              {qrCodeUrl && <img src={qrCodeUrl} alt="2FA QR Code" style={{ width: '200px', height: '200px', margin: '0 auto', display: 'block', borderRadius: '8px' }} />}
              <form onSubmit={handleVerify2FA} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label>Enter 6-digit Code</label>
                  <input type="text" value={twoFactorToken} onChange={e => setTwoFactorToken(e.target.value)} required maxLength="6" style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '18px' }} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={twoFactorLoading} style={{ background: 'var(--emerald)' }}>
                  {twoFactorLoading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
