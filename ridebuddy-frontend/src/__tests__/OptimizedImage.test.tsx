import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { OptimizedImage } from '../components/OptimizedImage';

describe('OptimizedImage', () => {
  const mockIntersectionObserver = jest.fn();

  beforeEach(() => {
    global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
      observe: () => callback([{ isIntersecting: true }]),
      disconnect: jest.fn(),
    }));
  });

  it('renders skeleton while loading', () => {
    render(
      <OptimizedImage
        src="test.jpg"
        alt="Test image"
        width="200px"
        height="200px"
      />
    );

    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('loads image when in viewport', async () => {
    render(
      <OptimizedImage
        src="test.jpg"
        alt="Test image"
        width="200px"
        height="200px"
      />
    );

    const img = screen.getByAltText('Test image');
    
    // Simulate image load
    img.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
    });
  });

  it('shows error state when image fails to load', async () => {
    render(
      <OptimizedImage
        src="invalid.jpg"
        alt="Test image"
        width="200px"
        height="200px"
      />
    );

    const img = screen.getByAltText('Test image');
    
    // Simulate image error
    img.dispatchEvent(new Event('error'));

    await waitFor(() => {
      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    });
  });
});