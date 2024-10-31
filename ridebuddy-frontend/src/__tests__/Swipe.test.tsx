import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import Swipe from '../pages/Swipe';
import { mockApi } from '../utils/test-utils';

describe('Swipe Component', () => {
  beforeEach(() => {
    mockApi.get.mockClear();
    mockApi.post.mockClear();
  });

  it('renders loading state initially', () => {
    render(<Swipe />);
    expect(screen.getByText(/loading profiles/i)).toBeInTheDocument();
  });

  it('displays profile card when data is loaded', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: [{
        _id: '1',
        name: 'Test User',
        profile: {
          bio: 'Test bio',
          age: 25,
          images: [{ url: 'test.jpg', isMain: true }],
          interests: ['music', 'travel']
        }
      }]
    });

    render(<Swipe />);

    await waitFor(() => {
      expect(screen.getByText('Test User, 25')).toBeInTheDocument();
      expect(screen.getByText('Test bio')).toBeInTheDocument();
    });
  });

  it('handles right swipe correctly', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { match: false } });

    render(<Swipe />);

    const card = screen.getByTestId('swipe-card');
    fireEvent.mouseDown(card);
    fireEvent.mouseMove(card, { clientX: 300 });
    fireEvent.mouseUp(card);

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/api/swipes', {
        swipedUserId: '1',
        direction: 'right'
      });
    });
  });

  it('shows match animation when there is a match', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { match: true } });

    render(<Swipe />);

    const likeButton = screen.getByLabelText(/like/i);
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(screen.getByText(/it's a match!/i)).toBeInTheDocument();
    });
  });

  it('handles empty profile state', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });

    render(<Swipe />);

    await waitFor(() => {
      expect(screen.getByText(/no more profiles/i)).toBeInTheDocument();
      expect(screen.getByText(/refresh profiles/i)).toBeInTheDocument();
    });
  });
});