import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from '../contexts/AuthContext';
import Profile from '../pages/Profile';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  // Mock API endpoints
  rest.get('/api/users/profile', (req, res, ctx) => {
    return res(ctx.json({
      profile: {
        bio: 'Test bio',
        age: 25,
        gender: 'male',
        lookingFor: 'female',
        interests: ['music', 'travel'],
        images: []
      }
    }));
  }),

  rest.post('/api/upload', (req, res, ctx) => {
    return res(ctx.json({
      url: 'https://example.com/image.jpg'
    }));
  }),

  rest.put('/api/users/profile', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Profile Component', () => {
  const renderProfile = () => {
    return render(
      <ChakraProvider>
        <AuthProvider>
          <Profile />
        </AuthProvider>
      </ChakraProvider>
    );
  };

  test('renders profile form with user data', async () => {
    renderProfile();
    
    await waitFor(() => {
      expect(screen.getByLabelText(/bio/i)).toHaveValue('Test bio');
      expect(screen.getByLabelText(/age/i)).toHaveValue(25);
    });
  });

  test('handles image upload', async () => {
    renderProfile();
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/upload image/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/image uploaded successfully/i)).toBeInTheDocument();
    });
  });

  test('validates form inputs', async () => {
    renderProfile();
    
    const ageInput = screen.getByLabelText(/age/i);
    fireEvent.change(ageInput, { target: { value: 15 } });
    
    const submitButton = screen.getByRole('button', { name: /update profile/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/age must be 18 or older/i)).toBeInTheDocument();
    });
  });
});