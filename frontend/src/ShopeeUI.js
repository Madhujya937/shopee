import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronRight, LogOut } from 'lucide-react';
import { useCart } from './context/CartContext';

const ShopeeUI = () => {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shopee_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    email: '',
    deliveryAddress: '',
    phoneNumber: '',
    deliveryInstructions: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const userDropdownRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || 'https://shopee-o2b3.onrender.com';

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('shopee_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const categories = [
    { id: 1, name: 'Fashion', icon: '👕', color: 'bg-pink-100 hover:bg-pink-200' },
    { id: 2, name: 'Electronics', icon: '📱', color: 'bg-blue-100 hover:bg-blue-200' },
    { id: 3, name: 'Home & Garden', icon: '🏠', color: 'bg-green-100 hover:bg-green-200' },
    { id: 4, name: 'Sports', icon: '⚽', color: 'bg-orange-100 hover:bg-orange-200' },
    { id: 5, name: 'Beauty', icon: '💄', color: 'bg-purple-100 hover:bg-purple-200' },
    { id: 6, name: 'Books', icon: '📚', color: 'bg-yellow-100 hover:bg-yellow-200' },
  ];

  const navItems = ['Home', 'Shop', 'About', 'Contact', 'FAQ'];

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/products`)
      .then(res => {
        setProducts(res.data);
        setError(null);
      })
      .catch(err => {
        setError('Failed to load products');
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [API_URL]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showUserDropdown) return;
    function handleClick(e) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showUserDropdown]);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSearchSuggestions(false);
    if (searchTerm.trim()) {
      alert(`Searching for: ${searchTerm}`);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setTimeout(() => setSelectedCategory(null), 300);
    // Navigate to category page
    navigate(`/category/${category.name}`);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // AUTH HANDLERS
  const handleAuthInput = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'register') {
        const res = await axios.post(`${API_URL}/api/users/register`, authForm);
        setUser(res.data.user);
        localStorage.setItem('shopee_user', JSON.stringify({ ...res.data.user, token: res.data.token }));
        setShowAuth(false);
      } else {
        const res = await axios.post(`${API_URL}/api/users/login`, {
          email: authForm.email,
          password: authForm.password
        });
        setUser(res.data.user);
        localStorage.setItem('shopee_user', JSON.stringify({ ...res.data.user, token: res.data.token }));
        setShowAuth(false);
      }
      setAuthForm({ email: '', password: '', name: '' });
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('shopee_user');
  };

  const addToWishlist = (product) => {
    if (!wishlist.find(item => item._id === product._id)) {
      const updated = [...wishlist, product];
      setWishlist(updated);
      localStorage.setItem('shopee_wishlist', JSON.stringify(updated));
    }
  };

  const removeFromWishlist = (productId) => {
    const updated = wishlist.filter(item => item._id !== productId);
    setWishlist(updated);
    localStorage.setItem('shopee_wishlist', JSON.stringify(updated));
  };

  const isInWishlist = (productId) => wishlist.some(item => item._id === productId);

  // Get search suggestions based on product names
  const getSearchSuggestions = () => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];
    
    return products
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5); // Limit to 5 suggestions
  };

  const handleSuggestionClick = (product) => {
    setSearchTerm(product.name);
    setShowSearchSuggestions(false);
    // Navigate to the product's category page
    navigate(`/category/${product.category}`);
  };

  // Payment handlers
  const handlePaymentInput = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('shopee_user') || 'null');
      console.log('User from localStorage:', user);
      console.log('User token:', user?.token);
      
      if (!user || !user.token) {
        alert('You must be logged in to place an order.');
        setPaymentLoading(false);
        return;
      }

      console.log('Cart items before order:', cart);

      // Sync frontend cart with backend cart
      for (const item of cart) {
        try {
          console.log('Syncing item to backend cart:', item._id, item.quantity);
          const response = await axios.post(
            `${API_URL}/api/cart/add`,
            { productId: item._id, quantity: item.quantity },
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          console.log('Cart sync response:', response.data);
        } catch (error) {
          console.error('Error adding item to backend cart:', error);
        }
      }

      // Prepare shipping info
      let shippingInfo = {};
      if (paymentMethod === 'cod') {
        shippingInfo = {
          address: paymentForm.deliveryAddress,
          phone: paymentForm.phoneNumber,
          deliveryInstructions: paymentForm.deliveryInstructions || ''
        };
      } else if (paymentMethod === 'paypal') {
        shippingInfo = {
          email: paymentForm.email
        };
      } else if (paymentMethod === 'card') {
        shippingInfo = {
          cardName: paymentForm.cardName,
          cardNumber: paymentForm.cardNumber,
          expiryDate: paymentForm.expiryDate,
          cvv: paymentForm.cvv
        };
      }

      console.log('Shipping info:', shippingInfo);
      console.log('Placing order with token:', user.token);

      // Place order via backend
      const orderResponse = await axios.post(
        `${API_URL}/api/orders`,
        { shippingInfo },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      console.log('Order created successfully:', orderResponse.data);

      // Clear cart after successful order
      clearCart();
      setShowPaymentModal(false);
      setPaymentForm({ 
        cardNumber: '', 
        cardName: '', 
        expiryDate: '', 
        cvv: '', 
        email: '',
        deliveryAddress: '',
        phoneNumber: '',
        deliveryInstructions: ''
      });
      alert(paymentMethod === 'cod' ? 'Order placed successfully! Pay with cash on delivery.' : 'Payment successful! Your order has been placed.');
      navigate('/');
    } catch (error) {
      console.error('Payment/Order error:', error);
      console.error('Error response:', error.response?.data);
      
      // Show the actual backend error message
      const errorMessage = error.response?.data?.message || 'Payment failed. Please try again.';
      alert(errorMessage);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleBuyNow = (product) => {
    addToCart(product);
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setShowAuth(false)}>
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAuth(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500"><X size={24} /></button>
            <h2 className="text-2xl font-bold mb-4 text-center">{authMode === 'login' ? 'Login' : 'Register'}</h2>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <input
                  type="text"
                  name="name"
                  value={authForm.name}
                  onChange={handleAuthInput}
                  placeholder="Name"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              )}
              <input
                type="email"
                name="email"
                value={authForm.email}
                onChange={handleAuthInput}
                placeholder="Email"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <input
                type="password"
                name="password"
                value={authForm.password}
                onChange={handleAuthInput}
                placeholder="Password"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              {authError && <div className="text-red-500 text-sm text-center">{authError}</div>}
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded font-semibold transition-all" disabled={authLoading}>
                {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Login' : 'Register')}
              </button>
            </form>
            <div className="text-center mt-4 text-sm">
              {authMode === 'login' ? (
                <>Don't have an account? <button className="text-orange-500 hover:underline" onClick={() => { setAuthMode('register'); setAuthError(''); }}>Register</button></>
              ) : (
                <>Already have an account? <button className="text-orange-500 hover:underline" onClick={() => { setAuthMode('login'); setAuthError(''); }}>Login</button></>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar/Modal */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-40" onClick={() => setShowCart(false)}>
          <div className="w-full max-w-md bg-white h-full shadow-lg p-6 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-red-500"><X size={24} /></button>
            </div>
            {cart.length === 0 ? (
              <div className="text-gray-400 text-center flex-1 flex items-center justify-center">Your cart is empty.</div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-4">
                  {cart.map(item => (
                    <div key={item._id} className="flex items-center space-x-4 border-b pb-2">
                      <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded">
                        {item.images && item.images.length > 0 ? (
                          <img src={`${API_URL}/${item.images[0]}`} alt={item.name} className="object-contain h-14 w-14" />
                        ) : (
                          <span className="text-gray-300 text-2xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-purple-600 font-bold">${item.price}</div>
                        <div className="flex items-center mt-1">
                          <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-2 py-0.5 bg-gray-200 rounded-l hover:bg-gray-300">-</button>
                          <span className="px-3">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-2 py-0.5 bg-gray-200 rounded-r hover:bg-gray-300">+</button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700"><X size={18} /></button>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (cart.length === 0) {
                        alert('Your cart is empty!');
                        return;
                      }
                      // Navigate to checkout page or show checkout modal
                      alert(`Proceeding to checkout with ${cart.length} items. Total: $${cartTotal.toFixed(2)}`);
                      // You can implement actual checkout logic here
                      // For now, we'll just show an alert
                    }}
                    className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full font-semibold transition-all"
                  >
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500"><X size={24} /></button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{paymentMethod === 'cod' ? 'Complete Your Order' : 'Complete Your Purchase'}</h2>
              <p className="text-gray-600 mt-2">Total: ${cartTotal.toFixed(2)}</p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {/* Payment Method Selection - Only show for card and PayPal */}
              {paymentMethod !== 'cod' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                        paymentMethod === 'card' 
                          ? 'border-purple-500 bg-purple-50 text-purple-700' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      💳 Credit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                        paymentMethod === 'paypal' 
                          ? 'border-purple-500 bg-purple-50 text-purple-700' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      🏦 PayPal
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                        paymentMethod === 'cod' 
                          ? 'border-purple-500 bg-purple-50 text-purple-700' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      💵 Cash on Delivery
                    </button>
                  </div>
                </div>
              )}

              {/* COD Method Selection - Show when COD is selected */}
              {paymentMethod === 'cod' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Method</label>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      className="p-3 border border-purple-500 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium"
                    >
                      💵 Cash on Delivery
                    </button>
                  </div>
                  <div className="mt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className="text-sm text-purple-600 hover:text-purple-800 underline"
                    >
                      Change to Credit Card
                    </button>
                    <span className="mx-2 text-gray-400">|</span>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className="text-sm text-purple-600 hover:text-purple-800 underline"
                    >
                      Change to PayPal
                    </button>
                  </div>
                </div>
              )}

              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentForm.cardNumber}
                      onChange={handlePaymentInput}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      name="cardName"
                      value={paymentForm.cardName}
                      onChange={handlePaymentInput}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentForm.expiryDate}
                        onChange={handlePaymentInput}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentForm.cvv}
                        onChange={handlePaymentInput}
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* PayPal Form */}
              {paymentMethod === 'paypal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={paymentForm.email}
                    onChange={handlePaymentInput}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              )}

              {/* COD Form */}
              {paymentMethod === 'cod' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600 text-lg">💵</span>
                      <span className="font-semibold text-blue-800">Cash on Delivery</span>
                    </div>
                    <p className="text-blue-700 text-sm">
                      Pay with cash when your order is delivered. No upfront payment required.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                    <textarea
                      name="deliveryAddress"
                      value={paymentForm.deliveryAddress || ''}
                      onChange={handlePaymentInput}
                      placeholder="Enter your complete delivery address..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={paymentForm.phoneNumber || ''}
                      onChange={handlePaymentInput}
                      placeholder="+1 234 567 8900"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Instructions (Optional)</label>
                    <textarea
                      name="deliveryInstructions"
                      value={paymentForm.deliveryInstructions || ''}
                      onChange={handlePaymentInput}
                      placeholder="Any special delivery instructions..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-all"
                disabled={paymentLoading}
              >
                {paymentLoading ? 'Processing Order...' : paymentMethod === 'cod' ? `Place Order - $${cartTotal.toFixed(2)}` : `Pay $${cartTotal.toFixed(2)}`}
              </button>
            </form>

            <div className="text-center mt-4 text-xs text-gray-500">
              {paymentMethod === 'cod' ? 'Your order information is secure and encrypted' : 'Your payment information is secure and encrypted'}
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500"><X size={24} /></button>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg p-4">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img src={`${API_URL}/${selectedProduct.images[0]}`} alt={selectedProduct.name} className="object-contain h-48 w-full" />
                ) : (
                  <span className="text-gray-300 text-6xl">📦</span>
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
                <div className="text-purple-600 font-bold text-xl mb-2">${selectedProduct.price}</div>
                <p className="text-gray-700 mb-4">{selectedProduct.description}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} 
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-semibold transition-all"
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => { 
                      handleBuyNow(selectedProduct);
                      setSelectedProduct(null);
                    }} 
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full font-semibold transition-all"
                  >
                    Buy Now
                  </button>
                </div>
                {selectedProduct && selectedProduct._id && (
                  <button
                    className={`absolute top-2 right-2 z-10 p-2 rounded-full ${isInWishlist(selectedProduct._id) ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'} hover:bg-pink-200`}
                    onClick={e => {
                      e.stopPropagation();
                      isInWishlist(selectedProduct._id)
                        ? removeFromWishlist(selectedProduct._id)
                        : addToWishlist(selectedProduct);
                    }}
                    title={isInWishlist(selectedProduct._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    style={{ right: 16, top: 16 }}
                  >
                    {isInWishlist(selectedProduct._id) ? <Heart fill="currentColor" /> : <Heart />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <button
                className="text-2xl font-bold flex items-center focus:outline-none"
                onClick={() => navigate('/')}
                title="Go to Home"
              >
                <span className="text-3xl">🛍️</span>
                <span className="ml-2">Shopee</span>
              </button>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="w-full relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    const shouldShow = e.target.value.length >= 2;
                    setShowSearchSuggestions(shouldShow);
                  }}
                  onFocus={() => {
                    const shouldShow = searchTerm.length >= 2;
                    setShowSearchSuggestions(shouldShow);
                  }}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  placeholder="Search for products, brands and more..."
                  className="w-full px-4 py-2 pl-4 pr-12 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors duration-200"
                >
                  <Search size={16} />
                </button>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setShowSearchSuggestions(false);
                    }}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X size={16} />
                  </button>
                )}
                
                {/* Search Suggestions Dropdown */}
                {showSearchSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border-2 border-gray-300 z-[9999] max-h-60 overflow-y-auto">
                    {getSearchSuggestions().length > 0 ? (
                      getSearchSuggestions().map((product, index) => (
                        <button
                          key={product._id}
                          onClick={() => handleSuggestionClick(product)}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            {product.images && product.images.length > 0 ? (
                              <img 
                                src={`${API_URL}/${product.images[0]}`} 
                                alt={product.name} 
                                className="w-6 h-6 object-cover rounded"
                              />
                            ) : (
                              <span className="text-gray-400 text-sm">📦</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.category} • ${product.price}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm">
                        No products found matching "{searchTerm}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Header Icons */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200" onClick={() => setShowCart(true)}>
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{cartCount}</span>
                )}
              </button>
              <button className="relative p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200" onClick={() => setShowWishlist(true)}>
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5">{wishlist.length}</span>
                )}
              </button>
              {/* User/Account Icon for buyers and sellers */}
              {user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200 flex items-center"
                    title={user.name || user.email}
                    onClick={() => setShowUserDropdown((v) => !v)}
                  >
                    <User size={20} />
                  </button>
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg py-2 z-20">
                      <div className="px-4 py-2 border-b text-sm">{user.name || user.email}</div>
                      <button
                        onClick={() => { navigate('/profile'); setShowUserDropdown(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                      >
                        👤 My Profile
                      </button>
                      <button
                        onClick={() => { navigate('/profile?tab=orders'); setShowUserDropdown(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-purple-600"
                      >
                        📦 Track Orders
                      </button>
                      {/* Seller/Became Seller Link */}
                      {user.role === 'seller' ? (
                        <button
                          onClick={() => { navigate('/seller/dashboard'); setShowUserDropdown(false); }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-blue-600"
                        >
                          🧑‍💼 Seller Dashboard
                        </button>
                      ) : (
                        <button
                          onClick={() => { navigate('/seller/register'); setShowUserDropdown(false); }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-blue-600"
                        >
                          🧑‍💼 Become a Seller
                        </button>
                      )}
                      <button
                        onClick={() => { handleLogout(); setShowUserDropdown(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200" onClick={() => setShowAuth(true)}>
                  <User size={20} />
                </button>
              )}
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  const shouldShow = e.target.value.length >= 2;
                  setShowSearchSuggestions(shouldShow);
                }}
                onFocus={() => {
                  const shouldShow = searchTerm.length >= 2;
                  setShowSearchSuggestions(shouldShow);
                }}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-4 pr-12 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors duration-200"
              >
                <Search size={16} />
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setShowSearchSuggestions(false);
                  }}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={16} />
                </button>
              )}
              
              {/* Search Suggestions Dropdown - Mobile */}
              {showSearchSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border-2 border-gray-300 z-[9999] max-h-60 overflow-y-auto">
                  {getSearchSuggestions().length > 0 ? (
                    getSearchSuggestions().map((product, index) => (
                      <button
                        key={product._id}
                        onClick={() => handleSuggestionClick(product)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={`${API_URL}/${product.images[0]}`} 
                              alt={product.name} 
                              className="w-6 h-6 object-cover rounded"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">📦</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category} • ${product.price}</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      No products found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-col md:flex-row md:space-x-8 py-4">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (item === 'Home') {
                      navigate('/');
                    } else if (item === 'Shop') {
                      // Scroll to products section
                      document.querySelector('.grid.grid-cols-1')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      alert(`${item} page coming soon!`);
                    }
                  }}
                  className={`${
                    index === 0 ? 'text-orange-500 bg-orange-50' : 'text-gray-700 hover:text-orange-500'
                  } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 mb-2 md:mb-0`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-2xl p-8 mb-8 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🛍️</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome to Shopee!
            </h1>
            <p className="text-lg md:text-xl mb-6 text-white text-opacity-90">
              Discover amazing products and unbeatable deals. Start your shopping journey today!
            </p>
            <button 
              onClick={() => {
                // Scroll to products section
                document.querySelector('.grid.grid-cols-1')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Start Shopping
            </button>
          </div>
        </div>

        {/* Categories Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-3xl mr-2">🏷️</span>
              Popular Categories
            </h2>
            <button 
              onClick={() => navigate('/categories')}
              className="text-orange-500 hover:text-orange-600 font-medium flex items-center"
            >
              View All
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`${category.color} ${
                  selectedCategory?.id === category.id ? 'scale-95 bg-opacity-80' : ''
                } p-6 rounded-xl text-center cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md`}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-gray-800">{category.name}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Product Grid Section - Simple Grid */}
        <section className="mb-12">
          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading products...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : products.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No products available.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product._id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col items-center cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                  <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded mb-4 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img src={`${API_URL}/${product.images[0]}`} alt={product.name} className="object-contain h-36 w-full" />
                    ) : (
                      <span className="text-gray-300 text-5xl">📦</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1 text-center truncate w-full">{product.name}</h3>
                  <div className="text-purple-600 font-bold text-xl mb-2">${product.price}</div>
                  <div className="flex gap-2 w-full">
                    <button 
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-full font-semibold transition-all text-sm" 
                      onClick={e => { e.stopPropagation(); addToCart(product); }}
                    >
                      Add to Cart
                    </button>
                    <button 
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-full font-semibold transition-all text-sm" 
                      onClick={e => { 
                        e.stopPropagation(); 
                        handleBuyNow(product);
                      }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Featured Section */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-2">⭐</span>
            Featured Products
          </h2>
          
          <div className="text-center py-12">
            <div className="text-6xl mb-4 text-gray-300">📦</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Coming Soon!
            </h3>
            <p className="text-gray-500 mb-6">
              We're preparing amazing products for you. Stay tuned!
            </p>
            <button 
              onClick={() => {
                alert('Thank you! We\'ll notify you when featured products are available.');
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Notify Me
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🛍️</span>
                <span className="text-xl font-bold">Shopee</span>
              </div>
              <p className="text-gray-400">
                Your trusted online shopping destination for quality products and great deals.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => alert('About Us page coming soon!')} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => alert('Contact page coming soon!')} className="hover:text-white transition-colors">Contact</button></li>
                <li><button onClick={() => alert('FAQ page coming soon!')} className="hover:text-white transition-colors">FAQ</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => alert('Help Center page coming soon!')} className="hover:text-white transition-colors">Help Center</button></li>
                <li><button onClick={() => alert('Returns page coming soon!')} className="hover:text-white transition-colors">Returns</button></li>
                <li><button onClick={() => alert('Shipping Info page coming soon!')} className="hover:text-white transition-colors">Shipping Info</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => alert('Privacy Policy page coming soon!')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => alert('Terms of Service page coming soon!')} className="hover:text-white transition-colors">Terms of Service</button></li>
                <li><button onClick={() => alert('Cookie Policy page coming soon!')} className="hover:text-white transition-colors">Cookie Policy</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Shopee. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Wishlist Modal */}
      {showWishlist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setShowWishlist(false)}>
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowWishlist(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
              <X size={24} />
            </button>
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My Wishlist</h2>
              <p className="text-gray-600">Your saved items</p>
            </div>

            {wishlist.length === 0 ? (
              <div className="text-center py-12">
                <Heart size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">Your wishlist is empty</p>
                <button
                  onClick={() => setShowWishlist(false)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {wishlist.map((product) => (
                  <div key={product._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {product.images && product.images.length > 0 ? (
                        <img src={`${API_URL}/${product.images[0]}`} alt={product.name} className="object-contain h-12 w-12" />
                      ) : (
                        <span className="text-gray-300 text-2xl">📦</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <div className="text-purple-600 font-bold">${product.price}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product._id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopeeUI;