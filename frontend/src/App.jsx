import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CitizenAuth from './pages/CitizenAuth';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* The Login/Signup page */}
        <Route path="/auth" element={<CitizenAuth />} />
        
        {/* The new Dashboard page */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Redirect any empty path to /auth */}
        <Route path="/" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;