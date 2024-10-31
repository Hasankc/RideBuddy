'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import {
  Box,
  VStack,
  Text,
  IconButton,
  useToast,
  Badge,
  HStack,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { Heart, X, Info, Shield, Flag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface Profile {
  _id: string;
  name: string;
  profile: {
    bio: string;
    age: number;
    images: Array<{
      url: string;
      isMain: boolean;
    }>;
    interests: string[];
    location: {
      coordinates: [number, number];
    };
  };
  distance?: number;
}

const Swipe: React.FC = () => {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for swipe animation
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
  const controls = useAnimation();

  // Safety timeout - prevent rapid swipes
  const [canSwipe, setCanSwipe] = useState(true);
  const safetyTimeout = 500; // ms

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const res = await api.get('/api/swipes/profiles');
      setProfiles(res.data);
      if (res.data.length > 0) {
        setCurrentProfile(res.data[0]);
      }
    } catch (error) {
      toast({
        title: 'Error loading profiles',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!canSwipe || !currentProfile) return;

    setCanSwipe(false);
    const xOffset = direction === 'right' ? 200 : -200;

    try {
      await controls.start({
        x: xOffset,
        rotate: direction === 'right' ? 30 : -30,
        opacity: 0,
        transition: { duration: 0.3 }
      });

      // Send swipe to backend
      await api.post('/api/swipes', {
        swipedUserId: currentProfile._id,
        direction
      });

      // If it's a match, show match modal
      if (direction === 'right') {
        const matchRes = await api.get(`/api/matches/check/${currentProfile._id}`);
        if (matchRes.data.isMatch) {
          toast({
            title: "It's a Match! 🎉",
            description: `You and ${currentProfile.name} liked each other!`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      }

      // Move to next profile
      const nextProfiles = profiles.slice(1);
      setProfiles(nextProfiles);
      setCurrentProfile(nextProfiles[0] || null);
      setCurrentImageIndex(0);

      // Reset card position
      await controls.start({ x: 0, rotate: 0, opacity: 1 });
    } catch (error) {
      toast({
        title: 'Error processing swipe',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      // Reset card position on error
      await controls.start({ x: 0, rotate: 0, opacity: 1 });
    } finally {
      // Re-enable swipping after timeout
      setTimeout(() => setCanSwipe(true), safetyTimeout);
    }
  };

  const reportProfile = async () => {
    if (!currentProfile) return;

    try {
      await api.post('/api/reports', {
        reportedUserId: currentProfile._id,
        reason: 'inappropriate'
      });

      toast({
        title: 'Profile Reported',
        description: 'Thank you for helping keep our community safe.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Skip to next profile
      const nextProfiles = profiles.slice(1);
      setProfiles(nextProfiles);
      setCurrentProfile(nextProfiles[0] || null);
      setCurrentImageIndex(0);
    } catch (error) {
      toast({
        title: 'Error reporting profile',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="80vh">
        <Text>Loading profiles...</Text>
      </Box>
    );
  }

  if (!currentProfile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="80vh">
        <VStack spacing={4}>
          <Text fontSize="xl">No more profiles to show</Text>
          <Button onClick={loadProfiles} colorScheme="blue">
            Refresh Profiles
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={4} maxW="600px" mx="auto">
      <motion.div
        ref={cardRef}
        style={{ x, rotate, opacity }}
        animate={controls}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={1}
        onDragEnd={(e, { offset, velocity }) => {
          if (offset.x > 100) {
            handleSwipe('right');
          } else if (offset.x < -100) {
            handleSwipe('left');
          } else {
            controls.start({ x: 0, rotate: 0 });
          }
        }}
      >
        <Box
          position="relative"
          borderRadius="xl"
          overflow="hidden"
          boxShadow="xl"
          bg="white"
          h="70vh"
        >
          <Box
            bgImage={`url(${currentProfile.profile.images[currentImageIndex]?.url})`}
            bgSize="cover"
            bgPosition="center"
            h="full"
            w="full"
            position="relative"
          >
            {/* Safety overlay for image protection */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.400"
              pointerEvents="none"
            />

            <VStack
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              p={4}
              bg="blackAlpha.600"
              color="white"
              align="start"
              spacing={2}
            >
              <HStack justify="space-between" w="full">
                <Text fontSize="2xl" fontWeight="bold">
                  {currentProfile.name}, {currentProfile.profile.age}
                </Text>
                <Badge colorScheme="green">
                  {currentProfile.distance?.toFixed(1)} km away
                </Badge>
              </HStack>

              <Text noOfLines={2}>{currentProfile.profile.bio}</Text>

              <HStack spacing={2} flexWrap="wrap">
                {currentProfile.profile.interests.map((interest, index) => (
                  <Badge key={index} colorScheme="blue">
                    {interest}
                  </Badge>
                ))}
              </HStack>
            </VStack>
          </Box>
        </Box>
      </motion.div>

      <HStack justify="center" mt={4} spacing={8}>
        <IconButton
          aria-label="Pass"
          icon={<X size={24} />}
          colorScheme="red"
          rounded="full"
          size="lg"
          onClick={() => handleSwipe('left')}
        />
        <IconButton
          aria-label="View Profile"
          icon={<Info size={24} />}
          colorScheme="blue"
          rounded="full"
          size="lg"
          onClick={onOpen}
        />
        <IconButton
          aria-label="Like"
          icon={<Heart size={24} />}
          colorScheme="green"
          rounded="full"
          size="lg"
          onClick={() => handleSwipe('right')}
        />
      </HStack>

      <HStack justify="center" mt={4}>
        <Button
          leftIcon={<Shield size={16} />}
          size="sm"
          variant="ghost"
          onClick={onOpen}
        >
          Safety Tips
        </Button>
        <Button
          leftIcon={<Flag size={16} />}
          size="sm"
          variant="ghost"
          colorScheme="red"
          onClick={reportProfile}
        >
          Report Profile
        </Button>
      </HStack>

      {/* Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Safety Tips & Profile Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="start" spacing={4}>
              <Box>
                <Text fontWeight="bold" mb={2}>Safety Tips:</Text>
                <VStack align="start" pl={4}>
                  <Text>• Meet in public places for the first time</Text>
                  <Text>• Tell a friend about your plans</Text>
                  <Text>• Trust your instincts</Text>
                  <Text>• Keep your personal information private</Text>
                  <Text>• Report suspicious behavior</Text>
                </VStack>
              </Box>

              <Box w="full">
                <Text fontWeight="bold" mb={2}>Profile Details:</Text>
                <VStack align="start" spacing={2}>
                  <Text>Name: {currentProfile.name}</Text>
                  <Text>Age: {currentProfile.profile.age}</Text>
                  <Text>Bio: {currentProfile.profile.bio}</Text>
                  <Text>Distance: {currentProfile.distance?.toFixed(1)} km away</Text>
                  <Text>Interests:</Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {currentProfile.profile.interests.map((interest, index) => (
                      <Badge key={index} colorScheme="blue">
                        {interest}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Swipe;