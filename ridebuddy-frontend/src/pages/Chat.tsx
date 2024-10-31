import React, { useState, useEffect, useRef } from 'react';
import { Socket, io } from 'socket.io-client';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Avatar,
  useToast,
  Divider,
  Badge,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Image,
} from '@chakra-ui/react';
import { Send, Image as ImageIcon, Smile, MoreVertical, Phone, VideoCamera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';

interface Message {
  _id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Match {
  _id: string;
  users: Array<{
    _id: string;
    name: string;
    profile: {
      images: Array<{ url: string; isMain: boolean }>;
    };
    lastActive: Date;
    isOnline: boolean;
  }>;
  lastMessage?: Message;
}

const Chat: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { isOpen: isEmojiOpen, onToggle: onEmojiToggle, onClose: onEmojiClose } = useDisclosure();
  const { isOpen: isImageOpen, onOpen: onImageOpen, onClose: onImageClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });

    newSocket.on('connect_error', (error) => {
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to chat server',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    if (socket && selectedMatch) {
      socket.emit('join_chat', selectedMatch._id);

      socket.on('new_message', (message: Message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      socket.on('typing_indicator', ({ userId, isTyping }) => {
        setTypingUsers(prev => ({ ...prev, [userId]: isTyping }));
      });

      socket.on('messages_read', () => {
        setMessages(prev =>
          prev.map(msg => ({
            ...msg,
            read: true
          }))
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('new_message');
        socket.off('typing_indicator');
        socket.off('messages_read');
      }
    };
  }, [socket, selectedMatch]);

  const loadMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data);
      setIsLoading(false);
    } catch (error) {
      toast({
        title: 'Error loading matches',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const loadMessages = async (matchId: string) => {
    try {
      const res = await fetch(`/api/messages/${matchId}`);
      const data = await res.json();
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      toast({
        title: 'Error loading messages',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSendMessage = () => {
    if (!socket || !selectedMatch || !newMessage.trim()) return;

    const receiverId = selectedMatch.users.find(u => u._id !== user?._id)?._id;
    if (!receiverId) return;

    socket.emit('send_message', {
      matchId: selectedMatch._id,
      receiverId,
      content: newMessage
    });

    setNewMessage('');
    onEmojiClose();
  };

  const handleTyping = () => {
    if (!socket || !selectedMatch) return;

    socket.emit('typing_start', { matchId: selectedMatch._id });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { matchId: selectedMatch._id });
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    }
    return format(date, 'MMM d');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (!socket || !selectedMatch) return;

      const receiverId = selectedMatch.users.find(u => u._id !== user?._id)?._id;
      if (!receiverId) return;

      socket.emit('send_message', {
        matchId: selectedMatch._id,
        receiverId,
        content: `[Image](${data.url})`
      });
    } catch (error) {
      toast({
        title: 'Error uploading image',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100vh">
        <Spinner />
      </Box>
    );
  }

  return (
    <Box h="calc(100vh - 64px)" display="flex">
      {/* Matches List */}
      <Box w="300px" borderRight="1px" borderColor="gray.200" overflowY="auto">
        <VStack spacing={0} align="stretch">
          {matches.map(match => {
            const otherUser = match.users.find(u => u._id !== user?._id);
            if (!otherUser) return null;

            return (
              <Box
                key={match._id}
                p={4}
                cursor="pointer"
                bg={selectedMatch?._id === match._id ? 'gray.100' : 'white'}
                _hover={{ bg: 'gray.50' }}
                onClick={() => {
                  setSelectedMatch(match);
                  loadMessages(match._id);
                }}
              >
                <HStack spacing={3}>
                  <Box position="relative">
                    <Avatar
                      size="md"
                      src={otherUser.profile.images.find(img => img.isMain)?.url}
                    />
                    <Badge
                      position="absolute"
                      bottom="-1px"
                      right="-1px"
                      colorScheme={otherUser.isOnline ? 'green' : 'gray'}
                      rounded="full"
                      boxSize="3"
                    />
                  </Box>
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="bold">{otherUser.name}</Text>
                    <Text fontSize="sm" color="gray.500" noOfLines={1}>
                      {match.lastMessage?.content || 'No messages yet'}
                    </Text>
                  </VStack>
                  {match.lastMessage && (
                    <Text fontSize="xs" color="gray.500">
                      {formatMessageDate(new Date(match.lastMessage.timestamp))}
                    </Text>
                  )}
                </HStack>
              </Box>
            );
          })}
        </VStack>
      </Box>

      {/* Chat Area */}
      {selectedMatch ? (
        <Box flex={1} display="flex" flexDirection="column">
          {/* Chat Header */}
          <HStack
            p={4}
            borderBottom="1px"
            borderColor="gray.200"
            spacing={4}
            bg="white"
          >
            <Avatar
              size="sm"
              src={selectedMatch.users.find(u => u._id !== user?._id)?.profile.images.find(img => img.isMain)?.url}
            />
            <VStack align="start" spacing={0} flex={1}>
              <Text fontWeight="bold">
                {selectedMatch.users.find(u => u._id !== user?._id)?.name}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {typingUsers[selectedMatch.users.find(u => u._id !== user?._id)?._id || '']
                  ? 'Typing...'
                  : 'Online'}
              </Text>
            </VStack>
            <HStack>
              <IconButton
                aria-label="Voice call"
                icon={<Phone size={20} />}
                variant="ghost"
              />
              <IconButton
                aria-label="Video call"
                icon={<VideoCamera size={20} />}
                variant="ghost"
              />
              <IconButton
                aria-label="More options"
                icon={<MoreVertical size={20} />}
                variant="ghost"
              />
            </HStack>
          </HStack>

          {/* Messages */}
          <Box flex={1} overflowY="auto" p={4} bg="gray.50">
            <VStack spacing={4} align="stretch">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity:  0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HStack
                      justify={message.senderId === user?._id ? 'flex-end' : 'flex-start'}
                      align="flex-end"
                      spacing={2}
                    >
                      {message.senderId !== user?._id && (
                        <Avatar
                          size="sm"
                          src={selectedMatch.users.find(u => u._id === message.senderId)?.profile.images.find(img => img.isMain)?.url}
                        />
                      )}
                      <Box
                        maxW="70%"
                        bg={message.senderId === user?._id ? 'blue.500' : 'white'}
                        color={message.senderId === user?._id ? 'white' : 'black'}
                        p={3}
                        borderRadius="lg"
                        boxShadow="sm"
                      >
                        {message.content.startsWith('[Image]') ? (
                          <Image
                            src={message.content.match(/$$(.*?)$$/)?.[1]}
                            alt="Shared image"
                            borderRadius="md"
                            cursor="pointer"
                            onClick={() => {
                              setSelectedImage(message.content.match(/$$(.*?)$$/)?.[1] || '');
                              onImageOpen();
                            }}
                          />
                        ) : (
                          <Text>{message.content}</Text>
                        )}
                      </Box>
                      {message.senderId === user?._id && (
                        <Text fontSize="xs" color="gray.500">
                          {message.read ? '✓✓' : '✓'}
                        </Text>
                      )}
                    </HStack>
                    {(index === messages.length - 1 ||
                      format(new Date(messages[index + 1]?.timestamp), 'yyyy-MM-dd') !==
                        format(new Date(message.timestamp), 'yyyy-MM-dd')) && (
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        textAlign="center"
                        my={4}
                      >
                        {formatMessageDate(new Date(message.timestamp))}
                      </Text>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </VStack>
          </Box>

          {/* Input Area */}
          <HStack p={4} bg="white" spacing={2}>
            <IconButton
              aria-label="Add image"
              icon={<ImageIcon size={20} />}
              variant="ghost"
              onClick={() => document.getElementById('imageInput')?.click()}
            />
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <IconButton
              aria-label="Add emoji"
              icon={<Smile size={20} />}
              variant="ghost"
              onClick={onEmojiToggle}
            />
            <Input
              flex={1}
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSendMessage();
                handleTyping();
              }}
            />
            <IconButton
              aria-label="Send message"
              icon={<Send size={20} />}
              colorScheme="blue"
              onClick={handleSendMessage}
            />
          </HStack>
        </Box>
      ) : (
        <Box
          flex={1}
          display="flex"
          justifyContent="center"
          alignItems="center"
          bg="gray.50"
        >
          <Text color="gray.500">Select a match to start chatting</Text>
        </Box>
      )}

      {/* Emoji Picker */}
      <Modal isOpen={isEmojiOpen} onClose={onEmojiClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <EmojiPicker
            onEmojiClick={(emoji) => {
              setNewMessage(prev => prev + emoji.emoji);
              onEmojiClose();
            }}
          />
        </ModalContent>
      </Modal>

      {/* Image Preview */}
      <Modal isOpen={isImageOpen} onClose={onImageClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Image Preview</ModalHeader>
          <ModalBody>
            <Image src={selectedImage} alt="Preview" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Chat;