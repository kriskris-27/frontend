import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './auth/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './auth/ProtectedRoute';
import Signup from './auth/Signup';
import OAuthSuccess from './auth/OAuthSuccess';

function App() {
  return (
    <Router>
        <Routes>
  {/* Public Routes */}
 
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
    <Route path="/oauth-success" element={<OAuthSuccess/>} />

  {/* Protected Routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
  </Route>
</Routes>
    </Router>
  );
}

export default App;
