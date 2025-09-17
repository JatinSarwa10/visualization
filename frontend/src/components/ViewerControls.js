import React, { useState, useEffect } from 'react';
import { storage } from '../utils/helpers';
import './ViewerControls.css';

const ViewerControls = ({
  onWireframeToggle,
  onRotationToggle,
  onRotationSpeedChange,
  onScaleChange,
  onResetCamera,
  onResetModel,
  onEnvironmentChange,
  onQualityChange,
  modelInfo = null,
  isLoading = false,
  ...props
}) => {
  // Control states
  const [showControls, setShowControls] = useState(false);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [modelScale, setModelScale] = useState(1);
  const [environment, setEnvironment] = useState('studio');
  const [quality, setQuality] = useState('medium');
  const [showStats, setShowStats] = useState(false);

  // Available environments
  const environments = [
    { value: 'studio', label: '🏢 Studio', description: 'Neutral studio lighting' },
    { value: 'sunset', label: '🌅 Sunset', description: 'Warm sunset ambience' },
    { value: 'forest', label: '🌲 Forest', description: 'Natural forest lighting' },
    { value: 'city', label: '🏙️ City', description: 'Urban environment' },
    { value: 'warehouse', label: '🏭 Warehouse', description: 'Industrial setting' }
  ];

  // Quality presets
  const qualityPresets = [
    { value: 'low', label: 'Low', description: 'Better performance' },
    { value: 'medium', label: 'Medium', description: 'Balanced quality' },
    { value: 'high', label: 'High', description: 'Best visual quality' }
  ];

  // Load saved preferences
  useEffect(() => {
    const savedPrefs = storage.get('viewer-preferences', {});
    
    setWireframeMode(savedPrefs.wireframeMode || false);
    setAutoRotate(savedPrefs.autoRotate !== undefined ? savedPrefs.autoRotate : true);
    setRotationSpeed(savedPrefs.rotationSpeed || 1);
    setModelScale(savedPrefs.modelScale || 1);
    setEnvironment(savedPrefs.environment || 'studio');
    setQuality(savedPrefs.quality || 'medium');
  }, []);

  // Save preferences when they change
  useEffect(() => {
    const preferences = {
      wireframeMode,
      autoRotate,
      rotationSpeed,
      modelScale,
      environment,
      quality
    };
    
    storage.set('viewer-preferences', preferences);
  }, [wireframeMode, autoRotate, rotationSpeed, modelScale, environment, quality]);

  // Handle wireframe toggle
  const handleWireframeToggle = () => {
    const newMode = !wireframeMode;
    setWireframeMode(newMode);
    onWireframeToggle?.(newMode);
  };

  // Handle rotation toggle
  const handleRotationToggle = () => {
    const newAutoRotate = !autoRotate;
    setAutoRotate(newAutoRotate);
    onRotationToggle?.(newAutoRotate);
  };

  // Handle rotation speed change
  const handleRotationSpeedChange = (speed) => {
    setRotationSpeed(speed);
    onRotationSpeedChange?.(speed * 0.01); // Convert to radians
  };

  // Handle scale change
  const handleScaleChange = (scale) => {
    setModelScale(scale);
    onScaleChange?.(scale);
  };

  // Handle environment change
  const handleEnvironmentChange = (env) => {
    setEnvironment(env);
    onEnvironmentChange?.(env);
  };

  // Handle quality change
  const handleQualityChange = (q) => {
    setQuality(q);
    onQualityChange?.(q);
  };

  // Reset all settings
  const handleResetSettings = () => {
    setWireframeMode(false);
    setAutoRotate(true);
    setRotationSpeed(1);
    setModelScale(1);
    setEnvironment('studio');
    setQuality('medium');
    
    // Trigger callbacks
    onWireframeToggle?.(false);
    onRotationToggle?.(true);
    onRotationSpeedChange?.(0.01);
    onScaleChange?.(1);
    onEnvironmentChange?.('studio');
    onQualityChange?.('medium');
    
    onResetModel?.();
  };

  return (
    <div className={`viewer-controls ${showControls ? 'expanded' : ''}`}>
      {/* Toggle Button */}
      <button 
        className="controls-toggle"
        onClick={() => setShowControls(!showControls)}
        title={showControls ? 'Hide Controls' : 'Show Controls'}
        disabled={isLoading}
      >
        ⚙️
      </button>

      {/* Controls Panel */}
      {showControls && (
        <div className="controls-panel">
          <div className="controls-header">
            <h3>Viewer Settings</h3>
            <button 
              className="close-button"
              onClick={() => setShowControls(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="controls-content">
            {/* Display Settings */}
            <div className="control-section">
              <h4>Display</h4>
              
              <div className="control-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={wireframeMode}
                    onChange={handleWireframeToggle}
                    disabled={isLoading}
                  />
                  <span className="checkmark"></span>
                  Wireframe Mode
                </label>
              </div>

              <div className="control-item">
                <label>Quality</label>
                <select 
                  value={quality} 
                  onChange={(e) => handleQualityChange(e.target.value)}
                  disabled={isLoading}
                >
                  {qualityPresets.map(preset => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label} - {preset.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Animation Settings */}
            <div className="control-section">
              <h4>Animation</h4>
              
              <div className="control-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={autoRotate}
                    onChange={handleRotationToggle}
                    disabled={isLoading}
                  />
                  <span className="checkmark"></span>
                  Auto Rotate
                </label>
              </div>

              {autoRotate && (
                <div className="control-item">
                  <label>Rotation Speed</label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={rotationSpeed}
                    onChange={(e) => handleRotationSpeedChange(parseFloat(e.target.value))}
                    disabled={isLoading}
                  />
                  <span className="range-value">{rotationSpeed.toFixed(1)}x</span>
                </div>
              )}
            </div>

            {/* Model Settings */}
            <div className="control-section">
              <h4>Model</h4>
              
              <div className="control-item">
                <label>Scale</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={modelScale}
                  onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                  disabled={isLoading}
                />
                <span className="range-value">{modelScale.toFixed(1)}x</span>
              </div>
            </div>

            {/* Environment Settings */}
            <div className="control-section">
              <h4>Environment</h4>
              
              <div className="environment-grid">
                {environments.map(env => (
                  <button
                    key={env.value}
                    className={`environment-button ${environment === env.value ? 'active' : ''}`}
                    onClick={() => handleEnvironmentChange(env.value)}
                    disabled={isLoading}
                    title={env.description}
                  >
                    <span className="env-icon">{env.label.split(' ')[0]}</span>
                    <span className="env-name">{env.label.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="control-section">
              <h4>Actions</h4>
              
              <div className="action-buttons">
                <button 
                  className="action-button reset"
                  onClick={onResetCamera}
                  disabled={isLoading}
                  title="Reset camera position"
                >
                  📹 Reset Camera
                </button>
                
                <button 
                  className="action-button reset"
                  onClick={handleResetSettings}
                  disabled={isLoading}
                  title="Reset all settings to default"
                >
                  🔄 Reset Settings
                </button>
                
                <button 
                  className="action-button stats"
                  onClick={() => setShowStats(!showStats)}
                  disabled={isLoading}
                  title="Toggle performance stats"
                >
                  📊 {showStats ? 'Hide' : 'Show'} Stats
                </button>
              </div>
            </div>

            {/* Model Information */}
            {modelInfo && (
              <div className="control-section model-info">
                <h4>Model Info</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Complexity:</span>
                    <span className={`info-value complexity-${modelInfo.complexity}`}>
                      {modelInfo.complexity?.charAt(0)?.toUpperCase() + modelInfo.complexity?.slice(1)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Meshes:</span>
                    <span className="info-value">{modelInfo.meshCount || 0}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Triangles:</span>
                    <span className="info-value">{modelInfo.triangleCount?.toLocaleString() || 0}</span>
                  </div>
                  {modelInfo.hasAnimations && (
                    <div className="info-item">
                      <span className="info-label">Animations:</span>
                      <span className="info-value">{modelInfo.animationCount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Performance Stats Overlay */}
      {showStats && (
        <div className="stats-overlay">
          <div className="stats-content">
            <h4>Performance Stats</h4>
            <div id="stats-container">
              {/* Stats.js will be inserted here */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewerControls;