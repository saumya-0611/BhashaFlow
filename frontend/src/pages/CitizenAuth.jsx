import axios from "axios";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import './CitizenAuth.css';

export default function CitizenAuth() {
  const [mode, setMode] = useState("login");
  const [lEmail, setLEmail] = useState("");
  const [lPass, setLPass] = useState("");
  const [showL, setShowL] = useState(false);
  const [sName, setSName] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sPass, setSPass] = useState("");
  const [sConf, setSConf] = useState("");
  const [showP, setShowP] = useState(false);
  const [showC, setShowC] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: lEmail, password: lPass,
      });
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userName', response.data.user.name);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("LOGIN ERROR", err);
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (e) => {
    e.preventDefault();
    if (sPass !== sConf) { alert("Passwords don't match"); return; }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name: sName, email: sEmail, password: sPass,
      });
      alert("Success! Now please Sign In.");
      setMode("login");
    } catch (err) {
      console.error("SIGNUP ERROR →", err.response?.data || err.message);
      alert("Registration failed: " + (err.response?.data?.message || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    enter: { opacity: 0, x: mode === "login" ? -30 : 30 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, x: mode === "login" ? 30 : -30, transition: { duration: 0.25 } },
  };

  return (
    <div className="auth-page">
      {/* Left Panel — Branding */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo-area">
            <div className="auth-logo-badge">
              <span className="material-symbols-outlined filled">language</span>
            </div>
            <h1 className="auth-logo-text">BhashaFlow</h1>
          </div>
          <p className="auth-tagline">Digital Sovereignty for every citizen.</p>
          <p className="auth-subtitle">
            Empowering voices through seamless communication and institutional transparency.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <span className="material-symbols-outlined">translate</span>
              <div>
                <strong>22+ Languages</strong>
                <p>File grievances in your native tongue</p>
              </div>
            </div>
            <div className="auth-feature">
              <span className="material-symbols-outlined">psychology</span>
              <div>
                <strong>AI-Powered Routing</strong>
                <p>Smart categorization & department mapping</p>
              </div>
            </div>
            <div className="auth-feature">
              <span className="material-symbols-outlined">verified_user</span>
              <div>
                <strong>Government Certified</strong>
                <p>Secure, NIC-compliant infrastructure</p>
              </div>
            </div>
          </div>

          <div className="tricolor-bar">
            <div className="bar saffron"></div>
            <div className="bar white"></div>
            <div className="bar green"></div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-right">
        <div className="auth-form-container">
          {/* Tab Switcher */}
          <div className="auth-tabs">
            {[["login", "Sign In"], ["signup", "Create Account"]].map(([m, label]) => (
              <button
                key={m}
                className={`auth-tab ${mode === m ? 'active' : ''}`}
                onClick={() => setMode(m)}
              >
                {label}
                {mode === m && (
                  <motion.div layoutId="authTab" className="tab-indicator"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }} />
                )}
              </button>
            ))}
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form key="login" variants={formVariants}
                initial="enter" animate="show" exit="exit"
                onSubmit={onLogin} className="auth-form"
              >
                <div className="form-header">
                  <h2>Welcome Back</h2>
                  <p>Access your grievance dashboard and insights.</p>
                </div>

                <div className="field-group">
                  <label htmlFor="le" className="input-label">Email Address</label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined input-icon">mail</span>
                    <input id="le" type="email" className="input-field has-icon"
                      value={lEmail} onChange={e => setLEmail(e.target.value)}
                      placeholder="citizen@example.gov.in" required />
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="lp" className="input-label">Password</label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined input-icon">lock</span>
                    <input id="lp" type={showL ? "text" : "password"} className="input-field has-icon"
                      value={lPass} onChange={e => setLPass(e.target.value)}
                      placeholder="Enter your password" required />
                    <button type="button" className="toggle-eye"
                      onClick={() => setShowL(v => !v)}>
                      <span className="material-symbols-outlined">
                        {showL ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="forgot-row">
                  <a href="#">Forgot Password?</a>
                </div>

                <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>

                <p className="auth-switch">
                  New to the portal?{" "}
                  <button type="button" onClick={() => setMode("signup")}>Create an Account</button>
                </p>
              </motion.form>
            ) : (
              <motion.form key="signup" variants={formVariants}
                initial="enter" animate="show" exit="exit"
                onSubmit={onSignup} className="auth-form"
              >
                <div className="form-header">
                  <h2>Join BhashaFlow</h2>
                  <p>Register to raise issues in your native language.</p>
                </div>

                <div className="field-group">
                  <label htmlFor="sn" className="input-label">Full Name</label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined input-icon">person</span>
                    <input id="sn" type="text" className="input-field has-icon"
                      value={sName} onChange={e => setSName(e.target.value)}
                      placeholder="Rajesh Kumar" required />
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="se" className="input-label">Email Address</label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined input-icon">mail</span>
                    <input id="se" type="email" className="input-field has-icon"
                      value={sEmail} onChange={e => setSEmail(e.target.value)}
                      placeholder="citizen@example.gov.in" required />
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="sp" className="input-label">Password</label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined input-icon">lock</span>
                    <input id="sp" type={showP ? "text" : "password"} className="input-field has-icon"
                      value={sPass} onChange={e => setSPass(e.target.value)}
                      placeholder="Min. 8 characters" required />
                    <button type="button" className="toggle-eye"
                      onClick={() => setShowP(v => !v)}>
                      <span className="material-symbols-outlined">
                        {showP ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="sc" className="input-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined input-icon">verified_user</span>
                    <input id="sc" type={showC ? "text" : "password"} className="input-field has-icon"
                      value={sConf} onChange={e => setSConf(e.target.value)}
                      placeholder="Re-enter password" required />
                    <button type="button" className="toggle-eye"
                      onClick={() => setShowC(v => !v)}>
                      <span className="material-symbols-outlined">
                        {showC ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? 'Creating…' : 'Create Account'}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>

                <p className="auth-switch">
                  Already registered?{" "}
                  <button type="button" onClick={() => setMode("login")}>Sign in</button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer links */}
        <div className="auth-footer">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Support</a>
          <p>© 2024 BhashaFlow. An Initiative for Multilingual Civic Engagement.</p>
        </div>
      </div>
    </div>
  );
}