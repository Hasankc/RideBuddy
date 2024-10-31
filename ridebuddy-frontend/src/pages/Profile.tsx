import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Image,
  Text,
  useToast,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  IconButton,
  Grid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { StarIcon, DeleteIcon, EditIcon } from 'lucide-react';

interface ProfileImage {
  _id: string;
  url: string;
  isMain: boolean;
}

interface ProfileData {
  bio: string;
  age: number;
  gender: string;
  lookingFor: string;
  interests: string[];
  images: ProfileImage[];
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    bio: '',
    age: 18,
    gender: '',
    lookingFor: '',
    interests: [],
    images: []
  });
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const res = await api.get('/api/users/profile');
      setProfileData(res.data.profile);
    } catch (error) {
      toast({
        title: 'Error loading profile',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      setSelectedImage(file);
      onOpen();
    } catch (error) {
      toast({
        title: 'Error selecting image',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const res = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfileData(prev => ({
        ...prev,
        images: [...prev.images, res.data.image]
      }));

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Error uploading image',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setSelectedImage(null);
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      await api.delete(`/api/upload/${imageId}`);
      setProfileData(prev => ({
        ...prev,
        images: prev.images.filter(img => img._id !== imageId)
      }));

      toast({
        title: 'Success',
        description: 'Image deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting image',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const setMainImage = async (imageId: string) => {
    try {
      await api.put(`/api/upload/${imageId}/main`);
      setProfileData(prev => ({
        ...prev,
        images: prev.images.map(img => ({
          ...img,
          isMain: img._id === imageId
        }))
      }));

      toast({
        title: 'Success',
        description: 'Main image updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating main image',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put('/api/users/profile', profileData);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="container.md" mx="auto" py={8} px={4}>
      <VStack spacing={8} align="stretch">
        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
          {profileData.images.map((image) => (
            <Box key={image._id} position="relative">
              <Image
                src={image.url}
                alt="Profile"
                objectFit="cover"
                w="full"
                h="200px"
                borderRadius="md"
              />
              <HStack
                position="absolute"
                bottom={2}
                right={2}
                spacing={2}
              >
                <IconButton
                  aria-label="Set as main"
                  icon={<StarIcon />}
                  size="sm"
                  colorScheme={image.isMain ? "yellow" : "gray"}
                  onClick={() => setMainImage(image._id)}
                />
                <IconButton
                  aria-label="Delete image"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => deleteImage(image._id)}
                />
              </HStack>
            </Box>
          ))}
          {profileData.images.length < 6 && (
            <Button
              h="200px"
              onClick={() => document.getElementById('imageUpload')?.click()}
            >
              Add Image
            </Button>
          )}
        </Grid>

        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

        <form onSubmit={updateProfile}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Bio</FormLabel>
              <Textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  bio: e.target.value
                
                }))}
                maxLength={500}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Age</FormLabel>
              <Input
                type="number"
                value={profileData.age}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  age: parseInt(e.target.value)
                }))}
                min={18}
                max={120}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Gender</FormLabel>
              <Select
                value={profileData.gender}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  gender: e.target.value
                }))}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Looking For</FormLabel>
              <Select
                value={profileData.lookingFor}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  lookingFor: e.target.value
                }))}
              >
                <option value="">Select preference</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="both">Both</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isLoading}
              w="full"
            >
              Update Profile
            </Button>
          </VStack>
        </form>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedImage && (
              <Image
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                maxH="300px"
                mx="auto"
                mb={4}
              />
            )}
            <Button
              onClick={uploadImage}
              isLoading={isLoading}
              colorScheme="blue"
              w="full"
            >
              Upload
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Profile;