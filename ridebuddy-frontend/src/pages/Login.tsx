import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Heading,
  Container,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

export default function Component() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await login(email, password);
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 'Invalid email or password. Please try again.';
      toast({
        title: 'Login failed',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Box bg="white" p={8} borderRadius="lg" boxShadow="lg">
        <Heading  as="h1" size="xl" textAlign="center" mb={6}>
          Login to RideBuddy
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl id="email" isRequired isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>
            <FormControl id="password" isRequired isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>
            <Button type="submit" colorScheme="blue" width="full" mt={4}>
              Login
            </Button>
          </VStack>
        </form>
        <Text mt={4} textAlign="center">
          Don't have an account?{' '}
          <Button variant="link" onClick={() => navigate('/register')}>
            Register
          </Button>
        </Text>
      </Box>
    </Container>
  );
}