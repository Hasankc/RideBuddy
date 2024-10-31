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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!age) newErrors.age = 'Age is required';
    if (isNaN(Number(age)) || Number(age) < 18 || Number(age) > 100) newErrors.age = 'Age must be between 18 and 100';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await register(name, email, password, parseInt(age));
      toast({
        title: 'Account created.',
        description: "We've created your account for you.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 'Unable to create your account. Please try again.';
      toast({
        title: 'Registration failed.',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Box bg="white" p={8} borderRadius="lg" boxShadow="lg">
        <Heading as="h1" size="xl" textAlign="center" mb={6}>
          Register for RideBuddy
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl id="name" isRequired isInvalid={!!errors.name}>
              <FormLabel>Name</FormLabel>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>
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
            <FormControl id="age" isRequired isInvalid={!!errors.age}>
              <FormLabel>Age</FormLabel>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} min={18} max={100} />
              <FormErrorMessage>{errors.age}</FormErrorMessage>
            </FormControl>
            <Button type="submit" colorScheme="blue" width="full" mt={4}>
              Register
            </Button>
          </VStack>
        </form>
        <Text mt={4} textAlign="center">
          Already have an account?{' '}
          <Button variant="link" onClick={() => navigate('/login')}>
            Login
          </Button>
        </Text>
      </Box>
    </Container>
  );
}