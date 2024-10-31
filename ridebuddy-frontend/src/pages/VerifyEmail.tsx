import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Heading, Text, Spinner, Container } from '@chakra-ui/react';
import api from '../utils/api';

export default function Component() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('');
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.get(`/api/email-verification/verify/${token}`);
        setVerificationStatus(response.data.message);
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setVerificationStatus('Verification failed. Please try again or contact support.');
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <Container maxW="container.md" py={10}>
      <Box textAlign="center">
        <Heading as="h1" size="xl" mb={6}>
          Email Verification
        </Heading>
        {isVerifying ? (
          <Spinner size="xl" />
        ) : (
          <Text fontSize="lg">{verificationStatus}</Text>
        )}
      </Box>
    </Container>
  );
}