import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShoppingCart, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';

const API_URL = process.env.REACT_APP_API_URL;

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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

  const categories = [
    { id: 1, name: 'Fashion', icon: '👕', color: 'bg-pink-100' },
    { id: 2, name: 'Electronics', icon: '📱', color: 'bg-blue-100' },
    { id: 3, name: 'Home & Garden', icon: '🏠', color: 'bg-green-100' },
    { id: 4, name: 'Sports', icon: '⚽', color: 'bg-orange-100' },
    { id: 5, name: 'Beauty', icon: '💄', color: 'bg-purple-100' },
    { id: 6, name: 'Books', icon: '📚', color: 'bg-yellow-100' },
  ];

  const currentCategory = categories.find(cat => cat.name === categoryName);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/products`)
      .then(res => {
        const filteredProducts = res.data.filter(product => product.category === categoryName);
        setProducts(filteredProducts);
        setError(null);
      })
      .catch(err => {
        setError('Failed to load products');
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [categoryName]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      if (!user || !user.token) {
        alert('You must be logged in to place an order.');
        setPaymentLoading(false);
        return;
      }

      // Sync frontend cart with backend cart
      for (const item of cart) {
        try {
          await axios.post(
            `${API_URL}/api/cart/add`,
            { productId: item._id, quantity: item.quantity },
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
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

      // Place order via backend
      await axios.post(
        `${API_URL}/api/orders`,
        { shippingInfo },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      // Clear cart after successful order
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
      
      // Show success message
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
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button and Category Info */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-full transition-colors duration-200"
              >
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </button>
              {currentCategory && (
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{currentCategory.icon}</span>
                  <span className="text-xl font-semibold">{currentCategory.name}</span>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="w-full relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search in ${categoryName}...`}
                  className="w-full px-4 py-2 pl-4 pr-12 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                />
                <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* Cart Icon */}
            <div className="flex items-center space-x-4">
              <button 
                className="relative p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200" 
                onClick={() => setShowCart(true)}
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-40" onClick={() => setShowCart(false)}>
          <div className="w-full max-w-md bg-white h-full shadow-lg p-6 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-red-500">✕</button>
            </div>
            {cart.length === 0 ? (
              <div className="text-gray-400 text-center flex-1 flex items-center justify-center">Your cart is empty.</div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-4">
                  {cart.map(item => (
                    <div key={item._id} className="flex items-center space-x-4 border-b pb-2">
                      <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded">
                        <span className="text-gray-300 text-2xl">📦</span>
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
                      <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700">✕</button>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full font-semibold transition-all">Checkout</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">✕</button>
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">✕</button>
            
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {currentCategory && (
              <div className={`${currentCategory.color} p-4 rounded-xl`}>
                <span className="text-4xl">{currentCategory.icon}</span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{categoryName}</h1>
              <p className="text-gray-600">Discover amazing {categoryName.toLowerCase()} products</p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <section>
          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading products...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              {searchTerm 
                ? `No products found matching "${searchTerm}" in ${categoryName}.` 
                : `No products available in ${categoryName} category.`
              }
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product._id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col items-center cursor-pointer" onClick={() => setSelectedProduct(product)}>
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
      </main>
    </div>
  );
};

export default CategoryPage; 