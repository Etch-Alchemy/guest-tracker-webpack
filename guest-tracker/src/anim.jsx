export function flashElement(elementId, duration = 200, flashes = 1) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let count = 0;
  const originalOpacity = element.style.opacity || '1'; // Store original opacity

  const intervalId = setInterval(() => {
    if (count < flashes * 2) { // Multiply by 2 for showing and hiding
      if (element.style.opacity === '0') {
        element.style.opacity = originalOpacity;
      } else {
        element.style.opacity = '0';
      }
      count++;
    } else {
      clearInterval(intervalId);
      element.style.opacity = originalOpacity; // Restore original opacity
    }
  }, duration); // Divide duration by 2 for half-cycles (on/off)
}
export function fadeOut(elementId) {
  const element = document.getElementById(elementId);
    element.classList.add('fade-out');
    // Optional: Remove element from DOM after fade out
    element.addEventListener('transitionend', function handler() {
        element.style.display = 'none';
        element.removeEventListener('transitionend', handler);
    });
}

export function fadeIn(elementId) {
  const element = document.getElementById(elementId);
    element.style.display = 'block'; // Or original display value
    element.classList.remove('fade-out');
}