let audioContext: AudioContext | null = null;

// Initialize audio context on user interaction
export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
}

export function playSound(soundName: 'thunder' | 'electric') {
  // Initialize on first call
  initAudio();
  
  try {
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    audio.volume = 0.3;
    
    // Resume audio context if suspended (browser autoplay policy)
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    audio.play().catch(err => {
      console.log('Sound blocked by browser:', err);
    });
  } catch (error) {
    console.log('Sound failed:', error);
  }
}