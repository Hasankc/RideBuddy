import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from '../contexts/AuthContext';
import Chat from '../pages/Chat';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Socket } from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const socket = {
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    close: jest.fn(),
  };
  return jest.fn(() => socket);
});

const server = setupServer(
  rest.get('/api/matches', (req, res, ctx) => {
    return res(ctx.json([
      {
        _id: '1',
        users: [
          {
            _id: 'user1',
            name: 'Test User 1',
            profile: {
              images: [{ url: 'test1.jpg', isMain: true }]
            },
            isOnline: true
          },
          {
            _id: 'user2',
            name: 'Test User 2',
            profile: {
              images: [{ url: 'test2.jpg', isMain: true }]
            },
            isOnline: false
          }
        ],
        lastMessage: {
          content: 'Hello!',
          timestamp: new Date().toISOString()
        }
      }
    ]));
  }),

  rest.get('/api/messages/:matchId', (req, res, ctx) => {
    return res(ctx.json([
      {
        _id: 'msg1',
        matchId: '1',
        senderId: 'user1',
        receiverId: 'user2',
        content: 'Hello!',
        timestamp: new Date().toISOString(),
        read: true
      }
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Chat Component', () => {
  const renderChat = () => {
    return render(
      <ChakraProvider>
        <AuthProvider>
          <Chat />
        </AuthProvider>
      </ChakraProvider>
    );
  };

  test('renders chat list and messages', async () => {
    renderChat();
    
    await waitFor(() => {
      expect(screen.getByText('Test User 2')).toBeInTheDocument();
      expect(screen.getByText('Hello!')).toBeInTheDocument();
    });
  });

  test('handles message sending', async () => {
    renderChat();
    
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: 'New message' } });
    
    const sendButton = screen.getByLabelText(/send message/i);
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  test('displays typing indicator', async () => {
    renderChat();
    
    const socket = require('socket.io-client')();
    socket.emit.mockClear();
    
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.keyPress(input, { key: 'a', code: 65, charCode: 65 });
    
    expect(socket.emit).toHaveBeenCalledWith('typing_start', expect.any(Object));
  });
});