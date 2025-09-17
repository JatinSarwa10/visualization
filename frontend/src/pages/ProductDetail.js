import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductViewer from '../components/ProductViewer';
import ProductService from '../services/productService';
import { formatPrice, capitalize, truncateText } from '../utils/helpers';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Load product data
  useEffect(() => {
    if (id) {
      loadProduct(id);
    } else {
      setError('No product ID provided');
      setLoading(false);
    }
  }, [id]);

  /**
   * Load product details from API
   */
  const loadProduct = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ProductService.getProductById(productId);
      
      if (response.success) {
        setProduct(response.data);
      } else {
        setError(response.error || 'Failed to load product');
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError('An unexpected error occurred while loading the product');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle back navigation
   */
  const handleGoBack = () => {
    navigate('/');
  };

  /**
   * Handle image selection
   */
  const handleImageSelect = (index) => {
    setSelectedImageIndex(index);
  };

  /**
   * Get product image URL
   */
  const getProductImage = (imagePath) => {
    return ProductService.getImageUrl(imagePath);
  };

  /**
   * Get product specifications
   */
  const getSpecifications = () => {
    if (!product?.specifications) return [];
    
    const specs = [];
    const { specifications } = product;
    
    if (specifications.dimensions) {
      specs.push({ label: 'Dimensions', value: specifications.dimensions });
    }
    if (specifications.weight) {
      specs.push({ label: 'Weight', value: specifications.weight });
    }
    if (specifications.material) {
      specs.push({ label: 'Material', value: specifications.material });
    }
    if (specifications.color) {
      specs.push({ label: 'Color', value: specifications.color });
    }
    
    return specs;
  };

  /**
   * Get animation information
   */
  const getAnimationInfo = () => {
    if (!product?.animations) return null;
    
    const { animations } = product;
    return {
      hasAnimations: animations.available && animations.available.length > 0,
      count: animations.available ? animations.available.length : 0,
      defaultAnimation: animations.defaultAnimation,
      autoPlay: animations.autoPlay
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-detail loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading Product Details...</h2>
          <p>Preparing your 3D experience</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-detail error">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Unable to Load Product</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button className="retry-button" onClick={() => loadProduct(id)}>
              Try Again
            </button>
            <button className="back-button" onClick={handleGoBack}>
              Back to Gallery
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No product found
  if (!product) {
    return (
      <div className="product-detail error">
        <div className="error-container">
          <div className="error-icon">🔍</div>
          <h2>Product Not Found</h2>
          <p>The requested product could not be found.</p>
          <button className="back-button" onClick={handleGoBack}>
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  const specifications = getSpecifications();
  const animationInfo = getAnimationInfo();

  return (
    <div className="product-detail">
      {/* Header */}
      <div className="product-header">
        <button className="back-button" onClick={handleGoBack}>
          ← Back to Gallery
        </button>
        <div className="header-actions">
          <button className="share-button" title="Share Product">
            CART
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="product-content">
        {/* Left Panel - Product Info */}
        <div className="product-info-panel">
          <div className="product-basic-info">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-category">{capitalize(product.category)}</p>
            <div className="product-price">{formatPrice(product.price)}</div>
            
            <div className="product-status">
              <span className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
              </span>
              {animationInfo?.hasAnimations && (
                <span className="animated-badge">
                  🎬 {animationInfo.count} Animation{animationInfo.count !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Product Images */}
          {((product.images && ((Array.isArray(product.images) && product.images.length > 0) || typeof product.images === 'string')) || product.image) && (
            <div className="product-images">
              <h3>Product Images</h3>
              <div className="image-gallery">
                <div className="main-image">
                  <img
                    src={getProductImage(
                      product.images 
                        ? (Array.isArray(product.images) 
                            ? product.images[selectedImageIndex] || product.images[0]
                            : product.images)
                        : product.image
                    )}
                    alt={product.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                {product.images && Array.isArray(product.images) && product.images.length > 1 && (
                  <div className="image-thumbnails">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                        onClick={() => handleImageSelect(index)}
                      >
                        <img
                          src={getProductImage(image)}
                          alt={`${product.name} ${index + 1}`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="product-description">
            <h3>Description</h3>
            <div className="description-content">
              {showFullDescription ? (
                <p>{product.description}</p>
              ) : (
                <p>{truncateText(product.description, 200)}</p>
              )}
              {product.description && product.description.length > 200 && (
                <button
                  className="toggle-description"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
          </div>

          {/* Specifications */}
          {specifications.length > 0 && (
            <div className="product-specifications">
              <h3>Specifications</h3>
              <div className="spec-grid">
                {specifications.map((spec, index) => (
                  <div key={index} className="spec-item">
                    <span className="spec-label">{spec.label}:</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3D Model Info */}
          <div className="model-info">
            <h3>3D Model Information</h3>
            <div className="model-details">
              <div className="model-detail-item">
                <span className="detail-label">Format:</span>
                <span className="detail-value">GLB/GLTF</span>
              </div>
              <div className="model-detail-item">
                <span className="detail-label">Interactive:</span>
                <span className="detail-value">✓ Rotate, Zoom, Pan</span>
              </div>
              {animationInfo?.hasAnimations && (
                <div className="model-detail-item">
                  <span className="detail-label">Animations:</span>
                  <span className="detail-value">
                    {animationInfo.count} available
                    {animationInfo.autoPlay && ' (Auto-play enabled)'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="product-actions">
            <button
              className={`add-to-cart-button ${!product.inStock ? 'disabled' : ''}`}
              disabled={!product.inStock}
            >
              {product.inStock ? '🛒 Add to Cart' : '❌ Out of Stock'}
            </button>
            <button className="wishlist-button">
              ❤️ Add to Wishlist
            </button>
          </div>
        </div>

        {/* Right Panel - 3D Viewer */}
        <div className="product-viewer-panel">
          <div className="viewer-header">
            <h3>Interactive 3D Model</h3>
            <p>Use mouse to rotate, zoom, and explore the product in 3D</p>
          </div>
          
          <div className="viewer-container">
            <ProductViewer
              product={product}
              enableControls={true}
              enableAnimations={true}
              autoRotate={false}
              className="product-detail-viewer"
            />
          </div>
          
          <div className="viewer-footer">
            <div className="viewer-tips">
              <div className="tip-item">
                <span className="tip-icon">🖱️</span>
                <span className="tip-text">Left click + drag to rotate</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🔍</span>
                <span className="tip-text">Mouse wheel to zoom</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">⚙️</span>
                <span className="tip-text">Click gear for advanced settings</span>
              </div>
              {animationInfo?.hasAnimations && (
                <div className="tip-item">
                  <span className="tip-icon">🎬</span>
                  <span className="tip-text">Animation controls available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="product-footer">
        <div className="footer-content">
          <p>Experience this product in stunning 3D detail. Rotate, zoom, and explore every angle.</p>
          <div className="footer-actions">
            <button className="footer-button" onClick={handleGoBack}>
              ← Browse More Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;