import React from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  Button,
  useToast,
  Divider,
  HStack,
  Icon,
  Select,
} from '@chakra-ui/react';
import { Bell, Shield, Eye, MapPin, Clock, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = React.useState({
    notifications: {
      matches: true,
      messages: true,
      likes: true,
    },
    privacy: {
      showOnlineStatus: true,
      showDistance: true,
      showLastActive: true,
    },
    discovery: {
      maxDistance: 50,
      ageRange: {
        min: 18,
        max: 50,
      },
      showMe: 'all',
    },
    safety: {
      blockScreenshots: true,
      hideFromContacts: false,
      enableTwoFactor: false,
    },
  });

  const toast = useToast();

  const handleSave = async () => {
    try {
      await api.put('/api/users/settings', settings);
      toast({
        title: 'Settings saved',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error saving settings',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const MotionBox = motion(Box);

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      p={6}
      bg="white"
      borderRadius="xl"
      shadow="xl"
      maxW="600px"
      w="90%"
      mx="auto"
    >
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Settings</Heading>

        <Box>
          <HStack mb={4}>
            <Icon as={Bell} />
            <Heading size="md">Notifications</Heading>
          </HStack>
          <VStack spacing={4} pl={8}>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>New Matches</FormLabel>
              <Switch
                isChecked={settings.notifications.matches}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    matches: e.target.checked
                  }
                }))}
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>Messages</FormLabel>
              <Switch
                isChecked={settings.notifications.messages}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    messages: e.target.checked
                  }
                }))}
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>Likes</FormLabel>
              <Switch
                isChecked={settings.notifications.likes}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    likes: e.target.checked
                  }
                }))}
              />
            </FormControl>
          </VStack>
        </Box>

        <Divider />

        <Box>
          <HStack mb={4}>
            <Icon as={Eye} />
            <Heading size="md">Privacy</Heading>
          </HStack>
          <VStack spacing={4} pl={8}>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>Show Online Status</FormLabel>
              <Switch
                isChecked={settings.privacy.showOnlineStatus}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  privacy: {
                    ...prev.privacy,
                    showOnlineStatus: e.target.checked
                  }
                }))}
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>Show Distance</FormLabel>
              <Switch
                isChecked={settings.privacy.showDistance}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  privacy: {
                    ...prev.privacy,
                    showDistance: e.target.checked
                  }
                }))}
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>Show Last Active</FormLabel>
              <Switch
                isChecked={settings.privacy.showLastActive}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  privacy: {
                    ...prev.privacy,
                    showLastActive: e.target.checked
                  }
                }))}
              />
            </FormControl>
          </VStack>
        </Box>

        <Divider />

        <Box>
          <HStack mb={4}>
            <Icon as={MapPin} />
            <Heading size="md">Discovery</Heading>
          </HStack>
          <VStack spacing={6} pl={8}>
            <FormControl>
              <FormLabel>Maximum Distance (km)</FormLabel>
              <Slider
                value={settings.discovery.maxDistance}
                onChange={(value) => setSettings(prev => ({
                  ...prev,
                  discovery: {
                    ...prev.discovery,
                    maxDistance: value
                  }
                }))}
                min={1}
                max={100}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Box color="blue.500" as={MapPin} />
                </SliderThumb>
              </Slider>
              <Text textAlign="right" fontSize="sm" color="gray.500">
                {settings.discovery.maxDistance} km
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel>Age Range</FormLabel>
              <HStack spacing={4}>
                <Select
                  value={settings.discovery.ageRange.min}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    discovery: {
                      ...prev.discovery,
                      ageRange: {
                        ...prev.discovery.ageRange,
                        min: parseInt(e.target.value)
                      }
                    }
                  }))}
                >
                  {Array.from({ length: 63 }, (_, i) => i + 18).map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </Select>
                <Text>to</Text>
                <Select
                  value={settings.discovery.ageRange.max}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    discovery: {
                      ...prev.discovery,
                      ageRange: {
                        ...prev.discovery.ageRange,
                        max: parseInt(e.target.value)
                      }
                    }
                  }))}
                >
                  {Array.from({ length: 63 }, (_, i) => i + 18).map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </Select>
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel>Show Me</FormLabel>
              <Select
                value={settings.discovery.showMe}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  discovery: {
                    ...prev.discovery,
                    showMe: e.target.value
                  }
                }))}
              >
                <option value="all">Everyone</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
              </Select>
            </FormControl>
          </VStack>
        </Box>

        <Divider />

        <Box>
          <HStack mb={4}>
            <Icon as={Shield} />
            <Heading size="md">Safety</Heading>
          </HStack>
          <VStack spacing={4} pl={8}>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>Block Screenshots</FormLabel>
              <Switch
                isChecked={settings.safety.blockScreenshots}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  safety: {
                    ...prev.safety,
                    blockScreenshots: e.target.checked
                  }
                }))}
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>Hide from Contacts</FormLabel>
              <Switch
                isChecked={settings.safety.hideFromContacts}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  safety: {
                    ...prev.safety,
                    hideFromContacts: e.target.checked
                  }
                }))}
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>Two-Factor Authentication</FormLabel>
              <Switch
                isChecked={settings.safety.enableTwoFactor}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  safety: {
                    ...prev.safety,
                    enableTwoFactor: e.target.checked
                  }
                }))}
              />
            </FormControl>
          </VStack>
        </Box>

        <HStack justify="flex-end" spacing={4} pt={4}>
          <Button  variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            Save Changes
          </Button>
        </HStack>
      </VStack>
    </MotionBox>
  );
};