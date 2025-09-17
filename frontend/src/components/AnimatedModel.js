import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useAnimations, useBounds, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  validateModelUrl, 
  validateLoadedModel, 
  analyzeModelComplexity, 
  getModelErrorMessage,
  sanitizeModelUrl
} from '../utils/modelValidation';
import './AnimatedModel.css';

const AnimatedModel = ({ 
  modelUrl, 
  onLoad, 
  onError, 
  onProgress,
  autoRotate = false,
  rotationSpeed = 0.01,
  scale = 1,
  position = [0, 0, 0],
  currentAnimation = null,
  animationSpeed = 1,
  playAnimations = false,
  enableBounds = true,
  ...props 
}) => {
  const groupRef = useRef();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [modelError, setModelError] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [complexity, setComplexity] = useState(null);
  
  // Sanitize the model URL
  const sanitizedUrl = useMemo(() => sanitizeModelUrl(modelUrl), [modelUrl]);
  
  // Load the GLTF model
  const gltf = useLoader(
    GLTFLoader,
    sanitizedUrl,
    (loader) => {
      // Progress callback
      loader.manager.onProgress = (url, loaded, total) => {
        if (total > 0) {
          const progress = Math.round((loaded / total) * 100);
          setLoadingProgress(progress);
          onProgress?.(progress);
        }
      };
    }
  );

  // Set up animations
  const { actions, names, clips } = useAnimations(gltf.animations, groupRef);

  // Bounds API for auto-fitting
  const bounds = useBounds();

  useEffect(() => {
    // Validate model URL
    const urlValidation = validateModelUrl(sanitizedUrl);
    if (!urlValidation.isValid) {
      const error = new Error(urlValidation.error);
      setModelError(error);
      onError?.(error);
      return;
    }

    if (gltf) {
      // Validate loaded model
      const modelValidation = validateLoadedModel(gltf);
      if (!modelValidation.isValid) {
        const error = new Error(modelValidation.error);
        setModelError(error);
        onError?.(error);
        return;
      }

      // Analyze model complexity
      const complexityInfo = analyzeModelComplexity(gltf);
      setComplexity(complexityInfo);

      // Center and fit the model perfectly
      if (enableBounds && gltf.scene) {
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center the model at origin
        gltf.scene.position.copy(center).multiplyScalar(-1);
        
        // Calculate optimal scale to fit perfectly in viewer
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          // Use 3.5 as target size for perfect fit (adjusted for viewer size)
          const targetSize = 3.5;
          const scaleFactor = (targetSize / maxDim) * scale;
          gltf.scene.scale.setScalar(scaleFactor);
        }
      }

      // Enable shadows for better visuals
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Ensure materials are properly configured
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.side = THREE.FrontSide;
                if (mat.map) mat.map.flipY = false;
              });
            } else {
              child.material.side = THREE.FrontSide;
              if (child.material.map) child.material.map.flipY = false;
            }
          }
        }
      });

      setModelLoaded(true);
      setModelError(null);
      onLoad?.(gltf, complexityInfo);
    }
  }, [gltf, onLoad, onError, enableBounds, scale, sanitizedUrl]);

  // Handle animation playback
  useEffect(() => {
    if (!actions || names.length === 0) return;


    // Stop all animations first
    Object.values(actions).forEach(action => {
      action?.stop();
    });

    if (playAnimations && names.length > 0) {
      let animationToPlay = null;
      
      // Try to find the requested animation
      if (currentAnimation && actions[currentAnimation]) {
        animationToPlay = currentAnimation;
      } else {
        // If requested animation not found, try common animation names
        const commonNames = ['idle', 'animation', 'action', 'default', names[0]];
        for (const name of commonNames) {
          if (name && actions[name]) {
            animationToPlay = name;
            break;
          }
        }
      }
      
      if (animationToPlay && actions[animationToPlay]) {
        const action = actions[animationToPlay];
        action.reset();
        action.setLoop(THREE.LoopRepeat);
        action.timeScale = animationSpeed;
        action.play();
      }
    }

    // Cleanup function
    return () => {
      Object.values(actions).forEach(action => {
        action?.stop();
      });
    };
  }, [actions, names, currentAnimation, playAnimations, animationSpeed]);

  // Auto-rotation animation
  useFrame((state, delta) => {
    if (autoRotate && groupRef.current && !playAnimations) {
      groupRef.current.rotation.y += rotationSpeed;
    }
  });

  // Error handling
  if (modelError) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#ff4444" />
        </mesh>
        <Html center>
          <div className="model-error">
            <div className="error-icon">❌</div>
            <div className="error-message">
              {getModelErrorMessage(modelError)}
            </div>
          </div>
        </Html>
      </group>
    );
  }

  if (!gltf) {
    return (
      <group>
        <Html center>
          <div className="model-loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">
              Loading 3D Model... {loadingProgress}%
            </div>
          </div>
        </Html>
      </group>
    );
  }

  return (
    <group
      ref={groupRef}
      position={position}
      {...props}
    >
      <primitive object={gltf.scene} />
      
      {/* Optional complexity indicator */}
      {complexity && complexity.complexity === 'high' && (
        <Html
          position={[2, 2, 0]}
          style={{
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <div className="complexity-indicator high">
            High Detail Model
          </div>
        </Html>
      )}
    </group>
  );
};

// Error boundary component for the 3D model
const ModelErrorBoundary = ({ children, onError }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (error) => {
      setHasError(true);
      setError(error);
      onError?.(error);
    };

    // Global error handler for Three.js errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('THREE.') || message.includes('WebGL')) {
        handleError(new Error(message));
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, [onError]);

  if (hasError) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
        <Html center>
          <div className="model-error-boundary">
            <h3>3D Model Error</h3>
            <p>{error?.message || 'An unexpected error occurred'}</p>
          </div>
        </Html>
      </group>
    );
  }

  return children;
};

// Wrapper component with error boundary
const SafeAnimatedModel = (props) => {
  return (
    <ModelErrorBoundary onError={props.onError}>
      <AnimatedModel {...props} />
    </ModelErrorBoundary>
  );
};

export default SafeAnimatedModel;