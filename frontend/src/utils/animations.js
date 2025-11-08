/**
 * Animation Utilities for WorkZen HRMS
 * Provides IntersectionObserver helper for viewport-triggered animations
 */

/**
 * Observes elements and adds animation class when they enter viewport
 * @param {string} selector - CSS selector for elements to observe
 * @param {string} animationClass - CSS class to add when element is visible
 * @param {Object} options - IntersectionObserver options
 */
export function observeElements(selector, animationClass = 'fade-in-up', options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add(animationClass);
        // Optionally unobserve after animation to improve performance
        if (options.once !== false) {
          observer.unobserve(entry.target);
        }
      } else if (options.once === false) {
        // Re-trigger animation when scrolling back
        entry.target.classList.remove(animationClass);
      }
    });
  }, defaultOptions);

  const elements = document.querySelectorAll(selector);
  elements.forEach(el => observer.observe(el));

  return observer;
}

/**
 * Smooth scroll to element
 * @param {string|HTMLElement} target - Element ID (with #) or element itself
 */
export function smoothScrollTo(target) {
  const element = typeof target === 'string' 
    ? document.querySelector(target)
    : target;
    
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
}

/**
 * Add staggered animation delays to child elements
 * @param {string} parentSelector - Parent element selector
 * @param {number} delayIncrement - Delay increment in ms (default 100)
 */
export function staggerAnimation(parentSelector, delayIncrement = 100) {
  const parent = document.querySelector(parentSelector);
  if (!parent) return;

  const children = parent.children;
  Array.from(children).forEach((child, index) => {
    child.style.animationDelay = `${index * delayIncrement}ms`;
  });
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Apply ripple effect to button click
 * @param {Event} event - Click event
 */
export function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  button.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
}

/**
 * Initialize all animations on page load
 */
export function initAnimations() {
  if (prefersReducedMotion()) {
    document.body.classList.add('reduce-motion');
    return;
  }

  // Observe animated cards
  observeElements('.animated-card', 'is-visible');
  
  // Observe page sections
  observeElements('.page-section', 'fade-in-up');
  
  // Add stagger to grids
  staggerAnimation('.stats-grid', 80);
}
