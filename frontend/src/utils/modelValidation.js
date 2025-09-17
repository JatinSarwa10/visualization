/**
 * Utility functions for 3D model validation and handling
 */

/**
 * Validates if a URL points to a valid 3D model file
 * @param {string} url - The URL to validate
 * @returns {object} Validation result with success and error details
 */
export const validateModelUrl = (url) => {
  if (!url) {
    return {
      isValid: false,
      error: 'Model URL is required',
      type: 'missing_url'
    };
  }

  // Check if URL is a string
  if (typeof url !== 'string') {
    return {
      isValid: false,
      error: 'Model URL must be a string',
      type: 'invalid_type'
    };
  }

  // Check for supported file extensions
  const supportedExtensions = ['.glb', '.gltf'];
  const hasValidExtension = supportedExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  );

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: `Model must be one of these formats: ${supportedExtensions.join(', ')}`,
      type: 'unsupported_format'
    };
  }

  // Basic URL format validation
  try {
    new URL(url);
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format',
      type: 'invalid_url'
    };
  }

  return {
    isValid: true,
    error: null,
    type: getModelType(url)
  };
};

/**
 * Determines the 3D model type from URL
 * @param {string} url - The model URL
 * @returns {string} Model type ('glb' or 'gltf')
 */
export const getModelType = (url) => {
  if (!url) return 'unknown';
  
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('.glb')) return 'glb';
  if (lowerUrl.includes('.gltf')) return 'gltf';
  return 'unknown';
};

/**
 * Validates model loading response
 * @param {object} model - The loaded 3D model object
 * @returns {object} Validation result
 */
export const validateLoadedModel = (model) => {
  if (!model) {
    return {
      isValid: false,
      error: 'Model object is null or undefined',
      type: 'null_model'
    };
  }

  // Check if model has scene (GLTF structure)
  if (!model.scene) {
    return {
      isValid: false,
      error: 'Model missing scene object',
      type: 'missing_scene'
    };
  }

  // Check if scene has children (geometry/meshes)
  if (!model.scene.children || model.scene.children.length === 0) {
    return {
      isValid: false,
      error: 'Model scene has no children (empty model)',
      type: 'empty_scene'
    };
  }

  return {
    isValid: true,
    error: null,
    meshCount: countMeshes(model.scene),
    hasAnimations: model.animations && model.animations.length > 0,
    animationCount: model.animations ? model.animations.length : 0
  };
};

/**
 * Recursively counts meshes in a 3D object
 * @param {object} object3D - Three.js Object3D
 * @returns {number} Number of meshes found
 */
const countMeshes = (object3D) => {
  let count = 0;
  
  if (object3D.type === 'Mesh') {
    count++;
  }
  
  if (object3D.children) {
    object3D.children.forEach(child => {
      count += countMeshes(child);
    });
  }
  
  return count;
};

/**
 * Estimates model complexity based on various factors
 * @param {object} model - The loaded 3D model
 * @returns {object} Complexity analysis
 */
export const analyzeModelComplexity = (model) => {
  if (!model || !model.scene) {
    return {
      complexity: 'unknown',
      meshCount: 0,
      triangleCount: 0,
      textureCount: 0,
      animationCount: 0
    };
  }

  const meshCount = countMeshes(model.scene);
  const triangleCount = countTriangles(model.scene);
  const animationCount = model.animations ? model.animations.length : 0;
  
  // Simple complexity estimation
  let complexity = 'low';
  if (triangleCount > 50000 || meshCount > 50) complexity = 'high';
  else if (triangleCount > 10000 || meshCount > 20) complexity = 'medium';

  return {
    complexity,
    meshCount,
    triangleCount,
    animationCount,
    hasAnimations: animationCount > 0
  };
};

/**
 * Counts triangles in a 3D model
 * @param {object} object3D - Three.js Object3D
 * @returns {number} Estimated triangle count
 */
const countTriangles = (object3D) => {
  let count = 0;
  
  if (object3D.type === 'Mesh' && object3D.geometry) {
    const geometry = object3D.geometry;
    if (geometry.index) {
      count += geometry.index.count / 3;
    } else if (geometry.attributes && geometry.attributes.position) {
      count += geometry.attributes.position.count / 3;
    }
  }
  
  if (object3D.children) {
    object3D.children.forEach(child => {
      count += countTriangles(child);
    });
  }
  
  return Math.floor(count);
};

/**
 * Checks if model loading failed due to CORS issues
 * @param {Error} error - The loading error
 * @returns {boolean} True if error is CORS-related
 */
export const isCorsError = (error) => {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString();
  const corsKeywords = [
    'cors',
    'cross-origin',
    'access-control',
    'network error',
    'failed to fetch'
  ];
  
  return corsKeywords.some(keyword => 
    errorMessage.toLowerCase().includes(keyword)
  );
};

/**
 * Provides user-friendly error messages for model loading failures
 * @param {Error} error - The loading error
 * @returns {string} User-friendly error message
 */
export const getModelErrorMessage = (error) => {
  if (!error) return 'Unknown error occurred';

  if (isCorsError(error)) {
    return 'Unable to load 3D model due to network restrictions. Please check if the model file is accessible.';
  }

  const errorMessage = error.message || error.toString();
  
  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return '3D model file not found. Please check if the file exists on the server.';
  }
  
  if (errorMessage.includes('parse') || errorMessage.includes('format')) {
    return 'Invalid 3D model format. Please ensure the file is a valid GLB or GLTF file.';
  }
  
  if (errorMessage.includes('timeout')) {
    return 'Model loading timed out. The file might be too large or the server is slow.';
  }
  
  return `Failed to load 3D model: ${errorMessage}`;
};

/**
 * Default model validation configuration
 */
export const MODEL_VALIDATION_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  supportedFormats: ['.glb', '.gltf'],
  timeout: 30000, // 30 seconds
  maxTriangles: 100000,
  maxMeshes: 100
};

/**
 * Sanitizes model URL for safe usage
 * @param {string} url - The model URL
 * @returns {string} Sanitized URL
 */
export const sanitizeModelUrl = (url) => {
  if (!url) return null;
  
  // Remove any potential script injections
  const sanitized = url.toString().trim();
  
  // Basic validation to prevent obvious security issues
  if (sanitized.includes('javascript:') || sanitized.includes('data:text/html')) {
    return null;
  }
  
  return sanitized;
};