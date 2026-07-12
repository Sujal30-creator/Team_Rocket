import { useEffect, useRef } from 'react';

export default function AnimatedNumber({ value, className = '' }) {
  const ref = useRef(null);
  const prev = useRef(0);

  useEffect(() => {
    const target = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    const start = prev.current;
    prev.current = target;

    const duration = 800;
    const startTime = performance.now();
    const suffix = typeof value === 'string' ? value.replace(/[0-9.]/g, '') : '';

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);

      if (ref.current) {
        ref.current.textContent = current.toLocaleString() + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, [value]);

  return <span ref={ref} className={className}>{value}</span>;
}
