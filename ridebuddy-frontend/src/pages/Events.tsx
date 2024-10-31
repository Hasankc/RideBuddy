import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Input,
  Textarea,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import api from '../utils/api';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  creator: string;
  participants: string[];
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch events. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/events', { title, description, date });
      toast({
        title: 'Event created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchEvents();
      setTitle('');
      setDescription('');
      setDate('');
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await api.post(`/api/events/${eventId}/join`);
      toast({
        title: 'Joined event',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchEvents();
    } catch (error) {
      console.error('Error joining event:', error);
      toast({
        title: 'Error',
        description: 'Failed to join event. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxWidth="600px" margin="auto" mt={10}>
      <VStack spacing={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">Events</Text>
        <Button onClick={onOpen} colorScheme="blue">Create New Event</Button>
        {events.map((event) => (
          <Box key={event._id} borderWidth={1} borderRadius="lg" p={4}>
            <Text fontSize="xl" fontWeight="bold">{event.title}</Text>
            <Text>{event.description}</Text>
            <Text>Date: {new Date(event.date).toLocaleDateString()}</Text>
            <Text>Participants: {event.participants.length}</Text>
            <Button mt={2} onClick={() => handleJoinEvent(event._id)}>Join Event</Button>
          </Box>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleCreateEvent}>
              <VStack spacing={4}>
                <Input
                  placeholder="Event Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Event Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCreateEvent}>
              Create Event
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}