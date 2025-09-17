import React, { useEffect, useState } from 'react';
import ProductService from '../services/productService';

const DebugInfo = () => {
  const [apiStatus, setApiStatus] = useState('checking...');
  const [sampleProduct, setSampleProduct] = useState(null);
  
  useEffect(() => {
    const testAPI = async () => {
      try {
        // Test health check
        const health = await ProductService.healthCheck();
        console.log('Health check:', health);
        
        // Test getting products
        const products = await ProductService.getAllProducts();
        console.log('Products response:', products);
        
        if (products.success && products.data.length > 0) {
          const firstProduct = products.data[0];
          setSampleProduct(firstProduct);
          setApiStatus('✅ API Working');
          
          // Test URL generation
          console.log('Sample product:', firstProduct);
          console.log('Model URL:', ProductService.getModelUrl(firstProduct.model3d));
          console.log('Image URL:', ProductService.getImageUrl(firstProduct.image || (firstProduct.images && firstProduct.images[0])));
        } else {
          setApiStatus('❌ No products found');
        }
      } catch (error) {
        console.error('API Test failed:', error);
        setApiStatus('❌ API Failed');
      }
    };
    
    testAPI();
  }, []);
  
  if (!sampleProduct) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        <div>API Status: {apiStatus}</div>
        <div>Backend: http://localhost:5000</div>
      </div>
    );
  }
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'rgba(0,0,0,0.9)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '11px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <div><strong>Debug Info</strong></div>
      <div>API: {apiStatus}</div>
      <div>Sample Product: {sampleProduct.name}</div>
      <div>Model Path: {sampleProduct.model3d}</div>
      <div>Generated Model URL: {ProductService.getModelUrl(sampleProduct.model3d)}</div>
      <div>Image Path: {sampleProduct.image || (sampleProduct.images && sampleProduct.images[0])}</div>
      <div>Generated Image URL: {ProductService.getImageUrl(sampleProduct.image || (sampleProduct.images && sampleProduct.images[0]))}</div>
    </div>
  );
};

export default DebugInfo;