import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Auth
import CitizenAuth from './pages/CitizenAuth';
import OAuthSuccess from './pages/OAuthSuccess';

// Citizen pages
import Dashboard       from './pages/Dashboard';
import SubmitGrievance from './pages/SubmitGrievance';
import VerifyGrievance from './pages/VerifyGrievance';
import GrievanceForm   from './pages/GrievanceForm';
import AIAnalysis      from './pages/AIAnalysis';
import GrievanceDetail from './pages/GrievanceDetail';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';

// Route guards
import { ProtectedRoute, AdminRoute } from './utils/auth';

function App() {
  return (
    <Router>
      {/*
        AnimatePresence at the Router level enables exit animations
        when navigating between pages. Each page component should use
        motion.div with variants for entry/exit.
      */}
      <AnimatePresence mode="wait">
        <Routes>
          {/* ── Public ─────────────────────────────────────── */}
          <Route path="/auth"               element={<CitizenAuth />} />
          <Route path="/auth/oauth-success" element={<OAuthSuccess />} />

          {/* ── Citizen (protected) ────────────────────────── */}
          <Route path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          <Route path="/submit"
            element={<ProtectedRoute><SubmitGrievance /></ProtectedRoute>} />

          {/* Step 2 of grievance flow — AI verification */}
          <Route path="/verify/:id"
            element={<ProtectedRoute><VerifyGrievance /></ProtectedRoute>} />

          {/* Step 3 — location + contact form */}
          <Route path="/grievance-form/:id"
            element={<ProtectedRoute><GrievanceForm /></ProtectedRoute>} />

          {/* Step 4 — AI result, portals, procedure */}
          <Route path="/ai-result/:id"
            element={<ProtectedRoute><AIAnalysis /></ProtectedRoute>} />

          {/* Grievance detail (citizen view) */}
          <Route path="/grievance/:id"
            element={<ProtectedRoute><GrievanceDetail /></ProtectedRoute>} />

          {/* ── Admin (protected + role check) ─────────────── */}
          <Route path="/admin"
            element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* ── Fallbacks ───────────────────────────────────── */}
          <Route path="/"  element={<Navigate to="/auth" replace />} />
          <Route path="*"  element={<Navigate to="/auth" replace />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;