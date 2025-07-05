import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Edit, Save, X, Package } from 'lucide-react';
import axios from 'axios';

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(() => {
    const saved = localStorage.getItem('shopee_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [activeTab, setActiveTab] = useState('profile');

  const API_URL = process.env.REACT_APP_API_URL || 'https://shopee-o2b3.onrender.com';

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && (tabParam === 'profile' || tabParam === 'orders')) {
      setActiveTab(tabParam);
    }
    
    fetchUserData();
  }, [user, navigate, location.search]);

  const fetchUserData = async () => {
    try {
      // Fetch wishlist (you'll need to implement this backend endpoint)
      // const wishlistRes = await axios.get(`${API_URL}/api/wishlist`, {
      //   headers: { Authorization: `Bearer ${user.token}` }
      // });
      // setWishlist(wishlistRes.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const response = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // If token is invalid, redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('shopee_user');
        navigate('/');
      }
    } finally {
      setOrdersLoading(false);
    }
  }, [API_URL, user.token, navigate]);

  const handleProfileUpdate = async () => {
    try {
      // Update profile (you'll need to implement this backend endpoint)
      // const res = await axios.put(`${API_URL}/api/users/profile`, profileData, {
      //   headers: { Authorization: `Bearer ${user.token}` }
      // });
      // setUser(res.data.user);
      // localStorage.setItem('shopee_user', JSON.stringify(res.data.user));
      
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '⚙️';
      case 'shipped': return '📦';
      case 'delivered': return '✅';
      default: return '📋';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-full transition-colors duration-200"
              >
                <ArrowLeft size={20} />
                <span>Back to Shop</span>
              </button>
              <div className="flex items-center space-x-2">
                <User size={24} />
                <span className="text-xl font-semibold">My Profile</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500">Member since {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile' 
                    ? 'border-purple-500 text-purple-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'orders' 
                    ? 'border-purple-500 text-purple-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Orders
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditing(false)}
                        className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleProfileUpdate}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Save size={16} />
                        <span>Save</span>
                      </button>
                    </div>
                  )}
                </div>
                {/* Action Buttons */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {editing ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.name || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <p className="text-gray-900">{profileData.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    {editing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.phone || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    {editing ? (
                      <textarea
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.address || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

                         {/* Orders Tab */}
             {activeTab === 'orders' && (
               <div className="space-y-6">
                 <div className="flex items-center justify-between">
                   <h2 className="text-xl font-semibold text-gray-900">My Orders</h2>
                   <button
                     onClick={fetchOrders}
                     className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                   >
                     Refresh
                   </button>
                 </div>
                 
                 {ordersLoading ? (
                   <div className="flex items-center justify-center py-8">
                     <div className="text-gray-500">Loading orders...</div>
                   </div>
                 ) : orders.length > 0 ? (
                   <div className="space-y-4">
                     {orders.map((order) => (
                       <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                         <div className="flex items-start justify-between mb-4">
                           <div className="flex items-center space-x-3">
                             <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl">
                               {getOrderStatusIcon(order.status)}
                             </div>
                             <div>
                               <h3 className="text-lg font-semibold text-gray-900">Order #{order._id.slice(-8)}</h3>
                               <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                             </div>
                           </div>
                           <div className={`px-3 py-1 text-sm font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                             {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                           </div>
                         </div>
                         
                         <div className="space-y-3">
                           <div className="flex items-center justify-between text-sm">
                             <span className="text-gray-600">Total Amount:</span>
                             <span className="font-semibold text-gray-900">${order.totalAmount?.toFixed(2)}</span>
                           </div>
                           <div className="flex items-center justify-between text-sm">
                             <span className="text-gray-600">Payment Status:</span>
                             <span className={`font-medium ${
                               order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                             }`}>
                               {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                             </span>
                           </div>
                         </div>
                         
                         {order.products && order.products.length > 0 && (
                           <div className="mt-4 pt-4 border-t border-gray-200">
                             <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items:</h4>
                             <div className="space-y-2">
                               {order.products.map((item, index) => (
                                 <div key={index} className="flex items-center justify-between text-sm">
                                   <div className="flex items-center space-x-3">
                                     {item.product?.image && (
                                       <img 
                                         src={`${API_URL}/${item.product.image}`} 
                                         alt={item.product.name}
                                         className="w-8 h-8 object-cover rounded"
                                       />
                                     )}
                                     <span className="text-gray-900">{item.product?.name || 'Product'}</span>
                                   </div>
                                   <div className="flex items-center space-x-2 text-gray-600">
                                     <span>Qty: {item.quantity}</span>
                                     <span>•</span>
                                     <span>${item.product?.price?.toFixed(2) || '0.00'}</span>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         )}
                         
                         {order.shippingInfo && Object.keys(order.shippingInfo).length > 0 && (
                           <div className="mt-4 pt-4 border-t border-gray-200">
                             <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Information:</h4>
                             <div className="text-sm text-gray-600">
                               {order.shippingInfo.address && (
                                 <p>{order.shippingInfo.address}</p>
                               )}
                               {order.shippingInfo.city && (
                                 <p>{order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}</p>
                               )}
                             </div>
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8">
                     <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                     <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                     <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                     <button
                       onClick={() => navigate('/')}
                       className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                     >
                       Start Shopping
                     </button>
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile; 