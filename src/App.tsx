import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './auth/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './auth/ProtectedRoute';
import Signup from './auth/Signup';

function App() {
  return (
    <Router>
        <Routes>
            <Route path='/login' element={<Login/>} />
            <Route path='/signup' element={<Signup/>}/>
            <Route path='/dashboard' element={<ProtectedRoute>
                <Dashboard/>
            </ProtectedRoute>
            }/>
        </Routes>
    </Router>
  );
}

export default App;
