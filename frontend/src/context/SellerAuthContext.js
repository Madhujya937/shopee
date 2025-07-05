import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SellerAuthContext = createContext();
export const useSellerAuth = () => useContext(SellerAuthContext);

const API_URL = process.env.REACT_APP_API_URL;

export const SellerAuthProvider = ({ children }) => {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load seller from localStorage only when needed
  useEffect(() => {
    const saved = localStorage.getItem('shopee_seller');
    if (saved) {
      setSeller(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (seller) {
      localStorage.setItem('shopee_seller', JSON.stringify(seller));
    } else {
      localStorage.removeItem('shopee_seller');
    }
  }, [seller]);

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/users/login-seller`, { email, password });
      setSeller(res.data.user);
      setError('');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setSeller(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setSeller(null);
  };

  return (
    <SellerAuthContext.Provider value={{ seller, login, logout, loading, error }}>
      {children}
    </SellerAuthContext.Provider>
  );
}; 