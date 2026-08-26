/**
 * Safe, lightweight, iframe-compatible Canvas Confetti
 * Completely avoids Web Workers, OffscreenCanvas, or restricted DOM constructors
 * that cause "TypeError: Illegal constructor" in sandboxed environments.
 */

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
  duration?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  gravity: number;
}

const DEFAULT_COLORS = [
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f97316'  // Orange
];

export const triggerConfetti = (options: ConfettiOptions = {}) => {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const {
      particleCount = 80,
      spread = 70,
      origin = { x: 0.5, y: 0.6 },
      colors = DEFAULT_COLORS,
      duration = 2500
    } = options;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    canvas.width = window.innerWidth || 800;
    canvas.height = window.innerHeight || 600;

    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      return;
    }

    const startX = (origin.x ?? 0.5) * canvas.width;
    const startY = (origin.y ?? 0.6) * canvas.height;

    const particles: Particle[] = [];
    const spreadRad = (spread * Math.PI) / 180;

    for (let i = 0; i < particleCount; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * spreadRad;
      const speed = 7 + Math.random() * 9;
      particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.4),
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        gravity: 0.28 + Math.random() * 0.1
      });
    }

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed > duration) {
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const progress = elapsed / duration;
      const globalAlpha = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.985;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity * globalAlpha);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  } catch (err) {
    // Non-critical visual effect, safely ignore errors
    console.debug('Confetti effect bypassed:', err);
  }
};

export default triggerConfetti;
