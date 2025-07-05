import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingCart, Heart, User, X } from 'lucide-react';
import axios from 'axios';

const AllCategories = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [user] = useState(() => {
    const saved = localStorage.getItem('shopee_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [wishlist, setWishlist] = useState([]);
  const [showWishlist, setShowWishlist] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'https://shopee-o2b3.onrender.com';

  const categories = [
    { id: 1, name: 'Fashion', icon: '👕', color: 'bg-gradient-to-br from-pink-100 to-red-100' },
    { id: 2, name: 'Electronics', icon: '📱', color: 'bg-gradient-to-br from-blue-100 to-indigo-100' },
    { id: 3, name: 'Home & Garden', icon: '🏠', color: 'bg-gradient-to-br from-green-100 to-emerald-100' },
    { id: 4, name: 'Sports', icon: '⚽', color: 'bg-gradient-to-br from-orange-100 to-yellow-100' },
    { id: 5, name: 'Beauty', icon: '💄', color: 'bg-gradient-to-br from-purple-100 to-pink-100' },
    { id: 6, name: 'Books', icon: '📚', color: 'bg-gradient-to-br from-gray-100 to-slate-100' }
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Clear category selection when searching
    if (searchTerm.trim()) {
      setSelectedCategory(null);
    }
    setShowSearchSuggestions(false);
    // Focus back to search input for better UX
    e.target.querySelector('input')?.focus();
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const addToCart = (product) => {
    // Add to cart functionality
    console.log('Added to cart:', product);
  };

  const addToWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item._id === product._id);
      if (!exists) {
        return [...prev, product];
      }
      return prev;
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item._id !== productId));
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory.name;
    return matchesSearch && matchesCategory;
  });

  const cartCount = 0; // This would come from cart context

  return (
    <div className="min-h-screen bg-gray-50">
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
                <span>Back to Home</span>
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🏷️</span>
                <span className="text-xl font-semibold">All Categories</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200">
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
              {user ? (
                <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200">
                  <User size={20} />
                </button>
              ) : (
                <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200">
                  <User size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="pb-4">
            <form onSubmit={handleSearch} className="relative">
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
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-12 pr-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch(e);
                  }
                }}
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors duration-200"
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
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
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-3xl mr-2">🏷️</span>
              All Categories
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Show All Categories
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`${category.color} ${
                  selectedCategory?.id === category.id ? 'scale-95 bg-opacity-80 ring-2 ring-purple-500' : ''
                } p-6 rounded-xl text-center cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md`}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-gray-800">{category.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {products.filter(p => p.category === category.name).length} products
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Products Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory ? `${selectedCategory.name} Products` : 'All Products'}
            </h2>
            <p className="text-gray-600">{filteredProducts.length} products found</p>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading products...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              {selectedCategory ? `No products found in ${selectedCategory.name}` : 'No products available.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
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
                  <div className="text-sm text-gray-500 mb-3">{product.category}</div>
                  <div className="flex gap-2 w-full">
                    <button 
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-full font-semibold transition-all text-sm" 
                      onClick={e => { e.stopPropagation(); addToCart(product); }}
                    >
                      Add to Cart
                    </button>
                    <button 
                      className={`p-2 rounded-full transition-all ${
                        isInWishlist(product._id) 
                          ? 'bg-pink-500 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-pink-100'
                      }`}
                      onClick={e => { 
                        e.stopPropagation(); 
                        if (isInWishlist(product._id)) {
                          removeFromWishlist(product._id);
                        } else {
                          addToWishlist(product);
                        }
                      }}
                    >
                      <Heart size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

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

export default AllCategories; 