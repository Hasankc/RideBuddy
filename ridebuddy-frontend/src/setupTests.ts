import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// Mock matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Mock Geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn().mockImplementation(success => 
    Promise.resolve(success({
      coords: {
        latitude: 51.1,
        longitude: 45.3
      }
    }))
  ),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

global.navigator.geolocation = mockGeolocation;