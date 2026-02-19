'use client';

import { useEffect, useRef, useCallback } from 'react';

export function AsciiDots() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLSpanElement[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const RADIUS = 80;
  const SPACING = 28;

  const buildGrid = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing
    container.innerHTML = '';
    dotsRef.current = [];

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cols = Math.ceil(w / SPACING);
    const rows = Math.ceil(h / SPACING);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const span = document.createElement('span');
        span.className = 'ascii-dot';
        span.textContent = '.';
        span.style.left = `${c * SPACING}px`;
        span.style.top = `${r * SPACING}px`;
        container.appendChild(span);
        dotsRef.current.push(span);
      }
    }
  }, []);

  useEffect(() => {
    buildGrid();

    const handleResize = () => buildGrid();
    window.addEventListener('resize', handleResize);

    const handleMove = (x: number, y: number) => {
      mouseRef.current = { x, y };
    };

    const onMouse = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouse);
    window.addEventListener('touchmove', onTouch, { passive: true });

    const animate = () => {
      const { x, y } = mouseRef.current;
      const dots = dotsRef.current;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const rect = dot.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.sqrt((cx - x) ** 2 + (cy - y) ** 2);

        if (dist < RADIUS) {
          dot.classList.add('glitter');
        } else {
          dot.classList.remove('glitter');
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
      cancelAnimationFrame(rafRef.current);
    };
  }, [buildGrid]);

  return (
    <div
      ref={containerRef}
      className="ascii-dots-container"
      aria-hidden="true"
    />
  );
}
