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
  
  // Handle different image path formats
  if (!imagePath) return '';
  
  // If imagePath already includes 'uploads/', use it as is
  if (imagePath.startsWith('uploads/')) {
    return `${cleanBaseUrl}/${imagePath}`;
  }
  
  // If imagePath is just a filename, add uploads/ prefix
  return `${cleanBaseUrl}/uploads/${imagePath}`;
};

export { getApiUrl, getImageUrl };
export default getApiUrl; 