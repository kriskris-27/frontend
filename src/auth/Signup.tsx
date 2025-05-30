import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import gimg from '../images/image.png' 

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', { email, password, name });
      navigate('/login');
    } catch (err) {
      console.error('Signup failed', err);
    }
  };

  return (
    <form onSubmit={handleSignup} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Sign Up</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
        className="input input-bordered w-full"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="input input-bordered w-full"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="input input-bordered w-full"
        required
      />
      <a
  href="http://localhost:5000/api/auth/google"
  className="btn btn-outline w-full mt-2 flex justify-center items-center"
>
  <img src={gimg} alt="Google" className="h-5 w-5 mr-2" />
  Continue with Google
</a>
      <button type="submit" className="btn btn-primary w-full">Sign Up</button>
    </form>
  );
}
