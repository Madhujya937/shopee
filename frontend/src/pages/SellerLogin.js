import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSellerAuth } from '../context/SellerAuthContext';

const SellerLogin = () => {
  const { seller, login, loading, error, logout } = useSellerAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('SellerLogin useEffect - seller:', seller, 'loading:', loading);
    // Only redirect if seller exists and we're not in the middle of a login attempt
    if (seller && !loading && !submitted) {
      console.log('Redirecting to dashboard');
      navigate('/seller/dashboard');
    }
  }, [seller, loading, navigate, submitted]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const success = await login(form.email, form.password);
    if (success) navigate('/seller/dashboard');
  };

  const handleLogout = () => {
    logout();
    setForm({ email: '', password: '' });
    setSubmitted(false);
  };

  if (seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Already Logged In</h2>
          <p className="text-gray-600 text-center mb-6">
            You are already logged in as a seller.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/seller/dashboard')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-all"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={handleLogout}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded font-semibold transition-all"
            >
              Logout & Login as Different Seller
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('shopee_seller');
                window.location.reload();
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded font-semibold transition-all"
            >
              Clear Session & Show Login Form
            </button>
            <button 
              onClick={() => {
                logout();
                setForm({ email: '', password: '' });
                setSubmitted(false);
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded font-semibold transition-all"
            >
              Force Show Login Form
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded font-semibold transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Seller Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Seller Email"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          {error && submitted && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-all" disabled={loading}>
            {loading ? 'Logging in...' : 'Login as Seller'}
          </button>
        </form>
        <div className="text-center mt-4 text-sm">
          <button className="text-blue-600 hover:underline" onClick={() => navigate('/')}>Back to Home</button>
        </div>
        <div className="text-center mt-2 text-sm">
          Not a seller yet?{' '}
          <button className="text-blue-600 hover:underline" onClick={() => navigate('/seller/register')}>Register</button>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin; 