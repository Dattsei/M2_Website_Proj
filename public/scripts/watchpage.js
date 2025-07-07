// DOM Elements

// Add this to the beginning of your watchpage.js file, before the existing code

// Load the selected video content
function loadVideoContent() {
  const watchContent = JSON.parse(sessionStorage.getItem('currentWatchContent'));
  const videoFile = sessionStorage.getItem('currentVideoFile');
  
  if (watchContent && videoFile) {
    // Update video source
    const videoSource = document.getElementById('videoSource');
    const video = document.getElementById('moviePlayer');
    
    videoSource.src = videoFile;
    video.load(); // Reload the video with new source
    
    // Update video information in the UI
    document.getElementById('movieTitle').textContent = watchContent.seriesTitle || watchContent.title;
    document.getElementById('movieGenre').textContent = watchContent.genre || 'Unknown';
    document.getElementById('movieRating').textContent = watchContent.parentalGuidance || 'Not Rated';
    
    // For episodes, show episode info
    if (watchContent.type === 'episode') {
      const episodeInfo = `S${watchContent.season}E${watchContent.episode}: ${watchContent.title}`;
      document.getElementById('movieTitle').textContent = `${watchContent.seriesTitle} - ${episodeInfo}`;
    }
    
    // Update page title
    document.title = `Watch ${watchContent.seriesTitle || watchContent.title} - Nstream`;
    
    console.log('Loaded video:', videoFile);
  } else {
    console.warn('No video content found in sessionStorage');
    // Fallback to default video
    document.getElementById('movieTitle').textContent = 'Demo Video';
  }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', loadVideoContent);

// Also call it if the DOM is already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadVideoContent);
} else {
  loadVideoContent();
}


const video = document.getElementById('moviePlayer');
const overlay = document.getElementById('videoOverlay');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const timeDisplay = document.getElementById('timeDisplay');
const volumeBtn = document.getElementById('volumeBtn');
const volumeSlider = document.getElementById('volumeSlider');
const settingsMenu = document.getElementById('settingsMenu');
const qualityMenu = document.getElementById('qualityMenu');
const loadingOverlay = document.getElementById('loadingOverlay');
const videoContainer = document.getElementById('videoContainer');

// State Variables
let controlsTimeout;
let isSettingsOpen = false;
let currentQuality = 'auto';
let playbackSpeed = 1;

// Initialize Video Player
function initializePlayer() {
  video.volume = 0.5;
  volumeSlider.value = 50;
  setupEventListeners();
  showControls();
}

// Event Listeners Setup
function setupEventListeners() {
  // Mouse movement detection
  videoContainer.addEventListener('mousemove', showControls);
  videoContainer.addEventListener('mouseleave', hideControls);
  
  // Video click to play/pause
  video.addEventListener('click', togglePlay);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyPress);
  
  // Progress bar
  video.addEventListener('timeupdate', updateProgress);
  progressContainer.addEventListener('click', seekVideo);
  
  // Volume controls
  volumeSlider.addEventListener('input', handleVolumeChange);
  
  // Loading states
  video.addEventListener('waiting', showLoading);
  video.addEventListener('canplay', hideLoading);
  video.addEventListener('loadstart', showLoading);
  
  // Close settings when clicking outside
  document.addEventListener('click', handleOutsideClick);
  
  // Video events
  video.addEventListener('play', () => {
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  });
  
  video.addEventListener('pause', () => {
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
  });
  
  video.addEventListener('ended', () => {
    playBtn.innerHTML = '<i class="fas fa-replay"></i>';
    showControls();
  });
}

// Controls Visibility
function showControls() {
  overlay.classList.add('show');
  clearTimeout(controlsTimeout);
  controlsTimeout = setTimeout(hideControls, 3000);
}

function hideControls() {
  if (!video.paused && !isSettingsOpen) {
    overlay.classList.remove('show');
  }
}

// Play/Pause Functionality
function togglePlay() {
  if (video.paused || video.ended) {
    video.play().catch(err => {
      console.error('Error playing video:', err);
    });
  } else {
    video.pause();
  }
}

// Keyboard Controls
function handleKeyPress(e) {
  // Prevent default behavior for video controls
  const activeElement = document.activeElement;
  const isInputFocused = activeElement.tagName === 'INPUT' || activeElement.tagName === 'BUTTON';
  
  if (!isInputFocused) {
    switch(e.code) {
      case 'Space':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        skipTime(-10);
        break;
      case 'ArrowRight':
        e.preventDefault();
        skipTime(10);
        break;
      case 'ArrowUp':
        e.preventDefault();
        adjustVolume(0.1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        adjustVolume(-0.1);
        break;
      case 'KeyF':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'KeyM':
        e.preventDefault();
        toggleMute();
        break;
      case 'Escape':
        if (isSettingsOpen) {
          closeSettings();
        }
        break;
    }
  }
}

// Progress Bar Functions
function updateProgress() {
  if (video.duration) {
    const progress = (video.currentTime / video.duration) * 100;
    progressBar.style.width = progress + '%';
    updateTimeDisplay();
  }
}

function seekVideo(e) {
  if (video.duration) {
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * video.duration;
    video.currentTime = newTime;
  }
}

// Time Display
function updateTimeDisplay() {
  const current = formatTime(video.currentTime || 0);
  const duration = formatTime(video.duration || 0);
  timeDisplay.textContent = `${current} / ${duration}`;
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Skip Time Function
function skipTime(seconds) {
  if (video.duration) {
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    showControls();
  }
}

// Volume Controls
function handleVolumeChange(e) {
  const volume = e.target.value / 100;
  video.volume = volume;
  video.muted = volume === 0;
  updateVolumeIcon();
}

function toggleMute() {
  if (video.muted) {
    video.muted = false;
    if (video.volume === 0) {
      video.volume = 0.5;
      volumeSlider.value = 50;
    }
  } else {
    video.muted = true;
  }
  updateVolumeIcon();
}

function adjustVolume(change) {
  const newVolume = Math.max(0, Math.min(1, video.volume + change));
  video.volume = newVolume;
  video.muted = newVolume === 0;
  volumeSlider.value = newVolume * 100;
  updateVolumeIcon();
  showControls();
}

function updateVolumeIcon() {
  const icon = volumeBtn.querySelector('i');
  if (video.muted || video.volume === 0) {
    icon.className = 'fas fa-volume-mute';
  } else if (video.volume < 0.5) {
    icon.className = 'fas fa-volume-down';
  } else {
    icon.className = 'fas fa-volume-up';
  }
}

// Settings Menu Functions
function toggleSettings() {
  isSettingsOpen = !isSettingsOpen;
  settingsMenu.classList.toggle('show');
  if (isSettingsOpen) {
    showControls();
  }
}

function closeSettings() {
  isSettingsOpen = false;
  settingsMenu.classList.remove('show');
  qualityMenu.classList.remove('show');
}

function showQualityMenu() {
  qualityMenu.classList.toggle('show');
}

function setQuality(quality) {
  currentQuality = quality;
  document.getElementById('currentQuality').textContent = quality === 'auto' ? 'Auto' : quality;
  
  // Update active state
  document.querySelectorAll('.resolution-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-quality="${quality}"]`).classList.add('active');
  
  // Close menus
  qualityMenu.classList.remove('show');
  closeSettings();
  
  // Simulate quality change with loading
  showLoading();
  setTimeout(() => {
    hideLoading();
    showNotification(`Quality changed to ${quality === 'auto' ? 'Auto' : quality}`);
  }, 1000);
}

function toggleSubtitles() {
  // Subtitle functionality placeholder
  const subtitleSpan = document.querySelector('.settings-item:nth-child(2) span');
  const isOn = subtitleSpan.textContent === 'On';
  subtitleSpan.textContent = isOn ? 'Off' : 'On';
  closeSettings();
  showNotification(`Subtitles ${isOn ? 'disabled' : 'enabled'}`);
}

function adjustPlaybackSpeed() {
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const currentIndex = speeds.indexOf(playbackSpeed);
  const nextIndex = (currentIndex + 1) % speeds.length;
  playbackSpeed = speeds[nextIndex];
  video.playbackRate = playbackSpeed;
  document.getElementById('currentSpeed').textContent = playbackSpeed + 'x';
  closeSettings();
  showNotification(`Speed: ${playbackSpeed}x`);
}

// Fullscreen Functions
function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
        showNotification('Fullscreen not supported');
      });
    } else {
      document.exitFullscreen();
    }
  } catch (err) {
    console.error('Fullscreen error:', err);
    showNotification('Fullscreen not supported');
  }
}

// Loading States
function showLoading() {
  loadingOverlay.style.display = 'block';
}

function hideLoading() {
  loadingOverlay.style.display = 'none';
}

// Utility Functions
function handleOutsideClick(e) {
  if (!e.target.closest('.settings-menu') && 
      !e.target.closest('[onclick*="toggleSettings"]') && 
      !e.target.closest('[onclick*="showQualityMenu"]')) {
    closeSettings();
  }
}

function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 1000;
    pointer-events: none;
  `;
  notification.textContent = message;
  
  videoContainer.appendChild(notification);
  
  // Remove notification after 2 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 2000);
}

// Back Button Function
function goBack() {
  if (confirm('Are you sure you want to go back?')) {
    // Try different navigation methods
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to main page if no history
      window.location.href = "/mainpage";
    }
  }
}

// Error Handling
video.addEventListener('error', (e) => {
  console.error('Video error:', e);
  hideLoading();
  showNotification('Error loading video');
});

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePlayer);
} else {
  initializePlayer();
}