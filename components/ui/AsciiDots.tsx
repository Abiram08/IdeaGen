'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Dot {
  x: number;
  y: number;
  char: string;
  element: HTMLSpanElement | null;
}

const ASCII_CHARS = ['·', ':', '.', '•', '∙', '◦', '○', '●'];

export function AsciiDots() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animatingDotsRef = useRef<Set<HTMLSpanElement>>(new Set());

  const triggerGlitter = useCallback((element: HTMLSpanElement, x: number, y: number) => {
    if (animatingDotsRef.current.has(element)) return;
    
    animatingDotsRef.current.add(element);
    element.classList.add('animate');
    
    // Trigger nearby dots with delay
    const nearbyDots = dotsRef.current.filter(dot => {
      if (!dot.element || dot.element === element) return false;
      const distance = Math.sqrt(Math.pow(dot.x - x, 2) + Math.pow(dot.y - y, 2));
      return distance < 80;
    });

    nearbyDots.forEach((dot, index) => {
      if (dot.element && !animatingDotsRef.current.has(dot.element)) {
        setTimeout(() => {
          if (dot.element) {
            animatingDotsRef.current.add(dot.element);
            dot.element.classList.add('animate');
            setTimeout(() => {
              if (dot.element) {
                dot.element.classList.remove('animate');
                animatingDotsRef.current.delete(dot.element);
              }
            }, 600);
          }
        }, index * 30);
      }
    });

    setTimeout(() => {
      element.classList.remove('animate');
      animatingDotsRef.current.delete(element);
    }, 600);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Clear existing dots
    container.innerHTML = '';
    dotsRef.current = [];

    // Create dot pattern (sparse, like Junie's world map style)
    const gridSize = 25;
    const dots: Dot[] = [];

    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        // Random chance to place a dot (creates sparse pattern)
        if (Math.random() > 0.7) {
          // Add some clustering effect
          const clusterChance = Math.sin(x * 0.01) * Math.cos(y * 0.01);
          if (Math.random() < 0.3 + clusterChance * 0.3) {
            const offsetX = (Math.random() - 0.5) * gridSize * 0.8;
            const offsetY = (Math.random() - 0.5) * gridSize * 0.8;
            
            dots.push({
              x: x + offsetX,
              y: y + offsetY,
              char: ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)],
              element: null,
            });
          }
        }
      }
    }

    // Create DOM elements
    dots.forEach((dot) => {
      const span = document.createElement('span');
      span.className = 'ascii-dot';
      span.textContent = dot.char;
      span.style.left = `${dot.x}px`;
      span.style.top = `${dot.y}px`;
      
      // Add mouse/touch events
      span.addEventListener('mouseenter', () => triggerGlitter(span, dot.x, dot.y));
      span.addEventListener('touchstart', (e) => {
        e.preventDefault();
        triggerGlitter(span, dot.x, dot.y);
      }, { passive: false });
      
      container.appendChild(span);
      dot.element = span;
    });

    dotsRef.current = dots;

    // Handle mouse move for proximity effect
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      dotsRef.current.forEach((dot) => {
        if (!dot.element) return;
        const distance = Math.sqrt(Math.pow(dot.x - mouseX, 2) + Math.pow(dot.y - mouseY, 2));
        
        if (distance < 60 && !animatingDotsRef.current.has(dot.element)) {
          triggerGlitter(dot.element, dot.x, dot.y);
        }
      });
    };

    // Throttle mouse move
    let lastMove = 0;
    const throttledMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMove > 50) {
        lastMove = now;
        handleMouseMove(e);
      }
    };

    window.addEventListener('mousemove', throttledMouseMove);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
    };
  }, [triggerGlitter]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      // Re-render dots on resize
      const container = containerRef.current;
      if (container) {
        container.innerHTML = '';
        dotsRef.current = [];
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="ascii-dots-container"
      aria-hidden="true"
    />
  );
}
