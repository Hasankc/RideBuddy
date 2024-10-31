import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  VStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  useToast,
  Heading,
  Container,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const Preferences: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [maxDistance, setMaxDistance] = useState(50);
  const [ageRange, setAgeRange] = useState([18, 50]);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setMaxDistance(user.preferences?.maxDistance || 50);
      setAgeRange([user.preferences?.minAge || 18, user.preferences?.maxAge || 50]);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        preferences: {
          maxDistance,
          minAge: ageRange[0],
          maxAge: ageRange[1],
        },
      });
      toast({
        title: 'Preferences updated',
        description: 'Your preferences have been successfully updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update preferences. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container  maxW="container.sm" py={10}>
      <Box bg="white" p={8} borderRadius="lg" boxShadow="lg">
        <Heading as="h1" size="xl" textAlign="center" mb={6}>
          User Preferences
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            <FormControl>
              <FormLabel>Maximum Distance (km): {maxDistance}</FormLabel>
              <Slider
                value={maxDistance}
                onChange={(val) => setMaxDistance(val)}
                min={1}
                max={100}
                step={1}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>
            <FormControl>
              <FormLabel>Age Range: {ageRange[0]} - {ageRange[1]}</FormLabel>
              <Slider
                value={ageRange}
                onChange={(val) => setAgeRange(val)}
                min={18}
                max={100}
                step={1}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb index={0} />
                <SliderThumb index={1} />
              </Slider>
            </FormControl>
            <Button type="submit" colorScheme="blue" width="full">
              Save Preferences
            </Button>
          </VStack>
        </form>
      </Box>
    </Container>
  );
};

export default Preferences;