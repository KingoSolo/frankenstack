export function playSound(soundName: 'thunder' | 'electric') {
  try {
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    audio.volume = 0.3; // 30% volume
    audio.play().catch(err => console.log('Sound play failed:', err));
  } catch (error) {
    // Silently fail if sounds don't load
  }
}