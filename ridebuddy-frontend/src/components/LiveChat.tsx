import React, { useState, useEffect } from 'react'
import { Box, VStack, Input, Button, Text, Flex } from "@chakra-ui/react"
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string;
  text: string;
  sender: string;
}

const LiveChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001'); // Replace with your actual backend URL
    setSocket(newSocket);

    newSocket.on('message', (message: Message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim() && socket) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputMessage,
        sender: 'user', // In a real app, this would be the actual user's ID
      };
      socket.emit('sendMessage', newMessage);
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInputMessage('');
    }
  };

  return (
    <Box width="100%" maxWidth="500px" margin="auto">
      <VStack spacing={4} align="stretch">
        <Box height="400px" overflowY="auto" borderWidth={1} borderRadius="md" p={4}>
          {messages.map(message => (
            <Flex key={message.id} justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}>
              <Box 
                bg={message.sender === 'user' ? 'blue.100' : 'gray.100'} 
                p={2} 
                borderRadius="md"
                maxWidth="70%"
              >
                <Text>{message.text}</Text>
              </Box>
            </Flex>
          ))}
        </Box>
        <Flex>
          <Input 
            value={inputMessage} 
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            mr={2}
          />
          <Button onClick={sendMessage}>Send</Button>
        </Flex>
      </VStack>
    </Box>
  )
}

export default LiveChat