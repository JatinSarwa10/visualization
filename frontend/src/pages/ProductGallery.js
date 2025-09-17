import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from '../services/productService';
import { formatPrice, capitalize, isEmpty, debounce } from '../utils/helpers';
import './ProductGallery.css';

const ProductGallery = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  const navigate = useNavigate();

  // Categories from the backend model
  const categories = ['All', 'Electronics', 'Furniture', 'Fashion', 'Home & Garden', 'Sports', 'Other'];

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products when search term or category changes
  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  /**
   * Load all products from the backend
   */
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ProductService.getAllProducts();
      
      if (response.success) {
        setProducts(response.data);
      } else {
        setError(response.error || 'Failed to load products');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('An unexpected error occurred while loading products');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter products based on search term and category
   */
  const filterProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => 
        product.category === selectedCategory
      );
    }

    // Filter by search term
    if (!isEmpty(searchTerm)) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(filtered);
  };

  /**
   * Handle search input with debouncing
   */
  const debouncedSearch = debounce((term) => {
    setSearchTerm(term);
  }, 300);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  /**
   * Handle category filter change
   */
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  /**
   * Handle product click - navigate to 3D viewer
   */
  const handleProductClick = (product) => {
    if (product && product._id) {
      navigate(`/product/${product._id}`);
    }
  };

  /**
   * Retry loading products
   */
  const handleRetry = () => {
    loadProducts();
  };

  /**
   * Get the first available image for a product
   */
  const getProductImage = (product) => {
    // Handle both 'images' array and 'image' string from database
    // Also handle case where 'images' is a string instead of array
    if (product.images) {
      if (Array.isArray(product.images) && product.images.length > 0) {
        // Return the first image directly if it's already a full URL, otherwise use getImageUrl
        const firstImage = product.images[0];
        return firstImage.startsWith('http') ? firstImage : ProductService.getImageUrl(firstImage);
      } else if (typeof product.images === 'string') {
        return product.images.startsWith('http') ? product.images : ProductService.getImageUrl(product.images);
      }
    }
    if (product.image) {
      return product.image.startsWith('http') ? product.image : ProductService.getImageUrl(product.image);
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-gallery">
        <div className="gallery-header">
          <h1>3D Product Gallery</h1>
          <p>Explore our collection of interactive 3D products</p>
        </div>
        
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-gallery">
        <div className="gallery-header">
          <h1>3D Product Gallery</h1>
          <p>Explore our collection of interactive 3D products</p>
        </div>
        
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Failed to Load Products</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      {/* Header Section */}
      <div className="gallery-header">
        <h1>3D Product Gallery</h1>
        <p>Explore our collection of interactive 3D products</p>
        <div className="product-count">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="gallery-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products..."
            onChange={handleSearchChange}
            className="search-input"
          />
          <div className="search-icon">🔍</div>
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div
              key={product._id}
              className="product-card"
              onClick={() => handleProductClick(product)}
            >
              <div className="product-image-container">
                {getProductImage(product) ? (
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    onLoad={(e) => {
                      e.target.nextSibling.style.display = 'none';
                    }}
                  />
                ) : null}
                <div className="image-placeholder" style={{ display: getProductImage(product) ? 'none' : 'flex' }}>
                  <div className="placeholder-icon">📦</div>
                  <span>3D Model</span>
                </div>
                
                <div className="product-overlay">
                  <div className="view-3d-badge">View in 3D</div>
                </div>
              </div>

              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">{capitalize(product.category)}</p>
                <div className="product-price">{formatPrice(product.price)}</div>
                
                <div className="product-meta">
                  <span className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                    {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                  </span>
                  {product.animations && product.animations.available && product.animations.available.length > 0 && (
                    <span className="animated-badge">🎬 Animated</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            <div className="no-products-icon">🔍</div>
            <h3>No Products Found</h3>
            <p>
              {searchTerm 
                ? `No products match "${searchTerm}" in ${selectedCategory === 'All' ? 'all categories' : selectedCategory}`
                : `No products available in ${selectedCategory}`
              }
            </p>
            {(searchTerm || selectedCategory !== 'All') && (
              <button 
                className="clear-filters-button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {filteredProducts.length > 0 && (
        <div className="gallery-footer">
          <p>Click on any product to view it in interactive 3D</p>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;