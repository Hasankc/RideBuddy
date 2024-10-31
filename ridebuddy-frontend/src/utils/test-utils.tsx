import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

function render(ui: React.ReactElement, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);

  return rtlRender(
    <ChakraProvider>
      <AuthProvider>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </AuthProvider>
    </ChakraProvider>
  );
}

// Mock API calls
const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// Mock socket.io
const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  off: jest.fn(),
};

// Custom test hooks
const useTestUser = () => ({
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  profile: {
    images: [{ url: 'test.jpg', isMain: true }],
    bio: 'Test bio',
    age: 25,
  },
});

export * from '@testing-library/react';
export { render, mockApi, mockSocket, useTestUser };