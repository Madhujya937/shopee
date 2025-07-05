// Utility function to construct API URLs properly
const getApiUrl = (endpoint) => {
  const baseUrl = process.env.REACT_APP_API_URL || 'https://shopee-o2b3.onrender.com';
  // Remove trailing slash from base URL and ensure proper concatenation
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `${cleanBaseUrl}${endpoint}`;
};

// Utility function for image URLs
const getImageUrl = (imagePath) => {
  const baseUrl = process.env.REACT_APP_API_URL || 'https://shopee-o2b3.onrender.com';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `${cleanBaseUrl}/${imagePath}`;
};

export { getApiUrl, getImageUrl };
export default getApiUrl; 