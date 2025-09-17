import api from './api';

/**
 * Service class for handling product-related API calls
 */
class ProductService {
  /**
   * Fetch all products from the backend
   * @returns {Promise} Promise containing products array
   */
  static async getAllProducts() {
    try {
      const response = await api.get('/products');
      return {
        success: true,
        data: response.data.data || [],
        count: response.data.count || 0,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch products',
        data: [],
        count: 0,
      };
    }
  }

  /**
   * Fetch a single product by ID
   * @param {string} productId - The product ID to fetch
   * @returns {Promise} Promise containing product object
   */
  static async getProductById(productId) {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const response = await api.get(`/products/${productId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch product',
        data: null,
      };
    }
  }

  /**
   * Fetch products by category
   * @param {string} category - The category to filter by
   * @returns {Promise} Promise containing filtered products array
   */
  static async getProductsByCategory(category) {
    try {
      if (!category) {
        throw new Error('Category is required');
      }

      const response = await api.get(`/products/category/${encodeURIComponent(category)}`);
      return {
        success: true,
        data: response.data.data || [],
        count: response.data.count || 0,
      };
    } catch (error) {
      console.error(`Error fetching products for category ${category}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch products by category',
        data: [],
        count: 0,
      };
    }
  }

  /**
   * Health check for the API
   * @returns {Promise} Promise containing health status
   */
  static async healthCheck() {
    try {
      const response = await api.get('/health');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Health check failed',
      };
    }
  }

  /**
   * Get the base URL for static assets (models and images)
   * @returns {string} Base URL for static assets
   */
  static getAssetBaseUrl() {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    return baseUrl.replace('/api', '');
  }

  /**
   * Get full URL for a 3D model file
   * @param {string} modelPath - The relative path to the model file
   * @returns {string} Full URL to the model file
   */
  static getModelUrl(modelPath) {
    if (!modelPath) return null;
    const baseUrl = this.getAssetBaseUrl();
    
    // Extract just the filename from the path
    let filename = modelPath;
    
    // Remove leading slash
    if (filename.startsWith('/')) {
      filename = filename.substring(1);
    }
    
    // Remove 'models/' prefix if it exists
    if (filename.startsWith('models/')) {
      filename = filename.substring(7);
    }
    
    return `${baseUrl}/models/${filename}`;
  }

  /**
   * Get full URL for a product image
   * @param {string} imagePath - The relative path to the image file
   * @returns {string} Full URL to the image file
   */
  static getImageUrl(imagePath) {
    if (!imagePath) return null;
    
    // If it's already a full URL (http/https), return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    const baseUrl = this.getAssetBaseUrl();
    
    // Extract just the filename from the path
    let filename = imagePath;
    
    // Remove leading slash
    if (filename.startsWith('/')) {
      filename = filename.substring(1);
    }
    
    // Remove 'images/' prefix if it exists
    if (filename.startsWith('images/')) {
      filename = filename.substring(7);
    }
    
    return `${baseUrl}/images/${filename}`;
  }

}

export default ProductService;