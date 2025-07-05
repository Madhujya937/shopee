import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const SellerRegister = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await axios.post(`${API_URL}/api/users/register-seller`, form);
      setSuccess(true);
      setTimeout(() => navigate('/seller/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Seller Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
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
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">Registration successful! Redirecting to login...</div>}
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-all" disabled={loading}>
            {loading ? 'Registering...' : 'Register as Seller'}
          </button>
        </form>
        <div className="text-center mt-4 text-sm">
          Already a seller?{' '}
          <button 
            className="text-blue-600 hover:underline" 
            onClick={() => {
              console.log('Login button clicked - navigating to /seller/login');
              navigate('/seller/login');
            }}
          >
            Login
          </button>
        </div>
        <div className="text-center mt-2 text-sm">
          <button className="text-blue-600 hover:underline" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    </div>
  );
};

export default SellerRegister; 