import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Welcome, {user?.name}!</h2>
            <p className="text-gray-600">Role: {user?.role}</p>
            <p className="text-gray-600">Email: {user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
