import { useAuth } from '../auth/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.email}</h1>
      <p className="mt-2">Your role: {user?.role}</p>
      <button onClick={logout} className="btn btn-secondary mt-4">Logout</button>
    </div>
  );
}
