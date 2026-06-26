import '@testing-library/jest-dom';

// Mock IntersectionObserver for react-intersection-observer
class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = IntersectionObserver;
