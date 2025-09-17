import React, { useRef, useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  PresentationControls,
  Stage,
  Grid
} from '@react-three/drei';
import * as THREE from 'three';
import AnimatedModel from './AnimatedModel';
import ViewerControls from './ViewerControls';
import AnimationControls from './AnimationControls';
import ProductService from '../services/productService';
import './ProductViewer.css';

// Scene lighting component
const SceneLighting = ({ environment, quality }) => {
  const lightIntensity = quality === 'high' ? 2 : quality === 'medium' ? 1.5 : 1;
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={lightIntensity}
        castShadow={quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
    </>
  );
};

// Loading fallback component
const LoadingFallback = ({ progress = 0 }) => (
  <div className="viewer-loading">
    <div className="loading-cube">
      <div className="cube-face front"></div>
      <div className="cube-face back"></div>
      <div className="cube-face right"></div>
      <div className="cube-face left"></div>
      <div className="cube-face top"></div>
      <div className="cube-face bottom"></div>
    </div>
    <div className="loading-text">
      Loading 3D Model... {progress}%
    </div>
  </div>
);

const ProductViewer = ({ 
  product, 
  modelUrl,
  enableControls = true,
  enableAnimations = true,
  autoRotate = true,
  className = '',
  targetSize = 3, // Target size for model fitting
  ...props 
}) => {
  // Refs
  const canvasRef = useRef();
  const controlsRef = useRef();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  
  // Model positioning and scaling
  const [modelScale, setModelScale] = useState(1);
  const [modelPosition, setModelPosition] = useState([0, 0, 0]);
  const [normalizedScale, setNormalizedScale] = useState(1);
  
  // Viewer settings
  const [wireframeMode, setWireframeMode] = useState(false);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(autoRotate);
  const [rotationSpeed, setRotationSpeed] = useState(0.01);
  const [environment, setEnvironment] = useState('studio');
  const [quality, setQuality] = useState('medium');
  
  // Animation settings
  const [availableAnimations, setAvailableAnimations] = useState([]);
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [playAnimations, setPlayAnimations] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // Get model URL from product or use provided modelUrl
  const getModelUrl = useCallback(() => {
    if (modelUrl) return modelUrl;
    if (product?.model3d) {
      return ProductService.getModelUrl(product.model3d);
    }
    return null;
  }, [modelUrl, product]);

  // Calculate model bounds and normalize size/position
  const normalizeModel = useCallback((gltf) => {
    const scene = gltf.scene;
    
    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Get the largest dimension
    const maxDimension = Math.max(size.x, size.y, size.z);
    
    // Calculate scale to fit within target size
    const scale = maxDimension > 0 ? targetSize / maxDimension : 1;
    
    // Center the model
    const centeredPosition = [
      -center.x * scale,
      -center.y * scale,
      -center.z * scale
    ];
    
    setNormalizedScale(scale);
    setModelPosition(centeredPosition);
    setModelScale(scale); // Set initial scale to normalized scale
    
    return {
      originalSize: size,
      boundingBox: box,
      center: center,
      normalizedScale: scale,
      centeredPosition: centeredPosition
    };
  }, [targetSize]);

  // Handle model loading success
  const handleModelLoad = useCallback((gltf, complexity) => {
    setIsLoading(false);
    setError(null);
    
    // Normalize the model size and position
    const normalizationData = normalizeModel(gltf);
    
    // Set model info with normalization data
    setModelInfo({
      ...complexity,
      ...normalizationData
    });
    
    // Extract animation names from actual GLB file
    if (gltf.animations && gltf.animations.length > 0) {
      const animNames = gltf.animations.map(clip => clip.name).filter(name => name);
    
      setAvailableAnimations(animNames);
    
      // Auto-play animations
      if (product?.animations?.autoPlay) {
        if (product.animations.defaultAnimation && animNames.includes(product.animations.defaultAnimation)) {
          // Use database animation if it exists in the GLB
          setCurrentAnimation(product.animations.defaultAnimation);
          setPlayAnimations(true);
        } else if (animNames.length > 0) {
          // Otherwise use the first available animation
          setCurrentAnimation(animNames[0]);
          setPlayAnimations(true);
        }
      }
    } else {
      setAvailableAnimations([]);
    }
  }, [product, normalizeModel]);

  // Handle model loading error
  const handleModelError = useCallback((error) => {
    setIsLoading(false);
    setError(error);
  }, []);

  // Handle loading progress
  const handleLoadingProgress = useCallback((progress) => {
    setLoadingProgress(progress);
  }, []);

  // Control handlers
  const handleWireframeToggle = useCallback((enabled) => {
    setWireframeMode(enabled);
  }, []);

  const handleRotationToggle = useCallback((enabled) => {
    setAutoRotateEnabled(enabled);
  }, []);

  const handleRotationSpeedChange = useCallback((speed) => {
    setRotationSpeed(speed);
  }, []);

  const handleScaleChange = useCallback((scale) => {
    // Scale relative to the normalized scale
    setModelScale(normalizedScale * scale);
  }, [normalizedScale]);

  const handleEnvironmentChange = useCallback((env) => {
    setEnvironment(env);
  }, []);

  const handleQualityChange = useCallback((q) => {
    setQuality(q);
  }, []);

  const handleResetCamera = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, []);

  const handleResetModel = useCallback(() => {
    setModelScale(normalizedScale); // Reset to normalized scale
    setAutoRotateEnabled(autoRotate);
    setRotationSpeed(0.01);
    setWireframeMode(false);
    setEnvironment('studio');
    setQuality('medium');
    handleResetCamera();
  }, [autoRotate, normalizedScale]);

  // Animation control handlers
  const handleAnimationToggle = useCallback((enabled) => {
    setPlayAnimations(enabled);
  }, []);

  const handleAnimationChange = useCallback((animationName) => {
    setCurrentAnimation(animationName);
    if (animationName) {
      setPlayAnimations(true);
    }
  }, []);

  const handleAnimationSpeedChange = useCallback((speed) => {
    setAnimationSpeed(speed);
  }, []);

  // Get the actual model URL
  const actualModelUrl = getModelUrl();

  if (!actualModelUrl) {
    return (
      <div className={`product-viewer error ${className}`} {...props}>
        <div className="viewer-error">
          <div className="error-icon">❌</div>
          <h3>No 3D Model Available</h3>
          <p>This product doesn't have a 3D model associated with it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`product-viewer ${className}`} {...props}>
      {/* Main 3D Canvas */}
      <div className="viewer-canvas-container">
        <Canvas
          ref={canvasRef}
          className="viewer-canvas"
          shadows={quality !== 'low'}
          camera={{ 
            position: [0, 2, 8], 
            fov: 50,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: quality !== 'low',
            alpha: true,
            powerPreference: quality === 'high' ? 'high-performance' : 'default'
          }}
        >
          {/* Scene setup */}
          <color attach="background" args={['#f5f5f5']} />
          
          {/* Controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            dampingFactor={0.05}
            autoRotate={autoRotateEnabled}
            autoRotateSpeed={rotationSpeed * 100}
            maxDistance={20}
            minDistance={2}
            enableDamping={true}
            target={[0, 0, 0]} // Always target center
          />

          {/* Lighting */}
          <SceneLighting environment={environment} quality={quality} />

          {/* Environment */}
          <Environment 
            preset={environment} 
            background={false}
          />

          {/* Ground and shadows */}
          {quality !== 'low' && (
            <ContactShadows
              position={[0, -targetSize/2 - 0.5, 0]}
              opacity={0.4}
              scale={targetSize * 2}
              blur={2.5}
              far={4}
            />
          )}

          {/* Grid helper for reference (optional) */}
          {wireframeMode && (
            <Grid
              position={[0, -targetSize/2 - 0.5, 0]}
              args={[targetSize * 2, targetSize * 2]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor={'#6f6f6f'}
              sectionSize={1}
              sectionThickness={1}
              sectionColor={'#9d4b4b'}
              fadeDistance={25}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid={true}
            />
          )}

          {/* 3D Model with normalized position and scale */}
          <Suspense fallback={null}>
            <group position={modelPosition} scale={modelScale}>
              <AnimatedModel
                modelUrl={actualModelUrl}
                onLoad={handleModelLoad}
                onError={handleModelError}
                onProgress={handleLoadingProgress}
                autoRotate={false} // Handled by OrbitControls
                scale={1} // Scale is handled by the group
                currentAnimation={currentAnimation}
                animationSpeed={animationSpeed}
                playAnimations={playAnimations}
              />
            </group>
          </Suspense>

          {/* Apply wireframe mode */}
          {wireframeMode && (
            <mesh>
              <boxGeometry args={[0, 0, 0]} />
              <meshBasicMaterial wireframe />
            </mesh>
          )}
        </Canvas>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="viewer-loading-overlay">
            <LoadingFallback progress={loadingProgress} />
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="viewer-error-overlay">
            <div className="viewer-error">
              <div className="error-icon">⚠️</div>
              <h3>Failed to Load 3D Model</h3>
              <p>{error.message || 'An unexpected error occurred while loading the model.'}</p>
              <button 
                className="retry-button"
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  window.location.reload(); // Simple retry
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Viewer Controls */}
      {enableControls && (
        <ViewerControls
          onWireframeToggle={handleWireframeToggle}
          onRotationToggle={handleRotationToggle}
          onRotationSpeedChange={handleRotationSpeedChange}
          onScaleChange={handleScaleChange}
          onResetCamera={handleResetCamera}
          onResetModel={handleResetModel}
          onEnvironmentChange={handleEnvironmentChange}
          onQualityChange={handleQualityChange}
          modelInfo={modelInfo}
          isLoading={isLoading}
        />
      )}

      {/* Animation Controls */}
      {enableAnimations && availableAnimations.length > 0 && (
        <AnimationControls
          animations={availableAnimations}
          currentAnimation={currentAnimation}
          isPlaying={playAnimations}
          animationSpeed={animationSpeed}
          onAnimationToggle={handleAnimationToggle}
          onAnimationChange={handleAnimationChange}
          onSpeedChange={handleAnimationSpeedChange}
          isLoading={isLoading}
        />
      )}

      {/* Viewer Info Bar */}
      <div className="viewer-info-bar">
        <div className="viewer-instructions">
          <span>🖱️ Left click + drag to rotate</span>
          <span>🔍 Mouse wheel to zoom</span>
          <span>🖱️ Right click + drag to pan</span>
          {enableControls && <span>⚙️ Click gear icon for settings</span>}
        </div>
        
        {modelInfo && (
          <div className="model-stats">
            <span className={`complexity complexity-${modelInfo.complexity}`}>
              {modelInfo.complexity?.charAt(0)?.toUpperCase() + modelInfo.complexity?.slice(1)} Detail
            </span>
            {modelInfo.hasAnimations && (
              <span className="animated-indicator">🎬 Animated</span>
            )}
            {modelInfo.originalSize && (
              <span className="size-info">
                📏 {modelInfo.originalSize.x.toFixed(1)} × {modelInfo.originalSize.y.toFixed(1)} × {modelInfo.originalSize.z.toFixed(1)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductViewer;