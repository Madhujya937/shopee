import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, X } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const getImageUrl = (img) => {
  if (!img) return '';
  return img.startsWith('http') ? img : `${API_URL}/uploads/${img}`;
};

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('shopee_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  // Reviews state (localStorage by productId)
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem(`shopee_reviews_${productId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('shopee_user') || 'null');
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(false);
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

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/products`)
      .then(res => {
        const found = res.data.find(p => p._id === productId);
        setProduct(found);
        setError(!found ? 'Product not found' : null);
        // Fetch related products if found
        if (found && found.category) {
          axios.get(`${API_URL}/api/products?category=${encodeURIComponent(found.category)}`)
            .then(r2 => {
              setRelated(r2.data.filter(p => p._id !== productId));
            });
        } else {
          setRelated([]);
        }
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoading(false));
  }, [productId]);

  const isInWishlist = (id) => wishlist.some(item => item._id === id);
  const addToWishlist = (prod) => {
    if (!isInWishlist(prod._id)) {
      const updated = [...wishlist, prod];
      setWishlist(updated);
      localStorage.setItem('shopee_wishlist', JSON.stringify(updated));
    }
  };
  const removeFromWishlist = (id) => {
    const updated = wishlist.filter(item => item._id !== id);
    setWishlist(updated);
    localStorage.setItem('shopee_wishlist', JSON.stringify(updated));
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!user) return alert('You must be logged in to leave a review.');
    if (!reviewText.trim()) return alert('Please enter your review.');
    setReviewSubmitting(true);
    const newReview = {
      id: Date.now(),
      user: user.name || user.email,
      rating: reviewRating,
      text: reviewText,
      date: new Date().toISOString(),
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`shopee_reviews_${productId}`, JSON.stringify(updated));
    setReviewText('');
    setReviewRating(5);
    setReviewSubmitting(false);
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
      if (!user || !user.token) {
        alert('You must be logged in to place an order.');
        setPaymentLoading(false);
        return;
      }

      // Add the current product to backend cart
      try {
        await axios.post(
          `${API_URL}/api/cart/add`,
          { productId: product._id, quantity: quantity },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      } catch (error) {
        console.error('Error adding item to backend cart:', error);
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
      
      // Clear payment form and close modal
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

  const handleBuyNow = () => {
    if (product.stock === 0 || quantity < 1) {
      alert('Product is out of stock or invalid quantity.');
      return;
    }
    setShowPaymentModal(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto p-4">
        <button onClick={() => navigate(-1)} className="flex items-center mb-4 text-purple-600 hover:underline">
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>
        <div className="bg-white rounded-xl shadow-lg p-6 relative">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col items-center">
              {/* Image Gallery */}
              {product.images && product.images.length > 0 ? (
                <>
                  <div
                    className={`relative w-full flex items-center justify-center bg-gray-100 rounded-lg p-4 cursor-zoom-in ${zoomed ? 'overflow-auto' : ''}`}
                    style={{ minHeight: 200, minWidth: 200 }}
                    onClick={() => setZoomed(z => !z)}
                  >
                    <img
                      src={getImageUrl(product.images[selectedImage])}
                      alt={product.name}
                      className={`object-contain h-48 w-full transition-transform duration-200 ${zoomed ? 'scale-150' : ''}`}
                      style={zoomed ? { cursor: 'zoom-out', zIndex: 10 } : {}}
                    />
                  </div>
                  <div className="flex gap-2 mt-2 justify-center">
                    {product.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={getImageUrl(img)}
                        alt={`Thumbnail ${idx + 1}`}
                        className={`h-12 w-12 object-contain rounded border-2 cursor-pointer ${selectedImage === idx ? 'border-purple-500' : 'border-gray-200'}`}
                        onClick={e => { e.stopPropagation(); setSelectedImage(idx); setZoomed(false); }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <span className="text-gray-300 text-6xl">📦</span>
              )}
            </div>
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              <div className="text-purple-600 font-bold text-xl mb-2">${product.price}</div>
              <p className="text-gray-700 mb-4">{product.description}</p>
              <div className="mb-4">
                <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium mr-2">{product.category}</span>
                {product.stock > 0 ? (
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium mr-2">In Stock: {product.stock}</span>
                ) : (
                  <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium mr-2">Out of Stock</span>
                )}
              </div>
              {/* Quantity Selector */}
              <div className="flex items-center gap-2 mb-4">
                <span className="font-medium">Quantity:</span>
                <button
                  className="px-2 py-1 bg-gray-200 rounded text-lg font-bold disabled:opacity-50"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  type="button"
                >-</button>
                <input
                  type="number"
                  className="w-14 text-center border border-gray-300 rounded"
                  value={quantity}
                  min={1}
                  max={product.stock}
                  onChange={e => {
                    let val = parseInt(e.target.value, 10);
                    if (isNaN(val) || val < 1) val = 1;
                    if (val > product.stock) val = product.stock;
                    setQuantity(val);
                  }}
                  disabled={product.stock === 0}
                />
                <button
                  className="px-2 py-1 bg-gray-200 rounded text-lg font-bold disabled:opacity-50"
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || product.stock === 0}
                  type="button"
                >+</button>
              </div>
              <div className="flex gap-3 mb-2">
                <button
                  onClick={() => {
                    setToast(true);
                    setTimeout(() => setToast(false), 2000);
                    alert(`Add to cart: ${quantity}`); // Replace with actual cart logic later
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-semibold transition-all disabled:opacity-50"
                  disabled={product.stock === 0 || quantity < 1}
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full font-semibold transition-all disabled:opacity-50"
                  disabled={product.stock === 0 || quantity < 1}
                >
                  Buy Now
                </button>
              </div>
              <button
                className={`p-2 rounded-full ${isInWishlist(product._id) ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'} hover:bg-pink-200 w-10 h-10`}
                onClick={() => isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)}
                title={isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart size={22} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
          {/* Reviews & Ratings */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              Reviews & Ratings
              {averageRating && (
                <span className="flex items-center text-yellow-500 font-bold ml-2">
                  {averageRating} ★
                  <span className="text-gray-500 font-normal ml-2">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                </span>
              )}
            </h2>
            {/* Review Form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Your Rating:</span>
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`text-2xl ${reviewRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                      onClick={() => setReviewRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full border border-gray-300 rounded p-2 mb-2"
                  rows={3}
                  placeholder="Write your review..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="mb-6 text-gray-500">Log in to leave a review.</div>
            )}
            {/* Review List */}
            {reviews.length === 0 ? (
              <div className="text-gray-400">No reviews yet. Be the first to review this product!</div>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-purple-700">{r.user}</span>
                      <span className="text-yellow-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      <span className="text-gray-400 text-xs ml-auto">{new Date(r.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-gray-700">{r.text}</div>
                  </div>
                ))}
              </div>
            )}
            {/* Related Products Section */}
            {related.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg font-bold mb-4 text-blue-700">Related Products</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {related.map(prod => (
                    <div
                      key={prod._id}
                      className="min-w-[180px] bg-white rounded-lg shadow p-3 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
                      onClick={() => navigate(`/product/${prod._id}`)}
                    >
                      <img
                        src={getImageUrl(prod.images[0])}
                        alt={prod.name}
                        className="h-24 w-24 object-contain mb-2 rounded"
                      />
                      <div className="font-semibold text-gray-800 text-center line-clamp-2 mb-1">{prod.name}</div>
                      <div className="text-purple-600 font-bold mb-1">${prod.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500"><X size={24} /></button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{paymentMethod === 'cod' ? 'Complete Your Order' : 'Complete Your Purchase'}</h2>
              <p className="text-gray-600 mt-2">Total: ${(product.price * quantity).toFixed(2)}</p>
              <p className="text-sm text-gray-500">Quantity: {quantity} × ${product.price}</p>
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
                {paymentLoading ? 'Processing Order...' : paymentMethod === 'cod' ? `Place Order - $${(product.price * quantity).toFixed(2)}` : `Pay $${(product.price * quantity).toFixed(2)}`}
              </button>
            </form>

            <div className="text-center mt-4 text-xs text-gray-500">
              {paymentMethod === 'cod' ? 'Your order information is secure and encrypted' : 'Your payment information is secure and encrypted'}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 transition-opacity duration-300 opacity-100 animate-bounce">
          Added to cart!
        </div>
      )}
    </div>
  );
};

export default ProductDetails; 