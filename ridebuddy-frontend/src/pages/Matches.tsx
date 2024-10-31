import React, { useState, useEffect } from 'react';
import { Box, VStack, Image, Text, Button, useToast } from '@chakra-ui/react';
import api from '../utils/api';

interface User {
  _id: string;
  name: string;
  images: string[];
}

const Matches: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users/potential-matches');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching potential matches:', error);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= users.length) return;

    const targetUserId = users[currentIndex]._id;

    try {
      const response = await api.post('/api/matches/swipe', { targetUserId, direction });
      if (response.data.match) {
        toast({
          title: "It's a match!",
          description: `You matched with ${users[currentIndex].name}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      setCurrentIndex(prevIndex => prevIndex + 1);
    } catch (error) {
      console.error('Error swiping:', error);
    }
  };

  if (users.length === 0 || currentIndex >= users.length) {
    return <Box>No more potential matches at the moment.</Box>;
  }

  const currentUser = users[currentIndex];

  return (
    <Box maxWidth="400px" margin="auto" mt={8}>
      <VStack spacing={4}>
        <Image src={currentUser.images[0] || '/placeholder.svg'} alt={currentUser.name} boxSize="300px" objectFit="cover" />
        <Text fontSize="2xl" fontWeight="bold">{currentUser.name}</Text>
        <Box>
          <Button colorScheme="red" onClick={() => handleSwipe('left')} mr={4}>
            Swipe Left
          </Button>
          <Button colorScheme="green" onClick={() => handleSwipe('right')}>
            Swipe Right
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default Matches;