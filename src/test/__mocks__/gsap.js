// Mock GSAP for Jest tests
const mockTimeline = () => ({
  to: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  fromTo: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  play: jest.fn().mockReturnThis(),
  pause: jest.fn().mockReturnThis(),
  reverse: jest.fn().mockReturnThis(),
  restart: jest.fn().mockReturnThis(),
  kill: jest.fn().mockReturnThis(),
  progress: jest.fn().mockReturnThis(),
  duration: jest.fn().mockReturnThis(),
});

const mockDraggable = {
  create: jest.fn(() => ({
    kill: jest.fn(),
    disable: jest.fn(),
    enable: jest.fn(),
    update: jest.fn(),
  })),
};

const mockGsap = {
  timeline: jest.fn(mockTimeline),
  to: jest.fn(),
  from: jest.fn(),
  fromTo: jest.fn(),
  set: jest.fn(),
  registerPlugin: jest.fn(),
  killTweensOf: jest.fn(),
  context: jest.fn(() => ({
    add: jest.fn(),
    revert: jest.fn(),
    kill: jest.fn(),
  })),
  matchMedia: jest.fn(() => ({
    add: jest.fn(),
    revert: jest.fn(),
    kill: jest.fn(),
  })),
};

// Export both named and default exports to handle different import styles
module.exports = {
  gsap: mockGsap,
  Draggable: mockDraggable,
  default: mockGsap,
};

// Also support ES6 imports
module.exports.gsap = mockGsap;
module.exports.Draggable = mockDraggable;
