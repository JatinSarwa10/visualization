import React, { useState, useEffect } from 'react';
import { capitalize } from '../utils/helpers';
import './AnimationControls.css';

const AnimationControls = ({
  animations = [],
  currentAnimation = null,
  isPlaying = false,
  animationSpeed = 1,
  onAnimationToggle,
  onAnimationChange,
  onSpeedChange,
  isLoading = false,
  position = 'bottom-left',
  ...props
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState(currentAnimation);
  const [playbackSpeed, setPlaybackSpeed] = useState(animationSpeed);

  // Update local state when props change
  useEffect(() => {
    setSelectedAnimation(currentAnimation);
  }, [currentAnimation]);

  useEffect(() => {
    setPlaybackSpeed(animationSpeed);
  }, [animationSpeed]);

  // Handle play/pause toggle
  const handlePlayToggle = () => {
    onAnimationToggle?.(!isPlaying);
  };

  // Handle animation selection
  const handleAnimationSelect = (animationName) => {
    setSelectedAnimation(animationName);
    onAnimationChange?.(animationName);
  };

  // Handle speed change
  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    onSpeedChange?.(speed);
  };

  // Handle preset speed buttons
  const handlePresetSpeed = (speed) => {
    handleSpeedChange(speed);
  };

  // Handle step controls
  const handlePrevious = () => {
    if (animations.length === 0) return;
    
    const currentIndex = animations.indexOf(selectedAnimation);
    const prevIndex = currentIndex <= 0 ? animations.length - 1 : currentIndex - 1;
    const prevAnimation = animations[prevIndex];
    
    handleAnimationSelect(prevAnimation);
  };

  const handleNext = () => {
    if (animations.length === 0) return;
    
    const currentIndex = animations.indexOf(selectedAnimation);
    const nextIndex = currentIndex >= animations.length - 1 ? 0 : currentIndex + 1;
    const nextAnimation = animations[nextIndex];
    
    handleAnimationSelect(nextAnimation);
  };

  // Format animation name for display
  const formatAnimationName = (name) => {
    if (!name) return 'None';
    
    // Clean up common animation name patterns
    let cleaned = name
      .replace(/^(anim|animation)_?/i, '')  // Remove 'anim_' prefix
      .replace(/\.(glb|gltf)$/i, '')        // Remove file extension
      .replace(/[_-]/g, ' ')                // Replace underscores/dashes with spaces
      .trim();
    
    return capitalize(cleaned) || name;
  };

  // Get animation info
  const getAnimationInfo = () => {
    if (animations.length === 0) {
      return 'No animations available';
    }
    
    if (!selectedAnimation) {
      return `${animations.length} animation${animations.length === 1 ? '' : 's'} available`;
    }
    
    const currentIndex = animations.indexOf(selectedAnimation);
    return `Animation ${currentIndex + 1} of ${animations.length}`;
  };

  // Speed presets
  const speedPresets = [
    { value: 0.25, label: '0.25x', icon: '🐢' },
    { value: 0.5, label: '0.5x', icon: '🚶' },
    { value: 1, label: '1x', icon: '▶️' },
    { value: 1.5, label: '1.5x', icon: '🏃' },
    { value: 2, label: '2x', icon: '🏃‍♂️' }
  ];

  if (animations.length === 0) {
    return null; // Don't render if no animations
  }

  return (
    <div className={`animation-controls ${position} ${expanded ? 'expanded' : ''} ${isLoading ? 'loading' : ''}`} {...props}>
      {/* Toggle Button */}
      <button
        className="animation-toggle"
        onClick={() => setExpanded(!expanded)}
        disabled={isLoading}
        title={expanded ? 'Hide Animation Controls' : 'Show Animation Controls'}
      >
        🎬
        {animations.length > 0 && (
          <span className="animation-count">{animations.length}</span>
        )}
      </button>

      {/* Expanded Controls */}
      {expanded && (
        <div className="animation-panel">
          {/* Header */}
          <div className="animation-header">
            <h4>Animations</h4>
            <button
              className="close-button"
              onClick={() => setExpanded(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Main Controls */}
          <div className="animation-main-controls">
            {/* Play/Pause Button */}
            <button
              className={`play-button ${isPlaying ? 'playing' : 'paused'}`}
              onClick={handlePlayToggle}
              disabled={isLoading || !selectedAnimation}
              title={isPlaying ? 'Pause Animation' : 'Play Animation'}
            >
              {isLoading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
            </button>

            {/* Animation Info */}
            <div className="animation-info">
              <div className="current-animation">
                {selectedAnimation ? formatAnimationName(selectedAnimation) : 'No Animation'}
              </div>
              <div className="animation-meta">
                {getAnimationInfo()}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          {animations.length > 1 && (
            <div className="animation-navigation">
              <button
                className="nav-button prev"
                onClick={handlePrevious}
                disabled={isLoading}
                title="Previous Animation"
              >
                ⏮️
              </button>

              <div className="animation-progress">
                <div className="progress-dots">
                  {animations.map((anim, index) => (
                    <button
                      key={anim}
                      className={`progress-dot ${anim === selectedAnimation ? 'active' : ''}`}
                      onClick={() => handleAnimationSelect(anim)}
                      disabled={isLoading}
                      title={formatAnimationName(anim)}
                    />
                  ))}
                </div>
              </div>

              <button
                className="nav-button next"
                onClick={handleNext}
                disabled={isLoading}
                title="Next Animation"
              >
                ⏭️
              </button>
            </div>
          )}

          {/* Animation List */}
          <div className="animation-list">
            <div className="animation-list-header">
              <span>Select Animation:</span>
            </div>
            <div className="animation-options">
              {animations.map((anim) => (
                <button
                  key={anim}
                  className={`animation-option ${anim === selectedAnimation ? 'selected' : ''}`}
                  onClick={() => handleAnimationSelect(anim)}
                  disabled={isLoading}
                  title={`Play ${formatAnimationName(anim)}`}
                >
                  <span className="animation-icon">
                    {anim === selectedAnimation && isPlaying ? '▶️' : '🎬'}
                  </span>
                  <span className="animation-name">
                    {formatAnimationName(anim)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Speed Controls */}
          <div className="speed-controls">
            <div className="speed-header">
              <span>Playback Speed:</span>
              <span className="speed-value">{playbackSpeed.toFixed(2)}x</span>
            </div>

            {/* Speed Slider */}
            <div className="speed-slider-container">
              <input
                type="range"
                className="speed-slider"
                min="0.1"
                max="3"
                step="0.1"
                value={playbackSpeed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                disabled={isLoading}
              />
              <div className="speed-labels">
                <span>0.1x</span>
                <span>1x</span>
                <span>3x</span>
              </div>
            </div>

            {/* Speed Presets */}
            <div className="speed-presets">
              {speedPresets.map((preset) => (
                <button
                  key={preset.value}
                  className={`speed-preset ${Math.abs(playbackSpeed - preset.value) < 0.01 ? 'active' : ''}`}
                  onClick={() => handlePresetSpeed(preset.value)}
                  disabled={isLoading}
                  title={`Set speed to ${preset.label}`}
                >
                  <span className="preset-icon">{preset.icon}</span>
                  <span className="preset-label">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Controls */}
          <div className="animation-extras">
            <button
              className="extra-button"
              onClick={() => {
                // Stop current animation
                onAnimationToggle?.(false);
                setSelectedAnimation(null);
                onAnimationChange?.(null);
              }}
              disabled={isLoading || !selectedAnimation}
              title="Stop Animation"
            >
              ⏹️ Stop
            </button>

            <button
              className="extra-button"
              onClick={() => {
                // Restart current animation
                if (selectedAnimation) {
                  onAnimationChange?.(selectedAnimation);
                  onAnimationToggle?.(true);
                }
              }}
              disabled={isLoading || !selectedAnimation}
              title="Restart Animation"
            >
              🔄 Restart
            </button>
          </div>

          {/* Animation Tips */}
          <div className="animation-tips">
            <div className="tip">
              💡 Use controls to explore different animations and adjust playback speed
            </div>
          </div>
        </div>
      )}

      {/* Compact Mode Info */}
      {!expanded && selectedAnimation && (
        <div className="compact-info">
          <div className="compact-animation-name">
            {formatAnimationName(selectedAnimation)}
          </div>
          <div className="compact-status">
            {isPlaying ? '▶️' : '⏸️'} {playbackSpeed}x
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimationControls;